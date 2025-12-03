package com.docqa.indexeur.controller;

import com.docqa.indexeur.model.Document;
import com.docqa.indexeur.service.IndexingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api")
public class SearchController {

    private final IndexingService indexingService;

    @Autowired
    public SearchController(IndexingService indexingService) {
        this.indexingService = indexingService;
    }

    @GetMapping("/search")
    public ResponseEntity<List<Document>> searchGet(@RequestParam String query,
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(indexingService.search(query, limit));
    }

    @PostMapping("/search")
    public ResponseEntity<Map<String, Object>> searchPost(@RequestBody Map<String, Object> request) {
        String query = (String) request.getOrDefault("query", "");
        int topK = request.containsKey("topK") ? ((Number) request.get("topK")).intValue() : 10;
        
        List<Document> results = indexingService.search(query, topK);
        
        Map<String, Object> response = new HashMap<>();
        response.put("results", results);
        response.put("query", query);
        response.put("total", results.size());
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/index")
    public ResponseEntity<Map<String, Object>> indexDocument(@RequestBody Map<String, Object> request) {
        Long documentId = request.containsKey("documentId") 
            ? ((Number) request.get("documentId")).longValue() 
            : null;
        
        Map<String, Object> response = new HashMap<>();
        
        if (documentId != null) {
            // Index the document (implementation depends on your service)
            response.put("status", "indexed");
            response.put("documentId", documentId);
            response.put("message", "Document queued for indexing");
        } else {
            response.put("status", "error");
            response.put("message", "documentId is required");
        }
        
        return ResponseEntity.ok(response);
    }
}
