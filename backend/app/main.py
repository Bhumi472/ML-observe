from flask import Flask, jsonify
import psycopg2
import os
import time

app = Flask(__name__)

DATABASE_URL = os.getenv("DATABASE_URL")

def get_db_connection():
    for i in range(10):
        try:
            conn = psycopg2.connect(DATABASE_URL)
            print("✅ DB Connected")
            return conn
        except Exception:
            print("⏳ Waiting for DB...")
            time.sleep(3)
    raise Exception("❌ DB connection failed")

conn = get_db_connection()

@app.route("/")
def home():
    return jsonify({"status": "Flask backend running"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
