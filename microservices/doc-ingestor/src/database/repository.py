"""
Repository pour l'accès à la base de données PostgreSQL
"""
import psycopg2
from psycopg2.extras import RealDictCursor
import json
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime

from config import settings

logger = logging.getLogger(__name__)

# Connexion globale (pool de connexions en production)
_connection = None


def get_connection():
    """Obtient une connexion à la base de données"""
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
            logger.info("✅ Connexion PostgreSQL établie")
        except Exception as e:
            logger.error(f"❌ Erreur connexion PostgreSQL: {str(e)}")
            raise
    
    return _connection


def init_database():
    """Initialise la base de données et crée les tables si nécessaire"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # Vérifier si la table existe
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'documents'
            )
        """)
        
        table_exists = cursor.fetchone()[0]
        
        if table_exists:
            logger.info("✅ Table 'documents' existe déjà")
        else:
            logger.info("⚠️ Table 'documents' n'existe pas, création...")
            # Note: La table devrait être créée par le script SQL init
            logger.warning("Exécutez le script database/init-scripts/create-databases.sql")
        
        cursor.close()
        
    except Exception as e:
        logger.error(f"❌ Erreur initialisation base de données: {str(e)}")
        raise


def save_document(
    filename: str,
    file_type: str,
    file_size: int,
    text_content: str,
    metadata: Dict[str, Any],
    patient_id: Optional[str] = None,
    document_type: Optional[str] = None
) -> int:
    """
    Sauvegarde un document dans la base de données
    
    Args:
        filename: Nom du fichier
        file_type: Type/extension du fichier
        file_size: Taille en bytes
        text_content: Contenu textuel extrait
        metadata: Métadonnées JSON
        patient_id: ID du patient
        document_type: Type de document médical
    
    Returns:
        ID du document créé
    """
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO documents (
                filename, file_type, file_size, text_content, 
                metadata, patient_id, document_type, processed,
                created_at, updated_at
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
            ) RETURNING id
        """, (
            filename,
            file_type,
            file_size,
            text_content,
            json.dumps(metadata),
            patient_id,
            document_type,
            False,
            datetime.now(),
            datetime.now()
        ))
        
        document_id = cursor.fetchone()[0]
        conn.commit()
        cursor.close()
        
        logger.info(f"✅ Document {document_id} sauvegardé")
        return document_id
        
    except Exception as e:
        logger.error(f"❌ Erreur sauvegarde document: {str(e)}")
        if conn:
            conn.rollback()
        raise


def get_document_by_id(document_id: int) -> Optional[Dict[str, Any]]:
    """
    Récupère un document par son ID
    
    Args:
        document_id: ID du document
    
    Returns:
        Dictionnaire représentant le document ou None
    """
    try:
        conn = get_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("""
            SELECT id, filename, file_type, file_size, 
                   text_content, metadata, patient_id, 
                   document_type, processed, upload_date,
                   created_at, updated_at
            FROM documents
            WHERE id = %s
        """, (document_id,))
        
        row = cursor.fetchone()
        cursor.close()
        
        if row:
            document = dict(row)
            # Convertir les dates en ISO format
            for date_field in ['upload_date', 'created_at', 'updated_at']:
                if document.get(date_field):
                    document[date_field] = document[date_field].isoformat()
            return document
        
        return None
        
    except Exception as e:
        logger.error(f"❌ Erreur récupération document {document_id}: {str(e)}")
        raise


def get_all_documents(
    limit: int = 100,
    offset: int = 0,
    patient_id: Optional[str] = None,
    document_type: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Récupère tous les documents avec filtres optionnels
    
    Args:
        limit: Nombre maximum de résultats
        offset: Offset pour pagination
        patient_id: Filtrer par patient_id
        document_type: Filtrer par type de document
    
    Returns:
        Liste de documents
    """
    try:
        conn = get_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Construire la requête avec filtres
        query = """
            SELECT id, filename, file_type, file_size,
                   patient_id, document_type, processed,
                   upload_date, created_at
            FROM documents
            WHERE 1=1
        """
        params = []
        
        if patient_id:
            query += " AND patient_id = %s"
            params.append(patient_id)
        
        if document_type:
            query += " AND document_type = %s"
            params.append(document_type)
        
        query += " ORDER BY created_at DESC LIMIT %s OFFSET %s"
        params.extend([limit, offset])
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        cursor.close()
        
        documents = []
        for row in rows:
            doc = dict(row)
            # Convertir les dates
            for date_field in ['upload_date', 'created_at']:
                if doc.get(date_field):
                    doc[date_field] = doc[date_field].isoformat()
            documents.append(doc)
        
        return documents
        
    except Exception as e:
        logger.error(f"❌ Erreur récupération documents: {str(e)}")
        raise


def update_document_status(document_id: int, processed: bool):
    """
    Met à jour le statut de traitement d'un document
    
    Args:
        document_id: ID du document
        processed: Nouveau statut
    """
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE documents
            SET processed = %s, updated_at = %s
            WHERE id = %s
        """, (processed, datetime.now(), document_id))
        
        conn.commit()
        cursor.close()
        
        logger.info(f"✅ Document {document_id} mis à jour (processed={processed})")
        
    except Exception as e:
        logger.error(f"❌ Erreur mise à jour document {document_id}: {str(e)}")
        if conn:
            conn.rollback()
        raise


def close_connection():
    """Ferme la connexion à la base de données"""
    global _connection
    if _connection and not _connection.closed:
        _connection.close()
        logger.info("🔌 Connexion PostgreSQL fermée")
