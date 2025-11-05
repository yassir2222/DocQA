"""
Tests complets pour le pipeline DeID.
Tests unitaires et d'intégration pour spaCy + Presidio.
"""
import pytest
from app.models import DeIDRequest, AnonymizationStrategy
from app.services.deid_engine import DeIDEngine, get_deid_engine
from app.utils.evaluator import DeIDEvaluator
from app.config import settings


@pytest.fixture(scope="module")
def deid_engine():
    """Fixture pour le moteur DeID (chargé une fois)."""
    engine = get_deid_engine()
    assert engine.is_ready(), "DeID Engine doit être initialisé"
    return engine


@pytest.fixture(scope="module")
def evaluator(deid_engine):
    """Fixture pour l'évaluateur."""
    return DeIDEvaluator(deid_engine)


class TestDeIDEngine:
    """Tests du moteur de désidentification."""
    
    def test_engine_initialization(self, deid_engine):
        """Test: Le moteur doit être correctement initialisé."""
        assert deid_engine.is_ready()
        assert deid_engine.spacy_model is not None
        assert deid_engine.analyzer is not None
        assert deid_engine.anonymizer is not None
    
    def test_detect_person_name(self, deid_engine):
        """Test: Détection d'un nom de personne."""
        text = "Le patient Ahmed Benali a consulté le médecin."
        entities = deid_engine.detect_entities(text, language="fr")
        
        # Doit détecter au moins "Ahmed Benali"
        person_entities = [e for e in entities if e.label == "PERSON"]
        assert len(person_entities) > 0
        
        # Vérifier qu'Ahmed Benali est détecté
        names = [e.entity for e in person_entities]
        assert any("ahmed" in name.lower() and "benali" in name.lower() for name in names)
    
    def test_detect_date(self, deid_engine):
        """Test: Détection d'une date de naissance."""
        text = "Patient né le 15/03/1982."
        entities = deid_engine.detect_entities(text, language="fr")
        
        # Doit détecter la date
        date_entities = [e for e in entities if e.label == "DATE_TIME"]
        assert len(date_entities) > 0
    
    def test_detect_phone_number(self, deid_engine):
        """Test: Détection numéro de téléphone marocain."""
        text = "Téléphone: 0661234567"
        entities = deid_engine.detect_entities(text, language="fr")
        
        # Doit détecter le téléphone
        phone_entities = [e for e in entities if e.label == "PHONE_NUMBER"]
        assert len(phone_entities) > 0
    
    def test_detect_ipp(self, deid_engine):
        """Test: Détection IPP (custom recognizer)."""
        text = "IPP: 1234567890"
        entities = deid_engine.detect_entities(text, language="fr")
        
        # Doit détecter l'IPP
        ipp_entities = [e for e in entities if e.label == "IPP"]
        assert len(ipp_entities) > 0
        assert "1234567890" in [e.entity for e in ipp_entities]
    
    def test_detect_nir(self, deid_engine):
        """Test: Détection NIR français."""
        text = "NIR: 1 82 03 75 123 456 12"
        entities = deid_engine.detect_entities(text, language="fr")
        
        # Doit détecter le NIR
        nir_entities = [e for e in entities if e.label == "FR_NIR"]
        assert len(nir_entities) > 0
    
    def test_anonymize_replace_strategy(self, deid_engine):
        """Test: Anonymisation avec stratégie REPLACE."""
        text = "Le patient Ahmed Benali, né le 15/03/1982, téléphone 0661234567."
        
        entities = deid_engine.detect_entities(text, language="fr")
        anonymized = deid_engine.anonymize(
            text, 
            entities, 
            strategy=AnonymizationStrategy.REPLACE
        )
        
        # Le texte anonymisé doit contenir des placeholders
        assert "<NAME>" in anonymized or "<PERSON>" in anonymized
        assert "<DATE>" in anonymized or "<DATE_TIME>" in anonymized
        assert "<PHONE>" in anonymized or "<PHONE_NUMBER>" in anonymized
        
        # Les données originales ne doivent plus apparaître
        assert "0661234567" not in anonymized
    
    def test_process_document_complete(self, deid_engine):
        """Test: Pipeline complet de traitement."""
        text = (
            "Le patient Ahmed Benali, né le 15/03/1982, "
            "domicilié à Casablanca, téléphone 0661234567, "
            "IPP: 1234567890."
        )
        
        anonymized_text, entities, processing_time = deid_engine.process_document(
            text=text,
            language="fr",
            min_confidence=0.5,
            strategy=AnonymizationStrategy.REPLACE
        )
        
        # Vérifications
        assert anonymized_text != text  # Texte modifié
        assert len(entities) >= 3  # Au moins nom, date, téléphone
        assert processing_time > 0  # Temps mesuré
        
        # Stats du moteur mises à jour
        stats = deid_engine.get_stats()
        assert stats["documents_processed"] > 0
    
    def test_min_confidence_threshold(self, deid_engine):
        """Test: Filtrage par score de confiance minimum."""
        text = "Le patient Ahmed Benali consulte le Dr Tazi."
        
        # Détection avec seuil bas
        entities_low = deid_engine.detect_entities(text, min_confidence=0.3)
        
        # Détection avec seuil élevé
        entities_high = deid_engine.detect_entities(text, min_confidence=0.9)
        
        # Avec seuil bas, on doit avoir plus ou autant d'entités
        assert len(entities_low) >= len(entities_high)


