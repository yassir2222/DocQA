package com.docqa.synthese.service;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

import com.docqa.synthese.dto.ComparisonRequest;
import com.docqa.synthese.dto.SynthesisRequest;
import com.docqa.synthese.dto.SynthesisResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Arrays;
import java.util.List;

public class SynthesisServiceExtendedTest {

    @Mock
    private LLMClientService llmClientService;

    @Mock
    private AuditClientService auditClientService;

    @InjectMocks
    private SynthesisService synthesisService;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testGenerateSynthesis_Summary() {
        SynthesisRequest request = new SynthesisRequest();
        request.setDocumentIds(Arrays.asList("doc1", "doc2"));
        request.setSynthesisType("SUMMARY");
        request.setUserId("user123");
        
        when(llmClientService.generateResponse(anyString())).thenReturn("Synthèse générée");

        SynthesisResult result = synthesisService.generateSynthesis(request);

        assertNotNull(result);
        assertNotNull(result.getId());
        assertEquals("SUMMARY", result.getType());
        assertNotNull(result.getSummary());
    }

    @Test
    public void testGenerateSynthesis_Evolution() {
        SynthesisRequest request = new SynthesisRequest();
        request.setDocumentIds(Arrays.asList("doc1"));
        request.setSynthesisType("EVOLUTION");
        request.setUserId("user123");
        
        when(llmClientService.generateResponse(anyString())).thenReturn("Évolution du patient");

        SynthesisResult result = synthesisService.generateSynthesis(request);

        assertNotNull(result);
        assertEquals("EVOLUTION", result.getType());
    }

    @Test
    public void testGenerateSynthesis_TreatmentHistory() {
        SynthesisRequest request = new SynthesisRequest();
        request.setDocumentIds(Arrays.asList("doc1", "doc2", "doc3"));
        request.setSynthesisType("TREATMENT_HISTORY");
        request.setUserId("user123");
        request.setFocus("traitements");
        
        when(llmClientService.generateResponse(anyString())).thenReturn("Historique des traitements");

        SynthesisResult result = synthesisService.generateSynthesis(request);

        assertNotNull(result);
        assertEquals("TREATMENT_HISTORY", result.getType());
    }

    @Test
    public void testGenerateComparison_Treatment() {
        ComparisonRequest request = new ComparisonRequest();
        request.setPatientId1("patient1");
        request.setPatientId2("patient2");
        request.setDocumentIds1(Arrays.asList("doc1"));
        request.setDocumentIds2(Arrays.asList("doc2"));
        request.setComparisonType("TREATMENT");
        request.setUserId("user123");
        
        when(llmClientService.generateResponse(anyString())).thenReturn("Comparaison des traitements");

        SynthesisResult result = synthesisService.generateComparison(request);

        assertNotNull(result);
        assertTrue(result.getType().contains("COMPARISON"));
    }

    @Test
    public void testGenerateComparison_Evolution() {
        ComparisonRequest request = new ComparisonRequest();
        request.setPatientId1("patient1");
        request.setPatientId2("patient2");
        request.setDocumentIds1(Arrays.asList("doc1", "doc2"));
        request.setDocumentIds2(Arrays.asList("doc3"));
        request.setComparisonType("EVOLUTION");
        request.setUserId("user123");
        
        when(llmClientService.generateResponse(anyString())).thenReturn("Comparaison évolution");

        SynthesisResult result = synthesisService.generateComparison(request);

        assertNotNull(result);
    }

    @Test
    public void testGenerateSynthesis_WithError() {
        SynthesisRequest request = new SynthesisRequest();
        request.setDocumentIds(Arrays.asList("doc1"));
        request.setSynthesisType("SUMMARY");
        request.setUserId("user123");
        
        when(llmClientService.generateResponse(anyString()))
            .thenThrow(new RuntimeException("LLM Error"));

        assertThrows(RuntimeException.class, () -> {
            synthesisService.generateSynthesis(request);
        });
    }

    @Test
    public void testGenerateComparison_WithError() {
        ComparisonRequest request = new ComparisonRequest();
        request.setPatientId1("patient1");
        request.setPatientId2("patient2");
        request.setDocumentIds1(Arrays.asList("doc1"));
        request.setDocumentIds2(Arrays.asList("doc2"));
        request.setComparisonType("DIAGNOSIS");
        request.setUserId("user123");
        
        when(llmClientService.generateResponse(anyString()))
            .thenThrow(new RuntimeException("Comparison Error"));

        assertThrows(RuntimeException.class, () -> {
            synthesisService.generateComparison(request);
        });
    }
}
