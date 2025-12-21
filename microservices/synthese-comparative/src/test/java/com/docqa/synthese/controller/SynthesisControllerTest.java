package com.docqa.synthese.controller;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

import com.docqa.synthese.dto.ComparisonRequest;
import com.docqa.synthese.dto.SynthesisRequest;
import com.docqa.synthese.dto.SynthesisResult;
import com.docqa.synthese.service.SynthesisService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import java.util.Arrays;
import java.util.Map;

public class SynthesisControllerTest {

    @InjectMocks
    private SynthesisController synthesisController;

    @Mock
    private SynthesisService synthesisService;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testGenerateSynthesis_Success() {
        SynthesisRequest request = new SynthesisRequest();
        request.setDocumentIds(Arrays.asList("doc1", "doc2"));
        request.setSynthesisType("SUMMARY");

        SynthesisResult result = new SynthesisResult();
        result.setId("synth-001");
        result.setSummary("Synthèse générée");

        when(synthesisService.generateSynthesis(any(SynthesisRequest.class))).thenReturn(result);

        ResponseEntity<SynthesisResult> response = synthesisController.generateSynthesis(request);

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals("synth-001", response.getBody().getId());
    }

    @Test
    public void testGenerateSynthesis_Error() {
        SynthesisRequest request = new SynthesisRequest();
        request.setSynthesisType("SUMMARY");

        when(synthesisService.generateSynthesis(any())).thenThrow(new RuntimeException("Error"));

        ResponseEntity<SynthesisResult> response = synthesisController.generateSynthesis(request);

        assertEquals(500, response.getStatusCode().value());
    }

    @Test
    public void testGenerateComparison_Success() {
        ComparisonRequest request = new ComparisonRequest();
        request.setPatientId1("P001");
        request.setPatientId2("P002");
        request.setDocumentIds1(Arrays.asList("doc1"));
        request.setDocumentIds2(Arrays.asList("doc2"));

        SynthesisResult result = new SynthesisResult();
        result.setId("comp-001");
        result.setSummary("Comparaison générée");

        when(synthesisService.generateComparison(any(ComparisonRequest.class))).thenReturn(result);

        ResponseEntity<SynthesisResult> response = synthesisController.generateComparison(request);

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
    }

    @Test
    public void testGenerateComparison_Error() {
        ComparisonRequest request = new ComparisonRequest();

        when(synthesisService.generateComparison(any())).thenThrow(new RuntimeException("Error"));

        ResponseEntity<SynthesisResult> response = synthesisController.generateComparison(request);

        assertEquals(500, response.getStatusCode().value());
    }

    @Test
    public void testGetSynthesisTypes() {
        ResponseEntity<Map<String, Object>> response = synthesisController.getSynthesisTypes();

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().containsKey("types"));
        assertTrue(response.getBody().containsKey("focus_options"));

        String[] types = (String[]) response.getBody().get("types");
        assertEquals(3, types.length);
    }

    @Test
    public void testGetComparisonTypes() {
        ResponseEntity<Map<String, Object>> response = synthesisController.getComparisonTypes();

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().containsKey("types"));
        assertTrue(response.getBody().containsKey("time_periods"));

        String[] types = (String[]) response.getBody().get("types");
        assertEquals(3, types.length);
    }
}
