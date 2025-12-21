package com.docqa.indexeur.service;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

import ai.djl.inference.Predictor;
import ai.djl.repository.zoo.ZooModel;
import ai.djl.translate.TranslateException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

public class EmbeddingServiceTest {

    @Mock
    private ZooModel<String, float[]> embeddingModel;

    @Mock
    private Predictor<String, float[]> predictor;

    private EmbeddingService embeddingService;

    @BeforeEach
    public void setUp() throws Exception {
        MockitoAnnotations.openMocks(this);
        when(embeddingModel.newPredictor()).thenReturn(predictor);
        embeddingService = new EmbeddingService(embeddingModel);
    }

    @Test
    public void testGenerateEmbedding_Success() throws TranslateException {
        float[] expectedEmbedding = {0.1f, 0.2f, 0.3f, 0.4f};
        when(predictor.predict("test text")).thenReturn(expectedEmbedding);

        float[] result = embeddingService.generateEmbedding("test text");

        assertNotNull(result);
        assertEquals(4, result.length);
        assertEquals(0.1f, result[0], 0.001);
    }

    @Test
    public void testGenerateEmbedding_EmptyText() throws TranslateException {
        float[] expectedEmbedding = {0.0f, 0.0f};
        when(predictor.predict("")).thenReturn(expectedEmbedding);

        float[] result = embeddingService.generateEmbedding("");

        assertNotNull(result);
    }

    @Test
    public void testGenerateEmbedding_LongText() throws TranslateException {
        String longText = "a".repeat(1000);
        float[] expectedEmbedding = {0.5f, 0.5f};
        when(predictor.predict(longText)).thenReturn(expectedEmbedding);

        float[] result = embeddingService.generateEmbedding(longText);

        assertNotNull(result);
    }

    @Test
    public void testGenerateEmbedding_Error() throws TranslateException {
        when(predictor.predict(anyString())).thenThrow(new TranslateException("Error"));

        assertThrows(RuntimeException.class, () -> {
            embeddingService.generateEmbedding("test");
        });
    }
}
