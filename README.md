<p align="center">
  <img src="microservices/interface-clinique/public/images/logo.png" alt="DocQA-MS Logo" width="120"/>
</p>

<h1 align="center">🏥 DocQA-MS</h1>

<p align="center">
  <strong>Système de Question-Réponse sur Documents Médicaux</strong><br>
  <em>Architecture Microservices avec RAG et LLM Local</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.11-blue?logo=python&logoColor=white" alt="Python"/>
  <img src="https://img.shields.io/badge/Java-17-orange?logo=openjdk&logoColor=white" alt="Java"/>
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" alt="React"/>
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white" alt="Docker"/>
  <img src="https://img.shields.io/badge/LLM-Llama_3.1-purple?logo=meta&logoColor=white" alt="LLM"/>
</p>

<p align="center">
  <a href="#-fonctionnalités">Fonctionnalités</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-utilisation">Utilisation</a> •
  <a href="#-api">API</a> •
  <a href="#-équipe">Équipe</a>
</p>

---

## 📋 À propos

**DocQA-MS** est un système intelligent de Question-Réponse conçu pour les professionnels de santé. Il permet d'interroger naturellement des corpus de documents médicaux tout en garantissant la **confidentialité des données patients** grâce à une anonymisation automatique conforme au RGPD.

### 🎯 Objectifs

- ✅ Permettre aux cliniciens de poser des questions en langage naturel
- ✅ Fournir des réponses sourcées et vérifiables
- ✅ Garantir l'anonymisation automatique des données sensibles
- ✅ Assurer une traçabilité complète des actions (audit)
- ✅ Fonctionner **100% en local** (aucune donnée envoyée vers le cloud)

---

## ✨ Fonctionnalités

| Module | Description | Technologie |
|--------|-------------|-------------|
| 📄 **Doc Ingestor** | Ingestion de documents PDF, TXT, DOCX | Python / FastAPI |
| 🔒 **DeID Service** | Anonymisation via NER médical | Java / Spring Boot |
| 🔍 **Indexeur Sémantique** | Indexation vectorielle et recherche | Java / Spring Boot |
| 🤖 **LLM Q&A** | Pipeline RAG avec Llama 3.1 | Python / LangChain |
| 📊 **Synthèse Comparative** | Génération de synthèses multi-documents | Java / Spring Boot |
| 📝 **Audit Logger** | Journalisation et traçabilité | Java / Spring Boot |
| 🖥️ **Interface Clinique** | Dashboard utilisateur moderne | React 18 |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     INTERFACE CLINIQUE (React)                   │
│                          Port: 3000                              │
└─────────────────────────────┬───────────────────────────────────┘
                              │ HTTP/REST
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY (FastAPI)                       │
│                          Port: 8000                              │
└──────┬──────────┬──────────┬──────────┬──────────┬──────────────┘
       │          │          │          │          │
       ▼          ▼          ▼          ▼          ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│   Doc    │ │   DeID   │ │ Indexeur │ │  LLM QA  │ │ Synthèse │
│ Ingestor │ │ Service  │ │Sémantique│ │  Module  │ │Comparative│
│  :8001   │ │  :8002   │ │  :8003   │ │  :8004   │ │  :8005   │
└────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘
     │            │            │            │            │
     └────────────┴────────────┼────────────┴────────────┘
                               │
       ┌───────────────────────┼───────────────────────┐
       ▼                       ▼                       ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│  PostgreSQL  │       │   RabbitMQ   │       │    Ollama    │
│    :5432     │       │    :5672     │       │   :11434     │
└──────────────┘       └──────────────┘       └──────────────┘
```

### 📦 Microservices

| Service | Port | Langage | Framework |
|---------|------|---------|-----------|
| API Gateway | 8000 | Python | FastAPI |
| Doc Ingestor | 8001 | Python | FastAPI |
| DeID Service | 8002 | Java | Spring Boot 3 |
| Indexeur Sémantique | 8003 | Java | Spring Boot 3 |
| LLM Q&A Module | 8004 | Python | FastAPI + LangChain |
| Synthèse Comparative | 8005 | Java | Spring Boot 3 |
| Audit Logger | 8006 | Java | Spring Boot 3 |
| Interface Clinique | 3000 | JavaScript | React 18 |

---

## 🚀 Installation

### Prérequis

- **Docker** 24+ et Docker Compose 2+
- **Ollama** installé localement ([ollama.ai](https://ollama.ai))
- **16 GB RAM** minimum (32 GB recommandé)

### Étapes d'installation

1. **Cloner le dépôt**
```bash
git clone https://github.com/votre-username/DocQA-MS.git
cd DocQA-MS
```

2. **Configurer l'environnement**
```bash
cp .env.example .env
# Modifier .env selon vos besoins
```

3. **Télécharger le modèle LLM**
```bash
ollama pull llama3.1
```

4. **Lancer les services**
```bash
docker-compose up -d
```

5. **Accéder à l'application**
- 🌐 **Interface** : http://localhost:3000
- 📡 **API Gateway** : http://localhost:8000
- 🐰 **RabbitMQ** : http://localhost:15672

---

## 💻 Utilisation

### Interface Web

1. **Dashboard** : Vue d'ensemble des statistiques et activités récentes
2. **Documents** : Upload et gestion des documents médicaux
3. **Q&A** : Posez vos questions en langage naturel
4. **Synthèse** : Générez des synthèses comparatives
5. **Audit** : Consultez les journaux d'activité

### Exemple de Question-Réponse

```
Question : "Quels sont les traitements recommandés pour le diabète de type 2 ?"

