"""
Configuration pytest et fixtures partagées.
"""
import os
import sys
from pathlib import Path
from typing import Generator
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from unittest.mock import MagicMock, patch

# Ajouter le répertoire parent au PYTHONPATH
sys.path.insert(0, str(Path(__file__).parent.parent))

from main import app
from models.document_model import Base
from services.db_service import db_service
from config import settings


# Base de données de test en mémoire
TEST_DATABASE_URL = "sqlite:///:memory:"


@pytest.fixture(scope="session")
def test_engine():
    """Moteur de base de données pour les tests."""
    engine = create_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def test_db(test_engine) -> Generator[Session, None, None]:
    """Session de base de données pour chaque test."""
    TestSessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=test_engine
    )
    
    session = TestSessionLocal()
    try:
        yield session
    finally:
        session.rollback()
        session.close()


@pytest.fixture(scope="function")
def mock_db_service(test_db):
    """Mock du service DB avec session de test."""
    with patch.object(db_service, 'get_session', return_value=test_db):
        with patch.object(db_service, 'initialized', True):
            yield db_service


@pytest.fixture(scope="function")
def client(mock_db_service) -> TestClient:
    """Client de test FastAPI."""
    return TestClient(app)


@pytest.fixture
def auth_headers():
    """Headers d'authentification pour les tests."""
    return {"Authorization": f"Bearer {settings.API_TOKEN}"}


@pytest.fixture
def mock_rabbitmq():
    """Mock du service RabbitMQ."""
    with patch('services.rabbitmq_service.rabbitmq_service') as mock:
        mock.send_to_deid_queue.return_value = True
        mock.send_to_error_queue.return_value = True
        mock.connect.return_value = True
        yield mock


@pytest.fixture
def mock_tika():
    """Mock du service Tika."""
    with patch('services.tika_service.TikaService.extract_content') as mock:
        mock.return_value = {
            "content": "Test medical document content",
            "metadata": {
                "Content-Type": "application/pdf",
                "Author": "Dr. Test"
            }
        }
        yield mock


@pytest.fixture
def mock_ocr():
    """Mock du service OCR."""
    with patch('services.ocr_service.OCRService') as mock:
        mock.is_scanned_pdf.return_value = False
        mock.extract_text_from_pdf.return_value = None
        yield mock


@pytest.fixture
def mock_file_service():
    """Mock du service de fichiers."""
    with patch('services.file_service.FileService') as mock:
        mock.save_upload_file.return_value = (
            "/app/tmp/test.pdf",
            "pdf",
            1024
        )
        mock.delete_file.return_value = None
        yield mock


@pytest.fixture
def sample_pdf_file():
    """Fichier PDF de test."""
    from io import BytesIO
    
    content = b"%PDF-1.4\n%Test medical document\n"
    return ("test_medical.pdf", BytesIO(content), "application/pdf")


@pytest.fixture
def sample_txt_file():
    """Fichier texte de test."""
    from io import BytesIO
    
    content = b"Patient: John Doe\nDiagnostic: Test\n"
    return ("test_medical.txt", BytesIO(content), "text/plain")
