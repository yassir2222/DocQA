# 📊 Synthèse Comparative

<div align="center">

![Java](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2-6DB33F?style=for-the-badge&logo=spring&logoColor=white)
![Ollama](https://img.shields.io/badge/Ollama-Mistral_Nemo-black?style=for-the-badge&logo=ollama&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-316192?style=for-the-badge&logo=postgresql&logoColor=white)

**🏥 Service de Synthèse et Comparaison de Documents Médicaux**

*Analyse LLM • Synthèses intelligentes • Comparaisons inter-patients*

[Architecture](#-architecture) •
[Fonctionnalités](#-fonctionnalités) •
[API](#-api-endpoints) •
[Configuration](#-configuration)

</div>

---

## 🎯 Présentation

**Synthèse Comparative** génère des résumés intelligents de dossiers médicaux et permet de comparer l'évolution de différents patients. Propulsé par Mistral Nemo 12B, il produit des synthèses structurées et cliniquement pertinentes.

```
📄 Documents → 🧠 Analyse LLM → 📋 Synthèse Structurée
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SYNTHÈSE COMPARATIVE                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                  REST CONTROLLER                             │   │
│   │   /api/synthesis/generate    /api/synthesis/compare          │   │
│   └────────────────────────────────┬────────────────────────────┘   │
│                                    │                                 │
│                                    ▼                                 │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                 SYNTHESIS SERVICE                            │   │
│   │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │   │
│   │  │   Document   │  │   Context    │  │     Prompt       │  │   │
│   │  │   Fetcher    │  │   Builder    │  │     Builder      │  │   │
│   │  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │   │
│   │         │                 │                    │            │   │
│   │         └─────────────────┼────────────────────┘            │   │
│   │                           │                                  │   │
│   │                           ▼                                  │   │
│   │              ┌──────────────────────────┐                   │   │
│   │              │    LLM CLIENT SERVICE    │                   │   │
│   │              │   (Ollama / Mistral)     │                   │   │
│   │              └──────────────────────────┘                   │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                    │                                 │
│          ┌─────────────────────────┼─────────────────────────┐      │
│          │                         │                         │      │
│          ▼                         ▼                         ▼      │
│   ┌────────────┐           ┌────────────┐           ┌────────────┐ │
│   │  Indexeur  │           │   Ollama   │           │   Audit    │ │
│   │ Sémantique │           │  Mistral   │           │   Logger   │ │
│   │   :8003    │           │   :11434   │           │   :8006    │ │
│   └────────────┘           └────────────┘           └────────────┘ │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Fonctionnalités

### 📋 Types de Synthèse

| Type | Description | Cas d'usage |
|------|-------------|-------------|
| `SUMMARY` | Résumé global du dossier | Vue d'ensemble patient |
| `EVOLUTION` | Analyse de l'évolution | Suivi longitudinal |
| `TREATMENT_HISTORY` | Historique des traitements | Revue thérapeutique |

### 🔄 Modes de Comparaison

```
┌─────────────────────────────────────────────────────────────┐
│                  MODES DE COMPARAISON                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📁 SINGLE-PATIENT                                           │
│  ├── Comparer plusieurs documents d'un même patient         │
│  └── Analyser l'évolution dans le temps                     │
│                                                              │
│  👥 CROSS-PATIENT                                            │
│  ├── Comparer deux patients                                 │
│  ├── Identifier similitudes/différences                     │
│  └── Analyser traitements comparés                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 🧠 Analyse LLM Intelligente

```
Document médical:
"Patient DUBOIS, 67 ans, troubles mémoire depuis 6 mois,
IRM: atrophie hippocampique bilatérale..."

              ▼ SYNTHESE LLM ▼

📋 SYNTHÈSE STRUCTURÉE:

**Patient:** M. DUBOIS Jean, 67 ans

**Motif:** Troubles de la mémoire et désorientation

**Antécédents:**
- AVC ischémique transitoire (2018)
- Hypercholestérolémie

**Diagnostic:** Suspicion maladie d'Alzheimer (stade prodromal)

**Plan thérapeutique:**
1. Donépézil 5mg/jour
2. Stimulation cognitive orthophonique
3. Bilan gériatrique complet
```

---

## 🛠️ API Endpoints

### `POST /api/synthesis/generate`

Génère une synthèse de documents.

```bash
curl -X POST "http://localhost:8005/api/synthesis/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "documentIds": ["9", "10", "11"],
    "synthesisType": "SUMMARY",
    "focus": "traitements",
    "userId": "dr-martin"
  }'
```

**Response:**
```json
{
  "id": "synth-uuid-12345",
  "type": "SUMMARY",
  "summary": "**Résumé du dossier médical**\n\nLe patient présente une suspicion de maladie d'Alzheimer au stade prodromal/léger...",
  "keyPoints": [
    "Troubles de la mémoire depuis 6 mois",
    "Atrophie hippocampique bilatérale à l'IRM",
    "Traitement par donépézil 5mg initié"
  ],
  "sourceDocuments": ["9", "10", "11"],
  "generatedAt": "2025-12-05T10:30:00",
  "processingTimeMs": 22500
}
```

### `POST /api/synthesis/compare`

Compare deux patients.

```bash
curl -X POST "http://localhost:8005/api/synthesis/compare" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId1": "P001",
    "patientId2": "P002",
    "documentIds1": ["1", "2"],
    "documentIds2": ["3", "4"],
    "comparisonType": "TREATMENT",
    "userId": "dr-martin"
  }'
```

**Response:**
```json
{
  "id": "comp-uuid-67890",
  "type": "COMPARISON_TREATMENT",
  "summary": "**Comparaison des traitements**\n\n**Patient 1:**\n- Donépézil 5mg/jour\n- Bilan orthophonique\n\n**Patient 2:**\n- Mémantine 10mg/jour\n- Ergothérapie\n\n**Similitudes:**\n- Les deux patients bénéficient de stimulation cognitive...",
  "keyPoints": [
    "Approches thérapeutiques différentes",
    "Patient 1: inhibiteur cholinestérase",
    "Patient 2: antagoniste NMDA"
  ],
  "structuredData": {
    "patient1": "P001",
    "patient2": "P002",
    "comparisonType": "TREATMENT"
  },
  "generatedAt": "2025-12-05T10:35:00",
  "processingTimeMs": 35000
}
```

### `GET /api/synthesis/history`

Historique des synthèses.

```bash
curl "http://localhost:8005/api/synthesis/history?userId=dr-martin&limit=10"
```

### `GET /health`

```json
{
  "status": "UP",
  "ollama": "CONNECTED",
  "indexeur": "CONNECTED",
  "model": "mistral-nemo"
}
```

---

## ⚙️ Configuration

### `application.yml`

```yaml
server:
  port: 8005

spring:
  application:
    name: synthese-comparative

  datasource:
    url: jdbc:postgresql://postgres:5432/docqa_synthese
    username: docqa_user
    password: docqa_password

# Ollama LLM Configuration
ollama:
  url: http://host.docker.internal:11434
  model: mistral-nemo
  timeout: 180

# Services externes
services:
  indexeur:
    url: http://indexeur-semantique:8003
  audit:
    url: http://audit-logger:8006
```

---

## 📦 Installation

### 🐳 Docker (Recommandé)

```bash
# Depuis la racine du projet
docker-compose up -d synthese-comparative
```

### 💻 Local (Maven)

```bash
# 1. Compiler
cd microservices/synthese-comparative
mvn clean package -DskipTests

# 2. Lancer
java -jar target/synthese-comparative-1.0.0.jar
```

---

## 📁 Structure du Projet

```
synthese-comparative/
├── 📄 pom.xml                     # Configuration Maven
├── 🐳 Dockerfile                  # Image Docker
│
└── 📂 src/main/java/com/docqa/synthese/
    │
    ├── 📄 SyntheseComparativeApplication.java
    │
    ├── 📂 config/
    │   └── WebClientConfig.java   # Configuration HTTP
    │
    ├── 📂 controller/
    │   └── SynthesisController.java  # Endpoints REST
    │
    ├── 📂 service/
    │   ├── SynthesisService.java     # Logique principale
    │   ├── LLMClientService.java     # Client Ollama
    │   └── AuditClientService.java   # Client Audit
    │
    └── 📂 dto/
        ├── SynthesisRequest.java
        ├── SynthesisResult.java
        └── ComparisonRequest.java
```

---

## 🎯 Prompts LLM

### Prompt Synthèse

```
Tu es un expert médical francophone. Générez un résumé structuré 
du dossier médical suivant.

DOCUMENTS MEDICAUX:
{context}

INSTRUCTIONS:
- Analyse les documents et génère une synthèse structurée
- Identifie les informations clés: diagnostic, traitements, évolution
- Sois précis et professionnel
- Réponds directement avec la synthèse

SYNTHESE:
```

### Prompt Comparaison

```
Vous êtes un expert médical. Comparez les traitements des deux patients.

## Patient 1
{context1}

## Patient 2  
{context2}

INSTRUCTIONS:
- Identifiez les similitudes et différences
- Structurez votre comparaison de manière claire
- Soulignez les points cliniquement significatifs
- Restez objectif et professionnel
```

---

## 📊 Performance

| Métrique | Valeur |
|----------|--------|
| ⏱️ Temps synthèse simple | 15-25s |
| ⏱️ Temps comparaison | 25-40s |
| 📝 Longueur max contexte | 12000 chars |
| 🎯 Documents max | 10 par requête |

---

## 🐛 Troubleshooting

### Ollama non accessible

```bash
# Vérifier la connectivité Docker → Host
# Dans le conteneur:
curl http://host.docker.internal:11434/api/tags

# Si échec, vérifier qu'Ollama tourne sur l'hôte
ollama serve
```

### Documents non trouvés

```bash
# Vérifier que l'indexeur a les documents
curl "http://localhost:8003/api/documents"

# Vérifier les logs
docker logs docqa-synthese-comparative --tail 50
```

### Timeout sur synthèse longue

```yaml
# Augmenter le timeout dans application.yml
ollama:
  timeout: 300  # 5 minutes
```

---

## 🔗 Intégration Frontend

```javascript
// Synthesis.js - Appel API
const response = await api.generateSynthesis(selectedDocs, {
  comparisonMode: selectedPatients.length > 1 ? "cross-patient" : "single-patient",
  patients: selectedPatients
});

// Affichage groupé par patient
const documentsByPatient = documents.reduce((acc, doc) => {
  const patientId = doc.patient_id || "Non assigné";
  if (!acc[patientId]) acc[patientId] = [];
  acc[patientId].push(doc);
  return acc;
}, {});
```

---

<div align="center">

**Fait avec ❤️ pour DocQA**

*Synthèses intelligentes pour une meilleure prise en charge*

📊 **Analyse LLM** | 🔄 **Comparaisons** | 🏥 **Cliniquement Pertinent**

</div>
