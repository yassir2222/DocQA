"""
Modèles Pydantic pour le service DeID.
Schémas de validation des requêtes/réponses API.
"""
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, validator
from enum import Enum


class AnonymizationStrategy(str, Enum):
    """Stratégies d'anonymisation disponibles."""
    REPLACE = "replace"      # Remplace par placeholder
    MASK = "mask"            # Masque partiellement
    HASH = "hash"            # Hash cryptographique
    REDACT = "redact"        # Supprime complètement
    FAKE = "fake"            # Remplace par données synthétiques


class EntityLabel(str, Enum):
    """Types d'entités PII détectables."""
    PERSON = "PERSON"
    LOCATION = "LOCATION"
    DATE_TIME = "DATE_TIME"
    PHONE_NUMBER = "PHONE_NUMBER"
    EMAIL_ADDRESS = "EMAIL_ADDRESS"
    IBAN_CODE = "IBAN_CODE"
    MEDICAL_LICENSE = "MEDICAL_LICENSE"
    SSN = "US_SSN"
    FR_NIR = "FR_NIR"
    IPP = "IPP"
    NDA = "NDA"
    ORG = "ORG"


# ==============================================================================
# REQUEST SCHEMAS
# ==============================================================================

class DeIDRequest(BaseModel):
    """Requête de désidentification."""
    doc_id: str = Field(..., description="Identifiant unique du document")
    text: str = Field(..., min_length=1, max_length=100000, description="Texte à anonymiser")
    language: Optional[str] = Field("fr", description="Langue du document (fr/en)")
    strategy: Optional[AnonymizationStrategy] = Field(
        AnonymizationStrategy.REPLACE,
        description="Stratégie d'anonymisation"
    )
    min_confidence: Optional[float] = Field(
        0.5,
        ge=0.0,
        le=1.0,
        description="Score minimum de confiance"
    )
    
    @validator("text")
    def text_not_empty(cls, v):
        """Vérifie que le texte n'est pas vide."""
        if not v.strip():
            raise ValueError("Le texte ne peut pas être vide")
        return v.strip()
    
    class Config:
        schema_extra = {
            "example": {
                "doc_id": "CLIN_001",
                "text": "Le patient Ahmed Benali né le 10/02/1975 a consulté le Dr Laila El Amrani à Rabat.",
                "language": "fr",
                "strategy": "replace",
                "min_confidence": 0.5
            }
        }


class EvaluationRequest(BaseModel):
    """Requête d'évaluation sur dataset synthétique."""
    dataset_path: Optional[str] = Field(
        "data/synthetic_dataset.json",
        description="Chemin vers le dataset synthétique"
    )
    min_confidence: Optional[float] = Field(0.5, ge=0.0, le=1.0)
    sample_size: Optional[int] = Field(None, description="Nombre d'échantillons (None = tous)")


# ==============================================================================
# RESPONSE SCHEMAS
# ==============================================================================

class DetectedEntity(BaseModel):
    """Entité PII détectée."""
    entity: str = Field(..., description="Texte de l'entité détectée")
    label: str = Field(..., description="Type d'entité (PERSON, LOCATION, etc.)")
    start: int = Field(..., description="Position de début dans le texte")
    end: int = Field(..., description="Position de fin dans le texte")
    score: float = Field(..., ge=0.0, le=1.0, description="Score de confiance")
    placeholder: str = Field(..., description="Placeholder de remplacement")
    
    class Config:
        schema_extra = {
            "example": {
                "entity": "Ahmed Benali",
                "label": "PERSON",
                "start": 11,
                "end": 23,
                "score": 0.95,
                "placeholder": "<NAME>"
            }
        }


class DeIDResponse(BaseModel):
    """Réponse de désidentification."""
    doc_id: str
    anonymized_text: str = Field(..., description="Texte anonymisé")
    entities_detected: List[DetectedEntity] = Field(
        default_factory=list,
        description="Liste des entités détectées"
    )
    total_entities: int = Field(..., description="Nombre total d'entités détectées")
    processing_time_ms: float = Field(..., description="Temps de traitement (ms)")
    confidence_avg: float = Field(..., description="Score de confiance moyen")
    status: str = Field("success", description="Statut du traitement")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        schema_extra = {
            "example": {
                "doc_id": "CLIN_001",
                "anonymized_text": "Le patient <NAME> né le <DATE> a consulté le Dr <NAME> à <LOCATION>.",
                "entities_detected": [
                    {
                        "entity": "Ahmed Benali",
                        "label": "PERSON",
                        "start": 11,
                        "end": 23,
                        "score": 0.95,
                        "placeholder": "<NAME>"
                    }
                ],
                "total_entities": 4,
                "processing_time_ms": 125.5,
                "confidence_avg": 0.92,
                "status": "success",
                "timestamp": "2025-11-05T00:00:00Z"
            }
        }


