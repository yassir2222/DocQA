package com.docqa.deid.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Service de reconnaissance d'entités nommées (NER) pour les documents médicaux
 * Spécialisé pour le français et le contexte médical
 */
@Service
public class MedicalNERService {

    private static final Logger logger = LoggerFactory.getLogger(MedicalNERService.class);

    // Pattern pour détecter les noms français (Prénom Nom, Dr. Nom, etc.)
    private static final Pattern NAME_PATTERN = Pattern.compile(
        "(?:(?:Dr\\.?|Docteur|Pr\\.?|Professeur|M\\.?|Mme\\.?|Mlle\\.?)\\s+)?" +
        "([A-ZÀÂÄÉÈÊËÏÎÔÙÛÜÇ][a-zàâäéèêëïîôùûüç]+(?:-[A-ZÀÂÄÉÈÊËÏÎÔÙÛÜÇ][a-zàâäéèêëïîôùûüç]+)?)" +
        "\\s+" +
        "([A-ZÀÂÄÉÈÊËÏÎÔÙÛÜÇ][A-ZÀÂÄÉÈÊËÏÎÔÙÛÜÇ]+(?:-[A-ZÀÂÄÉÈÊËÏÎÔÙÛÜÇ]+)?)"
    );

    // Mots-clés contextuels médicaux qui précèdent souvent un nom
    private static final Pattern MEDICAL_CONTEXT_NAME = Pattern.compile(
        "(?:patient[e]?|malade|sujet|hospitalisé[e]?|consulte|examiné[e]?|traité[e]?)\\s*:?\\s*" +
        "([A-ZÀÂÄÉÈÊËÏÎÔÙÛÜÇ][a-zàâäéèêëïîôùûüç]+(?:\\s+[A-ZÀÂÄÉÈÊËÏÎÔÙÛÜÇ][A-ZÀÂÄÉÈÊËÏÎÔÙÛÜÇ]+)?)",
        Pattern.CASE_INSENSITIVE
    );

    // Patterns pour les titres médicaux
    private static final Pattern DOCTOR_NAME_PATTERN = Pattern.compile(
        "(?:Dr\\.?|Docteur|Pr\\.?|Professeur)\\s+([A-ZÀÂÄÉÈÊËÏÎÔÙÛÜÇ][a-zàâäéèêëïîôùûüç]+(?:\\s+[A-ZÀÂÄÉÈÊËÏÎÔÙÛÜÇ]+)?)",
        Pattern.CASE_INSENSITIVE
    );

    /**
     * Extrait les noms de personnes d'un texte médical
     */
    public List<String> extractPersonNames(String text) {
        List<String> names = new ArrayList<>();
        
        // 1. Détecter les noms avec titres médicaux (Dr., Pr., etc.)
        extractMatches(text, DOCTOR_NAME_PATTERN, names);
        
        // 2. Détecter les noms précédés de contextes médicaux
        extractMatches(text, MEDICAL_CONTEXT_NAME, names);
        
        // 3. Détecter les noms standard (Prénom NOM)
        Matcher nameMatcher = NAME_PATTERN.matcher(text);
        while (nameMatcher.find()) {
            String fullName = nameMatcher.group(0);
            // Éviter les faux positifs avec des termes médicaux
            if (!isMedicalTerm(fullName) && !names.contains(fullName)) {
                names.add(fullName);
                logger.debug("Nom détecté: {}", fullName);
            }
        }
        
        logger.info("📋 {} noms de personnes détectés", names.size());
        return names;
    }

    /**
     * Extrait les correspondances d'un pattern
     */
    private void extractMatches(String text, Pattern pattern, List<String> results) {
        Matcher matcher = pattern.matcher(text);
        while (matcher.find()) {
            String match = matcher.group(0);
            if (!results.contains(match)) {
                results.add(match);
            }
        }
    }

    /**
     * Vérifie si le texte est un terme médical courant (éviter les faux positifs)
     */
    private boolean isMedicalTerm(String text) {
        String lower = text.toLowerCase();
        String[] medicalTerms = {
            "groupe sanguin", "rhésus positif", "rhésus négatif",
            "voie orale", "voie intraveineuse", "prise unique",
            "traitement fond", "centre hospitalier", "service réanimation",
            "unité soins", "salle opération", "bloc opératoire"
        };
        
        for (String term : medicalTerms) {
            if (lower.contains(term)) {
                return true;
            }
        }
        return false;
    }
}
