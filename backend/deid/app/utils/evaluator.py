"""
Évaluateur de performance du système de désidentification.
Calcule Precision, Recall, F1-score sur le dataset synthétique.
"""
import json
import logging
from typing import List, Dict, Tuple, Set
from collections import defaultdict
from pathlib import Path

from app.models import DetectedEntity, EvaluationMetrics, EvaluationResponse
from app.services.deid_engine import DeIDEngine

logger = logging.getLogger(__name__)


class DeIDEvaluator:
    """
    Évaluateur de qualité de la désidentification.
    Compare les entités détectées avec les entités attendues.
    """
    
    def __init__(self, deid_engine: DeIDEngine):
        """
        Initialise l'évaluateur.
        
        Args:
            deid_engine: Moteur de désidentification à évaluer
        """
        self.engine = deid_engine
    
    def load_dataset(self, dataset_path: str) -> List[Dict]:
        """
        Charge le dataset synthétique.
        
        Args:
            dataset_path: Chemin vers le fichier JSON
            
        Returns:
            Liste des documents avec leurs entités attendues
        """
        try:
            path = Path(dataset_path)
            if not path.exists():
                raise FileNotFoundError(f"Dataset non trouvé: {dataset_path}")
            
            with open(path, 'r', encoding='utf-8') as f:
                dataset = json.load(f)
            
            logger.info(f"✓ Dataset chargé: {len(dataset)} documents")
            return dataset
            
        except Exception as e:
            logger.error(f"✗ Erreur chargement dataset: {e}")
            raise
    
    def normalize_entity(self, entity_text: str) -> str:
        """
        Normalise une entité pour la comparaison.
        
        Args:
            entity_text: Texte de l'entité
            
        Returns:
            Texte normalisé (lowercase, stripped)
        """
        return entity_text.strip().lower()
    
    def match_entities(
        self,
        detected: List[DetectedEntity],
        expected: List[Dict],
        text: str
    ) -> Tuple[Set[str], Set[str], Set[str]]:
        """
        Compare les entités détectées avec les entités attendues.
        
        Args:
            detected: Entités détectées par le moteur
            expected: Entités attendues du dataset
            text: Texte original (pour extraire les entités attendues)
            
        Returns:
            (true_positives, false_positives, false_negatives)
            Chaque set contient des clés: "text|label"
        """
        # Convertir detected en set de "text|label"
        detected_set = set()
        for entity in detected:
            key = f"{self.normalize_entity(entity.entity)}|{entity.label}"
            detected_set.add(key)
        
        # Convertir expected en set de "text|label"
        expected_set = set()
        for entity in expected:
            # Si 'text' fourni directement
            if 'text' in entity:
                entity_text = entity['text']
            # Sinon extraire du texte original via start/end si disponibles
            elif 'start' in entity and 'end' in entity:
                entity_text = text[entity['start']:entity['end']]
            else:
                continue
            
            key = f"{self.normalize_entity(entity_text)}|{entity['label']}"
            expected_set.add(key)
        
        # Calcul TP, FP, FN
        true_positives = detected_set & expected_set
        false_positives = detected_set - expected_set
        false_negatives = expected_set - detected_set
        
        return true_positives, false_positives, false_negatives
    
    def calculate_metrics(
        self,
        true_positives: int,
        false_positives: int,
        false_negatives: int
    ) -> Tuple[float, float, float]:
        """
        Calcule Precision, Recall, F1-score.
        
        Args:
            true_positives: Nombre de vrais positifs
            false_positives: Nombre de faux positifs
            false_negatives: Nombre de faux négatifs
            
        Returns:
            (precision, recall, f1_score)
        """
        # Precision = TP / (TP + FP)
        if true_positives + false_positives > 0:
            precision = true_positives / (true_positives + false_positives)
        else:
            precision = 0.0
        
        # Recall = TP / (TP + FN)
        if true_positives + false_negatives > 0:
            recall = true_positives / (true_positives + false_negatives)
        else:
            recall = 0.0
        
        # F1-score = 2 * (Precision * Recall) / (Precision + Recall)
        if precision + recall > 0:
            f1_score = 2 * (precision * recall) / (precision + recall)
        else:
            f1_score = 0.0
        
        return precision, recall, f1_score
    
    def evaluate(
        self,
        dataset_path: str,
        min_confidence: float = 0.5,
        sample_size: int = None
    ) -> EvaluationResponse:
        """
        Évalue la performance sur le dataset synthétique.
        
        Args:
            dataset_path: Chemin vers le dataset
            min_confidence: Score minimum de confiance
            sample_size: Nombre d'échantillons (None = tous)
            
        Returns:
            Résultats d'évaluation détaillés
        """
        import time
        start_time = time.time()
        
        # 1. Charger le dataset
        dataset = self.load_dataset(dataset_path)
        
        if sample_size and sample_size < len(dataset):
            dataset = dataset[:sample_size]
            logger.info(f"Échantillonnage: {sample_size} documents")
        
        # 2. Structures pour accumuler les résultats
        overall_tp = 0
        overall_fp = 0
        overall_fn = 0
        
        # Métriques par type d'entité
        entity_metrics = defaultdict(lambda: {
            'tp': 0, 'fp': 0, 'fn': 0, 'support': 0
        })
        
        total_detected = 0
        total_expected = 0
        
        # 3. Traiter chaque document
        for doc in dataset:
            doc_id = doc['id']
            text = doc['text']
            expected_entities = doc.get('expected_entities', [])
            
            # Détecter les entités
            detected_entities = self.engine.detect_entities(
                text=text,
                language='fr',
                min_confidence=min_confidence
            )
            
            # Comparer avec les entités attendues
            tp_set, fp_set, fn_set = self.match_entities(
                detected_entities,
                expected_entities,
                text
            )
            
            # Accumuler les totaux
            overall_tp += len(tp_set)
            overall_fp += len(fp_set)
            overall_fn += len(fn_set)
            
            total_detected += len(detected_entities)
            total_expected += len(expected_entities)
            
            # Métriques par type d'entité
            # TP
            for key in tp_set:
                _, label = key.rsplit('|', 1)
                entity_metrics[label]['tp'] += 1
            
            # FP
            for key in fp_set:
                _, label = key.rsplit('|', 1)
                entity_metrics[label]['fp'] += 1
            
            # FN
            for key in fn_set:
                _, label = key.rsplit('|', 1)
                entity_metrics[label]['fn'] += 1
            
            # Support (nombre attendu)
            for entity in expected_entities:
                label = entity['label']
                entity_metrics[label]['support'] += 1
        
        # 4. Calculer les métriques globales
        overall_precision, overall_recall, overall_f1 = self.calculate_metrics(
            overall_tp, overall_fp, overall_fn
        )
        
        # 5. Calculer les métriques par type d'entité
        metrics_by_entity = []
        for entity_type, counts in entity_metrics.items():
            precision, recall, f1 = self.calculate_metrics(
                counts['tp'], counts['fp'], counts['fn']
            )
            
            metrics_by_entity.append(EvaluationMetrics(
                entity_type=entity_type,
                precision=round(precision, 4),
                recall=round(recall, 4),
                f1_score=round(f1, 4),
                true_positives=counts['tp'],
                false_positives=counts['fp'],
                false_negatives=counts['fn'],
                support=counts['support']
            ))
        
        # Trier par F1-score décroissant
        metrics_by_entity.sort(key=lambda x: x.f1_score, reverse=True)
        
        # 6. Temps de traitement
        processing_time_ms = (time.time() - start_time) * 1000
        
        # 7. Créer la réponse
        result = EvaluationResponse(
            dataset_size=len(dataset),
            total_expected_entities=total_expected,
            total_detected_entities=total_detected,
            overall_precision=round(overall_precision, 4),
            overall_recall=round(overall_recall, 4),
            overall_f1_score=round(overall_f1, 4),
            metrics_by_entity=metrics_by_entity,
            processing_time_ms=round(processing_time_ms, 2)
        )
        
        # 8. Log résumé
        logger.info(
            f"✓ Évaluation terminée: {len(dataset)} docs, "
            f"P={overall_precision:.2f}, R={overall_recall:.2f}, "
            f"F1={overall_f1:.2f} en {processing_time_ms:.0f}ms"
        )
        
        return result
    
    def print_evaluation_report(self, result: EvaluationResponse):
        """
        Affiche un rapport d'évaluation lisible.
        
        Args:
            result: Résultats d'évaluation
        """
        print("\n" + "=" * 80)
        print("RAPPORT D'ÉVALUATION - DÉSIDENTIFICATION")
        print("=" * 80)
        print(f"\nDataset: {result.dataset_size} documents")
        print(f"Entités attendues: {result.total_expected_entities}")
        print(f"Entités détectées: {result.total_detected_entities}")
        print(f"Temps de traitement: {result.processing_time_ms:.0f}ms")
        
        print("\n" + "-" * 80)
        print("MÉTRIQUES GLOBALES")
        print("-" * 80)
        print(f"Precision: {result.overall_precision:.2%}")
        print(f"Recall:    {result.overall_recall:.2%}")
        print(f"F1-Score:  {result.overall_f1_score:.2%}")
        
        print("\n" + "-" * 80)
        print("MÉTRIQUES PAR TYPE D'ENTITÉ")
        print("-" * 80)
        print(f"{'Type':<20} {'Precision':<12} {'Recall':<12} {'F1-Score':<12} {'Support':<10}")
        print("-" * 80)
        
        for metric in result.metrics_by_entity:
            print(
                f"{metric.entity_type:<20} "
                f"{metric.precision:<12.2%} "
                f"{metric.recall:<12.2%} "
                f"{metric.f1_score:<12.2%} "
                f"{metric.support:<10}"
            )
        
        print("=" * 80 + "\n")
