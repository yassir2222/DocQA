package com.docqa.indexeur.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;

import java.time.LocalDateTime;

@Entity
@Table(name = "indexed_documents")
@Data
@NoArgsConstructor
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "original_doc_id")
    private String originalDocId;

    private String filename;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "embedding", columnDefinition = "float8[]")
    private double[] embedding; // Using double[] for JPA mapping to PostgreSQL array

    private LocalDateTime indexedAt;

    @PrePersist
    protected void onCreate() {
        indexedAt = LocalDateTime.now();
    }
}
