"""
Point d'entrée principal du microservice LLMQAModule
Service de Questions/Réponses avec LLM pour documents médicaux
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

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('logs/llm-qa-module.log')
    ]
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gestion du cycle de vie de l'application"""
    # Startup
    logger.info(f"[START] Demarrage de {settings.SERVICE_NAME}...")
    
    # Créer les répertoires nécessaires
    Path("logs").mkdir(parents=True, exist_ok=True)
    Path(settings.VECTOR_STORE_PATH).mkdir(parents=True, exist_ok=True)
    
    # Initialiser la base de données
    try:
        init_database()
        logger.info("[OK] Base de donnees initialisee")
    except Exception as e:
        logger.error(f"[ERREUR] Erreur initialisation base de donnees: {e}")
    
    logger.info(f"[OK] {settings.SERVICE_NAME} demarre sur http://{settings.SERVICE_HOST}:{settings.SERVICE_PORT}")
    
    if settings.USE_LOCAL_LLM:
        logger.info(f"[LLM] Utilisation de LLM local: {settings.OLLAMA_MODEL}")
    else:
        logger.info(f"[LLM] Utilisation d'OpenAI: {settings.OPENAI_MODEL}")
    
    yield
    
    # Shutdown
    logger.info(f"[STOP] Arret de {settings.SERVICE_NAME}...")
    logger.info("[OK] Arret termine")


# Créer l'application FastAPI
app = FastAPI(
    title=settings.SERVICE_NAME,
    description="""
    Microservice de Questions/Réponses avec LLM pour documents médicaux.
    
    Fonctionnalités:
    - Réponses en langage naturel basées sur les documents indexés
    - Extraction d'informations médicales (pathologies, traitements, antécédents)
    - Recherche sémantique avec contexte
    - Traçabilité des requêtes (audit)
    """,
    version="1.0.0",
    lifespan=lifespan
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclure les routes
app.include_router(router, prefix="/api/qa")


@app.get("/")
async def root():
    """Endpoint racine"""
    return {
        "service": settings.SERVICE_NAME,
        "version": "1.0.0",
        "status": "running",
        "llm_mode": "local" if settings.USE_LOCAL_LLM else "openai",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Vérification de l'état de santé du service"""
    return {
        "status": "healthy",
        "service": settings.SERVICE_NAME,
        "database": "connected",
        "llm": "ready"
    }


if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host=settings.SERVICE_HOST,
        port=settings.SERVICE_PORT,
        reload=settings.DEBUG
    )
