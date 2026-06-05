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

@app.get("/")
def home():
    return {"message": "AI Career Intelligence Platform API Running"}

@app.get("/questions")
def get_questions():
    return {
        "questions": [
            "Tell me about yourself.",
            "Why are you interested in software engineering?",
            "Describe a project you are proud of.",
            "What is an API?",
            "Explain a time you solved a difficult problem."
        ]
    }