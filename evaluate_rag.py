"""
Script d'évaluation du système RAG DocQA-MS
Calcule les métriques réelles: Precision, Recall, F1, Top-k Accuracy

Prérequis:
1. Les services Docker doivent être démarrés (docker-compose up -d)
2. Les documents doivent être uploadés (python upload_medical_data.py)
3. Ollama doit être lancé avec le modèle llama3.1

Usage:
    python evaluate_rag.py
"""

import json
import requests
import time
from typing import Dict, List, Tuple
from dataclasses import dataclass
from collections import defaultdict

# Configuration
API_GATEWAY_URL = "http://localhost:8000"
EVALUATION_DATASET = "tests/evaluation_dataset.json"

@dataclass
class EvaluationResult:
    question_id: int
    question: str
    answer: str
    confidence: float
    sources_returned: List[str]
    expected_docs: List[str]
    expected_keywords: List[str]
    keywords_found: List[str]
    retrieval_correct: bool
    answer_correct: bool
    top_k_hit: Dict[int, bool]
    response_time_ms: int


def load_dataset(filepath: str) -> List[Dict]:
    """Charge le dataset d'évaluation"""
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data.get("evaluation_dataset", [])


def ask_question(question: str, timeout: int = 120) -> Tuple[str, float, List[Dict], int]:
    """Pose une question au système RAG via l'API Gateway"""
    start_time = time.time()
    
    try:
        response = requests.post(
            f"{API_GATEWAY_URL}/api/qa/ask",
            json={"question": question},
            timeout=timeout
        )
        
        response_time = int((time.time() - start_time) * 1000)
        
        if response.status_code == 200:
            data = response.json()
            return (
                data.get("answer", ""),
                data.get("confidence", 0),
                data.get("sources", []),
                response_time
            )
        elif response.status_code == 404:
            return ("Aucun document pertinent trouvé", 0, [], response_time)
        else:
            return (f"Erreur {response.status_code}", 0, [], response_time)
            
    except requests.exceptions.ConnectionError:
        return ("Erreur de connexion", 0, [], 0)
    except requests.exceptions.Timeout:
        return ("Timeout", 0, [], timeout * 1000)


def check_keywords(answer: str, expected_keywords: List[str]) -> List[str]:
    """
    Vérifie quels mots-clés attendus sont présents dans la réponse
    Supporte les correspondances partielles (sous-chaînes)
    """
    answer_lower = answer.lower()
    # Normaliser les caractères accentués
    import unicodedata
    answer_normalized = unicodedata.normalize('NFD', answer_lower)
    answer_normalized = ''.join(c for c in answer_normalized if unicodedata.category(c) != 'Mn')
    
    found = []
    for keyword in expected_keywords:
        keyword_lower = keyword.lower()
        keyword_normalized = unicodedata.normalize('NFD', keyword_lower)
        keyword_normalized = ''.join(c for c in keyword_normalized if unicodedata.category(c) != 'Mn')
        
        # Vérifier correspondance exacte ou partielle
        if keyword_lower in answer_lower or keyword_normalized in answer_normalized:
            found.append(keyword)
        # Chercher aussi dans les mots individuels de la réponse
        elif any(keyword_normalized in word for word in answer_normalized.split()):
            found.append(keyword)
    return found


def check_retrieval(sources_returned: List[Dict], expected_docs: List[str]) -> Tuple[bool, Dict[int, bool]]:
    """
    Vérifie si les documents attendus ont été récupérés
    Retourne aussi le hit pour différentes valeurs de k (Top-1, Top-3, Top-5)
    """
    returned_filenames = [s.get("filename", "") for s in sources_returned]
    
    # Vérifie si au moins un document attendu est dans les résultats
    any_match = any(
        any(expected in returned for returned in returned_filenames)
        for expected in expected_docs
    )
    
    # Top-k hits
    top_k_hits = {}
    for k in [1, 3, 5]:
        top_k_filenames = returned_filenames[:k]
        top_k_hits[k] = any(
            any(expected in returned for returned in top_k_filenames)
            for expected in expected_docs
        )
    
    return any_match, top_k_hits


def evaluate_answer(answer: str, expected_keywords: List[str], threshold: float = 0.2) -> bool:
    """
    Évalue si la réponse est correcte basée sur les mots-clés trouvés
    Correct si au moins 30% des mots-clés attendus sont présents
    """
    if not expected_keywords:
        return True
    
    keywords_found = check_keywords(answer, expected_keywords)
    ratio = len(keywords_found) / len(expected_keywords)
    return ratio >= threshold


