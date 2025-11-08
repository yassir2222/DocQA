"""
Point d'entrée principal du microservice DocIngestor
"""
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import sys
from pathlib import Path

# Ajouter le répertoire src au PYTHONPATH
sys.path.insert(0, str(Path(__file__).parent))

from config import settings
from src.api.routes import router
from src.database.repository import init_database
from src.messaging.publisher import init_rabbitmq, close_rabbitmq

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('doc-ingestor.log')
    ]
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gestion du cycle de vie de l'application"""
    # Startup
    logger.info(f"🚀 Démarrage de {settings.SERVICE_NAME}...")
    
    # Créer les répertoires nécessaires
    Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
    Path(settings.TEMP_DIR).mkdir(parents=True, exist_ok=True)
    
    # Initialiser la base de données
    try:
        init_database()
        logger.info("✅ Base de données initialisée")
    except Exception as e:
        logger.error(f"❌ Erreur initialisation base de données: {e}")
    
    # Initialiser RabbitMQ
    try:
        init_rabbitmq()
        logger.info("✅ RabbitMQ initialisé")
    except Exception as e:
        logger.error(f"❌ Erreur initialisation RabbitMQ: {e}")
    
    logger.info(f"✅ {settings.SERVICE_NAME} démarré sur http://{settings.SERVICE_HOST}:{settings.SERVICE_PORT}")
    
    yield
    
    # Shutdown
    logger.info(f"🛑 Arrêt de {settings.SERVICE_NAME}...")
    close_rabbitmq()
    logger.info("✅ Arrêt terminé")


# Créer l'application FastAPI
app = FastAPI(
    title=settings.SERVICE_NAME,
    description="Microservice d'ingestion et extraction de documents médicaux",
    version="1.0.0",
    lifespan=lifespan
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # À restreindre en production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclure les routes
app.include_router(router, prefix="/api/v1")


@app.get("/")
async def root():
    """Endpoint racine"""
    return {
        "service": settings.SERVICE_NAME,
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Endpoint de santé"""
    return {
        "status": "healthy",
        "service": settings.SERVICE_NAME
    }


if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host=settings.SERVICE_HOST,
        port=settings.SERVICE_PORT,
        reload=settings.DEBUG,
        log_level="info"
    )
