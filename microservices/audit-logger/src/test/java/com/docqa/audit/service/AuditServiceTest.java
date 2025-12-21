package com.docqa.audit.service;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

import com.docqa.audit.dto.AuditLogDTO;
import com.docqa.audit.dto.AuditStatsDTO;
import com.docqa.audit.model.AuditLog;
import com.docqa.audit.repository.AuditLogRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

public class AuditServiceTest {

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private AuditService auditService;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testCreateLog_Basic() {
        AuditLogDTO dto = new AuditLogDTO();
        dto.setAction("DOCUMENT_UPLOAD");
        dto.setUserId("user123");

        AuditLog savedLog = new AuditLog();
        savedLog.setId(1L);
        savedLog.setAction("DOCUMENT_UPLOAD");

        when(auditLogRepository.save(any(AuditLog.class))).thenReturn(savedLog);

        AuditLog result = auditService.createLog(dto);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(auditLogRepository).save(any(AuditLog.class));
    }

    @Test
    public void testCreateLog_WithDocuments() throws Exception {
        AuditLogDTO dto = new AuditLogDTO();
        dto.setAction("QUERY");
        dto.setUserId("user123");
        dto.setDocumentsAccessed(Arrays.asList("doc1", "doc2"));

        AuditLog savedLog = new AuditLog();
        savedLog.setId(2L);

        when(objectMapper.writeValueAsString(anyList())).thenReturn("[\"doc1\",\"doc2\"]");
        when(auditLogRepository.save(any(AuditLog.class))).thenReturn(savedLog);

        AuditLog result = auditService.createLog(dto);

        assertNotNull(result);
    }

    @Test
    public void testCreateLog_AllFields() {
        AuditLogDTO dto = new AuditLogDTO();
        dto.setAction("SYNTHESIS");
        dto.setUserId("user123");
        dto.setResourceType("document");
        dto.setResourceId("doc-001");
        dto.setQueryText("some query");
        dto.setResponseSummary("summary");
        dto.setIpAddress("192.168.1.1");
        dto.setUserAgent("Mozilla/5.0");
        dto.setProcessingTimeMs(150);
        dto.setService("synthese-comparative");
        dto.setStatus("SUCCESS");

        AuditLog savedLog = new AuditLog();
        savedLog.setId(3L);

        when(auditLogRepository.save(any(AuditLog.class))).thenReturn(savedLog);

        AuditLog result = auditService.createLog(dto);

        assertNotNull(result);
    }

    @Test
    public void testGetLogs() {
        Page<AuditLog> page = new PageImpl<>(Arrays.asList(new AuditLog(), new AuditLog()));
        when(auditLogRepository.findAll(any(Pageable.class))).thenReturn(page);

        Page<AuditLog> result = auditService.getLogs(0, 20);

        assertEquals(2, result.getContent().size());
    }

    @Test
    public void testGetLogsByUser() {
        Page<AuditLog> page = new PageImpl<>(Collections.singletonList(new AuditLog()));
        when(auditLogRepository.findByUserIdOrderByCreatedAtDesc(eq("user123"), any(Pageable.class)))
            .thenReturn(page);

        Page<AuditLog> result = auditService.getLogsByUser("user123", 0, 20);

        assertEquals(1, result.getContent().size());
    }

    @Test
    public void testGetLogsByDateRange() {
        LocalDateTime start = LocalDateTime.now().minusDays(7);
        LocalDateTime end = LocalDateTime.now();
        
        when(auditLogRepository.findByDateRange(start, end))
            .thenReturn(Collections.singletonList(new AuditLog()));

        List<AuditLog> result = auditService.getLogsByDateRange(start, end);

        assertEquals(1, result.size());
    }

    @Test
    public void testGetErrorLogs() {
        when(auditLogRepository.findByStatusOrderByCreatedAtDesc("ERROR"))
            .thenReturn(Arrays.asList(new AuditLog()));

        List<AuditLog> result = auditService.getErrorLogs();

        assertEquals(1, result.size());
    }

    @Test
    public void testSearchLogs() {
        when(auditLogRepository.searchByQueryText("keyword"))
            .thenReturn(Collections.singletonList(new AuditLog()));

        List<AuditLog> result = auditService.searchLogs("keyword");

        assertEquals(1, result.size());
    }

    @Test
    public void testGetLogById_Found() {
        AuditLog log = new AuditLog();
        log.setId(1L);
        
        when(auditLogRepository.findById(1L)).thenReturn(Optional.of(log));

        AuditLog result = auditService.getLogById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
    }

    @Test
    public void testGetLogById_NotFound() {
        when(auditLogRepository.findById(999L)).thenReturn(Optional.empty());

        AuditLog result = auditService.getLogById(999L);

        assertNull(result);
    }

    @Test
    public void testGetStatistics() {
        when(auditLogRepository.count()).thenReturn(100L);
        when(auditLogRepository.countByAction()).thenReturn(Collections.emptyList());
        when(auditLogRepository.countByService()).thenReturn(Collections.emptyList());
        when(auditLogRepository.averageProcessingTimeByService()).thenReturn(Collections.emptyList());
        when(auditLogRepository.findByStatusOrderByCreatedAtDesc("ERROR")).thenReturn(Collections.emptyList());

        AuditStatsDTO result = auditService.getStatistics();

        assertNotNull(result);
        assertEquals(100L, result.getTotalLogs());
    }
}
