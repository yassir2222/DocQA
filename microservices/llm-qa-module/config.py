"""
Configuration pour le microservice LLMQAModule
Utilise Mistral Nemo 12B Instruct avec RAG
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Configuration de l'application"""
    
    # Service
    SERVICE_NAME: str = "LLMQAModule"
    SERVICE_PORT: int = 8004
    SERVICE_HOST: str = "0.0.0.0"
    DEBUG: bool = True
    
    # Database
    DB_HOST: str = "localhost"
    DB_PORT: int = 5433
    DB_NAME: str = "docqa_llmqa"
    DB_USER: str = "docqa_user"
    DB_PASSWORD: str = "docqa_password"
    
    # RabbitMQ
    RABBITMQ_HOST: str = "localhost"
    RABBITMQ_PORT: int = 5672
    RABBITMQ_USER: str = "docqa_user"
    RABBITMQ_PASSWORD: str = "docqa_password"
    
    # OpenAI Configuration (fallback)
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-3.5-turbo"
    
    # Ollama Configuration - Llama 3.1 8B
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.1:latest"  # Llama 3.1 8B (4.9GB - memory efficient)
    USE_LOCAL_LLM: bool = True
    
    # LLM Parameters for Mistral Nemo - Optimized for Medical Q&A
    LLM_TEMPERATURE: float = 0.05  # Very low for precise medical responses
    LLM_TOP_P: float = 0.85  # Slightly lower for more focused responses
    LLM_TOP_K: int = 30  # Reduced for more deterministic output
    LLM_NUM_CTX: int = 16384  # Larger context for better document understanding
    LLM_REPEAT_PENALTY: float = 1.15  # Slightly higher to avoid repetition
    
    # IndexeurSemantique Service
    INDEXEUR_SERVICE_URL: str = "http://localhost:8003"
    
    # Audit Logger Service
    AUDIT_SERVICE_URL: str = "http://localhost:8006"
    
    # RAG Configuration
    VECTOR_STORE_PATH: str = "./data/vector_store"
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    
    # RAG Query Settings - Optimized for Medical Documents
    RAG_TOP_K_RESULTS: int = 10  # Increased to retrieve more candidates
    RAG_CHUNK_SIZE: int = 1024  # Larger chunks for better context
    RAG_CHUNK_OVERLAP: int = 150  # More overlap to avoid cutting important info
    RAG_SIMILARITY_THRESHOLD: float = 0.15  # Very low threshold to include more docs
    MAX_CONTEXT_LENGTH: int = 14000  # Larger context with 16k context window
    
    # Reranking (optional)
    USE_RERANKING: bool = True
    RERANK_TOP_K: int = 5  # Increased for better coverage after reranking
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
