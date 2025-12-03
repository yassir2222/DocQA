package com.docqa.synthese;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Application principale du service SynthèseComparative
 * Génère des synthèses et comparaisons de documents médicaux
 */
@SpringBootApplication
public class SyntheseComparativeApplication {

    public static void main(String[] args) {
        SpringApplication.run(SyntheseComparativeApplication.class, args);
    }
}
