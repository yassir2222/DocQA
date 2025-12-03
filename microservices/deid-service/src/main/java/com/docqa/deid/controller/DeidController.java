package com.docqa.deid.controller;

import com.docqa.deid.model.DeidMapping;
import com.docqa.deid.model.DeidRequest;
import com.docqa.deid.repository.DeidMappingRepository;
import com.docqa.deid.service.DeidService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/deid")
public class DeidController {

    private final DeidService deidService;
    private final DeidMappingRepository deidMappingRepository;

    @Autowired
    public DeidController(DeidService deidService, DeidMappingRepository deidMappingRepository) {
        this.deidService = deidService;
        this.deidMappingRepository = deidMappingRepository;
    }

    @PostMapping("/anonymize")
    public ResponseEntity<?> anonymizeDocument(@RequestBody DeidRequest deidRequest) {
        try {
            return ResponseEntity.ok(deidService.anonymize(deidRequest));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("An error occurred during anonymization: " + e.getMessage());
        }
    }

    @GetMapping("/mappings/{documentId}")
    public ResponseEntity<Map<String, Object>> getMappings(@PathVariable String documentId) {
        try {
            List<DeidMapping> mappings = deidMappingRepository.findByDocumentId(documentId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("documentId", documentId);
            response.put("mappings", mappings);
            response.put("count", mappings.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}