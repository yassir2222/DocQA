"""
Client RabbitMQ pour la communication inter-services.
Gère la connexion, publication et consommation de messages.
"""

import logging
import asyncio
import json
from typing import Optional, Callable, Dict, Any, TYPE_CHECKING

try:
    import aio_pika
    from aio_pika import connect_robust, Message, ExchangeType
    from aio_pika.abc import AbstractRobustConnection, AbstractChannel, AbstractQueue
    AIO_PIKA_AVAILABLE = True
except ImportError:
    AIO_PIKA_AVAILABLE = False
    # Type hints pour éviter les erreurs de lint
    AbstractRobustConnection = Any  # type: ignore
    AbstractChannel = Any  # type: ignore
    AbstractQueue = Any  # type: ignore
    if TYPE_CHECKING:
        from aio_pika import connect_robust, Message, ExchangeType  # type: ignore
        from aio_pika.abc import AbstractRobustConnection, AbstractChannel, AbstractQueue  # type: ignore

from app.config.settings import settings

logger = logging.getLogger(__name__)


class RabbitMQClient:
    """Client RabbitMQ avec support asynchrone et reconnexion automatique."""
    
    def __init__(self):
        self.connection: Optional[Any] = None
        self.channel: Optional[Any] = None
        self._retry_count = 0
        
    async def connect(self) -> None:
        """
        Établit la connexion à RabbitMQ avec retry automatique.
        """
        while self._retry_count < settings.MAX_RETRIES:
            try:
                logger.info(f"Tentative de connexion à RabbitMQ ({self._retry_count + 1}/{settings.MAX_RETRIES})...")
                
                self.connection = await connect_robust(
                    settings.RABBITMQ_URL,
                    timeout=10,
                )
                
                self.channel = await self.connection.channel()
                await self.channel.set_qos(prefetch_count=10)
                
                logger.info("Connecté à RabbitMQ avec succès")
                self._retry_count = 0
                return
                
            except Exception as e:
                self._retry_count += 1
                logger.error(f"Erreur de connexion RabbitMQ (tentative {self._retry_count}): {e}")
                
                if self._retry_count < settings.MAX_RETRIES:
                    await asyncio.sleep(settings.RETRY_DELAY_SECONDS)
                else:
                    logger.error("Impossible de se connecter à RabbitMQ après plusieurs tentatives")
                    raise
    
    async def publish(
        self,
        queue_name: str,
        message: Dict[str, Any],
        exchange: str = "",
        routing_key: Optional[str] = None
    ) -> None:
        """
        Publie un message dans une queue.
        
        Args:
            queue_name: Nom de la queue
            message: Dictionnaire à envoyer (sera converti en JSON)
            exchange: Nom de l'exchange (vide par défaut)
            routing_key: Clé de routage (utilise queue_name par défaut)
        """
        if not self.channel:
            raise RuntimeError("RabbitMQ non connecté. Appelez connect() d'abord.")
        
        try:
            # Déclare la queue si elle n'existe pas
            await self.channel.declare_queue(queue_name, durable=True)
            
            # Prépare le message
            message_body = json.dumps(message).encode()
            amqp_message = Message(
                message_body,
                delivery_mode=aio_pika.DeliveryMode.PERSISTENT,
                content_type="application/json"
            )
            
            # Publie le message
            await self.channel.default_exchange.publish(
                amqp_message,
                routing_key=routing_key or queue_name
            )
            
            logger.info(f"Message publié dans la queue '{queue_name}'")
            
        except Exception as e:
            logger.error(f"Erreur lors de la publication du message: {e}")
            raise
    
    async def consume(
        self,
        queue_name: str,
        callback: Callable,
        auto_ack: bool = False
    ) -> None:
        """
        Consomme les messages d'une queue.
        
        Args:
            queue_name: Nom de la queue
            callback: Fonction à appeler pour chaque message
            auto_ack: Acquitter automatiquement les messages
        """
        if not self.channel:
            raise RuntimeError("RabbitMQ non connecté. Appelez connect() d'abord.")
        
        try:
            # Déclare la queue
            queue: Any = await self.channel.declare_queue(
                queue_name,
                durable=True
            )
            
            logger.info(f"En écoute sur la queue '{queue_name}'...")
            
            async def process_message(message: aio_pika.IncomingMessage):
                async with message.process(ignore_processed=auto_ack):
                    try:
                        body = json.loads(message.body.decode())
                        logger.info(f"Message reçu de '{queue_name}': {body}")
                        await callback(body)
                    except Exception as e:
                        logger.error(f"Erreur lors du traitement du message: {e}")
                        raise
            
            # Commence la consommation
            await queue.consume(process_message, no_ack=auto_ack)
            
        except Exception as e:
            logger.error(f" Erreur lors de la consommation: {e}")
            raise
    
    async def create_exchange(
        self,
        exchange_name: str,
        exchange_type: ExchangeType = ExchangeType.TOPIC
    ) -> None:
        """
        Crée un exchange.
        
        Args:
            exchange_name: Nom de l'exchange
            exchange_type: Type d'exchange (TOPIC, FANOUT, DIRECT, HEADERS)
        """
        if not self.channel:
            raise RuntimeError("RabbitMQ non connecté. Appelez connect() d'abord.")
        
        try:
            await self.channel.declare_exchange(
                exchange_name,
                exchange_type,
                durable=True
            )
            logger.info(f"Exchange '{exchange_name}' créé")
        except Exception as e:
            logger.error(f"Erreur lors de la création de l'exchange: {e}")
            raise
    
    async def close(self) -> None:
        """Ferme la connexion RabbitMQ proprement."""
        try:
            if self.channel:
                await self.channel.close()
            if self.connection:
                await self.connection.close()
            logger.info("Connexion RabbitMQ fermée")
        except Exception as e:
            logger.error(f"Erreur lors de la fermeture de la connexion: {e}")
    
    def is_connected(self) -> bool:
        """Vérifie si la connexion est active."""
        return self.connection is not None and not self.connection.is_closed
