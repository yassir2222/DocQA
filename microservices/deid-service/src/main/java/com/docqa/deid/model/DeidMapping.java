package com.docqa.deid.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entité représentant un mapping entre une valeur originale et son pseudonyme
 */
@Entity
@Table(name = "deid_mappings")
public class DeidMapping {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "document_id", nullable = false)
    private String documentId;

    @Column(name = "original_value", nullable = false, columnDefinition = "TEXT")
    private String originalValue;

    @Column(name = "anonymized_value", nullable = false)
    private String anonymizedValue;

    @Column(name = "entity_type", nullable = false, length = 50)
    private String entityType;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public DeidMapping() {
        this.createdAt = LocalDateTime.now();
    }

    public DeidMapping(String documentId, String originalValue, String anonymizedValue, String entityType) {
        this.documentId = documentId;
        this.originalValue = originalValue;
        this.anonymizedValue = anonymizedValue;
        this.entityType = entityType;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDocumentId() {
        return documentId;
    }

    public void setDocumentId(String documentId) {
        this.documentId = documentId;
    }

    public String getOriginalValue() {
        return originalValue;
    }

    public void setOriginalValue(String originalValue) {
        this.originalValue = originalValue;
    }

    public String getAnonymizedValue() {
        return anonymizedValue;
    }

    public void setAnonymizedValue(String anonymizedValue) {
        this.anonymizedValue = anonymizedValue;
    }

    public String getEntityType() {
        return entityType;
    }

    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
