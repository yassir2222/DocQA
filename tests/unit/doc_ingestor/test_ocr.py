"""
Tests unitaires pour doc-ingestor/src/services/ocr.py
Utilise des mocks pour les dépendances externes
"""
import pytest
from unittest.mock import Mock, patch, MagicMock
import sys
import os

# Ajouter le chemin du microservice au path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..', 'microservices', 'doc-ingestor'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..', 'microservices', 'doc-ingestor', 'src'))


class TestOcrFunctions:
    """Tests pour les fonctions OCR"""
    
    def test_perform_ocr_import(self):
        """Test que perform_ocr peut être importé"""
        from services.ocr import perform_ocr
        assert perform_ocr is not None
    
    def test_check_ocr_availability_import(self):
        """Test que check_ocr_availability peut être importé"""
        from services.ocr import check_ocr_availability
        assert check_ocr_availability is not None
    
    def test_enhance_image_for_ocr_import(self):
        """Test que enhance_image_for_ocr peut être importé"""
        from services.ocr import enhance_image_for_ocr
        assert enhance_image_for_ocr is not None


class TestCheckOcrAvailability:
    """Tests pour check_ocr_availability"""
    
    def test_check_ocr_returns_boolean(self):
        """Test que check_ocr_availability retourne un booléen"""
        from services.ocr import check_ocr_availability
        result = check_ocr_availability()
        assert isinstance(result, bool)


class TestPerformOcr:
    """Tests pour perform_ocr"""
    
    def test_perform_ocr_with_empty_content(self):
        """Test OCR avec contenu vide"""
        from services.ocr import perform_ocr
        result = perform_ocr(b"")
        # Devrait retourner None ou une chaîne vide sans planter
        assert result is None or isinstance(result, str)
    
    def test_perform_ocr_with_invalid_content(self):
        """Test OCR avec contenu invalide"""
        from services.ocr import perform_ocr
        result = perform_ocr(b"not an image or pdf")
        # Devrait retourner None sans planter
        assert result is None or isinstance(result, str)
    
    def test_perform_ocr_default_language(self):
        """Test OCR avec langue par défaut"""
        from services.ocr import perform_ocr
        # Test que la fonction accepte la langue par défaut
        result = perform_ocr(b"test", language='fra')
        assert result is None or isinstance(result, str)
    
    def test_perform_ocr_different_language(self):
        """Test OCR avec langue différente"""
        from services.ocr import perform_ocr
        result = perform_ocr(b"test", language='eng')
        assert result is None or isinstance(result, str)


class TestEnhanceImageForOcr:
    """Tests pour enhance_image_for_ocr"""
    
    def test_enhance_with_mock_image(self):
        """Test amélioration avec image mockée"""
        from services.ocr import enhance_image_for_ocr
        
        # Créer un mock d'image PIL
        mock_image = MagicMock()
        mock_image.convert.return_value = mock_image
        
        result = enhance_image_for_ocr(mock_image)
        # Devrait retourner l'image (ou une version améliorée)
        assert result is not None
    
    def test_enhance_returns_image(self):
        """Test que enhance retourne une image"""
        from services.ocr import enhance_image_for_ocr
        
        mock_image = MagicMock()
        mock_image.convert.return_value = mock_image
        
        result = enhance_image_for_ocr(mock_image)
        assert result is not None
