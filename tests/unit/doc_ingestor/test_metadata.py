"""
Tests unitaires pour doc-ingestor/src/services/metadata.py
Importe et teste le vrai code source pour la couverture
"""
import pytest
import sys
import os

# Ajouter le chemin du microservice au path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..', 'microservices', 'doc-ingestor'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..', 'microservices', 'doc-ingestor', 'src'))


class TestCalculateChecksum:
    """Tests pour la fonction calculate_checksum"""
    
    def test_checksum_import(self):
        """Test que calculate_checksum peut être importé"""
        from services.metadata import calculate_checksum
        assert calculate_checksum is not None
    
    def test_checksum_basic(self):
        """Test calcul checksum basique"""
        from services.metadata import calculate_checksum
        content = b"Hello World"
        checksum = calculate_checksum(content)
        assert checksum is not None
        assert len(checksum) == 64  # SHA-256 produit 64 caractères hex
    
    def test_checksum_empty(self):
        """Test checksum sur contenu vide"""
        from services.metadata import calculate_checksum
        checksum = calculate_checksum(b"")
        assert checksum is not None
        assert len(checksum) == 64
    
    def test_checksum_deterministic(self):
        """Test que le checksum est déterministe"""
        from services.metadata import calculate_checksum
        content = b"Test content"
        checksum1 = calculate_checksum(content)
        checksum2 = calculate_checksum(content)
        assert checksum1 == checksum2
    
    def test_checksum_different_content(self):
        """Test que des contenus différents produisent des checksums différents"""
        from services.metadata import calculate_checksum
        checksum1 = calculate_checksum(b"Content 1")
        checksum2 = calculate_checksum(b"Content 2")
        assert checksum1 != checksum2


class TestParsePdfDate:
    """Tests pour la fonction parse_pdf_date"""
    
    def test_parse_pdf_date_import(self):
        """Test que parse_pdf_date peut être importé"""
        from services.metadata import parse_pdf_date
        assert parse_pdf_date is not None
    
    def test_parse_valid_date(self):
        """Test parsing d'une date PDF valide"""
        from services.metadata import parse_pdf_date
        result = parse_pdf_date("D:20230115143000")
        assert result is not None
        assert "2023" in result
        assert "01" in result
        assert "15" in result
    
    def test_parse_invalid_format(self):
        """Test parsing d'un format invalide"""
        from services.metadata import parse_pdf_date
        result = parse_pdf_date("invalid")
        assert result is None
    
    def test_parse_short_date(self):
        """Test parsing d'une date courte"""
        from services.metadata import parse_pdf_date
        result = parse_pdf_date("D:2023")
        # Peut échouer ou retourner None, c'est attendu
        # Le test vérifie que ça ne plante pas et retourne None ou une chaîne
        assert result is None or isinstance(result, str)


class TestExtractMetadata:
    """Tests pour la fonction extract_metadata"""
    
    def test_extract_metadata_import(self):
        """Test que extract_metadata peut être importé"""
        from services.metadata import extract_metadata
        assert extract_metadata is not None
    
    def test_extract_metadata_txt(self):
        """Test extraction métadonnées d'un fichier TXT"""
        from services.metadata import extract_metadata
        content = b"Contenu du fichier texte"
        metadata = extract_metadata(content, "test.txt")
        
        assert "filename" in metadata
        assert metadata["filename"] == "test.txt"
        assert "file_size" in metadata
        assert metadata["file_size"] == len(content)
        assert "checksum" in metadata
        assert "extraction_date" in metadata
    
    def test_extract_metadata_unknown_extension(self):
        """Test extraction métadonnées pour extension inconnue"""
        from services.metadata import extract_metadata
        content = b"Some content"
        metadata = extract_metadata(content, "file.xyz")
        
        assert "filename" in metadata
        assert "file_size" in metadata
        assert "checksum" in metadata


class TestExtractMedicalMetadata:
    """Tests pour la fonction extract_medical_metadata"""
    
    def test_extract_medical_metadata_import(self):
        """Test que extract_medical_metadata peut être importé"""
        from services.metadata import extract_medical_metadata
        assert extract_medical_metadata is not None
    
    def test_word_count(self):
        """Test comptage des mots"""
        from services.metadata import extract_medical_metadata
        text = "Ceci est un test avec cinq mots"
        metadata = extract_medical_metadata(text)
        
        assert "word_count" in metadata
        assert metadata["word_count"] == 7
    
    def test_character_count(self):
        """Test comptage des caractères"""
        from services.metadata import extract_medical_metadata
        text = "Test"
        metadata = extract_medical_metadata(text)
        
        assert "character_count" in metadata
        assert metadata["character_count"] == 4
    
    def test_line_count(self):
        """Test comptage des lignes"""
        from services.metadata import extract_medical_metadata
        text = "Ligne 1\nLigne 2\nLigne 3"
        metadata = extract_medical_metadata(text)
        
        assert "line_count" in metadata
        assert metadata["line_count"] == 3
    
    def test_detect_medical_keywords(self):
        """Test détection des mots-clés médicaux"""
        from services.metadata import extract_medical_metadata
        text = "Le diagnostic du patient montre un traitement nécessaire"
        metadata = extract_medical_metadata(text)
        
        assert "detected_medical_keywords" in metadata
        assert "diagnostic" in metadata["detected_medical_keywords"]
        assert "patient" in metadata["detected_medical_keywords"]
        assert "traitement" in metadata["detected_medical_keywords"]
    
    def test_no_medical_keywords(self):
        """Test texte sans mots-clés médicaux"""
        from services.metadata import extract_medical_metadata
        text = "Bonjour le monde"
        metadata = extract_medical_metadata(text)
        
        # detected_medical_keywords ne devrait pas être présent ou vide
        if "detected_medical_keywords" in metadata:
            assert len(metadata["detected_medical_keywords"]) == 0
    
    def test_all_medical_keywords_detection(self):
        """Test détection de tous les mots-clés médicaux"""
        from services.metadata import extract_medical_metadata
        text = """
        Diagnostic: Le médecin a examiné le patient à l'hôpital.
        Traitement: Prescription d'une ordonnance.
        Antécédents: Analyse des symptômes à la clinique.
        """
        metadata = extract_medical_metadata(text)
        
        assert "detected_medical_keywords" in metadata
        keywords = metadata["detected_medical_keywords"]
        assert "diagnostic" in keywords
        assert "médecin" in keywords
        assert "patient" in keywords
        assert "hôpital" in keywords
        assert "traitement" in keywords


class TestExtractPdfMetadata:
    """Tests pour la fonction extract_pdf_metadata"""
    
    def test_extract_pdf_metadata_import(self):
        """Test que extract_pdf_metadata peut être importé"""
        from services.metadata import extract_pdf_metadata
        assert extract_pdf_metadata is not None
    
    def test_extract_pdf_metadata_invalid_content(self):
        """Test extraction avec contenu invalide"""
        from services.metadata import extract_pdf_metadata
        # Contenu non-PDF, devrait retourner dict vide
        metadata = extract_pdf_metadata(b"Not a PDF")
        assert isinstance(metadata, dict)
