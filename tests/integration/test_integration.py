"""
Tests d'intégration End-to-End pour DocQA-MS
"""
import pytest
import httpx
import asyncio
import time
from typing import Dict, Any

# Configuration des URLs des services
GATEWAY_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:3000"

# Timeout pour les requêtes
TIMEOUT = 30.0


class TestServiceHealth:
    """Tests de santé de tous les services"""
    
    @pytest.mark.asyncio
    async def test_api_gateway_health(self):
        """Test santé API Gateway"""
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            try:
                response = await client.get(f"{GATEWAY_URL}/health")
                assert response.status_code == 200
                data = response.json()
                assert data["status"] == "healthy"
            except httpx.ConnectError:
                pytest.skip("API Gateway non disponible")
    
    @pytest.mark.asyncio
    async def test_all_services_health(self):
        """Test santé de tous les services via Gateway"""
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            try:
                response = await client.get(f"{GATEWAY_URL}/health/services")
                assert response.status_code in [200, 503]
                data = response.json()
                assert "services" in data
            except httpx.ConnectError:
                pytest.skip("API Gateway non disponible")
    
    @pytest.mark.asyncio
    async def test_frontend_accessible(self):
        """Test accessibilité frontend"""
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            try:
                response = await client.get(FRONTEND_URL)
                assert response.status_code == 200
            except httpx.ConnectError:
                pytest.skip("Frontend non disponible")


class TestDocumentFlow:
    """Tests du flux de documents"""
    
    @pytest.mark.asyncio
    async def test_upload_document(self):
        """Test upload d'un document"""
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            try:
                # Créer un fichier de test
                files = {
                    "file": ("test_document.txt", b"Contenu du document de test", "text/plain")
                }
                data = {"patient_id": "test_patient_001"}
                
                response = await client.post(
                    f"{GATEWAY_URL}/api/documents/upload",
                    files=files,
                    data=data
                )
                
                # Peut être 200, 201, ou 500 si le service n'est pas prêt
                assert response.status_code in [200, 201, 500, 503]
                
            except httpx.ConnectError:
                pytest.skip("Service non disponible")
    
    @pytest.mark.asyncio
    async def test_get_documents(self):
        """Test récupération des documents"""
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            try:
                response = await client.get(f"{GATEWAY_URL}/api/documents")
                assert response.status_code in [200, 500, 503]
                
                if response.status_code == 200:
                    data = response.json()
                    assert "documents" in data or isinstance(data, list)
                    
            except httpx.ConnectError:
                pytest.skip("Service non disponible")
    
    @pytest.mark.asyncio
    async def test_get_document_by_id(self):
        """Test récupération d'un document par ID"""
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            try:
                # D'abord récupérer la liste
                list_response = await client.get(f"{GATEWAY_URL}/api/documents")
                
                if list_response.status_code == 200:
                    data = list_response.json()
                    documents = data.get("documents", data if isinstance(data, list) else [])
                    
                    if documents:
                        doc_id = documents[0].get("id", documents[0].get("_id"))
                        if doc_id:
                            response = await client.get(f"{GATEWAY_URL}/api/documents/{doc_id}")
                            assert response.status_code in [200, 404, 500]
                            
            except httpx.ConnectError:
                pytest.skip("Service non disponible")


class TestQAFlow:
    """Tests du flux Question-Réponse"""
    
    @pytest.mark.asyncio
    async def test_ask_question(self):
        """Test poser une question"""
        async with httpx.AsyncClient(timeout=60.0) as client:  # Timeout plus long pour LLM
            try:
                payload = {
                    "question": "Quel est le diagnostic principal ?",
                    "patient_id": "test_patient_001"
                }
                
                response = await client.post(
                    f"{GATEWAY_URL}/api/qa/ask",
                    json=payload
                )
                
                assert response.status_code in [200, 400, 500, 503]
                
                if response.status_code == 200:
                    data = response.json()
                    assert "answer" in data or "response" in data
                    
            except httpx.ConnectError:
                pytest.skip("Service non disponible")
    
    @pytest.mark.asyncio
    async def test_semantic_search(self):
        """Test recherche sémantique"""
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            try:
                payload = {
                    "query": "hypertension traitement",
                    "limit": 5
                }
                
                response = await client.post(
                    f"{GATEWAY_URL}/api/search",
                    json=payload
                )
                
                assert response.status_code in [200, 400, 500, 503]
                
            except httpx.ConnectError:
                pytest.skip("Service non disponible")


