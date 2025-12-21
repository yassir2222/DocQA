package com.docqa.indexeur.repository;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

import com.docqa.indexeur.model.Document;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

public class DocumentRepositoryTest {

    @Mock
    private DocumentRepository documentRepository;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testFindById() {
        Document doc = new Document();
        doc.setId(1L);
        doc.setFilename("test.pdf");
        
        when(documentRepository.findById(1L))
            .thenReturn(Optional.of(doc));
        
        Optional<Document> result = documentRepository.findById(1L);
        
        assertTrue(result.isPresent());
        assertEquals("test.pdf", result.get().getFilename());
    }

    @Test
    public void testFindById_NotFound() {
        when(documentRepository.findById(999L))
            .thenReturn(Optional.empty());
        
        Optional<Document> result = documentRepository.findById(999L);
        
        assertFalse(result.isPresent());
    }

    @Test
    public void testSave() {
        Document doc = new Document();
        doc.setFilename("new.pdf");
        doc.setContent("Content");
        
        when(documentRepository.save(any(Document.class)))
            .thenReturn(doc);
        
        Document result = documentRepository.save(doc);
        
        assertNotNull(result);
        assertEquals("new.pdf", result.getFilename());
    }

    @Test
    public void testDeleteById() {
        doNothing().when(documentRepository).deleteById(1L);
        
        assertDoesNotThrow(() -> documentRepository.deleteById(1L));
        
        verify(documentRepository).deleteById(1L);
    }

    @Test
    public void testCount() {
        when(documentRepository.count()).thenReturn(100L);
        
        long count = documentRepository.count();
        
        assertEquals(100L, count);
    }

    @Test
    public void testFindAll() {
        when(documentRepository.findAll())
            .thenReturn(Arrays.asList(new Document(), new Document()));
        
        List<Document> result = documentRepository.findAll();
        
        assertEquals(2, result.size());
    }

    @Test
    public void testFindAllPageable() {
        Page<Document> page = new PageImpl<>(Arrays.asList(new Document()));
        when(documentRepository.findAll(any(Pageable.class)))
            .thenReturn(page);
        
        Page<Document> result = documentRepository.findAll(Pageable.unpaged());
        
        assertEquals(1, result.getContent().size());
    }

    @Test
    public void testExistsById() {
        when(documentRepository.existsById(1L)).thenReturn(true);
        when(documentRepository.existsById(999L)).thenReturn(false);
        
        assertTrue(documentRepository.existsById(1L));
        assertFalse(documentRepository.existsById(999L));
    }

    @Test
    public void testSaveAll() {
        List<Document> docs = Arrays.asList(new Document(), new Document());
        when(documentRepository.saveAll(anyList())).thenReturn(docs);
        
        List<Document> result = documentRepository.saveAll(docs);
        
        assertEquals(2, result.size());
    }
}
