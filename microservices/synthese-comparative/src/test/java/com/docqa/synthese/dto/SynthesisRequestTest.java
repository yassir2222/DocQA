package com.docqa.synthese.dto;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;
import java.util.Arrays;
import java.util.List;

public class SynthesisRequestTest {

    @Test
    public void testSynthesisRequestCreation() {
        SynthesisRequest request = new SynthesisRequest();
        assertNotNull(request);
    }

    @Test
    public void testSetDocumentIds() {
        SynthesisRequest request = new SynthesisRequest();
        List<String> docIds = Arrays.asList("DOC001", "DOC002", "DOC003");
        request.setDocumentIds(docIds);
        assertEquals(docIds, request.getDocumentIds());
        assertEquals(3, request.getDocumentIds().size());
    }

    @Test
    public void testSetPatientId() {
        SynthesisRequest request = new SynthesisRequest();
        request.setPatientId("P001");
        assertEquals("P001", request.getPatientId());
    }

    @Test
    public void testSetSynthesisType() {
        SynthesisRequest request = new SynthesisRequest();
        request.setSynthesisType("SUMMARY");
        assertEquals("SUMMARY", request.getSynthesisType());
    }

    @Test
    public void testSetSynthesisType_Evolution() {
        SynthesisRequest request = new SynthesisRequest();
        request.setSynthesisType("EVOLUTION");
        assertEquals("EVOLUTION", request.getSynthesisType());
    }

    @Test
    public void testSetSynthesisType_TreatmentHistory() {
        SynthesisRequest request = new SynthesisRequest();
        request.setSynthesisType("TREATMENT_HISTORY");
        assertEquals("TREATMENT_HISTORY", request.getSynthesisType());
    }

    @Test
    public void testSetFocus() {
        SynthesisRequest request = new SynthesisRequest();
        request.setFocus("pathologies");
        assertEquals("pathologies", request.getFocus());
    }

    @Test
    public void testSetFocus_Traitements() {
        SynthesisRequest request = new SynthesisRequest();
        request.setFocus("traitements");
        assertEquals("traitements", request.getFocus());
    }

    @Test
    public void testSetUserId() {
        SynthesisRequest request = new SynthesisRequest();
        request.setUserId("user123");
        assertEquals("user123", request.getUserId());
    }

    @Test
    public void testNullValues() {
        SynthesisRequest request = new SynthesisRequest();
        assertNull(request.getDocumentIds());
        assertNull(request.getPatientId());
        assertNull(request.getSynthesisType());
        assertNull(request.getFocus());
        assertNull(request.getUserId());
    }
}
