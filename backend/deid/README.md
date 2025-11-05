# DeID Service - Désidentification de Documents Cliniques

## 📋 Description

Microservice de désidentification (anonymisation) de documents cliniques utilisant **spaCy** et **Microsoft Presidio**. Détecte et remplace automatiquement les informations personnelles sensibles (PII) dans les documents médicaux français et marocains.

## 🎯 Fonctionnalités

### Détection PII

- **Noms et prénoms** (PERSON)
- **Dates** (DATE_TIME) - dates de naissance, consultations
- **Adresses** (LOCATION) - rues, villes
- **Téléphones** (PHONE_NUMBER) - formats FR/MA
- **Emails** (EMAIL_ADDRESS)
- **IPP** - Identifiant Patient Permanent
- **NDA** - Numéro Dossier Administratif
- **NIR** - Numéro Sécurité Sociale français
- **RPPS** - Répertoire Partagé Professionnels Santé
- **Organisations** (ORG) - hôpitaux, cliniques

### Stratégies d'anonymisation

1. **REPLACE** - Remplacement par placeholders (`<NAME>`, `<DATE>`, etc.)
2. **MASK** - Masquage partiel avec `*`
3. **REDACT** - Suppression complète
4. **HASH** - Hash cryptographique SHA-256
5. **FAKE** - Remplacement par données synthétiques (Faker)

### Évaluation

- Precision, Recall, F1-score sur dataset synthétique
- Métriques globales et par type d'entité
- 15 documents cliniques de test (marocains/français)

## 🚀 Démarrage Rapide

### Installation locale

```bash
# Installer les dépendances
pip install -r requirements.txt

# Télécharger le modèle spaCy français
python -m spacy download fr_core_news_md

# Lancer le service
uvicorn app.main:app --host 0.0.0.0 --port 8002
```

### Docker

```bash
# Build
docker build -t deid-service .

# Run
docker run -p 8002:8002 deid-service
```

## 📡 API Endpoints

### POST /deid

Anonymise un document clinique.

**Requête:**

```json
{
  "doc_id": "CLIN_001",
  "text": "Le patient Ahmed Benali né le 10/02/1975 a consulté le Dr Laila El Amrani à Rabat.",
  "language": "fr",
  "strategy": "replace",
  "min_confidence": 0.5
}
```

**Réponse:**

```json
{
  "doc_id": "CLIN_001",
  "anonymized_text": "Le patient <NAME> né le <DATE> a consulté le Dr <NAME> à <LOCATION>.",
  "entities_detected": [
    {
      "entity": "Ahmed Benali",
      "label": "PERSON",
      "score": 0.95,
      "placeholder": "<NAME>"
    },
    {
      "entity": "10/02/1975",
      "label": "DATE_TIME",
      "score": 0.88,
      "placeholder": "<DATE>"
    },
    {
      "entity": "Dr Laila El Amrani",
      "label": "PERSON",
      "score": 0.92,
      "placeholder": "<NAME>"
    },
    {
      "entity": "Rabat",
      "label": "LOCATION",
      "score": 0.87,
      "placeholder": "<LOCATION>"
    }
  ],
  "total_entities": 4,
  "processing_time_ms": 125.5,
  "confidence_avg": 0.905,
  "status": "success"
}
```

### GET /stats

Statistiques du service.

**Réponse:**

```json
{
  "total_documents": 150,
  "total_entities_detected": 620,
  "avg_entities_per_doc": 4.13,
  "avg_confidence": 0.87,
  "entity_distribution": {
    "PERSON": 230,
    "LOCATION": 120,
    "DATE_TIME": 150,
    "PHONE_NUMBER": 45,
    "EMAIL_ADDRESS": 30,
    "IPP": 45
  },
  "processing_time_avg_ms": 142.3,
  "uptime_seconds": 86400
}
```

### POST /evaluate

Évalue la performance sur le dataset synthétique.

**Requête:**

```json
{
  "dataset_path": "data/synthetic_dataset.json",
  "min_confidence": 0.5,
  "sample_size": 15
}
```

**Réponse:**

```json
{
  "dataset_size": 15,
  "total_expected_entities": 95,
  "total_detected_entities": 88,
  "overall_precision": 0.91,
  "overall_recall": 0.88,
  "overall_f1_score": 0.89,
  "metrics_by_entity": [
    {
      "entity_type": "PERSON",
      "precision": 0.95,
      "recall": 0.92,
      "f1_score": 0.93,
      "true_positives": 28,
      "false_positives": 2,
      "false_negatives": 3,
      "support": 31
    }
  ],
  "processing_time_ms": 1250.5
}
```

### GET /health

Vérification santé du service.

**Réponse:**

