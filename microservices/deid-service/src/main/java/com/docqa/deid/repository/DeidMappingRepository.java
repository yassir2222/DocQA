package com.docqa.deid.repository;

import com.docqa.deid.model.DeidMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository pour les mappings d'anonymisation
 */
@Repository
public interface DeidMappingRepository extends JpaRepository<DeidMapping, Long> {
    
    /**
     * Trouve tous les mappings pour un document
     */
    List<DeidMapping> findByDocumentId(String documentId);
    
    /**
     * Trouve les mappings par type d'entité
     */
    List<DeidMapping> findByEntityType(String entityType);
    
    /**
     * Trouve un mapping par valeur originale
     */
    DeidMapping findByOriginalValue(String originalValue);
    
    /**
     * Trouve un mapping par valeur anonymisée
     */
    DeidMapping findByAnonymizedValue(String anonymizedValue);
}
