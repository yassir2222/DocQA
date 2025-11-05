"""
Service de base de données ASYNCHRONE pour les documents.
Utilise SQLAlchemy 2.0 async avec asyncpg.
"""
from typing import List, Optional, Dict, Any, AsyncGenerator
from datetime import datetime
from uuid import UUID

from sqlalchemy.ext.asyncio import (
    create_async_engine,
    AsyncSession,
    async_sessionmaker
)
from sqlalchemy import select, func, desc
from sqlalchemy.exc import SQLAlchemyError

from config import settings
from models.document_model import Document, Base
from utils.logger import get_logger, log_audit

logger = get_logger(__name__)


class AsyncDBService:
    """Service ASYNCHRONE de gestion de la base de données."""
    
    def __init__(self):
        """Initialise la connexion asynchrone à la base de données."""
        self.engine = None
        self.async_session_maker = None
        self.initialized = False
    
    async def init_db(self):
        """
        Initialise la connexion async et crée les tables.
        """
        try:
            # Convertir l'URL PostgreSQL en version async
            async_url = settings.POSTGRES_URL.replace(
                "postgresql://",
                "postgresql+asyncpg://"
            )
            
            # Créer le moteur async SQLAlchemy
            self.engine = create_async_engine(
                async_url,
                pool_pre_ping=True,
                pool_size=10,
                max_overflow=20,
                echo=settings.DEBUG
            )
            
            # Créer la session factory async
            self.async_session_maker = async_sessionmaker(
                self.engine,
                class_=AsyncSession,
                expire_on_commit=False
            )
            
            # Créer les tables (si nécessaire)
            async with self.engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            
            self.initialized = True
            
            log_audit(
                logger,
                action="async_db_init",
                status="success",
                details={"url": settings.POSTGRES_HOST}
            )
            
        except Exception as e:
            log_audit(
                logger,
                action="async_db_init",
                status="error",
                error=str(e)
            )
            raise
    
    async def get_db(self) -> AsyncGenerator[AsyncSession, None]:
        """
        Générateur pour l'injection de dépendances FastAPI async.
        Gère automatiquement commit/rollback/close.
        
        Usage dans les routes:
            async def my_route(db: AsyncSession = Depends(async_db_service.get_db)):
                ...
        
        Yields:
            AsyncSession SQLAlchemy
        """
        if not self.initialized:
            await self.init_db()
        
        async with self.async_session_maker() as session:
            try:
                yield session
                await session.commit()
            except Exception as e:
                await session.rollback()
                logger.error(f"Transaction async rollback: {str(e)}")
                raise
            finally:
                await session.close()
    
    async def create_document(
        self,
        file_name: str,
        file_type: str,
        file_size: int,
        metadata: Optional[Dict[str, Any]] = None,
        content_preview: Optional[str] = None,
        session: Optional[AsyncSession] = None
    ) -> Optional[Document]:
        """
        Crée un nouveau document dans la base (version async).
        
        Args:
            file_name: Nom du fichier
            file_type: Type de fichier (pdf, docx, etc.)
            file_size: Taille en bytes
            metadata: Métadonnées extraites
            content_preview: Aperçu du contenu
            session: Session async existante (optionnel)
            
        Returns:
            Document créé ou None en cas d'erreur
        """
        # Utiliser la session fournie ou en créer une nouvelle
        should_close = False
        if session is None:
            if not self.initialized:
                await self.init_db()
            session = self.async_session_maker()
            should_close = True
        
        try:
            # Limiter le preview à 500 caractères
            if content_preview and len(content_preview) > 500:
                content_preview = content_preview[:500] + "..."
            
            document = Document(
                file_name=file_name,
                type=file_type,
                file_size=file_size,
                doc_metadata=metadata,
                content_preview=content_preview,
                status="pending"
            )
            
            session.add(document)
            
            # Commit seulement si on a créé la session
            if should_close:
                await session.commit()
                await session.refresh(document)
            else:
                await session.flush()  # Flush pour obtenir l'ID sans commit
                await session.refresh(document)
            
            log_audit(
                logger,
                action="create_document_async",
                document_id=str(document.document_id),
                status="success",
                details={"file_name": file_name}
            )
            
            return document
            
        except SQLAlchemyError as e:
            if should_close:
                await session.rollback()
            log_audit(
                logger,
                action="create_document_async",
                status="error",
                error=str(e)
            )
            return None
        finally:
            if should_close:
                await session.close()
    
    async def update_document_status(
        self,
        document_id: UUID,
        status: str,
        error_message: Optional[str] = None,
        session: Optional[AsyncSession] = None
    ) -> bool:
        """
        Met à jour le statut d'un document (version async).
        
        Args:
            document_id: ID du document
            status: Nouveau statut (pending, processing, processed, error, deleted)
            error_message: Message d'erreur si applicable
            session: Session async existante (optionnel)
            
        Returns:
            True si mis à jour, False sinon
        """
        should_close = False
        if session is None:
            if not self.initialized:
                await self.init_db()
            session = self.async_session_maker()
            should_close = True
        
        try:
            result = await session.execute(
                select(Document).filter(Document.document_id == document_id)
            )
            document = result.scalar_one_or_none()
            
            if not document:
                logger.warning(f"Document {document_id} non trouvé")
                return False
            
            document.status = status
            if error_message:
                document.error_message = error_message
            document.updated_at = datetime.utcnow()
            
            if should_close:
                await session.commit()
            else:
                await session.flush()
            
            log_audit(
                logger,
                action="update_document_status_async",
                document_id=str(document_id),
                status="success",
                details={"new_status": status}
            )
            
            return True
            
        except SQLAlchemyError as e:
            if should_close:
                await session.rollback()
            log_audit(
                logger,
                action="update_document_status_async",
                document_id=str(document_id),
                status="error",
                error=str(e)
            )
            return False
        finally:
            if should_close:
                await session.close()
    
    async def get_document(self, document_id: UUID) -> Optional[Document]:
        """
        Récupère un document par son ID (version async).
        
        Args:
            document_id: ID du document
            
        Returns:
            Document ou None si non trouvé
        """
        if not self.initialized:
            await self.init_db()
        
        async with self.async_session_maker() as session:
            try:
                result = await session.execute(
                    select(Document).filter(Document.document_id == document_id)
                )
                return result.scalar_one_or_none()
            finally:
                await session.close()
    
    async def get_documents(
        self,
        skip: int = 0,
        limit: int = 100,
        status: Optional[str] = None
    ) -> List[Document]:
        """
        Récupère une liste de documents avec pagination (version async).
        
        Args:
            skip: Nombre de documents à sauter
            limit: Nombre maximum de documents à retourner
            status: Filtrer par statut (optionnel)
            
        Returns:
            Liste de documents
        """
        if not self.initialized:
            await self.init_db()
        
        async with self.async_session_maker() as session:
            try:
                query = select(Document)
                
                # Filtrer par statut si fourni
                if status:
                    query = query.filter(Document.status == status)
                
                # Trier par date de création (plus récent d'abord)
                query = query.order_by(desc(Document.created_at))
                
                # Pagination
                query = query.offset(skip).limit(limit)
                
                result = await session.execute(query)
                return list(result.scalars().all())
            finally:
                await session.close()
    
    async def get_document_count(self, status: Optional[str] = None) -> int:
        """
        Compte le nombre de documents (version async).
        
        Args:
            status: Filtrer par statut (optionnel)
            
        Returns:
            Nombre de documents
        """
        if not self.initialized:
            await self.init_db()
        
        async with self.async_session_maker() as session:
            try:
                query = select(func.count()).select_from(Document)
                
                if status:
                    query = query.filter(Document.status == status)
                
                result = await session.execute(query)
                return result.scalar() or 0
            finally:
                await session.close()


# Instance globale du service async
async_db_service = AsyncDBService()
