"""
Services métier du microservice.
Contient la logique business réutilisable.
"""

import logging
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session

from app.models.base import ExampleModel

logger = logging.getLogger(__name__)


class ExampleService:
    """
    Service d'exemple pour les opérations métier.
    À adapter selon les besoins du microservice.
    """
    
    @staticmethod
    def create_example(db: Session, name: str, description: Optional[str] = None) -> ExampleModel:
        """
        Crée un nouvel exemple.
        
        Args:
            db: Session de base de données
            name: Nom de l'exemple
            description: Description optionnelle
            
        Returns:
            L'exemple créé
        """
        try:
            example = ExampleModel(
                name=name,
                description=description,
                status="created"
            )
            db.add(example)
            db.commit()
            db.refresh(example)
            
            logger.info(f" Exemple créé: {example.id} - {example.name}")
            return example
            
        except Exception as e:
            logger.error(f" Erreur lors de la création: {e}")
            db.rollback()
            raise
    
    @staticmethod
    def get_example(db: Session, example_id: int) -> Optional[ExampleModel]:
        """
        Récupère un exemple par son ID.
        
        Args:
            db: Session de base de données
            example_id: ID de l'exemple
            
        Returns:
            L'exemple trouvé ou None
        """
        return db.query(ExampleModel).filter(
            ExampleModel.id == example_id,
            ExampleModel.is_active == True
        ).first()
    
    @staticmethod
    def get_all_examples(
        db: Session,
        skip: int = 0,
        limit: int = 100
    ) -> List[ExampleModel]:
        """
        Récupère tous les exemples avec pagination.
        
        Args:
            db: Session de base de données
            skip: Nombre d'éléments à sauter
            limit: Nombre maximum d'éléments à retourner
            
        Returns:
            Liste des exemples
        """
        return db.query(ExampleModel).filter(
            ExampleModel.is_active == True
        ).offset(skip).limit(limit).all()
    
    @staticmethod
    def update_example(
        db: Session,
        example_id: int,
        data: Dict[str, Any]
    ) -> Optional[ExampleModel]:
        """
        Met à jour un exemple.
        
        Args:
            db: Session de base de données
            example_id: ID de l'exemple
            data: Données à mettre à jour
            
        Returns:
            L'exemple mis à jour ou None
        """
        try:
            example = ExampleService.get_example(db, example_id)
            if not example:
                return None
            
            for key, value in data.items():
                if hasattr(example, key):
                    setattr(example, key, value)
            
            db.commit()
            db.refresh(example)
            
            logger.info(f" Exemple mis à jour: {example.id}")
            return example
            
        except Exception as e:
            logger.error(f" Erreur lors de la mise à jour: {e}")
            db.rollback()
            raise
    
    @staticmethod
    def delete_example(db: Session, example_id: int) -> bool:
        """
        Supprime (soft delete) un exemple.
        
        Args:
            db: Session de base de données
            example_id: ID de l'exemple
            
        Returns:
            True si supprimé, False sinon
        """
        try:
            example = ExampleService.get_example(db, example_id)
            if not example:
                return False
            
            example.is_active = False
            db.commit()
            
            logger.info(f"Exemple supprimé: {example.id}")
            return True
            
        except Exception as e:
            logger.error(f"Erreur lors de la suppression: {e}")
            db.rollback()
            raise
