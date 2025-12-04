package com.docqa.synthese.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Client pour communiquer avec le service d'audit
 */
@Service
public class AuditClientService {

    private static final Logger logger = LoggerFactory.getLogger(AuditClientService.class);

    private final WebClient webClient;

    @Value("${services.audit.url:http://docqa-audit-logger:8086}")
    private String auditUrl;

    public AuditClientService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    /**
     * Envoie un log d'audit de manière asynchrone
     */
    public void logAction(String action, String userId, String details, String resourceId) {
        Map<String, Object> logEntry = new HashMap<>();
        logEntry.put("action", action);
        logEntry.put("userId", userId != null ? userId : "SYSTEM");
        logEntry.put("details", details);
        logEntry.put("resourceId", resourceId);
        logEntry.put("timestamp", LocalDateTime.now().toString());
        logEntry.put("service", "synthese-comparative");
        logEntry.put("status", "SUCCESS");

        webClient.post()
                .uri(auditUrl + "/api/audit/log")
                .bodyValue(logEntry)
                .retrieve()
                .bodyToMono(Map.class)
                .subscribe(
                        response -> logger.debug("✅ Log audit envoyé: {}", action),
                        error -> logger.warn("⚠️ Échec envoi log audit: {}", error.getMessage())
                );
    }
}
