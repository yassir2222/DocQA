package com.docqa.synthese.controller;

import com.docqa.synthese.dto.ComparisonRequest;
import com.docqa.synthese.dto.SynthesisRequest;
import com.docqa.synthese.dto.SynthesisResult;
import com.docqa.synthese.service.SynthesisService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controleur REST pour les syntheses et comparaisons
 */
@RestController
@RequestMapping("/api/synthesis")
@Tag(name = "Synthese Comparative", description = "API de generation de syntheses et comparaisons medicales")
@CrossOrigin(origins = "*")
public class SynthesisController {

    private static final Logger logger = LoggerFactory.getLogger(SynthesisController.class);

    private final SynthesisService synthesisService;

    @Autowired
    public SynthesisController(SynthesisService synthesisService) {
        this.synthesisService = synthesisService;
    }

    @PostMapping("/generate")
    @Operation(summary = "Generer une synthese", 
               description = "Genere une synthese structuree a partir de documents medicaux")
    public ResponseEntity<SynthesisResult> generateSynthesis(@RequestBody SynthesisRequest request) {
        logger.info("[SYNTHESE] Requete de synthese recue: type={}", request.getSynthesisType());
        
        try {
            SynthesisResult result = synthesisService.generateSynthesis(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("[ERREUR] Erreur synthese: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/compare")
    @Operation(summary = "Generer une comparaison", 
               description = "Compare les dossiers de deux patients")
    public ResponseEntity<SynthesisResult> generateComparison(@RequestBody ComparisonRequest request) {
        logger.info("[COMPARE] Requete de comparaison recue: {} vs {}", 
                request.getPatientId1(), request.getPatientId2());
        
        try {
            SynthesisResult result = synthesisService.generateComparison(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("[ERREUR] Erreur comparaison: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/types")
    @Operation(summary = "Types de synthese", 
               description = "Liste les types de synthese disponibles")
    public ResponseEntity<Map<String, Object>> getSynthesisTypes() {
        Map<String, Object> types = new HashMap<>();
        types.put("types", new String[]{"SUMMARY", "EVOLUTION", "TREATMENT_HISTORY"});
        types.put("focus_options", new String[]{"pathologies", "traitements", "antecedents", "general"});
        return ResponseEntity.ok(types);
    }

    @GetMapping("/comparison/types")
    @Operation(summary = "Types de comparaison", 
               description = "Liste les types de comparaison disponibles")
    public ResponseEntity<Map<String, Object>> getComparisonTypes() {
        Map<String, Object> types = new HashMap<>();
        types.put("types", new String[]{"TREATMENT", "EVOLUTION", "DIAGNOSIS"});
        types.put("time_periods", new String[]{"3_MONTHS", "6_MONTHS", "1_YEAR", "ALL"});
        return ResponseEntity.ok(types);
    }
}
