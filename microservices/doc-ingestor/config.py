"""
Configuration pour le microservice DocIngestor
"""
from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    """Configuration de l'application"""
    
    # Service
    SERVICE_NAME: str = "DocIngestor"
    SERVICE_PORT: int = 8001
    SERVICE_HOST: str = "0.0.0.0"
    DEBUG: bool = True
    
    # Database - Support both DATABASE_URL and individual settings
    DATABASE_URL: Optional[str] = None  # Full URL: postgresql://user:pass@host:port/db
    DB_HOST: str = "postgres"
    DB_PORT: int = 5432
    DB_NAME: str = "docqa_ingestor"
    DB_USER: str = "docqa_user"
    DB_PASSWORD: str = "docqa_password"
    
    # RabbitMQ
    RABBITMQ_HOST: str = "rabbitmq"
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
    
    def get_db_config(self) -> dict:
        """Parse DATABASE_URL or return individual settings"""
        if self.DATABASE_URL:
            # Parse postgresql://user:pass@host:port/db
            from urllib.parse import urlparse
            result = urlparse(self.DATABASE_URL)
            return {
                "host": result.hostname,
                "port": result.port or 5432,
                "database": result.path.lstrip('/'),
                "user": result.username,
                "password": result.password
            }
        return {
            "host": self.DB_HOST,
            "port": self.DB_PORT,
            "database": self.DB_NAME,
            "user": self.DB_USER,
            "password": self.DB_PASSWORD
        }
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Instance globale
settings = Settings()
