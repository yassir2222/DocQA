package com.docqa.deid.controller;

import com.docqa.deid.model.DeidRequest;
import com.docqa.deid.service.DeidService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class DeidControllerTest {

    @InjectMocks
    private DeidController deidController;

    @Mock
    private DeidService deidService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testAnonymizeDocument() {
        DeidRequest request = new DeidRequest();
        request.setDocumentContent("Patient John Doe was treated.");

        when(deidService.anonymize(any(DeidRequest.class)))
            .thenReturn("Patient PERSON_12345678 was treated.");

        ResponseEntity<?> response = deidController.anonymizeDocument(request);

        verify(deidService, times(1)).anonymize(request);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Patient PERSON_12345678 was treated.", response.getBody());
    }

    @Test
    void testAnonymizeDocument_Error() {
        DeidRequest request = new DeidRequest();
        request.setDocumentContent("Test content");

        when(deidService.anonymize(any(DeidRequest.class)))
            .thenThrow(new RuntimeException("Test error"));

        ResponseEntity<?> response = deidController.anonymizeDocument(request);

        verify(deidService, times(1)).anonymize(request);
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertTrue(response.getBody().toString().contains("An error occurred during anonymization"));
    }
}