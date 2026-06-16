from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import text
from database import engine
from auth import hash_password, verify_password
from dotenv import load_dotenv
import os
from openai import OpenAI


load_dotenv()

app = FastAPI()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class AnswerRequest(BaseModel):
    role: str
    question: str
    answer: str

@app.post("/ai-feedback")
def ai_feedback(data: AnswerRequest):
    try:

        # Safeguard
        if len(data.answer.strip()) < 20:
            return {
                "error": "Answer is too short for meaningful feedback."
            }

        prompt = f"""
        You are an expert interview coach.

        Role: {data.role}

        Question:
        {data.question}

        Answer:
        {data.answer}

        Give feedback in this format:
        1. Score out of 10
        2. Strengths
        3. Areas for improvement
        4. Example stronger answer
        """

        response = client.responses.create(
            model="gpt-4o-mini",
            input=prompt
        )

        return {
            "feedback": response.output_text
        }

    except Exception as e:
        print("AI FEEDBACK ERROR:", str(e))
        return {
            "error": "AI feedback is currently unavailable. Please try again later."
        }
    

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
    user_id: int

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str


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
    with engine.begin() as connection:
        connection.execute(
            text("""
                INSERT INTO interview_answers
                (role, answer_1, answer_2, answer_3, answer_4, answer_5, user_id)
                VALUES (:role, :answer_1, :answer_2, :answer_3, :answer_4, :answer_5, :user_id)
            """),
            {
                "role": data.role,
                "answer_1": data.answers[0] if len(data.answers) > 0 else "",
                "answer_2": data.answers[1] if len(data.answers) > 1 else "",
                "answer_3": data.answers[2] if len(data.answers) > 2 else "",
                "answer_4": data.answers[3] if len(data.answers) > 3 else "",
                "answer_5": data.answers[4] if len(data.answers) > 4 else "",
                "user_id": data.user_id,
            }
        )

    return {"message": "Answers saved successfully"}

@app.get("/answers/{user_id}")
def get_answers(user_id: int):
    with engine.connect() as connection:
        result = connection.execute(
            text("""
                SELECT id, role, answer_1, answer_2, answer_3, answer_4, answer_5, created_at
                FROM interview_answers
                WHERE user_id = :user_id
                ORDER BY created_at DESC
            """),
            {"user_id": user_id}
        )

        saved_answers = []

        for row in result:
            saved_answers.append({
                "id": row.id,
                "role": row.role,
                "answers": [
                    row.answer_1,
                    row.answer_2,
                    row.answer_3,
                    row.answer_4,
                    row.answer_5
                ],
                "created_at": str(row.created_at)
            })

    return {"saved_answers": saved_answers}
@app.post("/register")
def register(user: UserCreate):
    try:
        hashed_password = hash_password(user.password)

        query = text("""
            INSERT INTO users (username, email, password_hash)
            VALUES (:username, :email, :password_hash)
        """)

        with engine.begin() as conn:
            conn.execute(query, {
                "username": user.username,
                "email": user.email,
                "password_hash": hashed_password
            })

        return {"message": "User registered successfully"}

    except Exception as e:
        return {"error": str(e)}

@app.post("/login")
def login(user: UserLogin):
    query = text("""
        SELECT * FROM users
        WHERE email = :email
    """)

    with engine.begin() as conn:
        result = conn.execute(query, {
            "email": user.email
        }).fetchone()

    if result is None:
        return {"error": "Invalid email or password"}

    stored_hash = result.password_hash

    if not verify_password(user.password, stored_hash):
        return {"error": "Invalid email or password"}

    return {
        "message": "Login successful",
        "user_id": result.id,
        "username": result.username
    }

