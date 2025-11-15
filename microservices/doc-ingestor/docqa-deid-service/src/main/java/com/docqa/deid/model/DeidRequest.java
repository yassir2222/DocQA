package com.docqa.deid.model;

import javax.validation.constraints.NotNull;

public class DeidRequest {
    
    @NotNull
    private String documentContent;

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
}