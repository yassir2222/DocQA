"""
Service OCR pour les PDF scannés.
Utilise Tesseract pour extraire le texte des images.
"""
import os
from typing import Optional
from pathlib import Path

from config import settings
from utils.logger import get_logger, log_audit

logger = get_logger(__name__)


class OCRService:
    """Service OCR avec Tesseract."""
    
    @staticmethod
    def is_scanned_pdf(file_path: str, content: str) -> bool:
        """
        Détecte si un PDF est scanné (contient peu de texte).
        
        Args:
            file_path: Chemin du fichier PDF
            content: Contenu texte extrait par Tika
            
        Returns:
            True si le PDF semble scanné
        """
        # Critère simple: si moins de 100 caractères extraits
        # alors probablement un PDF scanné
        return len(content.strip()) < 100
    
    @staticmethod
    def extract_text_from_pdf(file_path: str) -> Optional[str]:
        """
        Extrait le texte d'un PDF scanné avec OCR.
        
        Args:
            file_path: Chemin du fichier PDF
            
        Returns:
            Texte extrait ou None en cas d'erreur
        """
        try:
            import pytesseract
            from pdf2image import convert_from_path
            
            # Configurer Tesseract
            if settings.TESSERACT_CMD:
                pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD
            
            # Convertir PDF en images
            images = convert_from_path(file_path)
            
            # Extraire le texte de chaque page
            all_text = []
            for i, image in enumerate(images):
                logger.info(f"OCR page {i+1}/{len(images)}")
                
                text = pytesseract.image_to_string(
                    image,
                    lang=settings.OCR_LANG
                )
                all_text.append(text)
            
            full_text = "\n\n".join(all_text)
            
            log_audit(
                logger,
                action="ocr_extract",
                status="success",
                details={
                    "file": Path(file_path).name,
                    "pages": len(images),
                    "text_length": len(full_text)
                }
            )
            
            return full_text
            
        except ImportError as e:
            logger.error(
                f"Dépendances OCR manquantes: {str(e)}. "
                "Installez: pip install pytesseract pdf2image"
            )
            return None
        except Exception as e:
            log_audit(
                logger,
                action="ocr_extract",
                status="error",
                error=str(e)
            )
            return None
    
    @staticmethod
    def extract_text_from_image(image_path: str) -> Optional[str]:
        """
        Extrait le texte d'une image avec OCR.
        
        Args:
            image_path: Chemin de l'image
            
        Returns:
            Texte extrait ou None en cas d'erreur
        """
        try:
            import pytesseract
            from PIL import Image
            
            # Configurer Tesseract
            if settings.TESSERACT_CMD:
                pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD
            
            # Ouvrir l'image
            image = Image.open(image_path)
            
            # Extraire le texte
            text = pytesseract.image_to_string(image, lang=settings.OCR_LANG)
            
            log_audit(
                logger,
                action="ocr_image",
                status="success",
                details={
                    "file": Path(image_path).name,
                    "text_length": len(text)
                }
            )
            
            return text
            
        except ImportError:
            logger.error("pytesseract ou PIL non installé")
            return None
        except Exception as e:
            log_audit(
                logger,
                action="ocr_image",
                status="error",
                error=str(e)
            )
            return None
