from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import pandas as pd
import numpy as np
import pickle
import joblib
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, mean_squared_error, r2_score
from models import get_db
import os
from datetime import datetime, timedelta

model_drift_bp = Blueprint("model_drift", __name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "uploads/models")
DATASET_DIR = os.path.join(BASE_DIR, "uploads/datasets")

def load_model(model_path):
    """Load a pickled model"""
    try:
        # Try pickle first
        with open(model_path, 'rb') as f:
            return pickle.load(f)
    except:
        try:
            # Try joblib
            return joblib.load(model_path)
        except Exception as e:
            raise Exception(f"Failed to load model: {str(e)}")

def calculate_classification_metrics(y_true, y_pred):
    """Calculate classification metrics"""
    try:
        return {
            'accuracy': float(accuracy_score(y_true, y_pred)),
            'precision': float(precision_score(y_true, y_pred, average='weighted', zero_division=0)),
            'recall': float(recall_score(y_true, y_pred, average='weighted', zero_division=0)),
            'f1_score': float(f1_score(y_true, y_pred, average='weighted', zero_division=0))
        }
    except Exception as e:
        print(f"Classification metrics error: {e}")
        return None

def calculate_regression_metrics(y_true, y_pred):
    """Calculate regression metrics"""
    try:
        return {
            'mse': float(mean_squared_error(y_true, y_pred)),
            'rmse': float(np.sqrt(mean_squared_error(y_true, y_pred))),
            'r2_score': float(r2_score(y_true, y_pred)),
            'mae': float(np.mean(np.abs(y_true - y_pred)))
        }
    except Exception as e:
        print(f"Regression metrics error: {e}")
        return None

