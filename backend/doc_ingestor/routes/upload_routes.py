"""
Routes pour l'upload et la gestion des documents.
"""
from typing import Optional, List
from uuid import UUID
from datetime import datetime
import math

from fastapi import APIRouter, UploadFile, File, HTTPException, Query, Depends, Header, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from slowapi import Limiter
from slowapi.util import get_remote_address

from services.file_service import FileService
from services.tika_service import TikaService
from services.ocr_service import OCRService
from services.rabbitmq_service import rabbitmq_service
from services.db_service import db_service
from services.async_db_service import async_db_service
from services.async_rabbitmq_service import async_rabbitmq_service
from services.jwt_service import jwt_service, TokenData
from services.resilience_service import (
    db_circuit_breaker,
    rabbitmq_circuit_breaker,
    tika_circuit_breaker,
    retry_on_db_error,
    retry_on_rabbitmq_error
)
from config import settings
from utils.logger import get_logger, log_audit

logger = get_logger(__name__)
router = APIRouter()

# Rate limiter
limiter = Limiter(key_func=get_remote_address)


# Modèles Pydantic
class UploadResponse(BaseModel):
    """Réponse après upload."""
    document_id: str
    status: str
    message: Optional[str] = None


class DocumentResponse(BaseModel):
    """Détails d'un document."""
    document_id: str
    file_name: str
    type: str
    upload_date: str
    status: str
    file_size: Optional[int] = None
    metadata: Optional[dict] = None
    content_preview: Optional[str] = None
    error_message: Optional[str] = None


class DocumentListResponse(BaseModel):
    """Liste de documents avec pagination."""
    total: int
    page: int
    page_size: int
    documents: List[DocumentResponse]


# Middleware d'authentification JWT
async def get_current_user(authorization: Optional[str] = Header(None)) -> TokenData:
    """
    Vérifie le token JWT et retourne les données utilisateur.
    
    Args:
        authorization: Header Authorization (Bearer <JWT>)
        
    Returns:
        TokenData avec informations utilisateur
        
    Raises:
        HTTPException: Si token manquant ou invalide
    """
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Header Authorization manquant"
        )
    
    # Format: "Bearer <token>"
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=401,
            detail="Format Authorization invalide. Utilisez: Bearer <JWT>"
        )
    
    token = parts[1]
    
    # Vérifier le token JWT
    return jwt_service.verify_token(token, expected_type="access")


# DEPRECATED: Ancienne méthode avec token statique (rétrocompatibilité)
async def verify_token_legacy(authorization: Optional[str] = Header(None)) -> bool:
    """
    DEPRECATED: Vérifie le token statique (rétrocompatibilité).
    Utiliser get_current_user() pour JWT à la place.
    
    Args:
        authorization: Header Authorization
        
    Returns:
        True si valide
        
    Raises:
        HTTPException: Si token invalide
    """
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Header Authorization manquant"
        )
    
    # Format: "Bearer <token>"
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=401,
            detail="Format Authorization invalide. Utilisez: Bearer <token>"
        )
    
    token = parts[1]
    
    # Vérifier token statique (legacy)
    if token != settings.API_TOKEN:
        raise HTTPException(
            status_code=401,
            detail="Token invalide"
        )
    
    return True


