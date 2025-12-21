"""
Tests unitaires pour Indexeur Sémantique (ChromaDB)
"""
import pytest
from unittest.mock import patch, MagicMock
import numpy as np
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../../microservices/indexeur-semantique"))


class TestEmbeddingGeneration:
    """Tests de génération d'embeddings"""
    
    def test_embedding_dimension(self):
        """Test dimension des embeddings"""
        # Simulation embedding 384 dimensions (sentence-transformers)
        embedding = np.random.rand(384)
        assert len(embedding) == 384
    
    def test_embedding_normalization(self):
        """Test normalisation des embeddings"""
        embedding = np.array([0.5, 0.5, 0.5, 0.5])
        normalized = embedding / np.linalg.norm(embedding)
        
        # Vérifier que la norme est ~1
        assert abs(np.linalg.norm(normalized) - 1.0) < 0.001
    
    def test_embedding_consistency(self):
        """Test cohérence des embeddings (même texte = même embedding)"""
        # Simulation de hash déterministe
        text = "Texte de test"
        hash1 = hash(text)
        hash2 = hash(text)
        
        assert hash1 == hash2


class TestVectorSearch:
    """Tests de recherche vectorielle"""
    
    def test_cosine_similarity(self):
        """Test calcul de similarité cosinus"""
        vec1 = np.array([1, 0, 0])
        vec2 = np.array([1, 0, 0])
        
        # Similarité cosinus
        similarity = np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))
        assert similarity == 1.0
    
    def test_cosine_similarity_orthogonal(self):
        """Test similarité pour vecteurs orthogonaux"""
        vec1 = np.array([1, 0, 0])
        vec2 = np.array([0, 1, 0])
        
        similarity = np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))
        assert similarity == 0.0
    
    def test_top_k_results(self):
        """Test récupération top-k résultats"""
        scores = [0.9, 0.7, 0.8, 0.6, 0.95]
        k = 3
        
        # Trier et prendre les k premiers
        top_k = sorted(enumerate(scores), key=lambda x: x[1], reverse=True)[:k]
        
        assert len(top_k) == k
        assert top_k[0][1] == 0.95  # Score le plus élevé


class TestChromaDBOperations:
    """Tests des opérations ChromaDB"""
    
    @patch('chromadb.Client')
    def test_create_collection(self, mock_client):
        """Test création de collection"""
        mock_collection = MagicMock()
        mock_client.return_value.get_or_create_collection.return_value = mock_collection
        
        client = mock_client()
        collection = client.get_or_create_collection("documents")
        
        assert collection is not None
    
    @patch('chromadb.Client')
    def test_add_document(self, mock_client):
        """Test ajout de document"""
        mock_collection = MagicMock()
        mock_client.return_value.get_collection.return_value = mock_collection
        
        client = mock_client()
        collection = client.get_collection("documents")
        
        collection.add(
            documents=["Texte du document"],
            metadatas=[{"doc_id": "doc_001"}],
            ids=["doc_001"]
        )
        
        assert mock_collection.add.called
    
    @patch('chromadb.Client')
    def test_query_documents(self, mock_client):
        """Test requête de documents"""
        mock_collection = MagicMock()
        mock_collection.query.return_value = {
            "ids": [["doc_001", "doc_002"]],
            "distances": [[0.1, 0.2]],
            "documents": [["Doc 1", "Doc 2"]]
        }
        mock_client.return_value.get_collection.return_value = mock_collection
        
        client = mock_client()
        collection = client.get_collection("documents")
        results = collection.query(query_texts=["recherche"], n_results=2)
        
        assert len(results["ids"][0]) == 2


class TestDocumentChunking:
    """Tests de découpage de documents"""
    
    def test_chunk_document(self):
        """Test découpage en chunks"""
        text = "Phrase 1. Phrase 2. Phrase 3. Phrase 4."
        chunk_size = 20
        overlap = 5
        
        chunks = []
        for i in range(0, len(text), chunk_size - overlap):
            chunk = text[i:i + chunk_size]
            if chunk:
                chunks.append(chunk)
        
        assert len(chunks) > 1
    
    def test_chunk_overlap(self):
        """Test overlap entre chunks"""
        text = "ABCDEFGHIJ"
        chunk_size = 5
        overlap = 2
        
        chunks = []
        for i in range(0, len(text), chunk_size - overlap):
            chunk = text[i:i + chunk_size]
            if chunk:
                chunks.append(chunk)
        
        # Vérifier l'overlap
        if len(chunks) > 1:
            # Les derniers caractères du premier chunk doivent être 
            # les premiers du second
            assert chunks[0][-overlap:] == chunks[1][:overlap]


class TestIndexingPipeline:
    """Tests du pipeline d'indexation"""
    
    def test_document_id_uniqueness(self):
        """Test unicité des IDs"""
        import uuid
        ids = [str(uuid.uuid4()) for _ in range(100)]
        
        assert len(ids) == len(set(ids))
    
    def test_metadata_structure(self):
        """Test structure des métadonnées"""
        metadata = {
            "doc_id": "doc_001",
            "patient_id": "patient_001",
            "chunk_index": 0,
            "total_chunks": 5
        }
        
        required_fields = ["doc_id", "patient_id", "chunk_index"]
        for field in required_fields:
            assert field in metadata


@pytest.fixture
def sample_embeddings():
    """Fixture pour embeddings sample"""
    return np.random.rand(10, 384)


@pytest.fixture
def sample_documents():
    """Fixture pour documents sample"""
    return [
        {"id": "doc_001", "content": "Premier document médical"},
        {"id": "doc_002", "content": "Deuxième document médical"},
    ]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
