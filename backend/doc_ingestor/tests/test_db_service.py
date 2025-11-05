"""
Tests pour le service de base de données.
"""
import pytest
from uuid import uuid4
from models.document_model import Document


class TestDBService:
    """Tests pour DBService."""
    
    def test_create_document(self, mock_db_service, test_db):
        """Test création d'un document."""
        doc = mock_db_service.create_document(
            file_name="test.pdf",
            file_type="pdf",
            file_size=1024,
            metadata={"author": "Test"},
            content_preview="Test content",
            session=test_db
        )
        
        assert doc is not None
        assert doc.file_name == "test.pdf"
        assert doc.type == "pdf"
        assert doc.status == "pending"
        assert doc.doc_metadata["author"] == "Test"
    
    def test_create_document_long_preview(self, mock_db_service, test_db):
        """Test création avec preview trop long."""
        long_content = "A" * 1000
        
        doc = mock_db_service.create_document(
            file_name="test.pdf",
            file_type="pdf",
            file_size=1024,
            content_preview=long_content,
            session=test_db
        )
        
        assert doc is not None
        assert len(doc.content_preview) <= 503  # 500 + "..."
        assert doc.content_preview.endswith("...")
    
    def test_update_document_status(self, mock_db_service, test_db):
        """Test mise à jour du statut."""
        # Créer un document
        doc = mock_db_service.create_document(
            file_name="test.pdf",
            file_type="pdf",
            file_size=1024,
            session=test_db
        )
        test_db.commit()
        
        # Mettre à jour le statut
        result = mock_db_service.update_document_status(
            document_id=doc.document_id,
            status="processed",
            session=test_db
        )
        
        assert result is True
        
        # Vérifier le changement
        test_db.refresh(doc)
        assert doc.status == "processed"
    
    def test_update_document_status_with_error(self, mock_db_service, test_db):
        """Test mise à jour avec message d'erreur."""
        # Créer un document
        doc = mock_db_service.create_document(
            file_name="test.pdf",
            file_type="pdf",
            file_size=1024,
            session=test_db
        )
        test_db.commit()
        
        # Mettre à jour avec erreur
        result = mock_db_service.update_document_status(
            document_id=doc.document_id,
            status="error",
            error_message="Test error",
            session=test_db
        )
        
        assert result is True
        
        # Vérifier
        test_db.refresh(doc)
        assert doc.status == "error"
        assert doc.error_message == "Test error"
    
    def test_update_nonexistent_document(self, mock_db_service, test_db):
        """Test mise à jour document inexistant."""
        fake_id = uuid4()
        
        result = mock_db_service.update_document_status(
            document_id=fake_id,
            status="processed",
            session=test_db
        )
        
        assert result is False
    
    def test_get_document(self, mock_db_service, test_db):
        """Test récupération d'un document."""
        # Créer un document
        doc = Document(
            file_name="test.pdf",
            type="pdf",
            file_size=1024,
            status="processed"
        )
        test_db.add(doc)
        test_db.commit()
        test_db.refresh(doc)
        
        # Récupérer le document
        retrieved = mock_db_service.get_document(doc.document_id)
        
        assert retrieved is not None
        assert retrieved.document_id == doc.document_id
        assert retrieved.file_name == "test.pdf"
    
    def test_get_nonexistent_document(self, mock_db_service):
        """Test récupération document inexistant."""
        fake_id = uuid4()
        
        doc = mock_db_service.get_document(fake_id)
        
        assert doc is None
    
    def test_get_documents_with_pagination(self, mock_db_service, test_db):
        """Test récupération avec pagination."""
        # Créer 5 documents
        for i in range(5):
            doc = Document(
                file_name=f"test_{i}.pdf",
                type="pdf",
                file_size=1024,
                status="processed"
            )
            test_db.add(doc)
        test_db.commit()
        
        # Récupérer page 1 (2 documents)
        docs = mock_db_service.get_documents(skip=0, limit=2)
        
        assert len(docs) == 2
    
    def test_get_documents_with_status_filter(self, mock_db_service, test_db):
        """Test récupération avec filtre statut."""
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
        docs = mock_db_service.get_documents(status="processed")
        
        assert len(docs) == 1
        assert docs[0].status == "processed"
    
    def test_get_document_count(self, mock_db_service, test_db):
        """Test comptage des documents."""
        # Créer 3 documents
        for i in range(3):
            doc = Document(
                file_name=f"test_{i}.pdf",
                type="pdf",
                file_size=1024,
                status="processed"
            )
            test_db.add(doc)
        test_db.commit()
        
        # Compter
        count = mock_db_service.get_document_count()
        
        assert count == 3
    
    def test_get_document_count_with_filter(self, mock_db_service, test_db):
        """Test comptage avec filtre."""
        # Créer documents mixtes
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
        
        # Compter uniquement "processed"
        count = mock_db_service.get_document_count(status="processed")
        
        assert count == 1
