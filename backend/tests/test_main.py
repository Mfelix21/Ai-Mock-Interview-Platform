from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_home():
    response = client.get("/")
    print(response.json())
    assert response.status_code == 200
    assert response.json()["message"] == "Career Intelligence API is broken"

def test_ai_feedback_short_answer():
    payload = {
        "role": "Software Engineer",
        "question": "Tell me about yourself.",
        "answer": "too short"
    }

    response = client.post("/ai-feedback", json=payload)

    assert response.status_code == 200
    assert response.json()["error"] == "Answer is too short for meaningful feedback."


def test_invalid_role_questions():
    response = client.get("/questions/fake-role")

    assert response.status_code == 200
    assert response.json()["error"] == "Role not found"

