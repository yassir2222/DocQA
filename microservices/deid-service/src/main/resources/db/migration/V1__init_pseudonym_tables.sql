CREATE TABLE pseudonyms (
    id SERIAL PRIMARY KEY,
    original_text TEXT NOT NULL,
    pseudonym_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);