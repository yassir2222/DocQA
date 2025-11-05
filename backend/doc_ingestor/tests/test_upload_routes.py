"""
Tests pour les routes d'upload.
"""
import pytest
from uuid import uuid4
from fastapi import status
from models.document_model import Document


class TestUploadEndpoint:
    """Tests pour l'endpoint POST /upload."""
    
    def test_upload_success(
        self,
        client,
        auth_headers,
        sample_pdf_file,
        mock_rabbitmq,
        mock_tika,
        mock_ocr,
        mock_file_service
    ):
        """Test upload réussi d'un document."""
        filename, content, mime_type = sample_pdf_file
        
        response = client.post(
            "/upload",
            files={"file": (filename, content, mime_type)},
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert "document_id" in data
        assert data["status"] == "sent_to_queue"
        assert "message" in data
        
        # Vérifier que RabbitMQ a été appelé
        mock_rabbitmq.send_to_deid_queue.assert_called_once()
    
    def test_upload_without_auth(self, client, sample_pdf_file):
        """Test upload sans authentification."""
        filename, content, mime_type = sample_pdf_file
        
        response = client.post(
            "/upload",
            files={"file": (filename, content, mime_type)}
        )
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "Authorization" in response.json()["detail"]
    
    def test_upload_invalid_token(self, client, sample_pdf_file):
        """Test upload avec token invalide."""
        filename, content, mime_type = sample_pdf_file
        
        response = client.post(
            "/upload",
            files={"file": (filename, content, mime_type)},
            headers={"Authorization": "Bearer invalid_token"}
        )
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "invalide" in response.json()["detail"].lower()
    
    def test_upload_rabbitmq_failure(
        self,
        client,
        auth_headers,
        sample_pdf_file,
        mock_rabbitmq,
        mock_tika,
        mock_ocr,
        mock_file_service
    ):
        """Test échec d'envoi vers RabbitMQ."""
        # Simuler échec RabbitMQ
        mock_rabbitmq.send_to_deid_queue.return_value = False
        
        filename, content, mime_type = sample_pdf_file
        
        response = client.post(
            "/upload",
            files={"file": (filename, content, mime_type)},
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
        assert "RabbitMQ" in response.json()["detail"]
        
        # Vérifier que error_queue a été appelé
        mock_rabbitmq.send_to_error_queue.assert_called_once()


class TestGetDocuments:
    """Tests pour l'endpoint GET /documents."""
    
    def test_get_documents_empty(self, client, auth_headers):
        """Test récupération liste vide."""
        response = client.get("/documents", headers=auth_headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert data["total"] == 0
        assert data["page"] == 1
        assert data["documents"] == []
    
    def test_get_documents_pagination(
        self,
        client,
        auth_headers,
        test_db
    ):
        """Test pagination."""
        # Créer 5 documents de test
        for i in range(5):
            doc = Document(
                file_name=f"test_{i}.pdf",
                type="pdf",
                file_size=1024,
                status="processed"
            )
            test_db.add(doc)
        test_db.commit()
        
        # Récupérer page 1 avec 2 documents
        response = client.get(
            "/documents?page=1&page_size=2",
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert data["total"] == 5
        assert data["page"] == 1
        assert data["page_size"] == 2
        assert len(data["documents"]) == 2
    
    def test_get_documents_filter_status(
        self,
        client,
        auth_headers,
        test_db
    ):
        """Test filtrage par statut."""
        # Créer documents avec différents statuts
        doc1 = Document(
            file_name="test1.pdf",
            type="pdf",
            file_size=1024,
            status="processed"
        )
        doc2 = Document(
            file_name="test2.pdf",
            type="pdf",
            file_size=1024,
            status="error"
        )
        test_db.add_all([doc1, doc2])
        test_db.commit()
        
        # Filtrer uniquement les "processed"
        response = client.get(
            "/documents?status=processed",
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert data["total"] == 1
        assert data["documents"][0]["status"] == "processed"
    
    def test_get_documents_without_auth(self, client):
        """Test sans authentification."""
        response = client.get("/documents")
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


class TestGetDocumentById:
    """Tests pour l'endpoint GET /documents/{id}."""
    
    def test_get_document_success(
        self,
        client,
        auth_headers,
        test_db
    ):
        """Test récupération document existant."""
        # Créer un document
        doc = Document(
            file_name="test.pdf",
            type="pdf",
            file_size=1024,
            status="processed",
            content_preview="Test content"
        )
        test_db.add(doc)
        test_db.commit()
        test_db.refresh(doc)
        
        # Récupérer le document
        response = client.get(
            f"/documents/{doc.document_id}",
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert data["document_id"] == str(doc.document_id)
        assert data["file_name"] == "test.pdf"
        assert data["status"] == "processed"
    
    def test_get_document_not_found(self, client, auth_headers):
        """Test document inexistant."""
        fake_id = uuid4()
        
        response = client.get(
            f"/documents/{fake_id}",
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert "non trouvé" in response.json()["detail"]


class TestHealthCheck:
    """Tests pour l'endpoint /health."""
    
    def test_health_check(self, client):
        """Test health check sans auth."""
        response = client.get("/health")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert data["status"] == "ok"
        assert data["service"] == "doc_ingestor"
        assert "version" in data
