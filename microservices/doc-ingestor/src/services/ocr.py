"""
Service OCR pour les documents scannés
"""
import logging
from typing import Optional
from io import BytesIO

logger = logging.getLogger(__name__)


def perform_ocr(file_content: bytes, language: str = 'fra') -> Optional[str]:
    """
    Effectue l'OCR sur un document ou une image
    
    Args:
        file_content: Contenu binaire du fichier
        language: Langue pour l'OCR (par défaut: français)
    
    Returns:
        Texte extrait via OCR ou None si erreur
    """
    try:
        import pytesseract
        from PIL import Image
        import pdf2image
        from config import settings
        
        # Configurer Tesseract
        if settings.TESSERACT_CMD:
            pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD
        
        logger.info(f"🔍 Démarrage OCR (langue: {language})...")
        
        # Essayer de convertir en images
        try:
            # Si c'est un PDF
            images = pdf2image.convert_from_bytes(
                file_content,
                dpi=300,  # Haute résolution pour meilleure qualité OCR
                fmt='jpeg'
            )
            logger.info(f"📄 PDF converti en {len(images)} images")
        except:
            # Si c'est déjà une image
            images = [Image.open(BytesIO(file_content))]
            logger.info("🖼️ Image chargée directement")
        
        # Extraire le texte de chaque image
        text_parts = []
        for i, image in enumerate(images):
            logger.info(f"🔍 OCR page/image {i+1}/{len(images)}...")
            
            # Configuration OCR pour documents médicaux
            custom_config = r'--oem 3 --psm 6'  # LSTM OCR, assume uniform text block
            
            text = pytesseract.image_to_string(
                image,
                lang=language,
                config=custom_config
            )
            
            if text.strip():
                text_parts.append(text.strip())
                logger.info(f"✅ Page {i+1}: {len(text)} caractères extraits")
        
        result = "\n\n".join(text_parts)
        logger.info(f"✅ OCR terminé: {len(result)} caractères au total")
        
        return result if result.strip() else None
        
    except ImportError as e:
        logger.error(f"❌ Dépendances OCR manquantes: {str(e)}")
        logger.error("Installez: pip install pytesseract pdf2image pillow")
        logger.error("Et téléchargez Tesseract: https://github.com/UB-Mannheim/tesseract/wiki")
        return None
    except Exception as e:
        logger.error(f"❌ Erreur OCR: {str(e)}", exc_info=True)
        return None


def check_ocr_availability() -> bool:
    """
    Vérifie si l'OCR est disponible
    
    Returns:
        True si OCR disponible, False sinon
    """
    try:
        import pytesseract
        from PIL import Image
        import pdf2image
        
        # Tester Tesseract
        pytesseract.get_tesseract_version()
        
        logger.info("✅ OCR disponible (Tesseract)")
        return True
    except:
        logger.warning("⚠️ OCR non disponible")
        return False


def enhance_image_for_ocr(image):
    """
    Améliore la qualité d'une image pour l'OCR
    
    Args:
        image: Image PIL
    
    Returns:
        Image améliorée
    """
    try:
        from PIL import ImageEnhance, ImageFilter
        
        # Conversion en niveaux de gris
        image = image.convert('L')
        
        # Augmenter le contraste
        enhancer = ImageEnhance.Contrast(image)
        image = enhancer.enhance(2.0)
        
        # Augmenter la netteté
        image = image.filter(ImageFilter.SHARPEN)
        
        return image
    except Exception as e:
        logger.warning(f"⚠️ Impossible d'améliorer l'image: {str(e)}")
        return image
