package com.docqa.audit.controller;

import com.docqa.audit.dto.AuditLogDTO;
import com.docqa.audit.dto.AuditStatsDTO;
import com.docqa.audit.model.AuditLog;
import com.docqa.audit.service.AuditService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controleur REST pour les logs d'audit
 */
@RestController
@RequestMapping("/api/audit")
@Tag(name = "Audit Logger", description = "API de tracabilite et audit des interactions")
@CrossOrigin(origins = "*")
public class AuditController {

    private final AuditService auditService;

    @Autowired
    public AuditController(AuditService auditService) {
        this.auditService = auditService;
    }

    @PostMapping("/log")
    @Operation(summary = "Creer un log d'audit", description = "Enregistre une nouvelle entree d'audit")
    public ResponseEntity<Map<String, Object>> createLog(@RequestBody AuditLogDTO dto) {
        AuditLog log = auditService.createLog(dto);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("id", log.getId());
        response.put("message", "Log d'audit cree avec succes");
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/logs")
    @Operation(summary = "Lister les logs", description = "Recupere les logs d'audit avec pagination")
    public ResponseEntity<Page<AuditLog>> getLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) Integer offset,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String user) {
        // Support both pagination styles
        int actualPage = offset != null ? offset / (limit != null ? limit : 20) : page;
        int actualSize = limit != null ? limit : size;
        return ResponseEntity.ok(auditService.getLogs(actualPage, actualSize));
    }

    @GetMapping("/logs/{id}")
    @Operation(summary = "Obtenir un log", description = "Recupere un log d'audit par son ID")
    public ResponseEntity<?> getLog(@PathVariable Long id) {
        AuditLog log = auditService.getLogById(id);
        if (log == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(log);
    }

    @GetMapping("/logs/user/{userId}")
    @Operation(summary = "Logs par utilisateur", description = "Recupere les logs d'un utilisateur")
    public ResponseEntity<Page<AuditLog>> getLogsByUser(
            @PathVariable String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(auditService.getLogsByUser(userId, page, size));
    }

    @GetMapping("/logs/daterange")
    @Operation(summary = "Logs par periode", description = "Recupere les logs dans une plage de dates")
    public ResponseEntity<List<AuditLog>> getLogsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(auditService.getLogsByDateRange(start, end));
    }

    @GetMapping("/logs/errors")
    @Operation(summary = "Logs d'erreurs", description = "Recupere les logs avec erreurs")
    public ResponseEntity<List<AuditLog>> getErrorLogs() {
        return ResponseEntity.ok(auditService.getErrorLogs());
    }

    @GetMapping("/logs/search")
    @Operation(summary = "Rechercher", description = "Recherche dans les logs par mot-cle")
    public ResponseEntity<List<AuditLog>> searchLogs(@RequestParam String keyword) {
        return ResponseEntity.ok(auditService.searchLogs(keyword));
    }

    @GetMapping("/stats")
    @Operation(summary = "Statistiques", description = "Recupere les statistiques d'audit")
    public ResponseEntity<AuditStatsDTO> getStatistics(
            @RequestParam(required = false) String start_date,
            @RequestParam(required = false) String end_date) {
        return ResponseEntity.ok(auditService.getStatistics());
    }
}
