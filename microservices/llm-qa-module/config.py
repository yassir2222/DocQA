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
    
    # Ollama Configuration - Mistral Nemo 12B Instruct
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "mistral-nemo"  # Mistral Nemo 12B Instruct
    USE_LOCAL_LLM: bool = True
    
    # LLM Parameters for Mistral Nemo
    LLM_TEMPERATURE: float = 0.1  # Low for factual responses
    LLM_TOP_P: float = 0.9
    LLM_TOP_K: int = 40
    LLM_NUM_CTX: int = 8192  # Mistral Nemo supports 128k but 8k is enough for RAG
    LLM_REPEAT_PENALTY: float = 1.1
    
    # IndexeurSemantique Service
    INDEXEUR_SERVICE_URL: str = "http://localhost:8003"
    
    # Audit Logger Service
    AUDIT_SERVICE_URL: str = "http://localhost:8006"
    
    # RAG Configuration
    VECTOR_STORE_PATH: str = "./data/vector_store"
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    
    # RAG Query Settings
    RAG_TOP_K_RESULTS: int = 5  # Number of documents to retrieve
    RAG_CHUNK_SIZE: int = 512  # Size of text chunks
    RAG_CHUNK_OVERLAP: int = 50  # Overlap between chunks
    RAG_SIMILARITY_THRESHOLD: float = 0.3  # Minimum similarity score
    MAX_CONTEXT_LENGTH: int = 6000  # Max context for Mistral Nemo
    
    # Reranking (optional)
    USE_RERANKING: bool = True
    RERANK_TOP_K: int = 3  # Final number of documents after reranking
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
