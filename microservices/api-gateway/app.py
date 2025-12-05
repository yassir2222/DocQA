"""
API Gateway - Point d'entrée unique pour tous les microservices DocQA
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import httpx
from typing import Optional, List
import asyncio
from datetime import datetime, timedelta
import uuid

from config import settings

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Client HTTP asynchrone global
http_client: Optional[httpx.AsyncClient] = None

# Stockage en mémoire des notifications (en production, utiliser Redis/DB)
notifications_store = []

# Stockage en mémoire des conversations Q&A
conversations_store = []


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gestion du cycle de vie de l'application"""
    global http_client
    
    logger.info("[START] Demarrage de l'API Gateway...")
    
    # Créer le client HTTP avec timeout configuré
    http_client = httpx.AsyncClient(
        timeout=httpx.Timeout(60.0, connect=10.0),
        follow_redirects=True
    )
    
    # Vérifier la santé des services
    await check_services_health()
    
    logger.info(f"[OK] API Gateway demarre sur http://{settings.HOST}:{settings.PORT}")
    
    yield
    
    # Cleanup
    logger.info("[STOP] Arret de l'API Gateway...")
    if http_client:
        await http_client.aclose()
    logger.info("[OK] API Gateway arrete")


app = FastAPI(
    title="DocQA API Gateway",
    description="Point d'entrée unifié pour l'architecture microservices DocQA",
    version="1.0.0",
    lifespan=lifespan
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # À restreindre en production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============ HEALTH CHECKS ============

async def check_service_health(name: str, url: str) -> dict:
    """Vérifie la santé d'un service"""
    try:
        response = await http_client.get(f"{url}/health", timeout=5.0)
        return {
            "name": name,
            "url": url,
            "status": "healthy" if response.status_code == 200 else "unhealthy",
            "statusCode": response.status_code
        }
    except Exception as e:
        return {
            "name": name,
            "url": url,
            "status": "unavailable",
            "error": str(e)
        }


async def check_services_health():
    """Vérifie la santé de tous les services"""
    services = [
        ("doc-ingestor", settings.DOC_INGESTOR_URL),
        ("deid-service", settings.DEID_SERVICE_URL),
        ("indexeur-semantique", settings.INDEXEUR_URL),
        ("llm-qa-module", settings.LLM_QA_URL),
        ("synthese-comparative", settings.SYNTHESE_URL),
        ("audit-logger", settings.AUDIT_URL),
    ]
    
    tasks = [check_service_health(name, url) for name, url in services]
    results = await asyncio.gather(*tasks)
    
    for result in results:
        status = result["status"]
        name = result["name"]
        if status == "healthy":
            logger.info(f"[OK] {name} est disponible")
        else:
            logger.warning(f"[WARN] {name} est {status}")
    
    return results


@app.get("/health")
async def health_check():
    """Health check de l'API Gateway"""
    return {"status": "healthy", "service": "api-gateway"}


@app.get("/api/health/services")
async def get_services_health():
    """Récupère l'état de santé de tous les services"""
    return await check_services_health()


# ============ DOCUMENTS (Doc-Ingestor) ============

@app.post("/api/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    patient_id: Optional[str] = Form(None),
    document_type: Optional[str] = Form(None)
):
    """Upload un document vers le service d'ingestion"""
    try:
        files = {"file": (file.filename, await file.read(), file.content_type)}
        data = {}
        if patient_id:
            data["patient_id"] = patient_id
        if document_type:
            data["document_type"] = document_type
        
        response = await http_client.post(
            f"{settings.DOC_INGESTOR_URL}/api/documents/upload",
            files=files,
            data=data
        )
        
        if response.status_code == 200:
            # Créer une notification de succès
            create_notification(
                notification_type="document",
                title="Document uploadé",
                message=f"Le document '{file.filename}' a été uploadé avec succès.",
                data={"filename": file.filename, "patientId": patient_id},
                priority="normal"
            )
        
        return JSONResponse(content=response.json(), status_code=response.status_code)
    except httpx.RequestError as e:
        logger.error(f"[ERREUR] Upload document: {e}")
        create_notification(
            notification_type="error",
            title="Échec de l'upload",
            message=f"L'upload du document '{file.filename}' a échoué.",
            priority="high"
        )
        raise HTTPException(status_code=503, detail="Service doc-ingestor indisponible")


@app.get("/api/documents")
async def get_documents(
    limit: int = 100,
    offset: int = 0,
    patient_id: Optional[str] = None,
    document_type: Optional[str] = None
):
    """Récupère la liste des documents"""
    try:
        params = {"limit": limit, "offset": offset}
        if patient_id:
            params["patient_id"] = patient_id
        if document_type:
            params["document_type"] = document_type
        
        response = await http_client.get(
            f"{settings.DOC_INGESTOR_URL}/api/documents",
            params=params
        )
        return JSONResponse(content=response.json(), status_code=response.status_code)
    except httpx.RequestError as e:
        logger.error(f"[ERREUR] Get documents: {e}")
        raise HTTPException(status_code=503, detail="Service doc-ingestor indisponible")


@app.get("/api/documents/{document_id}")
async def get_document(document_id: int):
    """Récupère un document par son ID"""
    try:
        response = await http_client.get(
            f"{settings.DOC_INGESTOR_URL}/api/documents/{document_id}"
        )
        return JSONResponse(content=response.json(), status_code=response.status_code)
    except httpx.RequestError as e:
        logger.error(f"[ERREUR] Get document {document_id}: {e}")
        raise HTTPException(status_code=503, detail="Service doc-ingestor indisponible")


@app.delete("/api/documents/{document_id}")
async def delete_document(document_id: int):
    """Supprime un document"""
    try:
        response = await http_client.delete(
            f"{settings.DOC_INGESTOR_URL}/api/documents/{document_id}"
        )
        
        if response.status_code == 200:
            create_notification(
                notification_type="warning",
                title="Document supprimé",
                message=f"Le document #{document_id} a été supprimé.",
                data={"documentId": document_id},
                priority="normal"
            )
        
        return JSONResponse(content=response.json(), status_code=response.status_code)
    except httpx.RequestError as e:
        logger.error(f"[ERREUR] Delete document {document_id}: {e}")
        raise HTTPException(status_code=503, detail="Service doc-ingestor indisponible")


@app.get("/api/documents/{document_id}/content")
async def get_document_content(document_id: int):
    """Récupère le contenu textuel d'un document pour visualisation"""
    try:
        response = await http_client.get(
            f"{settings.DOC_INGESTOR_URL}/api/documents/{document_id}/content"
        )
        return JSONResponse(content=response.json(), status_code=response.status_code)
    except httpx.RequestError as e:
        logger.error(f"[ERREUR] Get document content {document_id}: {e}")
        raise HTTPException(status_code=503, detail="Service doc-ingestor indisponible")


# ============ ANONYMISATION (DeID-Service) ============

@app.post("/api/deid/anonymize")
async def anonymize_document(request: Request):
    """Anonymise un document"""
    try:
        body = await request.json()
        response = await http_client.post(
            f"{settings.DEID_SERVICE_URL}/api/deid/anonymize",
            json=body
        )
        return JSONResponse(content=response.json(), status_code=response.status_code)
    except httpx.RequestError as e:
        logger.error(f"[ERREUR] Anonymize: {e}")
        raise HTTPException(status_code=503, detail="Service deid indisponible")


@app.get("/api/deid/mappings/{document_id}")
async def get_mappings(document_id: int):
    """Récupère les mappings d'anonymisation"""
    try:
        response = await http_client.get(
            f"{settings.DEID_SERVICE_URL}/api/deid/mappings/{document_id}"
        )
        return JSONResponse(content=response.json(), status_code=response.status_code)
    except httpx.RequestError as e:
        logger.error(f"[ERREUR] Get mappings: {e}")
        raise HTTPException(status_code=503, detail="Service deid indisponible")


# ============ INDEXATION (Indexeur-Semantique) ============

@app.post("/api/search")
async def search_documents(request: Request):
    """Recherche sémantique dans les documents"""
    try:
        body = await request.json()
        response = await http_client.post(
            f"{settings.INDEXEUR_URL}/api/search",
            json=body
        )
        return JSONResponse(content=response.json(), status_code=response.status_code)
    except httpx.RequestError as e:
        logger.error(f"[ERREUR] Search: {e}")
        raise HTTPException(status_code=503, detail="Service indexeur indisponible")


@app.post("/api/index")
async def index_document(request: Request):
    """Indexe un document"""
    try:
        body = await request.json()
        response = await http_client.post(
            f"{settings.INDEXEUR_URL}/api/index",
            json=body
        )
        return JSONResponse(content=response.json(), status_code=response.status_code)
    except httpx.RequestError as e:
        logger.error(f"[ERREUR] Index: {e}")
        raise HTTPException(status_code=503, detail="Service indexeur indisponible")


# ============ QUESTION-REPONSE (LLM-QA-Module) ============

@app.post("/api/qa/ask")
async def ask_question(request: Request):
    """Pose une question au système Q/R"""
    try:
        body = await request.json()
        question = body.get("question", "")[:50]  # Limiter pour la notification
        
        response = await http_client.post(
            f"{settings.LLM_QA_URL}/api/qa/ask",
            json=body,
            timeout=120.0  # Timeout plus long pour LLM
        )
        
        if response.status_code == 200:
            create_notification(
                notification_type="qa",
                title="Réponse IA disponible",
                message=f"Votre question a reçu une réponse : \"{question}...\"",
                data={"question": body.get("question")},
                priority="normal"
            )
        
        return JSONResponse(content=response.json(), status_code=response.status_code)
    except httpx.RequestError as e:
        logger.error(f"[ERREUR] QA Ask: {e}")
        create_notification(
            notification_type="error",
            title="Service IA indisponible",
            message="Le service de questions/réponses n'a pas pu traiter votre demande.",
            priority="high"
        )
        # Fallback avec réponse simulée
        return JSONResponse(content={
            "answer": "Le service Q/R n'est pas disponible actuellement. Veuillez réessayer plus tard.",
            "sources": [],
            "confidence": 0
        }, status_code=200)


@app.get("/api/qa/history/{session_id}")
async def get_chat_history(session_id: str):
    """Récupère l'historique de chat"""
    try:
        response = await http_client.get(
            f"{settings.LLM_QA_URL}/api/qa/history/{session_id}"
        )
        return JSONResponse(content=response.json(), status_code=response.status_code)
    except httpx.RequestError as e:
        logger.error(f"[ERREUR] Get history: {e}")
        raise HTTPException(status_code=503, detail="Service llm-qa indisponible")


# ============ SYNTHESE (Synthese-Comparative) ============

@app.post("/api/synthesis/generate")
async def generate_synthesis(request: Request):
    """Génère une synthèse de documents"""
    try:
        body = await request.json()
        doc_count = len(body.get("documentIds", []))
        
        response = await http_client.post(
            f"{settings.SYNTHESE_URL}/api/synthesis/generate",
            json=body,
            timeout=120.0
        )
        
        if response.status_code == 200:
            create_notification(
                notification_type="synthesis",
                title="Synthèse générée",
                message=f"Une synthèse de {doc_count} document(s) a été générée avec succès.",
                data={"documentCount": doc_count},
                priority="normal"
            )
        
        return JSONResponse(content=response.json(), status_code=response.status_code)
    except httpx.RequestError as e:
        logger.error(f"[ERREUR] Generate synthesis: {e}")
        create_notification(
            notification_type="error",
            title="Échec de la synthèse",
            message="La génération de synthèse a échoué.",
            priority="high"
        )
        raise HTTPException(status_code=503, detail="Service synthese indisponible")


@app.post("/api/synthesis/compare")
async def compare_documents(request: Request):
    """Compare des patients/documents"""
    try:
        body = await request.json()
        response = await http_client.post(
            f"{settings.SYNTHESE_URL}/api/synthesis/compare",
            json=body,
            timeout=120.0
        )
        return JSONResponse(content=response.json(), status_code=response.status_code)
    except httpx.RequestError as e:
        logger.error(f"[ERREUR] Compare: {e}")
        raise HTTPException(status_code=503, detail="Service synthese indisponible")


# ============ AUDIT (Audit-Logger) ============

@app.get("/api/audit/logs")
async def get_audit_logs(
    limit: int = 100,
    offset: int = 0,
    action: Optional[str] = None,
    user: Optional[str] = None
):
    """Récupère les logs d'audit"""
    try:
        params = {"limit": limit, "offset": offset}
        if action:
            params["action"] = action
        if user:
            params["user"] = user
        
        response = await http_client.get(
            f"{settings.AUDIT_URL}/api/audit/logs",
            params=params
        )
        return JSONResponse(content=response.json(), status_code=response.status_code)
    except httpx.RequestError as e:
        logger.error(f"[ERREUR] Get audit logs: {e}")
        raise HTTPException(status_code=503, detail="Service audit indisponible")


@app.get("/api/audit/stats")
async def get_audit_stats(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """Récupère les statistiques d'audit"""
    try:
        params = {}
        if start_date:
            params["start_date"] = start_date
        if end_date:
            params["end_date"] = end_date
        
        response = await http_client.get(
            f"{settings.AUDIT_URL}/api/audit/stats",
            params=params
        )
        return JSONResponse(content=response.json(), status_code=response.status_code)
    except httpx.RequestError as e:
        logger.error(f"[ERREUR] Get audit stats: {e}")
        raise HTTPException(status_code=503, detail="Service audit indisponible")


@app.post("/api/audit/log")
async def create_audit_log(request: Request):
    """Crée un log d'audit"""
    try:
        body = await request.json()
        response = await http_client.post(
            f"{settings.AUDIT_URL}/api/audit/log",
            json=body
        )
        return JSONResponse(content=response.json(), status_code=response.status_code)
    except httpx.RequestError as e:
        logger.error(f"[ERREUR] Create audit log: {e}")
        # Ne pas lever d'erreur pour l'audit (non-bloquant)
        return JSONResponse(content={"status": "queued"}, status_code=202)


# ============ STATISTIQUES DASHBOARD ============

@app.get("/api/dashboard/stats")
async def get_dashboard_stats():
    """Récupère les statistiques pour le dashboard"""
    stats = {
        "documents": {"total": 0, "processed": 0, "pending": 0},
        "questions": {"total": 0, "today": 0},
        "services": []
    }
    
    # Récupérer les stats des documents
    try:
        response = await http_client.get(
            f"{settings.DOC_INGESTOR_URL}/api/documents/stats",
            timeout=5.0
        )
        if response.status_code == 200:
            stats["documents"] = response.json()
    except:
        pass
    
    # Récupérer l'état des services
    stats["services"] = await check_services_health()
    
    return stats


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )


# ============ NOTIFICATIONS ============

def create_notification(
    notification_type: str,
    title: str,
    message: str,
    user_id: str = "all",
    data: dict = None,
    priority: str = "normal"
) -> dict:
    """Crée une nouvelle notification"""
    notification = {
        "id": str(uuid.uuid4()),
        "type": notification_type,  # success, error, warning, info, document, qa, synthesis
        "title": title,
        "message": message,
        "userId": user_id,
        "data": data or {},
        "priority": priority,  # low, normal, high, urgent
        "read": False,
        "createdAt": datetime.utcnow().isoformat(),
        "expiresAt": (datetime.utcnow() + timedelta(days=7)).isoformat()
    }
    notifications_store.insert(0, notification)
    
    # Limiter à 100 notifications max
    if len(notifications_store) > 100:
        notifications_store.pop()
    
    logger.info(f"[NOTIF] Nouvelle notification: {title}")
    return notification


@app.get("/api/notifications")
async def get_notifications(
    user_id: str = "all",
    unread_only: bool = False,
    limit: int = 50
):
    """Récupère les notifications pour un utilisateur"""
    filtered = [
        n for n in notifications_store
        if n["userId"] in [user_id, "all"]
    ]
    
    if unread_only:
        filtered = [n for n in filtered if not n["read"]]
    
    return {
        "notifications": filtered[:limit],
        "total": len(filtered),
        "unreadCount": len([n for n in filtered if not n["read"]])
    }


@app.get("/api/notifications/unread-count")
async def get_unread_count(user_id: str = "all"):
    """Récupère le nombre de notifications non lues"""
    count = len([
        n for n in notifications_store
        if n["userId"] in [user_id, "all"] and not n["read"]
    ])
    return {"unreadCount": count}


@app.post("/api/notifications")
async def create_notification_endpoint(request: Request):
    """Crée une nouvelle notification"""
    body = await request.json()
    notification = create_notification(
        notification_type=body.get("type", "info"),
        title=body.get("title", "Notification"),
        message=body.get("message", ""),
        user_id=body.get("userId", "all"),
        data=body.get("data"),
        priority=body.get("priority", "normal")
    )
    return notification


@app.put("/api/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str):
    """Marque une notification comme lue"""
    for notification in notifications_store:
        if notification["id"] == notification_id:
            notification["read"] = True
            return {"success": True, "notification": notification}
    raise HTTPException(status_code=404, detail="Notification non trouvée")


@app.put("/api/notifications/read-all")
async def mark_all_notifications_read(user_id: str = "all"):
    """Marque toutes les notifications comme lues"""
    count = 0
    for notification in notifications_store:
        if notification["userId"] in [user_id, "all"] and not notification["read"]:
            notification["read"] = True
            count += 1
    return {"success": True, "markedCount": count}


@app.delete("/api/notifications/{notification_id}")
async def delete_notification(notification_id: str):
    """Supprime une notification"""
    global notifications_store
    initial_len = len(notifications_store)
    notifications_store = [n for n in notifications_store if n["id"] != notification_id]
    if len(notifications_store) < initial_len:
        return {"success": True}
    raise HTTPException(status_code=404, detail="Notification non trouvée")


@app.delete("/api/notifications")
async def clear_notifications(user_id: str = "all"):
    """Supprime toutes les notifications d'un utilisateur"""
    global notifications_store
    initial_len = len(notifications_store)
    notifications_store = [n for n in notifications_store if n["userId"] not in [user_id, "all"]]
    return {"success": True, "deletedCount": initial_len - len(notifications_store)}


# ============ HISTORIQUE DES CONVERSATIONS Q&A ============

def create_conversation(title: str, patient_id: str = None):
    """Crée une nouvelle conversation"""
    conversation = {
        "id": str(uuid.uuid4()),
        "title": title,
        "patientId": patient_id,
        "messages": [],
        "createdAt": datetime.now().isoformat(),
        "updatedAt": datetime.now().isoformat()
    }
    conversations_store.insert(0, conversation)
    
    # Limiter à 50 conversations max
    if len(conversations_store) > 50:
        conversations_store.pop()
    
    return conversation


def add_message_to_conversation(conversation_id: str, role: str, content: str, sources: list = None):
    """Ajoute un message à une conversation"""
    for conv in conversations_store:
        if conv["id"] == conversation_id:
            message = {
                "id": str(uuid.uuid4()),
                "role": role,  # "user" ou "assistant"
                "content": content,
                "sources": sources or [],
                "timestamp": datetime.now().isoformat()
            }
            conv["messages"].append(message)
            conv["updatedAt"] = datetime.now().isoformat()
            return message
    return None


@app.get("/api/conversations")
async def get_conversations(patient_id: str = None, limit: int = 20):
    """Récupère la liste des conversations"""
    filtered = conversations_store
    
    if patient_id:
        filtered = [c for c in filtered if c["patientId"] == patient_id]
    
    # Retourner un résumé (sans tous les messages)
    result = []
    for conv in filtered[:limit]:
        last_message = conv["messages"][-1] if conv["messages"] else None
        result.append({
            "id": conv["id"],
            "title": conv["title"],
            "patientId": conv["patientId"],
            "messageCount": len(conv["messages"]),
            "lastMessage": last_message["content"][:100] + "..." if last_message and len(last_message["content"]) > 100 else (last_message["content"] if last_message else None),
            "createdAt": conv["createdAt"],
            "updatedAt": conv["updatedAt"]
        })
    
    return {"conversations": result, "total": len(filtered)}


@app.get("/api/conversations/{conversation_id}")
async def get_conversation(conversation_id: str):
    """Récupère une conversation complète avec tous les messages"""
    for conv in conversations_store:
        if conv["id"] == conversation_id:
            return conv
    raise HTTPException(status_code=404, detail="Conversation non trouvée")


@app.post("/api/conversations")
async def create_conversation_endpoint(request: Request):
    """Crée une nouvelle conversation"""
    body = await request.json()
    conversation = create_conversation(
        title=body.get("title", "Nouvelle conversation"),
        patient_id=body.get("patientId")
    )
    return conversation


@app.post("/api/conversations/{conversation_id}/messages")
async def add_message(conversation_id: str, request: Request):
    """Ajoute un message à une conversation existante"""
    body = await request.json()
    message = add_message_to_conversation(
        conversation_id=conversation_id,
        role=body.get("role", "user"),
        content=body.get("content", ""),
        sources=body.get("sources")
    )
    if message:
        return message
    raise HTTPException(status_code=404, detail="Conversation non trouvée")


@app.put("/api/conversations/{conversation_id}")
async def update_conversation(conversation_id: str, request: Request):
    """Met à jour le titre d'une conversation"""
    body = await request.json()
    for conv in conversations_store:
        if conv["id"] == conversation_id:
            if "title" in body:
                conv["title"] = body["title"]
            conv["updatedAt"] = datetime.now().isoformat()
            return conv
    raise HTTPException(status_code=404, detail="Conversation non trouvée")


@app.delete("/api/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str):
    """Supprime une conversation"""
    global conversations_store
    initial_len = len(conversations_store)
    conversations_store = [c for c in conversations_store if c["id"] != conversation_id]
    if len(conversations_store) < initial_len:
        return {"success": True}
    raise HTTPException(status_code=404, detail="Conversation non trouvée")


@app.delete("/api/conversations")
async def clear_conversations(patient_id: str = None):
    """Supprime toutes les conversations (optionnellement filtrées par patient)"""
    global conversations_store
    initial_len = len(conversations_store)
    if patient_id:
        conversations_store = [c for c in conversations_store if c["patientId"] != patient_id]
    else:
        conversations_store = []
    return {"success": True, "deletedCount": initial_len - len(conversations_store)}
