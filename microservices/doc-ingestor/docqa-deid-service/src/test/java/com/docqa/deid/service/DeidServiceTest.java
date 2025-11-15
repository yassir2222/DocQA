package com.docqa.deid.service;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

import com.docqa.deid.model.DeidRequest;
import com.docqa.deid.model.Pseudonym;
import com.docqa.deid.repository.PseudonymRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Arrays;
import java.util.Collections;

public class DeidServiceTest {

    @InjectMocks
    private DeidService deidService;

    @Mock
    private NERService nerService;

    @Mock
    private PseudonymService pseudonymService;

    @Mock
    private PseudonymRepository pseudonymRepository;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testAnonymize() {
        DeidRequest request = new DeidRequest();
        request.setDocumentContent("Patient John Doe was treated by Dr. Jane Smith.");

        // Mock NER service to extract names
        when(nerService.extractSensitiveData("Patient John Doe was treated by Dr. Jane Smith."))
            .thenReturn(Arrays.asList("John Doe", "Jane Smith"));

        // Mock pseudonym service to create pseudonyms
        Pseudonym pseudonym1 = new Pseudonym("John Doe", "PERSON_12345678");
        Pseudonym pseudonym2 = new Pseudonym("Jane Smith", "PERSON_87654321");

        when(pseudonymService.createPseudonym(any(Pseudonym.class)))
            .thenReturn(pseudonym1, pseudonym2);

        // Execute
        String result = deidService.anonymize(request);

        // Verify
        assertNotNull(result);
        assertFalse(result.contains("John Doe"));
        assertFalse(result.contains("Jane Smith"));
        assertTrue(result.contains("PERSON_"));

        verify(nerService, times(1)).extractSensitiveData(anyString());
        verify(pseudonymService, times(2)).createPseudonym(any(Pseudonym.class));
    }

    @Test
    public void testAnonymize_NoSensitiveData() {
        DeidRequest request = new DeidRequest();
        request.setDocumentContent("This is a test document with no names.");

        when(nerService.extractSensitiveData(anyString()))
            .thenReturn(Collections.emptyList());

        String result = deidService.anonymize(request);

        assertNotNull(result);
        assertEquals("This is a test document with no names.", result);

        verify(nerService, times(1)).extractSensitiveData(anyString());
        verify(pseudonymService, never()).createPseudonym(any(Pseudonym.class));
    }
}