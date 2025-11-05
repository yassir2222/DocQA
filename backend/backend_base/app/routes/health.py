"""
Routes de santé et monitoring du service.
"""

import logging
from typing import Dict, Any
from fastapi import APIRouter, status
from datetime import datetime

from app.core.database import check_db_connection
from app.config.settings import settings

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/health", status_code=status.HTTP_200_OK)
async def health_check() -> Dict[str, Any]:
    """
    Endpoint de santé du service.
    Vérifie que le service est opérationnel.
    
    Returns:
        Dict contenant le statut du service
    """
    return {
        "status": "ok",
        "service": settings.SERVICE_NAME,
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }


@router.get("/health/ready", status_code=status.HTTP_200_OK)
async def readiness_check() -> Dict[str, Any]:
    """
    Endpoint de readiness.
    Vérifie que le service est prêt à recevoir du trafic.
    
    Returns:
        Dict contenant le statut de readiness
    """
    db_status = check_db_connection()
    
    ready = db_status
    
    return {
        "ready": ready,
        "service": settings.SERVICE_NAME,
        "checks": {
            "database": "ok" if db_status else "error",
        },
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/health/live", status_code=status.HTTP_200_OK)
async def liveness_check() -> Dict[str, Any]:
    """
    Endpoint de liveness.
    Vérifie que le service est vivant (pour Kubernetes).
    
    Returns:
        Dict contenant le statut de liveness
    """
    return {
        "alive": True,
        "service": settings.SERVICE_NAME,
        "timestamp": datetime.utcnow().isoformat()
    }
