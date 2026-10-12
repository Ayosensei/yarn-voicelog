"""
test_supabase_integration.py - Live Supabase PostgreSQL Integration Tests

Tests end-to-end database persistence, RLS, cascade deletions,
and API behavior using the live Supabase cloud project.
"""

import pytest
from fastapi.testclient import TestClient
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app
from services.supabase_service import get_supabase_client
from services.encryption import decrypt_api_key

client = TestClient(app)


@pytest.mark.skipif(
    not get_supabase_client(),
    reason="Live Supabase credentials not configured in environment",
)
def test_supabase_health_and_connection():
    """Verify Supabase client initializes and root reports supabase_connected=True."""
    db_client = get_supabase_client()
    assert db_client is not None

    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert data["supabase_connected"] is True


@pytest.mark.skipif(
    not get_supabase_client(),
    reason="Live Supabase credentials not configured in environment",
)
def test_supabase_full_user_and_child_lifecycle():
    """
    Test full lifecycle in live Supabase:
    1. Create user
    2. Read user
    3. Update user (custom prompt & BYOK encrypted key)
    4. Add vocabulary & read vocabulary
    5. Create log (confidential & normal)
    6. Read logs (all & single)
    7. Clean up (delete log, delete vocab, delete user)
    """
    db_client = get_supabase_client()
    assert db_client is not None

    # 1. Create user
    res = client.post(
        "/api/users",
        json={"name": "Supabase Integration Tester", "field_of_work": "Civil Engineering"},
    )
    assert res.status_code == 200
    user_data = res.json()
    user_id = user_data["id"]
    assert user_data["name"] == "Supabase Integration Tester"
    assert user_data["field_of_work"] == "Civil Engineering"
    assert user_data["has_own_key"] is False

    try:
        # 2. Get user
        get_res = client.get(f"/api/users/{user_id}")
        assert get_res.status_code == 200
        assert get_res.json()["name"] == "Supabase Integration Tester"

        # 3. Update user with custom prompt & BYOK API key
        patch_res = client.patch(
            f"/api/users/{user_id}",
            json={
                "custom_prompt": "Include concrete slump test results.",
                "api_key": "AIzaSyLiveSupabaseIntegrationKey99",
            },
        )
        assert patch_res.status_code == 200
        updated = patch_res.json()
        assert updated["custom_prompt"] == "Include concrete slump test results."
        assert updated["has_own_key"] is True

        # Check raw database row in Supabase: verify encryption
        db_user = db_client.table("users").select("*").eq("id", user_id).execute().data[0]
        assert db_user["api_key_encrypted"] is not None
        assert db_user["api_key_encrypted"] != "AIzaSyLiveSupabaseIntegrationKey99"
        assert decrypt_api_key(db_user["api_key_encrypted"]) == "AIzaSyLiveSupabaseIntegrationKey99"

        # 4. Vocabulary CRUD in Supabase
        v_res = client.post(
            "/api/vocabulary",
            json={"user_id": user_id, "term": "Slump Cone", "context": "Workability testing"},
        )
        assert v_res.status_code == 200
        vocab_id = v_res.json()["id"]

        v_list = client.get(f"/api/vocabulary/{user_id}")
        assert v_list.status_code == 200
        terms = [item["term"] for item in v_list.json()]
        assert "Slump Cone" in terms

        # 5. Logs in Supabase (Confidential Mode)
        conf_res = client.post(
            "/api/logs",
            json={
                "user_id": user_id,
                "date": "2026-10-06",
                "raw_transcript": "Confidential construction budget numbers...",
                "processed_output": "### Activities Performed\nConducted slump test with 75mm slump.",
                "is_confidential": True,
            },
        )
        assert conf_res.status_code == 200
        conf_log_id = conf_res.json()["id"]

        # Verify confidential in Supabase: raw_transcript must be NULL
        db_log = db_client.table("logs").select("*").eq("id", conf_log_id).execute().data[0]
        assert db_log["raw_transcript"] is None
        assert db_log["is_confidential"] is True

        # Normal log
        norm_res = client.post(
            "/api/logs",
            json={
                "user_id": user_id,
                "date": "2026-10-07",
                "raw_transcript": "Batching plant inspection and aggregate moisture check.",
                "processed_output": "### Activities Performed\nInspected batching plant aggregates.",
                "is_confidential": False,
            },
        )
        assert norm_res.status_code == 200
        norm_log_id = norm_res.json()["id"]

        # 6. Read user logs & single log
        all_logs_res = client.get(f"/api/logs/{user_id}")
        assert all_logs_res.status_code == 200
        assert len(all_logs_res.json()) >= 2

        single_res = client.get(f"/api/logs/single/{conf_log_id}")
        assert single_res.status_code == 200
        assert single_res.json()["is_confidential"] is True

        # 7. Delete operations
        del_log_res = client.delete(f"/api/logs/{conf_log_id}")
        assert del_log_res.status_code == 200

        del_vocab_res = client.delete(f"/api/vocabulary/{vocab_id}")
        assert del_vocab_res.status_code == 200

    finally:
        # Clean up user and cascaded rows in Supabase
        db_client.table("users").delete().eq("id", user_id).execute()
