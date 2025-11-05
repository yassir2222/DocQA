"""
Service de base de données pour les documents.
Gère les opérations CRUD sur la table documents.
"""
from typing import List, Optional, Dict, Any
from datetime import datetime
from uuid import UUID

from sqlalchemy import create_engine, desc
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import SQLAlchemyError

from config import settings
from models.document_model import Document, Base
from utils.logger import get_logger, log_audit

logger = get_logger(__name__)


class DBService:
    """Service de gestion de la base de données."""
    
    def __init__(self):
        """Initialise la connexion à la base de données."""
        self.engine = None
        self.SessionLocal = None
        self.initialized = False
    
    def init_db(self):
        """
        Initialise la connexion et crée les tables.
        """
        try:
            # Créer le moteur SQLAlchemy
            self.engine = create_engine(
                settings.POSTGRES_URL,
                pool_pre_ping=True,
                pool_size=10,
                max_overflow=20,
                echo=settings.DEBUG
            )
            
            # Créer la session factory
            self.SessionLocal = sessionmaker(
                autocommit=False,
                autoflush=False,
                bind=self.engine
            )
            
            # Créer les tables
            Base.metadata.create_all(bind=self.engine)
            
            self.initialized = True
            
            log_audit(
                logger,
                action="db_init",
                status="success",
                details={"url": settings.POSTGRES_HOST}
            )
            
        except Exception as e:
            log_audit(
                logger,
                action="db_init",
                status="error",
                error=str(e)
            )
            raise
    
    def get_session(self) -> Session:
        """
        Retourne une session de base de données.
        
        ATTENTION: Utiliser get_db() de dependencies.py pour auto-gestion.
        
        Returns:
            Session SQLAlchemy
        """
        if not self.initialized:
            self.init_db()
        
        return self.SessionLocal()
    
    def get_db_dependency(self):
        """
        Générateur pour l'injection de dépendances FastAPI.
        Gère automatiquement commit/rollback/close.
        
        Usage dans les routes:
            def my_route(db: Session = Depends(db_service.get_db_dependency)):
                ...
        
        Yields:
            Session SQLAlchemy
        """
        if not self.initialized:
            self.init_db()
        
        db = self.SessionLocal()
        try:
            yield db
        except Exception as e:
            db.rollback()
            logger.error(f"Transaction rollback: {str(e)}")
            raise
        finally:
            db.close()
    
    def create_document(
        self,
        file_name: str,
        file_type: str,
        file_size: int,
        metadata: Optional[Dict[str, Any]] = None,
        content_preview: Optional[str] = None,
        session: Optional[Session] = None
    ) -> Optional[Document]:
        """
        Crée un nouveau document dans la base.
        
        Args:
            file_name: Nom du fichier
            file_type: Type de fichier (pdf, docx, etc.)
            file_size: Taille en bytes
            metadata: Métadonnées extraites
            content_preview: Aperçu du contenu
            session: Session existante (optionnel, sinon en crée une)
            
        Returns:
            Document créé ou None en cas d'erreur
        """
        # Utiliser la session fournie ou en créer une nouvelle
        should_close = False
        if session is None:
            session = self.get_session()
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
                session.commit()
                session.refresh(document)
            else:
                session.flush()  # Flush pour obtenir l'ID sans commit
                session.refresh(document)
            
            log_audit(
                logger,
                action="create_document",
                document_id=str(document.document_id),
                status="success",
                details={"file_name": file_name}
            )
            
            return document
            
        except SQLAlchemyError as e:
            if should_close:
                session.rollback()
            log_audit(
                logger,
                action="create_document",
                status="error",
                error=str(e)
            )
            return None
        finally:
            if should_close:
                session.close()
    
    def update_document_status(
        self,
        document_id: UUID,
        status: str,
        error_message: Optional[str] = None,
        session: Optional[Session] = None
    ) -> bool:
        """
        Met à jour le statut d'un document.
        
        Args:
            document_id: ID du document
            status: Nouveau statut (pending, processed, error)
            error_message: Message d'erreur si applicable
            session: Session existante (optionnel)
            
        Returns:
            True si mis à jour, False sinon
        """
        should_close = False
        if session is None:
            session = self.get_session()
            should_close = True
        
        try:
            document = session.query(Document).filter(
                Document.document_id == document_id
            ).first()
            
            if not document:
                logger.warning(f"Document {document_id} non trouvé")
                return False
            
            document.status = status
            if error_message:
                document.error_message = error_message
            document.updated_at = datetime.utcnow()
            
            if should_close:
                session.commit()
            else:
                session.flush()
            
            log_audit(
                logger,
                action="update_document_status",
                document_id=str(document_id),
                status="success",
                details={"new_status": status}
            )
            
            return True
            
        except SQLAlchemyError as e:
            if should_close:
                session.rollback()
            log_audit(
                logger,
                action="update_document_status",
                document_id=str(document_id),
                status="error",
                error=str(e)
            )
            return False
        finally:
            if should_close:
                session.close()
    
    def get_document(self, document_id: UUID) -> Optional[Document]:
        """
        Récupère un document par son ID.
        
        Args:
            document_id: ID du document
            
        Returns:
            Document ou None si non trouvé
        """
        session = self.get_session()
        
        try:
            document = session.query(Document).filter(
                Document.document_id == document_id
            ).first()
            
            return document
        finally:
            session.close()
    
    def get_documents(
        self,
        skip: int = 0,
        limit: int = 100,
        status: Optional[str] = None
    ) -> List[Document]:
        """
        Récupère une liste de documents avec pagination.
        
        Args:
            skip: Nombre de documents à sauter
            limit: Nombre maximum de documents à retourner
            status: Filtrer par statut (optionnel)
            
        Returns:
            Liste de documents
        """
        session = self.get_session()
        
        try:
            query = session.query(Document)
            
            # Filtrer par statut si fourni
            if status:
                query = query.filter(Document.status == status)
            
            # Trier par date de création (plus récent d'abord)
            query = query.order_by(desc(Document.created_at))
            
            # Pagination
            documents = query.offset(skip).limit(limit).all()
            
            return documents
        finally:
            session.close()
    
    def get_document_count(self, status: Optional[str] = None) -> int:
        """
        Compte le nombre de documents.
        
        Args:
            status: Filtrer par statut (optionnel)
            
        Returns:
            Nombre de documents
        """
        session = self.get_session()
        
        try:
            query = session.query(Document)
            
            if status:
                query = query.filter(Document.status == status)
            
            count = query.count()
            return count
        finally:
            session.close()


# Instance globale
db_service = DBService()
