package com.docqa.deid.controller;

import com.docqa.deid.model.DeidRequest;
import com.docqa.deid.service.DeidService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/deid")
public class DeidController {

    private final DeidService deidService;

    @Autowired
    public DeidController(DeidService deidService) {
        this.deidService = deidService;
    }

    @PostMapping("/anonymize")
    public ResponseEntity<?> anonymizeDocument(@RequestBody DeidRequest deidRequest) {
        try {
            return ResponseEntity.ok(deidService.anonymize(deidRequest));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("An error occurred during anonymization: " + e.getMessage());
        }
    }
}