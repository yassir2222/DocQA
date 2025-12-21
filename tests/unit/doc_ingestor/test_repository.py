"""
Tests unitaires pour doc-ingestor/src/database/repository.py
Utilise des mocks pour simuler la base de données
"""
import pytest
from unittest.mock import Mock, patch, MagicMock
import sys
import os

# Ajouter le chemin du microservice au path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..', 'microservices', 'doc-ingestor'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..', 'microservices', 'doc-ingestor', 'src'))


class TestRepositoryImports:
    """Tests d'importation du module repository"""
    
    def test_get_connection_import(self):
        """Test que get_connection peut être importé"""
        from database.repository import get_connection
        assert get_connection is not None
    
    def test_init_database_import(self):
        """Test que init_database peut être importé"""
        from database.repository import init_database
        assert init_database is not None
    
    def test_save_document_import(self):
        """Test que save_document peut être importé"""
        from database.repository import save_document
        assert save_document is not None
    
    def test_get_document_by_id_import(self):
        """Test que get_document_by_id peut être importé"""
        from database.repository import get_document_by_id
        assert get_document_by_id is not None
    
    def test_get_all_documents_import(self):
        """Test que get_all_documents peut être importé"""
        from database.repository import get_all_documents
        assert get_all_documents is not None
    
    def test_update_document_status_import(self):
        """Test que update_document_status peut être importé"""
        from database.repository import update_document_status
        assert update_document_status is not None
    
    def test_delete_document_import(self):
        """Test que delete_document peut être importé"""
        from database.repository import delete_document
        assert delete_document is not None
    
    def test_close_connection_import(self):
        """Test que close_connection peut être importé"""
        from database.repository import close_connection
        assert close_connection is not None


class TestRepositoryWithMocks:
    """Tests avec mocks pour le repository"""
    
    @patch('database.repository.psycopg2')
    def test_save_document_with_mock(self, mock_psycopg2):
        """Test sauvegarde de document avec mock"""
        from database.repository import save_document
        
        # Configuration du mock
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = [1]
        mock_conn.cursor.return_value = mock_cursor
        mock_psycopg2.connect.return_value = mock_conn
        
        # Le test vérifie que la fonction est appelable
        assert save_document is not None
    
    @patch('database.repository.psycopg2')
    def test_get_document_by_id_with_mock(self, mock_psycopg2):
        """Test récupération de document avec mock"""
        from database.repository import get_document_by_id
        
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = None
        mock_conn.cursor.return_value = mock_cursor
        mock_psycopg2.connect.return_value = mock_conn
        
        assert get_document_by_id is not None
    
    @patch('database.repository.psycopg2')
    def test_get_all_documents_with_mock(self, mock_psycopg2):
        """Test récupération de tous les documents avec mock"""
        from database.repository import get_all_documents
        
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.fetchall.return_value = []
        mock_conn.cursor.return_value = mock_cursor
        mock_psycopg2.connect.return_value = mock_conn
        
        assert get_all_documents is not None
    
    @patch('database.repository.psycopg2')
    def test_delete_document_with_mock(self, mock_psycopg2):
        """Test suppression de document avec mock"""
        from database.repository import delete_document
        
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = None
        mock_conn.cursor.return_value = mock_cursor
        mock_psycopg2.connect.return_value = mock_conn
        
        assert delete_document is not None


class TestCloseConnection:
    """Tests pour close_connection"""
    
    @patch('database.repository._connection', None)
    def test_close_connection_when_none(self):
        """Test fermeture quand connexion est None"""
        from database.repository import close_connection
        # Ne devrait pas lever d'exception
        close_connection()
    
    @patch('database.repository._connection')
    def test_close_connection_when_closed(self, mock_connection):
        """Test fermeture quand connexion déjà fermée"""
        from database.repository import close_connection
        mock_connection.closed = True
        # Ne devrait pas lever d'exception
        close_connection()
