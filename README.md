# DocQA-MS — Assistant Médical sur Documents Cliniques

![Architecture](https://img.shields.io/badge/Architecture-Microservices-blue)
![Java](https://img.shields.io/badge/Java-17+-orange)
![Python](https://img.shields.io/badge/Python-3.11+-green)
![React](https://img.shields.io/badge/React-18-61DAFB)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED)

## 🏥 Contexte

Système intelligent de traitement et analyse de documents médicaux non structurés utilisant des LLM (Large Language Models) pour transformer les textes cliniques en réponses précises et contextualisées.

## 🎯 Objectifs

- ✅ Répondre à des questions en langage naturel à partir des documents internes
- ✅ Extraire des informations précises : maladies, traitements, antécédents
- ✅ Fournir des résumés ou comparaisons entre patients
- ✅ Garantir confidentialité, anonymisation et traçabilité des données

## Architecture Microservices

```
+---------------------------------------------------------------------------+
|                        INTERFACE CLINIQUE (React)                         |
|                              Port: 3000                                   |
+---------------------------------------------------------------------------+
                                     |
                                     v
+---------------------------------------------------------------------------+
|                          API GATEWAY (Python)                              |
|                              Port: 8000                                    |
|              Point d'entree unique pour tous les microservices             |
+---------------------------------------------------------------------------+
                                     |
        +----------------------------+----------------------------+
        |              |             |              |             |
        v              v             v              v             v
+-------------+ +-------------+ +-------------+ +-------------+ +-------------+
|Doc Ingestor | |DeID Service | |  Indexeur   | | LLM QA      | |  Synthese   |
|  (Python)   | |   (Java)    | | Semantique  | |   Module    | | Comparative |
| Port: 8001  | | Port: 8002  | | Port: 8003  | | Port: 8004  | | Port: 8005  |
+-------------+ +-------------+ +-------------+ +-------------+ +-------------+
        |              |             |              |             |
        +-------+------+------+------+------+------+------+------+
                |             |             |             |
                v             v             v             v
        +-------------+ +-------------+ +-------------+
        |   RabbitMQ  | | PostgreSQL  | |Audit Logger |
        |  Port: 5672 | |  Port: 5433 | | Port: 8006  |
        +-------------+ +-------------+ +-------------+

FLUX DE MESSAGES (RabbitMQ):
  Doc Ingestor --> [documents.raw] --> DeID Service
  DeID Service --> [documents.deid] --> Indexeur Semantique
  Indexeur Semantique --> [documents.indexed]
  All Services --> [audit.events] --> Audit Logger
```

### Microservices

| Service                  | Port | Langage          | Description                            |
| ------------------------ | ---- | ---------------- | -------------------------------------- |
| **API Gateway**          | 8000 | Python/FastAPI   | Point d'entree unique, proxy           |
| **Doc Ingestor**         | 8001 | Python/FastAPI   | Ingestion OCR, extraction de texte     |
| **DeID Service**         | 8002 | Java/Spring Boot | Anonymisation des donnees personnelles |
| **Indexeur Semantique**  | 8003 | Java/Spring Boot | Vectorisation et recherche semantique  |
| **LLM QA Module**        | 8004 | Python/FastAPI   | Questions/Reponses avec LLM            |
| **Synthese Comparative** | 8005 | Java/Spring Boot | Generation de resumes                  |
| **Audit Logger**         | 8006 | Java/Spring Boot | Tracabilite et audit                   |
| **Interface Clinique**   | 3000 | React            | Interface utilisateur                  |

## 🚀 Démarrage Rapide

### Prérequis

- Docker & Docker Compose
- (Optionnel) Ollama pour LLM local

### 1. Cloner le projet

```bash
git clone <repository-url>
cd DocQA-MS
```

### 2. Démarrer l'infrastructure

```bash
# Infrastructure seule (PostgreSQL + RabbitMQ)
docker-compose up -d postgres rabbitmq

# Vérifier le statut
docker-compose ps
```

### 3. Démarrer tous les services

```bash
# Tous les microservices
docker-compose up -d

# Suivre les logs
docker-compose logs -f
```

### 4. Accéder aux interfaces

| Interface               | URL                    |
| ----------------------- | ---------------------- |
| **Application**         | http://localhost:3000  |
| **RabbitMQ Management** | http://localhost:15672 |
| **pgAdmin** (optionnel) | http://localhost:5050  |

## 📁 Structure du Projet

```
DocQA-MS/
├── docker-compose.yml              # Orchestration Docker
├── README.md                       # Documentation
├── config/
│   └── application.properties      # Configuration partagée
├── database/
│   └── init-scripts/              # Scripts d'initialisation DB
└── microservices/
    ├── doc-ingestor/              # Python/FastAPI
    ├── deid-service/              # Java/Spring Boot
    ├── indexeur-semantique/       # Java/Spring Boot
    ├── llm-qa-module/             # Python/FastAPI
    ├── synthese-comparative/      # Java/Spring Boot
    ├── audit-logger/              # Java/Spring Boot
    └── interface-clinique/        # React/Tailwind
```

## 🔧 Configuration

### Variables d'environnement principales

| Variable          | Description     | Défaut                                                         |
| ----------------- | --------------- | -------------------------------------------------------------- |
| `DATABASE_URL`    | URL PostgreSQL  | `postgresql://docqa_user:docqa_password@postgres:5432/docqa_*` |
| `RABBITMQ_HOST`   | Hôte RabbitMQ   | `rabbitmq`                                                     |
| `LLM_PROVIDER`    | Fournisseur LLM | `ollama`                                                       |
| `OLLAMA_BASE_URL` | URL Ollama      | `http://host.docker.internal:11434`                            |

### Configuration LLM - Mistral Nemo 12B avec RAG

Le système utilise **Mistral Nemo 12B Instruct** via Ollama avec une architecture RAG (Retrieval-Augmented Generation) pour des réponses précises basées sur les documents médicaux.

#### Prérequis: Installer Ollama et Mistral Nemo

**Windows:**

```powershell
# Télécharger et installer Ollama depuis https://ollama.com/download
# Ou via winget:
winget install Ollama.Ollama

# Télécharger le modèle Mistral Nemo 12B (environ 7 Go)
ollama pull mistral-nemo

# Démarrer le serveur Ollama
ollama serve
```

**Linux/Mac:**

```bash
# Installer Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Télécharger Mistral Nemo 12B
ollama pull mistral-nemo

# Démarrer le serveur
ollama serve
```

#### Vérifier l'installation

```bash
# Vérifier que Ollama fonctionne
curl http://localhost:11434/api/tags

# Tester Mistral Nemo
ollama run mistral-nemo "Bonjour, es-tu prêt?"
```

#### Configuration RAG

Le module LLM QA utilise RAG avec les paramètres suivants (modifiables via `.env`):

| Paramètre           | Valeur         | Description                             |
| ------------------- | -------------- | --------------------------------------- |
| `OLLAMA_MODEL`      | `mistral-nemo` | Modèle Mistral Nemo 12B Instruct        |
| `LLM_TEMPERATURE`   | `0.1`          | Réponses factuelles (basse température) |
| `LLM_NUM_CTX`       | `8192`         | Fenêtre de contexte                     |
| `RAG_TOP_K_RESULTS` | `5`            | Documents récupérés                     |
| `USE_RERANKING`     | `true`         | Reranking pour meilleure précision      |
| `RERANK_TOP_K`      | `3`            | Documents finaux après reranking        |

#### Alternative: OpenAI (Optionnel)

```env
USE_LOCAL_LLM=false
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-3.5-turbo
```

## 🧪 Tests

### Exécuter les tests unitaires

```bash
# Java services
cd microservices/deid-service
./mvnw test

# Python services
cd microservices/llm-qa-module
pytest
```

### Health Checks

```bash
# Vérifier tous les services
curl http://localhost:8001/health
curl http://localhost:8002/actuator/health
curl http://localhost:8003/actuator/health
curl http://localhost:8004/health
curl http://localhost:8005/actuator/health
curl http://localhost:8006/actuator/health
```

## 📊 Fonctionnalités

### 1. Ingestion de Documents

- Upload PDF, DOC, DOCX, TXT
- OCR pour documents scannés
- Extraction de métadonnées

### 2. Anonymisation (DeID)

- Détection des noms, prénoms
- Anonymisation des dates
- Masquage des numéros de sécurité sociale
- Correspondance bidirectionnelle sécurisée

### 3. Recherche Sémantique

- Embeddings vectoriels
- Recherche par similarité
- Filtrage par patient/date

### 4. Questions/Réponses

- Interface conversationnelle
- Contexte patient
- Sources citées
- Score de confiance

### 5. Synthèses

- Résumé de dossier patient
- Comparaison entre patients
- Export PDF/Markdown

### 6. Audit

- Traçabilité complète
- Filtrage avancé
- Export CSV

## 🔒 Sécurité

- Anonymisation conforme RGPD
- Audit trail complet
- Authentification (à implémenter)
- Chiffrement des données sensibles

## 📝 Licence

Projet de fin d'études - 2024

## 👥 Contributeurs

- Développeur Principal: [ACHRAF]

### 7. InterfaceClinique (React)

**Port:** 3000  
**Rôle:** Interface utilisateur web  
**Technologies:** React, Tailwind CSS, Auth0, Chart.js

## 🔄 Workflow

```
DocIngestor → DeID → IndexeurSémantique → LLMQAModule → SyntheseComparative
                                              ↓
                                        AuditLogger
                                              ↑
                                      InterfaceClinique
```

## 📋 Prérequis

- Java JDK 17+
- Python 3.10+
- Node.js 16+
- PostgreSQL 18
- RabbitMQ 3.12+
- Maven 3.8+

## 🚀 Démarrage

### 1. Configuration des bases de données

```bash
# Voir database/init-scripts/
psql -U postgres -f database/init-scripts/create-databases.sql
```

### 2. Démarrage de RabbitMQ

```bash
# Voir docs/rabbitmq-setup.md
```

### 3. Démarrage des microservices

```bash
# DocIngestor
cd microservices/doc-ingestor
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py

# DeID
cd microservices/deid-service
mvn clean install
mvn spring-boot:run

# ... autres services
```

## 📚 Documentation

- [Architecture détaillée](docs/architecture.md)
- [Guide de développement](docs/development-guide.md)
- [API Documentation](docs/api-documentation.md)
- [Guide de déploiement](docs/deployment-guide.md)

## 🔒 Sécurité

- Anonymisation automatique des données personnelles (PII)
- Traçabilité complète des accès et requêtes
- Authentification et autorisation (Auth0)
- Conformité RGPD et réglementations médicales

## 👥 Équipe

Projet académique professionnel - Maroc

## 📄 License

Academic Use Only
