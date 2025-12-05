# 🚪 API Gateway

<div align="center">

![Python](https://img.shields.io/badge/Python-3.11-blue?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)

**🌐 Point d'Entrée Unifié pour l'Architecture Microservices DocQA**

*Routage intelligent • Load Balancing • Authentification centralisée*

[Architecture](#-architecture) •
[Routes](#-routes) •
[Configuration](#-configuration) •
[Installation](#-installation)

</div>

---

## 🎯 Présentation

L'**API Gateway** est le point d'entrée unique de l'écosystème DocQA. Il centralise toutes les requêtes, gère le routage vers les microservices appropriés, et assure la cohérence des communications dans l'architecture distribuée.

```
🌍 Client → 🚪 API Gateway → 🎯 Microservices
```

---

## 🏗️ Architecture

```
                              ┌─────────────────────────────────┐
                              │         API GATEWAY             │
                              │        Port: 8000               │
                              └─────────────┬───────────────────┘
                                            │
          ┌─────────────────────────────────┼─────────────────────────────────┐
          │                                 │                                 │
          ▼                                 ▼                                 ▼
┌─────────────────┐              ┌─────────────────┐              ┌─────────────────┐
│  doc-ingestor   │              │   deid-service  │              │    indexeur     │
│    :8001        │              │     :8002       │              │     :8003       │
└─────────────────┘              └─────────────────┘              └─────────────────┘
          │                                 │                                 │
          ▼                                 ▼                                 ▼
┌─────────────────┐              ┌─────────────────┐              ┌─────────────────┐
│  llm-qa-module  │              │    synthese     │              │  audit-logger   │
│    :8004        │              │     :8005       │              │     :8006       │
└─────────────────┘              └─────────────────┘              └─────────────────┘
```

---

## ✨ Fonctionnalités

### 🔀 Routage Intelligent

| Préfixe | Service Cible | Port | Description |
|---------|--------------|------|-------------|
| `/api/documents` | doc-ingestor | 8001 | Upload & gestion documents |
| `/api/deid` | deid-service | 8002 | Anonymisation |
| `/api/search` | indexeur-semantique | 8003 | Recherche vectorielle |
| `/api/qa` | llm-qa-module | 8004 | Questions/Réponses IA |
| `/api/synthesis` | synthese-comparative | 8005 | Synthèses médicales |
| `/api/audit` | audit-logger | 8006 | Logs & traçabilité |

### 🛡️ Sécurité & Middleware

```python
┌────────────────────────────────────────────────────────────┐
│                    REQUEST PIPELINE                         │
├────────────────────────────────────────────────────────────┤
│  📥 Incoming Request                                        │
│       │                                                     │
│       ▼                                                     │
│  🔐 CORS Middleware (Cross-Origin Resource Sharing)         │
│       │                                                     │
│       ▼                                                     │
│  📝 Logging Middleware (Request/Response tracking)          │
│       │                                                     │
│       ▼                                                     │
│  ⏱️ Timeout Handler (60s default)                           │
│       │                                                     │
│       ▼                                                     │
│  🔄 Proxy to Target Service                                 │
│       │                                                     │
│       ▼                                                     │
│  📤 Response to Client                                      │
└────────────────────────────────────────────────────────────┘
```

### 💓 Health Monitoring

Surveillance continue de tous les services avec endpoints dédiés.

---

## 🛤️ Routes

### 📄 Documents (`/api/documents`)

```bash
# Upload un document
POST /api/documents/upload

# Lister les documents
GET /api/documents

# Obtenir un document
GET /api/documents/{id}

# Supprimer un document
DELETE /api/documents/{id}
```

### 🔒 Anonymisation (`/api/deid`)

```bash
# Anonymiser un document
POST /api/deid/anonymize

# Obtenir les mappings
GET /api/deid/mappings/{document_id}
```

### 🔍 Recherche (`/api/search`)

```bash
# Recherche sémantique
POST /api/search
{
  "query": "diagnostic diabète",
  "patientId": "P12345",
  "topK": 5
}
```

### 🤖 Questions/Réponses (`/api/qa`)

```bash
# Poser une question
POST /api/qa/ask
{
  "question": "Quels traitements sont prescrits?",
  "patientId": "P12345"
}
```

### 📊 Synthèse (`/api/synthesis`)

```bash
# Générer une synthèse
POST /api/synthesis/generate
{
  "documentIds": ["1", "2", "3"],
  "synthesisType": "SUMMARY"
}

# Comparer des patients
POST /api/synthesis/compare
{
  "patientId1": "P001",
  "patientId2": "P002",
  "documentIds1": ["1"],
  "documentIds2": ["2"]
}
```

### 📝 Audit (`/api/audit`)

```bash
# Créer un log
POST /api/audit/logs

# Lister les logs
GET /api/audit/logs?page=0&size=20

# Statistiques
GET /api/audit/stats
```

### 💓 Health Check

```bash
# Santé de la gateway
GET /health

# Santé de tous les services
GET /api/health/all
```

**Response:**
```json
{
  "gateway": "healthy",
  "services": {
    "doc-ingestor": "✅ healthy",
    "deid-service": "✅ healthy",
    "indexeur-semantique": "✅ healthy",
    "llm-qa-module": "✅ healthy",
    "synthese-comparative": "✅ healthy",
    "audit-logger": "✅ healthy"
  },
  "timestamp": "2025-12-05T10:30:00Z"
}
```

---

## ⚙️ Configuration

### Variables d'Environnement

```env
# 🔧 Gateway Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=true

# 🎯 Service URLs
DOC_INGESTOR_URL=http://doc-ingestor:8001
DEID_SERVICE_URL=http://deid-service:8002
INDEXEUR_URL=http://indexeur-semantique:8003
LLM_QA_URL=http://llm-qa-module:8004
SYNTHESE_URL=http://synthese-comparative:8005
AUDIT_URL=http://audit-logger:8006

# ⏱️ Timeouts
REQUEST_TIMEOUT=60
CONNECT_TIMEOUT=10

# 🔐 CORS
ALLOWED_ORIGINS=*
ALLOWED_METHODS=*
ALLOWED_HEADERS=*
```

### Configuration des Services

```python
# config.py
class Settings(BaseSettings):
    # Services endpoints (Docker network)
    SERVICES = {
        "doc-ingestor": "http://doc-ingestor:8001",
        "deid-service": "http://deid-service:8002",
        "indexeur-semantique": "http://indexeur-semantique:8003",
        "llm-qa-module": "http://llm-qa-module:8004",
        "synthese-comparative": "http://synthese-comparative:8005",
        "audit-logger": "http://audit-logger:8006"
    }
```

---

## 📦 Installation

### 🐳 Docker (Recommandé)

```bash
# Depuis la racine du projet
docker-compose up -d api-gateway
```

### 💻 Local

```bash
# 1. Créer l'environnement
cd microservices/api-gateway
python -m venv venv
source venv/bin/activate  # Linux/Mac
.\venv\Scripts\activate   # Windows

# 2. Installer les dépendances
pip install -r requirements.txt

# 3. Configurer
cp .env.example .env

# 4. Lancer
python app.py
```

---

## 📁 Structure du Projet

```
api-gateway/
├── 📄 app.py              # Point d'entrée principal
│   ├── Routing logic      # Logique de routage
│   ├── Health checks      # Vérification services
│   └── Proxy handlers     # Gestionnaires proxy
│
├── ⚙️ config.py           # Configuration
│   └── Service URLs       # URLs des microservices
│
├── 📋 requirements.txt    # Dépendances
│   ├── fastapi           
│   ├── httpx              # Client HTTP async
│   └── uvicorn           
│
└── 🐳 Dockerfile          # Image Docker
```

---

## 🔄 Flux de Données

```
┌──────────┐     ┌──────────────┐     ┌─────────────────┐
│  Client  │────►│  API Gateway │────►│  Microservice   │
│ (React)  │     │   :8000      │     │  (target)       │
└──────────┘     └──────────────┘     └─────────────────┘
     │                  │                     │
     │                  │                     │
     ▼                  ▼                     ▼
┌──────────┐     ┌──────────────┐     ┌─────────────────┐
│ Response │◄────│   Transform  │◄────│    Response     │
│  JSON    │     │   & Forward  │     │    JSON         │
└──────────┘     └──────────────┘     └─────────────────┘
```

---

## 🐛 Troubleshooting

### Service non disponible (503)

```bash
# Vérifier l'état des services
docker-compose ps

# Voir les logs
docker-compose logs api-gateway
docker-compose logs <service-name>
```

### Timeout sur les requêtes LLM

```python
# Augmenter le timeout pour /api/qa
# Le LLM peut prendre jusqu'à 3 minutes
REQUEST_TIMEOUT=180
```

### CORS errors

```bash
# Vérifier la configuration CORS
# En développement, utiliser:
ALLOWED_ORIGINS=*
```

---

## 📊 Métriques

| Métrique | Description |
|----------|-------------|
| `requests_total` | Nombre total de requêtes |
| `requests_by_service` | Requêtes par service |
| `response_time_avg` | Temps de réponse moyen |
| `errors_total` | Nombre d'erreurs |

---

## 🔗 Liens Utiles

| Ressource | URL |
|-----------|-----|
| 📚 Swagger UI | http://localhost:8000/docs |
| 📖 ReDoc | http://localhost:8000/redoc |
| 💓 Health | http://localhost:8000/health |

---

<div align="center">

**Fait avec ❤️ pour DocQA**

*Le routeur intelligent de votre architecture microservices*

</div>
