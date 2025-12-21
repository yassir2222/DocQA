package com.docqa.deid.controller;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

import com.docqa.deid.model.DeidMapping;
import com.docqa.deid.model.DeidRequest;
import com.docqa.deid.repository.DeidMappingRepository;
import com.docqa.deid.service.DeidService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

public class DeidControllerTest {

    @InjectMocks
    private DeidController deidController;

    @Mock
    private DeidService deidService;

    @Mock
    private DeidMappingRepository deidMappingRepository;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testAnonymizeDocument_Success() {
        DeidRequest request = new DeidRequest();
        request.setDocumentId("doc-001");
        request.setDocumentContent("Patient Jean DUPONT");

        String result = "Patient [PERSON_ABC]";

        when(deidService.anonymize(any(DeidRequest.class))).thenReturn(result);

        ResponseEntity<?> response = deidController.anonymizeDocument(request);

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
    }

    @Test
    public void testAnonymizeDocument_Error() {
        DeidRequest request = new DeidRequest();

        when(deidService.anonymize(any())).thenThrow(new RuntimeException("Error"));

        ResponseEntity<?> response = deidController.anonymizeDocument(request);

        assertEquals(500, response.getStatusCode().value());
    }

    @Test
    public void testGetMappings_Success() {
        String documentId = "doc-001";
        DeidMapping mapping = new DeidMapping(documentId, "Jean DUPONT", "[PERSON_ABC]", "PERSON");

        when(deidMappingRepository.findByDocumentId(documentId))
            .thenReturn(Arrays.asList(mapping));

        ResponseEntity<Map<String, Object>> response = deidController.getMappings(documentId);

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals(true, response.getBody().get("success"));
        assertEquals(documentId, response.getBody().get("documentId"));
        assertEquals(1, response.getBody().get("count"));
    }

    @Test
    public void testGetMappings_Empty() {
        String documentId = "doc-unknown";

        when(deidMappingRepository.findByDocumentId(documentId))
            .thenReturn(Collections.emptyList());

        ResponseEntity<Map<String, Object>> response = deidController.getMappings(documentId);

        assertEquals(200, response.getStatusCode().value());
        assertEquals(0, response.getBody().get("count"));
    }

    @Test
    public void testGetMappings_Error() {
        String documentId = "doc-001";

        when(deidMappingRepository.findByDocumentId(documentId))
            .thenThrow(new RuntimeException("DB Error"));

        ResponseEntity<Map<String, Object>> response = deidController.getMappings(documentId);

        assertEquals(500, response.getStatusCode().value());
        assertEquals(false, response.getBody().get("success"));
    }
}