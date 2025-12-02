package com.docqa.deid.service;

import com.docqa.deid.exception.DeidException;
import com.docqa.deid.model.DeidRequest;
import com.docqa.deid.model.Pseudonym;
import com.docqa.deid.repository.PseudonymRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class DeidService {

    private final NERService nerService;
    private final PseudonymService pseudonymService;
    private final PseudonymRepository pseudonymRepository;

    @Autowired
    public DeidService(NERService nerService, PseudonymService pseudonymService, PseudonymRepository pseudonymRepository) {
        this.nerService = nerService;
        this.pseudonymService = pseudonymService;
        this.pseudonymRepository = pseudonymRepository;
    }

    public String anonymize(DeidRequest deidRequest) {
        try {
            String content = deidRequest.getDocumentContent();
            List<String> sensitiveData = nerService.extractSensitiveData(content);

            String anonymizedContent = content;
            for (String data : sensitiveData) {
                String pseudonymValue = "PERSON_" + UUID.randomUUID().toString().substring(0, 8);
                Pseudonym pseudonym = new Pseudonym(data, pseudonymValue);
                pseudonymService.createPseudonym(pseudonym);
                anonymizedContent = anonymizedContent.replace(data, pseudonymValue);
            }
            return anonymizedContent;
        } catch (Exception e) {
            throw new DeidException("Error during document anonymization", e);
        }
    }
}