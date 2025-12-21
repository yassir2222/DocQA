package com.docqa.indexeur.model;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

public class DocumentTest {

    @Test
    public void testDefaultConstructor() {
        Document doc = new Document();
        assertNotNull(doc);
    }

    @Test
    public void testSetGetId() {
        Document doc = new Document();
        doc.setId(1L);
        assertEquals(1L, doc.getId());
    }

    @Test
    public void testSetGetFilename() {
        Document doc = new Document();
        doc.setFilename("document.pdf");
        assertEquals("document.pdf", doc.getFilename());
    }

    @Test
    public void testSetGetContent() {
        Document doc = new Document();
        doc.setContent("Document content here");
        assertEquals("Document content here", doc.getContent());
    }

    @Test
    public void testSetGetPatientId() {
        Document doc = new Document();
        doc.setPatientId("P001");
        assertEquals("P001", doc.getPatientId());
    }

    @Test
    public void testSetGetOriginalDocId() {
        Document doc = new Document();
        doc.setOriginalDocId("orig-001");
        assertEquals("orig-001", doc.getOriginalDocId());
    }

    @Test
    public void testSetGetIndexedAt() {
        Document doc = new Document();
        LocalDateTime now = LocalDateTime.now();
        doc.setIndexedAt(now);
        assertEquals(now, doc.getIndexedAt());
    }

    @Test
    public void testSetGetEmbedding() {
        Document doc = new Document();
        double[] embedding = {0.1, 0.2, 0.3};
        doc.setEmbedding(embedding);
        assertArrayEquals(embedding, doc.getEmbedding());
    }

    @Test
    public void testSetGetScore() {
        Document doc = new Document();
        doc.setScore(0.95);
        assertEquals(0.95, doc.getScore());
    }

    @Test
    public void testAllFieldsSet() {
        Document doc = new Document();
        doc.setId(1L);
        doc.setFilename("test.pdf");
        doc.setContent("Content");
        doc.setPatientId("P001");
        doc.setOriginalDocId("orig-001");
        doc.setIndexedAt(LocalDateTime.now());

        assertNotNull(doc.getId());
        assertNotNull(doc.getFilename());
        assertNotNull(doc.getContent());
        assertNotNull(doc.getPatientId());
    }
}