class TestEvaluator:
    """Tests de l'évaluateur de performance."""
    
    def test_load_dataset(self, evaluator):
        """Test: Chargement du dataset synthétique."""
        dataset = evaluator.load_dataset(settings.SYNTHETIC_DATASET_PATH)
        
        assert len(dataset) > 0
        assert "id" in dataset[0]
        assert "text" in dataset[0]
        assert "expected_entities" in dataset[0]
    
    def test_normalize_entity(self, evaluator):
        """Test: Normalisation des entités."""
        assert evaluator.normalize_entity("  Ahmed Benali  ") == "ahmed benali"
        assert evaluator.normalize_entity("CASABLANCA") == "casablanca"
    
    def test_calculate_metrics(self, evaluator):
        """Test: Calcul Precision/Recall/F1."""
        # TP=8, FP=2, FN=2
        # Precision = 8/(8+2) = 0.8
        # Recall = 8/(8+2) = 0.8
        # F1 = 0.8
        precision, recall, f1 = evaluator.calculate_metrics(
            true_positives=8,
            false_positives=2,
            false_negatives=2
        )
        
        assert precision == 0.8
        assert recall == 0.8
        assert f1 == 0.8
    
    def test_evaluate_on_sample(self, evaluator):
        """Test: Évaluation sur un échantillon du dataset."""
        result = evaluator.evaluate(
            dataset_path=settings.SYNTHETIC_DATASET_PATH,
            min_confidence=0.5,
            sample_size=5  # Tester sur 5 documents seulement
        )
        
        # Vérifications
        assert result.dataset_size == 5
        assert result.overall_precision >= 0.0
        assert result.overall_recall >= 0.0
        assert result.overall_f1_score >= 0.0
        assert result.processing_time_ms > 0
        assert len(result.metrics_by_entity) > 0


class TestIntegration:
    """Tests d'intégration bout-en-bout."""
    
    def test_full_pipeline_moroccan_document(self, deid_engine):
        """Test: Document clinique marocain complet."""
        text = (
            "Compte rendu - Patient: Youssef Bennis, "
            "IPP: 5555666677, né le 22/07/1995 à Fès. "
            "Hospitalisation du 01/12/2024 au 05/12/2024. "
            "Contact: 0537123456. "
            "Médecin traitant: Dr Hassan Bennani (RPPS: 12345678901)."
        )
        
        anonymized, entities, _ = deid_engine.process_document(
            text=text,
            language="fr",
            strategy=AnonymizationStrategy.REPLACE
        )
        
        # Vérifier que les PII sont détectées
        entity_labels = {e.label for e in entities}
        assert "PERSON" in entity_labels  # Noms
        assert "IPP" in entity_labels  # IPP
        assert "DATE_TIME" in entity_labels  # Dates
        assert "PHONE_NUMBER" in entity_labels  # Téléphone
        assert "MEDICAL_LICENSE" in entity_labels  # RPPS
        
        # Vérifier anonymisation
        assert "Youssef Bennis" not in anonymized
        assert "5555666677" not in anonymized
        assert "0537123456" not in anonymized
        assert "12345678901" not in anonymized
    
    def test_full_pipeline_french_document(self, deid_engine):
        """Test: Document clinique français complet."""
        text = (
            "Patient: Jean Dupont, né le 12/03/1980, "
            "résidant au 45 Rue Victor Hugo à Paris. "
            "NIR: 1 80 03 75 987 654 32. "
            "Téléphone: 0145678901. "
            "Email: j.dupont@hopital-paris.fr"
        )
        
        anonymized, entities, _ = deid_engine.process_document(
            text=text,
            language="fr",
            strategy=AnonymizationStrategy.REPLACE
        )
        
        # Vérifier détections
        entity_labels = {e.label for e in entities}
        assert "PERSON" in entity_labels
        assert "LOCATION" in entity_labels
        assert "FR_NIR" in entity_labels
        assert "PHONE_NUMBER" in entity_labels
        assert "EMAIL_ADDRESS" in entity_labels
        
        # Vérifier anonymisation
        assert "Jean Dupont" not in anonymized
        assert "1 80 03 75 987 654 32" not in anonymized
        assert "0145678901" not in anonymized
        assert "j.dupont@hopital-paris.fr" not in anonymized


# =============================================================================
# Tests de performance
# =============================================================================

class TestPerformance:
    """Tests de performance."""
    
    def test_processing_time_short_text(self, deid_engine):
        """Test: Temps de traitement pour texte court."""
        text = "Le patient Ahmed Benali a consulté le Dr Tazi."
        
        _, _, processing_time = deid_engine.process_document(text)
        
        # Doit être traité en moins de 500ms
        assert processing_time < 500
    
    def test_processing_time_long_text(self, deid_engine):
        """Test: Temps de traitement pour texte long."""
        # Créer un texte long (répétition)
        base_text = (
            "Le patient Ahmed Benali, né le 15/03/1982, "
            "domicilié à Casablanca, téléphone 0661234567. "
        )
        long_text = base_text * 20  # ~1KB
        
        _, _, processing_time = deid_engine.process_document(long_text)
        
        # Doit rester raisonnable (< 2s)
        assert processing_time < 2000


# =============================================================================
# Configuration pytest
# =============================================================================

def pytest_configure(config):
    """Configuration pytest."""
    config.addinivalue_line(
        "markers", "slow: marque les tests lents"
    )
    config.addinivalue_line(
        "markers", "integration: tests d'intégration"
    )
