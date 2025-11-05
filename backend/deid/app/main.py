"""
Application principale FastAPI pour le service DeID.
Point d'entrée du microservice de désidentification.
"""
import logging
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes import deid_routes
from app.services.deid_engine import get_deid_engine

# Configuration du logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gestion du cycle de vie de l'application."""
    # Startup
    logger.info(f"🚀 Démarrage de {settings.SERVICE_NAME} v{settings.VERSION}")
    logger.info(f"📊 Port: {settings.API_PORT}")
    logger.info(f"🧠 Modèle spaCy: {settings.SPACY_MODEL}")
    
    try:
        # Initialiser le moteur DeID (chargement spaCy + Presidio)
        logger.info("Initialisation du moteur DeID...")
        engine = get_deid_engine()
        
        if engine.is_ready():
            logger.info("✓ Moteur DeID prêt")
        else:
            logger.error("✗ Échec initialisation moteur DeID")
            raise RuntimeError("DeID Engine non initialisé")
        
        logger.info(f"✓ {settings.SERVICE_NAME} démarré avec succès")
        
    except Exception as e:
        logger.error(f"✗ Erreur au démarrage: {e}", exc_info=True)
        raise
    
    yield
    
    # Shutdown
    logger.info(f" Arrêt de {settings.SERVICE_NAME}")
    logger.info("✓ Service arrêté proprement")


# Créer l'application FastAPI
app = FastAPI(
    title="DeID Service",
    description="Microservice de désidentification de documents cliniques avec spaCy et Presidio",
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # À restreindre en production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enregistrer les routes
app.include_router(
    deid_routes.router,
    tags=["DeID"]
)

# Route racine
@app.get("/", tags=["Root"])
async def root():
    """Page d'accueil du service."""
    return {
        "service": settings.SERVICE_NAME,
        "version": settings.VERSION,
        "status": "running",
        "docs": "/docs",
        "endpoints": {
            "anonymize": "POST /deid",
            "statistics": "GET /stats",
            "evaluate": "POST /evaluate",
            "health": "GET /health"
        }
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.API_PORT,
        reload=False,
        log_level=settings.LOG_LEVEL.lower()
    )