Réponse : "D'après les documents analysés, les traitements recommandés 
incluent la metformine comme première ligne, suivie des inhibiteurs 
SGLT2 ou des agonistes GLP-1 en cas d'insuffisance..."

Sources : [doc-123, doc-456]
```

---

## 📡 API

### Endpoints principaux

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/documents/upload` | Upload de document |
| `POST` | `/api/deid/anonymize` | Anonymisation |
| `POST` | `/api/qa/ask` | Poser une question |
| `POST` | `/api/synthesis/compare` | Générer une synthèse |
| `GET` | `/api/audit/logs` | Récupérer les logs |
| `GET` | `/health` | Health check |

### Exemple d'appel API

```bash
curl -X POST http://localhost:8000/api/qa/ask \
  -H "Content-Type: application/json" \
  -d '{"query": "Quels sont les effets secondaires du paracétamol ?"}'
```

---

## 🧪 Tests

### Lancer les tests

```bash
# Tests Python
python -m pytest tests/ -v

# Tests Java (Maven)
cd microservices/audit-logger && mvn test

# Tests de performance (JMeter)
./run-jmeter-tests.bat
```

### Couverture de code

```bash
# Générer le rapport de couverture
./generate-coverage.bat
```

---

## 📁 Structure du Projet

```
DocQA-MS/
├── 📂 microservices/
│   ├── 📂 api-gateway/          # Python/FastAPI
│   ├── 📂 doc-ingestor/         # Python/FastAPI
│   ├── 📂 deid-service/         # Java/Spring Boot
│   ├── 📂 indexeur-semantique/  # Java/Spring Boot
│   ├── 📂 llm-qa-module/        # Python/LangChain
│   ├── 📂 synthese-comparative/ # Java/Spring Boot
│   ├── 📂 audit-logger/         # Java/Spring Boot
│   └── 📂 interface-clinique/   # React
├── 📂 database/                 # Scripts SQL
├── 📂 tests/                    # Tests unitaires et intégration
├── 📂 jmeter/                   # Tests de performance
├── 📂 .github/workflows/        # CI/CD GitHub Actions
├── 📄 docker-compose.yml        # Orchestration Docker
├── 📄 .env.example              # Variables d'environnement
└── 📄 README.md                 # Documentation
```

---

## 🔧 Configuration

### Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `OLLAMA_BASE_URL` | URL du serveur Ollama | `http://ollama:11434` |
| `OLLAMA_MODEL` | Modèle LLM à utiliser | `llama3.1` |
| `POSTGRES_DB` | Nom de la base de données | `docqa` |
| `POSTGRES_USER` | Utilisateur PostgreSQL | `docqa` |
| `RABBITMQ_HOST` | Hôte RabbitMQ | `rabbitmq` |

---

## 🛡️ Sécurité

- ✅ **Exécution locale du LLM** : Aucune donnée envoyée vers le cloud
- ✅ **Anonymisation automatique** : Conformité RGPD avant stockage
- ✅ **Audit complet** : Traçabilité de toutes les opérations
- ✅ **Isolation des services** : Conteneurisation Docker

---

## 👥 Équipe

<table>
  <tr>
    <td align="center"><strong>Achraf EL HOUFI</strong></td>
    <td align="center"><strong>Saad KARZOUZ</strong></td>
    <td align="center"><strong>Yassir LAMBRASS</strong></td>
    <td align="center"><strong>Anas EL MALYARI</strong></td>
  </tr>
</table>

**École Marocaine des Sciences de l'Ingénieur (EMSI)**  
📆 Année académique 2024-2025

---

## 📝 Licence

Ce projet est développé dans un cadre académique. Tous droits réservés.

---

<p align="center">
  <sub>Développé avec ❤️ par l'équipe DocQA-MS</sub>
</p>