@model_drift_bp.route("/evaluate", methods=["POST"])
@jwt_required()
def evaluate_model():
    """Evaluate a model on a dataset and detect performance drift"""
    user_id = get_jwt_identity()
    data = request.json
    
    model_id = data.get('model_id')
    dataset_id = data.get('dataset_id')
    target_column = data.get('target_column')
    task_type = data.get('task_type', 'classification')
    
    if not model_id or not dataset_id or not target_column:
        return jsonify({"error": "model_id, dataset_id, and target_column are required"}), 400
    
    conn = get_db()
    cur = conn.cursor()
    
    try:
        # Get model
        cur.execute(
            "SELECT filename, path FROM uploaded_models WHERE id = %s AND user_id = %s",
            (model_id, user_id)
        )
        model_result = cur.fetchone()
        
        # Get dataset
        cur.execute(
            "SELECT filename, path FROM uploaded_datasets WHERE id = %s AND user_id = %s",
            (dataset_id, user_id)
        )
        dataset_result = cur.fetchone()
        
        if not model_result or not dataset_result:
            return jsonify({"error": "Model or dataset not found"}), 404
        
        # Load model
        model = load_model(model_result[1])
        
        # Load dataset
        df = pd.read_csv(dataset_result[1])
        
        # Check if target column exists
        if target_column not in df.columns:
            return jsonify({
                "error": f"Target column '{target_column}' not found in dataset",
                "available_columns": df.columns.tolist()
            }), 400
        
        # Prepare features and target
        X = df.drop(columns=[target_column])
        y_true = df[target_column]
        
        # Make predictions
        y_pred = model.predict(X)
        
        # Calculate metrics based on task type
        if task_type == 'classification':
            metrics = calculate_classification_metrics(y_true, y_pred)
            drift_score = 1.0 - metrics['accuracy']
        else:
            metrics = calculate_regression_metrics(y_true, y_pred)
            drift_score = metrics['rmse']
        
        # Get baseline metrics
        cur.execute(
            """
            SELECT accuracy, precision, recall, created_at 
            FROM model_metrics 
            WHERE user_id = %s 
            ORDER BY created_at DESC 
            LIMIT 1
            """,
            (user_id,)
        )
        baseline = cur.fetchone()
        
        # Calculate drift
        drift_detected = False
        drift_percentage = 0
        
        if baseline and task_type == 'classification':
            baseline_accuracy = baseline[0]
            current_accuracy = metrics['accuracy']
            drift_percentage = ((baseline_accuracy - current_accuracy) / baseline_accuracy) * 100
            drift_detected = drift_percentage > 5
        
        # Save current metrics
        if task_type == 'classification':
            cur.execute(
                """
                INSERT INTO model_metrics (model_name, accuracy, precision, recall, user_id, created_at)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (model_result[0], metrics['accuracy'], metrics['precision'], metrics['recall'], user_id, datetime.now())
            )
        
        conn.commit()
        
        return jsonify({
            "success": True,
            "model_name": model_result[0],
            "dataset_name": dataset_result[0],
            "task_type": task_type,
            "metrics": metrics,
            "drift_detected": drift_detected,
            "drift_score": float(drift_score),
            "drift_percentage": float(drift_percentage) if baseline else None,
            "baseline_metrics": {
                "accuracy": float(baseline[0]) if baseline else None,
                "precision": float(baseline[1]) if baseline else None,
                "recall": float(baseline[2]) if baseline else None,
                "timestamp": baseline[3].isoformat() if baseline else None
            } if baseline else None
        })
        
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()


@model_drift_bp.route("/history", methods=["GET"])
@jwt_required()
def get_performance_history():
    """Get model performance history"""
    user_id = get_jwt_identity()
    days = request.args.get('days', 30, type=int)
    
    conn = get_db()
    cur = conn.cursor()
    
    try:
        cur.execute(
            """
            SELECT model_name, accuracy, precision, recall, created_at
            FROM model_metrics
            WHERE user_id = %s AND created_at >= NOW() - INTERVAL '%s days'
            ORDER BY created_at ASC
            """,
            (user_id, days)
        )
        
        metrics = cur.fetchall()
        
        # Group by model
        history = {}
        for model_name, accuracy, precision, recall, created_at in metrics:
            if model_name not in history:
                history[model_name] = []
            
            history[model_name].append({
                'accuracy': float(accuracy) if accuracy else None,
                'precision': float(precision) if precision else None,
                'recall': float(recall) if recall else None,
                'timestamp': created_at.isoformat()
            })
        
        return jsonify({
            "success": True,
            "history": history
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()


@model_drift_bp.route("/compare", methods=["POST"])
@jwt_required()
def compare_models():
    """Compare performance of multiple models on same dataset"""
    user_id = get_jwt_identity()
    data = request.json
    
    model_ids = data.get('model_ids', [])
    dataset_id = data.get('dataset_id')
    target_column = data.get('target_column')
    task_type = data.get('task_type', 'classification')
    
    if not model_ids or not dataset_id or not target_column:
        return jsonify({"error": "model_ids, dataset_id, and target_column required"}), 400
    
    conn = get_db()
    cur = conn.cursor()
    
    try:
        # Get dataset
        cur.execute(
            "SELECT filename, path FROM uploaded_datasets WHERE id = %s AND user_id = %s",
            (dataset_id, user_id)
        )
        dataset_result = cur.fetchone()
        
        if not dataset_result:
            return jsonify({"error": "Dataset not found"}), 404
        
        # Load dataset once
        df = pd.read_csv(dataset_result[1])
        X = df.drop(columns=[target_column])
        y_true = df[target_column]
        
        results = []
        
        for model_id in model_ids:
            # Get model
            cur.execute(
                "SELECT filename, path FROM uploaded_models WHERE id = %s AND user_id = %s",
                (model_id, user_id)
            )
            model_result = cur.fetchone()
            
            if not model_result:
                continue
            
            try:
                # Load and evaluate model
                model = load_model(model_result[1])
                y_pred = model.predict(X)
                
                if task_type == 'classification':
                    metrics = calculate_classification_metrics(y_true, y_pred)
                else:
                    metrics = calculate_regression_metrics(y_true, y_pred)
                
                results.append({
                    'model_id': model_id,
                    'model_name': model_result[0],
                    'metrics': metrics
                })
            except Exception as e:
                results.append({
                    'model_id': model_id,
                    'model_name': model_result[0],
                    'error': str(e)
                })
        
        return jsonify({
            "success": True,
            "dataset_name": dataset_result[0],
            "comparisons": results
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()