package com.docqa.synthese.dto;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;
import java.util.Arrays;
import java.util.List;

public class ComparisonRequestTest {

    @Test
    public void testComparisonRequestCreation() {
        ComparisonRequest request = new ComparisonRequest();
        assertNotNull(request);
    }

    @Test
    public void testSetPatientId1() {
        ComparisonRequest request = new ComparisonRequest();
        request.setPatientId1("P001");
        assertEquals("P001", request.getPatientId1());
    }

    @Test
    public void testSetPatientId2() {
        ComparisonRequest request = new ComparisonRequest();
        request.setPatientId2("P002");
        assertEquals("P002", request.getPatientId2());
    }

    @Test
    public void testSetDocumentIds1() {
        ComparisonRequest request = new ComparisonRequest();
        List<String> docs = Arrays.asList("DOC001", "DOC002");
        request.setDocumentIds1(docs);
        assertEquals(docs, request.getDocumentIds1());
    }

    @Test
    public void testSetDocumentIds2() {
        ComparisonRequest request = new ComparisonRequest();
        List<String> docs = Arrays.asList("DOC003", "DOC004");
        request.setDocumentIds2(docs);
        assertEquals(docs, request.getDocumentIds2());
    }

    @Test
    public void testSetComparisonType_Treatment() {
        ComparisonRequest request = new ComparisonRequest();
        request.setComparisonType("TREATMENT");
        assertEquals("TREATMENT", request.getComparisonType());
    }

    @Test
    public void testSetComparisonType_Evolution() {
        ComparisonRequest request = new ComparisonRequest();
        request.setComparisonType("EVOLUTION");
        assertEquals("EVOLUTION", request.getComparisonType());
    }

    @Test
    public void testSetComparisonType_Diagnosis() {
        ComparisonRequest request = new ComparisonRequest();
        request.setComparisonType("DIAGNOSIS");
        assertEquals("DIAGNOSIS", request.getComparisonType());
    }

    @Test
    public void testSetTimePeriod_3Months() {
        ComparisonRequest request = new ComparisonRequest();
        request.setTimePeriod("3_MONTHS");
        assertEquals("3_MONTHS", request.getTimePeriod());
    }

    @Test
    public void testSetTimePeriod_6Months() {
        ComparisonRequest request = new ComparisonRequest();
        request.setTimePeriod("6_MONTHS");
        assertEquals("6_MONTHS", request.getTimePeriod());
    }

    @Test
    public void testSetTimePeriod_1Year() {
        ComparisonRequest request = new ComparisonRequest();
        request.setTimePeriod("1_YEAR");
        assertEquals("1_YEAR", request.getTimePeriod());
    }

    @Test
    public void testSetUserId() {
        ComparisonRequest request = new ComparisonRequest();
        request.setUserId("doctor123");
        assertEquals("doctor123", request.getUserId());
    }

    @Test
    public void testNullValues() {
        ComparisonRequest request = new ComparisonRequest();
        assertNull(request.getPatientId1());
        assertNull(request.getPatientId2());
        assertNull(request.getDocumentIds1());
        assertNull(request.getDocumentIds2());
        assertNull(request.getComparisonType());
        assertNull(request.getUserId());
    }
}
