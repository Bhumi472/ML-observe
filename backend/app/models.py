# backend/app/models.py
import psycopg2
import os
import time

def get_db():
    DATABASE_URL = os.getenv("DATABASE_URL")
    for i in range(10):
        try:
            conn = psycopg2.connect(DATABASE_URL)
            print("✅ DB Connected")
            return conn
        except Exception as e:
            print(f"⏳ Waiting for DB... ({e})")
            time.sleep(3)
    raise Exception("❌ DB connection failed")