class StatsResponse(BaseModel):
    """Statistiques du service DeID."""
    total_documents: int = Field(..., description="Nombre total de documents traités")
    total_entities_detected: int = Field(..., description="Nombre total d'entités détectées")
    avg_entities_per_doc: float = Field(..., description="Moyenne d'entités par document")
    avg_confidence: float = Field(..., description="Score de confiance moyen")
    entity_distribution: Dict[str, int] = Field(
        default_factory=dict,
        description="Distribution par type d'entité"
    )
    processing_time_avg_ms: float = Field(..., description="Temps moyen de traitement (ms)")
    uptime_seconds: float = Field(..., description="Durée d'exécution du service")
    
    class Config:
        schema_extra = {
            "example": {
                "total_documents": 150,
                "total_entities_detected": 620,
                "avg_entities_per_doc": 4.13,
                "avg_confidence": 0.87,
                "entity_distribution": {
                    "PERSON": 230,
                    "LOCATION": 120,
                    "DATE_TIME": 150,
                    "PHONE_NUMBER": 45,
                    "EMAIL_ADDRESS": 30,
                    "IPP": 45
                },
                "processing_time_avg_ms": 142.3,
                "uptime_seconds": 86400
            }
        }


class EvaluationMetrics(BaseModel):
    """Métriques d'évaluation pour un type d'entité."""
    entity_type: str
    precision: float = Field(..., ge=0.0, le=1.0)
    recall: float = Field(..., ge=0.0, le=1.0)
    f1_score: float = Field(..., ge=0.0, le=1.0)
    true_positives: int
    false_positives: int
    false_negatives: int
    support: int = Field(..., description="Nombre d'entités attendues")


class EvaluationResponse(BaseModel):
    """Résultat d'évaluation sur dataset synthétique."""
    dataset_size: int = Field(..., description="Nombre de documents évalués")
    total_expected_entities: int = Field(..., description="Nombre total d'entités attendues")
    total_detected_entities: int = Field(..., description="Nombre total d'entités détectées")
    overall_precision: float = Field(..., ge=0.0, le=1.0)
    overall_recall: float = Field(..., ge=0.0, le=1.0)
    overall_f1_score: float = Field(..., ge=0.0, le=1.0)
    metrics_by_entity: List[EvaluationMetrics] = Field(default_factory=list)
    processing_time_ms: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        schema_extra = {
            "example": {
                "dataset_size": 50,
                "total_expected_entities": 215,
                "total_detected_entities": 198,
                "overall_precision": 0.91,
                "overall_recall": 0.88,
                "overall_f1_score": 0.89,
                "metrics_by_entity": [
                    {
                        "entity_type": "PERSON",
                        "precision": 0.95,
                        "recall": 0.92,
                        "f1_score": 0.93,
                        "true_positives": 46,
                        "false_positives": 2,
                        "false_negatives": 4,
                        "support": 50
                    }
                ],
                "processing_time_ms": 3250.5,
                "timestamp": "2025-11-05T00:00:00Z"
            }
        }


class HealthResponse(BaseModel):
    """Réponse du health check."""
    status: str = Field(..., description="healthy, degraded, unhealthy")
    service: str
    version: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    dependencies: Dict[str, str] = Field(default_factory=dict)
    spacy_model_loaded: bool
    presidio_ready: bool


# ==============================================================================
# DATABASE MODELS (pour SQLAlchemy)
# ==============================================================================

class DeIDDocument(BaseModel):
    """Document anonymisé (pour stockage PostgreSQL)."""
    id: Optional[int] = None
    doc_id: str
    original_text: str
    anonymized_text: str
    entities_json: str  # JSON serialized list of DetectedEntity
    total_entities: int
    confidence_avg: float
    processing_time_ms: float
    created_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True


class EntityLog(BaseModel):
    """Log d'une entité détectée (pour analyse)."""
    id: Optional[int] = None
    doc_id: str
    entity_text: str
    entity_label: str
    start_pos: int
    end_pos: int
    confidence_score: float
    placeholder: str
    detected_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True