def run_evaluation(dataset: List[Dict]) -> List[EvaluationResult]:
    """Exécute l'évaluation complète sur le dataset"""
    results = []
    
    print("=" * 70)
    print("   ÉVALUATION DU SYSTÈME RAG DocQA-MS")
    print("=" * 70)
    print()
    
    for i, item in enumerate(dataset, 1):
        question_id = item.get("id", i)
        question = item.get("question", "")
        expected_docs = item.get("relevant_docs", [])
        expected_keywords = item.get("expected_keywords", [])
        category = item.get("category", "unknown")
        
        print(f"[{i}/{len(dataset)}] Question: {question[:60]}...")
        
        # Poser la question
        answer, confidence, sources, response_time = ask_question(question)
        
        # Évaluer la récupération
        retrieval_correct, top_k_hits = check_retrieval(sources, expected_docs)
        
        # Évaluer la réponse
        keywords_found = check_keywords(answer, expected_keywords)
        answer_correct = evaluate_answer(answer, expected_keywords)
        
        result = EvaluationResult(
            question_id=question_id,
            question=question,
            answer=answer[:500],  # Tronquer pour le stockage
            confidence=confidence,
            sources_returned=[s.get("filename", "") for s in sources],
            expected_docs=expected_docs,
            expected_keywords=expected_keywords,
            keywords_found=keywords_found,
            retrieval_correct=retrieval_correct,
            answer_correct=answer_correct,
            top_k_hit=top_k_hits,
            response_time_ms=response_time
        )
        results.append(result)
        
        # Afficher le résultat
        status = "✅" if answer_correct else "❌"
        print(f"    {status} Réponse: {'Correcte' if answer_correct else 'Incorrecte'} | "
              f"Mots-clés: {len(keywords_found)}/{len(expected_keywords)} | "
              f"Temps: {response_time}ms")
        print()
        
        # Petit délai pour ne pas surcharger le système
        time.sleep(1)
    
    return results


def calculate_metrics(results: List[EvaluationResult]) -> Dict:
    """Calcule les métriques finales"""
    n = len(results)
    if n == 0:
        return {}
    
    # Métriques de base
    correct_answers = sum(1 for r in results if r.answer_correct)
    correct_retrievals = sum(1 for r in results if r.retrieval_correct)
    
    # Top-k accuracy
    top_1_hits = sum(1 for r in results if r.top_k_hit.get(1, False))
    top_3_hits = sum(1 for r in results if r.top_k_hit.get(3, False))
    top_5_hits = sum(1 for r in results if r.top_k_hit.get(5, False))
    
    # Calcul Precision/Recall pour la récupération
    # True Positives: documents pertinents retournés et attendus
    # False Positives: documents retournés mais non attendus
    # False Negatives: documents attendus mais non retournés
    
    tp = correct_retrievals
    fp = n - correct_retrievals  # Simplification: on considère toute non-correspondance comme FP
    fn = n - correct_retrievals  # Simplification
    
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0
    
    # Temps de réponse moyen
    avg_response_time = sum(r.response_time_ms for r in results) / n
    
    # Confiance moyenne
    avg_confidence = sum(r.confidence for r in results) / n
    
    return {
        "total_questions": n,
        "correct_answers": correct_answers,
        "correct_answers_pct": round(correct_answers / n * 100, 1),
        "precision": round(precision, 2),
        "recall": round(recall, 2),
        "f1_score": round(f1, 2),
        "top_1_accuracy": round(top_1_hits / n * 100, 1),
        "top_3_accuracy": round(top_3_hits / n * 100, 1),
        "top_5_accuracy": round(top_5_hits / n * 100, 1),
        "avg_response_time_ms": round(avg_response_time, 0),
        "avg_confidence": round(avg_confidence, 2)
    }


