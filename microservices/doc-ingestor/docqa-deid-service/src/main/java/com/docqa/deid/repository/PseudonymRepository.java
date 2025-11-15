package com.docqa.deid.repository;

import com.docqa.deid.model.Pseudonym;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PseudonymRepository extends JpaRepository<Pseudonym, Long> {
    // Additional query methods can be defined here if needed
}