# 🏥 DocQA-MS - Assistant Médical Intelligent

> **Projet académique** - Plateforme d'analyse de documents médicaux basée sur LLM et microservices

[![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green.svg)](https://fastapi.tiangolo.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue.svg)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-Academic-yellow.svg)]()

## 📋 Description

**DocQA-MS** est une solution complète permettant d'ingérer, désidentifier, indexer et interroger en langage naturel des documents médicaux (PDF, DOCX, HL7, etc.).

Le système utilise une architecture microservices pour garantir la scalabilité, la maintenabilité et la séparation des responsabilités.

### 🎯 Fonctionnalités principales

- ✅ **Ingestion multiformat** : PDF, DOCX, TXT, HL7, XML
- 🔒 **Désidentification automatique** : Protection des données sensibles (RGPD)
- 🔍 **Indexation sémantique** : Embeddings + FAISS pour recherche vectorielle
- 🤖 **Question-Réponse intelligent** : RAG (Retrieval Augmented Generation) avec LLM
- 📊 **Synthèse comparative** : Résumés et comparaisons de documents
- 📝 **Audit complet** : Traçabilité de toutes les opérations
- 🌐 **Interface clinique** : Dashboard React moderne et responsive

---

### 🔧 Microservices

| Service                 | Port | Description                               | Technologies                          |
| ----------------------- | ---- | ----------------------------------------- | ------------------------------------- |
| **DocIngestor**         | 8001 | Ingestion et parsing de documents         | FastAPI, PyPDF2, python-docx          |
| **DeID**                | 8002 | Désidentification des données sensibles   | FastAPI, NER, Regex                   |
| **IndexeurSémantique**  | 8003 | Création d'embeddings et indexation FAISS | FastAPI, Sentence-Transformers, FAISS |
| **LLMQAModule**         | 8004 | Question-Réponse avec RAG                 | FastAPI, LangChain, OpenAI            |
| **SyntheseComparative** | 8005 | Résumés et comparaisons de documents      | FastAPI, LLM                          |
| **AuditLogger**         | 8006 | Traçabilité et logs centralisés           | FastAPI, PostgreSQL                   |
| **InterfaceClinique**   | 3000 | Interface utilisateur web                 | React, TailwindCSS                    |

### 🗄️ Infrastructure

| Composant      | Port        | Usage                                     |
| -------------- | ----------- | ----------------------------------------- |
| **PostgreSQL** | 5432        | Base de données relationnelle             |
| **RabbitMQ**   | 5672, 15672 | Message broker pour communication async   |
| **MinIO**      | 9000, 9001  | Stockage objet (S3-compatible)            |
| **FAISS**      | -           | Index vectoriel pour recherche sémantique |

---

## 🚀 Installation et Démarrage

### Prérequis

- 🐳 **Docker** >= 24.0
- 🐳 **Docker Compose** >= 2.20
- 💾 **4 GB RAM** minimum (8 GB recommandé)
- 💿 **10 GB** d'espace disque

### 📥 Installation

1. **Cloner le repository**

```bash
git clone https://github.com/yassir2222/DocQA.git
cd DocQA
```

2. **Configurer les variables d'environnement**

```bash
cd infra
cp .env.example .env  # Si vous avez un exemple
# Éditer .env selon vos besoins
```

3. **Construire les images Docker**

```bash
# Depuis le dossier infra/
docker-compose build
```

4. **Démarrer tous les services**

```bash
docker-compose up -d
```

5. **Vérifier le statut**

```bash
docker-compose ps
```

### 🎬 Commandes rapides

```bash
# Démarrer tous les services
make start          # ou: docker-compose up -d

# Arrêter tous les services
make stop           # ou: docker-compose down

# Voir les logs en temps réel
make logs           # ou: docker-compose logs -f

# Rebuild les images
make build          # ou: docker-compose build

# Redémarrer un service spécifique
docker-compose restart doc_ingestor

# Accéder au shell d'un conteneur
docker-compose exec backend_base bash
```

---

## 📡 Endpoints & URLs

### Services Backend

| Service      | URL                   | Documentation API          |
| ------------ | --------------------- | -------------------------- |
| Backend Base | http://localhost:8000 | http://localhost:8000/docs |
| DocIngestor  | http://localhost:8001 | http://localhost:8001/docs |
| DeID         | http://localhost:8002 | http://localhost:8002/docs |
| Indexeur     | http://localhost:8003 | http://localhost:8003/docs |
| LLMQA        | http://localhost:8004 | http://localhost:8004/docs |
| Synthèse     | http://localhost:8005 | http://localhost:8005/docs |
| AuditLogger  | http://localhost:8006 | http://localhost:8006/docs |

### Infrastructure

| Service             | URL                    | Identifiants      |
| ------------------- | ---------------------- | ----------------- |
| RabbitMQ Management | http://localhost:15672 | admin / admin     |
| MinIO Console       | http://localhost:9001  | admin / admin123  |
| PostgreSQL          | localhost:5432         | docqa / docqa_pwd |

---

## 🧪 Tests de Validation (Sprint 1)

Après le démarrage, vérifier que tout fonctionne :

### ✅ Test 1 : Health checks

```bash
# Backend Base
curl http://localhost:8000/health

# DocIngestor
curl http://localhost:8001/health

# Tous les services devraient répondre {"status": "ok", ...}
```

### ✅ Test 2 : Connexion PostgreSQL

```bash
docker-compose exec postgres psql -U docqa -d docqa_db -c "SELECT version();"
```

### ✅ Test 3 : RabbitMQ

Ouvrir http://localhost:15672 et se connecter avec `admin / admin`

### ✅ Test 4 : MinIO

Ouvrir http://localhost:9001 et se connecter avec `admin / admin123`

### ✅ Test 5 : Swagger UI

Ouvrir http://localhost:8000/docs pour voir la documentation interactive

---

## 📂 Structure du Projet

```
docqa-ms/
├── backend/
│   ├── doc_ingestor/          # Service d'ingestion
│   │   ├── app/
│   │   │   ├── config/
│   │   │   ├── core/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   └── services/
│   │   ├── Dockerfile
│   │   ├── main.py
│   │   └── requirements.txt
│   ├── deid/                  # Service de désidentification
│   ├── indexeur/              # Service d'indexation
│   ├── llmqa/                 # Service RAG + LLM
│   ├── synthese/              # Service de synthèse
│   ├── auditlogger/           # Service d'audit
│   └── backend_base/          # Template de base (référence)
│
├── frontend/
│   └── interface_clinique/    # Application React
│
├── infra/
│   ├── docker-compose.yml     # Orchestration Docker
│   └── .env                   # Variables d'environnement
│
├── docs/
│   └── architecture.md        # Documentation détaillée
│
├── Makefile                   # Commandes d'automatisation
├── .gitignore
└── README.md                  # Ce fichier
```

---

## 🛠️ Technologies Utilisées

### Backend

- **Python 3.11**
- **FastAPI** - Framework web moderne et rapide
- **SQLAlchemy** - ORM pour PostgreSQL
- **Pika / aio-pika** - Client RabbitMQ
- **MinIO Python SDK** - Stockage objet
- **Sentence-Transformers** - Embeddings sémantiques
- **FAISS** - Recherche vectorielle
- **LangChain** - Framework LLM
- **OpenAI / Transformers** - Modèles de langage

### Frontend

- **React 18**
- **TailwindCSS** - Framework CSS utility-first
- **Axios** - Client HTTP
- **React Router** - Navigation

### Infrastructure

- **Docker & Docker Compose**
- **PostgreSQL 15** - Base de données
- **RabbitMQ 3.12** - Message broker
- **MinIO** - Stockage S3-compatible

---

## 📝 Développement

### Ajouter un nouveau microservice

1. Copier le template `backend_base/`
2. Adapter les fichiers selon les besoins
3. Ajouter l'entrée dans `docker-compose.yml`
4. Configurer les variables d'environnement
5. Builder et démarrer : `docker-compose up -d nouveau_service`

### Bonnes pratiques

- ✅ Respecter PEP8 pour le code Python
- ✅ Écrire des docstrings pour toutes les fonctions
- ✅ Logger toutes les opérations importantes
- ✅ Gérer les erreurs avec des try/except
- ✅ Utiliser des variables d'environnement (pas de secrets en dur)
- ✅ Tester avec les health checks
- ✅ Commiter régulièrement avec des messages clairs

---

## 🔐 Sécurité

- 🔒 Ne jamais commiter le fichier `.env`
- 🔒 Changer les mots de passe par défaut en production
- 🔒 Utiliser HTTPS en production
- 🔒 Implémenter l'authentification JWT
- 🔒 Valider toutes les entrées utilisateur
- 🔒 Désidentifier les données médicales sensibles

---

## 🐛 Dépannage

### Les conteneurs ne démarrent pas

```bash
# Voir les logs
docker-compose logs

# Reconstruire les images
docker-compose build --no-cache

# Supprimer les volumes et recommencer
docker-compose down -v
docker-compose up -d
```

### Erreur de connexion à PostgreSQL

```bash
# Vérifier que PostgreSQL est bien démarré
docker-compose ps postgres

# Vérifier les logs
docker-compose logs postgres
```

### RabbitMQ ne se connecte pas

```bash
# Attendre que RabbitMQ soit prêt (peut prendre 20-30s)
docker-compose logs rabbitmq

# Redémarrer le service
docker-compose restart rabbitmq
```

---

## 📚 Documentation

- [Architecture détaillée](docs/architecture.md)
- [Guide de contribution](docs/CONTRIBUTING.md) _(à créer)_
- [API Documentation](http://localhost:8000/docs) _(après démarrage)_

---

## 👥 Auteurs

**Équipe de développement:**

- **ACHRAF EL HOUFI**
- **YASSIR LAMBRASS**
- **SAAD KARZOUZ**
- **ANAS EL MALYARI**

**Projet académique** - DocQA-MS Team

---

## 📄 Licence

Ce projet est développé dans un cadre académique.

## 💡 Support

Pour toute question ou problème :

- 💬 Issues : [GitHub Issues](https://github.com/yassir2222/DocQA/issues)
- 📧 Contact : [DocQA-MS Team](https://github.com/yassir2222/DocQA)

---

<div align="center">

**⭐ Si ce projet vous plaît, n'hésitez pas à lui donner une étoile ! ⭐**

Made with ❤️ for Healthcare AI

</div>
