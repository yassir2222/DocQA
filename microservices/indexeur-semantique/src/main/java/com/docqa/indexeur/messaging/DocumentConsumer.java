package com.docqa.indexeur.messaging;

import com.docqa.indexeur.service.IndexingService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

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
    public void receiveMessage(String message) {
        try {
            logger.info("Received message: {}", message);
            Map<String, Object> payload = objectMapper.readValue(message, Map.class);

            String docId = String.valueOf(payload.get("document_id"));
            String filename = (String) payload.get("filename");
            String content = (String) payload.get("text_content");

            indexingService.indexDocument(docId, filename, content);

        } catch (Exception e) {
            logger.error("Error processing message", e);
        }
    }
}
