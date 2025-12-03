"""
Repository pour la base de donnees LLMQAModule
"""
import psycopg2
from psycopg2.extras import RealDictCursor
import logging
from typing import Optional, List, Dict

from config import settings

logger = logging.getLogger(__name__)

_connection = None


def get_connection():
    """Obtient une connexion a la base de donnees"""
    global _connection
    
    if _connection is None or _connection.closed:
        try:
            _connection = psycopg2.connect(
                host=settings.DB_HOST,
                port=settings.DB_PORT,
                database=settings.DB_NAME,
                user=settings.DB_USER,
                password=settings.DB_PASSWORD
            )
            logger.info("[OK] Connexion PostgreSQL etablie")
        except Exception as e:
            logger.error(f"[ERREUR] Erreur connexion PostgreSQL: {str(e)}")
            raise
    
    return _connection


def init_database():
    """Initialise la base de donnees et cree les tables si necessaire"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # Table pour stocker l'historique des questions
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS query_history (
                id SERIAL PRIMARY KEY,
                query_id VARCHAR(100) UNIQUE NOT NULL,
                question TEXT NOT NULL,
                answer TEXT,
                confidence FLOAT,
                sources JSONB,
                user_id VARCHAR(100),
                processing_time_ms INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Index pour la recherche
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_query_user ON query_history(user_id)
        """)
        
        conn.commit()
        cursor.close()
        logger.info("[OK] Tables creees/verifiees")
        
    except Exception as e:
        logger.error(f"[ERREUR] Erreur initialisation base de donnees: {str(e)}")


def save_query(
    query_id: str,
    question: str,
    answer: str,
    confidence: float,
    sources: List[Dict],
    user_id: Optional[str],
    processing_time: int
):
    """Sauvegarde une requête dans l'historique"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        import json
        cursor.execute("""
            INSERT INTO query_history (query_id, question, answer, confidence, sources, user_id, processing_time_ms)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (query_id, question, answer, confidence, json.dumps(sources), user_id, processing_time))
        
        conn.commit()
        cursor.close()
        
    except Exception as e:
        logger.error(f"[ERREUR] Erreur sauvegarde query: {e}")


def get_query_history(user_id: Optional[str] = None, limit: int = 50) -> List[Dict]:
    """Recupere l'historique des requetes"""
    try:
        conn = get_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        if user_id:
            cursor.execute("""
                SELECT * FROM query_history 
                WHERE user_id = %s 
                ORDER BY created_at DESC 
                LIMIT %s
            """, (user_id, limit))
        else:
            cursor.execute("""
                SELECT * FROM query_history 
                ORDER BY created_at DESC 
                LIMIT %s
            """, (limit,))
        
        results = cursor.fetchall()
        cursor.close()
        
        return [dict(row) for row in results]
        
    except Exception as e:
        logger.error(f"[ERREUR] Erreur recuperation historique: {e}")
        return []
