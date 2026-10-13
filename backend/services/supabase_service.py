"""
supabase_service.py - Supabase Database Client & Data Access Layer

Connects to Supabase PostgreSQL via the official Supabase Python client.
Handles CRUD operations for:
  - Users (with encrypted BYOK keys and custom prompts)
  - Daily Logs (with confidential mode filtering and date ranges)
  - Custom Vocabulary (technical jargon terms)
"""

import uuid
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any
from supabase import create_client, Client
from config import settings

logger = logging.getLogger("yarn.supabase")

_supabase_client: Optional[Client] = None


def is_valid_uuid(val: Any) -> bool:
    """Check if a string is a valid UUID."""
    try:
        uuid.UUID(str(val))
        return True
    except (ValueError, AttributeError, TypeError):
        return False


def get_supabase_client() -> Optional[Client]:
    """
    Get or initialize the singleton Supabase client.
    Returns None if supabase_url or supabase_key is not configured.
    """
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    if not settings.supabase_url or not settings.supabase_key:
        logger.warning("Supabase credentials not configured in settings.")
        return None

    try:
        _supabase_client = create_client(settings.supabase_url, settings.supabase_key)
        return _supabase_client
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {e}")
        return None


# ============================================================
#  USER DATA ACCESS
# ============================================================

def db_create_user(name: str, field_of_work: Optional[str] = None) -> Dict[str, Any]:
    """Insert a new user into Supabase."""
    client = get_supabase_client()
    if not client:
        raise RuntimeError("Supabase client not available")

    payload: Dict[str, Any] = {"name": name}
    if field_of_work is not None:
        payload["field_of_work"] = field_of_work

    res = client.table("users").insert(payload).execute()
    if res.data and len(res.data) > 0:
        return res.data[0]
    raise RuntimeError("Failed to create user in Supabase")


def db_get_user(user_id: str) -> Optional[Dict[str, Any]]:
    """Fetch a user by their UUID."""
    if not is_valid_uuid(user_id):
        return None

    client = get_supabase_client()
    if not client:
        raise RuntimeError("Supabase client not available")

    res = client.table("users").select("*").eq("id", user_id).execute()
    if res.data and len(res.data) > 0:
        return res.data[0]
    return None


