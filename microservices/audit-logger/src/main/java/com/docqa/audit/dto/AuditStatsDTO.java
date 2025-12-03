package com.docqa.audit.dto;

import java.util.Map;

/**
 * DTO pour les statistiques d'audit
 */
public class AuditStatsDTO {

    private Long totalLogs;
    private Long errorCount;
    private Map<String, Long> logsByAction;
    private Map<String, Long> logsByService;
    private Map<String, Double> averageProcessingTimeByService;

    // Getters et Setters
    public Long getTotalLogs() {
        return totalLogs;
    }

    public void setTotalLogs(Long totalLogs) {
        this.totalLogs = totalLogs;
    }

    public Long getErrorCount() {
        return errorCount;
    }

    public void setErrorCount(Long errorCount) {
        this.errorCount = errorCount;
    }

    public Map<String, Long> getLogsByAction() {
        return logsByAction;
    }

    public void setLogsByAction(Map<String, Long> logsByAction) {
        this.logsByAction = logsByAction;
    }

    public Map<String, Long> getLogsByService() {
        return logsByService;
    }

    public void setLogsByService(Map<String, Long> logsByService) {
        this.logsByService = logsByService;
    }

    public Map<String, Double> getAverageProcessingTimeByService() {
        return averageProcessingTimeByService;
    }

    public void setAverageProcessingTimeByService(Map<String, Double> averageProcessingTimeByService) {
        this.averageProcessingTimeByService = averageProcessingTimeByService;
    }
}
