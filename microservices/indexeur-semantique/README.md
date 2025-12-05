# 🔍 Indexeur Sémantique

<div align="center">

![Java](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2-6DB33F?style=for-the-badge&logo=spring&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![PyTorch](https://img.shields.io/badge/PyTorch-DJL-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)

**🧠 Moteur de Recherche Vectorielle pour Documents Médicaux**

*Embeddings sémantiques • Recherche par similarité • RAG-Ready*

[Architecture](#-architecture) •
[Fonctionnalités](#-fonctionnalités) •
[API](#-api-endpoints) •
[Installation](#-installation)

</div>

---

## 🎯 Présentation

**Indexeur Sémantique** transforme vos documents médicaux en vecteurs sémantiques, permettant une recherche intelligente basée sur le sens plutôt que sur les mots-clés. C'est le cœur du système RAG (Retrieval-Augmented Generation) de DocQA.

```
📄 Document → 🧠 Embedding → 📊 Vecteur 384D → 🔍 Recherche Sémantique
```

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                    INDEXEUR SÉMANTIQUE                              │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌──────────────┐                                                  │
│   │   RabbitMQ   │     documents.anonymized                         │
│   │   Consumer   │◄────────────────────────                         │
│   └──────┬───────┘                                                  │
│          │                                                          │
│          ▼                                                          │
│   ┌──────────────────────────────────────────────────────┐         │
│   │              EMBEDDING SERVICE                        │         │
│   │  ┌────────────────────────────────────────────────┐  │         │
│   │  │      Sentence Transformers (DJL)               │  │         │
│   │  │   all-MiniLM-L6-v2 (384 dimensions)           │  │         │
│   │  └────────────────────────────────────────────────┘  │         │
│   └──────────────────────────┬───────────────────────────┘         │
│                              │                                      │
│                              ▼                                      │
│   ┌──────────────────────────────────────────────────────┐         │
│   │              INDEXING SERVICE                         │         │
│   │  ┌─────────────────┐  ┌─────────────────────────┐   │         │
│   │  │ Document Store  │  │   Vector Storage        │   │         │
│   │  │  (PostgreSQL)   │  │   (float8[] arrays)     │   │         │
│   │  └─────────────────┘  └─────────────────────────┘   │         │
│   └──────────────────────────────────────────────────────┘         │
│                              │                                      │
│                              ▼                                      │
│   ┌──────────────────────────────────────────────────────┐         │
│   │              SEARCH SERVICE                           │         │
│   │  ┌─────────────────┐  ┌─────────────────────────┐   │         │
│   │  │ Query Embedding │  │  Cosine Similarity      │   │         │
│   │  │    Generator    │  │     Calculator          │   │         │
│   │  └─────────────────┘  └─────────────────────────┘   │         │
│   └──────────────────────────────────────────────────────┘         │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Fonctionnalités

### 🧠 Génération d'Embeddings

| Modèle | Dimensions | Langue | Performance |
|--------|------------|--------|-------------|
| all-MiniLM-L6-v2 | 384 | Multilingue | ⭐⭐⭐⭐ |

```
Texte: "Le patient présente des symptômes de diabète de type 2"
         │
         ▼
    ┌────────────────────────────────────────┐
    │  Sentence Transformer Encoding         │
    └────────────────────────────────────────┘
         │
         ▼
Vecteur: [0.023, -0.156, 0.089, ..., 0.234]  (384 dimensions)
```

### 🔍 Recherche par Similarité

```python
# Exemple de recherche sémantique
Query: "traitement pour l'hypertension"

Résultats (par score de similarité):
┌─────┬────────────────────────────────────────┬───────┐
│ #   │ Document                               │ Score │
├─────┼────────────────────────────────────────┼───────┤
│ 1   │ Ordonnance_HTA_Patient_A.pdf          │ 0.92  │
│ 2   │ Consultation_Cardio_2024.pdf          │ 0.87  │
│ 3   │ Bilan_Tension_Arterielle.pdf          │ 0.84  │
└─────┴────────────────────────────────────────┴───────┘
```

### 🏷️ Filtrage par Patient

```sql
-- Recherche vectorielle avec filtre patient
SELECT * FROM indexed_documents 
WHERE patient_id = 'P12345'
ORDER BY cosine_similarity(embedding, query_vector) DESC
LIMIT 5;
```

---

## 🛠️ API Endpoints

### `POST /api/search`

Recherche sémantique avec filtrage optionnel.

```bash
curl -X POST "http://localhost:8003/api/search" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "diagnostic diabète insuline",
    "patientId": "P12345",
    "topK": 5
  }'
```

**Response:**
```json
{
  "results": [
    {
      "id": 42,
      "filename": "Consultation_Diabeto_001.pdf",
      "content": "Patient diagnostiqué avec diabète de type 2...",
      "patientId": "P12345",
      "score": 0.89
    }
  ],
  "query": "diagnostic diabète insuline",
  "total": 3
}
```

### `GET /api/search`

Recherche simple par GET.

```bash
curl "http://localhost:8003/api/search?query=hypertension&limit=10"
```

### `GET /api/documents/{id}`

Récupère un document par ID (interne ou originalDocId).

```bash
curl "http://localhost:8003/api/documents/9"
```

**Response:**
```json
{
  "id": 1,
  "originalDocId": "9",
  "filename": "Consultation_Neuro_001.pdf",
  "content": "Contenu complet du document...",
  "patientId": "patient_123",
  "indexedAt": "2025-12-05T10:30:00"
}
```

### `GET /api/documents`

Liste tous les documents indexés.

```bash
curl "http://localhost:8003/api/documents?patientId=P12345"
```

### `POST /api/documents/batch`

Récupère plusieurs documents par IDs.

```bash
curl -X POST "http://localhost:8003/api/documents/batch" \
  -H "Content-Type: application/json" \
  -d '{"ids": [1, 2, 3]}'
```

### `POST /api/index`

Indexe manuellement un document.

```bash
curl -X POST "http://localhost:8003/api/index" \
  -H "Content-Type: application/json" \
  -d '{"documentId": 123}'
```

### `GET /health`

```json
{
  "status": "UP",
  "embeddingModel": "LOADED",
  "documentsIndexed": 156,
  "databaseConnection": "CONNECTED"
}
```

---

## ⚙️ Configuration

### `application.yml`

```yaml
server:
  port: 8003

spring:
  application:
    name: indexeur-semantique
    
  datasource:
    url: jdbc:postgresql://postgres:5432/docqa_indexeur
    username: docqa_user
    password: docqa_password
    
  jpa:
    hibernate:
      ddl-auto: update
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        
  rabbitmq:
    host: rabbitmq
    port: 5672
    username: docqa_user
    password: docqa_password

# Queue pour recevoir les documents anonymisés
messaging:
  queue:
    input: documents.anonymized

# Configuration du modèle d'embedding
embedding:
  model: sentence-transformers/all-MiniLM-L6-v2
  dimensions: 384
```

---

## 📦 Installation

### 🐳 Docker (Recommandé)

```bash
# Depuis la racine du projet
docker-compose up -d indexeur-semantique
```

### 💻 Local (Maven)

```bash
# 1. Compiler
cd microservices/indexeur-semantique
mvn clean package -DskipTests

# 2. Lancer
java -jar target/indexeur-semantique-1.0.0.jar
```

> ⚠️ **Note:** Au premier démarrage, le service télécharge le modèle PyTorch (~90MB). Cela peut prendre quelques minutes.

---

## 📁 Structure du Projet

```
indexeur-semantique/
├── 📄 pom.xml                        # Configuration Maven + DJL
├── 🐳 Dockerfile                     # Image Docker
│
└── 📂 src/main/java/com/docqa/indexeur/
    │
    ├── 📄 IndexeurApplication.java   # Point d'entrée Spring Boot
    │
    ├── 📂 config/
    │   └── RabbitConfig.java         # Configuration RabbitMQ
    │
    ├── 📂 controller/
    │   ├── SearchController.java     # Endpoints de recherche
    │   ├── DocumentController.java   # Endpoints documents
    │   └── HealthController.java     # Health check
    │
    ├── 📂 service/
    │   ├── IndexingService.java      # Logique d'indexation
    │   └── EmbeddingService.java     # Génération embeddings
    │
    ├── 📂 messaging/
    │   └── DocumentConsumer.java     # Consumer RabbitMQ
    │
    ├── 📂 model/
    │   └── Document.java             # Entity JPA
    │
    └── 📂 repository/
        └── DocumentRepository.java   # Accès PostgreSQL
```

---

## 🧮 Algorithme de Similarité

### Cosine Similarity

```java
/**
 * Calcule la similarité cosinus entre deux vecteurs
 * Score: 0 (différent) → 1 (identique)
 */
private double cosineSimilarity(float[] vectorA, double[] vectorB) {
    double dotProduct = 0.0;
    double normA = 0.0;
    double normB = 0.0;
    
    for (int i = 0; i < vectorA.length; i++) {
        dotProduct += vectorA[i] * vectorB[i];
        normA += Math.pow(vectorA[i], 2);
        normB += Math.pow(vectorB[i], 2);
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
```

### Schéma de la Table

```sql
CREATE TABLE indexed_documents (
    id SERIAL PRIMARY KEY,
    original_doc_id VARCHAR(255),
    filename VARCHAR(255),
    patient_id VARCHAR(255),
    content TEXT,
    embedding float8[],  -- Vecteur 384 dimensions
    indexed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour la recherche par patient
CREATE INDEX idx_patient_id ON indexed_documents(patient_id);
```

---

## 📊 Métriques & Performance

| Métrique | Valeur Typique |
|----------|----------------|
| Temps d'embedding | ~50-100ms |
| Temps de recherche | ~10-50ms |
| Dimensions vecteur | 384 |
| Documents/seconde | ~20 |

### Optimisation Future

```sql
-- Pour de gros volumes, utiliser pgvector
CREATE EXTENSION vector;
CREATE INDEX ON indexed_documents 
  USING ivfflat (embedding vector_cosine_ops) 
  WITH (lists = 100);
```

---

## 🔄 Flux d'Indexation

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ deid-service │────►│   RabbitMQ   │────►│   indexeur   │
│              │     │ .anonymized  │     │              │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                                                  ▼
                                          ┌──────────────┐
                                          │  Embedding   │
                                          │   Service    │
                                          └──────┬───────┘
                                                 │
                                                 ▼
                                          ┌──────────────┐
                                          │  PostgreSQL  │
                                          │   Vector DB  │
                                          └──────────────┘
```

---

## 🐛 Troubleshooting

### Modèle non téléchargé

```bash
# Vérifier les logs de téléchargement
docker-compose logs indexeur-semantique | grep "Downloading"

# Le téléchargement peut prendre 2-3 minutes
```

### OutOfMemoryError

```yaml
# Augmenter la mémoire dans docker-compose.yml
environment:
  - JAVA_OPTS=-Xmx2g -Xms512m
```

### Recherche renvoie 0 résultats

```bash
# Vérifier que des documents sont indexés
curl "http://localhost:8003/api/documents"

# Vérifier le patientId utilisé
```

---

## 🔗 Intégration RAG

```
┌─────────────┐     ┌─────────────────┐     ┌──────────────┐
│ llm-qa-module│────►│indexeur-semantique│────►│   Mistral    │
│   Question  │     │   Top K Docs   │     │   Nemo 12B   │
└─────────────┘     └─────────────────┘     └──────────────┘
        │                    │                      │
        │                    │                      │
        ▼                    ▼                      ▼
   "Traitements?"    [Doc1, Doc2, Doc3]     "Le patient..."
```

---

<div align="center">

**Fait avec ❤️ pour DocQA**

*La puissance de la recherche sémantique au service de la médecine*

🧠 **IA Embeddings** | 🔍 **Recherche Intelligente** | ⚡ **RAG-Ready**

</div>
