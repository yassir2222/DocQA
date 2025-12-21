package com.docqa.audit.repository;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

import com.docqa.audit.model.AuditLog;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
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

public class AuditLogRepositoryTest {

    @Mock
    private AuditLogRepository auditLogRepository;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testFindByUserIdOrderByCreatedAtDesc() {
        AuditLog log = new AuditLog();
        log.setUserId("user123");
        
        Page<AuditLog> page = new PageImpl<>(Collections.singletonList(log));
        when(auditLogRepository.findByUserIdOrderByCreatedAtDesc(eq("user123"), any(Pageable.class))).thenReturn(page);
        
        Page<AuditLog> result = auditLogRepository.findByUserIdOrderByCreatedAtDesc("user123", Pageable.unpaged());
        
        assertEquals(1, result.getContent().size());
    }

    @Test
    public void testFindByActionOrderByCreatedAtDesc() {
        AuditLog log = new AuditLog();
        log.setAction("UPLOAD");
        
        when(auditLogRepository.findByActionOrderByCreatedAtDesc("UPLOAD")).thenReturn(Collections.singletonList(log));
        
        List<AuditLog> result = auditLogRepository.findByActionOrderByCreatedAtDesc("UPLOAD");
        
        assertEquals(1, result.size());
    }

    @Test
    public void testFindByDateRange() {
        LocalDateTime start = LocalDateTime.now().minusDays(7);
        LocalDateTime end = LocalDateTime.now();
        
        when(auditLogRepository.findByDateRange(start, end))
            .thenReturn(Collections.emptyList());
        
        List<AuditLog> result = auditLogRepository.findByDateRange(start, end);
        
        assertNotNull(result);
    }

    @Test
    public void testFindByStatusOrderByCreatedAtDesc() {
        when(auditLogRepository.findByStatusOrderByCreatedAtDesc("ERROR"))
            .thenReturn(Collections.singletonList(new AuditLog()));
        
        List<AuditLog> result = auditLogRepository.findByStatusOrderByCreatedAtDesc("ERROR");
        
        assertEquals(1, result.size());
    }

    @Test
    public void testCountByAction() {
        Object[] row = new Object[]{"QUERY", 100L};
        when(auditLogRepository.countByAction()).thenReturn(Collections.singletonList(row));
        
        List<Object[]> result = auditLogRepository.countByAction();
        
        assertEquals(1, result.size());
    }

    @Test
    public void testCountByService() {
        Object[] row = new Object[]{"api-gateway", 50L};
        when(auditLogRepository.countByService()).thenReturn(Collections.singletonList(row));
        
        List<Object[]> result = auditLogRepository.countByService();
        
        assertEquals(1, result.size());
    }

    @Test
    public void testSearchByQueryText() {
        when(auditLogRepository.searchByQueryText("keyword"))
            .thenReturn(Collections.singletonList(new AuditLog()));
        
        List<AuditLog> result = auditLogRepository.searchByQueryText("keyword");
        
        assertEquals(1, result.size());
    }

    @Test
    public void testAverageProcessingTimeByService() {
        Object[] row = new Object[]{"api-gateway", 150.0};
        when(auditLogRepository.averageProcessingTimeByService()).thenReturn(Collections.singletonList(row));
        
        List<Object[]> result = auditLogRepository.averageProcessingTimeByService();
        
        assertEquals(1, result.size());
    }

    @Test
    public void testFindById() {
        AuditLog log = new AuditLog();
        log.setId(1L);
        
        when(auditLogRepository.findById(1L)).thenReturn(Optional.of(log));
        
        Optional<AuditLog> result = auditLogRepository.findById(1L);
        
        assertTrue(result.isPresent());
        assertEquals(1L, result.get().getId());
    }

    @Test
    public void testFindById_NotFound() {
        when(auditLogRepository.findById(999L)).thenReturn(Optional.empty());
        
        Optional<AuditLog> result = auditLogRepository.findById(999L);
        
        assertFalse(result.isPresent());
    }

    @Test
    public void testSaveLog() {
        AuditLog log = new AuditLog();
        log.setAction("TEST");
        
        when(auditLogRepository.save(any(AuditLog.class))).thenReturn(log);
        
        AuditLog result = auditLogRepository.save(log);
        
        assertNotNull(result);
    }

    @Test
    public void testFindByServiceOrderByCreatedAtDesc() {
        when(auditLogRepository.findByServiceOrderByCreatedAtDesc("api-gateway"))
            .thenReturn(Collections.singletonList(new AuditLog()));
        
        List<AuditLog> result = auditLogRepository.findByServiceOrderByCreatedAtDesc("api-gateway");
        
        assertEquals(1, result.size());
    }
}
