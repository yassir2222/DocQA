package com.docqa.deid.model;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "pseudonyms")
public class Pseudonym {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String originalData;
    private String pseudonymData;

    public Pseudonym() {
    }

    public Pseudonym(String originalData, String pseudonymData) {
        this.originalData = originalData;
        this.pseudonymData = pseudonymData;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getOriginalData() {
        return originalData;
    }

    public void setOriginalData(String originalData) {
        this.originalData = originalData;
    }

    public String getPseudonymData() {
        return pseudonymData;
    }

    public void setPseudonymData(String pseudonymData) {
        this.pseudonymData = pseudonymData;
    }
}