"""
Routes API principales du service.
"""

import logging
from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db_session
from app.config.settings import settings

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/info")
async def get_service_info() -> Dict[str, Any]:
    """
    Retourne les informations sur le service.
    
    Returns:
        Dict contenant les informations du service
    """
    return {
        "service": settings.SERVICE_NAME,
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "api": "/api/v1"
        }
    }


@router.get("/status")
async def get_status(db: Session = Depends(get_db_session)) -> Dict[str, Any]:
    """
    Retourne le statut détaillé du service.
    
    Args:
        db: Session de base de données
        
    Returns:
        Dict contenant le statut complet
    """
    try:
        # Test de connexion DB
        db.execute("SELECT 1")
        db_status = "connected"
    except Exception as e:
        logger.error(f"Erreur DB: {e}")
        db_status = "error"
    
    return {
        "service": settings.SERVICE_NAME,
        "status": "running",
        "database": db_status,
        "configuration": {
            "log_level": settings.LOG_LEVEL,
            "debug": settings.DEBUG,
            "environment": settings.ENVIRONMENT
        }
    }


# Exemple d'endpoint pour les futures fonctionnalités
@router.post("/example")
async def example_endpoint(
    data: Dict[str, Any],
    db: Session = Depends(get_db_session)
) -> Dict[str, Any]:
    """
    Endpoint d'exemple pour démontrer la structure.
    À remplacer par les vraies fonctionnalités du service.
    
    Args:
        data: Données d'entrée
        db: Session de base de données
        
    Returns:
        Résultat de l'opération
    """
    logger.info(f"Données reçues: {data}")
    
    return {
        "message": "Données reçues avec succès",
        "service": settings.SERVICE_NAME,
        "received": data
    }
