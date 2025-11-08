# DocIngestor - Microservice d'Ingestion de Documents

## 🎯 Rôle

Ingestion et extraction de documents médicaux (PDF, DOCX, TXT, HL7, FHIR).

## 📋 Fonctionnalités

- ✅ Upload de documents via API REST
- ✅ Extraction de texte (PDF, DOCX, TXT)
- ✅ OCR pour documents scannés
- ✅ Extraction de métadonnées (auteur, date, type)
- ✅ Stockage dans PostgreSQL
- ✅ Publication vers RabbitMQ pour traitement ultérieur

## 🛠️ Technologies

- **Python 3.10+**
- **FastAPI** - Framework web
- **Apache Tika** - Extraction PDF/DOCX
- **Tesseract OCR** - Reconnaissance optique de caractères
- **psycopg2** - Client PostgreSQL
- **pika** - Client RabbitMQ
- **python-multipart** - Upload de fichiers

## 📦 Installation

```powershell
# Créer l'environnement virtuel
python -m venv venv

# Activer l'environnement
.\venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt
```

## 🚀 Démarrage

```powershell
# Activer l'environnement
.\venv\Scripts\activate

# Lancer le service
python app.py
```

Le service sera accessible sur: http://localhost:8001

## 📡 Endpoints API

### 1. Upload de document

```http
POST /api/v1/documents/upload
Content-Type: multipart/form-data

file: <fichier>
document_type: "compte-rendu" | "ordonnance" | "labo" | "autre"
patient_id: "12345" (optionnel)
```

### 2. Liste des documents

```http
GET /api/v1/documents
```

### 3. Détails d'un document

```http
GET /api/v1/documents/{document_id}
```

### 4. Statut du service

```http
GET /health
```

## 🗄️ Base de Données

**Database:** `docqa_ingestor`

**Table:** `documents`

- id (SERIAL PRIMARY KEY)
- filename (VARCHAR)
- file_type (VARCHAR)
- file_size (BIGINT)
- text_content (TEXT)
- metadata (JSONB)
- patient_id (VARCHAR)
- document_type (VARCHAR)
- processed (BOOLEAN)
- created_at (TIMESTAMP)

## 📨 RabbitMQ

**Queue de sortie:** `documents.raw`

**Message publié:**

```json
{
  "document_id": 123,
  "filename": "cr_patient_123.pdf",
  "text_content": "...",
  "metadata": {
    "patient_id": "12345",
    "document_type": "compte-rendu",
    "upload_date": "2025-11-08T10:00:00"
  }
}
```

## 🧪 Tests

```powershell
# Tests unitaires
pytest tests/

# Test avec un document
curl -X POST http://localhost:8001/api/v1/documents/upload \
  -F "file=@test.pdf" \
  -F "document_type=compte-rendu"
```

## 📁 Structure

```
doc-ingestor/
├── app.py                 # Point d'entrée
├── requirements.txt       # Dépendances Python
├── config.py             # Configuration
├── src/
│   ├── __init__.py
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes.py     # Endpoints API
│   ├── services/
│   │   ├── __init__.py
│   │   ├── extractor.py  # Extraction de texte
│   │   ├── ocr.py        # OCR
│   │   └── metadata.py   # Extraction métadonnées
│   ├── database/
│   │   ├── __init__.py
│   │   └── repository.py # Accès base de données
│   └── messaging/
│       ├── __init__.py
│       └── publisher.py  # Publication RabbitMQ
└── tests/
    ├── __init__.py
    └── test_api.py
```

## 🔧 Configuration

Fichier `.env`:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=docqa_ingestor
DB_USER=docqa_user
DB_PASSWORD=docqa_password

RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=docqa_user
RABBITMQ_PASSWORD=docqa_password
RABBITMQ_QUEUE=documents.raw

SERVICE_PORT=8001
UPLOAD_DIR=./data/documents
TEMP_DIR=./data/temp
```
