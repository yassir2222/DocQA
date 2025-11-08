# DocQA-MS — Assistant Médical sur Documents Cliniques

## 🏥 Contexte

Système intelligent de traitement et analyse de documents médicaux non structurés utilisant des LLM (Large Language Models) pour transformer les textes cliniques en réponses précises et contextualisées.

## 🎯 Objectifs

- Répondre à des questions en langage naturel à partir des documents internes
- Extraire des informations précises : maladies, traitements, antécédents
- Fournir des résumés ou comparaisons entre patients
- Garantir confidentialité, anonymisation et traçabilité des données

## 🏗️ Architecture Microservices

### 1. DocIngestor (Python)

**Port:** 8001  
**Rôle:** Ingestion et extraction de documents médicaux  
**Technologies:** Python, Apache Tika, OCR, RabbitMQ, PostgreSQL

### 2. DeID (Java)

**Port:** 8002  
**Rôle:** Désidentification et anonymisation des données personnelles  
**Technologies:** Java 17+, Spring Boot, Presidio, PostgreSQL

### 3. IndexeurSémantique (Java)

**Port:** 8003  
**Rôle:** Vectorisation et indexation sémantique  
**Technologies:** Java 17+, Spring Boot, FAISS, SentenceTransformers

### 4. LLMQAModule (Python)

**Port:** 8004  
**Rôle:** Questions/Réponses avec LLM  
**Technologies:** Python, LangChain, LlamaIndex, FastAPI

### 5. SyntheseComparative (Java)

**Port:** 8005  
**Rôle:** Génération de résumés et comparaisons  
**Technologies:** Java 17+, Spring Boot, Transformers

### 6. AuditLogger (Java)

**Port:** 8006  
**Rôle:** Traçabilité et audit des interactions  
**Technologies:** Java 17+, Spring Boot, PostgreSQL

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
