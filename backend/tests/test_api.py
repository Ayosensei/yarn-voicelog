"""
test_api.py - Automated Unit & Integration Tests for Yarn Backend

Tests:
1. Root & Health Check Endpoints
2. User CRUD & Profile Updates
3. Fernet Encryption & Decryption
4. Dynamic SIWES Prompt Assembly
5. Technical Vocabulary Endpoints
6. Logbook Endpoints & Confidential Mode
7. Voice Processing Validation & BYOK Handling
8. Audio File Transcription Fallback (Whisper)
"""

import pytest
from fastapi.testclient import TestClient
import sys
import os

# Add backend directory to sys.path so tests can import modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app, fake_users_db, fake_logs_db, fake_vocab_db
from services.encryption import encrypt_api_key, decrypt_api_key
from services.prompt_builder import build_prompt
from services.whisper_service import transcribe_audio

client = TestClient(app)


@pytest.fixture(autouse=True)
def clean_in_memory_db():
    """Clear in-memory databases before each test."""
    fake_users_db.clear()
    fake_logs_db.clear()
    fake_vocab_db.clear()
    yield


def test_root_endpoint():
    """Verify that root endpoint / returns 200 and running status."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["app"] == "Yarn VoiceLog API"
    assert data["status"] == "running"


def test_health_check():
    """Verify that health check /health returns 200 and healthy status."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_user_lifecycle_and_byok():
    """Test creating user, reading user, updating prompt and encrypting API key."""
    # 1. Create user
    res = client.post(
        "/api/users",
        json={"name": "Durotoluwa", "field_of_work": "Mechanical Engineering"},
    )
    assert res.status_code == 200
    user_data = res.json()
    assert "id" in user_data
    assert user_data["name"] == "Durotoluwa"
    assert user_data["has_own_key"] is False
    user_id = user_data["id"]

    # 2. Get user profile
    get_res = client.get(f"/api/users/{user_id}")
    assert get_res.status_code == 200
    assert get_res.json()["name"] == "Durotoluwa"

    # 3. Update user with custom prompt and BYOK key
    patch_res = client.patch(
        f"/api/users/{user_id}",
        json={
            "custom_prompt": "Focus on CNC milling and lathe turning.",
            "api_key": "AIzaSyTestApiKey12345",
        },
    )
    assert patch_res.status_code == 200
    updated = patch_res.json()
    assert updated["custom_prompt"] == "Focus on CNC milling and lathe turning."
    assert updated["has_own_key"] is True

    # Verify that in-memory storage contains encrypted key, not plain text
    stored_user = fake_users_db[user_id]
    assert stored_user["api_key_encrypted"] != "AIzaSyTestApiKey12345"
    assert decrypt_api_key(stored_user["api_key_encrypted"]) == "AIzaSyTestApiKey12345"


def test_encryption_roundtrip():
    """Test that Fernet encrypt_api_key and decrypt_api_key work reversibly."""
    sample_key = "AQ.TestKey_987654321_SecretValue"
    encrypted = encrypt_api_key(sample_key)
    assert encrypted != sample_key
    assert len(encrypted) > 20
    decrypted = decrypt_api_key(encrypted)
    assert decrypted == sample_key


def test_prompt_builder():
    """Test dynamic SIWES prompt construction."""
    prompt = build_prompt(
        raw_transcript="Today I calibrated the oscilloscope and measured circuit frequencies.",
        custom_prompt="Highlight frequency domain analysis.",
        vocabulary_terms=["Oscilloscope", "FFT"],
        field_of_work="Electrical Engineering",
    )
    assert "Electrical Engineering" in prompt
    assert "Oscilloscope" in prompt
    assert "FFT" in prompt
    assert "Highlight frequency domain analysis." in prompt
    assert "Today I calibrated the oscilloscope" in prompt


def test_vocabulary_crud():
    """Test adding, listing, and deleting technical vocabulary terms."""
    user_id = "test-user-uuid"
    fake_users_db[user_id] = {"id": user_id, "name": "Test User"}

    # 1. Add vocabulary term
    add_res = client.post(
        "/api/vocabulary",
        json={"user_id": user_id, "term": "Vernier Caliper", "context": "Precision measuring tool"},
    )
    assert add_res.status_code == 200
    term_data = add_res.json()
    assert term_data["term"] == "Vernier Caliper"
    term_id = term_data["id"]

    # 2. List vocabulary for user
    list_res = client.get(f"/api/vocabulary/{user_id}")
    assert list_res.status_code == 200
    assert len(list_res.json()) == 1
    assert list_res.json()[0]["term"] == "Vernier Caliper"

    # 3. Delete vocabulary term
    del_res = client.delete(f"/api/vocabulary/{term_id}")
    assert del_res.status_code == 200

    # 4. Verify list is now empty
    list_res_after = client.get(f"/api/vocabulary/{user_id}")
    assert len(list_res_after.json()) == 0


def test_logs_crud_and_confidential_mode():
    """Test creating a logbook entry and verifying confidential mode clears raw transcript."""
    user_id = "student-123"

    # Confidential Log: raw transcript must NOT be stored
    res_confidential = client.post(
        "/api/logs",
        json={
            "user_id": user_id,
            "date": "2026-10-02",
            "raw_transcript": "Classified industrial prototype testing details...",
            "processed_output": "### Activities Performed\nInspected equipment.",
            "is_confidential": True,
        },
    )
    assert res_confidential.status_code == 200
    log_data = res_confidential.json()
    assert log_data["is_confidential"] is True
    assert log_data["raw_transcript"] is None

    # Normal Log: raw transcript is preserved
    res_normal = client.post(
        "/api/logs",
        json={
            "user_id": user_id,
            "date": "2026-10-03",
            "raw_transcript": "Regular lathe machine turning operation.",
            "processed_output": "### Activities Performed\nMachined mild steel shaft.",
            "is_confidential": False,
        },
    )
    assert res_normal.status_code == 200
    assert res_normal.json()["raw_transcript"] == "Regular lathe machine turning operation."

    # List logs
    logs_res = client.get(f"/api/logs/{user_id}")
    assert logs_res.status_code == 200
    assert len(logs_res.json()) == 2


def test_process_voice_validations():
    """Test validation errors on /api/process-voice endpoint."""
    # Missing user_uuid
    res_no_user = client.post("/api/process-voice", json={"transcript": "Some text"})
    assert res_no_user.status_code == 400

    # Missing transcript
    res_no_transcript = client.post("/api/process-voice", json={"user_uuid": "some-uuid", "transcript": ""})
    assert res_no_transcript.status_code == 400

    # Requesting use_own_key when user has none saved
    user_id = "user-without-key"
    fake_users_db[user_id] = {"id": user_id, "name": "Keyless User", "api_key_encrypted": None}
    res_byok_error = client.post(
        "/api/process-voice",
        json={"user_uuid": user_id, "transcript": "Testing without key", "use_own_key": True},
    )
    assert res_byok_error.status_code == 400
    assert "Personal API key requested" in res_byok_error.json()["detail"]


def test_whisper_transcription_service():
    """Test audio transcription fallback service."""
    dummy_audio_bytes = b"RIFF....WAVEfmt ...."
    result = transcribe_audio(dummy_audio_bytes, filename="test_recording.wav")
    assert isinstance(result, str)
    assert len(result) > 10
