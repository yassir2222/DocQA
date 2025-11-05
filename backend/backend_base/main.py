"""
DocQA-MS - Backend Base Service
Template de microservice FastAPI réutilisable pour tous les services.
"""

import os
import logging
import json
from contextlib import asynccontextmanager
from typing import Dict, Any

from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config.settings import settings
from app.core.database import engine, Base, get_db_session
from app.core.rabbitmq import RabbitMQClient
from app.routes import health, api

# Configuration du logging avec format JSON
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)


class JSONFormatter(logging.Formatter):
    """Formateur JSON pour les logs."""
    
    def format(self, record):
        log_data = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "service": settings.SERVICE_NAME,
            "logger": record.name,
            "message": record.getMessage(),
        }
        
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        
        return json.dumps(log_data)


# Application du formateur JSON
for handler in logging.root.handlers:
    handler.setFormatter(JSONFormatter())


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Gestion du cycle de vie de l'application.
    Initialise les connexions au démarrage et les ferme à l'arrêt.
    """
    logger.info(f"Démarrage du service {settings.SERVICE_NAME}")
    
    # Initialisation de la base de données
    try:
        logger.info(" Initialisation de la base de données PostgreSQL...")
        Base.metadata.create_all(bind=engine)
        logger.info(" Base de données initialisée avec succès")
    except Exception as e:
        logger.error(f" Erreur lors de l'initialisation de la base de données: {e}")
        raise
    
    # Initialisation de RabbitMQ avec retry
    try:
        logger.info("📨 Connexion à RabbitMQ...")
        rabbitmq_client = RabbitMQClient()
        await rabbitmq_client.connect()
        app.state.rabbitmq = rabbitmq_client
        logger.info(" RabbitMQ connecté avec succès")
    except Exception as e:
        logger.error(f" Erreur lors de la connexion à RabbitMQ: {e}")
        logger.warning("  Le service continuera sans RabbitMQ (mode dégradé)")
        app.state.rabbitmq = None
    
    logger.info(f" Service {settings.SERVICE_NAME} démarré et prêt!")
    
    yield
    
    # Nettoyage lors de l'arrêt
    logger.info(f" Arrêt du service {settings.SERVICE_NAME}")
    
    if hasattr(app.state, 'rabbitmq') and app.state.rabbitmq:
        await app.state.rabbitmq.close()
        logger.info(" RabbitMQ déconnecté")
    
    logger.info(f" Service {settings.SERVICE_NAME} arrêté proprement")


# Création de l'application FastAPI
app = FastAPI(
    title=f"DocQA-MS - {settings.SERVICE_NAME}",
    description="Microservice pour la plateforme DocQA - Assistant Médical Intelligent",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Middleware de logging des requêtes
@app.middleware("http")
async def log_requests(request, call_next):
    """Log toutes les requêtes HTTP."""
    logger.info(f" {request.method} {request.url.path}")
    
    try:
        response = await call_next(request)
        logger.info(f" {request.method} {request.url.path} - Status: {response.status_code}")
        return response
    except Exception as e:
        logger.error(f" Erreur lors du traitement de la requête: {e}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Erreur interne du serveur"}
        )


# Inclusion des routes
app.include_router(health.router, tags=["Health"])
app.include_router(api.router, prefix="/api/v1", tags=["API"])


@app.get("/")
async def root() -> Dict[str, Any]:
    """Route racine de l'API."""
    return {
        "service": settings.SERVICE_NAME,
        "status": "running",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
        access_log=True,
    )
