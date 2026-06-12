from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import text
from database import engine

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnswerSubmission(BaseModel):
    role: str
    answers: list[str]


questions_by_role = {
    "software-engineer": [
        {
            "category": "Behavioral",
            "question": "Tell me about yourself."
        },
        {
            "category": "Technical",
            "question": "Explain the difference between an API and an endpoint."
        },
        {
            "category": "Technical",
            "question": "What is object-oriented programming?"
        },
        {
            "category": "Project",
            "question": "Describe a project where you used frontend and backend technologies."
        },
        {
            "category": "Scenario",
            "question": "How would you debug an application that is not fetching data correctly?"
        }
    ],

    "data-analyst": [
        {
            "category": "Behavioral",
            "question": "Tell me about yourself."
        },
        {
            "category": "Technical",
            "question": "What is SQL used for?"
        },
        {
            "category": "Technical",
            "question": "Explain the difference between a JOIN and a UNION."
        },
        {
            "category": "Project",
            "question": "Describe a time you used data to make a decision."
        },
        {
            "category": "Scenario",
            "question": "How would you handle missing values in a dataset?"
        }
    ],

    "data-scientist": [
        {
            "category": "Behavioral",
            "question": "Tell me about yourself."
        },
        {
            "category": "Technical",
            "question": "What is the difference between supervised and unsupervised learning?"
        },
        {
            "category": "Technical",
            "question": "What is overfitting?"
        },
        {
            "category": "Project",
            "question": "Describe a machine learning project you worked on."
        },
        {
            "category": "Scenario",
            "question": "How would you evaluate a classification model?"
        }
    ]
}

@app.get("/")
def home():
    return {"message": "Career Intelligence API is running"}

@app.get("/questions/{role}")
def get_questions(role: str):
    questions = questions_by_role.get(role)

    if questions is None:
        return {"error": "Role not found"}

    return {
        "role": role,
        "questions": questions
    }
@app.post("/submit_answers")
def submit_answers(data: AnswerSubmission):
    with engine.connect() as connection:
        connection.execute(
            text("""
                INSERT INTO interview_answers 
                (role, answer_1, answer_2, answer_3, answer_4, answer_5)
                VALUES (:role, :answer_1, :answer_2, :answer_3, :answer_4, :answer_5)
            """),
            {
                "role": data.role,
                "answer_1": data.answers[0] if len(data.answers) > 0 else "",
                "answer_2": data.answers[1] if len(data.answers) > 1 else "",
                "answer_3": data.answers[2] if len(data.answers) > 2 else "",
                "answer_4": data.answers[3] if len(data.answers) > 3 else "",
                "answer_5": data.answers[4] if len(data.answers) > 4 else "",
            }
        )
        connection.commit()

    return {"message": "Answers saved to database successfully!"}