```json
{
  "status": "healthy",
  "service": "deid",
  "version": "2.0.0",
  "dependencies": {
    "spacy": "loaded",
    "presidio_analyzer": "ready",
    "presidio_anonymizer": "ready"
  },
  "spacy_model_loaded": true,
  "presidio_ready": true
}
```

## 🧪 Tests

```bash
# Exécuter tous les tests
pytest -v

# Avec couverture
pytest --cov=app --cov-report=html

# Tests spécifiques
pytest app/tests/test_deid_pipeline.py::TestDeIDEngine::test_detect_person_name
```

**Résultats attendus:**

- ✅ 20+ tests unitaires
- ✅ Tests d'intégration bout-en-bout
- ✅ Couverture > 85%

## 📊 Dataset Synthétique

Le fichier `data/synthetic_dataset.json` contient 15 documents cliniques réalistes:

- 8 documents marocains (Casablanca, Rabat, Marrakech, Fès, etc.)
- 7 documents français (Paris, Lyon, Marseille)
- Noms authentiques (Ahmed, Fatima, Youssef, Jean, Marie, etc.)
- IPP, NDA, NIR, RPPS réalistes
- Téléphones formats MA (+212) et FR (+33)

## 🛠 Technologies

- **Python 3.11**
- **FastAPI 0.109.0** - API REST
- **spaCy 3.7.2** - NER (fr_core_news_md)
- **Microsoft Presidio 2.2** - Détection et anonymisation PII
- **PostgreSQL** - Stockage (à venir)
- **RabbitMQ** - Queue deid_queue (à venir)
- **Docker** - Conteneurisation

## 📁 Structure du Projet

```
deid/
├── app/
│   ├── main.py                    # FastAPI app
│   ├── config.py                  # Configuration
│   ├── models.py                  # Schémas Pydantic
│   ├── routes/
│   │   └── deid_routes.py         # Endpoints API
│   ├── services/
│   │   └── deid_engine.py         # Moteur spaCy + Presidio
│   ├── utils/
│   │   └── evaluator.py           # Évaluation P/R/F1
│   └── tests/
│       └── test_deid_pipeline.py  # Tests complets
├── data/
│   └── synthetic_dataset.json     # 15 docs cliniques
├── Dockerfile                     # Multi-stage build
├── requirements.txt
├── pytest.ini
└── README.md
```

## 🔧 Configuration

Variables d'environnement (`.env`):

```bash
# Service
API_PORT=8002
LOG_LEVEL=INFO

# PostgreSQL
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=docqa_db
POSTGRES_USER=docqa
POSTGRES_PASSWORD=docqa_pwd

# RabbitMQ
RABBITMQ_HOST=rabbitmq
RABBITMQ_PORT=5672
RABBITMQ_USER=admin
RABBITMQ_PASSWORD=admin

# spaCy
SPACY_MODEL=fr_core_news_md

# Presidio
PRESIDIO_DEFAULT_LANGUAGE=fr
MIN_CONFIDENCE_SCORE=0.5
```

## 📈 Performance

- **Texte court** (< 500 chars): < 200ms
- **Texte moyen** (1-2KB): < 500ms
- **Texte long** (5-10KB): < 1500ms

**Métriques typiques:**

- Precision: **91%**
- Recall: **88%**
- F1-Score: **89%**

## 🎓 Recognizers Personnalisés

7 recognizers spécifiques au contexte médical français/marocain:

1. **IPP** - `\b(?:IPP[:\s]*)?(\d{8,10})\b`
2. **NDA** - `\b(?:NDA[:\s]*)?([A-Z]{2}\d{6,8})\b`
3. **NIR** - `\b[12]\s?\d{2}\s?(?:0[1-9]|1[0-2])\s?\d{2}\s?\d{3}\s?\d{3}\s?\d{2}\b`
4. **RPPS** - `\b(?:RPPS[:\s]*)?(\d{11})\b`
5. **Téléphone MA** - `\b(?:\+212|0)[5-7]\d{8}\b`
6. **Téléphone FR** - `\b(?:\+33|0)[1-9](?:\s?\d{2}){4}\b`
7. **Email médical** - Emails @chu, @hopital, @clinique, @medecin

## 🚦 Statut

- ✅ **Détection PII** - spaCy + Presidio opérationnels
- ✅ **Anonymisation** - 5 stratégies disponibles
- ✅ **Évaluation** - P/R/F1 sur dataset synthétique
- ✅ **Tests** - 20+ tests unitaires/intégration
- ✅ **API REST** - 4 endpoints FastAPI
- ⏳ **PostgreSQL** - Stockage documents (à intégrer)
- ⏳ **RabbitMQ** - Consommation queue deid_queue (à intégrer)

## 📝 Licence

Projet académique - DocQA-MS Team 2025
