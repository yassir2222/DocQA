package com.docqa.deid.model;

import jakarta.validation.constraints.NotNull;

/**
 * Requête d'anonymisation de document
 */
public class DeidRequest {
    
    @NotNull
    private String documentContent;
    
    private String documentId;
    
    private String filename;

    public DeidRequest() {
    }

    public DeidRequest(String documentContent) {
        this.documentContent = documentContent;
    }

    public String getDocumentContent() {
        return documentContent;
    }

    public void setDocumentContent(String documentContent) {
        this.documentContent = documentContent;
    }
    
    public String getDocumentId() {
        return documentId;
    }
    
    public void setDocumentId(String documentId) {
        this.documentId = documentId;
    }
    
    public String getFilename() {
        return filename;
    }
    
    public void setFilename(String filename) {
        this.filename = filename;
    }
}