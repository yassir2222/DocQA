package com.docqa.synthese.dto;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class SynthesisResultTest {

    @Test
    public void testSynthesisResultCreation() {
        SynthesisResult result = new SynthesisResult();
        assertNotNull(result);
    }

    @Test
    public void testSetId() {
        SynthesisResult result = new SynthesisResult();
        result.setId("SYNTH001");
        assertEquals("SYNTH001", result.getId());
    }

    @Test
    public void testSetType() {
        SynthesisResult result = new SynthesisResult();
        result.setType("SUMMARY");
        assertEquals("SUMMARY", result.getType());
    }

    @Test
    public void testSetSummary() {
        SynthesisResult result = new SynthesisResult();
        result.setSummary("This is a summary of the patient's medical history.");
        assertEquals("This is a summary of the patient's medical history.", result.getSummary());
    }

    @Test
    public void testSetKeyPoints() {
        SynthesisResult result = new SynthesisResult();
        List<String> keyPoints = Arrays.asList("Point 1", "Point 2", "Point 3");
        result.setKeyPoints(keyPoints);
        assertEquals(keyPoints, result.getKeyPoints());
        assertEquals(3, result.getKeyPoints().size());
    }

    @Test
    public void testSetStructuredData() {
        SynthesisResult result = new SynthesisResult();
        Map<String, Object> data = new HashMap<>();
        data.put("diagnosis", "Hypertension");
        data.put("severity", "moderate");
        result.setStructuredData(data);
        
        assertEquals(data, result.getStructuredData());
        assertEquals("Hypertension", result.getStructuredData().get("diagnosis"));
    }

    @Test
    public void testSetSourceDocuments() {
        SynthesisResult result = new SynthesisResult();
        List<String> sources = Arrays.asList("DOC001", "DOC002");
        result.setSourceDocuments(sources);
        assertEquals(sources, result.getSourceDocuments());
    }

    @Test
    public void testSetGeneratedAt() {
        SynthesisResult result = new SynthesisResult();
        LocalDateTime now = LocalDateTime.now();
        result.setGeneratedAt(now);
        assertEquals(now, result.getGeneratedAt());
    }

    @Test
    public void testSetProcessingTimeMs() {
        SynthesisResult result = new SynthesisResult();
        result.setProcessingTimeMs(1500);
        assertEquals(1500, result.getProcessingTimeMs());
    }

    @Test
    public void testDefaultProcessingTime() {
        SynthesisResult result = new SynthesisResult();
        assertEquals(0, result.getProcessingTimeMs());
    }

    @Test
    public void testNullValues() {
        SynthesisResult result = new SynthesisResult();
        assertNull(result.getId());
        assertNull(result.getType());
        assertNull(result.getSummary());
        assertNull(result.getKeyPoints());
    }
}
