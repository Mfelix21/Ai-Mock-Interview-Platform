import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is missing from .env")

engine = create_engine(DATABASE_URL)

try:
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
        print("Database connected successfully!")
except Exception as e:
    print("Database connection failed:", e)
    raise


    