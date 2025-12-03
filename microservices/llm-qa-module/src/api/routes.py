"""
Routes API pour LLMQAModule
"""
from fastapi import APIRouter, HTTPException, status, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Optional, List
import logging
from datetime import datetime
import httpx

from src.services.qa_service import QAService
from src.services.context_service import ContextService
from src.services.audit_client import AuditClient
from config import settings

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialiser les services
qa_service = QAService()
context_service = ContextService()
audit_client = AuditClient()


class QuestionRequest(BaseModel):
    """Requête de question"""
    question: str = Field(..., description="Question en langage naturel")
    patient_id: Optional[str] = Field(None, description="ID du patient (filtrage)")
    document_type: Optional[str] = Field(None, description="Type de document (filtrage)")
    max_context_docs: int = Field(5, description="Nombre max de documents contexte")
    user_id: Optional[str] = Field(None, description="ID de l'utilisateur pour audit")


class QuestionResponse(BaseModel):
    """Réponse à une question"""
    answer: str
    confidence: float
    sources: List[dict]
    processing_time_ms: int
    query_id: str


class ExtractionRequest(BaseModel):
    """Requête d'extraction d'informations"""
    document_id: str = Field(..., description="ID du document")
    extraction_type: str = Field(..., description="Type: pathologies, traitements, antecedents")
    user_id: Optional[str] = Field(None, description="ID utilisateur pour audit")


@router.post("/ask", response_model=QuestionResponse)
async def ask_question(request: QuestionRequest, background_tasks: BackgroundTasks):
    """
    Pose une question en langage naturel sur les documents médicaux
    
    Le système recherche les documents pertinents et génère une réponse
    contextualisée avec les sources.
    """
    start_time = datetime.now()
    
    try:
        logger.info(f"[QA] Question recue: {request.question[:100]}...")
        
        # 1. Rechercher les documents pertinents
        context_docs = await context_service.search_relevant_documents(
            query=request.question,
            patient_id=request.patient_id,
            document_type=request.document_type,
            limit=request.max_context_docs
        )
        
        if not context_docs:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Aucun document pertinent trouvé pour cette question"
            )
        
        logger.info(f"[QA] {len(context_docs)} documents trouves comme contexte")
        
        # 2. Générer la réponse avec le LLM
        answer, confidence, query_id = await qa_service.answer_question(
            question=request.question,
            context_documents=context_docs
        )
        
        # 3. Préparer les sources
        sources = [
            {
                "document_id": doc.get("id"),
                "filename": doc.get("filename"),
                "relevance_score": doc.get("score", 0),
                "excerpt": doc.get("content", "")[:200] + "..."
            }
            for doc in context_docs
        ]
        
        # Calculer le temps de traitement
        processing_time = int((datetime.now() - start_time).total_seconds() * 1000)
        
        # 4. Audit en arrière-plan
        background_tasks.add_task(
            audit_client.log_query,
            user_id=request.user_id,
            question=request.question,
            answer=answer,
            documents_accessed=[s["document_id"] for s in sources],
            processing_time=processing_time
        )
        
        logger.info(f"[OK] Reponse generee en {processing_time}ms")
        
        return QuestionResponse(
            answer=answer,
            confidence=confidence,
            sources=sources,
            processing_time_ms=processing_time,
            query_id=query_id
        )
        
    except HTTPException:
        raise
    except httpx.ConnectError as e:
        logger.error(f"[ERREUR] Ollama non disponible: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Le service LLM (Ollama) n'est pas disponible. Veuillez vérifier que Ollama est démarré et que le modèle mistral-nemo est installé."
        )
    except Exception as e:
        logger.error(f"[ERREUR] Erreur lors du traitement: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors du traitement de la question: {str(e)}"
        )


@router.post("/extract")
async def extract_information(request: ExtractionRequest, background_tasks: BackgroundTasks):
    """
    Extrait des informations structurées d'un document
    
    Types d'extraction supportés:
    - pathologies: Maladies et diagnostics
    - traitements: Médicaments et thérapies
    - antecedents: Historique médical
    """
    try:
        logger.info(f"🔍 Extraction {request.extraction_type} pour document {request.document_id}")
        
        # Récupérer le document
        document = await context_service.get_document_by_id(request.document_id)
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Document {request.document_id} non trouvé"
            )
        
        # Extraire les informations
        extracted = await qa_service.extract_medical_info(
            document_content=document.get("content", ""),
            extraction_type=request.extraction_type
        )
        
        # Audit
        background_tasks.add_task(
            audit_client.log_extraction,
            user_id=request.user_id,
            document_id=request.document_id,
            extraction_type=request.extraction_type
        )
        
        return {
            "success": True,
            "document_id": request.document_id,
            "extraction_type": request.extraction_type,
            "data": extracted
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[ERREUR] Erreur extraction: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de l'extraction: {str(e)}"
        )


@router.get("/documents/search")
async def search_documents(
    query: str,
    patient_id: Optional[str] = None,
    limit: int = 10
):
    """
    Recherche semantique de documents
    """
    try:
        results = await context_service.search_relevant_documents(
            query=query,
            patient_id=patient_id,
            limit=limit
        )
        
        return {
            "success": True,
            "query": query,
            "count": len(results),
            "documents": results
        }
        
    except Exception as e:
        logger.error(f"[ERREUR] Erreur recherche: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la recherche: {str(e)}"
        )


@router.get("/history/{session_id}")
async def get_chat_history(session_id: str):
    """
    Recupere l'historique d'une session de chat
    """
    # Pour l'instant, retourne un historique vide
    # A implementer avec une vraie persistance
    return {
        "success": True,
        "session_id": session_id,
        "messages": []
    }


@router.get("/stats")
async def get_statistics():
    """
    Statistiques du service QA
    """
    return {
        "success": True,
        "service": settings.SERVICE_NAME,
        "llm_mode": "local" if settings.USE_LOCAL_LLM else "openai",
        "model": settings.OLLAMA_MODEL if settings.USE_LOCAL_LLM else settings.OPENAI_MODEL,
        "embedding_model": settings.EMBEDDING_MODEL
    }