@router.post("/upload", response_model=UploadResponse)
@limiter.limit("10/minute")  # Max 10 uploads par minute par IP
async def upload_document(
    request: Request,
    file: UploadFile = File(...),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Upload et traitement d'un document médical.
    
    **Authentication:** JWT Bearer token required (30 min expiry)
    
    **Rate Limit:** 10 requêtes par minute par IP
    
    **Workflow:**
    1. Valide le fichier (type, taille)
    2. Sauvegarde temporairement
    3. Extrait le contenu avec Tika
    4. OCR si PDF scanné
    5. Sauvegarde métadonnées en DB
    6. Envoie vers RabbitMQ (deid_queue)
    
    **Formats supportés:** PDF, DOCX, TXT, XML, HL7
    
    **Taille max:** {settings.MAX_FILE_SIZE_MB}MB
    
    Args:
        request: Requête HTTP (pour rate limiting)
        file: Fichier à uploader
        current_user: Données utilisateur JWT (username, service, scopes)
        
    Returns:
        UploadResponse avec document_id et status
    """
    document_id = None
    file_path = None
    
    try:
        # Log de l'utilisateur authentifié
        logger.info(
            f"Upload par utilisateur JWT: {current_user.username} "
            f"(service: {current_user.service})"
        )
        # 1. Sauvegarder le fichier
        file_path, file_type, file_size = await FileService.save_upload_file(file)
        
        logger.info(f"Fichier sauvegardé: {file.filename} ({file_size} bytes)")
        
        # 2. Créer l'enregistrement en DB (avec circuit breaker)
        document = await async_db_service.create_document(
            file_name=file.filename,
            file_type=file_type,
            file_size=file_size
        )
        
        if not document:
            raise HTTPException(
                status_code=500,
                detail="Erreur lors de la création du document en DB"
            )
        
        document_id = str(document.document_id)
        
        log_audit(
            logger,
            action="upload_start",
            document_id=document_id,
            user=current_user.username,  # Utilisateur JWT
            status="success",
            details={
                "file_name": file.filename,
                "file_size": file_size,
                "file_type": file_type,
                "service": current_user.service
            }
        )
        
        # 3. Extraire le contenu avec Tika
        extraction_result = TikaService.extract_content(file_path)
        content = extraction_result.get("content", "")
        metadata = extraction_result.get("metadata", {})
        
        # 4. OCR si PDF scanné
        if file_type == "pdf" and OCRService.is_scanned_pdf(file_path, content):
            logger.info(f"PDF scanné détecté, lancement OCR pour {document_id}")
            
            ocr_text = OCRService.extract_text_from_pdf(file_path)
            if ocr_text:
                content = ocr_text
                metadata["ocr_applied"] = True
        
        # 5. Mettre à jour le document avec les métadonnées
        document.doc_metadata = metadata
        document.content_preview = content[:500] if content else None
        
        # 6. Préparer le message pour RabbitMQ
        message_data = {
            "document_id": document_id,
            "file_name": file.filename,
            "type": file_type,
            "content": content,
            "metadata": metadata
        }
        
        # 7. Envoyer vers deid_queue (avec circuit breaker et retry)
        if await async_rabbitmq_service.send_to_deid_queue(message_data):
            # Mise à jour du statut
            await async_db_service.update_document_status(
                document.document_id,
                status="processed"
            )
            
            log_audit(
                logger,
                action="upload_complete",
                document_id=document_id,
                user=current_user.username,
                status="sent_to_queue",
                details={
                    "queue": settings.DEID_QUEUE,
                    "content_length": len(content),
                    "service": current_user.service
                }
            )
            
            return UploadResponse(
                document_id=document_id,
                status="sent_to_queue",
                message=f"Document {file.filename} traité et envoyé vers {settings.DEID_QUEUE}"
            )
        else:
            # Erreur lors de l'envoi RabbitMQ
            await async_db_service.update_document_status(
                document.document_id,
                status="error",
                error_message="Échec envoi RabbitMQ"
            )
            
            # Envoyer vers error_queue
            error_data = {
                "document_id": document_id,
                "error": "Échec envoi vers deid_queue",
                "file_name": file.filename
            }
            await async_rabbitmq_service.send_to_error_queue(error_data, document_id)
            
            raise HTTPException(
                status_code=500,
                detail="Erreur lors de l'envoi vers RabbitMQ"
            )
    
    except HTTPException:
        raise
    except Exception as e:
        # Log de l'erreur
        log_audit(
            logger,
            action="upload_error",
            document_id=document_id,
            user=current_user.username if current_user else "unknown",
            status="error",
            error=str(e)
        )
        
        # Mise à jour du statut si document créé
        if document_id:
            await async_db_service.update_document_status(
                UUID(document_id),
                status="error",
                error_message=str(e)
            )
            
            # Envoyer vers error_queue
            error_data = {
                "document_id": document_id,
                "error": str(e),
                "file_name": file.filename if file else "unknown"
            }
            await async_rabbitmq_service.send_to_error_queue(error_data, document_id)
        
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors du traitement: {str(e)}"
        )
    
    finally:
        # Nettoyer le fichier temporaire
        if file_path:
            FileService.delete_file(file_path)


@router.get("/documents", response_model=DocumentListResponse)
@limiter.limit("30/minute")  # Max 30 lectures par minute par IP
async def get_documents(
    request: Request,
    page: int = Query(1, ge=1, description="Numéro de page"),
    page_size: int = Query(20, ge=1, le=100, description="Taille de page"),
    status: Optional[str] = Query(None, description="Filtrer par statut"),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Récupère la liste des documents ingérés avec pagination.
    
    **Authentication:** JWT Bearer token required
    
    **Rate Limit:** 30 requêtes par minute par IP
    
    **Pagination:** Page commence à 1
    
    **Filtrage:** Utilisez le paramètre `status` pour filtrer (pending, processed, error)
    
    Args:
        request: Requête HTTP (pour rate limiting)
        page: Numéro de page (commence à 1)
        page_size: Nombre de documents par page (max 100)
        status: Filtrer par statut (optionnel)
        current_user: Données utilisateur JWT
        
    Returns:
        DocumentListResponse avec la liste des documents
    """
    try:
        # Calcul de l'offset
        skip = (page - 1) * page_size
        
        # Récupérer les documents
        documents = await async_db_service.get_documents(
            skip=skip,
            limit=page_size,
            status=status
        )
        
        # Récupérer le total
        total = await async_db_service.get_document_count(status=status)
        
        # Convertir en réponse
        documents_response = [
            DocumentResponse(
                document_id=str(doc.document_id),
                file_name=doc.file_name,
                type=doc.type,
                upload_date=doc.upload_date.isoformat() if doc.upload_date else "",
                status=doc.status,
                file_size=doc.file_size,
                metadata=doc.doc_metadata,
                content_preview=doc.content_preview,
                error_message=doc.error_message
            )
            for doc in documents
        ]
        
        log_audit(
            logger,
            action="list_documents",
            status="success",
            details={
                "page": page,
                "page_size": page_size,
                "total": total,
                "status_filter": status
            }
        )
        
        return DocumentListResponse(
            total=total,
            page=page,
            page_size=page_size,
            documents=documents_response
        )
    
    except Exception as e:
        log_audit(
            logger,
            action="list_documents",
            status="error",
            error=str(e)
        )
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la récupération des documents: {str(e)}"
        )


