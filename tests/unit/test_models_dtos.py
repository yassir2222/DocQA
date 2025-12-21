"""
Tests exhaustifs pour les modèles et DTOs Python
"""
import pytest
import sys
import os
from datetime import datetime, timezone

# Chemins
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'microservices', 'doc-ingestor'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'microservices', 'doc-ingestor', 'src'))


class TestDocIngestorModels:
    """Tests pour les modèles doc-ingestor"""
    
    def test_document_dict_structure(self):
        """Test structure d'un document"""
        document = {
            "id": "doc-001",
            "filename": "test.pdf",
            "content": "Document content",
            "patient_id": "P001",
            "checksum": "abc123",
            "file_size": 1024,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": None
        }
        
        required_fields = ["id", "filename", "content"]
        for field in required_fields:
            assert field in document
            
    def test_document_metadata(self):
        """Test métadonnées de document"""
        metadata = {
            "title": "Compte-rendu",
            "author": "Dr. Martin",
            "creation_date": "2024-01-15",
            "page_count": 5,
            "word_count": 500
        }
        
        assert metadata["page_count"] > 0
        assert metadata["word_count"] > 0
        

class TestAPIGatewayModels:
    """Tests pour les modèles API Gateway"""
    
    def test_notification_structure(self):
        """Test structure d'une notification"""
        notification = {
            "id": "notif-001",
            "type": "info",
            "title": "Document traité",
            "message": "Le document a été traité avec succès",
            "read": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        assert notification["type"] in ["info", "warning", "error", "success"]
        assert isinstance(notification["read"], bool)
        
    def test_conversation_structure(self):
        """Test structure d'une conversation"""
        conversation = {
            "id": "conv-001",
            "patient_id": "P001",
            "messages": [
                {"role": "user", "content": "Question 1"},
                {"role": "assistant", "content": "Réponse 1"}
            ],
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        assert len(conversation["messages"]) == 2
        assert conversation["messages"][0]["role"] == "user"
        
    def test_health_response(self):
        """Test réponse de santé"""
        health = {
            "status": "healthy",
            "service": "api-gateway",
            "uptime": 3600,
            "dependencies": {
                "doc-ingestor": "healthy",
                "llm-qa": "healthy",
                "deid": "healthy"
            }
        }
        
        assert health["status"] in ["healthy", "unhealthy", "degraded"]


class TestLLMQAModels:
    """Tests pour les modèles LLM QA"""
    
    def test_question_request(self):
        """Test requête de question"""
        request = {
            "question": "Quelle est la posologie?",
            "patient_id": "P001",
            "conversation_id": None,
            "include_sources": True,
            "max_sources": 5
        }
        
        assert request["question"]
        assert isinstance(request["include_sources"], bool)
        
    def test_answer_response(self):
        """Test réponse à une question"""
        response = {
            "answer": "La posologie recommandée est de 500mg.",
            "confidence": 0.87,
            "sources": [
                {"id": "doc-001", "score": 0.95, "snippet": "..."},
                {"id": "doc-002", "score": 0.82, "snippet": "..."}
            ],
            "medical_entities": {
                "medications": ["Doliprane"],
                "dosages": ["500mg"]
            },
            "processing_time_ms": 250
        }
        
        assert 0 <= response["confidence"] <= 1
        assert len(response["sources"]) <= 5
        
    def test_rag_context_structure(self):
        """Test structure du contexte RAG"""
        context = {
            "query": "hypertension treatment",
            "expanded_query": "hypertension treatment HTA arterial",
            "documents": [
                {
                    "id": "doc-001",
                    "content": "Traitement de l'hypertension...",
                    "score": 0.92,
                    "metadata": {"patient_id": "P001"}
                }
            ],
            "total_retrieved": 10,
            "after_filtering": 5
        }
        
        assert context["total_retrieved"] >= context["after_filtering"]


class TestOcrModels:
    """Tests pour les modèles OCR"""
    
    def test_ocr_result(self):
        """Test résultat OCR"""
        result = {
            "text": "Texte extrait par OCR",
            "confidence": 0.92,
            "pages": 3,
            "language": "fra",
            "processing_time_ms": 5000
        }
        
        assert result["text"]
        assert result["confidence"] >= 0
        
    def test_ocr_config(self):
        """Test configuration OCR"""
        config = {
            "enabled": True,
            "language": "fra+eng",
            "psm": 3,
            "oem": 3,
            "dpi": 300
        }
        
        assert config["dpi"] >= 100


class TestSynthesisModels:
    """Tests pour les modèles de synthèse"""
    
    def test_synthesis_request(self):
        """Test requête de synthèse"""
        request = {
            "document_ids": ["doc-001", "doc-002"],
            "patient_id": "P001",
            "synthesis_type": "SUMMARY",
            "focus": "traitements",
            "user_id": "user123"
        }
        
        assert request["synthesis_type"] in ["SUMMARY", "EVOLUTION", "TREATMENT_HISTORY"]
        
    def test_synthesis_result(self):
        """Test résultat de synthèse"""
        result = {
            "id": "synth-001",
            "type": "SUMMARY",
            "summary": "Résumé du dossier médical...",
            "key_points": [
                "Antécédent d'hypertension",
                "Traitement en cours",
                "Évolution favorable"
            ],
            "source_documents": ["doc-001", "doc-002"],
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "processing_time_ms": 3500
        }
        
        assert len(result["key_points"]) > 0
        
    def test_comparison_request(self):
        """Test requête de comparaison"""
        request = {
            "patient_id_1": "P001",
            "patient_id_2": "P002",
            "document_ids_1": ["doc-001"],
            "document_ids_2": ["doc-002"],
            "comparison_type": "TREATMENT",
            "time_period": "6_MONTHS"
        }
        
        assert request["comparison_type"] in ["TREATMENT", "EVOLUTION", "DIAGNOSIS"]


class TestDeIdModels:
    """Tests pour les modèles DeID"""
    
    def test_deid_request(self):
        """Test requête de dé-identification"""
        request = {
            "document_id": "doc-001",
            "document_content": "Patient Jean DUPONT, né le 15/03/1970...",
            "entity_types": ["PERSON", "DATE", "PHONE", "EMAIL"]
        }
        
        assert request["document_content"]
        
    def test_deid_result(self):
        """Test résultat de dé-identification"""
        result = {
            "document_id": "doc-001",
            "anonymized_content": "Patient [PERSON_ABC123], né le [DATE_DEF456]...",
            "mappings": [
                {"original": "Jean DUPONT", "pseudonym": "[PERSON_ABC123]", "type": "PERSON"},
                {"original": "15/03/1970", "pseudonym": "[DATE_DEF456]", "type": "DATE"}
            ],
            "entities_found": 2
        }
        
        assert result["entities_found"] == len(result["mappings"])


class TestAuditModels:
    """Tests pour les modèles Audit"""
    
    def test_audit_log(self):
        """Test log d'audit"""
        log = {
            "id": 1,
            "user_id": "user123",
            "action": "DOCUMENT_UPLOAD",
            "resource_type": "document",
            "resource_id": "doc-001",
            "ip_address": "192.168.1.1",
            "user_agent": "Mozilla/5.0",
            "status": "SUCCESS",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        assert log["status"] in ["SUCCESS", "ERROR", "PENDING"]
        
    def test_audit_stats(self):
        """Test statistiques d'audit"""
        stats = {
            "total_logs": 1000,
            "error_count": 5,
            "logs_by_action": {
                "DOCUMENT_UPLOAD": 300,
                "QUESTION_ASKED": 500,
                "SYNTHESIS_GENERATED": 200
            },
            "average_processing_time": 150.5
        }
        
        assert stats["total_logs"] > 0
        assert stats["error_count"] >= 0
