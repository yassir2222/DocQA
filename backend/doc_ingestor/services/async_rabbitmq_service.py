"""
Service RabbitMQ ASYNCHRONE avec aio-pika.
Gère l'envoi de messages vers les queues avec resilience.
"""
import json
from typing import Dict, Any, Optional
import asyncio

import aio_pika
from aio_pika import connect_robust, Message, DeliveryMode
from aio_pika.abc import AbstractRobustConnection, AbstractRobustChannel

from config import settings
from utils.logger import get_logger, log_audit

logger = get_logger(__name__)


class AsyncRabbitMQService:
    """Service ASYNCHRONE de gestion RabbitMQ avec aio-pika."""
    
    def __init__(self):
        """Initialise le service RabbitMQ."""
        self.connection: Optional[AbstractRobustConnection] = None
        self.channel: Optional[AbstractRobustChannel] = None
        self.connected = False
    
    async def connect(self) -> bool:
        """
        Établit une connexion robuste à RabbitMQ (auto-reconnect).
        
        Returns:
            True si connecté, False sinon
        """
        try:
            # Connexion robuste avec reconnexion automatique
            self.connection = await connect_robust(
                settings.RABBITMQ_URL,
                timeout=10.0
            )
            
            # Créer un channel
            self.channel = await self.connection.channel()
            
            # Déclarer les queues (idempotent)
            await self.channel.declare_queue(
                settings.DEID_QUEUE,
                durable=True,
                arguments={
                    "x-message-ttl": 86400000,  # 24h
                    "x-max-length": 10000  # Max 10k messages
                }
            )
            
            await self.channel.declare_queue(
                settings.ERROR_QUEUE,
                durable=True,
                arguments={
                    "x-message-ttl": 604800000,  # 7 jours
                    "x-max-length": 50000
                }
            )
            
            self.connected = True
            
            log_audit(
                logger,
                action="rabbitmq_async_connect",
                status="success",
                details={
                    "host": settings.RABBITMQ_HOST,
                    "queues": [settings.DEID_QUEUE, settings.ERROR_QUEUE]
                }
            )
            
            logger.info(f"✓ RabbitMQ async connecté: {settings.RABBITMQ_HOST}")
            return True
            
        except Exception as e:
            self.connected = False
            log_audit(
                logger,
                action="rabbitmq_async_connect",
                status="error",
                error=str(e)
            )
            logger.error(f"✗ Échec connexion RabbitMQ async: {str(e)}")
            return False
    
    async def disconnect(self):
        """Ferme la connexion RabbitMQ."""
        try:
            if self.channel:
                await self.channel.close()
            if self.connection:
                await self.connection.close()
            
            self.connected = False
            logger.info("✓ RabbitMQ async déconnecté")
            
        except Exception as e:
            logger.error(f"Erreur déconnexion RabbitMQ async: {str(e)}")
    
    async def send_message(
        self,
        queue_name: str,
        message_data: Dict[str, Any],
        priority: int = 5
    ) -> bool:
        """
        Envoie un message vers une queue (version async).
        
        Args:
            queue_name: Nom de la queue
            message_data: Données à envoyer (dict JSON)
            priority: Priorité du message (0-9, défaut 5)
            
        Returns:
            True si envoyé, False sinon
        """
        if not self.connected:
            logger.warning("RabbitMQ non connecté, tentative de reconnexion...")
            await self.connect()
        
        if not self.connected:
            logger.error("Impossible de se connecter à RabbitMQ")
            return False
        
        try:
            # Sérialiser en JSON
            message_body = json.dumps(message_data, ensure_ascii=False)
            
            # Créer le message avec persistance
            message = Message(
                body=message_body.encode('utf-8'),
                delivery_mode=DeliveryMode.PERSISTENT,  # Survit au redémarrage
                priority=priority,
                content_type='application/json',
                content_encoding='utf-8'
            )
            
            # Envoyer vers la queue
            await self.channel.default_exchange.publish(
                message,
                routing_key=queue_name
            )
            
            log_audit(
                logger,
                action="rabbitmq_async_send",
                status="success",
                details={
                    "queue": queue_name,
                    "message_size": len(message_body),
                    "priority": priority
                }
            )
            
            logger.info(f"✓ Message envoyé vers {queue_name}")
            return True
            
        except Exception as e:
            log_audit(
                logger,
                action="rabbitmq_async_send",
                status="error",
                error=str(e),
                details={"queue": queue_name}
            )
            logger.error(f"✗ Échec envoi message vers {queue_name}: {str(e)}")
            return False
    
    async def send_to_deid_queue(
        self,
        message_data: Dict[str, Any]
    ) -> bool:
        """
        Envoie un document vers la queue de désidentification.
        
        Args:
            message_data: Données du document
            
        Returns:
            True si envoyé, False sinon
        """
        return await self.send_message(
            queue_name=settings.DEID_QUEUE,
            message_data=message_data,
            priority=7  # Haute priorité pour les documents médicaux
        )
    
    async def send_to_error_queue(
        self,
        error_data: Dict[str, Any],
        document_id: Optional[str] = None
    ) -> bool:
        """
        Envoie une erreur vers la queue d'erreurs.
        
        Args:
            error_data: Détails de l'erreur
            document_id: ID du document (optionnel)
            
        Returns:
            True si envoyé, False sinon
        """
        if document_id:
            error_data["document_id"] = document_id
        
        return await self.send_message(
            queue_name=settings.ERROR_QUEUE,
            message_data=error_data,
            priority=3  # Priorité normale pour les erreurs
        )


# Instance globale du service async
async_rabbitmq_service = AsyncRabbitMQService()