@router.get("/documents/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: UUID,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Récupère les détails d'un document spécifique.
    
    **Authentication:** JWT Bearer token required
    
    Args:
        document_id: UUID du document
        current_user: Données utilisateur JWT
        
    Returns:
        DocumentResponse avec les détails du document
    """
    try:
        document = await async_db_service.get_document(document_id)
        
        if not document:
            raise HTTPException(
                status_code=404,
                detail=f"Document {document_id} non trouvé"
            )
        
        return DocumentResponse(
            document_id=str(document.document_id),
            file_name=document.file_name,
            type=document.type,
            upload_date=document.upload_date.isoformat() if document.upload_date else "",
            status=document.status,
            file_size=document.file_size,
            metadata=document.doc_metadata,
            content_preview=document.content_preview,
            error_message=document.error_message
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la récupération: {str(e)}"
        )


@router.get("/health")
async def health_check():
    """
    Health check endpoint AVANCÉ.
    
    Vérifie:
    - État du service
    - Connexions DB, RabbitMQ
    - État des circuit breakers
    - Métriques système
    
    Returns:
        Status détaillé du service et dépendances
    """
    from services.resilience_service import get_circuit_breakers_status
    from services.async_db_service import async_db_service
    from services.async_rabbitmq_service import async_rabbitmq_service
    
    # Vérifier les dépendances
    dependencies = {
        "postgresql": "unknown",
        "rabbitmq": "unknown",
        "tika": "available"  # Tika JAR local toujours dispo
    }
    
    # Check PostgreSQL
    try:
        if async_db_service.initialized:
            dependencies["postgresql"] = "connected"
        else:
            dependencies["postgresql"] = "not_initialized"
    except Exception as e:
        dependencies["postgresql"] = f"error: {str(e)[:50]}"
    
    # Check RabbitMQ
    try:
        if async_rabbitmq_service.connected:
            dependencies["rabbitmq"] = "connected"
        else:
            dependencies["rabbitmq"] = "disconnected"
    except Exception as e:
        dependencies["rabbitmq"] = f"error: {str(e)[:50]}"
    
    # État des circuit breakers
    circuit_breakers = get_circuit_breakers_status()
    
    # Déterminer le statut global
    all_connected = all(
        status in ["connected", "available"] 
        for status in dependencies.values()
    )
    
    global_status = "ok" if all_connected else "degraded"
    
    return {
        "status": global_status,
        "service": settings.SERVICE_NAME,
        "version": settings.VERSION,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "dependencies": dependencies,
        "circuit_breakers": {
            name: {
                "state": str(cb["state"]),
                "fail_counter": cb["fail_counter"],
                "fail_max": cb["fail_max"]
            }
            for name, cb in circuit_breakers.items()
        }
    }
