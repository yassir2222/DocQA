package com.docqa.deid.service;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

import com.docqa.deid.model.Pseudonym;
import com.docqa.deid.repository.PseudonymRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

public class PseudonymServiceTest {

    @InjectMocks
    private PseudonymService pseudonymService;

    @Mock
    private PseudonymRepository pseudonymRepository;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testCreatePseudonym() {
        Pseudonym pseudonym = new Pseudonym("John Doe", "[PERSON_12345678]");
        when(pseudonymRepository.save(any(Pseudonym.class))).thenReturn(pseudonym);

        Pseudonym result = pseudonymService.createPseudonym(pseudonym);

        assertNotNull(result);
        assertEquals("John Doe", result.getOriginalData());
        assertEquals("[PERSON_12345678]", result.getPseudonymData());
        verify(pseudonymRepository, times(1)).save(any(Pseudonym.class));
    }

    @Test
    public void testGetPseudonymById_Found() {
        Pseudonym pseudonym = new Pseudonym("Jane Smith", "[PERSON_87654321]");
        pseudonym.setId(1L);
        when(pseudonymRepository.findById(1L)).thenReturn(Optional.of(pseudonym));

        Optional<Pseudonym> result = pseudonymService.getPseudonymById(1L);

        assertTrue(result.isPresent());
        assertEquals("Jane Smith", result.get().getOriginalData());
        verify(pseudonymRepository, times(1)).findById(1L);
    }

    @Test
    public void testGetPseudonymById_NotFound() {
        when(pseudonymRepository.findById(999L)).thenReturn(Optional.empty());

        Optional<Pseudonym> result = pseudonymService.getPseudonymById(999L);

        assertFalse(result.isPresent());
        verify(pseudonymRepository, times(1)).findById(999L);
    }

    @Test
    public void testDeletePseudonym() {
        doNothing().when(pseudonymRepository).deleteById(1L);

        pseudonymService.deletePseudonym(1L);

        verify(pseudonymRepository, times(1)).deleteById(1L);
    }
}
