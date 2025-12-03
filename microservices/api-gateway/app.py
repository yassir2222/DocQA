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

from config import settings

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Client HTTP asynchrone global
http_client: Optional[httpx.AsyncClient] = None


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
        return JSONResponse(content=response.json(), status_code=response.status_code)
    except httpx.RequestError as e:
        logger.error(f"[ERREUR] Upload document: {e}")
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
        return JSONResponse(content=response.json(), status_code=response.status_code)
    except httpx.RequestError as e:
        logger.error(f"[ERREUR] Delete document {document_id}: {e}")
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
        response = await http_client.post(
            f"{settings.LLM_QA_URL}/api/qa/ask",
            json=body,
            timeout=120.0  # Timeout plus long pour LLM
        )
        return JSONResponse(content=response.json(), status_code=response.status_code)
    except httpx.RequestError as e:
        logger.error(f"[ERREUR] QA Ask: {e}")
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
        response = await http_client.post(
            f"{settings.SYNTHESE_URL}/api/synthesis/generate",
            json=body,
            timeout=120.0
        )
        return JSONResponse(content=response.json(), status_code=response.status_code)
    except httpx.RequestError as e:
        logger.error(f"[ERREUR] Generate synthesis: {e}")
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
