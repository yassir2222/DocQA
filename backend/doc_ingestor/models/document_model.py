"""
Modèle SQLAlchemy pour les documents ingérés.
"""
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, Integer, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.ext.declarative import declarative_base
import uuid

Base = declarative_base()


class Document(Base):
    """
    Modèle pour stocker les métadonnées des documents ingérés.
    
    Attributes:
        document_id: Identifiant unique du document (UUID)
        file_name: Nom du fichier uploadé
        type: Type de document (pdf, docx, txt, xml, hl7)
        upload_date: Date et heure d'upload
        status: Statut du traitement (pending, processing, processed, error, deleted)
        file_size: Taille du fichier en bytes
        doc_metadata: Métadonnées extraites (JSON: author, date, pages, etc.)
        content_preview: Aperçu du contenu extrait (500 premiers caractères)
        error_message: Message d'erreur si le traitement a échoué
        created_at: Date de création de l'enregistrement
        updated_at: Date de dernière mise à jour
    """
    
    __tablename__ = "documents"
    
    document_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False
    )
    
    file_name = Column(String(255), nullable=False, index=True)
    type = Column(String(50), nullable=False, index=True)
    upload_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    status = Column(
        String(50),
        default="pending",
        nullable=False,
        index=True
    )  # pending, processing, processed, error, deleted
    
    file_size = Column(Integer, nullable=True)
    doc_metadata = Column(JSONB, nullable=True)  # Renommé car 'metadata' est réservé par SQLAlchemy
    content_preview = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )
    
    # Index composites pour les requêtes fréquentes
    __table_args__ = (
        Index('idx_status_upload_date', 'status', 'upload_date'),
        Index('idx_type_status', 'type', 'status'),
    )
    error_message = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )
    
    def __repr__(self):
        return (
            f"<Document(document_id={self.document_id}, "
            f"file_name='{self.file_name}', "
            f"status='{self.status}')>"
        )
    
    def to_dict(self):
        """Convertit le document en dictionnaire."""
        return {
            "document_id": str(self.document_id),
            "file_name": self.file_name,
            "type": self.type,
            "upload_date": self.upload_date.isoformat() if self.upload_date else None,
            "status": self.status,
            "file_size": self.file_size,
            "metadata": self.doc_metadata,
            "content_preview": self.content_preview,
            "error_message": self.error_message,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
