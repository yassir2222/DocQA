"""
Point d'entrée principal du microservice DocIngestor.
Gère l'ingestion sécurisée de documents médicaux.
"""
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from prometheus_client import Counter, Histogram, Gauge
from prometheus_fastapi_instrumentator import Instrumentator
import uvicorn

from config import settings
from routes import upload_router
from routes.auth_routes import router as auth_router
from services.rabbitmq_service import rabbitmq_service
from services.db_service import db_service
from services.async_db_service import async_db_service
from services.async_rabbitmq_service import async_rabbitmq_service
from services.file_service import FileService
from utils.logger import get_logger, log_audit

logger = get_logger(__name__)

# Configuration Rate Limiting
limiter = Limiter(key_func=get_remote_address)

# Métriques Prometheus personnalisées
DOCUMENTS_UPLOADED = Counter(
    'doc_ingestor_documents_uploaded_total',
    'Nombre total de documents uploadés',
    ['status', 'file_type']
)

DOCUMENTS_PROCESSING_TIME = Histogram(
    'doc_ingestor_processing_seconds',
    'Temps de traitement des documents',
    ['file_type']
)

ACTIVE_UPLOADS = Gauge(
    'doc_ingestor_active_uploads',
    'Nombre d\'uploads en cours'
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Gère le cycle de vie de l'application.
    
    Startup:
    - Initialise la base de données
    - Connecte à RabbitMQ
    - Nettoie les fichiers temporaires
    
    Shutdown:
    - Déconnecte RabbitMQ
    """
    # === STARTUP ===
    logger.info(f" Démarrage de {settings.SERVICE_NAME} v{settings.VERSION}")
    
    try:
        # Initialiser les services asynchrones
        logger.info(" Initialisation des services async...")
        await async_db_service.init_db()
        logger.info(" Base de données async initialisée")
        
        await async_rabbitmq_service.connect()
        logger.info(" RabbitMQ async connecté")
        
        # Initialiser la base de données synchrone (pour compatibilité)
        logger.info(" Initialisation de la base de données...")
        db_service.init_db()
        logger.info(" Base de données initialisée")
        
        # Connecter à RabbitMQ
        logger.info(" Connexion à RabbitMQ...")
        if rabbitmq_service.connect():
            logger.info("RabbitMQ connecté")
        else:
            logger.warning("  RabbitMQ non disponible (retry automatique)")
        
        # Nettoyer les fichiers temporaires anciens
        logger.info(" Nettoyage des fichiers temporaires...")
        FileService.cleanup_temp_folder(older_than_hours=24)
        
        log_audit(
            logger,
            action="startup",
            status="success",
            details={
                "service": settings.SERVICE_NAME,
                "version": settings.VERSION
            }
        )
        
    except Exception as e:
        logger.error(f" Erreur au démarrage: {str(e)}")
        log_audit(
            logger,
            action="startup",
            status="error",
            error=str(e)
        )
        # Ne pas arrêter le service, certaines fonctionnalités peuvent marcher
    
    yield
    
    # === SHUTDOWN ===
    logger.info(f" Arrêt de {settings.SERVICE_NAME}")
    
    try:
        # Déconnecter services async
        await async_rabbitmq_service.disconnect()
        
        # Déconnecter RabbitMQ synchrone
        rabbitmq_service.disconnect()
        
        log_audit(
            logger,
            action="shutdown",
            status="success"
        )
        
    except Exception as e:
        logger.error(f"Erreur lors de l'arrêt: {str(e)}")


# Créer l'application FastAPI
app = FastAPI(
    title="DocIngestor",
    description=(
        "Microservice d'ingestion de documents médicaux pour DocQA-MS.\n\n"
        "**Fonctionnalités:**\n"
        "- Upload de documents (PDF, DOCX, TXT, XML, HL7)\n"
        "- Extraction de contenu avec Apache Tika\n"
        "- OCR pour PDF scannés (Tesseract)\n"
        "- Stockage métadonnées en PostgreSQL\n"
        "- Publication vers RabbitMQ (deid_queue)\n"
        "- Authentification par token Bearer\n\n"
        "**Sécurité:**\n"
        "- Validation MIME type\n"
        f"- Taille max: {settings.MAX_FILE_SIZE_MB}MB\n"
        "- Authentification token requise\n"
        "- Rate limiting: 10 requêtes/min par IP"
    ),
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Activer le rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Activer le monitoring Prometheus
Instrumentator().instrument(app).expose(app, endpoint="/metrics")


# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # À restreindre en production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Middleware de logging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """
    Middleware pour logger toutes les requêtes HTTP.
    
    Args:
        request: Requête HTTP
        call_next: Fonction suivante
        
    Returns:
        Réponse HTTP
    """
    import time
    
    start_time = time.time()
    
    # Traiter la requête
    response = await call_next(request)
    
    # Calculer le temps de traitement
    process_time = time.time() - start_time
    
    # Logger
    log_audit(
        logger,
        action="http_request",
        status="success" if response.status_code < 400 else "error",
        details={
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "process_time_ms": round(process_time * 1000, 2)
        }
    )
    
    return response


# Gestionnaire d'erreurs global
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Gestionnaire d'erreurs global.
    
    Args:
        request: Requête HTTP
        exc: Exception levée
        
    Returns:
        JSONResponse avec détails de l'erreur
    """
    log_audit(
        logger,
        action="exception",
        status="error",
        error=str(exc),
        details={
            "path": request.url.path,
            "method": request.method
        }
    )
    
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": str(exc) if settings.DEBUG else "Une erreur est survenue",
            "service": settings.SERVICE_NAME
        }
    )


# Enregistrer les routes
app.include_router(
    auth_router
)
app.include_router(
    upload_router,
    tags=["Documents"]
)


# Route racine
@app.get("/")
async def root():
    """
    Endpoint racine avec informations sur le service.
    
    Returns:
        Informations du service
    """
    return {
        "service": settings.SERVICE_NAME,
        "version": settings.VERSION,
        "status": "running",
        "endpoints": {
            "docs": "/docs",
            "health": "/health",
            "upload": "/upload",
            "documents": "/documents"
        },
        "config": {
            "max_file_size_mb": settings.MAX_FILE_SIZE_MB,
            "allowed_extensions": settings.ALLOWED_EXTENSIONS,
            "rabbitmq_queues": {
                "deid": settings.DEID_QUEUE,
                "error": settings.ERROR_QUEUE
            }
        }
    }


if __name__ == "__main__":
    # Lancer le serveur
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.API_PORT,
        reload=settings.DEBUG,
        log_level="info"
    )
