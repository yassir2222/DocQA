package com.docqa.indexeur.service;

import com.docqa.indexeur.model.Document;
import com.docqa.indexeur.repository.DocumentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class IndexingService {

    private static final Logger logger = LoggerFactory.getLogger(IndexingService.class);
    private final DocumentRepository documentRepository;
    private final EmbeddingService embeddingService;

    @Autowired
    public IndexingService(DocumentRepository documentRepository, EmbeddingService embeddingService) {
        this.documentRepository = documentRepository;
        this.embeddingService = embeddingService;
    }

    public void indexDocument(String originalDocId, String filename, String content) {
        logger.info("Indexing document: {}", filename);

        // Generate embedding
        float[] embeddingFloat = embeddingService.generateEmbedding(content);

        // Convert float[] to double[] for storage
        double[] embeddingDouble = new double[embeddingFloat.length];
        for (int i = 0; i < embeddingFloat.length; i++) {
            embeddingDouble[i] = embeddingFloat[i];
        }

        Document document = new Document();
        document.setOriginalDocId(originalDocId);
        document.setFilename(filename);
        document.setContent(content);
        document.setEmbedding(embeddingDouble);

        documentRepository.save(document);
        logger.info("Document indexed successfully: {}", filename);
    }

    public List<Document> search(String query, int limit) {
        // Simple cosine similarity search (in-memory for now, can be optimized with
        // pgvector)
        float[] queryEmbedding = embeddingService.generateEmbedding(query);

        List<Document> allDocs = documentRepository.findAll();

        return allDocs.stream()
                .sorted((d1, d2) -> Double.compare(
                        cosineSimilarity(queryEmbedding, d2.getEmbedding()),
                        cosineSimilarity(queryEmbedding, d1.getEmbedding())))
                .limit(limit)
                .collect(Collectors.toList());
    }

    private double cosineSimilarity(float[] vectorA, double[] vectorB) {
        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;
        for (int i = 0; i < vectorA.length; i++) {
            dotProduct += vectorA[i] * vectorB[i];
            normA += Math.pow(vectorA[i], 2);
            normB += Math.pow(vectorB[i], 2);
        }
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}
