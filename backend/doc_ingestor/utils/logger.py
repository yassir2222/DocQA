"""
Logger centralisé pour DocIngestor.
Gère les logs JSON structurés et les audits.
"""
import json
import logging
import sys
from datetime import datetime
from typing import Dict, Any, Optional


class JSONFormatter(logging.Formatter):
    """Formatter pour produire des logs au format JSON."""
    
    def format(self, record: logging.LogRecord) -> str:
        """
        Formate un enregistrement de log en JSON.
        
        Args:
            record: Enregistrement de log à formater
            
        Returns:
            String JSON formatée
        """
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "service": "doc_ingestor",
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        
        # Ajouter des champs supplémentaires si présents
        if hasattr(record, "document_id"):
            log_data["document_id"] = record.document_id
        if hasattr(record, "user"):
            log_data["user"] = record.user
        if hasattr(record, "action"):
            log_data["action"] = record.action
        if hasattr(record, "status"):
            log_data["status"] = record.status
        if hasattr(record, "error"):
            log_data["error"] = record.error
        
        # Ajouter l'exception si présente
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        
        return json.dumps(log_data, ensure_ascii=False)


def get_logger(name: str) -> logging.Logger:
    """
    Crée ou récupère un logger avec format JSON.
    
    Args:
        name: Nom du logger
        
    Returns:
        Instance de logger configurée
    """
    logger = logging.getLogger(name)
    
    # Éviter d'ajouter plusieurs handlers
    if not logger.handlers:
        logger.setLevel(logging.INFO)
        
        # Handler console avec format JSON
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(JSONFormatter())
        logger.addHandler(handler)
    
    return logger


def log_audit(
    logger: logging.Logger,
    action: str,
    document_id: Optional[str] = None,
    user: Optional[str] = None,
    status: str = "success",
    details: Optional[Dict[str, Any]] = None,
    error: Optional[str] = None
):
    """
    Enregistre un événement d'audit.
    
    Format:
    [2025-11-04 15:22:10] INFO - Document 1234.pdf uploaded by Dr.AB - Status: sent_to_queue
    
    Args:
        logger: Instance de logger
        action: Action effectuée (upload, extract, send_to_queue, etc.)
        document_id: ID du document concerné
        user: Utilisateur ayant effectué l'action
        status: Statut de l'action (success, error, pending)
        details: Détails supplémentaires
        error: Message d'erreur si applicable
    """
    log_level = logging.ERROR if status == "error" else logging.INFO
    
    message = f"Action: {action}"
    if document_id:
        message += f" - Document: {document_id}"
    if user:
        message += f" - User: {user}"
    message += f" - Status: {status}"
    
    if details:
        message += f" - Details: {json.dumps(details, ensure_ascii=False)}"
    
    # Créer un LogRecord avec des attributs personnalisés
    extra = {
        "action": action,
        "status": status,
    }
    if document_id:
        extra["document_id"] = document_id
    if user:
        extra["user"] = user
    if error:
        extra["error"] = error
    
    logger.log(log_level, message, extra=extra)


# Logger global pour le service
service_logger = get_logger("doc_ingestor")
