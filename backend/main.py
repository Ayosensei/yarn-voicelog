"""
main.py - The "front door" of our FastAPI backend

This is where everything starts. When you run:
    python -m uvicorn main:app --reload
Uvicorn reads THIS file and starts listening for web requests.
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.concurrency import run_in_threadpool
import uuid
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional

from models import (
    UserCreate, UserUpdate, UserResponse,
    LogCreate, LogResponse,
    VocabCreate, VocabResponse,
    VoiceProcessRequest, VoiceProcessResponse,
)
from services.prompt_builder import build_prompt
from services.gemini_service import call_gemini
from services.whisper_service import transcribe_audio
from services.encryption import encrypt_api_key, decrypt_api_key
from services.supabase_service import (
    get_supabase_client,
    is_valid_uuid,
    db_create_user,
    db_get_user,
    db_update_user,
    db_create_log,
    db_get_user_logs,
    db_get_single_log,
    db_delete_log,
    db_restore_log,
    db_delete_storage_file,
    db_create_vocab,
    db_get_user_vocab,
    db_delete_vocab,
)
from config import settings

logger = logging.getLogger("yarn.main")

# ============================================================
#  CREATE THE APP
# ============================================================

app = FastAPI(
    title="Yarn VoiceLog API",
    description="Voice-to-logbook backend for SIWES students",
    version="0.1.0",
)


# ============================================================
#  CORS - Allow the frontend to talk to us
# ============================================================

allowed_origins = [
    "http://localhost:3000",       # Next.js dev server
    "http://127.0.0.1:3000",       # Alternative localhost
]

if settings.frontend_url:
    allowed_origins.append(settings.frontend_url.rstrip("/"))

if settings.cors_origins:
    for origin in settings.cors_origins.split(","):
        cleaned = origin.strip().rstrip("/")
        if cleaned and cleaned not in allowed_origins:
            allowed_origins.append(cleaned)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https:\/\/.*\.vercel\.app",  # Support all Vercel production & preview domains
    allow_credentials=True,
    allow_methods=["*"],               # Allow GET, POST, PATCH, DELETE
    allow_headers=["*"],               # Allow all headers
)


# ============================================================
#  HEALTH CHECK ENDPOINTS
# ============================================================

@app.get("/")
def root():
    supabase_connected = get_supabase_client() is not None
    return {
        "app": "Yarn VoiceLog API",
        "status": "running",
        "supabase_connected": supabase_connected,
        "message": "Welcome to Yarn! Visit /docs for interactive API documentation.",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


# ============================================================
#  IN-MEMORY STORAGE (Fallback & Testing)
# ============================================================

fake_users_db: dict[str, dict] = {}
fake_logs_db: dict[str, dict] = {}
fake_vocab_db: dict[str, dict] = {}


# ============================================================
#  USER ENDPOINTS (Create, Read, Update with BYOK Encryption)
# ============================================================

@app.post("/api/users", response_model=UserResponse)
def create_user(user: UserCreate):
    """Create a new student profile in Supabase. Returns a UUID."""
    client = get_supabase_client()
    if client:
        try:
            created = db_create_user(
                name=user.name,
                field_of_work=user.field_of_work,
                faculty=user.faculty,
                department=user.department,
                institution=user.institution,
                training_type=user.training_type or "siwes",
                log_length_lines=user.log_length_lines or "2-3",
                grammar_level=user.grammar_level or "balanced",
                use_nigerian_lingo=user.use_nigerian_lingo,
                is_onboarded=user.is_onboarded,
            )
            uid = str(created["id"])
            # Mirror to in-memory store
            fake_users_db[uid] = created
            return {
                "id": uid,
                "name": created["name"],
                "field_of_work": created.get("field_of_work"),
                "faculty": created.get("faculty"),
                "department": created.get("department"),
                "institution": created.get("institution"),
                "training_type": created.get("training_type") or "siwes",
                "log_length_lines": created.get("log_length_lines") or "2-3",
                "grammar_level": created.get("grammar_level") or "balanced",
                "use_nigerian_lingo": created.get("use_nigerian_lingo", True),
                "is_onboarded": created.get("is_onboarded", False),
                "custom_prompt": created.get("custom_prompt"),
                "has_own_key": bool(created.get("api_key_encrypted")),
                "created_at": created.get("created_at"),
            }
        except Exception as e:
            logger.error(f"Error creating user in Supabase: {e}")

    # Fallback in-memory
    user_id = str(uuid.uuid4())
    new_user = {
        "id": user_id,
        "name": user.name,
        "field_of_work": user.field_of_work,
        "faculty": user.faculty,
        "department": user.department,
        "institution": user.institution,
        "training_type": user.training_type or "siwes",
        "log_length_lines": user.log_length_lines or "2-3",
        "grammar_level": user.grammar_level or "balanced",
        "use_nigerian_lingo": user.use_nigerian_lingo,
        "is_onboarded": user.is_onboarded,
        "custom_prompt": None,
        "api_key_encrypted": None,
        "created_at": None,
    }
    fake_users_db[user_id] = new_user
    return {
        "id": new_user["id"],
        "name": new_user["name"],
        "field_of_work": new_user["field_of_work"],
        "faculty": new_user["faculty"],
        "department": new_user["department"],
        "institution": new_user["institution"],
        "training_type": new_user["training_type"],
        "log_length_lines": new_user["log_length_lines"],
        "grammar_level": new_user["grammar_level"],
        "use_nigerian_lingo": new_user["use_nigerian_lingo"],
        "is_onboarded": new_user["is_onboarded"],
        "custom_prompt": new_user["custom_prompt"],
        "has_own_key": False,
        "created_at": new_user["created_at"],
    }


@app.get("/api/users/{user_uuid}", response_model=UserResponse)
def get_user(user_uuid: str):
    """Get a student's profile by their UUID."""
    client = get_supabase_client()
    if client and is_valid_uuid(user_uuid):
        try:
            user = db_get_user(user_uuid)
            if user:
                fake_users_db[user_uuid] = user
                return {
                    "id": str(user["id"]),
                    "name": user["name"],
                    "field_of_work": user.get("field_of_work"),
                    "faculty": user.get("faculty"),
                    "department": user.get("department"),
                    "institution": user.get("institution"),
                    "training_type": user.get("training_type") or "siwes",
                    "log_length_lines": user.get("log_length_lines") or "2-3",
                    "grammar_level": user.get("grammar_level") or "balanced",
                    "use_nigerian_lingo": user.get("use_nigerian_lingo", True),
                    "is_onboarded": user.get("is_onboarded", False),
                    "custom_prompt": user.get("custom_prompt"),
                    "has_own_key": bool(user.get("api_key_encrypted")),
                    "created_at": user.get("created_at"),
                }
        except Exception as e:
            logger.error(f"Error fetching user from Supabase: {e}")

    # Fallback to in-memory
    if user_uuid not in fake_users_db:
        raise HTTPException(status_code=404, detail="User not found")
    user = fake_users_db[user_uuid]
    return {
        "id": user["id"],
        "name": user["name"],
        "field_of_work": user.get("field_of_work"),
        "faculty": user.get("faculty"),
        "department": user.get("department"),
        "institution": user.get("institution"),
        "training_type": user.get("training_type") or "siwes",
        "log_length_lines": user.get("log_length_lines") or "2-3",
        "grammar_level": user.get("grammar_level") or "balanced",
        "use_nigerian_lingo": user.get("use_nigerian_lingo", True),
        "is_onboarded": user.get("is_onboarded", False),
        "custom_prompt": user.get("custom_prompt"),
        "has_own_key": bool(user.get("api_key_encrypted")),
        "created_at": user.get("created_at"),
    }


