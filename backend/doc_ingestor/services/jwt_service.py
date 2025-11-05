"""
Service d'authentification JWT pour DocIngestor.
Gère la création et validation des tokens JWT.
"""
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
import bcrypt
from pydantic import BaseModel
from fastapi import HTTPException, status

from config import settings
from utils.logger import get_logger

logger = get_logger(__name__)


class TokenData(BaseModel):
    """Données extraites du token JWT."""
    username: Optional[str] = None
    service: Optional[str] = None
    scopes: list[str] = []


class JWTService:
    """Service de gestion des tokens JWT."""
    
    def __init__(
        self,
        secret_key: str,
        algorithm: str = "HS256",
        access_token_expire_minutes: int = 30,
        refresh_token_expire_days: int = 7
    ):
        """
        Initialise le service JWT.
        
        Args:
            secret_key: Clé secrète pour signer les tokens
            algorithm: Algorithme de signature (HS256, RS256, etc.)
            access_token_expire_minutes: Durée de vie access token
            refresh_token_expire_days: Durée de vie refresh token
        """
        self.secret_key = secret_key
        self.algorithm = algorithm
        self.access_token_expire_minutes = access_token_expire_minutes
        self.refresh_token_expire_days = refresh_token_expire_days
    
    def create_access_token(
        self,
        data: Dict[str, Any],
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """
        Crée un access token JWT.
        
        Args:
            data: Données à inclure dans le token (sub, scopes, etc.)
            expires_delta: Durée de vie personnalisée
            
        Returns:
            Token JWT encodé
        """
        to_encode = data.copy()
        
        # Définir l'expiration
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(
                minutes=self.access_token_expire_minutes
            )
        
        to_encode.update({
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "access"
        })
        
        # Encoder le token
        encoded_jwt = jwt.encode(
            to_encode,
            self.secret_key,
            algorithm=self.algorithm
        )
        
        logger.info(f"Access token créé pour: {data.get('sub', 'unknown')}")
        
        return encoded_jwt
    
    def create_refresh_token(
        self,
        data: Dict[str, Any],
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """
        Crée un refresh token JWT.
        
        Args:
            data: Données à inclure dans le token
            expires_delta: Durée de vie personnalisée
            
        Returns:
            Token JWT encodé
        """
        to_encode = data.copy()
        
        # Définir l'expiration
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(
                days=self.refresh_token_expire_days
            )
        
        to_encode.update({
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "refresh"
        })
        
        # Encoder le token
        encoded_jwt = jwt.encode(
            to_encode,
            self.secret_key,
            algorithm=self.algorithm
        )
        
        logger.info(f"Refresh token créé pour: {data.get('sub', 'unknown')}")
        
        return encoded_jwt
    
    def verify_token(
        self,
        token: str,
        expected_type: str = "access"
    ) -> TokenData:
        """
        Vérifie et décode un token JWT.
        
        Args:
            token: Token JWT à vérifier
            expected_type: Type attendu ("access" ou "refresh")
            
        Returns:
            TokenData avec les informations du token
            
        Raises:
            HTTPException: Si token invalide, expiré ou type incorrect
        """
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide ou expiré",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
        try:
            # Décoder le token
            payload = jwt.decode(
                token,
                self.secret_key,
                algorithms=[self.algorithm]
            )
            
            # Vérifier le type de token
            token_type: str = payload.get("type")
            if token_type != expected_type:
                logger.warning(
                    f"Type de token incorrect: attendu={expected_type}, "
                    f"reçu={token_type}"
                )
                raise credentials_exception
            
            # Extraire les données
            username: str = payload.get("sub")
            if username is None:
                logger.warning("Token sans 'sub' claim")
                raise credentials_exception
            
            service: str = payload.get("service")
            scopes: list = payload.get("scopes", [])
            
            logger.info(f"Token vérifié avec succès pour: {username}")
            
            return TokenData(
                username=username,
                service=service,
                scopes=scopes
            )
            
        except JWTError as e:
            logger.error(f"Erreur validation JWT: {str(e)}")
            raise credentials_exception
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """
        Vérifie un mot de passe contre son hash.
        
        Args:
            plain_password: Mot de passe en clair
            hashed_password: Hash bcrypt du mot de passe
            
        Returns:
            True si le mot de passe correspond
        """
        return bcrypt.checkpw(
            plain_password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )
    
    def get_password_hash(self, password: str) -> str:
        """
        Hash un mot de passe avec bcrypt.
        
        Args:
            password: Mot de passe en clair
            
        Returns:
            Hash bcrypt du mot de passe
        
        Note:
            Tronque automatiquement à 72 bytes (limite bcrypt)
        """
        # Bcrypt a une limite de 72 bytes - tronquer si nécessaire
        password_bytes = password.encode('utf-8')[:72]
        hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
        return hashed.decode('utf-8')


# Instance globale du service JWT
jwt_service = JWTService(
    secret_key=settings.JWT_SECRET_KEY,
    algorithm=settings.JWT_ALGORITHM,
    access_token_expire_minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES,
    refresh_token_expire_days=settings.REFRESH_TOKEN_EXPIRE_DAYS
)
