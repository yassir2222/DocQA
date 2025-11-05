"""
Configuration du microservice DocIngestor.
Gère les variables d'environnement et la configuration globale.
"""
import os
from pathlib import Path
from typing import Optional

try:
    from pydantic_settings import BaseSettings
except ImportError:
    from pydantic import BaseSettings


class Settings(BaseSettings):
    """Configuration centralisée pour DocIngestor."""
    
    # Application
    SERVICE_NAME: str = "doc_ingestor"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    API_PORT: int = 8001
    
    # Sécurité
    API_TOKEN: str = "supersecrettoken"  # DEPRECATED: Utiliser JWT
    MAX_FILE_SIZE_MB: int = 50
    ALLOWED_EXTENSIONS: list = [".pdf", ".docx", ".txt", ".xml", ".hl7"]
    
    # JWT Authentication
    JWT_SECRET_KEY: str = os.getenv(
        "JWT_SECRET_KEY",
        "CHANGE_ME_IN_PRODUCTION_USE_OPENSSL_RAND_HEX_32"
    )
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # PostgreSQL
    POSTGRES_HOST: str = "postgres"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "docqa_db"
    POSTGRES_USER: str = "docqa"
    POSTGRES_PASSWORD: str = "docqa_pwd"
    
    @property
    def POSTGRES_URL(self) -> str:
        """Construit l'URL de connexion PostgreSQL."""
        return (
            f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@"
            f"{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )
    
    # RabbitMQ
    RABBITMQ_HOST: str = "rabbitmq"
    RABBITMQ_PORT: int = 5672
    RABBITMQ_USER: str = "admin"
    RABBITMQ_PASSWORD: str = "admin"
    
    @property
    def RABBITMQ_URL(self) -> str:
        """Construit l'URL de connexion RabbitMQ."""
        return (
            f"amqp://{self.RABBITMQ_USER}:{self.RABBITMQ_PASSWORD}@"
            f"{self.RABBITMQ_HOST}:{self.RABBITMQ_PORT}/"
        )
    
    # Files d'attente RabbitMQ
    DEID_QUEUE: str = "deid_queue"
    ERROR_QUEUE: str = "error_queue"
    
    # Stockage temporaire
    TEMP_FOLDER: str = "/app/tmp"
    
    # Apache Tika
    TIKA_SERVER_URL: Optional[str] = None  # Si None, utilise le JAR local
    
    # OCR
    TESSERACT_CMD: str = "/usr/bin/tesseract"
    OCR_LANG: str = "fra+eng"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Instance unique de configuration
settings = Settings()

# Création du dossier temporaire
Path(settings.TEMP_FOLDER).mkdir(parents=True, exist_ok=True)
