"""
Tests robustes pour doc-ingestor - corrigés pour maximiser la couverture
"""
import pytest
import sys
import os

# Ajouter les chemins
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'microservices', 'doc-ingestor'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'microservices', 'doc-ingestor', 'src'))


class TestMetadataService:
    """Tests pour metadata.py"""
    
    def test_calculate_checksum_import(self):
        """Test import calculate_checksum"""
        from services.metadata import calculate_checksum
        assert callable(calculate_checksum)
        
    def test_checksum_empty_bytes(self):
        from services.metadata import calculate_checksum
        result = calculate_checksum(b"")
        assert isinstance(result, str)
        assert len(result) == 64
        
    def test_checksum_simple_bytes(self):
        from services.metadata import calculate_checksum
        result = calculate_checksum(b"hello")
        assert len(result) == 64
        
    def test_checksum_utf8_bytes(self):
        from services.metadata import calculate_checksum
        result = calculate_checksum("éàü".encode('utf-8'))
        assert len(result) == 64
        
    def test_checksum_large_bytes(self):
        from services.metadata import calculate_checksum
        result = calculate_checksum(b"x" * 10000)
        assert len(result) == 64
        
    def test_checksum_deterministic(self):
        from services.metadata import calculate_checksum
        data = b"test data"
        r1 = calculate_checksum(data)
        r2 = calculate_checksum(data)
        assert r1 == r2
        
    def test_checksum_unique(self):
        from services.metadata import calculate_checksum
        r1 = calculate_checksum(b"data1")
        r2 = calculate_checksum(b"data2")
        assert r1 != r2
        
    def test_parse_pdf_date_import(self):
        from services.metadata import parse_pdf_date
        assert callable(parse_pdf_date)
        
    def test_parse_pdf_date_none(self):
        from services.metadata import parse_pdf_date
        result = parse_pdf_date(None)
        assert result is None
        
    def test_parse_pdf_date_empty(self):
        from services.metadata import parse_pdf_date
        result = parse_pdf_date("")
        assert result is None
        
    def test_parse_pdf_date_invalid(self):
        from services.metadata import parse_pdf_date
        result = parse_pdf_date("invalid")
        assert result is None


class TestExtractorService:
    """Tests pour extractor.py"""
    
    def test_extract_text_from_txt_import(self):
        from services.extractor import extract_text_from_txt
        assert callable(extract_text_from_txt)
        
    def test_extract_txt_simple(self):
        from services.extractor import extract_text_from_txt
        result = extract_text_from_txt(b"hello world")
        assert "hello" in result
        
    def test_extract_txt_empty(self):
        from services.extractor import extract_text_from_txt
        result = extract_text_from_txt(b"")
        assert result == ""
        
    def test_extract_txt_multiline(self):
        from services.extractor import extract_text_from_txt
        result = extract_text_from_txt(b"line1\nline2\nline3")
        assert "line1" in result
        assert "line2" in result
        
    def test_extract_file_import(self):
        from services.extractor import extract_text_from_file
        assert callable(extract_text_from_file)
        
    def test_extract_file_txt(self):
        from services.extractor import extract_text_from_file
        result = extract_text_from_file(b"content", "test.txt")
        assert "content" in result


class TestDocIngestorConfig:
    """Tests pour config.py"""
    
    def test_settings_class_import(self):
        from config import Settings
        assert Settings is not None
        
    def test_settings_instance(self):
        from config import Settings
        s = Settings()
        assert s is not None
        
    def test_service_name(self):
        from config import Settings
        s = Settings()
        assert hasattr(s, 'SERVICE_NAME')
        assert s.SERVICE_NAME is not None
        
    def test_service_port(self):
        from config import Settings
        s = Settings()
        assert hasattr(s, 'SERVICE_PORT')
        assert isinstance(s.SERVICE_PORT, int)
        
    def test_settings_global(self):
        from config import settings
        assert settings is not None
