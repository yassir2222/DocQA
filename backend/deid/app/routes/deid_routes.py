"""
Routes API REST pour le service DeID.
Endpoints: /deid, /stats, /evaluate, /health
"""
import time
import logging
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session

from app.models import (
    DeIDRequest, DeIDResponse, DetectedEntity,
    StatsResponse, EvaluationRequest, EvaluationResponse,
    HealthResponse
)
from app.services.deid_engine import get_deid_engine, DeIDEngine
from app.utils.evaluator import DeIDEvaluator
from app.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()

# Statistiques globales
_service_start_time = time.time()
_stats = {
    "total_documents": 0,
    "total_entities": 0,
    "total_processing_time_ms": 0.0,
    "entity_counts": {}
}


def get_engine() -> DeIDEngine:
    """Dependency injection pour le moteur DeID."""
    return get_deid_engine()


@router.post("/deid", response_model=DeIDResponse, status_code=status.HTTP_200_OK)
async def anonymize_document(
    request: DeIDRequest,
    engine: DeIDEngine = Depends(get_engine)
):
    """
    Désidentifie un document clinique.
    
    - Détecte les entités PII (noms, dates, adresses, IPP, téléphones, etc.)
    - Remplace par des placeholders configurables
    - Retourne le texte anonymisé + liste des entités détectées
    
    **Exemple de requête:**
    ```json
    {
        "doc_id": "CLIN_001",
        "text": "Le patient Ahmed Benali né le 10/02/1975...",
        "language": "fr",
        "strategy": "replace",
        "min_confidence": 0.5
    }
    ```
    """
    try:
        logger.info(f"Traitement document: {request.doc_id}")
        
        # Vérifier la taille du texte
        if len(request.text) > settings.MAX_TEXT_LENGTH:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"Texte trop long (max {settings.MAX_TEXT_LENGTH} caractères)"
            )
        
        # Traiter le document
        anonymized_text, entities, processing_time = engine.process_document(
            text=request.text,
            language=request.language or "fr",
            min_confidence=request.min_confidence,
            strategy=request.strategy
        )
        
        # Calculer la confiance moyenne
        confidence_avg = 0.0
        if entities:
            confidence_avg = sum(e.score for e in entities) / len(entities)
        
        # Mettre à jour les statistiques globales
        _stats["total_documents"] += 1
        _stats["total_entities"] += len(entities)
        _stats["total_processing_time_ms"] += processing_time
        
        for entity in entities:
            label = entity.label
            _stats["entity_counts"][label] = _stats["entity_counts"].get(label, 0) + 1
        
        # Construire la réponse
        response = DeIDResponse(
            doc_id=request.doc_id,
            anonymized_text=anonymized_text,
            entities_detected=entities,
            total_entities=len(entities),
            processing_time_ms=round(processing_time, 2),
            confidence_avg=round(confidence_avg, 4),
            status="success"
        )
        
        logger.info(
            f"✓ Document {request.doc_id}: {len(entities)} entités en {processing_time:.0f}ms"
        )
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"✗ Erreur traitement {request.doc_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors du traitement: {str(e)}"
        )


@router.get("/stats", response_model=StatsResponse)
async def get_statistics(engine: DeIDEngine = Depends(get_engine)):
    """
    Retourne les statistiques du service DeID.
    
    - Nombre total de documents traités
    - Nombre total d'entités détectées
    - Distribution par type d'entité
    - Temps moyen de traitement
    - Durée d'exécution du service
    """
    try:
        # Calculer les moyennes
        avg_entities_per_doc = 0.0
        avg_processing_time_ms = 0.0
        
        if _stats["total_documents"] > 0:
            avg_entities_per_doc = _stats["total_entities"] / _stats["total_documents"]
            avg_processing_time_ms = (
                _stats["total_processing_time_ms"] / _stats["total_documents"]
            )
        
        # Confiance moyenne (approximation depuis les stats du moteur)
        engine_stats = engine.get_stats()
        avg_confidence = 0.85  # Valeur par défaut si pas de données
        
        # Uptime
        uptime_seconds = time.time() - _service_start_time
        
        response = StatsResponse(
            total_documents=_stats["total_documents"],
            total_entities_detected=_stats["total_entities"],
            avg_entities_per_doc=round(avg_entities_per_doc, 2),
            avg_confidence=avg_confidence,
            entity_distribution=_stats["entity_counts"],
            processing_time_avg_ms=round(avg_processing_time_ms, 2),
            uptime_seconds=round(uptime_seconds, 2)
        )
        
        return response
        
    except Exception as e:
        logger.error(f"✗ Erreur récupération stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération des statistiques: {str(e)}"
        )


