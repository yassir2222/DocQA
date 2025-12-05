package com.docqa.indexeur.messaging;

import com.docqa.indexeur.service.IndexingService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Map;

@Component
public class DocumentConsumer {

    private static final Logger logger = LoggerFactory.getLogger(DocumentConsumer.class);
    private final IndexingService indexingService;
    private final ObjectMapper objectMapper;

    @Autowired
    public DocumentConsumer(IndexingService indexingService, ObjectMapper objectMapper) {
        this.indexingService = indexingService;
        this.objectMapper = objectMapper;
    }

    @RabbitListener(queues = "${app.queue.input}")
    public void receiveMessage(Message message) {
        try {
            String rawMessage = new String(message.getBody(), StandardCharsets.UTF_8);
            logger.info("Received raw message: {}", rawMessage);
            
            // Handle double-encoded JSON (if the message is a JSON string wrapped in quotes)
            String jsonContent = rawMessage;
            if (rawMessage.startsWith("\"") && rawMessage.endsWith("\"")) {
                jsonContent = objectMapper.readValue(rawMessage, String.class);
            }
            
            Map<String, Object> payload = objectMapper.readValue(jsonContent, Map.class);

            String docId = String.valueOf(payload.get("document_id"));
            String filename = (String) payload.get("filename");
            String content = (String) payload.get("text_content");
            
            // Extract patient_id from metadata
            String patientId = null;
            if (payload.containsKey("metadata")) {
                Map<String, Object> metadata = (Map<String, Object>) payload.get("metadata");
                patientId = (String) metadata.get("patient_id");
            }
            
            logger.info("Processing document: id={}, filename={}, patientId={}", docId, filename, patientId);
            indexingService.indexDocument(docId, filename, content, patientId);
            logger.info("Document indexed successfully: {}", docId);

        } catch (Exception e) {
            logger.error("Error processing message", e);
        }
    }
}
