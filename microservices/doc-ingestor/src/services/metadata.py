"""
Service d'extraction de métadonnées des documents
"""
import logging
from datetime import datetime
from typing import Dict, Any, Optional
import hashlib
from io import BytesIO
import PyPDF2

logger = logging.getLogger(__name__)


def extract_metadata(file_content: bytes, filename: str) -> Dict[str, Any]:
    """
    Extrait les métadonnées d'un document
    
    Args:
        file_content: Contenu binaire du fichier
        filename: Nom du fichier
    
    Returns:
        Dictionnaire de métadonnées
    """
    metadata = {
        "filename": filename,
        "file_size": len(file_content),
        "extraction_date": datetime.now().isoformat(),
        "checksum": calculate_checksum(file_content)
    }
    
    file_extension = f".{filename.split('.')[-1].lower()}"
    
    # Métadonnées spécifiques selon le type
    if file_extension == ".pdf":
        pdf_metadata = extract_pdf_metadata(file_content)
        metadata.update(pdf_metadata)
    
    return metadata


def calculate_checksum(file_content: bytes) -> str:
    """
    Calcule le checksum SHA-256 du fichier
    
    Args:
        file_content: Contenu binaire du fichier
    
    Returns:
        Checksum hexadécimal
    """
    return hashlib.sha256(file_content).hexdigest()


def extract_pdf_metadata(file_content: bytes) -> Dict[str, Any]:
    """
    Extrait les métadonnées spécifiques d'un PDF
    
    Args:
        file_content: Contenu binaire du PDF
    
    Returns:
        Dictionnaire de métadonnées PDF
    """
    metadata = {}
    
    try:
        pdf_file = BytesIO(file_content)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        
        # Informations basiques
        metadata["page_count"] = len(pdf_reader.pages)
        
        # Métadonnées du document
        if pdf_reader.metadata:
            pdf_info = pdf_reader.metadata
            
            metadata["pdf_author"] = pdf_info.get("/Author", None)
            metadata["pdf_creator"] = pdf_info.get("/Creator", None)
            metadata["pdf_producer"] = pdf_info.get("/Producer", None)
            metadata["pdf_subject"] = pdf_info.get("/Subject", None)
            metadata["pdf_title"] = pdf_info.get("/Title", None)
            
            # Dates de création et modification
            creation_date = pdf_info.get("/CreationDate", None)
            if creation_date:
                metadata["pdf_creation_date"] = parse_pdf_date(creation_date)
            
            mod_date = pdf_info.get("/ModDate", None)
            if mod_date:
                metadata["pdf_modification_date"] = parse_pdf_date(mod_date)
        
    except Exception as e:
        logger.warning(f"[WARN] Impossible d'extraire metadonnees PDF: {str(e)}")
    
    return metadata


def parse_pdf_date(pdf_date_string: str) -> Optional[str]:
    """
    Parse une date au format PDF vers ISO 8601
    
    Args:
        pdf_date_string: Date au format PDF (ex: "D:20230101120000")
    
    Returns:
        Date au format ISO 8601 ou None
    """
    try:
        # Format PDF: D:YYYYMMDDHHmmSSOHH'mm'
        if pdf_date_string.startswith("D:"):
            date_str = pdf_date_string[2:16]  # Extraire YYYYMMDDHHmmSS
            
            year = date_str[0:4]
            month = date_str[4:6]
            day = date_str[6:8]
            hour = date_str[8:10]
            minute = date_str[10:12]
            second = date_str[12:14]
            
            return f"{year}-{month}-{day}T{hour}:{minute}:{second}"
    except Exception as e:
        logger.warning(f"[WARN] Erreur parsing date PDF: {str(e)}")
    
    return None


def extract_medical_metadata(text_content: str) -> Dict[str, Any]:
    """
    Extrait des métadonnées médicales du texte
    (peut être enrichi avec NLP plus tard)
    
    Args:
        text_content: Contenu textuel du document
    
    Returns:
        Dictionnaire de métadonnées médicales
    """
    metadata = {}
    
    # Analyse basique
    metadata["word_count"] = len(text_content.split())
    metadata["character_count"] = len(text_content)
    metadata["line_count"] = len(text_content.split("\n"))
    
    # Détection de mots-clés médicaux (basique)
    medical_keywords = [
        "diagnostic", "traitement", "prescription", "ordonnance",
        "antécédents", "symptômes", "examen", "analyse",
        "médecin", "patient", "hôpital", "clinique"
    ]
    
    text_lower = text_content.lower()
    detected_keywords = [kw for kw in medical_keywords if kw in text_lower]
    
    if detected_keywords:
        metadata["detected_medical_keywords"] = detected_keywords
    
    return metadata
