package com.docqa.deid.model;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;

public class PseudonymTest {

    @Test
    public void testPseudonymCreation() {
        Pseudonym pseudonym = new Pseudonym();
        assertNotNull(pseudonym);
    }

    @Test
    public void testPseudonymWithParams() {
        Pseudonym pseudonym = new Pseudonym("Original", "Replacement");
        assertEquals("Original", pseudonym.getOriginalData());
        assertEquals("Replacement", pseudonym.getPseudonymData());
    }

    @Test
    public void testSetOriginalData() {
        Pseudonym pseudonym = new Pseudonym();
        pseudonym.setOriginalData("Test Original");
        assertEquals("Test Original", pseudonym.getOriginalData());
    }

    @Test
    public void testSetPseudonymData() {
        Pseudonym pseudonym = new Pseudonym();
        pseudonym.setPseudonymData("PERSON_12345");
        assertEquals("PERSON_12345", pseudonym.getPseudonymData());
    }

    @Test
    public void testSetId() {
        Pseudonym pseudonym = new Pseudonym();
        pseudonym.setId(100L);
        assertEquals(100L, pseudonym.getId());
    }

    @Test
    public void testNullOriginalData() {
        Pseudonym pseudonym = new Pseudonym();
        assertNull(pseudonym.getOriginalData());
    }

    @Test
    public void testNullPseudonymData() {
        Pseudonym pseudonym = new Pseudonym();
        assertNull(pseudonym.getPseudonymData());
    }

    @Test
    public void testNullId() {
        Pseudonym pseudonym = new Pseudonym();
        assertNull(pseudonym.getId());
    }
}
