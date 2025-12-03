"""
Service de Questions/Reponses avec RAG et Mistral Nemo 12B
Architecture: Retrieval-Augmented Generation
"""
import logging
import uuid
from typing import List, Dict, Tuple, Optional
import httpx
import json

from config import settings

logger = logging.getLogger(__name__)


class QAService:
    """
    Service RAG pour Questions/Reponses medicales
    Utilise Mistral Nemo 12B Instruct via Ollama
    """
    
    def __init__(self):
        self.use_local = settings.USE_LOCAL_LLM
        self.model = settings.OLLAMA_MODEL
        self.ollama_url = settings.OLLAMA_BASE_URL
        
    async def answer_question(
        self, 
        question: str, 
        context_documents: List[Dict]
    ) -> Tuple[str, float, str]:
        """
        RAG Pipeline:
        1. Receive retrieved documents (already done by ContextService)
        2. Rerank documents by relevance
        3. Build optimized context
        4. Generate answer with Mistral Nemo
        5. Extract sources and confidence
        
        Returns:
            Tuple[answer, confidence, query_id]
        """
        query_id = str(uuid.uuid4())
        
        logger.info(f"[RAG] Question: {question[:80]}...")
        logger.info(f"[RAG] Documents recus: {len(context_documents)}")
        
        # Step 1: Rerank documents if enabled
        if settings.USE_RERANKING and len(context_documents) > settings.RERANK_TOP_K:
            context_documents = await self._rerank_documents(question, context_documents)
            logger.info(f"[RAG] Documents apres reranking: {len(context_documents)}")
        
        # Step 2: Build optimized context
        context, sources = self._build_rag_context(context_documents)
        
        # Step 3: Generate answer with Mistral Nemo
        prompt = self._build_mistral_prompt(question, context)
        
        try:
            answer = await self._call_mistral_nemo(prompt)
            
            # Step 4: Calculate confidence
            confidence = self._calculate_rag_confidence(answer, sources, question)
            
            logger.info(f"[RAG] Reponse generee (confiance: {confidence})")
            
            return answer, confidence, query_id
            
        except Exception as e:
            logger.error(f"[RAG] Erreur generation: {e}")
            raise
    
    async def _rerank_documents(
        self, 
        question: str, 
        documents: List[Dict]
    ) -> List[Dict]:
        """
        Rerank documents using LLM-based scoring
        """
        scored_docs = []
        
        for doc in documents:
            content = doc.get("content", "")[:500]
            score = await self._score_relevance(question, content)
            scored_docs.append((score, doc))
        
        # Sort by score descending
        scored_docs.sort(key=lambda x: x[0], reverse=True)
        
        # Return top K
        return [doc for _, doc in scored_docs[:settings.RERANK_TOP_K]]
    
    async def _score_relevance(self, question: str, content: str) -> float:
        """
        Score document relevance using Mistral Nemo
        """
        prompt = f"""Score the relevance of this document excerpt to the question.
Return ONLY a number between 0 and 10.

Question: {question}
Document: {content[:300]}

Relevance score (0-10):"""
        
        try:
            response = await self._call_mistral_nemo(prompt, max_tokens=10)
            # Extract number from response
            import re
            numbers = re.findall(r'\d+(?:\.\d+)?', response)
            if numbers:
                return min(float(numbers[0]) / 10.0, 1.0)
            return 0.5
        except:
            return 0.5
    
    def _build_rag_context(self, documents: List[Dict]) -> Tuple[str, List[Dict]]:
        """
        Build optimized context for RAG
        Returns context string and source metadata
        """
        context_parts = []
        sources = []
        total_length = 0
        max_length = settings.MAX_CONTEXT_LENGTH
        
        for i, doc in enumerate(documents, 1):
            content = doc.get("content", "")
            filename = doc.get("filename", f"Document_{i}")
            doc_type = doc.get("document_type", "medical")
            patient_id = doc.get("patient_id", "N/A")
            
            # Chunk content if too long
            if len(content) > 1500:
                content = self._smart_truncate(content, 1500)
            
            # Check if we have space
            if total_length + len(content) > max_length:
                break
            
            # Format document
            doc_text = f"""[SOURCE {i}]
Fichier: {filename}
Type: {doc_type}
Patient: {patient_id}
---
{content}
---"""
            
            context_parts.append(doc_text)
            sources.append({
                "index": i,
                "filename": filename,
                "type": doc_type,
                "patient_id": patient_id,
                "excerpt": content[:200]
            })
            
            total_length += len(doc_text)
        
        return "\n\n".join(context_parts), sources
    
    def _smart_truncate(self, text: str, max_length: int) -> str:
        """
        Truncate text at sentence boundary
        """
        if len(text) <= max_length:
            return text
        
        # Find last sentence end before max_length
        truncated = text[:max_length]
        last_period = truncated.rfind('.')
        last_newline = truncated.rfind('\n')
        
        cut_point = max(last_period, last_newline)
        if cut_point > max_length * 0.5:
            return text[:cut_point + 1]
        
        return truncated + "..."
    
    def _build_mistral_prompt(self, question: str, context: str) -> str:
        """
        Build optimized prompt for Mistral Nemo 12B Instruct
        Uses the recommended prompt format
        """
        system_prompt = """Tu es un assistant medical expert specialise dans l'analyse de documents cliniques.
Tu dois repondre aux questions en te basant UNIQUEMENT sur les documents fournis.
Sois precis, professionnel et cite tes sources."""

        user_prompt = f"""Voici les documents medicaux pertinents:

{context}

---

QUESTION: {question}

INSTRUCTIONS:
1. Reponds en te basant UNIQUEMENT sur les documents ci-dessus
2. Si l'information n'est pas dans les documents, dis-le clairement
3. Structure ta reponse de maniere claire et professionnelle
4. Utilise un langage medical precis mais accessible

REPONSE:"""

        # Mistral Nemo Instruct format
        return f"""<s>[INST] {system_prompt}

{user_prompt} [/INST]"""
    
    async def _call_mistral_nemo(
        self, 
        prompt: str, 
        max_tokens: int = 1024
    ) -> str:
        """
        Call Mistral Nemo 12B via Ollama with optimized parameters
        """
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{self.ollama_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": settings.LLM_TEMPERATURE,
                        "top_p": settings.LLM_TOP_P,
                        "top_k": settings.LLM_TOP_K,
                        "num_ctx": settings.LLM_NUM_CTX,
                        "repeat_penalty": settings.LLM_REPEAT_PENALTY,
                        "num_predict": max_tokens,
                        "stop": ["</s>", "[INST]", "QUESTION:"]
                    }
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                answer = data.get("response", "").strip()
                
                # Log generation stats
                if "total_duration" in data:
                    duration_ms = data["total_duration"] / 1_000_000
                    logger.info(f"[MISTRAL] Generation time: {duration_ms:.0f}ms")
                
                return answer
            else:
                error_text = response.text
                logger.error(f"[MISTRAL] Error {response.status_code}: {error_text}")
                raise Exception(f"Mistral Nemo error: {response.status_code}")
    
    def _calculate_rag_confidence(
        self, 
        answer: str, 
        sources: List[Dict],
        question: str
    ) -> float:
        """
        Calculate confidence score based on multiple factors
        """
        confidence = 0.5  # Base
        
        # Factor 1: Number of sources used
        source_refs = answer.count("[SOURCE")
        if source_refs > 0:
            confidence += min(source_refs * 0.1, 0.2)
        
        # Factor 2: Answer length (substantive response)
        if len(answer) > 200:
            confidence += 0.1
        if len(answer) > 500:
            confidence += 0.1
        
        # Factor 3: Number of available sources
        if len(sources) >= 3:
            confidence += 0.1
        
        # Factor 4: Uncertainty indicators (negative)
        uncertainty_phrases = [
            "je ne sais pas", "pas dans les documents", 
            "aucune information", "impossible de determiner",
            "non mentionne", "pas disponible"
        ]
        answer_lower = answer.lower()
        for phrase in uncertainty_phrases:
            if phrase in answer_lower:
                confidence -= 0.15
                break
        
        # Factor 5: Medical terminology presence (positive)
        medical_terms = [
            "diagnostic", "traitement", "patient", "symptome",
            "pathologie", "medicament", "examen", "antecedent"
        ]
        term_count = sum(1 for term in medical_terms if term in answer_lower)
        confidence += min(term_count * 0.02, 0.1)
        
        return round(max(min(confidence, 0.95), 0.1), 2)
    
    async def extract_medical_info(
        self, 
        document_content: str, 
        extraction_type: str
    ) -> Dict:
        """
        Extract structured medical information using Mistral Nemo
        """
        prompt = self._build_extraction_prompt(document_content, extraction_type)
        
        try:
            response = await self._call_mistral_nemo(prompt, max_tokens=800)
            return self._parse_extraction_response(response, extraction_type)
        except Exception as e:
            logger.error(f"[RAG] Erreur extraction: {e}")
            raise
    
    def _build_extraction_prompt(self, content: str, extraction_type: str) -> str:
        """Build extraction prompt for Mistral Nemo"""
        type_instructions = {
            "pathologies": "Extrait toutes les maladies, diagnostics, syndromes et conditions medicales.",
            "traitements": "Extrait tous les medicaments, traitements, therapies avec posologies si disponibles.",
            "antecedents": "Extrait tous les antecedents medicaux, chirurgicaux, familiaux et allergies."
        }
        
        instruction = type_instructions.get(extraction_type, "Extrait les informations medicales pertinentes.")
        
        return f"""<s>[INST] Tu es un extracteur d'informations medicales.

DOCUMENT:
{content[:3000]}

INSTRUCTION: {instruction}

Fournis les resultats en JSON avec le format:
{{"items": ["item1", "item2", ...], "details": {{"item1": "details...", ...}}}}

EXTRACTION JSON: [/INST]"""
    
    def _parse_extraction_response(self, response: str, extraction_type: str) -> Dict:
        """Parse extraction response"""
        try:
            # Try to extract JSON
            import re
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                data = json.loads(json_match.group())
                return {
                    "type": extraction_type,
                    "items": data.get("items", []),
                    "details": data.get("details", {}),
                    "count": len(data.get("items", []))
                }
        except:
            pass
        
        # Fallback: parse as list
        lines = [l.strip() for l in response.split('\n') if l.strip()]
        items = [l.lstrip('-•* ') for l in lines if l.startswith(('-', '•', '*'))]
        
        return {
            "type": extraction_type,
            "items": items,
            "details": {},
            "count": len(items)
        }
    
    async def _call_openai(self, prompt: str) -> str:
        """Fallback: Call OpenAI API"""
        if not settings.OPENAI_API_KEY:
            raise Exception("OPENAI_API_KEY non configuree")
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": settings.OPENAI_MODEL,
                    "messages": [
                        {"role": "system", "content": "Tu es un assistant medical expert."},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": settings.LLM_TEMPERATURE
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                return data["choices"][0]["message"]["content"]
            else:
                raise Exception(f"OpenAI error: {response.status_code}")
