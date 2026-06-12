from sqlalchemy import create_engine

DATABASE_URL = "postgresql://postgres:Chma8488#@localhost:5432/ai_mock_interview"

engine = create_engine(DATABASE_URL)

from sqlalchemy import text

with engine.connect() as connection:
    result = connection.execute(text("SELECT 1"))
    print("Database connected successfully!")

    