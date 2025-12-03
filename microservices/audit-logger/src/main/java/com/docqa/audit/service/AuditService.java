package com.docqa.audit.service;

import com.docqa.audit.dto.AuditLogDTO;
import com.docqa.audit.dto.AuditStatsDTO;
import com.docqa.audit.model.AuditLog;
import com.docqa.audit.repository.AuditLogRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service de gestion des logs d'audit
 */
@Service
public class AuditService {

    private static final Logger logger = LoggerFactory.getLogger(AuditService.class);

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    @Autowired
    public AuditService(AuditLogRepository auditLogRepository, ObjectMapper objectMapper) {
        this.auditLogRepository = auditLogRepository;
        this.objectMapper = objectMapper;
    }

    /**
     * Crée un nouveau log d'audit
     */
    public AuditLog createLog(AuditLogDTO dto) {
        logger.info("📝 Création log audit: {} - {}", dto.getAction(), dto.getUserId());

        AuditLog log = new AuditLog();
        log.setUserId(dto.getUserId());
        log.setAction(dto.getAction());
        log.setResourceType(dto.getResourceType());
        log.setResourceId(dto.getResourceId());
        log.setQueryText(dto.getQueryText());
        log.setResponseSummary(dto.getResponseSummary());
        log.setIpAddress(dto.getIpAddress());
        log.setUserAgent(dto.getUserAgent());
        log.setProcessingTimeMs(dto.getProcessingTimeMs());
        log.setService(dto.getService());
        log.setStatus(dto.getStatus() != null ? dto.getStatus() : "SUCCESS");

        // Convertir la liste des documents en JSON
        if (dto.getDocumentsAccessed() != null) {
            try {
                log.setDocumentsAccessed(objectMapper.writeValueAsString(dto.getDocumentsAccessed()));
            } catch (JsonProcessingException e) {
                logger.error("Erreur conversion documents JSON", e);
            }
        }

        AuditLog saved = auditLogRepository.save(log);
        logger.info("✅ Log audit créé: ID={}", saved.getId());

        return saved;
    }

    /**
     * Récupère les logs avec pagination
     */
    public Page<AuditLog> getLogs(int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return auditLogRepository.findAll(pageRequest);
    }

    /**
     * Récupère les logs d'un utilisateur
     */
    public Page<AuditLog> getLogsByUser(String userId, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        return auditLogRepository.findByUserIdOrderByCreatedAtDesc(userId, pageRequest);
    }

    /**
     * Récupère les logs par période
     */
    public List<AuditLog> getLogsByDateRange(LocalDateTime start, LocalDateTime end) {
        return auditLogRepository.findByDateRange(start, end);
    }

    /**
     * Récupère les logs avec erreurs
     */
    public List<AuditLog> getErrorLogs() {
        return auditLogRepository.findByStatusOrderByCreatedAtDesc("ERROR");
    }

    /**
     * Recherche dans les logs
     */
    public List<AuditLog> searchLogs(String keyword) {
        return auditLogRepository.searchByQueryText(keyword);
    }

    /**
     * Récupère les statistiques d'audit
     */
    public AuditStatsDTO getStatistics() {
        AuditStatsDTO stats = new AuditStatsDTO();

        // Total des logs
        stats.setTotalLogs(auditLogRepository.count());

        // Logs par action
        Map<String, Long> byAction = new HashMap<>();
        auditLogRepository.countByAction().forEach(row -> 
            byAction.put((String) row[0], (Long) row[1])
        );
        stats.setLogsByAction(byAction);

        // Logs par service
        Map<String, Long> byService = new HashMap<>();
        auditLogRepository.countByService().forEach(row -> 
            byService.put((String) row[0], (Long) row[1])
        );
        stats.setLogsByService(byService);

        // Temps moyen par service
        Map<String, Double> avgTime = new HashMap<>();
        auditLogRepository.averageProcessingTimeByService().forEach(row -> 
            avgTime.put((String) row[0], (Double) row[1])
        );
        stats.setAverageProcessingTimeByService(avgTime);

        // Erreurs
        stats.setErrorCount((long) auditLogRepository.findByStatusOrderByCreatedAtDesc("ERROR").size());

        return stats;
    }

    /**
     * Récupère un log par ID
     */
    public AuditLog getLogById(Long id) {
        return auditLogRepository.findById(id).orElse(null);
    }
}
