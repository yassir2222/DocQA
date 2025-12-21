package com.docqa.audit.model;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

public class AuditLogTest {

    @Test
    public void testDefaultConstructor() {
        AuditLog log = new AuditLog();
        assertNotNull(log);
    }

    @Test
    public void testSetGetId() {
        AuditLog log = new AuditLog();
        log.setId(1L);
        assertEquals(1L, log.getId());
    }

    @Test
    public void testSetGetUserId() {
        AuditLog log = new AuditLog();
        log.setUserId("user123");
        assertEquals("user123", log.getUserId());
    }

    @Test
    public void testSetGetAction() {
        AuditLog log = new AuditLog();
        log.setAction("DOCUMENT_UPLOAD");
        assertEquals("DOCUMENT_UPLOAD", log.getAction());
    }

    @Test
    public void testSetGetResourceType() {
        AuditLog log = new AuditLog();
        log.setResourceType("document");
        assertEquals("document", log.getResourceType());
    }

    @Test
    public void testSetGetResourceId() {
        AuditLog log = new AuditLog();
        log.setResourceId("doc-001");
        assertEquals("doc-001", log.getResourceId());
    }

    @Test
    public void testSetGetQueryText() {
        AuditLog log = new AuditLog();
        log.setQueryText("Some query text");
        assertEquals("Some query text", log.getQueryText());
    }

    @Test
    public void testSetGetResponseSummary() {
        AuditLog log = new AuditLog();
        log.setResponseSummary("Response summary");
        assertEquals("Response summary", log.getResponseSummary());
    }

    @Test
    public void testSetGetDocumentsAccessed() {
        AuditLog log = new AuditLog();
        log.setDocumentsAccessed("[\"doc1\",\"doc2\"]");
        assertEquals("[\"doc1\",\"doc2\"]", log.getDocumentsAccessed());
    }

    @Test
    public void testSetGetIpAddress() {
        AuditLog log = new AuditLog();
        log.setIpAddress("192.168.1.1");
        assertEquals("192.168.1.1", log.getIpAddress());
    }

    @Test
    public void testSetGetUserAgent() {
        AuditLog log = new AuditLog();
        log.setUserAgent("Mozilla/5.0");
        assertEquals("Mozilla/5.0", log.getUserAgent());
    }

    @Test
    public void testSetGetProcessingTimeMs() {
        AuditLog log = new AuditLog();
        log.setProcessingTimeMs(150);
        assertEquals(150, log.getProcessingTimeMs());
    }

    @Test
    public void testSetGetService() {
        AuditLog log = new AuditLog();
        log.setService("api-gateway");
        assertEquals("api-gateway", log.getService());
    }

    @Test
    public void testSetGetStatus() {
        AuditLog log = new AuditLog();
        log.setStatus("SUCCESS");
        assertEquals("SUCCESS", log.getStatus());
    }

    @Test
    public void testSetGetErrorMessage() {
        AuditLog log = new AuditLog();
        log.setErrorMessage("Error occurred");
        assertEquals("Error occurred", log.getErrorMessage());
    }

    @Test
    public void testSetGetCreatedAt() {
        AuditLog log = new AuditLog();
        LocalDateTime now = LocalDateTime.now();
        log.setCreatedAt(now);
        assertEquals(now, log.getCreatedAt());
    }

    @Test
    public void testOnCreate() {
        AuditLog log = new AuditLog();
        log.onCreate();
        
        assertNotNull(log.getCreatedAt());
        assertEquals("SUCCESS", log.getStatus());
    }

    @Test
    public void testOnCreate_StatusAlreadySet() {
        AuditLog log = new AuditLog();
        log.setStatus("ERROR");
        log.onCreate();
        
        assertEquals("ERROR", log.getStatus());
    }

    @Test
    public void testAllFieldsSet() {
        AuditLog log = new AuditLog();
        log.setId(1L);
        log.setUserId("user123");
        log.setAction("QUERY");
        log.setResourceType("document");
        log.setResourceId("doc-001");
        log.setQueryText("Query");
        log.setResponseSummary("Summary");
        log.setDocumentsAccessed("[\"doc1\"]");
        log.setIpAddress("127.0.0.1");
        log.setUserAgent("Test UA");
        log.setProcessingTimeMs(100);
        log.setService("test-service");
        log.setStatus("SUCCESS");
        log.setErrorMessage(null);
        log.setCreatedAt(LocalDateTime.now());

        assertEquals(1L, log.getId());
        assertEquals("user123", log.getUserId());
        assertEquals("QUERY", log.getAction());
    }
}
