package com.docqa.synthese.service;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class LLMClientServiceTest {

    private LLMClientService llmClientService;

    @BeforeEach
    public void setUp() {
        llmClientService = new LLMClientService();
    }

    @Test
    public void testGenerateResponse_FallbackSynthesis() {
        String prompt = "Génère une synthèse du dossier médical";
        
        String result = llmClientService.generateResponse(prompt);
        
        assertNotNull(result);
        assertTrue(result.contains("Synthèse") || result.contains("Analyse"));
    }

    @Test
    public void testGenerateResponse_FallbackComparison() {
        String prompt = "Fais une comparaison des deux patients";
        
        String result = llmClientService.generateResponse(prompt);
        
        assertNotNull(result);
        assertTrue(result.contains("Comparaison") || result.contains("Analyse"));
    }

    @Test
    public void testGenerateResponse_FallbackGeneric() {
        String prompt = "Analyse ce document";
        
        String result = llmClientService.generateResponse(prompt);
        
        assertNotNull(result);
        assertTrue(!result.isEmpty());
    }

    @Test
    public void testGenerateResponse_EmptyPrompt() {
        String prompt = "";
        
        String result = llmClientService.generateResponse(prompt);
        
        assertNotNull(result);
    }

    @Test
    public void testGenerateResponse_LongPrompt() {
        String prompt = "a".repeat(5000);
        
        String result = llmClientService.generateResponse(prompt);
        
        assertNotNull(result);
    }

    @Test
    public void testGenerateResponse_ResumeSynthese() {
        String prompt = "Faire un résumé global";
        
        String result = llmClientService.generateResponse(prompt);
        
        assertNotNull(result);
        assertTrue(result.contains("Synthèse") || result.contains("Analyse"));
    }
}
