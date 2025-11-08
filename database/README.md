# Configuration Base de Données PostgreSQL

## Installation PostgreSQL

Vous avez déjà PostgreSQL 18 installé.

## Initialisation des Bases de Données

### 1. Connexion à PostgreSQL

```powershell
# Ouvrir psql
psql -U postgres
```

### 2. Exécution du script d'initialisation

```powershell
# Depuis le répertoire racine du projet
psql -U postgres -f database/init-scripts/create-databases.sql
```

### 3. Vérification

```sql
-- Liste des bases de données
\l

-- Connexion à une base
\c docqa_ingestor

-- Liste des tables
\dt

-- Description d'une table
\d documents
```

## Bases de Données Créées

1. **docqa_ingestor** - Documents ingérés
2. **docqa_deid** - Données anonymisées
3. **docqa_indexeur** - Chunks et embeddings
4. **docqa_llmqa** - Requêtes et réponses LLM
5. **docqa_synthese** - Synthèses générées
6. **docqa_audit** - Logs d'audit

## Connexion depuis les Services

### Python (psycopg2)

```python
import psycopg2

conn = psycopg2.connect(
    host="localhost",
    port=5432,
    database="docqa_ingestor",
    user="docqa_user",
    password="docqa_password"
)
```

### Java (Spring Boot)

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/docqa_deid
spring.datasource.username=docqa_user
spring.datasource.password=docqa_password
```

## Maintenance

### Backup

```powershell
pg_dump -U postgres docqa_ingestor > backup_ingestor.sql
```

### Restore

```powershell
psql -U postgres docqa_ingestor < backup_ingestor.sql
```

### Reset

```sql
DROP DATABASE IF EXISTS docqa_ingestor;
-- Puis réexécuter create-databases.sql
```
