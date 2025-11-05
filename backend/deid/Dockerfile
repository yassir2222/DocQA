# =============================================================================
# Multi-stage Dockerfile pour DeID Service
# Stage 1: Builder - Installation spaCy et Presidio
# Stage 2: Runtime - Image finale légère
# =============================================================================

# =============================================================================
# STAGE 1: Builder
# =============================================================================
FROM python:3.11-slim as builder

WORKDIR /build

# Installer les dépendances système pour la compilation
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copier requirements
COPY requirements.txt .

# Installer les packages Python dans /root/.local
RUN pip install --no-cache-dir --user -r requirements.txt

# Télécharger le modèle spaCy français via pip (plus fiable que spacy download)
RUN pip install --no-cache-dir --user https://github.com/explosion/spacy-models/releases/download/fr_core_news_md-3.7.0/fr_core_news_md-3.7.0-py3-none-any.whl

# =============================================================================
# STAGE 2: Runtime
# =============================================================================
FROM python:3.11-slim

# Métadonnées
LABEL maintainer="DocQA-MS Team"
LABEL service="deid"
LABEL version="2.0.0"

# Variables d'environnement
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    DEBIAN_FRONTEND=noninteractive

WORKDIR /app

# Installer les dépendances système runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Créer un utilisateur non-root
RUN useradd -m -u 1000 -s /bin/bash appuser

# Copier les packages Python depuis builder
COPY --from=builder --chown=appuser:appuser /root/.local /home/appuser/.local

# Ajouter le path des packages Python
ENV PATH=/home/appuser/.local/bin:$PATH

# Copier le code source
COPY --chown=appuser:appuser ./app /app/app
COPY --chown=appuser:appuser ./data /app/data

# Créer les dossiers nécessaires
RUN mkdir -p /app/logs && chown -R appuser:appuser /app

# Changer vers l'utilisateur non-root
USER appuser

# Exposer le port
EXPOSE 8002

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8002/health || exit 1

# Commande de démarrage
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8002"]
