package com.docqa.audit.dto;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;
import java.util.Arrays;
import java.util.List;

public class AuditLogDTOTest {

    @Test
    public void testAuditLogDTOCreation() {
        AuditLogDTO dto = new AuditLogDTO();
        assertNotNull(dto);
    }

    @Test
    public void testSetAction() {
        AuditLogDTO dto = new AuditLogDTO();
        dto.setAction("DOCUMENT_VIEW");
        assertEquals("DOCUMENT_VIEW", dto.getAction());
    }

    @Test
    public void testSetUserId() {
        AuditLogDTO dto = new AuditLogDTO();
        dto.setUserId("admin");
        assertEquals("admin", dto.getUserId());
    }

    @Test
    public void testSetService() {
        AuditLogDTO dto = new AuditLogDTO();
        dto.setService("api-gateway");
        assertEquals("api-gateway", dto.getService());
    }

    @Test
    public void testSetResourceType() {
        AuditLogDTO dto = new AuditLogDTO();
        dto.setResourceType("DOCUMENT");
        assertEquals("DOCUMENT", dto.getResourceType());
    }

    @Test
    public void testSetResourceId() {
        AuditLogDTO dto = new AuditLogDTO();
        dto.setResourceId("DOC456");
        assertEquals("DOC456", dto.getResourceId());
    }

    @Test
    public void testSetQueryText() {
        AuditLogDTO dto = new AuditLogDTO();
        dto.setQueryText("What is the treatment?");
        assertEquals("What is the treatment?", dto.getQueryText());
    }

    @Test
    public void testSetResponseSummary() {
        AuditLogDTO dto = new AuditLogDTO();
        dto.setResponseSummary("Treatment found");
        assertEquals("Treatment found", dto.getResponseSummary());
    }

    @Test
    public void testSetDocumentsAccessed() {
        AuditLogDTO dto = new AuditLogDTO();
        List<String> docs = Arrays.asList("doc1", "doc2", "doc3");
        dto.setDocumentsAccessed(docs);
        assertEquals(docs, dto.getDocumentsAccessed());
    }

    @Test
    public void testSetIpAddress() {
        AuditLogDTO dto = new AuditLogDTO();
        dto.setIpAddress("10.0.0.1");
        assertEquals("10.0.0.1", dto.getIpAddress());
    }

    @Test
    public void testSetUserAgent() {
        AuditLogDTO dto = new AuditLogDTO();
        dto.setUserAgent("Chrome/120");
        assertEquals("Chrome/120", dto.getUserAgent());
    }

    @Test
    public void testSetProcessingTimeMs() {
        AuditLogDTO dto = new AuditLogDTO();
        dto.setProcessingTimeMs(250);
        assertEquals(250, dto.getProcessingTimeMs());
    }

    @Test
    public void testSetStatus() {
        AuditLogDTO dto = new AuditLogDTO();
        dto.setStatus("SUCCESS");
        assertEquals("SUCCESS", dto.getStatus());
    }

    @Test
    public void testSetTimestamp() {
        AuditLogDTO dto = new AuditLogDTO();
        dto.setTimestamp("2024-01-15T10:30:00");
        assertEquals("2024-01-15T10:30:00", dto.getTimestamp());
    }

    @Test
    public void testNullValues() {
        AuditLogDTO dto = new AuditLogDTO();
        assertNull(dto.getAction());
        assertNull(dto.getUserId());
        assertNull(dto.getService());
        assertNull(dto.getTimestamp());
    }
}
