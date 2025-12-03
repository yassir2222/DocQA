# LLM QA Module - RAG avec Mistral Nemo 12B

Module de Questions/Reponses utilisant l'architecture RAG (Retrieval-Augmented Generation) avec Mistral Nemo 12B Instruct.

## Architecture RAG

```
                    +-------------------+
                    |     Question      |
                    +--------+----------+
                             |
                             v
+------------------+    +----+----+    +------------------+
|  IndexeurSeman-  |<---|  Query  |--->|  Query Expansion |
|     tique        |    | Router  |    | (Medical Terms)  |
+--------+---------+    +---------+    +------------------+
         |
         v
+--------+---------+
|  Vector Search   |
|  (Semantic)      |
+--------+---------+
         |
         v
+--------+---------+
|    Reranking     |
|   (LLM-based)    |
+--------+---------+
         |
         v
+--------+---------+
|  Context Builder |
|  (Top K docs)    |
+--------+---------+
         |
         v
+--------+---------+
|  Mistral Nemo    |
|  12B Instruct    |
+--------+---------+
         |
         v
+--------+---------+
|  Answer + Sources|
|  + Confidence    |
+------------------+
```

## Modele LLM

**Mistral Nemo 12B Instruct**

- Taille: 12 milliards de parametres
- Context window: 128K tokens (utilise 8K pour RAG)
- Optimise pour les instructions et le dialogue
- Performance excellente en francais

### Installation Ollama

```bash
# Installer Ollama
# Windows: https://ollama.ai/download

# Telecharger Mistral Nemo
ollama pull mistral-nemo

# Verifier l'installation
ollama list
```

## Configuration

### Variables d'environnement

```env
# Ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=mistral-nemo
USE_LOCAL_LLM=true

# Parametres LLM
LLM_TEMPERATURE=0.1      # Faible pour reponses factuelles
LLM_TOP_P=0.9
LLM_TOP_K=40
LLM_NUM_CTX=8192         # Contexte pour RAG

# RAG
RAG_TOP_K_RESULTS=5      # Documents a recuperer
RAG_SIMILARITY_THRESHOLD=0.3
USE_RERANKING=true       # Reranking LLM
RERANK_TOP_K=3           # Documents finaux
MAX_CONTEXT_LENGTH=6000  # Contexte max
```

## API Endpoints

### POST /api/qa/ask

Pose une question avec RAG.

```json
{
  "question": "Quels sont les traitements prescrits au patient?",
  "patient_id": "P001",
  "max_context_docs": 5
}
```

Response:

```json
{
  "answer": "Selon les documents [SOURCE 1], le patient...",
  "confidence": 0.85,
  "sources": [
    {
      "index": 1,
      "filename": "ordonnance-001.pdf",
      "excerpt": "..."
    }
  ],
  "processing_time_ms": 1234,
  "query_id": "uuid"
}
```

### POST /api/qa/extract

Extrait des informations medicales structurees.

```json
{
  "document_id": "123",
  "extraction_type": "pathologies" // pathologies, traitements, antecedents
}
```

### GET /api/qa/history/{session_id}

Recupere l'historique de chat.

## Pipeline RAG

### 1. Query Expansion

Enrichit la question avec des termes medicaux synonymes.

```python
"diabete" -> "diabete glucose glycemie insuline"
"hypertension" -> "hypertension tension arterielle HTA"
```

### 2. Semantic Search

Recherche vectorielle via IndexeurSemantique.

### 3. Reranking (optionnel)

Re-score les documents avec le LLM pour meilleure pertinence.

### 4. Context Building

Construit le contexte avec les meilleurs documents.

- Maximum 6000 caracteres
- Truncation intelligente aux limites de phrases
- Metadata inclus (filename, type, patient)

### 5. Generation

Prompt optimise pour Mistral Nemo avec:

- Instructions systeme medicales
- Format de citation des sources
- Gestion de l'incertitude

### 6. Confidence Scoring

Score de confiance base sur:

- Nombre de sources citees
- Longueur de la reponse
- Termes medicaux utilises
- Indicateurs d'incertitude

## Performance

| Metrique         | Valeur      |
| ---------------- | ----------- |
| Temps generation | ~2-5s       |
| Tokens/seconde   | ~30-50      |
| Memoire GPU      | ~8GB        |
| Contexte max     | 8192 tokens |

## Requirements

```txt
fastapi>=0.104.0
uvicorn>=0.24.0
httpx>=0.25.0
pydantic>=2.5.0
pydantic-settings>=2.1.0
```

## Demarrage

```bash
# Local
cd microservices/llm-qa-module
pip install -r requirements.txt
python app.py

# Docker
docker-compose up llm-qa-module
```

## Notes

- Ollama doit etre installe et en cours d'execution
- Mistral Nemo necessite ~8GB de VRAM GPU ou ~16GB RAM (CPU)
- Le mode CPU est plus lent mais fonctionnel
