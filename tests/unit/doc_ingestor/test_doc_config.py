"""
Tests unitaires pour doc-ingestor/config.py
Importe et teste le vrai code source pour la couverture
"""
import pytest
import sys
import os

# Ajouter le chemin du microservice au path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..', 'microservices', 'doc-ingestor'))


class TestDocIngestorConfig:
    """Tests pour la configuration du service DocIngestor"""
    
    def test_settings_import(self):
        """Test que Settings peut être importé"""
        from config import Settings
        assert Settings is not None
    
    def test_settings_instance(self):
        """Test création d'une instance Settings"""
        from config import settings
        assert settings is not None
    
    def test_service_name(self):
        """Test nom du service"""
        from config import settings
        assert settings.SERVICE_NAME == "DocIngestor"
    
    def test_service_port(self):
        """Test port du service"""
        from config import settings
        assert settings.SERVICE_PORT == 8001
    
    def test_service_host(self):
        """Test host du service"""
        from config import settings
        assert settings.SERVICE_HOST == "0.0.0.0"
    
    def test_db_host(self):
        """Test host de la base de données"""
        from config import settings
        assert settings.DB_HOST is not None
    
    def test_db_port(self):
        """Test port de la base de données"""
        from config import settings
        assert isinstance(settings.DB_PORT, int)
        assert settings.DB_PORT > 0
    
    def test_db_name(self):
        """Test nom de la base de données"""
        from config import settings
        assert settings.DB_NAME is not None
    
    def test_rabbitmq_host(self):
        """Test RabbitMQ host"""
        from config import settings
        assert settings.RABBITMQ_HOST is not None
    
    def test_rabbitmq_port(self):
        """Test RabbitMQ port"""
        from config import settings
        assert isinstance(settings.RABBITMQ_PORT, int)
        assert settings.RABBITMQ_PORT > 0
    
    def test_rabbitmq_queue(self):
        """Test RabbitMQ queue"""
        from config import settings
        assert settings.RABBITMQ_QUEUE == "documents.raw"
    
    def test_upload_dir(self):
        """Test répertoire d'upload"""
        from config import settings
        assert settings.UPLOAD_DIR is not None
    
    def test_temp_dir(self):
        """Test répertoire temporaire"""
        from config import settings
        assert settings.TEMP_DIR is not None
    
    def test_max_file_size(self):
        """Test taille maximale de fichier"""
        from config import settings
        assert settings.MAX_FILE_SIZE > 0
        assert settings.MAX_FILE_SIZE == 50 * 1024 * 1024  # 50 MB
    
    def test_supported_extensions(self):
        """Test extensions supportées"""
        from config import settings
        assert ".pdf" in settings.SUPPORTED_EXTENSIONS
        assert ".docx" in settings.SUPPORTED_EXTENSIONS
        assert ".txt" in settings.SUPPORTED_EXTENSIONS
    
    def test_ocr_enabled(self):
        """Test OCR activé"""
        from config import settings
        assert isinstance(settings.OCR_ENABLED, bool)


class TestGetDbConfig:
    """Tests pour la méthode get_db_config"""
    
    def test_get_db_config_without_url(self):
        """Test get_db_config sans DATABASE_URL"""
        from config import Settings
        s = Settings(DATABASE_URL=None)
        db_config = s.get_db_config()
        
        assert "host" in db_config
        assert "port" in db_config
        assert "database" in db_config
        assert "user" in db_config
        assert "password" in db_config
    
    def test_get_db_config_with_url(self):
        """Test get_db_config avec DATABASE_URL"""
        from config import Settings
        s = Settings(DATABASE_URL="postgresql://testuser:testpass@testhost:5432/testdb")
        db_config = s.get_db_config()
        
        assert db_config["host"] == "testhost"
        assert db_config["port"] == 5432
        assert db_config["database"] == "testdb"
        assert db_config["user"] == "testuser"
        assert db_config["password"] == "testpass"
    
    def test_get_db_config_with_url_no_port(self):
        """Test get_db_config avec DATABASE_URL sans port"""
        from config import Settings
        s = Settings(DATABASE_URL="postgresql://user:pass@host/db")
        db_config = s.get_db_config()
        
        assert db_config["port"] == 5432  # Port par défaut
    
    def test_get_db_config_returns_dict(self):
        """Test que get_db_config retourne un dict"""
        from config import settings
        db_config = settings.get_db_config()
        assert isinstance(db_config, dict)
    
    def test_get_db_config_has_required_keys(self):
        """Test que get_db_config a toutes les clés requises"""
        from config import settings
        db_config = settings.get_db_config()
        
        required_keys = ["host", "port", "database", "user", "password"]
        for key in required_keys:
            assert key in db_config, f"Clé manquante: {key}"
