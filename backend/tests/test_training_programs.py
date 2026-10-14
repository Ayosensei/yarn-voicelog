"""
test_training_programs.py - Tests for SWEP, SIWES, IT program tiers and customizable log length
"""

import pytest
from fastapi.testclient import TestClient
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app, fake_users_db, fake_logs_db, fake_vocab_db
from services.prompt_builder import build_prompt, PROGRAM_PROFILES

client = TestClient(app)


@pytest.fixture(autouse=True)
def clean_in_memory_db():
    fake_users_db.clear()
    fake_logs_db.clear()
    fake_vocab_db.clear()
    yield


def test_prompt_builder_swep():
    """Verify prompt generated for SWEP (Part 2) has workshop focus and 5-6 lines default."""
    prompt = build_prompt(
        raw_transcript="Trained on bench vise filing and observed lathe machine turning.",
        training_type="swep",
    )
    assert "SWEP (Students Work Experience Programme - Part 2 / 200L)" in prompt
    assert "5-6 lines" in prompt
    assert "Foundational workshop and laboratory training" in prompt
    assert "lathe" in prompt
    assert "Trained on bench vise filing" in prompt


def test_prompt_builder_siwes():
    """Verify prompt generated for SIWES (Part 3) has industrial routine focus and 2-3 lines default."""
    prompt = build_prompt(
        raw_transcript="Assisted the technician in replacing worn pump seals.",
        training_type="siwes",
    )
    assert "SIWES (Students Industrial Work Experience Scheme - Part 3 / 300L)" in prompt
    assert "2-3 lines" in prompt
    assert "Introductory industrial work experience" in prompt
    assert "Assisted the technician in replacing worn pump seals." in prompt


def test_prompt_builder_it():
    """Verify prompt generated for IT (Part 4) has engineering rigor and 2-4 lines default."""
    prompt = build_prompt(
        raw_transcript="Configured SCADA telemetry endpoints and validated signal latency.",
        training_type="it",
    )
    assert "IT (Industrial Training - Part 4 / 400L / 6 Months IT)" in prompt
    assert "2-4 lines" in prompt
    assert "Substantial professional industry experience" in prompt
    assert "SCADA telemetry" in prompt


def test_prompt_builder_custom_line_tweak():
    """Verify that a student can tweak the line constraint (e.g. 3-4 lines or 4 lines)."""
    prompt = build_prompt(
        raw_transcript="Repaired circuit board capacitors.",
        training_type="it",
        log_length_lines="3-4",
    )
    assert "3-4 lines" in prompt
    assert "Do NOT include multi-level markdown headers" in prompt


def test_user_api_training_program_lifecycle():
    """Verify creating, getting, and updating user with training_type and log_length_lines."""
    # 1. Create a Part 4 IT user
    res = client.post(
        "/api/users",
        json={
            "name": "Ifeoma Ade",
            "field_of_work": "Civil Engineering",
            "training_type": "it",
            "log_length_lines": "2-4",
        },
    )
    assert res.status_code == 200
    user_data = res.json()
    user_id = user_data["id"]
    assert user_data["training_type"] == "it"
    assert user_data["log_length_lines"] == "2-4"

    # 2. Fetch the user profile
    get_res = client.get(f"/api/users/{user_id}")
    assert get_res.status_code == 200
    assert get_res.json()["training_type"] == "it"
    assert get_res.json()["log_length_lines"] == "2-4"

    # 3. Update the user (e.g. switch to SWEP with 5-6 lines)
    patch_res = client.patch(
        f"/api/users/{user_id}",
        json={"training_type": "swep", "log_length_lines": "5-6"},
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["training_type"] == "swep"
    assert patch_res.json()["log_length_lines"] == "5-6"


def test_log_creation_snapshots_training_type():
    """Verify log entries capture the active training_type and log_length_lines."""
    user_id = "test-user-swep"
    fake_users_db[user_id] = {
        "id": user_id,
        "name": "SWEP Student",
        "training_type": "swep",
        "log_length_lines": "5-6",
    }

    create_log_res = client.post(
        "/api/logs",
        json={
            "user_id": user_id,
            "date": "2026-10-14",
            "processed_output": "Bench vise fitting practical completed according to workshop safety guidelines.",
            "training_type": "swep",
            "log_length_lines": "5-6",
        },
    )
    assert create_log_res.status_code == 200
    log_data = create_log_res.json()
    assert log_data["training_type"] == "swep"
    assert log_data["log_length_lines"] == "5-6"


def test_user_onboarding_lifecycle():
    """Verify onboarding fields (department, institution, is_onboarded) flow properly through user CRUD."""
    # 1. Create a fresh user with onboarding fields
    create_res = client.post(
        "/api/users",
        json={
            "name": "Chukwuemeka Okonkwo",
            "department": "Mechanical Engineering",
            "institution": "FUTA",
            "training_type": "it",
            "log_length_lines": "2-4",
            "field_of_work": "Turbomachinery Maintenance",
            "is_onboarded": False,
        },
    )
    assert create_res.status_code == 200
    user_data = create_res.json()
    uid = user_data["id"]
    assert user_data["name"] == "Chukwuemeka Okonkwo"
    assert user_data["department"] == "Mechanical Engineering"
    assert user_data["institution"] == "FUTA"
    assert user_data["training_type"] == "it"
    assert user_data["log_length_lines"] == "2-4"
    assert user_data["is_onboarded"] is False

    # 2. Complete onboarding via PATCH
    patch_res = client.patch(
        f"/api/users/{uid}",
        json={
            "department": "Mechatronics Engineering",
            "is_onboarded": True,
        },
    )
    assert patch_res.status_code == 200
    patched = patch_res.json()
    assert patched["department"] == "Mechatronics Engineering"
    assert patched["institution"] == "FUTA"
    assert patched["is_onboarded"] is True

    # 3. Retrieve user profile
    get_res = client.get(f"/api/users/{uid}")
    assert get_res.status_code == 200
    profile = get_res.json()
    assert profile["department"] == "Mechatronics Engineering"
    assert profile["institution"] == "FUTA"
    assert profile["is_onboarded"] is True

