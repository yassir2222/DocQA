package com.docqa.audit.controller;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

import com.docqa.audit.dto.AuditLogDTO;
import com.docqa.audit.dto.AuditStatsDTO;
import com.docqa.audit.model.AuditLog;
import com.docqa.audit.service.AuditService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

public class AuditControllerTest {

    @InjectMocks
    private AuditController auditController;

    @Mock
    private AuditService auditService;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testCreateLog() {
        AuditLogDTO dto = new AuditLogDTO();
        dto.setAction("DOCUMENT_UPLOAD");
        dto.setUserId("user123");

        AuditLog log = new AuditLog();
        log.setId(1L);
        log.setAction("DOCUMENT_UPLOAD");

        when(auditService.createLog(any(AuditLogDTO.class))).thenReturn(log);

        ResponseEntity<Map<String, Object>> response = auditController.createLog(dto);

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals(true, response.getBody().get("success"));
        assertEquals(1L, response.getBody().get("id"));
    }

    @Test
    public void testGetLogs() {
        Page<AuditLog> mockPage = new PageImpl<>(Arrays.asList(new AuditLog(), new AuditLog()));
        when(auditService.getLogs(anyInt(), anyInt())).thenReturn(mockPage);

        ResponseEntity<Page<AuditLog>> response = auditController.getLogs(0, 20, null, null, null, null);

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().getContent().size());
    }

    @Test
    public void testGetLogsWithLimit() {
        Page<AuditLog> mockPage = new PageImpl<>(Collections.singletonList(new AuditLog()));
        when(auditService.getLogs(anyInt(), anyInt())).thenReturn(mockPage);

        ResponseEntity<Page<AuditLog>> response = auditController.getLogs(0, 20, 10, 0, "QUERY", "user1");

        assertEquals(200, response.getStatusCode().value());
    }

    @Test
    public void testGetLogById_Found() {
        AuditLog log = new AuditLog();
        log.setId(1L);
        when(auditService.getLogById(1L)).thenReturn(log);

        ResponseEntity<?> response = auditController.getLog(1L);

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
    }

    @Test
    public void testGetLogById_NotFound() {
        when(auditService.getLogById(999L)).thenReturn(null);

        ResponseEntity<?> response = auditController.getLog(999L);

        assertEquals(404, response.getStatusCode().value());
    }

    @Test
    public void testGetLogsByUser() {
        Page<AuditLog> mockPage = new PageImpl<>(Collections.singletonList(new AuditLog()));
        when(auditService.getLogsByUser(eq("user123"), anyInt(), anyInt())).thenReturn(mockPage);

        ResponseEntity<Page<AuditLog>> response = auditController.getLogsByUser("user123", 0, 20);

        assertEquals(200, response.getStatusCode().value());
    }

    @Test
    public void testGetLogsByDateRange() {
        LocalDateTime start = LocalDateTime.now().minusDays(7);
        LocalDateTime end = LocalDateTime.now();
        List<AuditLog> logs = Arrays.asList(new AuditLog());
        
        when(auditService.getLogsByDateRange(start, end)).thenReturn(logs);

        ResponseEntity<List<AuditLog>> response = auditController.getLogsByDateRange(start, end);

        assertEquals(200, response.getStatusCode().value());
        assertEquals(1, response.getBody().size());
    }

    @Test
    public void testGetErrorLogs() {
        List<AuditLog> errorLogs = Arrays.asList(new AuditLog());
        when(auditService.getErrorLogs()).thenReturn(errorLogs);

        ResponseEntity<List<AuditLog>> response = auditController.getErrorLogs();

        assertEquals(200, response.getStatusCode().value());
    }

    @Test
    public void testSearchLogs() {
        List<AuditLog> results = Arrays.asList(new AuditLog());
        when(auditService.searchLogs("keyword")).thenReturn(results);

        ResponseEntity<List<AuditLog>> response = auditController.searchLogs("keyword");

        assertEquals(200, response.getStatusCode().value());
    }

    @Test
    public void testGetStatistics() {
        AuditStatsDTO stats = new AuditStatsDTO();
        stats.setTotalLogs(100L);
        when(auditService.getStatistics()).thenReturn(stats);

        ResponseEntity<AuditStatsDTO> response = auditController.getStatistics(null, null);

        assertEquals(200, response.getStatusCode().value());
        assertEquals(100L, response.getBody().getTotalLogs());
    }
}
