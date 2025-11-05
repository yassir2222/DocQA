"""
Service de Resilience avec Circuit Breaker et Retry Policies.
Protège contre les défaillances en cascade.
"""
from typing import Callable, Any, Optional
import asyncio
from functools import wraps

from pybreaker import CircuitBreaker, CircuitBreakerError
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
    before_sleep_log,
    after_log
)
import logging

from utils.logger import get_logger

logger = get_logger(__name__)


# ==============================================================================
# CIRCUIT BREAKERS - Empêche les appels répétés vers services défaillants
# ==============================================================================

# Circuit Breaker pour PostgreSQL
db_circuit_breaker = CircuitBreaker(
    fail_max=5,  # Ouvre le circuit après 5 échecs consécutifs
    reset_timeout=60,  # Reste ouvert 60 secondes
    name="PostgreSQL"
)

# Circuit Breaker pour RabbitMQ
rabbitmq_circuit_breaker = CircuitBreaker(
    fail_max=3,  # Plus sensible pour RabbitMQ
    reset_timeout=30,
    name="RabbitMQ"
)

# Circuit Breaker pour Apache Tika
tika_circuit_breaker = CircuitBreaker(
    fail_max=5,
    reset_timeout=45,
    name="ApacheTika"
)


# ==============================================================================
# RETRY DECORATORS - Retry automatique avec exponential backoff
# ==============================================================================

def retry_on_db_error(func: Callable) -> Callable:
    """
    Decorator pour retry automatique sur erreurs DB.
    
    Stratégie:
    - Max 5 tentatives
    - Backoff exponentiel: 1s, 2s, 4s, 8s, 16s
    - Uniquement sur erreurs transitoires (connexion, timeout)
    
    Usage:
        @retry_on_db_error
        async def my_db_operation():
            ...
    """
    @retry(
        stop=stop_after_attempt(5),
        wait=wait_exponential(multiplier=1, min=1, max=30),
        retry=retry_if_exception_type((
            ConnectionError,
            TimeoutError,
            OSError
        )),
        before_sleep=before_sleep_log(logger, logging.WARNING),
        after=after_log(logger, logging.INFO)
    )
    @wraps(func)
    async def wrapper(*args, **kwargs):
        return await func(*args, **kwargs)
    
    return wrapper


def retry_on_rabbitmq_error(func: Callable) -> Callable:
    """
    Decorator pour retry automatique sur erreurs RabbitMQ.
    
    Stratégie:
    - Max 3 tentatives (plus rapide car message queue)
    - Backoff exponentiel: 0.5s, 1s, 2s
    - Sur erreurs de connexion et channel
    
    Usage:
        @retry_on_rabbitmq_error
        async def send_message():
            ...
    """
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=0.5, min=0.5, max=10),
        retry=retry_if_exception_type((
            ConnectionError,
            TimeoutError,
            OSError
        )),
        before_sleep=before_sleep_log(logger, logging.WARNING),
        after=after_log(logger, logging.INFO)
    )
    @wraps(func)
    async def wrapper(*args, **kwargs):
        return await func(*args, **kwargs)
    
    return wrapper


def retry_on_tika_error(func: Callable) -> Callable:
    """
    Decorator pour retry automatique sur erreurs Tika.
    
    Stratégie:
    - Max 3 tentatives
    - Backoff: 2s, 4s, 8s
    - Sur erreurs HTTP et timeout
    
    Usage:
        @retry_on_tika_error
        def extract_content():
            ...
    """
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=2, min=2, max=15),
        retry=retry_if_exception_type((
            ConnectionError,
            TimeoutError,
            Exception  # Tika peut lever diverses exceptions
        )),
        before_sleep=before_sleep_log(logger, logging.WARNING),
        after=after_log(logger, logging.INFO)
    )
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    
    return wrapper


# ==============================================================================
# HELPER FUNCTIONS - Combinaison Circuit Breaker + Retry
# ==============================================================================

async def call_with_resilience(
    circuit_breaker: CircuitBreaker,
    func: Callable,
    *args,
    fallback_value: Any = None,
    **kwargs
) -> Any:
    """
    Appelle une fonction avec Circuit Breaker.
    
    Si le circuit est ouvert (service défaillant), retourne la fallback_value
    au lieu de crasher.
    
    Args:
        circuit_breaker: Circuit breaker à utiliser
        func: Fonction à appeler
        *args: Arguments positionnels
        fallback_value: Valeur à retourner si circuit ouvert
        **kwargs: Arguments nommés
        
    Returns:
        Résultat de la fonction ou fallback_value
    """
    try:
        # Appeler la fonction protégée par le circuit breaker
        return circuit_breaker.call(func, *args, **kwargs)
    
    except CircuitBreakerError:
        # Circuit ouvert - service défaillant
        logger.error(
            f"Circuit breaker '{circuit_breaker.name}' OUVERT - "
            f"Service temporairement indisponible"
        )
        return fallback_value
    
    except Exception as e:
        # Autre erreur
        logger.error(
            f"Erreur lors de l'appel via circuit breaker "
            f"'{circuit_breaker.name}': {str(e)}"
        )
        return fallback_value


async def call_async_with_resilience(
    circuit_breaker: CircuitBreaker,
    func: Callable,
    *args,
    fallback_value: Any = None,
    **kwargs
) -> Any:
    """
    Version asynchrone de call_with_resilience.
    
    Args:
        circuit_breaker: Circuit breaker à utiliser
        func: Fonction async à appeler
        *args: Arguments positionnels
        fallback_value: Valeur à retourner si circuit ouvert
        **kwargs: Arguments nommés
        
    Returns:
        Résultat de la fonction ou fallback_value
    """
    try:
        # Pour les fonctions async, on doit wrapper l'appel
        def sync_wrapper():
            return asyncio.create_task(func(*args, **kwargs))
        
        task = circuit_breaker.call(sync_wrapper)
        return await task
    
    except CircuitBreakerError:
        logger.error(
            f"Circuit breaker '{circuit_breaker.name}' OUVERT - "
            f"Service temporairement indisponible"
        )
        return fallback_value
    
    except Exception as e:
        logger.error(
            f"Erreur lors de l'appel async via circuit breaker "
            f"'{circuit_breaker.name}': {str(e)}"
        )
        return fallback_value


# ==============================================================================
# MONITORING - État des Circuit Breakers
# ==============================================================================

def get_circuit_breakers_status() -> dict:
    """
    Retourne l'état de tous les circuit breakers.
    
    Returns:
        Dict avec état de chaque circuit breaker
    """
    return {
        "postgresql": {
            "name": db_circuit_breaker.name,
            "state": db_circuit_breaker.current_state,
            "fail_counter": db_circuit_breaker.fail_counter,
            "fail_max": db_circuit_breaker.fail_max
        },
        "rabbitmq": {
            "name": rabbitmq_circuit_breaker.name,
            "state": rabbitmq_circuit_breaker.current_state,
            "fail_counter": rabbitmq_circuit_breaker.fail_counter,
            "fail_max": rabbitmq_circuit_breaker.fail_max
        },
        "tika": {
            "name": tika_circuit_breaker.name,
            "state": tika_circuit_breaker.current_state,
            "fail_counter": tika_circuit_breaker.fail_counter,
            "fail_max": tika_circuit_breaker.fail_max
        }
    }
