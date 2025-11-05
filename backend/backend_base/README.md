# Backend Base - Template de Microservice

Ce dossier contient le template de base pour tous les microservices de DocQA-MS.

## 📁 Structure

```
backend_base/
├── app/
│   ├── config/           # Configuration centralisée
│   │   ├── __init__.py
│   │   └── settings.py   # Variables d'environnement
│   ├── core/             # Fonctionnalités core
│   │   ├── __init__.py
│   │   ├── database.py   # Configuration PostgreSQL
│   │   └── rabbitmq.py   # Client RabbitMQ
│   ├── models/           # Modèles SQLAlchemy
│   │   ├── __init__.py
│   │   └── base.py       # Modèles de base
│   ├── routes/           # Routes FastAPI
│   │   ├── __init__.py
│   │   ├── health.py     # Health checks
│   │   └── api.py        # Routes métier
│   ├── services/         # Logique métier
│   │   ├── __init__.py
│   │   └── example_service.py
│   └── __init__.py
├── Dockerfile            # Image Docker multistage
├── main.py              # Point d'entrée de l'application
└── requirements.txt     # Dépendances Python
```

## 🚀 Utilisation comme Template

Pour créer un nouveau microservice :

### 1. Copier le dossier

```bash
cp -r backend_base backend/nouveau_service
cd backend/nouveau_service
```

### 2. Modifier les fichiers

- **main.py** : Adapter le nom du service
- **app/config/settings.py** : Ajouter les variables spécifiques
- **app/routes/api.py** : Implémenter les endpoints métier
- **app/models/** : Créer les modèles de données
- **app/services/** : Implémenter la logique métier

### 3. Ajouter au docker-compose.yml

```yaml
nouveau_service:
  build:
    context: ../backend/nouveau_service
    dockerfile: Dockerfile
  container_name: docqa_nouveau_service
  environment:
    - SERVICE_NAME=nouveau_service
    # ... autres variables
  ports:
    - "8007:8000"
  depends_on:
    - postgres
    - rabbitmq
  networks:
    - backend-network
```

## 📝 Fonctionnalités Incluses

### ✅ Health Checks

- `GET /health` - Santé basique
- `GET /health/ready` - Readiness (DB check)
- `GET /health/live` - Liveness

### ✅ Base de Données

- Configuration PostgreSQL avec SQLAlchemy
- Session management
- Migrations avec Alembic (à ajouter)
- Connection pooling

### ✅ Message Queue

- Client RabbitMQ async avec aio-pika
- Reconnexion automatique
- Publication et consommation de messages

### ✅ Logging

- Format JSON structuré
- Niveaux de log configurables
- Middleware de logging des requêtes

### ✅ CORS

- Configuration centralisée
- Support multi-origines

### ✅ Documentation

- Swagger UI automatique (`/docs`)
- ReDoc (`/redoc`)

## 🔧 Configuration

Toutes les configurations se font via variables d'environnement (fichier `.env`) :

```bash
SERVICE_NAME=backend_base
LOG_LEVEL=INFO
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
RABBITMQ_HOST=rabbitmq
# ... etc
```

## 🏃 Exécution Locale

### Avec Docker

```bash
cd infra
docker-compose up backend_base
```

### Sans Docker (dev)

```bash
# Installer les dépendances
pip install -r requirements.txt

# Lancer le serveur
python main.py

# Ou avec reload automatique
uvicorn main:app --reload --port 8000
```

## 🧪 Tests

```bash
# Tests unitaires
pytest tests/ -v

# Tests avec coverage
pytest tests/ --cov=app --cov-report=html

# Linter
flake8 app/

# Format
black app/
```

## 📚 Exemples de Code

### Créer un nouveau endpoint

```python
# app/routes/api.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db_session

router = APIRouter()

@router.post("/mon-endpoint")
async def mon_endpoint(data: dict, db: Session = Depends(get_db_session)):
    # Logique métier
    return {"result": "success"}
```

### Créer un modèle

```python
# app/models/mon_modele.py
from sqlalchemy import Column, String, Integer
from app.models.base import BaseModel

class MonModele(BaseModel):
    __tablename__ = "mon_table"

    nom = Column(String(255), nullable=False)
    valeur = Column(Integer)
```

### Publier un événement RabbitMQ

```python
# Dans un service
rabbitmq = app.state.rabbitmq
await rabbitmq.publish(
    queue_name="ma_queue",
    message={"event": "mon_event", "data": {...}}
)
```

### Consommer un événement

```python
# Dans lifespan ou worker séparé
async def process_message(message: dict):
    logger.info(f"Message reçu: {message}")
    # Traitement

await rabbitmq.consume(
    queue_name="ma_queue",
    callback=process_message
)
```

## 🔐 Bonnes Pratiques

1. **Separation of Concerns** : Séparer routes, services et modèles
2. **Dependency Injection** : Utiliser Depends() de FastAPI
3. **Error Handling** : Try/except avec logging approprié
4. **Validation** : Utiliser Pydantic pour valider les entrées
5. **Async** : Privilégier async/await pour I/O
6. **Logging** : Logger toutes les opérations importantes
7. **Tests** : Écrire des tests pour chaque fonctionnalité

## 📖 Documentation

- [FastAPI](https://fastapi.tiangolo.com/)
- [SQLAlchemy](https://docs.sqlalchemy.org/)
- [aio-pika](https://aio-pika.readthedocs.io/)
- [Pydantic](https://docs.pydantic.dev/)

## 🐛 Troubleshooting

### Le service ne démarre pas

```bash
# Vérifier les logs
docker-compose logs backend_base

# Vérifier la connexion DB
docker-compose exec postgres psql -U docqa -d docqa_db

# Reconstruire l'image
docker-compose build --no-cache backend_base
```

### Erreurs de connexion RabbitMQ

Le service retry automatiquement. Attendre que RabbitMQ soit complètement démarré (~20s).

### Import errors

Vérifier que `PYTHONPATH=/app` est bien défini dans le Dockerfile.
