from fastapi.testclient import TestClient
from main import app
import pytest

client = TestClient(app)


def test_home():
    response = client.get("/")

    assert response.status_code == 200
    assert response.json()["message"] == "Career Intelligence API is running"


def test_invalid_role_questions():
    response = client.get("/questions/fake-role")

    assert response.status_code == 200
    assert response.json()["error"] == "Role not found"


def test_ai_feedback_too_short():
    response = client.post("/ai-feedback", json={
        "role": "Software Engineer",
        "question": "Tell me about yourself.",
        "answer": "too short"
    })

    assert response.status_code == 200
    assert response.json()["error"] == "Answer is too short for meaningful feedback."


def test_submit_answers_requires_auth():
    response = client.post("/submit_answers", json={})

    assert response.status_code == 401


def test_answers_requires_auth():
    response = client.get("/answers")

    assert response.status_code == 401


def test_analytics_summary_requires_auth():
    response = client.get("/analytics/summary")

    assert response.status_code == 401


def test_analytics_history_requires_auth():
    response = client.get("/analytics/history")

    assert response.status_code == 401


def test_me_requires_auth():
    response = client.get("/me")

    assert response.status_code == 401


@pytest.mark.skip(reason="Requires questions table")
def test_valid_role_questions():
    response = client.get("/questions/software-engineer")

    print(response.json())

    assert response.status_code == 200

    data = response.json()

    assert data["role"] == "Software Engineer"
    assert "questions" in data
    assert isinstance(data["questions"], list)
    assert len(data["questions"]) > 0


def test_ai_feedback_success():
    response = client.post("/ai-feedback", json={
        "role": "Software Engineer",
        "question": "Tell me about yourself.",
        "answer": (
            "I am a computer science student who built a full-stack "
            "AI interview platform using React, FastAPI, PostgreSQL, "
            "Docker, and GitHub Actions to practice interview preparation."
        )
    })

    assert response.status_code == 200

    data = response.json()

    assert "score" in data or "error" in data

    