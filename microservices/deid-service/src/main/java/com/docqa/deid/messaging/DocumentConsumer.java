package com.docqa.deid.messaging;

import com.docqa.deid.model.DeidRequest;
import com.docqa.deid.service.DeidService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Map;

/**
 * Consumer RabbitMQ pour traiter les documents reçus depuis DocIngestor
 */
@Component
public class DocumentConsumer {

    private static final Logger logger = LoggerFactory.getLogger(DocumentConsumer.class);
    
    private final DeidService deidService;
    private final DocumentPublisher documentPublisher;
    private final ObjectMapper objectMapper;

    @Autowired
    public DocumentConsumer(DeidService deidService, DocumentPublisher documentPublisher, ObjectMapper objectMapper) {
        this.deidService = deidService;
        this.documentPublisher = documentPublisher;
        this.objectMapper = objectMapper;
    }

    @RabbitListener(queues = "${app.queue.input}")
    public void receiveDocument(Message message) {
        try {
            logger.info("📥 Document reçu pour anonymisation");
            
            // Convertir les bytes en String puis en Map
            String jsonContent = new String(message.getBody(), StandardCharsets.UTF_8);
            Map<String, Object> payload = objectMapper.readValue(jsonContent, new TypeReference<Map<String, Object>>() {});
            
            String documentId = String.valueOf(payload.get("document_id"));
            String filename = (String) payload.get("filename");
            String textContent = (String) payload.get("text_content");
            @SuppressWarnings("unchecked")
            Map<String, Object> metadata = (Map<String, Object>) payload.get("metadata");
            
            logger.info("🔄 Anonymisation du document: {} (ID: {})", filename, documentId);
            
            // Créer la requête d'anonymisation
            DeidRequest request = new DeidRequest();
            request.setDocumentContent(textContent);
            request.setDocumentId(documentId);
            request.setFilename(filename);
            
            // Anonymiser le document
            String anonymizedContent = deidService.anonymize(request);
            
            logger.info("✅ Document anonymisé: {} caractères -> {} caractères", 
                    textContent.length(), anonymizedContent.length());
            
            // Publier vers l'IndexeurSémantique
            documentPublisher.publishAnonymizedDocument(
                documentId, 
                filename, 
                anonymizedContent, 
                metadata
            );
            
        } catch (Exception e) {
            logger.error("❌ Erreur lors du traitement du document: {}", e.getMessage(), e);
        }
    }
}
