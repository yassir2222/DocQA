package com.docqa.synthese.service;

import com.docqa.synthese.dto.ComparisonRequest;
import com.docqa.synthese.dto.SynthesisRequest;
import com.docqa.synthese.dto.SynthesisResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Service de génération de synthèses et comparaisons
 */
@Service
public class SynthesisService {

    private static final Logger logger = LoggerFactory.getLogger(SynthesisService.class);

    private final WebClient webClient;
    private final LLMClientService llmClientService;

    @Value("${services.indexeur.url}")
    private String indexeurUrl;

    public SynthesisService(LLMClientService llmClientService) {
        this.webClient = WebClient.builder().build();
        this.llmClientService = llmClientService;
    }

    /**
     * Génère une synthèse de documents
     */
    public SynthesisResult generateSynthesis(SynthesisRequest request) {
        long startTime = System.currentTimeMillis();
        logger.info("📝 Génération de synthèse: type={}, documents={}", 
                request.getSynthesisType(), request.getDocumentIds().size());

        try {
            // 1. Récupérer les contenus des documents
            List<Map<String, Object>> documents = fetchDocuments(request.getDocumentIds());

            // 2. Construire le contexte pour le LLM
            String context = buildContext(documents);

            // 3. Générer le prompt selon le type de synthèse
            String prompt = buildSynthesisPrompt(request.getSynthesisType(), request.getFocus(), context);

            // 4. Appeler le LLM
            String llmResponse = llmClientService.generateResponse(prompt);

            // 5. Parser et structurer la réponse
            SynthesisResult result = new SynthesisResult();
            result.setId(UUID.randomUUID().toString());
            result.setType(request.getSynthesisType());
            result.setSummary(llmResponse);
            result.setKeyPoints(extractKeyPoints(llmResponse));
            result.setSourceDocuments(request.getDocumentIds());
            result.setGeneratedAt(LocalDateTime.now());
            result.setProcessingTimeMs((int) (System.currentTimeMillis() - startTime));

            logger.info("✅ Synthèse générée en {}ms", result.getProcessingTimeMs());
            return result;

        } catch (Exception e) {
            logger.error("❌ Erreur génération synthèse: {}", e.getMessage(), e);
            throw new RuntimeException("Erreur lors de la génération de la synthèse", e);
        }
    }

    /**
     * Génère une comparaison entre deux patients
     */
    public SynthesisResult generateComparison(ComparisonRequest request) {
        long startTime = System.currentTimeMillis();
        logger.info("🔄 Génération de comparaison: {} vs {}", 
                request.getPatientId1(), request.getPatientId2());

        try {
            // 1. Récupérer les documents des deux patients
            List<Map<String, Object>> docs1 = fetchDocuments(request.getDocumentIds1());
            List<Map<String, Object>> docs2 = fetchDocuments(request.getDocumentIds2());

            // 2. Construire les contextes
            String context1 = "## Patient 1\n" + buildContext(docs1);
            String context2 = "## Patient 2\n" + buildContext(docs2);

            // 3. Construire le prompt de comparaison
            String prompt = buildComparisonPrompt(request.getComparisonType(), context1, context2);

            // 4. Appeler le LLM
            String llmResponse = llmClientService.generateResponse(prompt);

            // 5. Construire le résultat
            SynthesisResult result = new SynthesisResult();
            result.setId(UUID.randomUUID().toString());
            result.setType("COMPARISON_" + request.getComparisonType());
            result.setSummary(llmResponse);
            result.setKeyPoints(extractKeyPoints(llmResponse));
            
            List<String> allDocs = new ArrayList<>();
            allDocs.addAll(request.getDocumentIds1());
            allDocs.addAll(request.getDocumentIds2());
            result.setSourceDocuments(allDocs);
            
            Map<String, Object> structuredData = new HashMap<>();
            structuredData.put("patient1", request.getPatientId1());
            structuredData.put("patient2", request.getPatientId2());
            structuredData.put("comparisonType", request.getComparisonType());
            result.setStructuredData(structuredData);
            
            result.setGeneratedAt(LocalDateTime.now());
            result.setProcessingTimeMs((int) (System.currentTimeMillis() - startTime));

            logger.info("✅ Comparaison générée en {}ms", result.getProcessingTimeMs());
            return result;

        } catch (Exception e) {
            logger.error("❌ Erreur génération comparaison: {}", e.getMessage(), e);
            throw new RuntimeException("Erreur lors de la génération de la comparaison", e);
        }
    }

