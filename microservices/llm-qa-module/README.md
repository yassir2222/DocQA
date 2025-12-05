# 🤖 LLM QA Module

<div align="center">

![Python](https://img.shields.io/badge/Python-3.11-blue?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Ollama](https://img.shields.io/badge/Ollama-Mistral_Nemo-black?style=for-the-badge&logo=ollama&logoColor=white)
![RAG](https://img.shields.io/badge/RAG-Enabled-purple?style=for-the-badge)

**🏥 Module de Questions/Réponses Médicales avec Intelligence Artificielle**

*RAG Architecture • Mistral Nemo 12B • Réponses contextuelles précises*

[Architecture](#-architecture-rag) •
[Fonctionnalités](#-fonctionnalités) •
[API](#-api-endpoints) •
[Configuration](#-configuration)

</div>

---

## 🎯 Présentation

**LLM QA Module** est le cerveau de DocQA. Il permet aux professionnels de santé de poser des questions en langage naturel sur les dossiers patients et d'obtenir des réponses précises, sourcées et contextuelles grâce à l'architecture RAG (Retrieval-Augmented Generation).

```
❓ Question → 🔍 Recherche Documents → 🧠 LLM Analysis → 💬 Réponse Sourcée
```

---

## 🏗️ Architecture RAG

```
                         ┌─────────────────────────────────┐
                         │         QUESTION UTILISATEUR     │
                         │  "Quels traitements prescrits?" │
                         └─────────────┬───────────────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
                    ▼                  ▼                  ▼
         ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
         │  Query Router   │ │ Query Expansion │ │ Medical Terms   │
         │  (Filtrage)     │ │ (Synonymes)     │ │ Enhancement     │
         └────────┬────────┘ └────────┬────────┘ └────────┬────────┘
                  │                   │                   │
                  └───────────────────┼───────────────────┘
                                      │
                                      ▼
                         ┌─────────────────────────────────┐
                         │      INDEXEUR SÉMANTIQUE        │
                         │   Recherche Vectorielle Top-K   │
                         └─────────────┬───────────────────┘
                                       │
                                       ▼
                         ┌─────────────────────────────────┐
                         │         RERANKING (LLM)         │
                         │    Tri par pertinence réelle    │
                         └─────────────┬───────────────────┘
                                       │
                                       ▼
                         ┌─────────────────────────────────┐
                         │        CONTEXT BUILDER          │
                         │  Construction du contexte RAG   │
                         │     (max 12000 caractères)      │
                         └─────────────┬───────────────────┘
                                       │
                                       ▼
                         ┌─────────────────────────────────┐
                         │       MISTRAL NEMO 12B          │
                         │    Génération de la réponse     │
                         │   avec citations des sources    │
                         └─────────────┬───────────────────┘
                                       │
                                       ▼
                         ┌─────────────────────────────────┐
                         │    RÉPONSE + SOURCES + SCORE    │
                         │  "Selon [Source 1], le patient  │
                         │   est traité par..." (0.89)     │
                         └─────────────────────────────────┘
```

---

## ✨ Fonctionnalités

### 🧠 Modèle LLM : Mistral Nemo 12B Instruct

| Caractéristique | Valeur |
|-----------------|--------|
| **Paramètres** | 12 milliards |
| **Context Window** | 128K tokens (16K utilisés) |
| **Langue** | Français excellent |
| **Type** | Instruction-tuned |
| **Mémoire** | ~8GB VRAM / ~16GB RAM |

### ⚡ Paramètres Optimisés pour le Médical

```python
# Configuration optimale pour réponses médicales précises
LLM_TEMPERATURE = 0.05      # Très faible → réponses factuelles
LLM_TOP_P = 0.85            # Focalisé sur les tokens probables
LLM_TOP_K = 30              # Limité pour plus de déterminisme
LLM_NUM_CTX = 16384         # Grand contexte pour RAG
LLM_REPEAT_PENALTY = 1.15   # Évite les répétitions
```

### 🔍 Pipeline RAG Complet

| Étape | Description | Config |
|-------|-------------|--------|
| 1️⃣ **Query Expansion** | Enrichissement avec synonymes médicaux | Auto |
| 2️⃣ **Vector Search** | Recherche sémantique via Indexeur | Top 5 |
| 3️⃣ **Reranking** | Re-scoring par pertinence LLM | Top 3 |
| 4️⃣ **Context Building** | Construction contexte structuré | 12K chars |
| 5️⃣ **Generation** | Génération réponse Mistral | Streaming |
| 6️⃣ **Confidence** | Calcul score de confiance | 0-1 |

### 📊 Scoring de Confiance

```
Score basé sur:
├── 📚 Nombre de sources citées (30%)
├── 📏 Longueur de la réponse (20%)
├── 🏥 Termes médicaux utilisés (25%)
└── ⚠️ Absence d'incertitude (25%)
```

---

## 🛠️ API Endpoints

### `POST /api/qa/ask`

Pose une question avec contexte RAG.

```bash
curl -X POST "http://localhost:8004/api/qa/ask" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Quels sont les traitements prescrits au patient?",
    "patientId": "P12345",
    "maxContextDocs": 5
  }'
```

**Response:**
```json
{
  "answer": "D'après les documents médicaux analysés, le patient bénéficie des traitements suivants:\n\n1. **Donépézil 5mg/jour** - prescrit pour la suspicion de maladie d'Alzheimer au stade prodromal\n2. **Bilan orthophonique** - pour stimulation cognitive\n\nUn suivi en hôpital de jour gériatrique est également prévu pour un bilan complet.",
  "confidence": 0.89,
  "sources": [
    {
      "index": 1,
      "filename": "Consultation_Neuro_001.pdf",
      "excerpt": "Débuter traitement par donépézil 5 mg/jour..."
    }
  ],
  "processingTimeMs": 15234,
  "queryId": "qa-uuid-12345"
}
```

### `POST /api/qa/extract`

Extrait des informations structurées.

```bash
curl -X POST "http://localhost:8004/api/qa/extract" \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": "123",
    "extractionType": "pathologies"
  }'
```

**Types d'extraction:**
- `pathologies` - Maladies et diagnostics
- `traitements` - Médicaments et posologies
- `antecedents` - Historique médical

### `GET /api/qa/history/{sessionId}`

Récupère l'historique de chat.

```json
{
  "sessionId": "session-uuid",
  "messages": [
    {
      "role": "user",
      "content": "Quels traitements?",
      "timestamp": "2025-12-05T10:30:00Z"
    },
    {
      "role": "assistant", 
      "content": "Le patient...",
      "sources": [...],
      "timestamp": "2025-12-05T10:30:15Z"
    }
  ]
}
```

### `GET /health`

```json
{
  "status": "healthy",
  "llm": {
    "model": "mistral-nemo",
    "status": "connected",
    "responseTimeMs": 234
  },
  "indexeur": "connected",
  "version": "1.0.0"
}
```

---

## ⚙️ Configuration

### Variables d'Environnement

```env
# 🔧 Service
SERVICE_NAME=LLMQAModule
SERVICE_PORT=8004
SERVICE_HOST=0.0.0.0

# 🤖 Ollama / Mistral Nemo
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=mistral-nemo
USE_LOCAL_LLM=true

# 🎛️ Paramètres LLM (Optimisés Médical)
LLM_TEMPERATURE=0.05
LLM_TOP_P=0.85
LLM_TOP_K=30
LLM_NUM_CTX=16384
LLM_REPEAT_PENALTY=1.15

# 🔍 RAG Configuration
RAG_TOP_K_RESULTS=5
RAG_CHUNK_SIZE=1024
RAG_CHUNK_OVERLAP=100
RAG_SIMILARITY_THRESHOLD=0.25
MAX_CONTEXT_LENGTH=12000

# 🔄 Reranking
USE_RERANKING=true
RERANK_TOP_K=3

# 🔗 Services
INDEXEUR_SERVICE_URL=http://indexeur-semantique:8003
AUDIT_SERVICE_URL=http://audit-logger:8006
```

---

## 📦 Installation

### Prérequis: Ollama + Mistral Nemo

```bash
# 1. Installer Ollama
# Windows: https://ollama.ai/download
# Linux: curl -fsSL https://ollama.ai/install.sh | sh

# 2. Télécharger Mistral Nemo (7.1GB)
ollama pull mistral-nemo

# 3. Vérifier
ollama list
# NAME           SIZE
# mistral-nemo   7.1GB
```

### 🐳 Docker (Recommandé)

```bash
# Depuis la racine du projet
docker-compose up -d llm-qa-module
```

> ⚠️ Le conteneur accède à Ollama via `host.docker.internal:11434`

### 💻 Local

```bash
# 1. Environnement
cd microservices/llm-qa-module
python -m venv venv
source venv/bin/activate

# 2. Dépendances
pip install -r requirements.txt

# 3. Configuration
cp .env.example .env

# 4. Lancer
python app.py
```

---

## 📁 Structure du Projet

```
llm-qa-module/
├── 📄 app.py                 # Point d'entrée FastAPI
├── ⚙️ config.py              # Configuration Pydantic
├── 📋 requirements.txt       # Dépendances
├── 🐳 Dockerfile            
│
└── 📂 src/
    ├── 📂 api/
    │   └── routes.py         # Endpoints REST
    │
    ├── 📂 services/
    │   ├── qa_service.py     # Logique RAG principale
    │   ├── llm_client.py     # Client Ollama
    │   ├── indexer_client.py # Client Indexeur
    │   └── prompt_builder.py # Construction prompts
    │
    └── 📂 models/
        └── schemas.py        # Pydantic models
```

---

## 🎯 Prompt Engineering

### Prompt Système Médical

```python
SYSTEM_PROMPT = """
Tu es un assistant médical expert francophone spécialisé dans 
l'analyse de dossiers patients. Tu fournis des réponses précises, 
structurées et professionnelles basées uniquement sur les documents 
fournis.

RÈGLES:
- Cite toujours tes sources [Source X]
- Utilise la terminologie médicale appropriée  
- Structure ta réponse avec des listes si pertinent
- Si l'information n'est pas disponible, dis-le clairement
- Ne fais JAMAIS de diagnostic non mentionné dans les documents
"""
```

### Template de Réponse

```
CONTEXTE MÉDICAL:
{documents_context}

QUESTION: {question}

Réponds de manière professionnelle et structurée en citant les sources.
```

---

## 📊 Performance

| Métrique | Valeur |
|----------|--------|
| ⏱️ Temps génération | 15-30s |
| 📊 Tokens/seconde | 30-50 |
| 💾 Mémoire GPU | ~8GB |
| 📝 Context max | 16K tokens |
| 🎯 Précision RAG | ~85% |

---

## 🐛 Troubleshooting

### Ollama non connecté

```bash
# Vérifier qu'Ollama tourne
curl http://localhost:11434/api/tags

# Relancer Ollama
ollama serve
```

### Timeout sur les requêtes

```python
# Augmenter le timeout (config.py ou env)
LLM_TIMEOUT=180  # 3 minutes pour requêtes complexes
```

### Mémoire insuffisante

```bash
# Mode CPU (plus lent mais fonctionne)
# Ollama utilise automatiquement le CPU si pas de GPU

# Vérifier la RAM disponible (besoin ~16GB)
```

---

## 🔗 Flux RAG Complet

```
┌────────────┐    ┌──────────────┐    ┌───────────────┐    ┌────────────┐
│  Frontend  │───►│ LLM-QA-Module│───►│   Indexeur    │───►│  Mistral   │
│ (Question) │    │              │    │  (Recherche)  │    │   Nemo     │
└────────────┘    └──────────────┘    └───────────────┘    └────────────┘
      │                  │                   │                   │
      │                  │                   │                   │
      ▼                  ▼                   ▼                   ▼
   "Quels          Query + Filter       Top 5 Docs         Réponse
  traitements?"    par patientId        Pertinents        Structurée
```

---

<div align="center">

**Fait avec ❤️ pour DocQA**

*L'IA au service des professionnels de santé*

🧠 **Mistral Nemo 12B** | 🔍 **RAG Architecture** | 🏥 **Médical-First**

</div>
