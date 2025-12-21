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

public class SynthesisServiceTest {

    @InjectMocks
    private SynthesisService synthesisService;

    @Mock
    private LLMClientService llmClientService;

    @Mock
    private AuditClientService auditClientService;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testGenerateSynthesis_Summary() {
        SynthesisRequest request = new SynthesisRequest();
        request.setDocumentIds(Arrays.asList("DOC001", "DOC002"));
        request.setSynthesisType("SUMMARY");
        request.setUserId("user123");

        when(llmClientService.generateResponse(anyString()))
            .thenReturn("Résumé du dossier médical: Diagnostic d'hypertension.");

        doNothing().when(auditClientService).logAction(anyString(), anyString(), anyString(), anyString());

        SynthesisResult result = synthesisService.generateSynthesis(request);

        assertNotNull(result);
        assertNotNull(result.getId());
        assertEquals("SUMMARY", result.getType());
        assertNotNull(result.getSummary());
        verify(llmClientService, times(1)).generateResponse(anyString());
    }

    @Test
    public void testGenerateSynthesis_Evolution() {
        SynthesisRequest request = new SynthesisRequest();
        request.setDocumentIds(Arrays.asList("DOC001"));
        request.setSynthesisType("EVOLUTION");
        request.setUserId("doctor");

        when(llmClientService.generateResponse(anyString()))
            .thenReturn("- Point 1\n- Point 2\n- Point 3");

        doNothing().when(auditClientService).logAction(anyString(), anyString(), anyString(), anyString());

        SynthesisResult result = synthesisService.generateSynthesis(request);

        assertNotNull(result);
        assertEquals("EVOLUTION", result.getType());
        assertNotNull(result.getKeyPoints());
    }

    @Test
    public void testGenerateSynthesis_TreatmentHistory() {
        SynthesisRequest request = new SynthesisRequest();
        request.setDocumentIds(Arrays.asList("DOC001", "DOC002", "DOC003"));
        request.setSynthesisType("TREATMENT_HISTORY");
        request.setFocus("oncologie");
        request.setUserId("user");

        when(llmClientService.generateResponse(anyString()))
            .thenReturn("Historique des traitements oncologiques...");

        doNothing().when(auditClientService).logAction(anyString(), anyString(), anyString(), anyString());

        SynthesisResult result = synthesisService.generateSynthesis(request);

        assertNotNull(result);
        assertEquals("TREATMENT_HISTORY", result.getType());
    }

    @Test
    public void testGenerateComparison_Treatment() {
        ComparisonRequest request = new ComparisonRequest();
        request.setPatientId1("P001");
        request.setPatientId2("P002");
        request.setDocumentIds1(Arrays.asList("DOC1"));
        request.setDocumentIds2(Arrays.asList("DOC2"));
        request.setComparisonType("TREATMENT");
        request.setUserId("doctor");

        when(llmClientService.generateResponse(anyString()))
            .thenReturn("Comparaison des traitements: Patient 1 reçoit A, Patient 2 reçoit B.");

        doNothing().when(auditClientService).logAction(anyString(), anyString(), anyString(), anyString());

        SynthesisResult result = synthesisService.generateComparison(request);

        assertNotNull(result);
        assertTrue(result.getType().contains("COMPARISON"));
        assertNotNull(result.getStructuredData());
        assertEquals("P001", result.getStructuredData().get("patient1"));
    }

    @Test
    public void testGenerateComparison_Evolution() {
        ComparisonRequest request = new ComparisonRequest();
        request.setPatientId1("P001");
        request.setPatientId2("P002");
        request.setDocumentIds1(Arrays.asList("DOC1", "DOC2"));
        request.setDocumentIds2(Arrays.asList("DOC3"));
        request.setComparisonType("EVOLUTION");
        request.setUserId("user");

        when(llmClientService.generateResponse(anyString()))
            .thenReturn("Comparaison de l'évolution...");

        doNothing().when(auditClientService).logAction(anyString(), anyString(), anyString(), anyString());

        SynthesisResult result = synthesisService.generateComparison(request);

        assertNotNull(result);
        assertEquals(3, result.getSourceDocuments().size());
    }

    @Test
    public void testGenerateComparison_Diagnosis() {
        ComparisonRequest request = new ComparisonRequest();
        request.setPatientId1("P001");
        request.setPatientId2("P002");
        request.setDocumentIds1(Arrays.asList("DOC1"));
        request.setDocumentIds2(Arrays.asList("DOC2"));
        request.setComparisonType("DIAGNOSIS");
        request.setUserId("user");

        when(llmClientService.generateResponse(anyString()))
            .thenReturn("Comparaison des diagnostics...");

        doNothing().when(auditClientService).logAction(anyString(), anyString(), anyString(), anyString());

        SynthesisResult result = synthesisService.generateComparison(request);

        assertNotNull(result);
        assertNotNull(result.getGeneratedAt());
        assertTrue(result.getProcessingTimeMs() >= 0);
    }
}