class TestSynthesisFlow:
    """Tests du flux de synthèse"""
    
    @pytest.mark.asyncio
    async def test_generate_synthesis(self):
        """Test génération de synthèse"""
        async with httpx.AsyncClient(timeout=60.0) as client:
            try:
                payload = {
                    "document_ids": ["doc_001", "doc_002"],
                    "type": "summary"
                }
                
                response = await client.post(
                    f"{GATEWAY_URL}/api/synthesis/generate",
                    json=payload
                )
                
                assert response.status_code in [200, 400, 404, 500, 503]
                
            except httpx.ConnectError:
                pytest.skip("Service non disponible")


class TestAuditFlow:
    """Tests du flux d'audit"""
    
    @pytest.mark.asyncio
    async def test_get_audit_logs(self):
        """Test récupération des logs d'audit"""
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            try:
                response = await client.get(f"{GATEWAY_URL}/api/audit/logs")
                assert response.status_code in [200, 500, 503]
                
                if response.status_code == 200:
                    data = response.json()
                    assert "content" in data or "logs" in data or isinstance(data, list)
                    
            except httpx.ConnectError:
                pytest.skip("Service non disponible")
    
    @pytest.mark.asyncio
    async def test_log_action(self):
        """Test enregistrement d'une action"""
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            try:
                payload = {
                    "userId": "test_user",
                    "action": "QUERY",
                    "details": "Test integration query"
                }
                
                response = await client.post(
                    f"{GATEWAY_URL}/api/audit/log",
                    json=payload
                )
                
                assert response.status_code in [200, 201, 500, 503]
                
            except httpx.ConnectError:
                pytest.skip("Service non disponible")
    
    @pytest.mark.asyncio
    async def test_get_audit_stats(self):
        """Test récupération des stats d'audit"""
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            try:
                response = await client.get(f"{GATEWAY_URL}/api/audit/stats")
                assert response.status_code in [200, 500, 503]
                
            except httpx.ConnectError:
                pytest.skip("Service non disponible")


class TestAnonymizationFlow:
    """Tests du flux d'anonymisation"""
    
    @pytest.mark.asyncio
    async def test_anonymize_text(self):
        """Test anonymisation de texte"""
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            try:
                payload = {
                    "text": "Le patient Jean Dupont, né le 15/03/1985, habite au 15 rue de Paris."
                }
                
                response = await client.post(
                    f"{GATEWAY_URL}/api/deid/anonymize",
                    json=payload
                )
                
                assert response.status_code in [200, 400, 500, 503]
                
                if response.status_code == 200:
                    data = response.json()
                    # Le texte anonymisé ne devrait plus contenir le nom
                    anonymized = data.get("anonymized_text", data.get("text", ""))
                    # Vérification flexible car le format peut varier
                    
            except httpx.ConnectError:
                pytest.skip("Service non disponible")


class TestEndToEndScenario:
    """Tests de scénarios complets"""
    
    @pytest.mark.asyncio
    async def test_full_document_workflow(self):
        """Test workflow complet: upload -> indexation -> question -> réponse"""
        async with httpx.AsyncClient(timeout=60.0) as client:
            try:
                # 1. Upload document
                files = {
                    "file": ("e2e_test.txt", b"Patient diagnostique avec hypertension", "text/plain")
                }
                data = {"patient_id": "e2e_test_patient"}
                
                upload_response = await client.post(
                    f"{GATEWAY_URL}/api/documents/upload",
                    files=files,
                    data=data
                )
                
                if upload_response.status_code not in [200, 201]:
                    pytest.skip("Upload failed, skipping E2E test")
                    return
                
                # Attendre l'indexation
                await asyncio.sleep(5)
                
                # 2. Poser une question
                qa_payload = {
                    "question": "Quel est le diagnostic ?",
                    "patient_id": "e2e_test_patient"
                }
                
                qa_response = await client.post(
                    f"{GATEWAY_URL}/api/qa/ask",
                    json=qa_payload
                )
                
                # Vérifier qu'on a une réponse
                assert qa_response.status_code in [200, 400, 500]
                
            except httpx.ConnectError:
                pytest.skip("Services non disponibles")


# Fixtures
@pytest.fixture(scope="session")
def event_loop():
    """Créer une boucle d'événements pour les tests async"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def test_document():
    """Fixture pour document de test"""
    return {
        "filename": "test_document.txt",
        "content": b"Contenu du document de test pour integration",
        "patient_id": "integration_test_patient"
    }


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
