package com.docqa.deid.messaging;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * Publisher RabbitMQ pour envoyer les documents anonymisés vers IndexeurSémantique
 */
@Component
public class DocumentPublisher {

    private static final Logger logger = LoggerFactory.getLogger(DocumentPublisher.class);
    
    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;
    
    @Value("${app.queue.output}")
    private String outputQueue;

    public DocumentPublisher(RabbitTemplate rabbitTemplate, ObjectMapper objectMapper) {
        this.rabbitTemplate = rabbitTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Publie un document anonymisé vers la queue de sortie
     */
    public void publishAnonymizedDocument(String documentId, String filename, 
                                          String anonymizedContent, Map<String, Object> metadata) {
        try {
            Map<String, Object> message = new HashMap<>();
            message.put("document_id", documentId);
            message.put("filename", filename);
            message.put("text_content", anonymizedContent);
            message.put("metadata", metadata);
            message.put("anonymized", true);
            message.put("processed_at", System.currentTimeMillis());
            
            String jsonMessage = objectMapper.writeValueAsString(message);
            rabbitTemplate.convertAndSend(outputQueue, jsonMessage);
            
            logger.info("📤 Document anonymisé publié vers {}: {} (ID: {})", 
                    outputQueue, filename, documentId);
                    
        } catch (Exception e) {
            logger.error("❌ Erreur lors de la publication du document: {}", e.getMessage(), e);
        }
    }
}