@app.patch("/api/users/{user_uuid}", response_model=UserResponse)
def update_user(user_uuid: str, updates: UserUpdate):
    """
    Update a student's profile, custom prompt, training program, or personal Gemini API key.
    If an API key is provided, it is securely encrypted with Fernet.
    """
    client = get_supabase_client()
    if client and is_valid_uuid(user_uuid):
        try:
            db_updates = {}
            if updates.name is not None:
                db_updates["name"] = updates.name
            if updates.field_of_work is not None:
                db_updates["field_of_work"] = updates.field_of_work
            if updates.faculty is not None:
                db_updates["faculty"] = updates.faculty
            if updates.department is not None:
                db_updates["department"] = updates.department
            if updates.institution is not None:
                db_updates["institution"] = updates.institution
            if updates.training_type is not None:
                db_updates["training_type"] = updates.training_type
            if updates.log_length_lines is not None:
                db_updates["log_length_lines"] = updates.log_length_lines
            if updates.grammar_level is not None:
                db_updates["grammar_level"] = updates.grammar_level
            if updates.use_nigerian_lingo is not None:
                db_updates["use_nigerian_lingo"] = updates.use_nigerian_lingo
            if updates.is_onboarded is not None:
                db_updates["is_onboarded"] = updates.is_onboarded
            if updates.custom_prompt is not None:
                db_updates["custom_prompt"] = updates.custom_prompt
            if updates.api_key is not None:
                raw_key = updates.api_key.strip()
                db_updates["api_key_encrypted"] = encrypt_api_key(raw_key) if raw_key else None

            updated = db_update_user(user_uuid, db_updates)
            if updated:
                fake_users_db[user_uuid] = updated
                return {
                    "id": str(updated["id"]),
                    "name": updated["name"],
                    "field_of_work": updated.get("field_of_work"),
                    "faculty": updated.get("faculty"),
                    "department": updated.get("department"),
                    "institution": updated.get("institution"),
                    "training_type": updated.get("training_type") or "siwes",
                    "log_length_lines": updated.get("log_length_lines") or "2-3",
                    "grammar_level": updated.get("grammar_level") or "balanced",
                    "use_nigerian_lingo": updated.get("use_nigerian_lingo", True),
                    "is_onboarded": updated.get("is_onboarded", False),
                    "custom_prompt": updated.get("custom_prompt"),
                    "has_own_key": bool(updated.get("api_key_encrypted")),
                    "created_at": updated.get("created_at"),
                }
        except Exception as e:
            logger.error(f"Error updating user in Supabase: {e}")

    # Fallback in-memory
    if user_uuid not in fake_users_db:
        raise HTTPException(status_code=404, detail="User not found")

    user = fake_users_db[user_uuid]
    if updates.name is not None:
        user["name"] = updates.name
    if updates.custom_prompt is not None:
        user["custom_prompt"] = updates.custom_prompt
    if updates.field_of_work is not None:
        user["field_of_work"] = updates.field_of_work
    if updates.faculty is not None:
        user["faculty"] = updates.faculty
    if updates.department is not None:
        user["department"] = updates.department
    if updates.institution is not None:
        user["institution"] = updates.institution
    if updates.training_type is not None:
        user["training_type"] = updates.training_type
    if updates.log_length_lines is not None:
        user["log_length_lines"] = updates.log_length_lines
    if updates.grammar_level is not None:
        user["grammar_level"] = updates.grammar_level
    if updates.use_nigerian_lingo is not None:
        user["use_nigerian_lingo"] = updates.use_nigerian_lingo
    if updates.is_onboarded is not None:
        user["is_onboarded"] = updates.is_onboarded

    if updates.api_key is not None:
        raw_key = updates.api_key.strip()
        if raw_key:
            user["api_key_encrypted"] = encrypt_api_key(raw_key)
        else:
            user["api_key_encrypted"] = None

    return {
        "id": user["id"],
        "name": user["name"],
        "field_of_work": user.get("field_of_work"),
        "faculty": user.get("faculty"),
        "department": user.get("department"),
        "institution": user.get("institution"),
        "training_type": user.get("training_type") or "siwes",
        "log_length_lines": user.get("log_length_lines") or "2-3",
        "grammar_level": user.get("grammar_level") or "balanced",
        "use_nigerian_lingo": user.get("use_nigerian_lingo", True),
        "is_onboarded": user.get("is_onboarded", False),
        "custom_prompt": user.get("custom_prompt"),
        "has_own_key": bool(user.get("api_key_encrypted")),
        "created_at": user.get("created_at"),
    }



