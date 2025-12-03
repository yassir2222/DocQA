"""
Configuration de l'API Gateway
"""
import os
from dataclasses import dataclass


@dataclass
class Settings:
    # Gateway settings
    HOST: str = os.getenv("GATEWAY_HOST", "0.0.0.0")
    PORT: int = int(os.getenv("GATEWAY_PORT", "8000"))
    
    # Microservices URLs (compatible with docker-compose environment)
    DOC_INGESTOR_URL: str = os.getenv("DOC_INGESTOR_URL", "http://localhost:8001")
    DEID_SERVICE_URL: str = os.getenv("DEID_SERVICE_URL", "http://localhost:8002")
    INDEXEUR_URL: str = os.getenv("INDEXEUR_SERVICE_URL", os.getenv("INDEXEUR_URL", "http://localhost:8003"))
    LLM_QA_URL: str = os.getenv("LLM_QA_MODULE_URL", os.getenv("LLM_QA_URL", "http://localhost:8004"))
    SYNTHESE_URL: str = os.getenv("SYNTHESE_SERVICE_URL", os.getenv("SYNTHESE_URL", "http://localhost:8005"))
    AUDIT_URL: str = os.getenv("AUDIT_SERVICE_URL", os.getenv("AUDIT_URL", "http://localhost:8006"))
    
    
    # Rate limiting
    RATE_LIMIT_REQUESTS: int = int(os.getenv("RATE_LIMIT_REQUESTS", "100"))
    RATE_LIMIT_WINDOW: int = int(os.getenv("RATE_LIMIT_WINDOW", "60"))


settings = Settings()
