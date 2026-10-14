"""
models.py - Pydantic Schemas (Data Validation)

These are NOT database tables (Femi handles that).
These are "bouncers at the door" that check:
  - Did the frontend send the right fields?
  - Are they the correct types (string, boolean, etc.)?

If the data is wrong, FastAPI automatically sends back a clear error message.
"""

from pydantic import BaseModel
from datetime import date, datetime
from uuid import UUID


# ============================================================
#  USER SCHEMAS
# ============================================================

class UserCreate(BaseModel):
    """What the frontend sends when creating a new user."""
    name: str                              # Required: student's name
    field_of_work: str | None = None       # Optional: "Electrical Engineering", etc.
    training_type: str | None = "siwes"    # 'swep' (Part 2), 'siwes' (Part 3), 'it' (Part 4)
    log_length_lines: str | None = "2-3"   # e.g. '2-3', '2-4', '5-6', or custom count


class UserUpdate(BaseModel):
    """What the frontend sends when updating a user's settings."""
    name: str | None = None                # Update student's name
    custom_prompt: str | None = None       # Their custom AI instructions
    api_key: str | None = None             # Their own Gemini key (BYOK)
    field_of_work: str | None = None       # Update field of work
    training_type: str | None = None       # Update training program
    log_length_lines: str | None = None    # Update log length constraint


class UserResponse(BaseModel):
    """What we send back to the frontend after creating/reading a user."""
    id: str
    name: str
    field_of_work: str | None = None
    training_type: str | None = "siwes"
    log_length_lines: str | None = "2-3"
    custom_prompt: str | None = None
    has_own_key: bool = False              # Indicates if BYOK personal API key is configured
    created_at: datetime | None = None


# ============================================================
#  LOG SCHEMAS
# ============================================================

class LogCreate(BaseModel):
    """What the frontend sends when saving a new logbook entry."""
    user_id: str                           # Which student owns this log
    date: str                              # The date of the log entry
    raw_transcript: str | None = None      # What they originally said
    processed_output: str                  # The clean logbook text from Gemini
    training_type: str | None = None       # Snapshot of program used for this log
    log_length_lines: str | None = None    # Snapshot of target length used
    is_confidential: bool = False          # Should we delete the raw transcript?
    audio_file_url: str | None = None      # Link to uploaded audio (if any)


class LogResponse(BaseModel):
    """What we send back when reading a log."""
    id: str
    user_id: str | None = None
    date: str
    raw_transcript: str | None = None
    processed_output: str
    training_type: str | None = None
    log_length_lines: str | None = None
    is_confidential: bool = False
    audio_file_url: str | None = None
    deleted_at: datetime | None = None
    created_at: datetime | None = None


# ============================================================
#  VOCABULARY SCHEMAS
# ============================================================

class VocabCreate(BaseModel):
    """What the frontend sends when adding a custom term."""
    user_id: str                           # Which student owns this term
    term: str                              # e.g., "Oscilloscope"
    context: str | None = None             # e.g., "Used for measuring voltage"


class VocabResponse(BaseModel):
    """What we send back when reading vocabulary."""
    id: str
    user_id: str | None = None
    term: str
    context: str | None = None
    created_at: datetime | None = None


# ============================================================
#  VOICE PROCESSING SCHEMAS
# ============================================================

class VoiceProcessRequest(BaseModel):
    """What the frontend sends to the AI processing endpoint."""
    user_uuid: str                         # Which student is making the request
    transcript: str | None = None          # Text from browser speech recognition
    use_own_key: bool = False              # Should we use their personal API key?
    training_type: str | None = None       # Optional per-request override
    log_length_lines: str | None = None    # Optional per-request line count override


class VoiceProcessResponse(BaseModel):
    """What we send back after Gemini processes the transcript."""
    processed_text: str                    # The clean, formatted logbook entry
    tokens_used: int | None = None         # How many AI tokens were consumed

