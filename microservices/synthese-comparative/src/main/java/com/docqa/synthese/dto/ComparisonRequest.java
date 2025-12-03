package com.docqa.synthese.dto;

import java.util.List;

/**
 * Requête de comparaison entre patients
 */
public class ComparisonRequest {

    private String patientId1;
    private String patientId2;
    private List<String> documentIds1;
    private List<String> documentIds2;
    private String comparisonType; // TREATMENT, EVOLUTION, DIAGNOSIS
    private String timePeriod; // 3_MONTHS, 6_MONTHS, 1_YEAR
    private String userId;

    // Getters et Setters
    public String getPatientId1() {
        return patientId1;
    }

    public void setPatientId1(String patientId1) {
        this.patientId1 = patientId1;
    }

    public String getPatientId2() {
        return patientId2;
    }

    public void setPatientId2(String patientId2) {
        this.patientId2 = patientId2;
    }

    public List<String> getDocumentIds1() {
        return documentIds1;
    }

    public void setDocumentIds1(List<String> documentIds1) {
        this.documentIds1 = documentIds1;
    }

    public List<String> getDocumentIds2() {
        return documentIds2;
    }

    public void setDocumentIds2(List<String> documentIds2) {
        this.documentIds2 = documentIds2;
    }

    public String getComparisonType() {
        return comparisonType;
    }

    public void setComparisonType(String comparisonType) {
        this.comparisonType = comparisonType;
    }

    public String getTimePeriod() {
        return timePeriod;
    }

    public void setTimePeriod(String timePeriod) {
        this.timePeriod = timePeriod;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }
}
