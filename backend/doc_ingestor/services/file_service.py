"""
Service de gestion des fichiers uploadés.
Gère la sauvegarde, validation et nettoyage des fichiers.
"""
import os
import shutil
import uuid
from pathlib import Path
from typing import Optional, Tuple
from fastapi import UploadFile, HTTPException

from config import settings
from utils.logger import get_logger, log_audit

logger = get_logger(__name__)


class FileService:
    """Service de gestion des fichiers."""
    
    @staticmethod
    def validate_file(file: UploadFile) -> Tuple[bool, Optional[str]]:
        """
        Valide le fichier uploadé.
        
        Args:
            file: Fichier uploadé
            
        Returns:
            Tuple (is_valid, error_message)
        """
        # Vérifier l'extension
        file_ext = Path(file.filename).suffix.lower()
        if file_ext not in settings.ALLOWED_EXTENSIONS:
            return False, f"Extension non autorisée: {file_ext}. Extensions autorisées: {settings.ALLOWED_EXTENSIONS}"
        
        # Vérifier le type MIME
        content_type = file.content_type or ""
        allowed_mimes = {
            ".pdf": "application/pdf",
            ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".txt": "text/plain",
            ".xml": ["application/xml", "text/xml"],
            ".hl7": ["application/hl7-v2", "text/plain", "application/octet-stream"],
        }
        
        expected_mime = allowed_mimes.get(file_ext)
        if expected_mime:
            if isinstance(expected_mime, list):
                if content_type not in expected_mime:
                    logger.warning(
                        f"Type MIME inattendu pour {file_ext}: {content_type}"
                    )
            elif not content_type.startswith(expected_mime.split("/")[0]):
                logger.warning(
                    f"Type MIME inattendu pour {file_ext}: {content_type}"
                )
        
        return True, None
    
    @staticmethod
    async def save_upload_file(
        file: UploadFile,
        max_size_mb: Optional[int] = None
    ) -> Tuple[str, str, int]:
        """
        Sauvegarde le fichier uploadé dans le dossier temporaire.
        
        Args:
            file: Fichier uploadé
            max_size_mb: Taille maximale en MB (utilise settings si None)
            
        Returns:
            Tuple (file_path, file_type, file_size)
            
        Raises:
            HTTPException: Si le fichier est trop gros ou invalide
        """
        max_size = (max_size_mb or settings.MAX_FILE_SIZE_MB) * 1024 * 1024
        
        # Validation
        is_valid, error_msg = FileService.validate_file(file)
        if not is_valid:
            log_audit(
                logger,
                action="validate_file",
                status="error",
                error=error_msg
            )
            raise HTTPException(status_code=400, detail=error_msg)
        
        # Générer un nom unique
        file_ext = Path(file.filename).suffix.lower()
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(settings.TEMP_FOLDER, unique_filename)
        
        # Sauvegarder le fichier avec gestion d'erreur améliorée
        file_size = 0
        temp_file = None
        
        try:
            # Utiliser un context manager pour garantir la fermeture
            with open(file_path, "wb") as buffer:
                temp_file = file_path
                while chunk := await file.read(8192):
                    file_size += len(chunk)
                    
                    # Vérifier la taille
                    if file_size > max_size:
                        raise HTTPException(
                            status_code=413,
                            detail=f"Fichier trop gros. Taille max: {max_size_mb}MB"
                        )
                    
                    buffer.write(chunk)
            
            log_audit(
                logger,
                action="save_file",
                status="success",
                details={"filename": file.filename, "size": file_size, "path": file_path}
            )
            
            return file_path, file_ext.lstrip("."), file_size
            
        except HTTPException:
            # Nettoyer le fichier partiel en cas d'erreur
            if temp_file and os.path.exists(temp_file):
                try:
                    os.remove(temp_file)
                except Exception as cleanup_error:
                    logger.error(f"Échec nettoyage fichier {temp_file}: {cleanup_error}")
            raise
            
        except Exception as e:
            # Nettoyer en cas d'erreur
            if temp_file and os.path.exists(temp_file):
                try:
                    os.remove(temp_file)
                except Exception as cleanup_error:
                    logger.error(f"Échec nettoyage fichier {temp_file}: {cleanup_error}")
            
            log_audit(
                logger,
                action="save_file",
                status="error",
                error=str(e)
            )
            raise HTTPException(
                status_code=500,
                detail=f"Erreur lors de la sauvegarde: {str(e)}"
            )
    
    @staticmethod
    def delete_file(file_path: str) -> bool:
        """
        Supprime un fichier temporaire.
        
        Args:
            file_path: Chemin du fichier à supprimer
            
        Returns:
            True si supprimé, False sinon
        """
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                log_audit(
                    logger,
                    action="delete_file",
                    status="success",
                    details={"path": file_path}
                )
                return True
            return False
        except Exception as e:
            log_audit(
                logger,
                action="delete_file",
                status="error",
                error=str(e)
            )
            return False
    
    @staticmethod
    def cleanup_temp_folder(older_than_hours: int = 24):
        """
        Nettoie les fichiers temporaires plus anciens que X heures.
        
        Args:
            older_than_hours: Âge minimum des fichiers à supprimer
        """
        import time
        
        now = time.time()
        cutoff = now - (older_than_hours * 3600)
        deleted_count = 0
        
        try:
            for filename in os.listdir(settings.TEMP_FOLDER):
                file_path = os.path.join(settings.TEMP_FOLDER, filename)
                
                if os.path.isfile(file_path):
                    file_age = os.path.getmtime(file_path)
                    
                    if file_age < cutoff:
                        os.remove(file_path)
                        deleted_count += 1
            
            if deleted_count > 0:
                log_audit(
                    logger,
                    action="cleanup_temp",
                    status="success",
                    details={"deleted_count": deleted_count}
                )
        except Exception as e:
            log_audit(
                logger,
                action="cleanup_temp",
                status="error",
                error=str(e)
            )
