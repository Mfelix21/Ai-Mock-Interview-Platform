from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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