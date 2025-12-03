"""
Service de gestion du contexte et recherche de documents pour RAG
Retrieval component of RAG architecture
"""
import logging
from typing import List, Dict, Optional
import httpx

from config import settings

logger = logging.getLogger(__name__)


class ContextService:
    """
    Service RAG Retrieval - Recherche de documents pertinents
    Integre avec IndexeurSemantique pour la recherche vectorielle
    """
    
    def __init__(self):
        self.indexeur_url = settings.INDEXEUR_SERVICE_URL
        self.similarity_threshold = settings.RAG_SIMILARITY_THRESHOLD
    
    async def search_relevant_documents(
        self,
        query: str,
        patient_id: Optional[str] = None,
        document_type: Optional[str] = None,
        limit: int = None
    ) -> List[Dict]:
        """
        RAG Retrieval: Recherche les documents les plus pertinents
        
        Pipeline:
        1. Query expansion (optional)
        2. Semantic search via IndexeurSemantique
        3. Filter by metadata (patient, type)
        4. Score filtering
        5. Return top K documents
        
        Args:
            query: Question ou requete de recherche
            patient_id: Filtrer par patient
            document_type: Filtrer par type de document
            limit: Nombre max de resultats
        
        Returns:
            Liste des documents pertinents avec scores
        """
        if limit is None:
            limit = settings.RAG_TOP_K_RESULTS
        
        logger.info(f"[RAG-RETRIEVAL] Query: {query[:60]}...")
        
        try:
            # Step 1: Expand query for better retrieval
            expanded_query = self._expand_query(query)
            
            # Step 2: Call IndexeurSemantique
            async with httpx.AsyncClient(timeout=30.0) as client:
                # Try POST first (semantic search)
                try:
                    response = await client.post(
                        f"{self.indexeur_url}/api/search",
                        json={
                            "query": expanded_query,
                            "topK": limit * 2,  # Get more for filtering
                            "patientId": patient_id
                        }
                    )
                except:
                    # Fallback to GET
                    response = await client.get(
                        f"{self.indexeur_url}/api/search",
                        params={"query": expanded_query, "limit": limit * 2}
                    )
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # Handle different response formats
                    if isinstance(data, dict):
                        documents = data.get("results", data.get("documents", []))
                    else:
                        documents = data
                    
                    # Step 3: Filter and score
                    documents = self._filter_documents(
                        documents, 
                        patient_id, 
                        document_type
                    )
                    
                    # Step 4: Apply similarity threshold
                    documents = self._apply_threshold(documents)
                    
                    logger.info(f"[RAG-RETRIEVAL] {len(documents)} documents trouves")
                    return documents[:limit]
                    
                else:
                    logger.warning(f"[RAG-RETRIEVAL] IndexeurSemantique returned {response.status_code}")
                    return self._get_mock_documents(query, limit)
                    
        except httpx.ConnectError:
            logger.warning("[RAG-RETRIEVAL] IndexeurSemantique non disponible, mode mock")
            return self._get_mock_documents(query, limit)
        except Exception as e:
            logger.error(f"[RAG-RETRIEVAL] Erreur: {e}")
            return self._get_mock_documents(query, limit)
    
    def _expand_query(self, query: str) -> str:
        """
        Query expansion for better retrieval
        Add medical synonyms and related terms
        """
        # Simple expansion - can be enhanced with medical ontologies
        medical_expansions = {
            "diabete": "diabete glucose glycemie insuline",
            "hypertension": "hypertension tension arterielle HTA",
            "cancer": "cancer tumeur maligne oncologie",
            "coeur": "coeur cardiaque cardiovasculaire",
            "poumon": "poumon pulmonaire respiratoire",
            "foie": "foie hepatique",
            "rein": "rein renal nephro",
            "traitement": "traitement medicament therapie prescription",
            "douleur": "douleur algique antalgique",
            "fievre": "fievre temperature hyperthermie"
        }
        
        expanded = query
        query_lower = query.lower()
        
        for term, expansion in medical_expansions.items():
            if term in query_lower:
                expanded = f"{query} {expansion}"
                break
        
        return expanded
    
    def _filter_documents(
        self, 
        documents: List[Dict],
        patient_id: Optional[str],
        document_type: Optional[str]
    ) -> List[Dict]:
        """Filter documents by metadata"""
        filtered = documents
        
        if patient_id:
            filtered = [
                doc for doc in filtered 
                if doc.get("patient_id") == patient_id or 
                   doc.get("patientId") == patient_id
            ]
        
        if document_type:
            filtered = [
                doc for doc in filtered
                if doc.get("document_type") == document_type or
                   doc.get("documentType") == document_type
            ]
        
        return filtered
    
    def _apply_threshold(self, documents: List[Dict]) -> List[Dict]:
        """Apply similarity threshold"""
        return [
            doc for doc in documents
            if doc.get("score", doc.get("similarity", 1.0)) >= self.similarity_threshold
        ]
    
    def _get_mock_documents(self, query: str, limit: int) -> List[Dict]:
        """Retourne des documents mock pour le développement"""
        mock_docs = [
            {
                "id": "1",
                "filename": "compte-rendu-consultation-001.pdf",
                "content": """
                Compte-rendu de consultation du 15/11/2024
                Patient: [PERSON_ANONYMISE]
                
                Motif de consultation: Douleurs thoraciques et essoufflement à l'effort.
                
                Antécédents: Hypertension artérielle traitée par Amlodipine 5mg.
                Tabagisme actif (20 paquets-années).
                
                Examen clinique: 
                - PA: 145/90 mmHg
                - FC: 78 bpm
                - Auscultation cardiaque normale
                - Auscultation pulmonaire: quelques râles crépitants aux bases
                
                Diagnostic suspecté: Insuffisance cardiaque débutante
                
                Traitement proposé:
                - Furosémide 40mg 1/jour
                - Bisoprolol 2.5mg 1/jour
                - ECG et échographie cardiaque à programmer
                """,
                "score": 0.92,
                "document_type": "compte-rendu",
                "patient_id": "P001"
            },
            {
                "id": "2", 
                "filename": "resultats-laboratoire-002.pdf",
                "content": """
                Résultats d'analyses biologiques du 16/11/2024
                Patient: [PERSON_ANONYMISE]
                
                Hématologie:
                - Hémoglobine: 12.5 g/dL (N: 13-17)
                - Leucocytes: 8500 /mm³ (N: 4000-10000)
                - Plaquettes: 245000 /mm³ (N: 150000-400000)
                
                Biochimie:
                - Créatinine: 95 µmol/L (N: 60-110)
                - Glycémie à jeun: 6.2 mmol/L (N: 3.9-5.5) - ÉLEVÉE
                - BNP: 450 pg/mL (N: <100) - TRÈS ÉLEVÉ
                
                Conclusion: Élévation significative du BNP compatible avec une insuffisance cardiaque.
                Glycémie limite supérieure à surveiller.
                """,
                "score": 0.85,
                "document_type": "laboratoire",
                "patient_id": "P001"
            },
            {
                "id": "3",
                "filename": "ordonnance-003.pdf",
                "content": """
                Ordonnance médicale du 17/11/2024
                
                Pour: [PERSON_ANONYMISE]
                
                1. FUROSEMIDE 40mg
                   1 comprimé le matin
                   QSP 3 mois
                
                2. BISOPROLOL 2.5mg  
                   1 comprimé le matin
                   QSP 3 mois
                
                3. RAMIPRIL 2.5mg
                   1 comprimé le soir
                   QSP 3 mois
                
                Surveillance: Ionogramme sanguin à 1 mois
                Consultation de contrôle dans 6 semaines
                
                Dr [PERSON_ANONYMISE]
                """,
                "score": 0.78,
                "document_type": "ordonnance",
                "patient_id": "P001"
            }
        ]
        
        return mock_docs[:limit]
