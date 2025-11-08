"""
Routes API pour DocIngestor
"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from typing import Optional, List
import logging
from datetime import datetime

from src.services.extractor import extract_text_from_file
from src.services.metadata import extract_metadata
from src.database.repository import (
    save_document,
    get_document_by_id,
    get_all_documents,
    update_document_status
)
from src.messaging.publisher import publish_document
from config import settings

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/documents/upload", status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    document_type: str = Form(...),
    patient_id: Optional[str] = Form(None)
):
    """
    Upload et traitement d'un document médical
    
    Args:
        file: Fichier à uploader (PDF, DOCX, TXT)
        document_type: Type de document (compte-rendu, ordonnance, labo, autre)
        patient_id: ID du patient (optionnel)
    
    Returns:
        Document créé avec son ID
    """
    logger.info(f"📥 Upload de fichier: {file.filename}")
    
    # Vérifier l'extension du fichier
    file_extension = f".{file.filename.split('.')[-1].lower()}"
    if file_extension not in settings.SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Type de fichier non supporté. Extensions acceptées: {settings.SUPPORTED_EXTENSIONS}"
        )
    
    try:
        # Lire le contenu du fichier
        file_content = await file.read()
        file_size = len(file_content)
        
        # Vérifier la taille
        if file_size > settings.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"Fichier trop volumineux. Taille max: {settings.MAX_FILE_SIZE} bytes"
            )
        
        logger.info(f"📄 Extraction du texte de {file.filename} ({file_size} bytes)...")
        
        # Extraire le texte
        text_content = extract_text_from_file(file_content, file.filename)
        
        if not text_content or len(text_content.strip()) == 0:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Impossible d'extraire du texte du document"
            )
        
        logger.info(f"✅ Texte extrait: {len(text_content)} caractères")
        
        # Extraire les métadonnées
        metadata = extract_metadata(file_content, file.filename)
        metadata["patient_id"] = patient_id
        metadata["document_type"] = document_type
        metadata["upload_date"] = datetime.now().isoformat()
        
        # Sauvegarder en base de données
        document_id = save_document(
            filename=file.filename,
            file_type=file_extension,
            file_size=file_size,
            text_content=text_content,
            metadata=metadata,
            patient_id=patient_id,
            document_type=document_type
        )
        
        logger.info(f"💾 Document sauvegardé avec ID: {document_id}")
        
        # Publier vers RabbitMQ pour le service suivant (DeID)
        message = {
            "document_id": document_id,
            "filename": file.filename,
            "text_content": text_content,
            "metadata": metadata
        }
        
        publish_success = publish_document(message)
        
        if publish_success:
            logger.info(f"📨 Document {document_id} publié vers RabbitMQ")
            update_document_status(document_id, True)
        else:
            logger.warning(f"⚠️ Échec publication RabbitMQ pour document {document_id}")
        
        return {
            "success": True,
            "document_id": document_id,
            "filename": file.filename,
            "file_size": file_size,
            "text_length": len(text_content),
            "document_type": document_type,
            "patient_id": patient_id,
            "published_to_queue": publish_success
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erreur lors du traitement: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors du traitement du document: {str(e)}"
        )


@router.get("/documents")
async def list_documents(
    limit: int = 100,
    offset: int = 0,
    patient_id: Optional[str] = None,
    document_type: Optional[str] = None
):
    """
    Liste tous les documents avec filtres optionnels
    
    Args:
        limit: Nombre maximum de résultats
        offset: Décalage pour la pagination
        patient_id: Filtrer par ID patient
        document_type: Filtrer par type de document
    
    Returns:
        Liste des documents
    """
    logger.info(f"📋 Récupération de la liste des documents (limit={limit}, offset={offset})")
    
    try:
        documents = get_all_documents(limit, offset, patient_id, document_type)
        
        return {
            "success": True,
            "count": len(documents),
            "documents": documents
        }
    except Exception as e:
        logger.error(f"❌ Erreur lors de la récupération: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération des documents: {str(e)}"
        )


@router.get("/documents/{document_id}")
async def get_document(document_id: int):
    """
    Récupère les détails d'un document spécifique
    
    Args:
        document_id: ID du document
    
    Returns:
        Détails du document
    """
    logger.info(f"📄 Récupération du document {document_id}")
    
    try:
        document = get_document_by_id(document_id)
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Document {document_id} non trouvé"
            )
        
        return {
            "success": True,
            "document": document
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erreur lors de la récupération: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération du document: {str(e)}"
        )


@router.get("/stats")
async def get_statistics():
    """
    Statistiques sur les documents ingérés
    
    Returns:
        Statistiques diverses
    """
    logger.info("📊 Récupération des statistiques")
    
    try:
        all_docs = get_all_documents(limit=10000)
        
        total = len(all_docs)
        processed = sum(1 for doc in all_docs if doc.get("processed", False))
        by_type = {}
        
        for doc in all_docs:
            doc_type = doc.get("document_type", "unknown")
            by_type[doc_type] = by_type.get(doc_type, 0) + 1
        
        return {
            "success": True,
            "statistics": {
                "total_documents": total,
                "processed_documents": processed,
                "pending_documents": total - processed,
                "by_type": by_type
            }
        }
    except Exception as e:
        logger.error(f"❌ Erreur lors de la récupération des statistiques: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération des statistiques: {str(e)}"
        )
