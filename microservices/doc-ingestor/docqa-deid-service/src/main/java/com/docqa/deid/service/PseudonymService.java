package com.docqa.deid.service;

import com.docqa.deid.model.Pseudonym;
import com.docqa.deid.repository.PseudonymRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class PseudonymService {

    private final PseudonymRepository pseudonymRepository;

    @Autowired
    public PseudonymService(PseudonymRepository pseudonymRepository) {
        this.pseudonymRepository = pseudonymRepository;
    }

    public Pseudonym createPseudonym(Pseudonym pseudonym) {
        return pseudonymRepository.save(pseudonym);
    }

    public Optional<Pseudonym> getPseudonymById(Long id) {
        return pseudonymRepository.findById(id);
    }

    public void deletePseudonym(Long id) {
        pseudonymRepository.deleteById(id);
    }
}