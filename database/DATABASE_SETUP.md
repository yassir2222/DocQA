# Database Setup Commands

This document contains the commands used to initialize the DocQA PostgreSQL database.

## Prerequisites

- Docker and Docker Compose must be running
- The `docqa-postgres` container must be started

## Commands to Initialize the Database

### 1. Copy the SQL initialization script into the container

```bash
docker cp "database/init-scripts/create-databases.sql" docqa-postgres:/tmp/create-databases.sql
```

### 2. Execute the SQL script

```bash
docker exec -i docqa-postgres psql -U docqa_user -d postgres -f /tmp/create-databases.sql
```

### 3. Verify the database and tables were created

```bash
docker exec -i docqa-postgres psql -U docqa_user -d docqa_ingestor -c '\dt'
```

Expected output should show the `documents` table.

## Quick All-in-One Command

```bash
docker cp "database/init-scripts/create-databases.sql" docqa-postgres:/tmp/create-databases.sql && docker exec -i docqa-postgres psql -U docqa_user -d postgres -f /tmp/create-databases.sql
```

## Databases Created

- `docqa_ingestor` - For document ingestion service
- `docqa_deid` - For de-identification service
- `docqa_indexeur` - For indexing service
- `docqa_llmqa` - For LLM Q&A service
- `docqa_synthese` - For synthesis service
- `docqa_audit` - For audit logging

## Tables Created in docqa_ingestor

- `documents` - Stores uploaded documents and their metadata

## Troubleshooting

If you get a "role does not exist" error, the container uses `docqa_user` as the superuser, not `postgres`.

Always use `-U docqa_user` when connecting to the database.