def db_update_user(user_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Update an existing user in Supabase."""
    if not is_valid_uuid(user_id):
        return None

    client = get_supabase_client()
    if not client:
        raise RuntimeError("Supabase client not available")

    # Verify user exists first
    existing = db_get_user(user_id)
    if not existing:
        return None

    if not updates:
        return existing

    res = client.table("users").update(updates).eq("id", user_id).execute()
    if res.data and len(res.data) > 0:
        return res.data[0]
    return existing


# ============================================================
#  LOG DATA ACCESS
# ============================================================

def db_create_log(
    user_id: str,
    log_date: str,
    processed_output: str,
    raw_transcript: Optional[str] = None,
    is_confidential: bool = False,
    audio_file_url: Optional[str] = None,
) -> Dict[str, Any]:
    """Insert a new daily log entry into Supabase."""
    if not is_valid_uuid(user_id):
        raise ValueError(f"Invalid user_id UUID: {user_id}")

    client = get_supabase_client()
    if not client:
        raise RuntimeError("Supabase client not available")

    # Enforce confidential mode rule: nullify raw transcript if marked confidential
    final_raw_transcript = None if is_confidential else raw_transcript

    payload = {
        "user_id": user_id,
        "date": log_date,
        "processed_output": processed_output,
        "raw_transcript": final_raw_transcript,
        "is_confidential": is_confidential,
        "audio_file_url": audio_file_url,
    }

    res = client.table("logs").insert(payload).execute()
    if res.data and len(res.data) > 0:
        return res.data[0]
    raise RuntimeError("Failed to insert log entry into Supabase")


def db_get_user_logs(
    user_id: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    include_deleted: bool = False,
    only_deleted: bool = False,
) -> List[Dict[str, Any]]:
    """Retrieve daily logs for a given user, excluding soft-deleted items unless requested."""
    if not is_valid_uuid(user_id):
        return []

    client = get_supabase_client()
    if not client:
        raise RuntimeError("Supabase client not available")

    # Purge permanently any trash items older than 7 days
    try:
        cutoff = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
        client.table("logs").delete().not_.is_("deleted_at", "null").lt("deleted_at", cutoff).execute()
    except Exception as e:
        logger.debug(f"Expired trash cleanup check: {e}")

    query = client.table("logs").select("*").eq("user_id", user_id)
    if only_deleted:
        query = query.not_.is_("deleted_at", "null")
    elif not include_deleted:
        query = query.is_("deleted_at", "null")

    if start_date:
        query = query.gte("date", start_date)
    if end_date:
        query = query.lte("date", end_date)

    res = query.order("date", desc=True).execute()
    return res.data or []


def db_get_single_log(log_id: str, include_deleted: bool = False) -> Optional[Dict[str, Any]]:
    """Retrieve a single log entry by its UUID."""
    if not is_valid_uuid(log_id):
        return None

    client = get_supabase_client()
    if not client:
        raise RuntimeError("Supabase client not available")

    query = client.table("logs").select("*").eq("id", log_id)
    if not include_deleted:
        query = query.is_("deleted_at", "null")

    res = query.execute()
    if res.data and len(res.data) > 0:
        return res.data[0]
    return None


def db_delete_log(log_id: str, hard_delete: bool = False) -> bool:
    """Soft delete a log entry (or hard delete if specified). Returns True if deleted/trashed."""
    if not is_valid_uuid(log_id):
        return False

    client = get_supabase_client()
    if not client:
        raise RuntimeError("Supabase client not available")

    existing = db_get_single_log(log_id, include_deleted=True)
    if not existing:
        return False

    if hard_delete:
        res = client.table("logs").delete().eq("id", log_id).execute()
    else:
        now_iso = datetime.now(timezone.utc).isoformat()
        res = client.table("logs").update({"deleted_at": now_iso}).eq("id", log_id).execute()
    return bool(res.data)


def db_restore_log(log_id: str) -> bool:
    """Restore a soft-deleted log from the trash."""
    if not is_valid_uuid(log_id):
        return False

    client = get_supabase_client()
    if not client:
        raise RuntimeError("Supabase client not available")

    res = client.table("logs").update({"deleted_at": None}).eq("id", log_id).execute()
    return bool(res.data)


def db_delete_storage_file(file_url: str) -> bool:
    """Delete an audio file from the voice-memos Supabase Storage bucket."""
    if not file_url:
        return False

    client = get_supabase_client()
    if not client:
        return False

    try:
        bucket_name = "voice-memos"
        if f"/{bucket_name}/" in file_url:
            path = file_url.split(f"/{bucket_name}/")[-1]
            client.storage.from_(bucket_name).remove([path])
            return True
    except Exception as e:
        logger.warning(f"Failed to delete storage file {file_url}: {e}")
    return False


# ============================================================
#  VOCABULARY DATA ACCESS
# ============================================================

def db_create_vocab(
    user_id: str,
    term: str,
    context: Optional[str] = None,
) -> Dict[str, Any]:
    """Insert a technical vocabulary term into Supabase."""
    if not is_valid_uuid(user_id):
        raise ValueError(f"Invalid user_id UUID: {user_id}")

    client = get_supabase_client()
    if not client:
        raise RuntimeError("Supabase client not available")

    payload: Dict[str, Any] = {
        "user_id": user_id,
        "term": term,
        "context": context,
    }

    res = client.table("vocabulary").insert(payload).execute()
    if res.data and len(res.data) > 0:
        return res.data[0]
    raise RuntimeError("Failed to insert vocabulary term into Supabase")


def db_get_user_vocab(user_id: str) -> List[Dict[str, Any]]:
    """Retrieve all vocabulary terms saved by a student."""
    if not is_valid_uuid(user_id):
        return []

    client = get_supabase_client()
    if not client:
        raise RuntimeError("Supabase client not available")

    res = client.table("vocabulary").select("*").eq("user_id", user_id).order("created_at", desc=False).execute()
    return res.data or []


def db_delete_vocab(vocab_id: str) -> bool:
    """Delete a vocabulary term by its UUID. Returns True if deleted."""
    if not is_valid_uuid(vocab_id):
        return False

    client = get_supabase_client()
    if not client:
        raise RuntimeError("Supabase client not available")

    res = client.table("vocabulary").select("id").eq("id", vocab_id).execute()
    if not res.data:
        return False

    del_res = client.table("vocabulary").delete().eq("id", vocab_id).execute()
    return bool(del_res.data)
