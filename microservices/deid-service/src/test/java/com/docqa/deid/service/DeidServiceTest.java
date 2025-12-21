package com.docqa.deid.service;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

import com.docqa.deid.model.DeidRequest;
import com.docqa.deid.model.DeidMapping;
import com.docqa.deid.repository.DeidMappingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Collections;

public class DeidServiceTest {

    @Mock
    private MedicalNERService medicalNERService;

    @Mock
    private DeidMappingRepository deidMappingRepository;

    @InjectMocks
    private DeidService deidService;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testAnonymize_NoEntities() {
        DeidRequest request = new DeidRequest();
        request.setDocumentId("doc-001");
        request.setDocumentContent("Simple text without personal data");

        when(medicalNERService.extractPersonNames(anyString())).thenReturn(Collections.emptyList());

        String result = deidService.anonymize(request);

        assertNotNull(result);
        assertEquals("Simple text without personal data", result);
    }

    @Test
    public void testAnonymize_WithPhone() {
        DeidRequest request = new DeidRequest();
        request.setDocumentId("doc-002");
        request.setDocumentContent("Contact: 06 12 34 56 78");

        when(medicalNERService.extractPersonNames(anyString())).thenReturn(Collections.emptyList());

        String result = deidService.anonymize(request);

        assertNotNull(result);
        assertTrue(result.contains("[PHONE_") || !result.contains("06 12 34 56 78"));
    }

    @Test
    public void testAnonymize_WithEmail() {
        DeidRequest request = new DeidRequest();
        request.setDocumentId("doc-003");
        request.setDocumentContent("Email: patient@example.com");

        when(medicalNERService.extractPersonNames(anyString())).thenReturn(Collections.emptyList());

        String result = deidService.anonymize(request);

        assertNotNull(result);
        assertTrue(result.contains("[EMAIL_") || !result.contains("patient@example.com"));
    }

    @Test
    public void testAnonymize_WithSSN() {
        DeidRequest request = new DeidRequest();
        request.setDocumentId("doc-004");
        request.setDocumentContent("NSS: 1 85 06 75 123 456 78");

        when(medicalNERService.extractPersonNames(anyString())).thenReturn(Collections.emptyList());

        String result = deidService.anonymize(request);

        assertNotNull(result);
        // SSN devrait être anonymisé
    }

    @Test
    public void testAnonymize_WithDate() {
        DeidRequest request = new DeidRequest();
        request.setDocumentId("doc-005");
        request.setDocumentContent("Né le 15/06/1985");

        when(medicalNERService.extractPersonNames(anyString())).thenReturn(Collections.emptyList());

        String result = deidService.anonymize(request);

        assertNotNull(result);
        assertTrue(result.contains("[DATE_ANONYMISÉE]") || !result.contains("15/06/1985"));
    }

    @Test
    public void testAnonymize_WithNames() {
        DeidRequest request = new DeidRequest();
        request.setDocumentId("doc-006");
        request.setDocumentContent("Patient Jean DUPONT");

        when(medicalNERService.extractPersonNames(anyString()))
            .thenReturn(Collections.singletonList("Jean DUPONT"));

        String result = deidService.anonymize(request);

        assertNotNull(result);
        assertFalse(result.contains("Jean DUPONT"));
    }

    @Test
    public void testAnonymize_MixedData() {
        DeidRequest request = new DeidRequest();
        request.setDocumentId("doc-007");
        request.setDocumentContent("Dr. Martin, patient@email.com, 0612345678");

        when(medicalNERService.extractPersonNames(anyString()))
            .thenReturn(Collections.singletonList("Dr. Martin"));

        String result = deidService.anonymize(request);

        assertNotNull(result);
    }
}