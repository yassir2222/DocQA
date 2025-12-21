package com.docqa.deid.model;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;

public class DeidRequestTest {

    @Test
    public void testDeidRequestCreation() {
        DeidRequest request = new DeidRequest();
        assertNotNull(request);
    }

    @Test
    public void testDeidRequestWithContent() {
        DeidRequest request = new DeidRequest("Test content");
        assertEquals("Test content", request.getDocumentContent());
    }

    @Test
    public void testSetDocumentContent() {
        DeidRequest request = new DeidRequest();
        request.setDocumentContent("Test content");
        assertEquals("Test content", request.getDocumentContent());
    }

    @Test
    public void testSetDocumentId() {
        DeidRequest request = new DeidRequest();
        request.setDocumentId("DOC123");
        assertEquals("DOC123", request.getDocumentId());
    }

    @Test
    public void testSetFilename() {
        DeidRequest request = new DeidRequest();
        request.setFilename("document.pdf");
        assertEquals("document.pdf", request.getFilename());
    }

    @Test
    public void testNullContent() {
        DeidRequest request = new DeidRequest();
        assertNull(request.getDocumentContent());
    }

    @Test
    public void testNullDocumentId() {
        DeidRequest request = new DeidRequest();
        assertNull(request.getDocumentId());
    }

    @Test
    public void testNullFilename() {
        DeidRequest request = new DeidRequest();
        assertNull(request.getFilename());
    }
}
