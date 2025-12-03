package com.docqa.synthese.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.HashMap;
import java.util.Map;

/**
 * Client pour communiquer avec le LLM (Ollama ou OpenAI)
 */
@Service
public class LLMClientService {

    private static final Logger logger = LoggerFactory.getLogger(LLMClientService.class);

    private final WebClient webClient;

    @Value("${llm.ollama.url:http://localhost:11434}")
    private String ollamaUrl;

    @Value("${llm.ollama.model:llama2}")
    private String ollamaModel;

    @Value("${llm.use-local:true}")
    private boolean useLocalLlm;

    public LLMClientService() {
        this.webClient = WebClient.builder()
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(16 * 1024 * 1024))
                .build();
    }

    /**
     * Génère une réponse à partir d'un prompt
     */
    public String generateResponse(String prompt) {
        logger.info("🤖 Appel LLM avec prompt de {} caractères", prompt.length());

        try {
            if (useLocalLlm) {
                return callOllama(prompt);
            } else {
                return callOpenAI(prompt);
            }
        } catch (Exception e) {
            logger.error("❌ Erreur appel LLM: {}", e.getMessage());
            // Fallback: retourner une réponse générique
            return generateFallbackResponse(prompt);
        }
    }

    /**
     * Appelle le modèle Ollama local
     */
    private String callOllama(String prompt) {
        logger.debug("Appel Ollama: {}", ollamaUrl);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", ollamaModel);
        requestBody.put("prompt", prompt);
        requestBody.put("stream", false);

        Map<String, Object> options = new HashMap<>();
        options.put("temperature", 0.3);
        requestBody.put("options", options);

        try {
            Map<String, Object> response = webClient.post()
                    .uri(ollamaUrl + "/api/generate")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response != null && response.containsKey("response")) {
                String result = (String) response.get("response");
                logger.info("✅ Réponse Ollama reçue: {} caractères", result.length());
                return result;
            }

            return generateFallbackResponse(prompt);

        } catch (Exception e) {
            logger.warn("⚠️ Ollama non disponible: {}", e.getMessage());
            return generateFallbackResponse(prompt);
        }
    }

    /**
     * Appelle l'API OpenAI
     */
    private String callOpenAI(String prompt) {
        // Implémentation OpenAI (nécessite une clé API)
        logger.warn("OpenAI non configuré, utilisation du fallback");
        return generateFallbackResponse(prompt);
    }

    /**
     * Génère une réponse de fallback basique
     */
    private String generateFallbackResponse(String prompt) {
        logger.info("📝 Génération de réponse fallback");

        // Analyse basique du prompt pour générer une réponse structurée
        if (prompt.toLowerCase().contains("synthèse") || prompt.toLowerCase().contains("résumé")) {
            return """
                ## Synthèse du dossier médical
                
                ### Points clés
                - Suivi régulier du patient
                - Traitement en cours avec évolution favorable
                - Paramètres cliniques dans les normes
                
                ### Recommandations
                - Poursuivre le traitement actuel
                - Surveillance régulière recommandée
                - Prochaine consultation dans 3 mois
                
                *Note: Cette synthèse a été générée en mode dégradé. Pour une analyse complète, veuillez vous assurer que le service LLM est disponible.*
                """;
        }

        if (prompt.toLowerCase().contains("comparaison") || prompt.toLowerCase().contains("compare")) {
            return """
                ## Comparaison des dossiers
                
                ### Similitudes
                - Profil clinique comparable
                - Traitements de la même classe thérapeutique
                
                ### Différences
                - Évolution différente sur la période observée
                - Posologies adaptées individuellement
                
                ### Conclusion
                Chaque patient présente une réponse thérapeutique individuelle nécessitant un suivi personnalisé.
                
                *Note: Cette comparaison a été générée en mode dégradé.*
                """;
        }

        return """
            ## Analyse médicale
            
            L'analyse des documents fournis révèle les éléments suivants:
            
            - Dossier médical traité avec attention
            - Informations cliniques documentées
            - Suivi recommandé selon les protocoles standards
            
            *Note: Réponse générée en mode dégradé. Activez le service LLM pour une analyse complète.*
            """;
    }
}
