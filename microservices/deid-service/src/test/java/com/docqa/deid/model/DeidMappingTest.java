package com.docqa.deid.model;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;

public class DeidMappingTest {

    @Test
    public void testDefaultConstructor() {
        DeidMapping mapping = new DeidMapping();
        assertNotNull(mapping);
        assertNotNull(mapping.getCreatedAt());
    }

    @Test
    public void testParameterizedConstructor() {
        DeidMapping mapping = new DeidMapping("doc-001", "Jean DUPONT", "[PERSON_ABC]", "PERSON");
        
        assertEquals("doc-001", mapping.getDocumentId());
        assertEquals("Jean DUPONT", mapping.getOriginalValue());
        assertEquals("[PERSON_ABC]", mapping.getAnonymizedValue());
        assertEquals("PERSON", mapping.getEntityType());
        assertNotNull(mapping.getCreatedAt());
    }

    @Test
    public void testSetGetId() {
        DeidMapping mapping = new DeidMapping();
        mapping.setId(1L);
        assertEquals(1L, mapping.getId());
    }

    @Test
    public void testSetGetDocumentId() {
        DeidMapping mapping = new DeidMapping();
        mapping.setDocumentId("doc-123");
        assertEquals("doc-123", mapping.getDocumentId());
    }

    @Test
    public void testSetGetOriginalValue() {
        DeidMapping mapping = new DeidMapping();
        mapping.setOriginalValue("Original Value");
        assertEquals("Original Value", mapping.getOriginalValue());
    }

    @Test
    public void testSetGetAnonymizedValue() {
        DeidMapping mapping = new DeidMapping();
        mapping.setAnonymizedValue("[PSEUDO_123]");
        assertEquals("[PSEUDO_123]", mapping.getAnonymizedValue());
    }

    @Test
    public void testSetGetEntityType() {
        DeidMapping mapping = new DeidMapping();
        mapping.setEntityType("EMAIL");
        assertEquals("EMAIL", mapping.getEntityType());
    }

    @Test
    public void testEntityTypes() {
        String[] types = {"PERSON", "PHONE", "EMAIL", "SSN", "DATE", "ADDRESS", "IPP"};
        
        for (String type : types) {
            DeidMapping mapping = new DeidMapping();
            mapping.setEntityType(type);
            assertEquals(type, mapping.getEntityType());
        }
    }

    @Test
    public void testAllFieldsSet() {
        DeidMapping mapping = new DeidMapping();
        mapping.setId(1L);
        mapping.setDocumentId("doc-001");
        mapping.setOriginalValue("0612345678");
        mapping.setAnonymizedValue("[PHONE_ABC123]");
        mapping.setEntityType("PHONE");

        assertNotNull(mapping.getId());
        assertNotNull(mapping.getDocumentId());
        assertNotNull(mapping.getOriginalValue());
        assertNotNull(mapping.getAnonymizedValue());
        assertNotNull(mapping.getEntityType());
    }

    @Test
    public void testSetGetCreatedAt() {
        DeidMapping mapping = new DeidMapping();
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        mapping.setCreatedAt(now);
        assertEquals(now, mapping.getCreatedAt());
    }
}
