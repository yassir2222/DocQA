"""
Fixtures partagées pour tous les tests pytest
"""
import pytest
import httpx
import asyncio
from typing import Dict, Any, Generator
from unittest.mock import MagicMock, patch
import os
import sys

# Configuration
API_GATEWAY_URL = os.getenv("API_GATEWAY_URL", "http://localhost:8000")
TIMEOUT = 30.0


# ============================================
# Fixtures HTTP Client
# ============================================

@pytest.fixture
def sync_client() -> Generator[httpx.Client, None, None]:
    """Client HTTP synchrone"""
    with httpx.Client(base_url=API_GATEWAY_URL, timeout=TIMEOUT) as client:
        yield client


@pytest.fixture
async def async_client() -> httpx.AsyncClient:
    """Client HTTP asynchrone"""
    async with httpx.AsyncClient(base_url=API_GATEWAY_URL, timeout=TIMEOUT) as client:
        yield client


# ============================================
# Fixtures Données de Test
# ============================================

@pytest.fixture
def sample_patient_id() -> str:
    """ID patient de test"""
    return "test_patient_001"


@pytest.fixture
def sample_document_content() -> bytes:
    """Contenu de document de test"""
    return b"""
    Rapport Medical - Patient Test
    Date: 2024-01-15
    
    Diagnostic: Hypertension arterielle grade 2
    Traitement: Amlodipine 5mg/jour
    
    Recommandations:
    - Regime pauvre en sel
    - Activite physique reguliere
    - Controle tensionnel mensuel
    """


@pytest.fixture
def sample_document_metadata() -> Dict[str, Any]:
    """Métadonnées de document de test"""
    return {
        "filename": "test_rapport.txt",
        "patient_id": "test_patient_001",
        "document_type": "rapport_medical",
        "upload_date": "2024-01-15T10:00:00Z"
    }


@pytest.fixture
def sample_question() -> str:
    """Question de test"""
    return "Quel est le diagnostic principal du patient ?"


@pytest.fixture
def sample_medical_text() -> str:
    """Texte médical pour tests d'anonymisation"""
    return """
    Patient: Jean Dupont
    Né le: 15/03/1985
    NSS: 1 85 03 75 108 123 45
    Téléphone: 06 12 34 56 78
    Email: jean.dupont@email.com
    Adresse: 15 rue de Paris, 75001 Paris
    
    Diagnostic: Hypertension artérielle grade 2
    Traitement prescrit: Amlodipine 5mg matin
    Médecin traitant: Dr. Marie Martin
    """


@pytest.fixture
def sample_embedding() -> list:
    """Embedding de test (384 dimensions)"""
    import random
    random.seed(42)
    return [random.random() for _ in range(384)]


@pytest.fixture
def sample_audit_log() -> Dict[str, Any]:
    """Log d'audit de test"""
    return {
        "userId": "test_user",
        "action": "QUERY",
        "details": "Test query execution",
        "patientId": "test_patient_001",
        "timestamp": "2024-01-15T10:00:00Z"
    }


# ============================================
# Fixtures pour mocking des services
# ============================================

@pytest.fixture
def mock_doc_ingestor():
    """Mock du service doc-ingestor"""
    with patch('httpx.AsyncClient.post') as mock:
        mock.return_value = MagicMock(
            status_code=201,
            json=lambda: {
                "id": "doc_001",
                "filename": "test.pdf",
                "status": "processed"
            }
        )
        yield mock


@pytest.fixture
def mock_deid_service():
    """Mock du service de-id"""
    with patch('httpx.AsyncClient.post') as mock:
        mock.return_value = MagicMock(
            status_code=200,
            json=lambda: {
                "anonymized_text": "Patient: [NOM_ANONYMISE]...",
                "entities_found": 5
            }
        )
        yield mock


@pytest.fixture
def mock_indexer_service():
    """Mock du service indexeur"""
    with patch('httpx.AsyncClient.post') as mock:
        mock.return_value = MagicMock(
            status_code=200,
            json=lambda: {
                "indexed": True,
                "chunks_count": 10
            }
        )
        yield mock


@pytest.fixture
def mock_llm_service():
    """Mock du service LLM Q&A"""
    with patch('httpx.AsyncClient.post') as mock:
        mock.return_value = MagicMock(
            status_code=200,
            json=lambda: {
                "answer": "Le diagnostic principal est l'hypertension artérielle grade 2.",
                "sources": [{"filename": "rapport.pdf", "score": 0.9}],
                "confidence": 0.85
            }
        )
        yield mock


@pytest.fixture
def mock_audit_service():
    """Mock du service audit"""
    with patch('httpx.AsyncClient.post') as mock:
        mock.return_value = MagicMock(
            status_code=201,
            json=lambda: {"id": "log_001", "status": "created"}
        )
        yield mock


# ============================================
# Fixtures Event Loop
# ============================================

@pytest.fixture(scope="session")
def event_loop():
    """Créer une boucle d'événements pour les tests async"""
    policy = asyncio.get_event_loop_policy()
    loop = policy.new_event_loop()
    yield loop
    loop.close()


# ============================================
# Hooks pytest
# ============================================

def pytest_configure(config):
    """Configuration pytest"""
    config.addinivalue_line(
        "markers", "slow: marks tests as slow (deselect with '-m \"not slow\"')"
    )
    config.addinivalue_line(
        "markers", "integration: marks tests as integration tests"
    )
    config.addinivalue_line(
        "markers", "e2e: marks tests as end-to-end tests"
    )


def pytest_collection_modifyitems(config, items):
    """Modifier la collection de tests"""
    # Ajouter le marqueur 'slow' aux tests qui contiennent 'llm' dans leur nom
    for item in items:
        if "llm" in item.nodeid.lower() or "qa" in item.nodeid.lower():
            item.add_marker(pytest.mark.slow)


# ============================================
# Cleanup fixtures
# ============================================

@pytest.fixture(autouse=True)
def cleanup_test_data():
    """Nettoyage automatique après chaque test"""
    yield
    # Cleanup logic here if needed
    pass
