package com.docqa.synthese.dto;

import java.util.List;

/**
 * Requête de synthèse de documents
 */
public class SynthesisRequest {

    private List<String> documentIds;
    private String patientId;
    private String synthesisType; // SUMMARY, EVOLUTION, TREATMENT_HISTORY
    private String focus; // pathologies, traitements, general
    private String userId;

    // Getters et Setters
    public List<String> getDocumentIds() {
        return documentIds;
    }

    public void setDocumentIds(List<String> documentIds) {
        this.documentIds = documentIds;
    }

    public String getPatientId() {
        return patientId;
    }

    public void setPatientId(String patientId) {
        this.patientId = patientId;
    }

    public String getSynthesisType() {
        return synthesisType;
    }

    public void setSynthesisType(String synthesisType) {
        this.synthesisType = synthesisType;
    }

    public String getFocus() {
        return focus;
    }

    public void setFocus(String focus) {
        this.focus = focus;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }
}
