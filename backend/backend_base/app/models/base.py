"""
Modèles de base de données SQLAlchemy.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text
from app.core.database import Base


class BaseModel(Base):
    """
    Modèle de base avec champs communs.
    Toutes les tables héritent de ce modèle.
    """
    __abstract__ = True
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)


class ExampleModel(BaseModel):
    """
    Modèle d'exemple.
    À remplacer par les vrais modèles métier.
    """
    __tablename__ = "examples"
    
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="pending", nullable=False)
    
    def __repr__(self):
        return f"<ExampleModel(id={self.id}, name={self.name}, status={self.status})>"
