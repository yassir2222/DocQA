-- Script d'initialisation des bases de données DocQA-MS
-- À exécuter avec : psql -U postgres -f create-databases.sql

-- Création de l'utilisateur
CREATE USER docqa_user WITH PASSWORD 'docqa_password';

-- Création des bases de données pour chaque microservice
CREATE DATABASE docqa_ingestor OWNER docqa_user;
CREATE DATABASE docqa_deid OWNER docqa_user;
CREATE DATABASE docqa_indexeur OWNER docqa_user;
CREATE DATABASE docqa_llmqa OWNER docqa_user;
CREATE DATABASE docqa_synthese OWNER docqa_user;
CREATE DATABASE docqa_audit OWNER docqa_user;

-- Accorder tous les privilèges
GRANT ALL PRIVILEGES ON DATABASE docqa_ingestor TO docqa_user;
GRANT ALL PRIVILEGES ON DATABASE docqa_deid TO docqa_user;
GRANT ALL PRIVILEGES ON DATABASE docqa_indexeur TO docqa_user;
GRANT ALL PRIVILEGES ON DATABASE docqa_llmqa TO docqa_user;
GRANT ALL PRIVILEGES ON DATABASE docqa_synthese TO docqa_user;
GRANT ALL PRIVILEGES ON DATABASE docqa_audit TO docqa_user;

-- Connexion à la base docqa_ingestor
\c docqa_ingestor;

-- Table des documents ingérés
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size BIGINT,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed BOOLEAN DEFAULT FALSE,
    text_content TEXT,
    metadata JSONB,
    patient_id VARCHAR(100),
    document_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_documents_patient_id ON documents(patient_id);
CREATE INDEX idx_documents_document_type ON documents(document_type);
CREATE INDEX idx_documents_upload_date ON documents(upload_date);

-- Connexion à la base docqa_deid
\c docqa_deid;

-- Table des mappings d'anonymisation
CREATE TABLE IF NOT EXISTS deid_mappings (
    id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL,
    original_value TEXT NOT NULL,
    anonymized_value TEXT NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_deid_document_id ON deid_mappings(document_id);

-- Table des documents anonymisés
CREATE TABLE IF NOT EXISTS deid_documents (
    id SERIAL PRIMARY KEY,
    original_document_id INTEGER NOT NULL,
    anonymized_content TEXT,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    pii_detected INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'processed'
);

-- Connexion à la base docqa_indexeur
\c docqa_indexeur;

-- Table des chunks indexés
CREATE TABLE IF NOT EXISTS indexed_chunks (
    id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL,
    chunk_index INTEGER NOT NULL,
    chunk_text TEXT NOT NULL,
    embedding_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chunks_document_id ON indexed_chunks(document_id);

-- Connexion à la base docqa_audit
\c docqa_audit;

-- Table des logs d'audit
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id VARCHAR(100),
    query_text TEXT,
    response_summary TEXT,
    documents_accessed TEXT[],
    ip_address VARCHAR(50),
    user_agent TEXT,
    status VARCHAR(50),
    response_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at);

-- Table des sessions utilisateurs
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    ip_address VARCHAR(50)
);

-- Accorder les privilèges sur les tables
\c docqa_ingestor;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO docqa_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO docqa_user;

\c docqa_deid;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO docqa_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO docqa_user;

\c docqa_indexeur;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO docqa_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO docqa_user;

\c docqa_audit;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO docqa_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO docqa_user;

-- Message de confirmation
SELECT 'Bases de données DocQA-MS créées avec succès!' AS message;
