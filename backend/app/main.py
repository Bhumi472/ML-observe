from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
import psycopg2
import time
import os
import sys

# Get the current directory
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

# Now import auth blueprint and config
try:
    # First try absolute import (for when running as module)
    from auth import auth_bp
    from config import Config
except ImportError:
    # Try relative import as fallback
    try:
        from .auth import auth_bp
        from .config import Config
    except ImportError as e:
        print(f"Import Error: {e}")
        print(f"Current directory: {current_dir}")
        print(f"Files in directory: {os.listdir(current_dir)}")
        raise

app = Flask(__name__)

# Apply configuration
app.config.from_object(Config)

# Configure CORS with origins from config
cors_origins = app.config.get('CORS_ORIGINS', ['http://localhost:3000'])
if isinstance(cors_origins, str):
    cors_origins = cors_origins.split(',')
CORS(app, origins=cors_origins)

# JWT Manager
jwt = JWTManager(app)

# Register auth blueprint
app.register_blueprint(auth_bp, url_prefix="/auth")

# ======================
# DB CONNECTION
# ======================
def get_db_connection():
    for i in range(10):
        try:
            conn = psycopg2.connect(app.config['DATABASE_URL'])
            print("✅ DB Connected")
            return conn
        except Exception as e:
            print(f"⏳ Waiting for DB... ({e})")
            time.sleep(3)
    raise Exception("❌ DB connection failed")

conn = get_db_connection()

# ======================
# HEALTH CHECK
# ======================
@app.route("/")
def home():
    return jsonify({"status": "Flask backend running"})

# ======================
# PROTECTED ROUTE EXAMPLE
# ======================
@app.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200

# ======================
# HEALTH CHECK FOR DATABASE
# ======================
@app.route("/health", methods=["GET"])
def health_check():
    try:
        cur = conn.cursor()
        cur.execute("SELECT 1")
        cur.close()
        return jsonify({
            "status": "healthy",
            "database": "connected",
            "service": "mlobserve-backend"
        }), 200
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }), 500

# ======================
# TEST AUTH ENDPOINTS
# ======================
@app.route("/test-db", methods=["GET"])
def test_db():
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        """)
        tables = cur.fetchall()
        cur.close()
        return jsonify({"tables": [table[0] for table in tables]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ======================
# APP START
# ======================
if __name__ == "__main__":
    print("Starting Flask server...")
    print(f"CORS Origins: {cors_origins}")
    print(f"Database URL: {app.config.get('DATABASE_URL', 'Not set')}")
    app.run(host="0.0.0.0", port=8000, debug=True)