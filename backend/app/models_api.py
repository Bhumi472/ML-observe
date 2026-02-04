# models_api.py
from flask import Blueprint, request, jsonify, current_app
import os
import uuid
import psycopg2
from werkzeug.utils import secure_filename
from datetime import datetime
import json

models_bp = Blueprint('models', __name__)

ALLOWED_MODEL_EXTENSIONS = {'pkl', 'joblib', 'h5', 'onnx', 'pt', 'pth', 'model', 'sav'}
ALLOWED_DATA_EXTENSIONS = {'csv', 'json', 'parquet', 'feather', 'hdf5', 'xlsx'}

def allowed_file(filename, file_type='model'):
    if file_type == 'model':
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_MODEL_EXTENSIONS
    else:  # dataset
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_DATA_EXTENSIONS

def get_db():
    import psycopg2
    return psycopg2.connect(current_app.config['DATABASE_URL'])

# ======================
# MODEL MANAGEMENT API
# ======================

@models_bp.route('/models/upload', methods=['POST'])
def upload_model():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename, 'model'):
            return jsonify({'error': f'File type not allowed. Allowed: {", ".join(ALLOWED_MODEL_EXTENSIONS)}'}), 400
        
        # Get form data
        name = request.form.get('name', file.filename)
        framework = request.form.get('framework', 'unknown')
        description = request.form.get('description', '')
        uploaded_by = request.form.get('uploaded_by', 'anonymous')
        
        # Generate unique filename
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4().hex}_{filename}"
        
        # Create upload directory if not exists
        upload_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'models')
        os.makedirs(upload_dir, exist_ok=True)
        
        # Save file
        file_path = os.path.join(upload_dir, unique_filename)
        file.save(file_path)
        
        # Get file size
        file_size = os.path.getsize(file_path)
        
        # Save to database
        conn = get_db()
        cur = conn.cursor()
        
        cur.execute("""
            INSERT INTO ml_models 
            (name, description, framework, file_path, file_size, uploaded_by)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id, name, framework, uploaded_at
        """, (name, description, framework, file_path, file_size, uploaded_by))
        
        result = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Model uploaded successfully',
            'model': {
                'id': result[0],
                'name': result[1],
                'framework': result[2],
                'uploaded_at': result[3].isoformat()
            }
        }), 201
        
    except Exception as e:
        print(f"Upload error: {e}")
        return jsonify({'error': str(e)}), 500

@models_bp.route('/datasets/upload', methods=['POST'])
def upload_dataset():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename, 'dataset'):
            return jsonify({'error': f'File type not allowed. Allowed: {", ".join(ALLOWED_DATA_EXTENSIONS)}'}), 400
        
        # Get form data
        name = request.form.get('name', file.filename)
        description = request.form.get('description', '')
        uploaded_by = request.form.get('uploaded_by', 'anonymous')
        
        # Generate unique filename
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4().hex}_{filename}"
        
        # Create upload directory if not exists
        upload_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'datasets')
        os.makedirs(upload_dir, exist_ok=True)
        
        # Save file
        file_path = os.path.join(upload_dir, unique_filename)
        file.save(file_path)
        
        # Get file size
        file_size = os.path.getsize(file_path)
        
        # Basic file info
        rows_count = 0
        columns_count = 0
        data_type = file.filename.rsplit('.', 1)[1].lower()
        
        # Save to database
        conn = get_db()
        cur = conn.cursor()
        
        cur.execute("""
            INSERT INTO datasets 
            (name, description, file_path, file_size, rows_count, columns_count, data_type, uploaded_by)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id, name, uploaded_at
        """, (name, description, file_path, file_size, rows_count, columns_count, data_type, uploaded_by))
        
        result = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Dataset uploaded successfully',
            'dataset': {
                'id': result[0],
                'name': result[1],
                'uploaded_at': result[2].isoformat()
            }
        }), 201
        
    except Exception as e:
        print(f"Upload error: {e}")
        return jsonify({'error': str(e)}), 500

