# 📝 Audit Logger

<div align="center">

![Java](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2-6DB33F?style=for-the-badge&logo=spring&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Compliance](https://img.shields.io/badge/RGPD-Compliant-green?style=for-the-badge)

**🔍 Service de Traçabilité et d'Audit pour Documents Médicaux**

*Conformité réglementaire • Logs détaillés • Statistiques temps réel*

[Architecture](#-architecture) •
[Fonctionnalités](#-fonctionnalités) •
[API](#-api-endpoints) •
[Configuration](#-configuration)

</div>

---

## 🎯 Présentation

**Audit Logger** assure la traçabilité complète de toutes les interactions avec les documents médicaux dans DocQA. Essentiel pour la conformité RGPD et les exigences de traçabilité en milieu hospitalier, il enregistre qui accède à quoi, quand et pourquoi.

```
🔐 Action → 📝 Log Audit → 💾 PostgreSQL → 📊 Analytics
```

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                       AUDIT LOGGER                                  │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │                    REST CONTROLLER                           │  │
│   │  POST /logs  │  GET /logs  │  GET /stats  │  GET /search    │  │
│   └───────────────────────────┬─────────────────────────────────┘  │
│                               │                                     │
│                               ▼                                     │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │                    AUDIT SERVICE                             │  │
│   │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │  │
│   │  │  Log Creator │  │  Statistics  │  │     Search       │  │  │
│   │  │              │  │   Engine     │  │     Engine       │  │  │
│   │  └──────────────┘  └──────────────┘  └──────────────────┘  │  │
│   └───────────────────────────┬─────────────────────────────────┘  │
│                               │                                     │
│                               ▼                                     │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │                   AUDIT REPOSITORY                           │  │
│   │                     (JPA/Hibernate)                          │  │
│   └───────────────────────────┬─────────────────────────────────┘  │
│                               │                                     │
│                               ▼                                     │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │                     POSTGRESQL                               │  │
│   │                   audit_logs table                           │  │
│   │  ┌─────────────────────────────────────────────────────┐    │  │
│   │  │ id │ user_id │ action │ resource │ timestamp │ ... │    │  │
│   │  └─────────────────────────────────────────────────────┘    │  │
│   └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Fonctionnalités

### 📋 Types d'Actions Tracées

| Action | Description | Service Source |
|--------|-------------|----------------|
| `UPLOAD_DOCUMENT` | Upload d'un document | doc-ingestor |
| `VIEW_DOCUMENT` | Consultation d'un document | interface-clinique |
| `SEARCH_DOCUMENTS` | Recherche dans les documents | indexeur-semantique |
| `ASK_QUESTION` | Question au LLM | llm-qa-module |
| `GENERATE_SYNTHESIS` | Génération de synthèse | synthese-comparative |
| `GENERATE_COMPARISON` | Comparaison inter-patients | synthese-comparative |
| `ANONYMIZE_DOCUMENT` | Anonymisation | deid-service |
| `EXPORT_DATA` | Export de données | interface-clinique |

### 🔍 Informations Capturées

```json
{
  "id": 12345,
  "userId": "dr-martin",
  "action": "ASK_QUESTION",
  "resourceType": "DOCUMENT",
  "resourceId": "DOC-001",
  "queryText": "Quels sont les traitements prescrits?",
  "responseSummary": "Réponse générée avec 3 sources",
  "documentsAccessed": ["DOC-001", "DOC-002", "DOC-003"],
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "service": "llm-qa-module",
  "processingTimeMs": 15234,
  "status": "SUCCESS",
  "createdAt": "2025-12-05T10:30:00Z"
}
```

### 📊 Statistiques Temps Réel

```
┌─────────────────────────────────────────────────────────────┐
│                    DASHBOARD STATISTIQUES                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📈 Total Logs: 15,234                                       │
│                                                              │
│  📊 Par Action:                                              │
│  ├── ASK_QUESTION: 5,421 (35%)                              │
│  ├── SEARCH_DOCUMENTS: 4,892 (32%)                          │
│  ├── VIEW_DOCUMENT: 3,156 (21%)                             │
│  ├── GENERATE_SYNTHESIS: 1,234 (8%)                         │
│  └── AUTRES: 531 (4%)                                        │
│                                                              │
│  ⏱️ Temps Moyen par Service:                                 │
│  ├── llm-qa-module: 18,234 ms                               │
│  ├── synthese-comparative: 25,678 ms                         │
│  ├── indexeur-semantique: 156 ms                            │
│  └── doc-ingestor: 2,345 ms                                 │
│                                                              │
│  ❌ Erreurs: 23 (0.15%)                                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ API Endpoints

### `POST /api/audit/logs`

Crée un nouveau log d'audit.

```bash
curl -X POST "http://localhost:8006/api/audit/logs" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "dr-martin",
    "action": "ASK_QUESTION",
    "resourceType": "DOCUMENT",
    "resourceId": "DOC-001",
    "queryText": "Quels traitements?",
    "responseSummary": "Réponse avec 3 sources",
    "documentsAccessed": ["DOC-001", "DOC-002"],
    "service": "llm-qa-module",
    "processingTimeMs": 15234,
    "status": "SUCCESS"
  }'
```

**Response:**
```json
{
  "id": 12345,
  "message": "Log créé avec succès",
  "createdAt": "2025-12-05T10:30:00Z"
}
```

### `GET /api/audit/logs`

Récupère les logs avec pagination.

```bash
curl "http://localhost:8006/api/audit/logs?page=0&size=20"
```

**Response:**
```json
{
  "content": [
    {
      "id": 12345,
      "userId": "dr-martin",
      "action": "ASK_QUESTION",
      "createdAt": "2025-12-05T10:30:00Z"
    }
  ],
  "totalElements": 15234,
  "totalPages": 762,
  "number": 0
}
```

### `GET /api/audit/logs/user/{userId}`

Logs par utilisateur.

```bash
curl "http://localhost:8006/api/audit/logs/user/dr-martin?page=0&size=20"
```

### `GET /api/audit/logs/search`

Recherche dans les logs.

```bash
curl "http://localhost:8006/api/audit/logs/search?keyword=diabète"
```

### `GET /api/audit/logs/errors`

Récupère les logs d'erreur.

```bash
curl "http://localhost:8006/api/audit/logs/errors"
```

### `GET /api/audit/stats`

Statistiques d'audit.

```bash
curl "http://localhost:8006/api/audit/stats"
```

**Response:**
```json
{
  "totalLogs": 15234,
  "logsByAction": {
    "ASK_QUESTION": 5421,
    "SEARCH_DOCUMENTS": 4892,
    "VIEW_DOCUMENT": 3156,
    "GENERATE_SYNTHESIS": 1234
  },
  "logsByService": {
    "llm-qa-module": 6500,
    "indexeur-semantique": 5200,
    "synthese-comparative": 2000,
    "doc-ingestor": 1534
  },
  "averageProcessingTimeByService": {
    "llm-qa-module": 18234.5,
    "synthese-comparative": 25678.3,
    "indexeur-semantique": 156.2,
    "doc-ingestor": 2345.1
  },
  "errorCount": 23
}
```

### `GET /api/audit/logs/range`

Logs par période.

```bash
curl "http://localhost:8006/api/audit/logs/range?start=2025-12-01T00:00:00&end=2025-12-05T23:59:59"
```

### `GET /health`

```json
{
  "status": "UP",
  "database": "CONNECTED",
  "totalLogs": 15234
}
```

---

## ⚙️ Configuration

### `application.yml`

```yaml
server:
  port: 8006

spring:
  application:
    name: audit-logger

  datasource:
    url: jdbc:postgresql://postgres:5432/docqa_audit
    username: docqa_user
    password: docqa_password

  jpa:
    hibernate:
      ddl-auto: update
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect

# Rétention des logs
audit:
  retention:
    days: 365  # Conserver 1 an pour conformité
  cleanup:
    enabled: true
    cron: "0 0 2 * * ?"  # Nettoyage quotidien à 2h
```

---

## 📦 Installation

### 🐳 Docker (Recommandé)

```bash
# Depuis la racine du projet
docker-compose up -d audit-logger
```

### 💻 Local (Maven)

```bash
# 1. Compiler
cd microservices/audit-logger
mvn clean package -DskipTests

# 2. Lancer
java -jar target/audit-logger-1.0.0.jar
```

---

## 📁 Structure du Projet

```
audit-logger/
├── 📄 pom.xml                    # Configuration Maven
├── 🐳 Dockerfile                 # Image Docker
│
└── 📂 src/main/java/com/docqa/audit/
    │
    ├── 📄 AuditLoggerApplication.java
    │
    ├── 📂 config/
    │   └── WebConfig.java        # Configuration CORS
    │
    ├── 📂 controller/
    │   └── AuditController.java  # Endpoints REST
    │
    ├── 📂 service/
    │   └── AuditService.java     # Logique métier
    │
    ├── 📂 repository/
    │   └── AuditLogRepository.java  # Accès données
    │
    ├── 📂 model/
    │   └── AuditLog.java         # Entity JPA
    │
    └── 📂 dto/
        ├── AuditLogDTO.java      # DTO création
        └── AuditStatsDTO.java    # DTO statistiques
```

---

## 🔐 Conformité & Sécurité

### RGPD Compliance

| Exigence | Implémentation |
|----------|----------------|
| **Traçabilité** | Tous les accès sont loggés |
| **Droit d'accès** | Logs exportables par utilisateur |
| **Durée conservation** | Configurable (défaut 1 an) |
| **Minimisation** | Pas de données médicales brutes |

### Schéma de la Table

```sql
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id VARCHAR(255),
    query_text TEXT,
    response_summary TEXT,
    documents_accessed TEXT,  -- JSON array
    ip_address VARCHAR(50),
    user_agent TEXT,
    service VARCHAR(100),
    processing_time_ms INTEGER,
    status VARCHAR(20) DEFAULT 'SUCCESS',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour les recherches fréquentes
CREATE INDEX idx_user_id ON audit_logs(user_id);
CREATE INDEX idx_action ON audit_logs(action);
CREATE INDEX idx_created_at ON audit_logs(created_at);
CREATE INDEX idx_status ON audit_logs(status);
```

---

## 📊 Dashboard Frontend

```javascript
// AuditPage.js - Affichage des logs
const AuditPage = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Charger les statistiques
    api.getAuditStats().then(setStats);
    
    // Charger les logs récents
    api.getAuditLogs(0, 20).then(data => setLogs(data.content));
  }, []);

  return (
    <div>
      {/* Statistiques */}
      <StatsCards stats={stats} />
      
      {/* Tableau des logs */}
      <LogsTable logs={logs} />
    </div>
  );
};
```

---

## 🐛 Troubleshooting

### Logs non créés

```bash
# Vérifier la connexion DB
docker-compose logs audit-logger | grep "HikariPool"

# Tester l'endpoint
curl -X POST "http://localhost:8006/api/audit/logs" \
  -H "Content-Type: application/json" \
  -d '{"userId": "test", "action": "TEST"}'
```

### Performance dégradée

```sql
-- Analyser les index
EXPLAIN ANALYZE SELECT * FROM audit_logs 
WHERE user_id = 'dr-martin' 
ORDER BY created_at DESC 
LIMIT 20;

-- Ajouter des index si nécessaire
CREATE INDEX idx_user_created ON audit_logs(user_id, created_at DESC);
```

---

## 🔗 Intégration Services

Tous les services DocQA envoient leurs logs d'audit :

```java
// Exemple dans llm-qa-module
auditClientService.logAction(
    "ASK_QUESTION",
    userId,
    question,
    responseId
);

// Exemple dans synthese-comparative
auditClientService.logAction(
    "GENERATE_SYNTHESIS",
    request.getUserId(),
    "Type: " + request.getSynthesisType(),
    result.getId()
);
```

---

<div align="center">

**Fait avec ❤️ pour DocQA**

*Traçabilité complète pour une médecine responsable*

🔐 **RGPD Compliant** | 📊 **Analytics** | 🏥 **Healthcare Ready**

</div>
