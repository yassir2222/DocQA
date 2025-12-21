package com.docqa.indexeur.service;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

import com.docqa.indexeur.model.Document;
import com.docqa.indexeur.repository.DocumentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Arrays;
import java.util.List;

public class IndexingServiceTest {

    @InjectMocks
    private IndexingService indexingService;

    @Mock
    private DocumentRepository documentRepository;

    @Mock
    private EmbeddingService embeddingService;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testIndexDocument() {
        String docId = "DOC001";
        String filename = "test.pdf";
        String content = "Test medical content";
        String patientId = "P001";

        float[] embedding = {0.1f, 0.2f, 0.3f};
        when(embeddingService.generateEmbedding(content)).thenReturn(embedding);
        when(documentRepository.save(any(Document.class))).thenAnswer(i -> i.getArguments()[0]);

        indexingService.indexDocument(docId, filename, content, patientId);

        verify(embeddingService, times(1)).generateEmbedding(content);
        verify(documentRepository, times(1)).save(any(Document.class));
    }

    @Test
    public void testSearchWithLimit() {
        float[] queryEmbedding = {0.1f, 0.2f, 0.3f};
        when(embeddingService.generateEmbedding("test query")).thenReturn(queryEmbedding);

        Document doc1 = new Document();
        doc1.setId(1L);
        doc1.setContent("Content 1");
        doc1.setEmbedding(new double[]{0.1, 0.2, 0.3});

        Document doc2 = new Document();
        doc2.setId(2L);
        doc2.setContent("Content 2");
        doc2.setEmbedding(new double[]{0.2, 0.3, 0.4});

        when(documentRepository.findAll()).thenReturn(Arrays.asList(doc1, doc2));

        List<Document> results = indexingService.search("test query", 2);

        assertNotNull(results);
        assertTrue(results.size() <= 2);
        verify(embeddingService, times(1)).generateEmbedding("test query");
    }

    @Test
    public void testSearchWithPatientId() {
        float[] queryEmbedding = {0.1f, 0.2f, 0.3f};
        when(embeddingService.generateEmbedding("test")).thenReturn(queryEmbedding);

        Document doc1 = new Document();
        doc1.setId(1L);
        doc1.setPatientId("P001");
        doc1.setEmbedding(new double[]{0.1, 0.2, 0.3});

        Document doc2 = new Document();
        doc2.setId(2L);
        doc2.setPatientId("P002");
        doc2.setEmbedding(new double[]{0.2, 0.3, 0.4});

        when(documentRepository.findAll()).thenReturn(Arrays.asList(doc1, doc2));

        List<Document> results = indexingService.search("test", 10, "P001");

        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals("P001", results.get(0).getPatientId());
    }

    @Test
    public void testSearchEmptyDatabase() {
        float[] queryEmbedding = {0.1f, 0.2f, 0.3f};
        when(embeddingService.generateEmbedding("query")).thenReturn(queryEmbedding);
        when(documentRepository.findAll()).thenReturn(Arrays.asList());

        List<Document> results = indexingService.search("query", 10);

        assertNotNull(results);
        assertTrue(results.isEmpty());
    }
}
