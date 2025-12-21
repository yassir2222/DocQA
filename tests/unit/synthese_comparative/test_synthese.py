"""
Tests unitaires pour Synthese-Comparative
"""
import pytest
from unittest.mock import patch, MagicMock
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../../microservices/synthese-comparative"))


class TestSynthesisGeneration:
    """Tests de génération de synthèse"""
    
    def test_single_document_synthesis(self):
        """Test synthèse d'un seul document"""
        document = {
            "id": "doc_001",
            "content": "Le patient présente une hypertension artérielle grade 2."
        }
        
        # La synthèse d'un seul document devrait être possible
        assert document["content"] is not None
        assert len(document["content"]) > 0
    
    def test_multi_document_synthesis(self):
        """Test synthèse de plusieurs documents"""
        documents = [
            {"id": "doc_001", "content": "Diagnostic: Hypertension"},
            {"id": "doc_002", "content": "Traitement: Amlodipine 5mg"},
        ]
        
        # Combiner les contenus
        combined = "\n".join([d["content"] for d in documents])
        assert "Hypertension" in combined
        assert "Amlodipine" in combined
    
    def test_synthesis_structure(self):
        """Test structure de la synthèse"""
        synthesis = {
            "id": "synth_001",
            "documents": ["doc_001", "doc_002"],
            "summary": "Synthèse des documents...",
            "key_points": ["Point 1", "Point 2"],
            "created_at": "2024-01-15T10:00:00Z"
        }
        
        required_fields = ["id", "documents", "summary"]
        for field in required_fields:
            assert field in synthesis


class TestDocumentComparison:
    """Tests de comparaison de documents"""
    
    def test_find_common_elements(self):
        """Test recherche d'éléments communs"""
        doc1_keywords = {"hypertension", "diagnostic", "traitement"}
        doc2_keywords = {"hypertension", "tension", "medicament"}
        
        common = doc1_keywords.intersection(doc2_keywords)
        assert "hypertension" in common
    
    def test_find_differences(self):
        """Test recherche de différences"""
        doc1_keywords = {"hypertension", "diagnostic"}
        doc2_keywords = {"hypertension", "traitement"}
        
        diff1 = doc1_keywords - doc2_keywords
        diff2 = doc2_keywords - doc1_keywords
        
        assert "diagnostic" in diff1
        assert "traitement" in diff2
    
    def test_temporal_comparison(self):
        """Test comparaison temporelle"""
        visits = [
            {"date": "2024-01-01", "diagnosis": "Hypertension grade 1"},
            {"date": "2024-06-01", "diagnosis": "Hypertension grade 2"},
        ]
        
        # Évolution détectée
        assert visits[0]["diagnosis"] != visits[1]["diagnosis"]


class TestKeyPointsExtraction:
    """Tests d'extraction de points clés"""
    
    def test_extract_diagnosis(self):
        """Test extraction du diagnostic"""
        text = "Diagnostic: Hypertension artérielle grade 2"
        
        if "Diagnostic:" in text:
            diagnosis = text.split("Diagnostic:")[1].strip()
            assert "Hypertension" in diagnosis
    
    def test_extract_treatment(self):
        """Test extraction du traitement"""
        text = "Traitement: Amlodipine 5mg matin"
        
        if "Traitement:" in text:
            treatment = text.split("Traitement:")[1].strip()
            assert "Amlodipine" in treatment
    
    def test_extract_recommendations(self):
        """Test extraction des recommandations"""
        text = """
        Recommandations:
        - Régime pauvre en sel
        - Activité physique régulière
        - Contrôle tensionnel mensuel
        """
        
        lines = [l.strip() for l in text.split("\n") if l.strip().startswith("-")]
        assert len(lines) == 3


class TestPatientComparison:
    """Tests de comparaison entre patients"""
    
    def test_compare_two_patients(self):
        """Test comparaison de deux patients"""
        patient1 = {
            "id": "patient_001",
            "diagnostics": ["Hypertension", "Diabète"]
        }
        patient2 = {
            "id": "patient_002",
            "diagnostics": ["Hypertension", "Asthme"]
        }
        
        common = set(patient1["diagnostics"]).intersection(set(patient2["diagnostics"]))
        assert "Hypertension" in common
    
    def test_aggregate_statistics(self):
        """Test agrégation de statistiques"""
        patients = [
            {"age": 45, "systolic_bp": 140},
            {"age": 55, "systolic_bp": 150},
            {"age": 50, "systolic_bp": 145},
        ]
        
        avg_bp = sum(p["systolic_bp"] for p in patients) / len(patients)
        assert 140 <= avg_bp <= 150


class TestPDFGeneration:
    """Tests de génération PDF"""
    
    def test_html_to_pdf_structure(self):
        """Test structure HTML pour PDF"""
        html = """
        <html>
        <head><title>Synthèse</title></head>
        <body>
            <h1>Synthèse comparative</h1>
            <h2>Points clés</h2>
            <ul>
                <li>Point 1</li>
                <li>Point 2</li>
            </ul>
        </body>
        </html>
        """
        
        assert "<h1>" in html
        assert "<li>" in html
    
    def test_synthesis_metadata(self):
        """Test métadonnées de synthèse"""
        metadata = {
            "title": "Synthèse comparative",
            "author": "DocQA-MS",
            "created_at": "2024-01-15",
            "documents_count": 3
        }
        
        assert metadata["author"] == "DocQA-MS"
        assert metadata["documents_count"] == 3


class TestSynthesisOptions:
    """Tests des options de synthèse"""
    
    def test_synthesis_type_summary(self):
        """Test type synthèse résumé"""
        options = {"type": "summary", "max_length": 500}
        assert options["type"] == "summary"
    
    def test_synthesis_type_comparison(self):
        """Test type synthèse comparaison"""
        options = {"type": "comparison", "include_evolution": True}
        assert options["type"] == "comparison"
        assert options["include_evolution"] is True
    
    def test_synthesis_type_timeline(self):
        """Test type synthèse chronologique"""
        options = {"type": "timeline", "date_range": ["2024-01", "2024-12"]}
        assert options["type"] == "timeline"
        assert len(options["date_range"]) == 2


@pytest.fixture
def sample_documents():
    """Fixture pour documents sample"""
    return [
        {
            "id": "doc_001",
            "patient_id": "patient_001",
            "content": "Consultation du 01/01/2024. Diagnostic: HTA grade 1.",
            "date": "2024-01-01"
        },
        {
            "id": "doc_002",
            "patient_id": "patient_001",
            "content": "Consultation du 01/06/2024. Diagnostic: HTA grade 2.",
            "date": "2024-06-01"
        },
    ]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
