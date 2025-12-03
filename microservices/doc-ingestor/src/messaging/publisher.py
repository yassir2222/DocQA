"""
Publisher RabbitMQ pour envoyer les documents vers le service suivant
"""
import pika
import json
import logging
from typing import Dict, Any, Optional

from config import settings

logger = logging.getLogger(__name__)

# Connexion et channel globaux
_connection: Optional[pika.BlockingConnection] = None
_channel: Optional[pika.channel.Channel] = None


def init_rabbitmq():
    """Initialise la connexion RabbitMQ et déclare la queue"""
    global _connection, _channel
    
    try:
        # Créer les credentials
        credentials = pika.PlainCredentials(
            settings.RABBITMQ_USER,
            settings.RABBITMQ_PASSWORD
        )
        
        # Paramètres de connexion
        parameters = pika.ConnectionParameters(
            host=settings.RABBITMQ_HOST,
            port=settings.RABBITMQ_PORT,
            credentials=credentials,
            heartbeat=600,
            blocked_connection_timeout=300
        )
        
        # Établir la connexion
        _connection = pika.BlockingConnection(parameters)
        _channel = _connection.channel()
        
        # Déclarer la queue (durable pour persistance)
        _channel.queue_declare(
            queue=settings.RABBITMQ_QUEUE,
            durable=True
        )
        
        logger.info(f"[OK] RabbitMQ connecte (queue: {settings.RABBITMQ_QUEUE})")
        
    except Exception as e:
        logger.error(f"[ERREUR] Erreur connexion RabbitMQ: {str(e)}")
        logger.error("Assurez-vous que RabbitMQ est démarré et accessible")
        # Ne pas lever d'exception pour permettre au service de démarrer
        # Les messages seront simplement non publiés


def publish_document(message: Dict[str, Any]) -> bool:
    """
    Publie un document vers RabbitMQ
    
    Args:
        message: Dictionnaire contenant les informations du document
    
    Returns:
        True si succès, False sinon
    """
    global _channel
    
    try:
        # Vérifier la connexion
        if _channel is None or _channel.is_closed:
            logger.warning("[WARN] Channel RabbitMQ ferme, tentative de reconnexion...")
            init_rabbitmq()
        
        if _channel is None:
            logger.error("[ERREUR] Impossible de publier: pas de connexion RabbitMQ")
            return False
        
        # Convertir en JSON
        message_body = json.dumps(message, ensure_ascii=False)
        
        # Publier le message
        _channel.basic_publish(
            exchange='',
            routing_key=settings.RABBITMQ_QUEUE,
            body=message_body.encode('utf-8'),
            properties=pika.BasicProperties(
                delivery_mode=2,  # Rendre le message persistant
                content_type='application/json'
            )
        )
        
        logger.info(f"[MSG] Message publie vers {settings.RABBITMQ_QUEUE} (doc_id: {message.get('document_id')})")
        return True
        
    except Exception as e:
        logger.error(f"[ERREUR] Erreur publication RabbitMQ: {str(e)}")
        return False


def close_rabbitmq():
    """Ferme la connexion RabbitMQ"""
    global _connection, _channel
    
    try:
        if _channel and not _channel.is_closed:
            _channel.close()
            logger.info("[OK] Channel RabbitMQ ferme")
        
        if _connection and not _connection.is_closed:
            _connection.close()
            logger.info("[OK] Connexion RabbitMQ fermee")
            
    except Exception as e:
        logger.error(f"[WARN] Erreur fermeture RabbitMQ: {str(e)}")


def check_rabbitmq_connection() -> bool:
    """
    Vérifie si la connexion RabbitMQ est active
    
    Returns:
        True si connecté, False sinon
    """
    global _connection, _channel
    
    return (
        _connection is not None and 
        not _connection.is_closed and
        _channel is not None and
        not _channel.is_closed
    )


def get_queue_status() -> Dict[str, Any]:
    """
    Récupère le statut de la queue
    
    Returns:
        Dictionnaire avec les informations de la queue
    """
    global _channel
    
    try:
        if _channel is None or _channel.is_closed:
            return {"error": "Channel non disponible"}
        
        # Déclarer passivement la queue pour obtenir son statut
        method = _channel.queue_declare(
            queue=settings.RABBITMQ_QUEUE,
            durable=True,
            passive=True
        )
        
        return {
            "queue": settings.RABBITMQ_QUEUE,
            "message_count": method.method.message_count,
            "consumer_count": method.method.consumer_count
        }
        
    except Exception as e:
        logger.error(f"[ERREUR] Erreur recuperation statut queue: {str(e)}")
        return {"error": str(e)}
