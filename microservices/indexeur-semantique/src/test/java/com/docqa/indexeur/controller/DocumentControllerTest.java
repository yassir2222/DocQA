package com.docqa.indexeur.controller;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

import com.docqa.indexeur.model.Document;
import com.docqa.indexeur.repository.DocumentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.*;

public class DocumentControllerTest {

    @InjectMocks
    private DocumentController documentController;

    @Mock
    private DocumentRepository documentRepository;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testGetDocumentById_Found() {
        Document doc = new Document();
        doc.setId(1L);
        doc.setFilename("test.pdf");
        doc.setContent("Document content");
        doc.setPatientId("P001");
        doc.setOriginalDocId("orig-001");
        doc.setIndexedAt(LocalDateTime.now());

        when(documentRepository.findAll()).thenReturn(Collections.singletonList(doc));

        ResponseEntity<Map<String, Object>> response = documentController.getDocumentById("orig-001");

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals("test.pdf", response.getBody().get("filename"));
    }

    @Test
    public void testGetDocumentById_NotFound() {
        when(documentRepository.findAll()).thenReturn(Collections.emptyList());

        ResponseEntity<Map<String, Object>> response = documentController.getDocumentById("unknown");

        assertEquals(404, response.getStatusCode().value());
    }

    @Test
    public void testGetDocumentById_ByInternalId() {
        Document doc = new Document();
        doc.setId(1L);
        doc.setFilename("test.pdf");

        when(documentRepository.findAll()).thenReturn(Collections.emptyList());
        when(documentRepository.findById(1L)).thenReturn(Optional.of(doc));

        ResponseEntity<Map<String, Object>> response = documentController.getDocumentById("1");

        assertEquals(200, response.getStatusCode().value());
    }

    @Test
    public void testGetAllDocuments() {
        Document doc1 = new Document();
        doc1.setId(1L);
        doc1.setFilename("doc1.pdf");
        
        Document doc2 = new Document();
        doc2.setId(2L);
        doc2.setFilename("doc2.pdf");

        when(documentRepository.findAll()).thenReturn(Arrays.asList(doc1, doc2));

        ResponseEntity<Map<String, Object>> response = documentController.getAllDocuments(null);

        assertEquals(200, response.getStatusCode().value());
        assertEquals(2, response.getBody().get("total"));
    }

    @Test
    public void testGetAllDocuments_FilterByPatient() {
        Document doc1 = new Document();
        doc1.setId(1L);
        doc1.setPatientId("P001");
        
        Document doc2 = new Document();
        doc2.setId(2L);
        doc2.setPatientId("P002");

        when(documentRepository.findAll()).thenReturn(Arrays.asList(doc1, doc2));

        ResponseEntity<Map<String, Object>> response = documentController.getAllDocuments("P001");

        assertEquals(200, response.getStatusCode().value());
        assertEquals(1, response.getBody().get("total"));
    }

    @Test
    public void testGetDocumentsByIds_Success() {
        Document doc = new Document();
        doc.setId(1L);
        doc.setFilename("test.pdf");

        Map<String, Object> request = new HashMap<>();
        request.put("ids", Arrays.asList(1));

        when(documentRepository.findAllById(anyList())).thenReturn(Collections.singletonList(doc));

        ResponseEntity<Map<String, Object>> response = documentController.getDocumentsByIds(request);

        assertEquals(200, response.getStatusCode().value());
        assertEquals(1, response.getBody().get("total"));
    }

    @Test
    public void testGetDocumentsByIds_EmptyIds() {
        Map<String, Object> request = new HashMap<>();
        request.put("ids", Collections.emptyList());

        ResponseEntity<Map<String, Object>> response = documentController.getDocumentsByIds(request);

        assertEquals(400, response.getStatusCode().value());
    }

    @Test
    public void testGetDocumentsByIds_NullIds() {
        Map<String, Object> request = new HashMap<>();

        ResponseEntity<Map<String, Object>> response = documentController.getDocumentsByIds(request);

        assertEquals(400, response.getStatusCode().value());
    }
}
