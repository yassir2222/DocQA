"""
Configuration de la base de données PostgreSQL.
Utilise SQLAlchemy pour l'ORM.
"""

import logging
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator

from app.config.settings import settings

logger = logging.getLogger(__name__)

# Création du moteur SQLAlchemy
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,  # Vérifie la connexion avant de l'utiliser
    pool_size=10,
    max_overflow=20,
    echo=settings.DEBUG,  # Log les requêtes SQL en mode debug
)

# Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base pour les modèles
Base = declarative_base()


def get_db_session() -> Generator[Session, None, None]:
    """
    Générateur de session de base de données.
    Utilisé comme dépendance FastAPI.
    
    Usage:
        @app.get("/items")
        def read_items(db: Session = Depends(get_db_session)):
            return db.query(Item).all()
    """
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error(f"Erreur de base de données: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def init_db() -> None:
    """
    Initialise la base de données.
    Crée toutes les tables définies dans les modèles.
    """
    try:
        logger.info("Création des tables de base de données...")
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Tables créées avec succès")
    except Exception as e:
        logger.error(f"❌ Erreur lors de la création des tables: {e}")
        raise


def check_db_connection() -> bool:
    """
    Vérifie la connexion à la base de données.
    
    Returns:
        bool: True si la connexion est OK, False sinon
    """
    try:
        with engine.connect() as connection:
            connection.execute("SELECT 1")
        return True
    except Exception as e:
        logger.error(f"Erreur de connexion à la base de données: {e}")
        return False
