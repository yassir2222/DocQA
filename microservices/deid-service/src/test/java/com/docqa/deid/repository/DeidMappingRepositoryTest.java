package com.docqa.deid.repository;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

import com.docqa.deid.model.DeidMapping;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

public class DeidMappingRepositoryTest {

    @Mock
    private DeidMappingRepository deidMappingRepository;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testFindByDocumentId() {
        DeidMapping mapping = new DeidMapping("doc-001", "Jean", "[PERSON_1]", "PERSON");
        
        when(deidMappingRepository.findByDocumentId("doc-001"))
            .thenReturn(Arrays.asList(mapping));
        
        List<DeidMapping> result = deidMappingRepository.findByDocumentId("doc-001");
        
        assertEquals(1, result.size());
        assertEquals("doc-001", result.get(0).getDocumentId());
    }

    @Test
    public void testFindByDocumentId_Empty() {
        when(deidMappingRepository.findByDocumentId("unknown"))
            .thenReturn(Collections.emptyList());
        
        List<DeidMapping> result = deidMappingRepository.findByDocumentId("unknown");
        
        assertTrue(result.isEmpty());
    }

    @Test
    public void testFindByDocumentId_Multiple() {
        DeidMapping m1 = new DeidMapping("doc-001", "Jean", "[PERSON_1]", "PERSON");
        DeidMapping m2 = new DeidMapping("doc-001", "email@test.com", "[EMAIL_1]", "EMAIL");
        DeidMapping m3 = new DeidMapping("doc-001", "0612345678", "[PHONE_1]", "PHONE");
        
        when(deidMappingRepository.findByDocumentId("doc-001"))
            .thenReturn(Arrays.asList(m1, m2, m3));
        
        List<DeidMapping> result = deidMappingRepository.findByDocumentId("doc-001");
        
        assertEquals(3, result.size());
    }

    @Test
    public void testFindByEntityType() {
        DeidMapping mapping = new DeidMapping("doc-001", "Jean", "[PERSON_1]", "PERSON");
        
        when(deidMappingRepository.findByEntityType("PERSON"))
            .thenReturn(Arrays.asList(mapping));
        
        List<DeidMapping> result = deidMappingRepository.findByEntityType("PERSON");
        
        assertEquals(1, result.size());
    }

    @Test
    public void testFindByOriginalValue() {
        DeidMapping mapping = new DeidMapping("doc-001", "Jean DUPONT", "[PERSON_1]", "PERSON");
        
        when(deidMappingRepository.findByOriginalValue("Jean DUPONT"))
            .thenReturn(mapping);
        
        DeidMapping result = deidMappingRepository.findByOriginalValue("Jean DUPONT");
        
        assertNotNull(result);
        assertEquals("Jean DUPONT", result.getOriginalValue());
    }

    @Test
    public void testFindByAnonymizedValue() {
        DeidMapping mapping = new DeidMapping("doc-001", "Jean", "[PERSON_ABC]", "PERSON");
        
        when(deidMappingRepository.findByAnonymizedValue("[PERSON_ABC]"))
            .thenReturn(mapping);
        
        DeidMapping result = deidMappingRepository.findByAnonymizedValue("[PERSON_ABC]");
        
        assertNotNull(result);
        assertEquals("[PERSON_ABC]", result.getAnonymizedValue());
    }

    @Test
    public void testSave() {
        DeidMapping mapping = new DeidMapping("doc-001", "Original", "[ANON]", "PERSON");
        
        when(deidMappingRepository.save(any(DeidMapping.class)))
            .thenReturn(mapping);
        
        DeidMapping result = deidMappingRepository.save(mapping);
        
        assertNotNull(result);
        assertEquals("doc-001", result.getDocumentId());
    }

    @Test
    public void testSaveAll() {
        List<DeidMapping> mappings = Arrays.asList(
            new DeidMapping("doc-001", "Value1", "[ANON_1]", "PERSON"),
            new DeidMapping("doc-001", "Value2", "[ANON_2]", "EMAIL")
        );
        
        when(deidMappingRepository.saveAll(anyList()))
            .thenReturn(mappings);
        
        List<DeidMapping> result = deidMappingRepository.saveAll(mappings);
        
        assertEquals(2, result.size());
    }

    @Test
    public void testCount() {
        when(deidMappingRepository.count()).thenReturn(50L);
        
        long count = deidMappingRepository.count();
        
        assertEquals(50L, count);
    }

    @Test
    public void testFindById() {
        DeidMapping mapping = new DeidMapping("doc-001", "Value", "[ANON]", "PERSON");
        mapping.setId(1L);
        
        when(deidMappingRepository.findById(1L))
            .thenReturn(Optional.of(mapping));
        
        Optional<DeidMapping> result = deidMappingRepository.findById(1L);
        
        assertTrue(result.isPresent());
    }
}