# ============================================================
#  AUTH ENDPOINTS (Google OAuth via Supabase)
# ============================================================

@app.post("/api/users/auth", response_model=UserResponse)
def auth_upsert_user(request_data: dict):
    """
    Called by the frontend after Google OAuth completes.
    Creates a new Yarn user record if this is their first login,
    or returns the existing record if they've signed in before.
    Uses auth_user_id (Supabase Auth UUID) as the unique key.
    """
    auth_user_id = request_data.get("auth_user_id")
    email = request_data.get("email", "")
    name = request_data.get("name") or (email.split("@")[0] if email else "Student")
    avatar_url = request_data.get("avatar_url")
    guest_uuid = request_data.get("guest_uuid")

    if not auth_user_id:
        raise HTTPException(status_code=400, detail="Missing auth_user_id")

    client = get_supabase_client()
    if not client:
        # In-memory handling for development & testing
        for uid, u in fake_users_db.items():
            if u.get("auth_user_id") == auth_user_id:
                if guest_uuid and guest_uuid in fake_users_db and guest_uuid != uid:
                    for l in fake_logs_db.values():
                        if l.get("user_id") == guest_uuid:
                            l["user_id"] = uid
                    for v in fake_vocab_db.values():
                        if v.get("user_id") == guest_uuid:
                            v["user_id"] = uid
                    del fake_users_db[guest_uuid]
                return {
                    "id": uid,
                    "name": u["name"],
                    "field_of_work": u.get("field_of_work"),
                    "faculty": u.get("faculty"),
                    "department": u.get("department"),
                    "institution": u.get("institution"),
                    "training_type": u.get("training_type") or "siwes",
                    "log_length_lines": u.get("log_length_lines") or "2-3",
                    "grammar_level": u.get("grammar_level") or "balanced",
                    "use_nigerian_lingo": u.get("use_nigerian_lingo", True),
                    "is_onboarded": u.get("is_onboarded", False),
                    "custom_prompt": u.get("custom_prompt"),
                    "has_own_key": bool(u.get("api_key_encrypted")),
                    "created_at": u.get("created_at"),
                }

        # Check if converting guest to auth user
        if guest_uuid and guest_uuid in fake_users_db:
            fake_users_db[guest_uuid].update({
                "auth_user_id": auth_user_id,
                "email": email,
                "avatar_url": avatar_url,
            })
            u = fake_users_db[guest_uuid]
            return {
                "id": guest_uuid,
                "name": u["name"],
                "field_of_work": u.get("field_of_work"),
                "faculty": u.get("faculty"),
                "department": u.get("department"),
                "institution": u.get("institution"),
                "training_type": u.get("training_type") or "siwes",
                "log_length_lines": u.get("log_length_lines") or "2-3",
                "grammar_level": u.get("grammar_level") or "balanced",
                "use_nigerian_lingo": u.get("use_nigerian_lingo", True),
                "is_onboarded": u.get("is_onboarded", False),
                "custom_prompt": u.get("custom_prompt"),
                "has_own_key": bool(u.get("api_key_encrypted")),
                "created_at": u.get("created_at"),
            }

        new_id = str(uuid.uuid4())
        fake_users_db[new_id] = {
            "id": new_id,
            "auth_user_id": auth_user_id,
            "email": email,
            "name": name,
            "avatar_url": avatar_url,
            "field_of_work": None,
            "faculty": None,
            "department": None,
            "institution": None,
            "training_type": "siwes",
            "log_length_lines": "2-3",
            "grammar_level": "balanced",
            "use_nigerian_lingo": True,
            "is_onboarded": False,
            "created_at": None,
        }
        return {
            "id": new_id,
            "name": name,
            "field_of_work": None,
            "faculty": None,
            "department": None,
            "institution": None,
            "training_type": "siwes",
            "log_length_lines": "2-3",
            "grammar_level": "balanced",
            "use_nigerian_lingo": True,
            "is_onboarded": False,
            "custom_prompt": None,
            "has_own_key": False,
            "created_at": None,
        }

    try:
        # Try to find existing user by auth_user_id
        res = client.table("users").select("*").eq("auth_user_id", auth_user_id).execute()
        if res.data and len(res.data) > 0:
            user = res.data[0]
            user_id = str(user["id"])
            # Merge guest data into existing account if guest_uuid provided
            if guest_uuid and is_valid_uuid(guest_uuid) and guest_uuid != user_id:
                client.table("logs").update({"user_id": user_id}).eq("user_id", guest_uuid).execute()
                client.table("vocabulary").update({"user_id": user_id}).eq("user_id", guest_uuid).execute()
                client.table("users").delete().eq("id", guest_uuid).execute()
            return {
                "id": user_id,
                "name": user["name"],
                "field_of_work": user.get("field_of_work"),
                "faculty": user.get("faculty"),
                "department": user.get("department"),
                "institution": user.get("institution"),
                "training_type": user.get("training_type") or "siwes",
                "log_length_lines": user.get("log_length_lines") or "2-3",
                "grammar_level": user.get("grammar_level") or "balanced",
                "use_nigerian_lingo": user.get("use_nigerian_lingo", True),
                "is_onboarded": user.get("is_onboarded", False),
                "custom_prompt": user.get("custom_prompt"),
                "has_own_key": bool(user.get("api_key_encrypted")),
                "created_at": user.get("created_at"),
            }

        # If user has a guest record that has not yet been linked to Google auth:
        if guest_uuid and is_valid_uuid(guest_uuid):
            guest_res = client.table("users").select("*").eq("id", guest_uuid).execute()
            if guest_res.data and len(guest_res.data) > 0 and not guest_res.data[0].get("auth_user_id"):
                guest_user = guest_res.data[0]
                updated = client.table("users").update({
                    "auth_user_id": auth_user_id,
                    "email": email or guest_user.get("email"),
                    "name": name or guest_user.get("name"),
                    "avatar_url": avatar_url or guest_user.get("avatar_url"),
                }).eq("id", guest_uuid).execute()
                if updated.data and len(updated.data) > 0:
                    user = updated.data[0]
                    return {
                        "id": str(user["id"]),
                        "name": user["name"],
                        "field_of_work": user.get("field_of_work"),
                        "faculty": user.get("faculty"),
                        "department": user.get("department"),
                        "institution": user.get("institution"),
                        "training_type": user.get("training_type") or "siwes",
                        "log_length_lines": user.get("log_length_lines") or "2-3",
                        "grammar_level": user.get("grammar_level") or "balanced",
                        "use_nigerian_lingo": user.get("use_nigerian_lingo", True),
                        "is_onboarded": user.get("is_onboarded", False),
                        "custom_prompt": user.get("custom_prompt"),
                        "has_own_key": bool(user.get("api_key_encrypted")),
                        "created_at": user.get("created_at"),
                    }

        # First login — create new record
        new_user = client.table("users").insert({
            "auth_user_id": auth_user_id,
            "email": email,
            "name": name,
            "avatar_url": avatar_url,
            "training_type": "siwes",
            "log_length_lines": "2-3",
            "grammar_level": "balanced",
            "use_nigerian_lingo": True,
            "is_onboarded": False,
        }).execute()

        user = new_user.data[0]
        return {
            "id": str(user["id"]),
            "name": user["name"],
            "field_of_work": user.get("field_of_work"),
            "faculty": user.get("faculty"),
            "department": user.get("department"),
            "institution": user.get("institution"),
            "training_type": user.get("training_type") or "siwes",
            "log_length_lines": user.get("log_length_lines") or "2-3",
            "grammar_level": user.get("grammar_level") or "balanced",
            "use_nigerian_lingo": user.get("use_nigerian_lingo", True),
            "is_onboarded": user.get("is_onboarded", False),
            "custom_prompt": user.get("custom_prompt"),
            "has_own_key": False,
            "created_at": user.get("created_at"),
        }
    except Exception as e:
        logger.error(f"Error in auth upsert: {e}")
        raise HTTPException(status_code=500, detail=f"Auth upsert failed: {str(e)}")


