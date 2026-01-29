CREATE TABLE IF NOT EXISTS model_metrics (
    id SERIAL PRIMARY KEY,
    model_name VARCHAR(100),
    accuracy FLOAT,
    precision FLOAT,
    recall FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS drift_logs (
    id SERIAL PRIMARY KEY,
    feature_name VARCHAR(100),
    drift_score FLOAT,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
