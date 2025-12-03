"""
Client pour le service AuditLogger
"""
import logging
from typing import List, Optional
import httpx
from datetime import datetime

from config import settings

logger = logging.getLogger(__name__)


class AuditClient:
    """Client pour enregistrer les audits vers AuditLogger"""
    
    def __init__(self):
        self.audit_url = settings.AUDIT_SERVICE_URL
    
    async def log_query(
        self,
        user_id: Optional[str],
        question: str,
        answer: str,
        documents_accessed: List[str],
        processing_time: int
    ):
        """
        Enregistre une requete Q&A dans l'audit log
        """
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                await client.post(
                    f"{self.audit_url}/api/audit/log",
                    json={
                        "user_id": user_id or "anonymous",
                        "action": "QUERY",
                        "resource_type": "QA",
                        "query_text": question,
                        "response_summary": answer[:500] if len(answer) > 500 else answer,
                        "documents_accessed": documents_accessed,
                        "processing_time_ms": processing_time,
                        "timestamp": datetime.now().isoformat(),
                        "service": "LLMQAModule"
                    }
                )
                logger.debug(f"[OK] Audit log cree pour query de {user_id}")
                
        except httpx.ConnectError:
            logger.warning("[WARN] AuditLogger non disponible - log non enregistre")
        except Exception as e:
            logger.error(f"[ERREUR] Erreur audit log: {e}")
    
    async def log_extraction(
        self,
        user_id: Optional[str],
        document_id: str,
        extraction_type: str
    ):
        """
        Enregistre une extraction d'information dans l'audit log
        """
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                await client.post(
                    f"{self.audit_url}/api/audit/log",
                    json={
                        "user_id": user_id or "anonymous",
                        "action": "EXTRACTION",
                        "resource_type": extraction_type.upper(),
                        "resource_id": document_id,
                        "timestamp": datetime.now().isoformat(),
                        "service": "LLMQAModule"
                    }
                )
                logger.debug(f"[OK] Audit log cree pour extraction")
                
        except httpx.ConnectError:
            logger.warning("[WARN] AuditLogger non disponible")
        except Exception as e:
            logger.error(f"[ERREUR] Erreur audit log: {e}")
