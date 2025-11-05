"""
Routes d'authentification JWT.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from datetime import timedelta

from services.jwt_service import jwt_service, TokenData
from config import settings
from utils.logger import get_logger, log_audit

logger = get_logger(__name__)
router = APIRouter(prefix="/auth", tags=["Authentication"])


class LoginRequest(BaseModel):
    """Requête de connexion."""
    username: str
    password: str
    service: str = "doc_ingestor"


class TokenResponse(BaseModel):
    """Réponse avec tokens JWT."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # Secondes


class RefreshRequest(BaseModel):
    """Requête de rafraîchissement."""
    refresh_token: str


# Base de données utilisateurs (À REMPLACER PAR UNE VRAIE DB)
# En production: stocker dans PostgreSQL avec passwords hashés
# Hashes générés avec bcrypt pour éviter les problèmes d'initialisation passlib
MOCK_USERS = {
    "admin": {
        "username": "admin",
        # Password: admin123
        "password_hash": "$2b$12$JqkRGJW5CUUd0sj4nquiaOxLc7yP5LAStDq3iWpK7JPUhzPfWVfye",
        "service": "doc_ingestor",
        "scopes": ["read", "write", "admin"]
    },
    "api_user": {
        "username": "api_user",
        # Password: apikey123
        "password_hash": "$2b$12$ezlYN5qfTB.FgLGX1w7x4ewIyiJtqdUHgb64khsC50O8k2mU4M31W",
        "service": "doc_ingestor",
        "scopes": ["read", "write"]
    },
    "read_only": {
        "username": "read_only",
        # Password: readonly123
        "password_hash": "$2b$12$AkfdHWCDFBGeK7MYSH1iwu2ivh1LwOuNYmB5onwYoa2gFn1wEmMAW",
        "service": "doc_ingestor",
        "scopes": ["read"]
    }
}


def authenticate_user(username: str, password: str) -> dict:
    """
    Authentifie un utilisateur.
    
    Args:
        username: Nom d'utilisateur
        password: Mot de passe en clair
        
    Returns:
        Dictionnaire utilisateur si authentifié, None sinon
    """
    user = MOCK_USERS.get(username)
    if not user:
        return None
    
    # Vérifier le mot de passe
    if not jwt_service.verify_password(password, user["password_hash"]):
        return None
    
    return user


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    """
    Connexion et obtention de tokens JWT.
    
    **Utilisateurs de test:**
    - admin / admin123 (scopes: read, write, admin)
    - api_user / apikey123 (scopes: read, write)
    - read_only / readonly123 (scopes: read)
    
    Args:
        request: Identifiants de connexion
        
    Returns:
        Tokens JWT (access + refresh)
    """
    # Authentifier l'utilisateur
    user = authenticate_user(request.username, request.password)
    if not user:
        log_audit(
            logger,
            action="login_failed",
            status="error",
            details={"username": request.username}
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nom d'utilisateur ou mot de passe incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Créer les tokens
    token_data = {
        "sub": user["username"],
        "service": request.service,
        "scopes": user["scopes"]
    }
    
    access_token = jwt_service.create_access_token(token_data)
    refresh_token = jwt_service.create_refresh_token(token_data)
    
    log_audit(
        logger,
        action="login_success",
        user=user["username"],
        status="success",
        details={
            "service": request.service,
            "scopes": user["scopes"]
        }
    )
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: RefreshRequest):
    """
    Rafraîchit un access token expiré avec un refresh token.
    
    Args:
        request: Refresh token
        
    Returns:
        Nouveaux tokens JWT
    """
    # Vérifier le refresh token
    try:
        token_data = jwt_service.verify_token(
            request.refresh_token,
            expected_type="refresh"
        )
    except HTTPException:
        log_audit(
            logger,
            action="refresh_failed",
            status="error",
            details={"error": "Invalid refresh token"}
        )
        raise
    
    # Créer de nouveaux tokens
    new_token_data = {
        "sub": token_data.username,
        "service": token_data.service,
        "scopes": token_data.scopes
    }
    
    access_token = jwt_service.create_access_token(new_token_data)
    refresh_token = jwt_service.create_refresh_token(new_token_data)
    
    log_audit(
        logger,
        action="token_refreshed",
        user=token_data.username,
        status="success"
    )
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )


@router.post("/verify")
async def verify_token_endpoint(token_data: TokenData = Depends(jwt_service.verify_token)):
    """
    Vérifie la validité d'un access token.
    
    Args:
        token_data: Données extraites du token
        
    Returns:
        Informations du token
    """
    return {
        "valid": True,
        "username": token_data.username,
        "service": token_data.service,
        "scopes": token_data.scopes
    }
