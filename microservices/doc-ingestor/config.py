"""
Configuration pour le microservice DocIngestor
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Configuration de l'application"""
    
    # Service
    SERVICE_NAME: str = "DocIngestor"
    SERVICE_PORT: int = 8001
    SERVICE_HOST: str = "0.0.0.0"
    DEBUG: bool = True
    
    # Database
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_NAME: str = "docqa_ingestor"
    DB_USER: str = "docqa_user"
    DB_PASSWORD: str = "docqa_password"
    
    # RabbitMQ
    RABBITMQ_HOST: str = "localhost"
    RABBITMQ_PORT: int = 5672
    RABBITMQ_USER: str = "docqa_user"
    RABBITMQ_PASSWORD: str = "docqa_password"
    RABBITMQ_QUEUE: str = "documents.raw"
    
    # File Storage
    UPLOAD_DIR: str = "./data/documents"
    TEMP_DIR: str = "./data/temp"
    MAX_FILE_SIZE: int = 50 * 1024 * 1024  # 50 MB
    
    # Supported file types
    SUPPORTED_EXTENSIONS: list = [".pdf", ".docx", ".doc", ".txt"]
    
    # OCR
    TESSERACT_CMD: Optional[str] = None  # Path to tesseract executable
    OCR_ENABLED: bool = True
    
    # Tika Server (optional, uses local if not specified)
    TIKA_SERVER_URL: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Instance globale
settings = Settings()