@app.get("/api/users/by-auth/{auth_user_id}", response_model=UserResponse)
def get_user_by_auth_id(auth_user_id: str):
    """
    Look up a Yarn user by their Supabase Auth user ID.
    Used by the landing page to redirect already-signed-in users to their dashboard.
    """
    client = get_supabase_client()
    if not client:
        raise HTTPException(status_code=503, detail="Database unavailable")

    try:
        result = client.table("users").select("*").eq("auth_user_id", auth_user_id).execute()
        if not result.data or len(result.data) == 0:
            raise HTTPException(status_code=404, detail="User not found")
        user = result.data[0]
        return {
            "id": str(user["id"]),
            "name": user["name"],
            "field_of_work": user.get("field_of_work"),
            "faculty": user.get("faculty"),
            "department": user.get("department"),
            "institution": user.get("institution"),
            "training_type": user.get("training_type") or "siwes",
            "log_length_lines": user.get("log_length_lines") or "2-3",
            "grammar_level": user.get("grammar_level") or "balanced",
            "use_nigerian_lingo": user.get("use_nigerian_lingo", True),
            "is_onboarded": user.get("is_onboarded", False),
            "custom_prompt": user.get("custom_prompt"),
            "has_own_key": bool(user.get("api_key_encrypted")),
            "created_at": user.get("created_at"),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching user by auth_id: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
#  LOG ENDPOINTS (Create, Read, Delete)
# ============================================================

@app.post("/api/logs", response_model=LogResponse)
def create_log(log: LogCreate):
    """Save a new logbook entry. Deletes audio from storage after processing to preserve free tier limits."""
    # Audio cleanup in accordance with storage lifecycle policy
    if log.audio_file_url:
        db_delete_storage_file(log.audio_file_url)

    client = get_supabase_client()
    if client and is_valid_uuid(log.user_id):
        try:
            created = db_create_log(
                user_id=log.user_id,
                log_date=log.date,
                processed_output=log.processed_output,
                raw_transcript=log.raw_transcript,
                is_confidential=log.is_confidential,
                audio_file_url=None,  # Not retained in storage
                training_type=log.training_type,
                log_length_lines=log.log_length_lines,
                grammar_level=log.grammar_level,
            )
            lid = str(created["id"])
            fake_logs_db[lid] = created
            return {
                "id": lid,
                "user_id": str(created["user_id"]),
                "date": str(created["date"]),
                "raw_transcript": created.get("raw_transcript"),
                "processed_output": created["processed_output"],
                "training_type": created.get("training_type"),
                "log_length_lines": created.get("log_length_lines"),
                "grammar_level": created.get("grammar_level"),
                "is_confidential": created.get("is_confidential", False),
                "audio_file_url": None,
                "deleted_at": created.get("deleted_at"),
                "created_at": created.get("created_at"),
            }
        except Exception as e:
            logger.error(f"Error saving log to Supabase: {e}")

    # Fallback in-memory
    log_id = str(uuid.uuid4())
    new_log = {
        "id": log_id,
        "user_id": log.user_id,
        "date": log.date,
        "raw_transcript": None if log.is_confidential else log.raw_transcript,
        "processed_output": log.processed_output,
        "training_type": log.training_type,
        "log_length_lines": log.log_length_lines,
        "grammar_level": log.grammar_level,
        "is_confidential": log.is_confidential,
        "audio_file_url": None,
        "deleted_at": None,
        "created_at": None,
    }
    fake_logs_db[log_id] = new_log
    return new_log


@app.get("/api/logs/{user_uuid}")
def get_user_logs(
    user_uuid: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    include_deleted: bool = False,
    only_deleted: bool = False,
):
    """Get logs for a student. Excludes trashed logs by default and purges expired (>7 days) trash."""
    client = get_supabase_client()
    if client and is_valid_uuid(user_uuid):
        try:
            logs = db_get_user_logs(
                user_uuid,
                start_date=start_date,
                end_date=end_date,
                include_deleted=include_deleted,
                only_deleted=only_deleted,
            )
            return [
                {
                    "id": str(l["id"]),
                    "user_id": str(l["user_id"]),
                    "date": str(l["date"]),
                    "raw_transcript": l.get("raw_transcript"),
                    "processed_output": l["processed_output"],
                    "training_type": l.get("training_type"),
                    "log_length_lines": l.get("log_length_lines"),
                    "is_confidential": l.get("is_confidential", False),
                    "audio_file_url": l.get("audio_file_url"),
                    "deleted_at": l.get("deleted_at"),
                    "created_at": l.get("created_at"),
                }
                for l in logs
            ]
        except Exception as e:
            logger.error(f"Error retrieving logs from Supabase: {e}")

    # Fallback in-memory: purge >7 day trash
    now_utc = datetime.now(timezone.utc)
    for k in list(fake_logs_db.keys()):
        d_at = fake_logs_db[k].get("deleted_at")
        if d_at:
            try:
                dt = datetime.fromisoformat(d_at) if isinstance(d_at, str) else d_at
                if (now_utc - dt) > timedelta(days=7):
                    del fake_logs_db[k]
            except Exception:
                pass

    user_logs = [
        log for log in fake_logs_db.values()
        if log.get("user_id") == user_uuid
    ]
    if only_deleted:
        user_logs = [l for l in user_logs if l.get("deleted_at")]
    elif not include_deleted:
        user_logs = [l for l in user_logs if not l.get("deleted_at")]

    if start_date:
        user_logs = [l for l in user_logs if l["date"] >= start_date]
    if end_date:
        user_logs = [l for l in user_logs if l["date"] <= end_date]
    return user_logs


@app.get("/api/logs/single/{log_id}", response_model=LogResponse)
def get_single_log(log_id: str, include_deleted: bool = False):
    """Get a single log entry by its ID."""
    client = get_supabase_client()
    if client and is_valid_uuid(log_id):
        try:
            log = db_get_single_log(log_id, include_deleted=include_deleted)
            if log:
                return {
                    "id": str(log["id"]),
                    "user_id": str(log["user_id"]),
                    "date": str(log["date"]),
                    "raw_transcript": log.get("raw_transcript"),
                    "processed_output": log["processed_output"],
                    "training_type": log.get("training_type"),
                    "log_length_lines": log.get("log_length_lines"),
                    "is_confidential": log.get("is_confidential", False),
                    "audio_file_url": log.get("audio_file_url"),
                    "deleted_at": log.get("deleted_at"),
                    "created_at": log.get("created_at"),
                }
        except Exception as e:
            logger.error(f"Error fetching log from Supabase: {e}")

    # Fallback in-memory
    if log_id not in fake_logs_db:
        raise HTTPException(status_code=404, detail="Log not found")

    log = fake_logs_db[log_id]
    if not include_deleted and log.get("deleted_at"):
        raise HTTPException(status_code=404, detail="Log not found (in trash)")
    return log



@app.delete("/api/logs/{log_id}")
def delete_log(log_id: str, hard_delete: bool = False):
    """Soft delete a log entry (moved to trash for 7 days), or hard delete permanently."""
    client = get_supabase_client()
    deleted = False
    if client and is_valid_uuid(log_id):
        try:
            deleted = db_delete_log(log_id, hard_delete=hard_delete)
        except Exception as e:
            logger.error(f"Error deleting log from Supabase: {e}")

    if log_id in fake_logs_db:
        if hard_delete:
            del fake_logs_db[log_id]
        else:
            fake_logs_db[log_id]["deleted_at"] = datetime.now(timezone.utc).isoformat()
        deleted = True

    if not deleted:
        raise HTTPException(status_code=404, detail="Log not found")
    msg = "Log permanently deleted" if hard_delete else "Log moved to trash"
    return {"success": True, "message": msg}


@app.post("/api/logs/{log_id}/restore")
def restore_log(log_id: str):
    """Restore a log entry from the trash."""
    client = get_supabase_client()
    restored = False
    if client and is_valid_uuid(log_id):
        try:
            restored = db_restore_log(log_id)
        except Exception as e:
            logger.error(f"Error restoring log from Supabase: {e}")

    if log_id in fake_logs_db:
        if fake_logs_db[log_id].get("deleted_at"):
            fake_logs_db[log_id]["deleted_at"] = None
            restored = True

    if not restored:
        raise HTTPException(status_code=404, detail="Log not found or not in trash")
    return {"success": True, "message": "Log restored from trash"}


# ============================================================
#  VOCABULARY ENDPOINTS (Create, Read, Delete)
# ============================================================

@app.post("/api/vocabulary", response_model=VocabResponse)
def add_vocab(vocab: VocabCreate):
    """Add a custom technical term for better AI accuracy."""
    client = get_supabase_client()
    if client and is_valid_uuid(vocab.user_id):
        try:
            created = db_create_vocab(user_id=vocab.user_id, term=vocab.term, context=vocab.context)
            vid = str(created["id"])
            fake_vocab_db[vid] = created
            return {
                "id": vid,
                "user_id": str(created["user_id"]),
                "term": created["term"],
                "context": created.get("context"),
                "created_at": created.get("created_at"),
            }
        except Exception as e:
            logger.error(f"Error creating vocab in Supabase: {e}")

    # Fallback in-memory
    vocab_id = str(uuid.uuid4())
    new_vocab = {
        "id": vocab_id,
        "user_id": vocab.user_id,
        "term": vocab.term,
        "context": vocab.context,
        "created_at": None,
    }
    fake_vocab_db[vocab_id] = new_vocab
    return new_vocab


@app.get("/api/vocabulary/{user_uuid}")
def get_user_vocab(user_uuid: str):
    """Get all vocabulary terms for a student."""
    client = get_supabase_client()
    if client and is_valid_uuid(user_uuid):
        try:
            terms = db_get_user_vocab(user_uuid)
            return [
                {
                    "id": str(v["id"]),
                    "user_id": str(v["user_id"]),
                    "term": v["term"],
                    "context": v.get("context"),
                    "created_at": v.get("created_at"),
                }
                for v in terms
            ]
        except Exception as e:
            logger.error(f"Error fetching vocab from Supabase: {e}")

    # Fallback in-memory
    return [
        v for v in fake_vocab_db.values()
        if v.get("user_id") == user_uuid
    ]


@app.delete("/api/vocabulary/{vocab_id}")
def delete_vocab(vocab_id: str):
    """Remove a vocabulary term."""
    client = get_supabase_client()
    deleted = False
    if client and is_valid_uuid(vocab_id):
        try:
            deleted = db_delete_vocab(vocab_id)
        except Exception as e:
            logger.error(f"Error deleting vocab from Supabase: {e}")

    if vocab_id in fake_vocab_db:
        del fake_vocab_db[vocab_id]
        deleted = True

    if not deleted:
        raise HTTPException(status_code=404, detail="Term not found")
    return {"success": True, "message": "Term deleted"}


# ============================================================
#  VOICE PROCESSING ENDPOINT (AI Engine with BYOK & Audio Upload)
# ============================================================

@app.post("/api/process-voice", response_model=VoiceProcessResponse)
async def process_voice(request: Request):
    """
    Main AI endpoint for transforming spoken notes into SIWES log entries.
    Supports:
      - JSON body: { user_uuid, transcript, use_own_key }
      - FormData: user_uuid, audio_file (UploadFile), use_own_key
      - BYOK (student personal key) with secure Fernet decryption
    """
    content_type = request.headers.get("content-type", "")

    user_uuid = None
    raw_transcript = None
    use_own_key = False
    req_training_type = None
    req_log_length_lines = None
    req_grammar_level = None
    req_use_nigerian_lingo = None

    if "multipart/form-data" in content_type:
        form = await request.form()
        user_uuid = form.get("user_uuid")
        use_own_key = str(form.get("use_own_key", "false")).lower() in ("true", "1")
        req_training_type = form.get("training_type")
        req_log_length_lines = form.get("log_length_lines")
        req_grammar_level = form.get("grammar_level")
        req_use_nigerian_lingo = form.get("use_nigerian_lingo")
        audio_file = form.get("audio_file")
        if audio_file and hasattr(audio_file, "read"):
            file_bytes = await audio_file.read()
            filename = getattr(audio_file, "filename", "audio.wav")
            raw_transcript = await run_in_threadpool(transcribe_audio, file_bytes, filename=filename)
        else:
            raise HTTPException(status_code=400, detail="No audio file uploaded in form data")
    else:
        try:
            body = await request.json()
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid JSON or multipart form data")
        user_uuid = body.get("user_uuid")
        raw_transcript = body.get("transcript")
        use_own_key = bool(body.get("use_own_key", False))
        req_training_type = body.get("training_type")
        req_log_length_lines = body.get("log_length_lines")
        req_grammar_level = body.get("grammar_level")
        req_use_nigerian_lingo = body.get("use_nigerian_lingo")

    if not user_uuid:
        raise HTTPException(status_code=400, detail="Missing user_uuid")

    if not raw_transcript or not str(raw_transcript).strip():
        raise HTTPException(status_code=400, detail="No transcript provided or could not transcribe audio")

    # Step 1: Get the student's profile (custom prompt, field, vocab, training program)
    def fetch_user_data(uid: str):
        u = None
        c = get_supabase_client()
        if c and is_valid_uuid(uid):
            try:
                u = db_get_user(uid)
            except Exception as e:
                logger.error(f"Error fetching user for voice processing: {e}")
        if not u:
            u = fake_users_db.get(uid)

        vocab = []
        if c and is_valid_uuid(uid):
            try:
                vocab_records = db_get_user_vocab(uid)
                vocab = [v["term"] for v in vocab_records if "term" in v]
            except Exception as e:
                logger.error(f"Error fetching vocab for voice processing: {e}")
        if not vocab:
            vocab = [
                v["term"] for v in fake_vocab_db.values()
                if v.get("user_id") == uid and "term" in v
            ]
        return u, vocab

    user, user_vocab = await run_in_threadpool(fetch_user_data, str(user_uuid))

    student_name = user.get("name") if user else None
    custom_prompt = user.get("custom_prompt") if user else None
    field_of_work = user.get("field_of_work") if user else None
    department = user.get("department") if user else None
    faculty = user.get("faculty") if user else None
    institution = user.get("institution") if user else None
    training_type = req_training_type or (user.get("training_type") if user else "siwes") or "siwes"
    log_length_lines = req_log_length_lines or (user.get("log_length_lines") if user else None)
    grammar_level = req_grammar_level or (user.get("grammar_level") if user else "balanced") or "balanced"

    use_nigerian_lingo = True
    if req_use_nigerian_lingo is not None:
        if isinstance(req_use_nigerian_lingo, str):
            use_nigerian_lingo = req_use_nigerian_lingo.lower() in ("true", "1")
        else:
            use_nigerian_lingo = bool(req_use_nigerian_lingo)
    elif user and user.get("use_nigerian_lingo") is not None:
        use_nigerian_lingo = bool(user["use_nigerian_lingo"])

    # Step 2: Build the full prompt with student program profile and line limit
    full_prompt = build_prompt(
        raw_transcript=str(raw_transcript),
        custom_prompt=custom_prompt,
        vocabulary_terms=user_vocab if user_vocab else None,
        field_of_work=field_of_work,
        department=department,
        faculty=faculty,
        institution=institution,
        student_name=student_name,
        training_type=training_type,
        log_length_lines=log_length_lines,
        grammar_level=grammar_level,
        use_nigerian_lingo=use_nigerian_lingo,
    )

    # Step 3: Resolve which API key to use (BYOK support)
    api_key_to_use = None

    if use_own_key:
        if user and user.get("api_key_encrypted"):
            api_key_to_use = decrypt_api_key(user["api_key_encrypted"])
        else:
            raise HTTPException(
                status_code=400,
                detail="Personal API key requested (use_own_key=True), but no key has been saved in Settings."
            )
    else:
        api_key_to_use = settings.gemini_api_key
        if not api_key_to_use and user and user.get("api_key_encrypted"):
            api_key_to_use = decrypt_api_key(user["api_key_encrypted"])

    if not api_key_to_use:
        raise HTTPException(
            status_code=500,
            detail="No Gemini API key available. Configure GEMINI_API_KEY in .env or add your own in Settings."
        )

    # Step 4: Call Gemini!
    try:
        result = await run_in_threadpool(call_gemini, prompt=full_prompt, api_key=api_key_to_use)
        return VoiceProcessResponse(
            processed_text=result["processed_text"],
            tokens_used=result["tokens_used"],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini API error: {str(e)}")
