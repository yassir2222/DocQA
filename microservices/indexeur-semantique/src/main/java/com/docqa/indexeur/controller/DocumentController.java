package com.docqa.indexeur.controller;

import com.docqa.indexeur.model.Document;
import com.docqa.indexeur.repository.DocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentRepository documentRepository;

    @Autowired
    public DocumentController(DocumentRepository documentRepository) {
        this.documentRepository = documentRepository;
    }

    /**
     * Get a document by ID (supports both internal ID and originalDocId)
     * Used by synthese-comparative to retrieve document content
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getDocumentById(@PathVariable String id) {
        // First try to find by originalDocId (most common case from frontend)
        Optional<Document> documentOpt = documentRepository.findAll().stream()
                .filter(doc -> id.equals(doc.getOriginalDocId()))
                .findFirst();
        
        // If not found by originalDocId, try by internal ID
        if (documentOpt.isEmpty()) {
            try {
                Long longId = Long.parseLong(id);
                documentOpt = documentRepository.findById(longId);
            } catch (NumberFormatException e) {
                // Not a valid long, keep empty
            }
        }
        
        if (documentOpt.isPresent()) {
            Document doc = documentOpt.get();
            Map<String, Object> response = new HashMap<>();
            response.put("id", doc.getId());
            response.put("filename", doc.getFilename());
            response.put("content", doc.getContent());
            response.put("patientId", doc.getPatientId());
            response.put("originalDocId", doc.getOriginalDocId());
            response.put("indexedAt", doc.getIndexedAt() != null ? doc.getIndexedAt().toString() : null);
            
            return ResponseEntity.ok(response);
        } else {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Document not found");
            error.put("id", id);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get all documents (with optional filtering by patientId)
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllDocuments(
            @RequestParam(required = false) String patientId) {
        
        List<Document> documents = documentRepository.findAll();
        
        // Filter by patientId if provided
        if (patientId != null && !patientId.isEmpty()) {
            documents = documents.stream()
                    .filter(doc -> patientId.equals(doc.getPatientId()))
                    .collect(Collectors.toList());
        }
        
        // Convert to response format (without embedding for efficiency)
        List<Map<String, Object>> documentList = documents.stream()
                .map(doc -> {
                    Map<String, Object> docMap = new HashMap<>();
                    docMap.put("id", doc.getId());
                    docMap.put("filename", doc.getFilename());
                    docMap.put("patientId", doc.getPatientId());
                    docMap.put("originalDocId", doc.getOriginalDocId());
                    docMap.put("indexedAt", doc.getIndexedAt() != null ? doc.getIndexedAt().toString() : null);
                    // Don't include content in list view for efficiency
                    return docMap;
                })
                .collect(Collectors.toList());
        
        Map<String, Object> response = new HashMap<>();
        response.put("documents", documentList);
        response.put("total", documentList.size());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get multiple documents by IDs
     * Useful for batch retrieval
     */
    @PostMapping("/batch")
    public ResponseEntity<Map<String, Object>> getDocumentsByIds(@RequestBody Map<String, Object> request) {
        @SuppressWarnings("unchecked")
        List<Number> ids = (List<Number>) request.get("ids");
        
        if (ids == null || ids.isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "ids array is required");
            return ResponseEntity.badRequest().body(error);
        }
        
        List<Long> longIds = ids.stream()
                .map(Number::longValue)
                .collect(Collectors.toList());
        
        List<Document> documents = documentRepository.findAllById(longIds);
        
        List<Map<String, Object>> documentList = documents.stream()
                .map(doc -> {
                    Map<String, Object> docMap = new HashMap<>();
                    docMap.put("id", doc.getId());
                    docMap.put("filename", doc.getFilename());
                    docMap.put("content", doc.getContent());
                    docMap.put("patientId", doc.getPatientId());
                    docMap.put("originalDocId", doc.getOriginalDocId());
                    docMap.put("indexedAt", doc.getIndexedAt() != null ? doc.getIndexedAt().toString() : null);
                    return docMap;
                })
                .collect(Collectors.toList());
        
        Map<String, Object> response = new HashMap<>();
        response.put("documents", documentList);
        response.put("total", documentList.size());
        response.put("requestedIds", longIds);
        
        return ResponseEntity.ok(response);
    }
}