@models_bp.route('/models', methods=['GET'])
def get_models():
    try:
        conn = get_db()
        cur = conn.cursor()
        
        cur.execute("""
            SELECT 
                id, name, description, framework, version, 
                accuracy, file_size, status, uploaded_by,
                uploaded_at, last_updated
            FROM ml_models
            ORDER BY uploaded_at DESC
        """)
        
        models = []
        rows = cur.fetchall()
        
        if rows:  # Only process if there are results
            for row in rows:
                models.append({
                    'id': row[0],
                    'name': row[1],
                    'description': row[2] or '',
                    'framework': row[3] or 'unknown',
                    'version': row[4] or '1.0.0',
                    'accuracy': float(row[5]) if row[5] else 0.0,
                    'file_size': row[6] or 0,
                    'status': row[7] or 'inactive',
                    'uploaded_by': row[8],
                    'uploaded_at': row[9].isoformat() if row[9] else datetime.now().isoformat(),
                    'last_updated': row[10].isoformat() if row[10] else datetime.now().isoformat(),
                    'versions': 1
                })
        
        cur.close()
        conn.close()
        
        return jsonify({'success': True, 'models': models})
        
    except Exception as e:
        print(f"Get models error: {e}")
        return jsonify({'success': True, 'models': []}), 200  # Return empty array

@models_bp.route('/models/<int:model_id>', methods=['DELETE'])
def delete_model(model_id):
    try:
        conn = get_db()
        cur = conn.cursor()
        
        # First get file path to delete file
        cur.execute("SELECT file_path FROM ml_models WHERE id = %s", (model_id,))
        result = cur.fetchone()
        
        if not result:
            cur.close()
            conn.close()
            return jsonify({'error': 'Model not found'}), 404
        
        file_path = result[0]
        
        # Delete from database
        cur.execute("DELETE FROM ml_models WHERE id = %s", (model_id,))
        
        # Delete file
        if os.path.exists(file_path):
            os.remove(file_path)
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({'success': True, 'message': 'Model deleted successfully'})
        
    except Exception as e:
        conn.rollback()
        print(f"Delete error: {e}")
        return jsonify({'error': str(e)}), 500

# ======================
# EDIT MODEL/DATASET ENDPOINTS
# ======================

@models_bp.route('/models/<int:model_id>', methods=['PUT'])
def update_model(model_id):
    try:
        data = request.json
        name = data.get('name')
        description = data.get('description')
        framework = data.get('framework')
        
        if not name:
            return jsonify({'error': 'Name is required'}), 400
        
        conn = get_db()
        cur = conn.cursor()
        
        # Check if model exists
        cur.execute("SELECT id FROM ml_models WHERE id = %s", (model_id,))
        if not cur.fetchone():
            cur.close()
            conn.close()
            return jsonify({'error': 'Model not found'}), 404
        
        # Update model
        cur.execute("""
            UPDATE ml_models 
            SET name = %s, description = %s, framework = %s, last_updated = NOW()
            WHERE id = %s
            RETURNING id, name, framework, description
        """, (name, description, framework, model_id))
        
        result = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({
            'success': True, 
            'message': 'Model updated successfully',
            'model': {
                'id': result[0],
                'name': result[1],
                'framework': result[2],
                'description': result[3]
            }
        })
        
    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
        print(f"Update error: {e}")
        return jsonify({'error': str(e)}), 500

