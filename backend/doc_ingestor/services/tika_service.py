"""
Service d'extraction de contenu avec Apache Tika.
Extrait le texte et les métadonnées des documents.
"""
import re
from typing import Dict, Any, Optional
from pathlib import Path

from utils.logger import get_logger, log_audit

logger = get_logger(__name__)


class TikaService:
    """
    Service d'extraction de contenu avec Apache Tika.
    
    Note: Utilise tika-python qui télécharge automatiquement le JAR Tika.
    """
    
    @staticmethod
    def extract_content(file_path: str) -> Dict[str, Any]:
        """
        Extrait le texte et les métadonnées d'un document.
        
        Args:
            file_path: Chemin du fichier à analyser
            
        Returns:
            Dict avec 'content' (texte) et 'metadata' (dict)
        """
        try:
            from tika import parser
            
            # Parser le document
            parsed = parser.from_file(file_path)
            
            # Extraire le contenu
            content = parsed.get("content", "") or ""
            metadata = parsed.get("metadata", {}) or {}
            
            # Nettoyer le contenu
            content = TikaService._clean_text(content)
            
            # Nettoyer les métadonnées
            cleaned_metadata = TikaService._clean_metadata(metadata)
            
            log_audit(
                logger,
                action="extract_tika",
                status="success",
                details={
                    "file": Path(file_path).name,
                    "content_length": len(content),
                    "metadata_keys": list(cleaned_metadata.keys())
                }
            )
            
            return {
                "content": content,
                "metadata": cleaned_metadata
            }
            
        except ImportError:
            logger.error("tika-python n'est pas installé. Utilisez: pip install tika")
            return {
                "content": "",
                "metadata": {},
                "error": "Tika non disponible"
            }
        except Exception as e:
            log_audit(
                logger,
                action="extract_tika",
                status="error",
                error=str(e)
            )
            return {
                "content": "",
                "metadata": {},
                "error": str(e)
            }
    
    @staticmethod
    def _clean_text(text: str) -> str:
        """
        Nettoie le texte extrait.
        
        Args:
            text: Texte brut
            
        Returns:
            Texte nettoyé
        """
        if not text:
            return ""
        
        # Supprimer les espaces multiples
        text = re.sub(r'\s+', ' ', text)
        
        # Supprimer les caractères de contrôle
        text = re.sub(r'[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]', '', text)
        
        # Supprimer les espaces en début/fin
        text = text.strip()
        
        return text
    
    @staticmethod
    def _clean_metadata(metadata: Dict) -> Dict[str, Any]:
        """
        Nettoie et structure les métadonnées.
        
        Args:
            metadata: Métadonnées brutes de Tika
            
        Returns:
            Métadonnées nettoyées
        """
        cleaned = {}
        
        # Mapping des champs importants
        field_mapping = {
            "dc:creator": "author",
            "Author": "author",
            "meta:author": "author",
            "dc:title": "title",
            "title": "title",
            "Creation-Date": "creation_date",
            "dcterms:created": "creation_date",
            "Last-Modified": "modified_date",
            "dcterms:modified": "modified_date",
            "Page-Count": "pages",
            "xmpTPg:NPages": "pages",
            "Content-Type": "content_type",
        }
        
        for tika_key, our_key in field_mapping.items():
            if tika_key in metadata:
                value = metadata[tika_key]
                
                # Convertir les listes en string si nécessaire
                if isinstance(value, list):
                    value = ", ".join(str(v) for v in value)
                
                # Convertir pages en int
                if our_key == "pages" and value:
                    try:
                        value = int(value)
                    except (ValueError, TypeError):
                        pass
                
                cleaned[our_key] = value
        
        # Ajouter d'autres métadonnées utiles
        for key, value in metadata.items():
            if key not in field_mapping and not key.startswith("X-"):
                # Nettoyer le nom de la clé
                clean_key = key.lower().replace(":", "_").replace("-", "_")
                if clean_key not in cleaned:
                    cleaned[clean_key] = value
        
        return cleaned
