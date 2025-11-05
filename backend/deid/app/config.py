"""
Configuration du microservice DeID.
Gestion des paramètres d'environnement et configuration Presidio/spaCy.
"""
import os
from typing import List, Dict
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Configuration globale du service DeID."""
    
    # Service Info
    SERVICE_NAME: str = "deid"
    VERSION: str = "2.0.0"
    API_PORT: int = int(os.getenv("API_PORT", "8002"))
    
    # PostgreSQL
    POSTGRES_HOST: str = os.getenv("POSTGRES_HOST", "postgres")
    POSTGRES_PORT: int = int(os.getenv("POSTGRES_PORT", "5432"))
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "docqa_db")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "docqa")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "docqa_pwd")
    
    @property
    def POSTGRES_URL(self) -> str:
        """Construit l'URL de connexion PostgreSQL."""
        return (
            f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@"
            f"{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )
    
    @property
    def ASYNC_POSTGRES_URL(self) -> str:
        """URL PostgreSQL pour asyncpg."""
        return (
            f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@"
            f"{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )
    
    # RabbitMQ (consommation de la queue deid_queue)
    RABBITMQ_HOST: str = os.getenv("RABBITMQ_HOST", "rabbitmq")
    RABBITMQ_PORT: int = int(os.getenv("RABBITMQ_PORT", "5672"))
    RABBITMQ_USER: str = os.getenv("RABBITMQ_USER", "admin")
    RABBITMQ_PASSWORD: str = os.getenv("RABBITMQ_PASSWORD", "admin")
    DEID_QUEUE: str = "deid_queue"
    STORAGE_QUEUE: str = "storage_queue"
    
    # spaCy Configuration
    SPACY_MODEL: str = "fr_core_news_md"  # Modèle français médical
    SPACY_ENABLE_COMPONENTS: List[str] = ["tok2vec", "tagger", "parser", "ner"]
    
    # Presidio Configuration
    PRESIDIO_SUPPORTED_LANGUAGES: List[str] = ["fr", "en"]
    PRESIDIO_DEFAULT_LANGUAGE: str = "fr"
    
    # Entités PII à détecter
    PII_ENTITIES: List[str] = [
        "PERSON",           # Noms et prénoms
        "LOCATION",         # Adresses, villes
        "DATE_TIME",        # Dates de naissance, dates
        "PHONE_NUMBER",     # Téléphones
        "EMAIL_ADDRESS",    # Emails
        "IBAN_CODE",        # IBAN bancaire
        "MEDICAL_LICENSE",  # Numéro médecin
        "US_SSN",           # Numéro sécu (adapté pour NSS français)
        "FR_NIR",           # NIR (Numéro Inscription Répertoire - sécu FR)
        "IPP",              # Identifiant Patient Permanent (custom)
        "NDA",              # Numéro Dossier Administratif (custom)
    ]
    
    # Stratégie d'anonymisation
    ANONYMIZATION_STRATEGY: str = "replace"  # "replace", "mask", "hash", "redact"
    PLACEHOLDER_PREFIX: str = "<"
    PLACEHOLDER_SUFFIX: str = ">"
    
    # Placeholders personnalisés
    ENTITY_PLACEHOLDERS: Dict[str, str] = {
        "PERSON": "<NAME>",
        "LOCATION": "<LOCATION>",
        "DATE_TIME": "<DATE>",
        "PHONE_NUMBER": "<PHONE>",
        "EMAIL_ADDRESS": "<EMAIL>",
        "IBAN_CODE": "<IBAN>",
        "MEDICAL_LICENSE": "<DOCTOR_ID>",
        "US_SSN": "<SSN>",
        "FR_NIR": "<NIR>",
        "IPP": "<IPP>",
        "NDA": "<NDA>",
        "ORG": "<ORGANIZATION>",
    }
    
    # Seuils de confiance pour la détection
    MIN_CONFIDENCE_SCORE: float = 0.5  # Score minimum pour considérer une détection
    HIGH_CONFIDENCE_THRESHOLD: float = 0.85  # Seuil de haute confiance
    
    # Évaluation
    SYNTHETIC_DATASET_PATH: str = "data/synthetic_dataset.json"
    EVALUATION_METRICS: List[str] = ["precision", "recall", "f1_score"]
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_FORMAT: str = "json"  # "json" ou "text"
    
    # Performance
    MAX_TEXT_LENGTH: int = 100000  # Limite de taille de texte (100KB)
    BATCH_SIZE: int = 10  # Traitement par batch pour évaluation
    
    # Cache
    ENABLE_CACHE: bool = True
    CACHE_TTL_SECONDS: int = 3600  # 1 heure
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Instance globale
settings = Settings()
