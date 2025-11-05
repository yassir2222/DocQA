"""
Service RabbitMQ pour la publication de messages.
Gère la communication asynchrone avec les autres microservices.
"""
import json
import asyncio
from typing import Dict, Any, Optional

try:
    import pika
    from pika.exceptions import AMQPConnectionError, AMQPChannelError
except ImportError:
    pika = None

from config import settings
from utils.logger import get_logger, log_audit

logger = get_logger(__name__)


class RabbitMQService:
    """
    Service RabbitMQ avec reconnexion automatique.
    """
    
    def __init__(self):
        """Initialise le service RabbitMQ."""
        self.connection: Optional[Any] = None
        self.channel: Optional[Any] = None
        self.is_connected = False
    
    def connect(self, max_retries: int = 5, retry_delay: int = 5) -> bool:
        """
        Établit la connexion à RabbitMQ avec retry.
        
        Args:
            max_retries: Nombre maximum de tentatives
            retry_delay: Délai entre les tentatives (secondes)
            
        Returns:
            True si connecté, False sinon
        """
        if not pika:
            logger.error("pika n'est pas installé. Installez: pip install pika")
            return False
        
        for attempt in range(max_retries):
            try:
                # Paramètres de connexion
                credentials = pika.PlainCredentials(
                    settings.RABBITMQ_USER,
                    settings.RABBITMQ_PASSWORD
                )
                parameters = pika.ConnectionParameters(
                    host=settings.RABBITMQ_HOST,
                    port=settings.RABBITMQ_PORT,
                    credentials=credentials,
                    heartbeat=600,
                    blocked_connection_timeout=300,
                )
                
                # Connexion
                self.connection = pika.BlockingConnection(parameters)
                self.channel = self.connection.channel()
                
                # Déclarer les queues
                self.channel.queue_declare(
                    queue=settings.DEID_QUEUE,
                    durable=True
                )
                self.channel.queue_declare(
                    queue=settings.ERROR_QUEUE,
                    durable=True
                )
                
                self.is_connected = True
                
                log_audit(
                    logger,
                    action="rabbitmq_connect",
                    status="success",
                    details={"host": settings.RABBITMQ_HOST}
                )
                
                return True
                
            except (AMQPConnectionError, ConnectionError) as e:
                logger.warning(
                    f"Tentative {attempt + 1}/{max_retries} échouée: {str(e)}"
                )
                if attempt < max_retries - 1:
                    import time
                    time.sleep(retry_delay)
                else:
                    log_audit(
                        logger,
                        action="rabbitmq_connect",
                        status="error",
                        error=f"Échec après {max_retries} tentatives"
                    )
                    return False
        
        return False
    
    def disconnect(self):
        """Ferme la connexion RabbitMQ."""
        try:
            if self.connection and not self.connection.is_closed:
                self.connection.close()
                self.is_connected = False
                
                log_audit(
                    logger,
                    action="rabbitmq_disconnect",
                    status="success"
                )
        except Exception as e:
            logger.error(f"Erreur lors de la déconnexion: {str(e)}")
    
    def publish_message(
        self,
        queue_name: str,
        message: Dict[str, Any],
        document_id: Optional[str] = None
    ) -> bool:
        """
        Publie un message dans une queue.
        
        Args:
            queue_name: Nom de la queue
            message: Message à publier (dict)
            document_id: ID du document pour les logs
            
        Returns:
            True si publié, False sinon
        """
        if not self.is_connected:
            if not self.connect():
                return False
        
        try:
            # Convertir en JSON
            message_json = json.dumps(message, ensure_ascii=False)
            
            # Publier
            self.channel.basic_publish(
                exchange='',
                routing_key=queue_name,
                body=message_json,
                properties=pika.BasicProperties(
                    delivery_mode=2,  # Message persistant
                    content_type='application/json',
                )
            )
            
            log_audit(
                logger,
                action="publish_message",
                document_id=document_id,
                status="success",
                details={
                    "queue": queue_name,
                    "message_size": len(message_json)
                }
            )
            
            return True
            
        except (AMQPChannelError, AMQPConnectionError) as e:
            logger.error(f"Erreur de connexion RabbitMQ: {str(e)}")
            self.is_connected = False
            
            # Retry une fois
            if self.connect():
                return self.publish_message(queue_name, message, document_id)
            
            log_audit(
                logger,
                action="publish_message",
                document_id=document_id,
                status="error",
                error=str(e)
            )
            return False
            
        except Exception as e:
            log_audit(
                logger,
                action="publish_message",
                document_id=document_id,
                status="error",
                error=str(e)
            )
            return False
    
    def send_to_deid_queue(self, document_data: Dict[str, Any]) -> bool:
        """
        Envoie un document vers la queue de désidentification.
        
        Args:
            document_data: Données du document
            
        Returns:
            True si envoyé, False sinon
        """
        return self.publish_message(
            settings.DEID_QUEUE,
            document_data,
            document_id=document_data.get("document_id")
        )
    
    def send_to_error_queue(
        self,
        error_data: Dict[str, Any],
        document_id: Optional[str] = None
    ) -> bool:
        """
        Envoie une erreur vers la queue d'erreurs.
        
        Args:
            error_data: Données de l'erreur
            document_id: ID du document concerné
            
        Returns:
            True si envoyé, False sinon
        """
        return self.publish_message(
            settings.ERROR_QUEUE,
            error_data,
            document_id=document_id
        )


# Instance globale
rabbitmq_service = RabbitMQService()
