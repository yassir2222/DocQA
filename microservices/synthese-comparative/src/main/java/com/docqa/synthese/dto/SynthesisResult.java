package com.docqa.synthese.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Résultat d'une synthèse ou comparaison
 */
public class SynthesisResult {

    private String id;
    private String type;
    private String summary;
    private List<String> keyPoints;
    private Map<String, Object> structuredData;
    private List<String> sourceDocuments;
    private LocalDateTime generatedAt;
    private int processingTimeMs;

    // Getters et Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public List<String> getKeyPoints() {
        return keyPoints;
    }

    public void setKeyPoints(List<String> keyPoints) {
        this.keyPoints = keyPoints;
    }

    public Map<String, Object> getStructuredData() {
        return structuredData;
    }

    public void setStructuredData(Map<String, Object> structuredData) {
        this.structuredData = structuredData;
    }

    public List<String> getSourceDocuments() {
        return sourceDocuments;
    }

    public void setSourceDocuments(List<String> sourceDocuments) {
        this.sourceDocuments = sourceDocuments;
    }

    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(LocalDateTime generatedAt) {
        this.generatedAt = generatedAt;
    }

    public int getProcessingTimeMs() {
        return processingTimeMs;
    }

    public void setProcessingTimeMs(int processingTimeMs) {
        this.processingTimeMs = processingTimeMs;
    }
}