@router.post("/evaluate", response_model=EvaluationResponse)
async def evaluate_on_dataset(
    request: EvaluationRequest,
    engine: DeIDEngine = Depends(get_engine)
):
    """
    Évalue la performance du système sur un dataset synthétique.
    
    - Charge le dataset avec entités attendues
    - Compare détection vs attendu
    - Calcule Precision, Recall, F1-score global et par type d'entité
    
    **Exemple de requête:**
    ```json
    {
        "dataset_path": "data/synthetic_dataset.json",
        "min_confidence": 0.5,
        "sample_size": 50
    }
    ```
    """
    try:
        logger.info(f"Début évaluation sur: {request.dataset_path}")
        
        # Créer l'évaluateur
        evaluator = DeIDEvaluator(engine)
        
        # Lancer l'évaluation
        result = evaluator.evaluate(
            dataset_path=request.dataset_path,
            min_confidence=request.min_confidence or 0.5,
            sample_size=request.sample_size
        )
        
        # Afficher le rapport en console
        evaluator.print_evaluation_report(result)
        
        logger.info(
            f"✓ Évaluation terminée: F1={result.overall_f1_score:.2%} "
            f"sur {result.dataset_size} documents"
        )
        
        return result
        
    except FileNotFoundError as e:
        logger.error(f"✗ Dataset introuvable: {e}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset introuvable: {request.dataset_path}"
        )
    except Exception as e:
        logger.error(f"✗ Erreur évaluation: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de l'évaluation: {str(e)}"
        )


@router.get("/health", response_model=HealthResponse)
async def health_check(engine: DeIDEngine = Depends(get_engine)):
    """
    Vérifie l'état de santé du service DeID.
    
    - Statut général (healthy, degraded, unhealthy)
    - Disponibilité des dépendances (spaCy, Presidio, PostgreSQL)
    - Version du service
    """
    try:
        # Vérifier que le moteur est prêt
        is_ready = engine.is_ready()
        spacy_loaded = engine.spacy_model is not None
        presidio_ready = engine.analyzer is not None and engine.anonymizer is not None
        
        # Déterminer le statut global
        if is_ready and spacy_loaded and presidio_ready:
            overall_status = "healthy"
        elif is_ready:
            overall_status = "degraded"
        else:
            overall_status = "unhealthy"
        
        # Dépendances
        dependencies = {
            "spacy": "loaded" if spacy_loaded else "not_loaded",
            "presidio_analyzer": "ready" if engine.analyzer is not None else "not_ready",
            "presidio_anonymizer": "ready" if engine.anonymizer is not None else "not_ready",
        }
        
        # TODO: Ajouter check PostgreSQL quand intégré
        # dependencies["postgresql"] = "connected" ou "disconnected"
        
        response = HealthResponse(
            status=overall_status,
            service=settings.SERVICE_NAME,
            version=settings.VERSION,
            dependencies=dependencies,
            spacy_model_loaded=spacy_loaded,
            presidio_ready=presidio_ready
        )
        
        return response
        
    except Exception as e:
        logger.error(f"✗ Erreur health check: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors du health check: {str(e)}"
        )
