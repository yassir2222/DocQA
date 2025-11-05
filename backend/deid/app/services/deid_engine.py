"""
Moteur de désidentification avec spaCy et Microsoft Presidio.
Pipeline complet de détection et anonymisation des PII.
"""
import time
import logging
from typing import List, Dict, Tuple, Optional
import spacy
from spacy.language import Language
from presidio_analyzer import AnalyzerEngine, PatternRecognizer, Pattern
from presidio_analyzer.nlp_engine import NlpEngineProvider
from presidio_anonymizer import AnonymizerEngine
from presidio_anonymizer.entities import OperatorConfig

from app.config import settings
from app.models import DetectedEntity, AnonymizationStrategy

logger = logging.getLogger(__name__)


class DeIDEngine:
    """
    Moteur de désidentification combinant spaCy et Presidio.
    Détecte et anonymise les informations personnelles sensibles (PII).
    """
    
    def __init__(self):
        """Initialise le moteur avec spaCy et Presidio."""
        self.spacy_model: Optional[Language] = None
        self.analyzer: Optional[AnalyzerEngine] = None
        self.anonymizer: Optional[AnonymizerEngine] = None
        self._is_ready = False
        
        # Statistiques
        self.stats = {
            "documents_processed": 0,
            "entities_detected": 0,
            "total_processing_time_ms": 0.0
        }
        
        logger.info(f"Initialisation du DeID Engine v{settings.VERSION}")
        self._initialize()
    
    def _initialize(self):
        """Initialise spaCy et Presidio."""
        try:
            # 1. Charger le modèle spaCy français
            logger.info(f"Chargement du modèle spaCy: {settings.SPACY_MODEL}")
            self.spacy_model = spacy.load(
                settings.SPACY_MODEL,
                disable=[c for c in ["tok2vec", "tagger", "parser", "ner", "attribute_ruler", "lemmatizer"] 
                        if c not in settings.SPACY_ENABLE_COMPONENTS]
            )
            logger.info(f"✓ Modèle spaCy chargé: {self.spacy_model.meta['name']}")
            
            # 2. Configurer Presidio Analyzer
            logger.info("Configuration de Presidio Analyzer...")
            configuration = {
                "nlp_engine_name": "spacy",
                "models": [
                    {
                        "lang_code": "fr", 
                        "model_name": settings.SPACY_MODEL
                    },
                    {
                        "lang_code": "en", 
                        "model_name": "en_core_web_sm"  # Fallback anglais
                    }
                ]
            }
            
            # Créer NLP engine provider
            nlp_engine = NlpEngineProvider(nlp_configuration=configuration).create_engine()
            
            # Créer analyzer avec recognizers personnalisés
            self.analyzer = AnalyzerEngine(
                nlp_engine=nlp_engine,
                supported_languages=settings.PRESIDIO_SUPPORTED_LANGUAGES
            )
            
            # Ajouter recognizers personnalisés pour contexte médical marocain/français
            self._add_custom_recognizers()
            
            logger.info("✓ Presidio Analyzer configuré")
            
            # 3. Configurer Presidio Anonymizer
            self.anonymizer = AnonymizerEngine()
            logger.info("✓ Presidio Anonymizer configuré")
            
            self._is_ready = True
            logger.info("✓ DeID Engine prêt")
            
        except Exception as e:
            logger.error(f"✗ Erreur lors de l'initialisation: {e}", exc_info=True)
            raise RuntimeError(f"Impossible d'initialiser le DeID Engine: {e}")
    
    def _add_custom_recognizers(self):
        """Ajoute des recognizers personnalisés pour le contexte médical français/marocain."""
        
        # 1. IPP (Identifiant Patient Permanent) - Format: 8-10 chiffres
        ipp_pattern = Pattern(
            name="ipp_pattern",
            regex=r"\b(?:IPP[:\s]*)?(\d{8,10})\b",
            score=0.85
        )
        ipp_recognizer = PatternRecognizer(
            supported_entity="IPP",
            supported_language="fr",
            patterns=[ipp_pattern],
            context=["patient", "identifiant", "IPP", "dossier"]
        )
        self.analyzer.registry.add_recognizer(ipp_recognizer)
        
        # 2. NDA (Numéro Dossier Administratif)
        nda_pattern = Pattern(
            name="nda_pattern",
            regex=r"\b(?:NDA[:\s]*)?([A-Z]{2}\d{6,8})\b",
            score=0.80
        )
        nda_recognizer = PatternRecognizer(
            supported_entity="NDA",
            supported_language="fr",
            patterns=[nda_pattern],
            context=["dossier", "administratif", "NDA"]
        )
        self.analyzer.registry.add_recognizer(nda_recognizer)
        
        # 3. NIR Français (Numéro Sécu) - Format: 1 SSAA MM DDD CCC KK
        nir_pattern = Pattern(
            name="nir_pattern",
            regex=r"\b[12]\s?\d{2}\s?(?:0[1-9]|1[0-2])\s?\d{2}\s?\d{3}\s?\d{3}\s?\d{2}\b",
            score=0.90
        )
        nir_recognizer = PatternRecognizer(
            supported_entity="FR_NIR",
            supported_language="fr",
            patterns=[nir_pattern],
            context=["sécurité sociale", "sécu", "NIR", "numéro social"]
        )
        self.analyzer.registry.add_recognizer(nir_recognizer)
        
        # 4. Numéro RPPS (Répertoire Partagé des Professionnels de Santé)
        rpps_pattern = Pattern(
            name="rpps_pattern",
            regex=r"\b(?:RPPS[:\s]*)?(\d{11})\b",
            score=0.85
        )
        rpps_recognizer = PatternRecognizer(
            supported_entity="MEDICAL_LICENSE",
            supported_language="fr",
            patterns=[rpps_pattern],
            context=["médecin", "docteur", "Dr", "praticien", "RPPS"]
        )
        self.analyzer.registry.add_recognizer(rpps_recognizer)
        
        # 5. Téléphone marocain - Format: +212 6XX XX XX XX ou 06XX XX XX XX
        phone_ma_pattern = Pattern(
            name="phone_ma_pattern",
            regex=r"\b(?:\+212|0)[5-7]\d{8}\b|\b0[5-7](?:\s?\d{2}){4}\b",
            score=0.85
        )
        phone_ma_recognizer = PatternRecognizer(
            supported_entity="PHONE_NUMBER",
            supported_language="fr",
            patterns=[phone_ma_pattern],
            context=["tél", "téléphone", "mobile", "portable", "contact"]
        )
        self.analyzer.registry.add_recognizer(phone_ma_recognizer)
        
        # 6. Téléphone français - Format: +33 6XX XX XX XX ou 06XX XX XX XX
        phone_fr_pattern = Pattern(
            name="phone_fr_pattern",
            regex=r"\b(?:\+33|0)[1-9](?:\s?\d{2}){4}\b",
            score=0.85
        )
        phone_fr_recognizer = PatternRecognizer(
            supported_entity="PHONE_NUMBER",
            supported_language="fr",
            patterns=[phone_fr_pattern],
            context=["tél", "téléphone", "mobile", "portable", "contact"]
        )
        self.analyzer.registry.add_recognizer(phone_fr_recognizer)
        
        # 7. Adresses emails médicales
        email_pattern = Pattern(
            name="medical_email_pattern",
            regex=r"\b[a-zA-Z0-9._%+-]+@(?:chu|hopital|clinique|medecin|sante)[a-zA-Z0-9.-]*\.[a-zA-Z]{2,}\b",
            score=0.90
        )
        email_recognizer = PatternRecognizer(
            supported_entity="EMAIL_ADDRESS",
            supported_language="fr",
            patterns=[email_pattern]
        )
        self.analyzer.registry.add_recognizer(email_recognizer)
        
        logger.info(f"✓ {7} recognizers personnalisés ajoutés")
    
    def detect_entities(
        self,
        text: str,
        language: str = "fr",
        min_confidence: float = None
    ) -> List[DetectedEntity]:
        """
        Détecte les entités PII dans un texte.
        
        Args:
            text: Texte à analyser
            language: Langue du texte (fr/en)
            min_confidence: Score minimum de confiance
            
        Returns:
            Liste des entités détectées
        """
        if not self._is_ready:
            raise RuntimeError("DeID Engine non initialisé")
        
        if min_confidence is None:
            min_confidence = settings.MIN_CONFIDENCE_SCORE
        
        try:
            # Analyse avec Presidio
            results = self.analyzer.analyze(
                text=text,
                language=language,
                entities=settings.PII_ENTITIES,
                score_threshold=min_confidence
            )
            
            # Convertir en DetectedEntity
            detected_entities = []
            for result in results:
                entity_text = text[result.start:result.end]
                placeholder = settings.ENTITY_PLACEHOLDERS.get(
                    result.entity_type,
                    f"<{result.entity_type}>"
                )
                
                detected_entities.append(DetectedEntity(
                    entity=entity_text,
                    label=result.entity_type,
                    start=result.start,
                    end=result.end,
                    score=result.score,
                    placeholder=placeholder
                ))
            
            # Tri par position dans le texte
            detected_entities.sort(key=lambda x: x.start)
            
            logger.debug(f"Détecté {len(detected_entities)} entités (min_score={min_confidence})")
            
            return detected_entities
            
        except Exception as e:
            logger.error(f"Erreur lors de la détection d'entités: {e}", exc_info=True)
            return []
    
    def anonymize(
        self,
        text: str,
        entities: List[DetectedEntity],
        strategy: AnonymizationStrategy = AnonymizationStrategy.REPLACE
    ) -> str:
        """
        Anonymise un texte en remplaçant les entités détectées.
        
        Args:
            text: Texte original
            entities: Liste des entités à anonymiser
            strategy: Stratégie d'anonymisation
            
        Returns:
            Texte anonymisé
        """
        if not entities:
            return text
        
        try:
            # Convertir DetectedEntity en format Presidio
            from presidio_analyzer import RecognizerResult
            
            analyzer_results = []
            for entity in entities:
                analyzer_results.append(RecognizerResult(
                    entity_type=entity.label,
                    start=entity.start,
                    end=entity.end,
                    score=entity.score
                ))
            
            # Configuration de l'anonymisation
            if strategy == AnonymizationStrategy.REPLACE:
                # Remplacement par placeholders
                operators = {}
                for entity in entities:
                    if entity.label not in operators:
                        operators[entity.label] = OperatorConfig(
                            "replace",
                            {"new_value": entity.placeholder}
                        )
            
            elif strategy == AnonymizationStrategy.MASK:
                # Masquage partiel
                operators = {
                    entity.label: OperatorConfig("mask", {"masking_char": "*", "chars_to_mask": 100})
                    for entity in entities
                }
            
            elif strategy == AnonymizationStrategy.REDACT:
                # Suppression complète
                operators = {
                    entity.label: OperatorConfig("redact", {})
                    for entity in entities
                }
            
            elif strategy == AnonymizationStrategy.HASH:
                # Hash cryptographique
                operators = {
                    entity.label: OperatorConfig("hash", {"hash_type": "sha256"})
                    for entity in entities
                }
            
            else:  # FAKE - utilise Faker (à implémenter)
                operators = {}
                for entity in entities:
                    if entity.label not in operators:
                        operators[entity.label] = OperatorConfig(
                            "replace",
                            {"new_value": entity.placeholder}
                        )
            
            # Anonymisation avec Presidio
            anonymized_result = self.anonymizer.anonymize(
                text=text,
                analyzer_results=analyzer_results,
                operators=operators
            )
            
            return anonymized_result.text
            
        except Exception as e:
            logger.error(f"Erreur lors de l'anonymisation: {e}", exc_info=True)
            # Fallback: remplacement manuel
            return self._manual_replace(text, entities)
    
    def _manual_replace(self, text: str, entities: List[DetectedEntity]) -> str:
        """Remplacement manuel en cas d'échec de Presidio."""
        result = text
        # Tri inverse pour éviter les problèmes d'offset
        for entity in sorted(entities, key=lambda x: x.start, reverse=True):
            result = (
                result[:entity.start] +
                entity.placeholder +
                result[entity.end:]
            )
        return result
    
    def process_document(
        self,
        text: str,
        language: str = "fr",
        min_confidence: float = None,
        strategy: AnonymizationStrategy = AnonymizationStrategy.REPLACE
    ) -> Tuple[str, List[DetectedEntity], float]:
        """
        Pipeline complet: détection + anonymisation.
        
        Args:
            text: Texte à traiter
            language: Langue du texte
            min_confidence: Score minimum
            strategy: Stratégie d'anonymisation
            
        Returns:
            (texte_anonymisé, entités_détectées, temps_traitement_ms)
        """
        start_time = time.time()
        
        # 1. Détection
        entities = self.detect_entities(text, language, min_confidence)
        
        # 2. Anonymisation
        anonymized_text = self.anonymize(text, entities, strategy)
        
        # 3. Stats
        processing_time_ms = (time.time() - start_time) * 1000
        
        self.stats["documents_processed"] += 1
        self.stats["entities_detected"] += len(entities)
        self.stats["total_processing_time_ms"] += processing_time_ms
        
        logger.info(
            f"Document traité: {len(entities)} entités détectées "
            f"en {processing_time_ms:.2f}ms"
        )
        
        return anonymized_text, entities, processing_time_ms
    
    def is_ready(self) -> bool:
        """Vérifie si le moteur est prêt."""
        return self._is_ready and self.spacy_model is not None
    
    def get_stats(self) -> Dict:
        """Retourne les statistiques du moteur."""
        avg_time = 0.0
        if self.stats["documents_processed"] > 0:
            avg_time = (
                self.stats["total_processing_time_ms"] /
                self.stats["documents_processed"]
            )
        
        return {
            **self.stats,
            "avg_processing_time_ms": avg_time
        }


# Instance globale (singleton)
_deid_engine: Optional[DeIDEngine] = None


def get_deid_engine() -> DeIDEngine:
    """Retourne l'instance singleton du DeID Engine."""
    global _deid_engine
    if _deid_engine is None:
        _deid_engine = DeIDEngine()
    return _deid_engine
