"""
Tests pour l'API DocIngestor
"""
import pytest
from fastapi.testclient import TestClient
import sys
from pathlib import Path

# Ajouter le répertoire parent au path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app import app

client = TestClient(app)


def test_root():
    """Test de l'endpoint racine"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "DocIngestor"
    assert data["status"] == "running"


def test_health_check():
    """Test de l'endpoint health"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_list_documents():
    """Test de récupération de la liste des documents"""
    response = client.get("/api/v1/documents")
    assert response.status_code == 200
    data = response.json()
    assert "documents" in data
    assert "count" in data


def test_get_stats():
    """Test des statistiques"""
    response = client.get("/api/v1/stats")
    assert response.status_code == 200
    data = response.json()
    assert "statistics" in data
    stats = data["statistics"]
    assert "total_documents" in stats


# Note: Les tests d'upload nécessitent une base de données active
# Ils seront exécutés séparément avec pytest