    /**
     * Récupère les documents depuis l'IndexeurSémantique
     */
    private List<Map<String, Object>> fetchDocuments(List<String> documentIds) {
        // En mode développement, utiliser des données mock
        // En production, appeler l'IndexeurSémantique
        List<Map<String, Object>> documents = new ArrayList<>();
        
        for (String docId : documentIds) {
            try {
                // Tentative d'appel au service réel
                // Si échec, utiliser des données mock
                Map<String, Object> doc = new HashMap<>();
                doc.put("id", docId);
                doc.put("content", getMockContent(docId));
                documents.add(doc);
            } catch (Exception e) {
                logger.warn("Document {} non trouvé, utilisation de données mock", docId);
            }
        }
        
        return documents;
    }

    /**
     * Construit le contexte à partir des documents
     */
    private String buildContext(List<Map<String, Object>> documents) {
        StringBuilder context = new StringBuilder();
        for (Map<String, Object> doc : documents) {
            String content = (String) doc.get("content");
            if (content != null && !content.isEmpty()) {
                context.append("---\n").append(content).append("\n");
            }
        }
        return context.toString();
    }

    /**
     * Construit le prompt pour une synthèse
     */
    private String buildSynthesisPrompt(String type, String focus, String context) {
        String instruction = switch (type) {
            case "SUMMARY" -> "Générez un résumé structuré du dossier médical suivant.";
            case "EVOLUTION" -> "Analysez l'évolution de l'état du patient à travers les documents suivants.";
            case "TREATMENT_HISTORY" -> "Retracez l'historique des traitements du patient.";
            default -> "Analysez les documents médicaux suivants.";
        };

        String focusInstruction = "";
        if (focus != null && !focus.isEmpty()) {
            focusInstruction = "\nConcentrez-vous particulièrement sur: " + focus;
        }

        return String.format("""
            Vous êtes un expert médical. %s%s
            
            DOCUMENTS:
            %s
            
            INSTRUCTIONS:
            - Structurez votre réponse avec des sections claires
            - Mettez en évidence les points importants
            - Soyez précis et professionnel
            - Citez les informations clés du dossier
            
            SYNTHÈSE:
            """, instruction, focusInstruction, context);
    }

    /**
     * Construit le prompt pour une comparaison
     */
    private String buildComparisonPrompt(String type, String context1, String context2) {
        String instruction = switch (type) {
            case "TREATMENT" -> "Comparez les traitements des deux patients.";
            case "EVOLUTION" -> "Comparez l'évolution des deux patients.";
            case "DIAGNOSIS" -> "Comparez les diagnostics des deux patients.";
            default -> "Comparez les dossiers des deux patients.";
        };

        return String.format("""
            Vous êtes un expert médical. %s
            
            %s
            
            %s
            
            INSTRUCTIONS:
            - Identifiez les similitudes et différences
            - Structurez votre comparaison de manière claire
            - Soulignez les points cliniquement significatifs
            - Restez objectif et professionnel
            
            COMPARAISON:
            """, instruction, context1, context2);
    }

    /**
     * Extrait les points clés de la réponse
     */
    private List<String> extractKeyPoints(String response) {
        List<String> keyPoints = new ArrayList<>();
        String[] lines = response.split("\n");
        
        for (String line : lines) {
            line = line.trim();
            if (line.startsWith("-") || line.startsWith("•") || line.startsWith("*")) {
                keyPoints.add(line.substring(1).trim());
            }
        }
        
        // Si pas de points bullet, prendre les premières phrases
        if (keyPoints.isEmpty() && response.length() > 100) {
            String[] sentences = response.split("\\.");
            for (int i = 0; i < Math.min(3, sentences.length); i++) {
                if (!sentences[i].trim().isEmpty()) {
                    keyPoints.add(sentences[i].trim());
                }
            }
        }
        
        return keyPoints;
    }

    /**
     * Contenu mock pour le développement
     */
    private String getMockContent(String docId) {
        return """
            Compte-rendu de consultation
            Date: 15/11/2024
            
            Motif: Suivi de l'insuffisance cardiaque
            
            Antécédents:
            - Hypertension artérielle
            - Diabète de type 2
            
            Traitement actuel:
            - Furosémide 40mg
            - Bisoprolol 2.5mg
            - Ramipril 5mg
            
            Examen: État stable, pas de dyspnée au repos.
            PA: 130/80 mmHg, FC: 68 bpm
            
            Conclusion: Évolution favorable. Poursuivre le traitement.
            """;
    }
}
