"""
main.py - The "front door" of our FastAPI backend

This is where everything starts. When you run:
    python -m uvicorn main:app --reload
Uvicorn reads THIS file and starts listening for web requests.
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import uuid

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
from config import settings


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

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",       # Next.js dev server
        "http://127.0.0.1:3000",       # Alternative localhost
    ],
    allow_credentials=True,
    allow_methods=["*"],               # Allow GET, POST, PATCH, DELETE
    allow_headers=["*"],               # Allow all headers
)


# ============================================================
#  HEALTH CHECK ENDPOINTS
# ============================================================

@app.get("/")
def root():
    return {
        "app": "Yarn VoiceLog API",
        "status": "running",
        "message": "Welcome to Yarn! Visit /docs for interactive API documentation.",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


# ============================================================
#  TEMPORARY IN-MEMORY STORAGE (until Supabase is connected)
# ============================================================

fake_users_db: dict[str, dict] = {}
fake_logs_db: dict[str, dict] = {}
fake_vocab_db: dict[str, dict] = {}


# ============================================================
#  USER ENDPOINTS (Create, Read, Update with BYOK Encryption)
# ============================================================

@app.post("/api/users", response_model=UserResponse)
def create_user(user: UserCreate):
    """Create a new student profile. Returns a UUID."""
    user_id = str(uuid.uuid4())
    new_user = {
        "id": user_id,
        "name": user.name,
        "field_of_work": user.field_of_work,
        "custom_prompt": None,
        "api_key_encrypted": None,
        "created_at": None,
    }
    fake_users_db[user_id] = new_user
    return {
        "id": new_user["id"],
        "name": new_user["name"],
        "field_of_work": new_user["field_of_work"],
        "custom_prompt": new_user["custom_prompt"],
        "has_own_key": False,
        "created_at": new_user["created_at"],
    }


@app.get("/api/users/{user_uuid}", response_model=UserResponse)
def get_user(user_uuid: str):
    """Get a student's profile by their UUID."""
    if user_uuid not in fake_users_db:
        raise HTTPException(status_code=404, detail="User not found")
    user = fake_users_db[user_uuid]
    return {
        "id": user["id"],
        "name": user["name"],
        "field_of_work": user.get("field_of_work"),
        "custom_prompt": user.get("custom_prompt"),
        "has_own_key": bool(user.get("api_key_encrypted")),
        "created_at": user.get("created_at"),
    }


@app.patch("/api/users/{user_uuid}", response_model=UserResponse)
def update_user(user_uuid: str, updates: UserUpdate):
    """
    Update a student's profile, custom prompt, or personal Gemini API key.
    If an API key is provided, it is securely encrypted with Fernet.
    """
    if user_uuid not in fake_users_db:
        raise HTTPException(status_code=404, detail="User not found")

    user = fake_users_db[user_uuid]

    if updates.name is not None:
        user["name"] = updates.name
    if updates.custom_prompt is not None:
        user["custom_prompt"] = updates.custom_prompt
    if updates.field_of_work is not None:
        user["field_of_work"] = updates.field_of_work

    # BYOK: Encrypt personal API key if provided
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
        "custom_prompt": user.get("custom_prompt"),
        "has_own_key": bool(user.get("api_key_encrypted")),
        "created_at": user.get("created_at"),
    }


# ============================================================
#  LOG ENDPOINTS (Create, Read, Delete)
# ============================================================

@app.post("/api/logs", response_model=LogResponse)
def create_log(log: LogCreate):
    """Save a new logbook entry."""
    log_id = str(uuid.uuid4())
    new_log = {
        "id": log_id,
        "user_id": log.user_id,
        "date": log.date,
        "raw_transcript": None if log.is_confidential else log.raw_transcript,
        "processed_output": log.processed_output,
        "is_confidential": log.is_confidential,
        "audio_file_url": log.audio_file_url,
        "created_at": None,
    }
    fake_logs_db[log_id] = new_log
    return new_log


@app.get("/api/logs/{user_uuid}")
def get_user_logs(user_uuid: str, start_date: str | None = None, end_date: str | None = None):
    """Get all logs for a student, optionally filtered by date range."""
    user_logs = [
        log for log in fake_logs_db.values()
        if log["user_id"] == user_uuid
    ]
    if start_date:
        user_logs = [l for l in user_logs if l["date"] >= start_date]
    if end_date:
        user_logs = [l for l in user_logs if l["date"] <= end_date]
    return user_logs


@app.get("/api/logs/single/{log_id}", response_model=LogResponse)
def get_single_log(log_id: str):
    """Get a single log entry by its ID."""
    if log_id not in fake_logs_db:
        raise HTTPException(status_code=404, detail="Log not found")
    return fake_logs_db[log_id]


@app.delete("/api/logs/{log_id}")
def delete_log(log_id: str):
    """Delete a log entry."""
    if log_id not in fake_logs_db:
        raise HTTPException(status_code=404, detail="Log not found")
    del fake_logs_db[log_id]
    return {"success": True, "message": "Log deleted"}


# ============================================================
#  VOCABULARY ENDPOINTS (Create, Read, Delete)
# ============================================================

@app.post("/api/vocabulary", response_model=VocabResponse)
def add_vocab(vocab: VocabCreate):
    """Add a custom technical term for better AI accuracy."""
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
    return [
        v for v in fake_vocab_db.values()
        if v["user_id"] == user_uuid
    ]


@app.delete("/api/vocabulary/{vocab_id}")
def delete_vocab(vocab_id: str):
    """Remove a vocabulary term."""
    if vocab_id not in fake_vocab_db:
        raise HTTPException(status_code=404, detail="Term not found")
    del fake_vocab_db[vocab_id]
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

    if "multipart/form-data" in content_type:
        form = await request.form()
        user_uuid = form.get("user_uuid")
        use_own_key = str(form.get("use_own_key", "false")).lower() in ("true", "1")
        audio_file = form.get("audio_file")
        if audio_file and hasattr(audio_file, "read"):
            file_bytes = await audio_file.read()
            filename = getattr(audio_file, "filename", "audio.wav")
            raw_transcript = transcribe_audio(file_bytes, filename=filename)
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

    if not user_uuid:
        raise HTTPException(status_code=400, detail="Missing user_uuid")

    if not raw_transcript or not str(raw_transcript).strip():
        raise HTTPException(status_code=400, detail="No transcript provided or could not transcribe audio")

    # Step 1: Get the student's profile (custom prompt, field, vocab)
    user = fake_users_db.get(str(user_uuid))
    custom_prompt = user.get("custom_prompt") if user else None
    field_of_work = user.get("field_of_work") if user else None

    user_vocab = [
        v["term"] for v in fake_vocab_db.values()
        if v["user_id"] == str(user_uuid)
    ]

    # Step 2: Build the full prompt
    full_prompt = build_prompt(
        raw_transcript=str(raw_transcript),
        custom_prompt=custom_prompt,
        vocabulary_terms=user_vocab if user_vocab else None,
        field_of_work=field_of_work,
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
        result = call_gemini(prompt=full_prompt, api_key=api_key_to_use)
        return VoiceProcessResponse(
            processed_text=result["processed_text"],
            tokens_used=result["tokens_used"],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini API error: {str(e)}")
