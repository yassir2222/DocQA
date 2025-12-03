package com.docqa.deid.service;

import com.docqa.deid.exception.DeidException;
import com.docqa.deid.model.DeidRequest;
import com.docqa.deid.model.DeidMapping;
import com.docqa.deid.repository.DeidMappingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.ArrayList;

/**
 * Service principal d'anonymisation des documents médicaux
 * Détecte et remplace les données personnelles sensibles
 */
@Service
public class DeidService {

    private static final Logger logger = LoggerFactory.getLogger(DeidService.class);

    private final MedicalNERService medicalNERService;
    private final DeidMappingRepository deidMappingRepository;

    // Patterns pour la détection d'informations sensibles (France)
    private static final Pattern PHONE_PATTERN = Pattern.compile(
        "(?:(?:\\+33|0033|0)\\s?[1-9](?:[\\s.-]?\\d{2}){4})"
    );
    
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}"
    );
    
    private static final Pattern SSN_PATTERN = Pattern.compile(
        "\\b[12]\\s?\\d{2}\\s?\\d{2}\\s?\\d{2}\\s?\\d{3}\\s?\\d{3}\\s?\\d{2}\\b"
    );
    
    private static final Pattern DATE_PATTERN = Pattern.compile(
        "\\b(0?[1-9]|[12][0-9]|3[01])[-/](0?[1-9]|1[012])[-/](19|20)?\\d{2}\\b"
    );
    
    private static final Pattern ADDRESS_PATTERN = Pattern.compile(
        "\\b\\d{1,4}[,\\s]+(?:rue|avenue|boulevard|place|chemin|allée|impasse|passage)\\s+[A-Za-zÀ-ÿ\\s-]+(?:\\d{5})?\\s*[A-Za-zÀ-ÿ-]*\\b",
        Pattern.CASE_INSENSITIVE
    );
    
    private static final Pattern IPP_PATTERN = Pattern.compile(
        "\\b(?:IPP|NIP|ID[:\\s]?)\\s*[A-Z0-9]{6,12}\\b",
        Pattern.CASE_INSENSITIVE
    );

    @Autowired
    public DeidService(MedicalNERService medicalNERService, DeidMappingRepository deidMappingRepository) {
        this.medicalNERService = medicalNERService;
        this.deidMappingRepository = deidMappingRepository;
    }

    /**
     * Anonymise un document médical
     */
    public String anonymize(DeidRequest deidRequest) {
        try {
            String content = deidRequest.getDocumentContent();
            String documentId = deidRequest.getDocumentId();
            List<DeidMapping> mappings = new ArrayList<>();
            
            logger.info("🔒 Début anonymisation du document {}", documentId);
            
            // 1. Détecter et remplacer les noms de personnes (NER)
            List<String> names = medicalNERService.extractPersonNames(content);
            for (String name : names) {
                String pseudonym = generatePseudonym("PERSON");
                content = content.replace(name, pseudonym);
                mappings.add(new DeidMapping(documentId, name, pseudonym, "PERSON"));
                logger.debug("  Nom anonymisé: {} -> {}", name, pseudonym);
            }
            
            // 2. Anonymiser les numéros de téléphone
            content = anonymizePattern(content, PHONE_PATTERN, "PHONE", documentId, mappings);
            
            // 3. Anonymiser les emails
            content = anonymizePattern(content, EMAIL_PATTERN, "EMAIL", documentId, mappings);
            
            // 4. Anonymiser les numéros de sécurité sociale
            content = anonymizePattern(content, SSN_PATTERN, "SSN", documentId, mappings);
            
            // 5. Anonymiser les dates de naissance (garder le format mais modifier)
            content = anonymizeDates(content, documentId, mappings);
            
            // 6. Anonymiser les adresses
            content = anonymizePattern(content, ADDRESS_PATTERN, "ADDRESS", documentId, mappings);
            
            // 7. Anonymiser les identifiants patients (IPP)
            content = anonymizePattern(content, IPP_PATTERN, "IPP", documentId, mappings);
            
            // Sauvegarder les mappings
            deidMappingRepository.saveAll(mappings);
            
            logger.info("✅ Anonymisation terminée: {} entités détectées", mappings.size());
            
            return content;
            
        } catch (Exception e) {
            logger.error("❌ Erreur lors de l'anonymisation: {}", e.getMessage());
            throw new DeidException("Error during document anonymization", e);
        }
    }

    /**
     * Anonymise les occurrences d'un pattern
     */
    private String anonymizePattern(String content, Pattern pattern, String entityType, 
                                    String documentId, List<DeidMapping> mappings) {
        Matcher matcher = pattern.matcher(content);
        StringBuffer result = new StringBuffer();
        
        while (matcher.find()) {
            String original = matcher.group();
            String pseudonym = generatePseudonym(entityType);
            matcher.appendReplacement(result, pseudonym);
            mappings.add(new DeidMapping(documentId, original, pseudonym, entityType));
            logger.debug("  {} anonymisé: {} -> {}", entityType, original, pseudonym);
        }
        matcher.appendTail(result);
        
        return result.toString();
    }

    /**
     * Anonymise les dates (décale aléatoirement de +/- quelques jours)
     */
    private String anonymizeDates(String content, String documentId, List<DeidMapping> mappings) {
        Matcher matcher = DATE_PATTERN.matcher(content);
        StringBuffer result = new StringBuffer();
        
        while (matcher.find()) {
            String original = matcher.group();
            String pseudonym = "[DATE_ANONYMISÉE]";
            matcher.appendReplacement(result, pseudonym);
            mappings.add(new DeidMapping(documentId, original, pseudonym, "DATE"));
        }
        matcher.appendTail(result);
        
        return result.toString();
    }

    /**
     * Génère un pseudonyme unique pour un type d'entité
     */
    private String generatePseudonym(String entityType) {
        String uuid = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return "[" + entityType + "_" + uuid + "]";
    }
}