@models_bp.route('/datasets/<int:dataset_id>', methods=['PUT'])
def update_dataset(dataset_id):
    try:
        data = request.json
        name = data.get('name')
        description = data.get('description')
        
        if not name:
            return jsonify({'error': 'Name is required'}), 400
        
        conn = get_db()
        cur = conn.cursor()
        
        # Check if dataset exists
        cur.execute("SELECT id FROM datasets WHERE id = %s", (dataset_id,))
        if not cur.fetchone():
            cur.close()
            conn.close()
            return jsonify({'error': 'Dataset not found'}), 404
        
        # Update dataset
        cur.execute("""
            UPDATE datasets 
            SET name = %s, description = %s
            WHERE id = %s
            RETURNING id, name, description
        """, (name, description, dataset_id))
        
        result = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({
            'success': True, 
            'message': 'Dataset updated successfully',
            'dataset': {
                'id': result[0],
                'name': result[1],
                'description': result[2]
            }
        })
        
    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
        print(f"Update dataset error: {e}")
        return jsonify({'error': str(e)}), 500

# ======================
# DATASET MANAGEMENT API
# ======================

@models_bp.route('/datasets', methods=['GET'])
def get_datasets():
    try:
        conn = get_db()
        cur = conn.cursor()
        
        cur.execute("""
            SELECT 
                id, name, description, file_path, file_size,
                rows_count, columns_count, data_type, uploaded_by, uploaded_at
            FROM datasets
            ORDER BY uploaded_at DESC
        """)
        
        datasets = []
        rows = cur.fetchall()
        
        if rows:  # Only process if there are results
            for row in rows:
                datasets.append({
                    'id': row[0],
                    'name': row[1],
                    'description': row[2] or '',
                    'file_path': row[3],
                    'file_size': row[4] or 0,
                    'rows_count': row[5] or 0,
                    'columns_count': row[6] or 0,
                    'data_type': row[7] or 'unknown',
                    'uploaded_by': row[8],
                    'uploaded_at': row[9].isoformat() if row[9] else datetime.now().isoformat()
                })
        
        cur.close()
        conn.close()
        
        return jsonify({'success': True, 'datasets': datasets})
        
    except Exception as e:
        print(f"Get datasets error: {e}")
        return jsonify({'success': True, 'datasets': []}), 200  # Return empty array

@models_bp.route('/datasets/<int:dataset_id>', methods=['DELETE'])
def delete_dataset(dataset_id):
    try:
        conn = get_db()
        cur = conn.cursor()
        
        # First get file path to delete file
        cur.execute("SELECT file_path FROM datasets WHERE id = %s", (dataset_id,))
        result = cur.fetchone()
        
        if not result:
            cur.close()
            conn.close()
            return jsonify({'error': 'Dataset not found'}), 404
        
        file_path = result[0]
        
        # Delete from database
        cur.execute("DELETE FROM datasets WHERE id = %s", (dataset_id,))
        
        # Delete file
        if os.path.exists(file_path):
            os.remove(file_path)
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({'success': True, 'message': 'Dataset deleted successfully'})
        
    except Exception as e:
        conn.rollback()
        print(f"Delete dataset error: {e}")
        return jsonify({'error': str(e)}), 500

@models_bp.route('/models/<int:model_id>/metrics', methods=['POST'])
def update_model_metrics(model_id):
    try:
        data = request.json
        accuracy = data.get('accuracy')
        precision = data.get('precision')
        recall = data.get('recall')
        f1_score = data.get('f1_score')
        
        conn = get_db()
        cur = conn.cursor()
        
        # Insert into metrics history
        cur.execute("""
            INSERT INTO model_metrics_history 
            (model_id, accuracy, precision, recall, f1_score)
            VALUES (%s, %s, %s, %s, %s)
        """, (model_id, accuracy, precision, recall, f1_score))
        
        # Update main model accuracy if provided
        if accuracy is not None:
            cur.execute("""
                UPDATE ml_models 
                SET accuracy = %s, last_updated = NOW()
                WHERE id = %s
            """, (accuracy, model_id))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({'success': True, 'message': 'Metrics updated successfully'})
        
    except Exception as e:
        conn.rollback()
        print(f"Metrics update error: {e}")
        return jsonify({'error': str(e)}), 500