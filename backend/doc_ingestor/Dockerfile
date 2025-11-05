# =============================================================================
# Multi-stage Dockerfile pour DocIngestor
# Stage 1: Builder - Installation des dépendances Python
# Stage 2: Runtime - Image finale légère avec Tesseract OCR
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
    libmagic1 \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

# Copier requirements
COPY requirements.txt .

# Installer les packages Python dans /root/.local
RUN pip install --no-cache-dir --user -r requirements.txt

# =============================================================================
# STAGE 2: Runtime
# =============================================================================
FROM python:3.11-slim

# Métadonnées
LABEL maintainer="DocQA-MS Team"
LABEL service="doc_ingestor"
LABEL version="1.0.0"

# Variables d'environnement
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    DEBIAN_FRONTEND=noninteractive

WORKDIR /app

# Installer les dépendances système runtime + Tesseract OCR + curl
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    libmagic1 \
    poppler-utils \
    tesseract-ocr \
    tesseract-ocr-fra \
    tesseract-ocr-eng \
    libtesseract-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Créer un utilisateur non-root
RUN useradd -m -u 1000 -s /bin/bash appuser

# Copier les packages Python depuis builder
COPY --from=builder --chown=appuser:appuser /root/.local /home/appuser/.local

# Ajouter le path des packages Python
ENV PATH=/home/appuser/.local/bin:$PATH

# Créer le dossier temporaire
RUN mkdir -p /app/tmp && chown -R appuser:appuser /app

# Copier le code source
COPY --chown=appuser:appuser . .

# Changer vers l'utilisateur non-root
USER appuser

# Exposer le port
EXPOSE 8001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8001/health || exit 1

# Commande de démarrage
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
