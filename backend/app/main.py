# main.py
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
import psycopg2
import time
import os
import sys
from datetime import datetime

# Get the current directory
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

print("=" * 60)
print("STARTING FLASK SERVER - DEBUG MODE")
print(f"Current directory: {current_dir}")
print(f"Files in directory: {os.listdir(current_dir)}")
print("=" * 60)

# First, import what we know works
from auth import auth_bp
from config import Config

app = Flask(__name__)

# Apply configuration
app.config.from_object(Config)

print("\n" + "=" * 60)
print("CONFIGURATION VALUES:")
print(f"DATABASE_URL: {app.config.get('DATABASE_URL')}")
print(f"SECRET_KEY exists: {'Yes' if app.config.get('SECRET_KEY') else 'No'}")
print(f"JWT_SECRET_KEY exists: {'Yes' if app.config.get('JWT_SECRET_KEY') else 'No'}")
print(f"CORS_ORIGINS: {app.config.get('CORS_ORIGINS')}")
print("=" * 60 + "\n")

# ADD UPLOAD FOLDER CONFIGURATION
app.config['UPLOAD_FOLDER'] = os.path.join(current_dir, 'uploads')
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 500MB max file size

# Configure CORS with origins from config
cors_origins = app.config.get('CORS_ORIGINS', ['http://localhost:3000'])
if isinstance(cors_origins, str):
    cors_origins = cors_origins.split(',')
CORS(app, origins=cors_origins)

# JWT Manager
jwt = JWTManager(app)

# Register auth blueprint
app.register_blueprint(auth_bp, url_prefix="/auth")
print("✓ Registered auth blueprint")

# ======================
# DATABASE CONNECTION
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

try:
    conn = get_db_connection()
except Exception as e:
    print(f"⚠️ Database connection failed: {e}")
    conn = None

# ======================
# TEMPORARY DATABASE SETUP ENDPOINTS
# ======================
@app.route("/api/models", methods=["GET"])
def get_models():
    try:
        if not conn:
            return jsonify({"success": True, "models": []})
        
        cur = conn.cursor()
        cur.execute("SELECT * FROM ml_models ORDER BY uploaded_at DESC")
        rows = cur.fetchall()
        cur.close()
        
        models = []
        for row in rows:
            models.append({
                "id": row[0],
                "name": row[1],
                "description": row[2] or "",
                "framework": row[3] or "unknown",
                "version": row[4] or "1.0.0",
                "accuracy": float(row[5]) if row[5] else 0.0,
                "file_size": row[6] or 0,
                "status": row[7] or "inactive",
                "uploaded_by": row[8] or "unknown",
                "uploaded_at": row[9].isoformat() if row[9] else datetime.now().isoformat(),
                "last_updated": row[10].isoformat() if row[10] else datetime.now().isoformat(),
                "versions": 1
            })
        
        return jsonify({
            "success": True,
            "models": models
        })
    except Exception as e:
        print(f"Error fetching models: {e}")
        return jsonify({
            "success": True,
            "models": []  # Return empty array on error
        })

@app.route("/api/datasets", methods=["GET"])
def get_datasets():
    try:
        if not conn:
            return jsonify({"success": True, "datasets": []})
        
        cur = conn.cursor()
        cur.execute("SELECT * FROM datasets ORDER BY uploaded_at DESC")
        rows = cur.fetchall()
        cur.close()
        
        datasets = []
        for row in rows:
            datasets.append({
                "id": row[0],
                "name": row[1],
                "description": row[2] or "",
                "file_path": row[3] or "",
                "file_size": row[4] or 0,
                "rows_count": row[5] or 0,
                "columns_count": row[6] or 0,
                "data_type": row[7] or "unknown",
                "uploaded_by": row[8] or "unknown",
                "uploaded_at": row[9].isoformat() if row[9] else datetime.now().isoformat()
            })
        
        return jsonify({
            "success": True,
            "datasets": datasets
        })
    except Exception as e:
        print(f"Error fetching datasets: {e}")
        return jsonify({
            "success": True,
            "datasets": []  # Return empty array on error
        })

# ======================
# HEALTH CHECK
# ======================
@app.route("/")
def home():
    return jsonify({"status": "Flask backend running", "message": "Visit /health for status"})

@app.route("/health", methods=["GET"])
def health_check():
    try:
        if conn:
            cur = conn.cursor()
            cur.execute("SELECT 1")
            cur.close()
            db_status = "connected"
        else:
            db_status = "no_connection"
            
        return jsonify({
            "status": "healthy",
            "database": db_status,
            "service": "mlobserve-backend",
            "endpoints": {
                "/api/models": "GET models list",
                "/api/datasets": "GET datasets list",
                "/health": "Health check"
            }
        }), 200
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }), 500

# ======================
# TRY TO IMPORT MODELS_API
# ======================
try:
    print("\nAttempting to import models_api...")
    from models_api import models_bp
    print("✓ Successfully imported models_api")
    
    # Register the blueprint - these will override the temporary routes above
    app.register_blueprint(models_bp, url_prefix="/api")
    print("✓ Registered models blueprint with /api prefix")
    
    # Debug endpoint to show which routes are active
    @app.route("/api/debug/routes", methods=["GET"])
    def debug_routes():
        routes = []
        for rule in app.url_map.iter_rules():
            if rule.rule.startswith('/api'):
                routes.append({
                    "route": rule.rule,
                    "endpoint": rule.endpoint,
                    "methods": list(rule.methods)
                })
        return jsonify({"routes": routes})
    
except ImportError as e:
    print(f"✗ Could not import models_api: {e}")
    print("Using simple database routes instead")

# ======================
# DEBUG ENDPOINT - List all routes
# ======================
@app.route("/debug/routes", methods=["GET"])
def list_all_routes():
    routes = []
    for rule in app.url_map.iter_rules():
        routes.append({
            "route": rule.rule,
            "endpoint": rule.endpoint,
            "methods": list(rule.methods)
        })
    return jsonify({"routes": routes})

# ======================
# APP START
# ======================
if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("REGISTERED ROUTES:")
    for rule in app.url_map.iter_rules():
        if rule.rule.startswith('/api'):
            print(f"  {rule.rule} -> {rule.endpoint}")
    print("=" * 60 + "\n")
    
    print(f"CORS Origins: {cors_origins}")
    print(f"Database URL: {app.config.get('DATABASE_URL', 'Not set')}")
    print("Server starting on http://localhost:8000")
    print("\nTest these endpoints:")
    print("  http://localhost:8000/health")
    print("  http://localhost:8000/api/models")
    print("  http://localhost:8000/api/datasets")
    print("  http://localhost:8000/debug/routes")
    
    app.run(host="0.0.0.0", port=8000, debug=True)