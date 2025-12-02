package com.docqa.indexeur.service;

import ai.djl.inference.Predictor;
import ai.djl.repository.zoo.ZooModel;
import ai.djl.translate.TranslateException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class EmbeddingService {

    private static final Logger logger = LoggerFactory.getLogger(EmbeddingService.class);
    private final ZooModel<String, float[]> embeddingModel;

    @Autowired
    public EmbeddingService(ZooModel<String, float[]> embeddingModel) {
        this.embeddingModel = embeddingModel;
    }

    public float[] generateEmbedding(String text) {
        try (Predictor<String, float[]> predictor = embeddingModel.newPredictor()) {
            return predictor.predict(text);
        } catch (TranslateException e) {
            logger.error("Error generating embedding", e);
            throw new RuntimeException("Failed to generate embedding", e);
        }
    }
}
