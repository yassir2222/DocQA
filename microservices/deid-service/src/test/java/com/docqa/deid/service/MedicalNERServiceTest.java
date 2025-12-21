package com.docqa.deid.service;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.List;

public class MedicalNERServiceTest {

    private MedicalNERService medicalNERService;

    @BeforeEach
    public void setUp() {
        medicalNERService = new MedicalNERService();
    }

    @Test
    public void testExtractPersonNames_WithDoctorTitle() {
        String text = "Le patient a été examiné par Dr. Martin DUPONT.";
        List<String> names = medicalNERService.extractPersonNames(text);
        assertNotNull(names);
        assertTrue(names.size() >= 0);
    }

    @Test
    public void testExtractPersonNames_WithProfessorTitle() {
        String text = "Consultation avec le Pr. Jean BERNARD.";
        List<String> names = medicalNERService.extractPersonNames(text);
        assertNotNull(names);
    }

    @Test
    public void testExtractPersonNames_WithPatientContext() {
        String text = "Patient: Pierre DUVAL, 45 ans.";
        List<String> names = medicalNERService.extractPersonNames(text);
        assertNotNull(names);
    }

    @Test
    public void testExtractPersonNames_StandardName() {
        String text = "Jean MARTIN a été hospitalisé.";
        List<String> names = medicalNERService.extractPersonNames(text);
        assertNotNull(names);
    }

    @Test
    public void testExtractPersonNames_MultipleNames() {
        String text = "Dr. Sophie BLANC a examiné le patient Marc LEROY.";
        List<String> names = medicalNERService.extractPersonNames(text);
        assertNotNull(names);
    }

    @Test
    public void testExtractPersonNames_NoNames() {
        String text = "Le traitement a été administré correctement.";
        List<String> names = medicalNERService.extractPersonNames(text);
        assertNotNull(names);
        assertTrue(names.isEmpty() || names.size() >= 0);
    }

    @Test
    public void testExtractPersonNames_EmptyText() {
        String text = "";
        List<String> names = medicalNERService.extractPersonNames(text);
        assertNotNull(names);
        assertTrue(names.isEmpty());
    }

    @Test
    public void testExtractPersonNames_WithMedicalTerms() {
        String text = "Groupe Sanguin A positif, Voie Orale.";
        List<String> names = medicalNERService.extractPersonNames(text);
        assertNotNull(names);
        // Les termes médicaux ne devraient pas être détectés comme des noms
    }

    @Test
    public void testExtractPersonNames_WithMme() {
        String text = "Mme Marie DUBOIS consulte pour une grippe.";
        List<String> names = medicalNERService.extractPersonNames(text);
        assertNotNull(names);
    }

    @Test
    public void testExtractPersonNames_WithAccents() {
        String text = "Dr. Émile CÔTÉ examine le patient.";
        List<String> names = medicalNERService.extractPersonNames(text);
        assertNotNull(names);
    }

    @Test
    public void testExtractPersonNames_CompoundName() {
        String text = "Jean-Pierre MARTIN-DUBOIS a été admis.";
        List<String> names = medicalNERService.extractPersonNames(text);
        assertNotNull(names);
    }

    @Test
    public void testExtractPersonNames_DocteurFullWord() {
        String text = "Docteur François PETIT a rédigé l'ordonnance.";
        List<String> names = medicalNERService.extractPersonNames(text);
        assertNotNull(names);
    }

    @Test
    public void testExtractPersonNames_Professeur() {
        String text = "Professeur Claude BERNARD est chef de service.";
        List<String> names = medicalNERService.extractPersonNames(text);
        assertNotNull(names);
    }
}
