package com.docqa.audit;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Application principale du service AuditLogger
 * Gère la traçabilité et l'audit des interactions dans DocQA
 */
@SpringBootApplication
public class AuditLoggerApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuditLoggerApplication.class, args);
    }
}