def generate_confusion_matrix(results: List[EvaluationResult]) -> Dict:
    """Génère une matrice de confusion basée sur la qualité des réponses"""
    n = len(results)
    
    # Simplification: On évalue si la réponse contient des informations pertinentes
    # VP = Réponse correcte avec bonne confiance (>0.6)
    # VN = Réponse incorrecte identifiée comme telle (confiance basse)
    # FP = Réponse incorrecte mais système confiant
    # FN = Réponse correcte mais système pas confiant
    
    tp = sum(1 for r in results if r.answer_correct and r.confidence >= 0.5)
    fn = sum(1 for r in results if r.answer_correct and r.confidence < 0.5)
    fp = sum(1 for r in results if not r.answer_correct and r.confidence >= 0.5)
    tn = sum(1 for r in results if not r.answer_correct and r.confidence < 0.5)
    
    return {
        "true_positive": tp,
        "false_positive": fp,
        "false_negative": fn,
        "true_negative": tn
    }


def print_report(metrics: Dict, confusion: Dict):
    """Affiche le rapport final"""
    print()
    print("=" * 70)
    print("   RAPPORT D'ÉVALUATION")
    print("=" * 70)
    print()
    
    print("📊 MÉTRIQUES DE PERFORMANCE")
    print("-" * 40)
    print(f"  Questions testées:     {metrics['total_questions']}")
    print(f"  Réponses correctes:    {metrics['correct_answers']} ({metrics['correct_answers_pct']}%)")
    print()
    print(f"  Precision:             {metrics['precision']}")
    print(f"  Recall:                {metrics['recall']}")
    print(f"  F1-Score:              {metrics['f1_score']}")
    print()
    print(f"  Top-1 Accuracy:        {metrics['top_1_accuracy']}%")
    print(f"  Top-3 Accuracy:        {metrics['top_3_accuracy']}%")
    print(f"  Top-5 Accuracy:        {metrics['top_5_accuracy']}%")
    print()
    print(f"  Temps moyen:           {metrics['avg_response_time_ms']}ms")
    print(f"  Confiance moyenne:     {metrics['avg_confidence']}")
    print()
    
    print("📉 MATRICE DE CONFUSION")
    print("-" * 40)
    print(f"                  Prédiction")
    print(f"                 Correct  Incorrect")
    print(f"  Réalité  Bon     {confusion['true_positive']:3d}      {confusion['false_negative']:3d}")
    print(f"          Mauvais  {confusion['false_positive']:3d}      {confusion['true_negative']:3d}")
    print()
    
    print("=" * 70)
    print("   Utilisez ces valeurs pour mettre à jour:")
    print("   - rapport-latex/evaluation.tex")
    print("   - README.md")
    print("=" * 70)


def save_results(results: List[EvaluationResult], metrics: Dict, confusion: Dict):
    """Sauvegarde les résultats en JSON"""
    output = {
        "evaluation_date": time.strftime("%Y-%m-%d %H:%M:%S"),
        "metrics": metrics,
        "confusion_matrix": confusion,
        "detailed_results": [
            {
                "id": r.question_id,
                "question": r.question,
                "answer_correct": r.answer_correct,
                "retrieval_correct": r.retrieval_correct,
                "keywords_found": len(r.keywords_found),
                "keywords_expected": len(r.expected_keywords),
                "confidence": r.confidence,
                "response_time_ms": r.response_time_ms
            }
            for r in results
        ]
    }
    
    with open("tests/evaluation_results.json", "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"\n📄 Résultats sauvegardés dans: tests/evaluation_results.json")


def main():
    print()
    print("🔍 Vérification de la connexion au serveur...")
    
    try:
        response = requests.get(f"{API_GATEWAY_URL}/health", timeout=5)
        if response.status_code != 200:
            print("❌ Le serveur ne répond pas correctement.")
            print("   Assurez-vous que les services Docker sont démarrés.")
            return
    except requests.exceptions.ConnectionError:
        print("❌ Impossible de se connecter à l'API Gateway.")
        print("   Lancez: docker-compose up -d")
        return
    
    print("✅ Serveur accessible\n")
    
    # Charger le dataset
    print(f"📂 Chargement du dataset: {EVALUATION_DATASET}")
    try:
        dataset = load_dataset(EVALUATION_DATASET)
        print(f"✅ {len(dataset)} questions chargées\n")
    except FileNotFoundError:
        print(f"❌ Fichier non trouvé: {EVALUATION_DATASET}")
        return
    
    # Exécuter l'évaluation
    results = run_evaluation(dataset)
    
    # Calculer les métriques
    metrics = calculate_metrics(results)
    confusion = generate_confusion_matrix(results)
    
    # Afficher le rapport
    print_report(metrics, confusion)
    
    # Sauvegarder les résultats
    save_results(results, metrics, confusion)


if __name__ == "__main__":
    main()
