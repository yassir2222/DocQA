package com.docqa.audit.dto;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;
import java.util.HashMap;
import java.util.Map;

public class AuditStatsDTOTest {

    @Test
    public void testAuditStatsDTOCreation() {
        AuditStatsDTO dto = new AuditStatsDTO();
        assertNotNull(dto);
    }

    @Test
    public void testSetTotalLogs() {
        AuditStatsDTO dto = new AuditStatsDTO();
        dto.setTotalLogs(100L);
        assertEquals(100L, dto.getTotalLogs());
    }

    @Test
    public void testSetErrorCount() {
        AuditStatsDTO dto = new AuditStatsDTO();
        dto.setErrorCount(5L);
        assertEquals(5L, dto.getErrorCount());
    }

    @Test
    public void testSetLogsByAction() {
        AuditStatsDTO dto = new AuditStatsDTO();
        Map<String, Long> byAction = new HashMap<>();
        byAction.put("DOCUMENT_UPLOAD", 50L);
        byAction.put("DOCUMENT_VIEW", 30L);
        dto.setLogsByAction(byAction);
        
        assertEquals(byAction, dto.getLogsByAction());
        assertEquals(50L, dto.getLogsByAction().get("DOCUMENT_UPLOAD"));
    }

    @Test
    public void testSetLogsByService() {
        AuditStatsDTO dto = new AuditStatsDTO();
        Map<String, Long> byService = new HashMap<>();
        byService.put("doc-ingestor", 40L);
        byService.put("api-gateway", 60L);
        dto.setLogsByService(byService);
        
        assertEquals(byService, dto.getLogsByService());
        assertEquals(40L, dto.getLogsByService().get("doc-ingestor"));
    }

    @Test
    public void testSetAverageProcessingTimeByService() {
        AuditStatsDTO dto = new AuditStatsDTO();
        Map<String, Double> avgTime = new HashMap<>();
        avgTime.put("doc-ingestor", 150.5);
        avgTime.put("llm-qa", 500.0);
        dto.setAverageProcessingTimeByService(avgTime);
        
        assertEquals(avgTime, dto.getAverageProcessingTimeByService());
        assertEquals(150.5, dto.getAverageProcessingTimeByService().get("doc-ingestor"));
    }

    @Test
    public void testDefaultValues() {
        AuditStatsDTO dto = new AuditStatsDTO();
        assertNull(dto.getTotalLogs());
        assertNull(dto.getErrorCount());
        assertNull(dto.getLogsByAction());
        assertNull(dto.getLogsByService());
    }
}
