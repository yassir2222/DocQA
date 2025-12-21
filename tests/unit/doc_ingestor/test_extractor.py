"""
Tests unitaires pour doc-ingestor/src/services/extractor.py
Importe et teste le vrai code source pour la couverture
"""
import pytest
import sys
import os

# Ajouter le chemin du microservice au path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..', 'microservices', 'doc-ingestor'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..', 'microservices', 'doc-ingestor', 'src'))


class TestExtractTextFromTxt:
    """Tests pour extract_text_from_txt"""
    
    def test_extract_text_from_txt_import(self):
        """Test que extract_text_from_txt peut être importé"""
        from services.extractor import extract_text_from_txt
        assert extract_text_from_txt is not None
    
    def test_extract_utf8(self):
        """Test extraction texte UTF-8"""
        from services.extractor import extract_text_from_txt
        content = "Bonjour le monde".encode('utf-8')
        result = extract_text_from_txt(content)
        assert result == "Bonjour le monde"
    
    def test_extract_latin1(self):
        """Test extraction texte Latin-1"""
        from services.extractor import extract_text_from_txt
        content = "Café résumé".encode('latin-1')
        result = extract_text_from_txt(content)
        assert "Caf" in result
    
    def test_extract_with_accents(self):
        """Test extraction texte avec accents"""
        from services.extractor import extract_text_from_txt
        content = "Déjà vu à Noël".encode('utf-8')
        result = extract_text_from_txt(content)
        assert "Déjà" in result
    
    def test_extract_empty_file(self):
        """Test extraction fichier vide"""
        from services.extractor import extract_text_from_txt
        result = extract_text_from_txt(b"")
        assert result == ""
    
    def test_extract_multiline(self):
        """Test extraction fichier multiligne"""
        from services.extractor import extract_text_from_txt
        content = "Ligne 1\nLigne 2\nLigne 3".encode('utf-8')
        result = extract_text_from_txt(content)
        assert "Ligne 1" in result
        assert "Ligne 2" in result
        assert "Ligne 3" in result


class TestExtractTextFromFile:
    """Tests pour extract_text_from_file"""
    
    def test_extract_text_from_file_import(self):
        """Test que extract_text_from_file peut être importé"""
        from services.extractor import extract_text_from_file
        assert extract_text_from_file is not None
    
    def test_extract_txt_file(self):
        """Test extraction d'un fichier TXT"""
        from services.extractor import extract_text_from_file
        content = b"Test content"
        result = extract_text_from_file(content, "test.txt")
        assert result == "Test content"
    
    def test_extract_txt_uppercase_extension(self):
        """Test extraction avec extension en majuscules"""
        from services.extractor import extract_text_from_file
        content = b"Test content"
        result = extract_text_from_file(content, "test.TXT")
        assert result == "Test content"
    
    def test_unsupported_extension(self):
        """Test que les extensions non supportées lèvent une erreur"""
        from services.extractor import extract_text_from_file
        content = b"Some content"
        with pytest.raises(ValueError) as excinfo:
            extract_text_from_file(content, "file.xyz")
        assert "non supporté" in str(excinfo.value).lower()


class TestExtractTextFromPdf:
    """Tests pour extract_text_from_pdf"""
    
    def test_extract_text_from_pdf_import(self):
        """Test que extract_text_from_pdf peut être importé"""
        from services.extractor import extract_text_from_pdf
        assert extract_text_from_pdf is not None


class TestExtractTextFromDocx:
    """Tests pour extract_text_from_docx"""
    
    def test_extract_text_from_docx_import(self):
        """Test que extract_text_from_docx peut être importé"""
        from services.extractor import extract_text_from_docx
        assert extract_text_from_docx is not None


class TestExtractTextWithOcr:
    """Tests pour extract_text_with_ocr"""
    
    def test_extract_text_with_ocr_import(self):
        """Test que extract_text_with_ocr peut être importé"""
        from services.extractor import extract_text_with_ocr
        assert extract_text_with_ocr is not None
    
    def test_ocr_with_invalid_content(self):
        """Test OCR avec contenu invalide"""
        from services.extractor import extract_text_with_ocr
        # Devrait retourner chaîne vide sans planter
        result = extract_text_with_ocr(b"not an image")
        assert isinstance(result, str)


class TestExtractTextWithTika:
    """Tests pour extract_text_with_tika"""
    
    def test_extract_text_with_tika_import(self):
        """Test que extract_text_with_tika peut être importé"""
        from services.extractor import extract_text_with_tika
        assert extract_text_with_tika is not None
    
    def test_tika_returns_none_or_string(self):
        """Test que Tika retourne None ou une chaîne"""
        from services.extractor import extract_text_with_tika
        result = extract_text_with_tika(b"some content")
        assert result is None or isinstance(result, str)
