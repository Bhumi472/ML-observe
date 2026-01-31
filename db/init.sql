CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Keep your existing tables
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