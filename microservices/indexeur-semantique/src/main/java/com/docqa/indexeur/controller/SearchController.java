package com.docqa.indexeur.controller;

import com.docqa.indexeur.model.Document;
import com.docqa.indexeur.service.IndexingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    private final IndexingService indexingService;

    @Autowired
    public SearchController(IndexingService indexingService) {
        this.indexingService = indexingService;
    }

    @GetMapping
    public ResponseEntity<List<Document>> search(@RequestParam String query,
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(indexingService.search(query, limit));
    }
}
