package com.docqa.audit.repository;

import com.docqa.audit.model.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository pour les logs d'audit
 */
@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    /**
     * Trouve les logs par utilisateur
     */
    Page<AuditLog> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);

    /**
     * Trouve les logs par action
     */
    List<AuditLog> findByActionOrderByCreatedAtDesc(String action);

    /**
     * Trouve les logs par service
     */
    List<AuditLog> findByServiceOrderByCreatedAtDesc(String service);

    /**
     * Trouve les logs dans une période donnée
     */
    @Query("SELECT a FROM AuditLog a WHERE a.createdAt BETWEEN :start AND :end ORDER BY a.createdAt DESC")
    List<AuditLog> findByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    /**
     * Compte les logs par action
     */
    @Query("SELECT a.action, COUNT(a) FROM AuditLog a GROUP BY a.action")
    List<Object[]> countByAction();

    /**
     * Compte les logs par service
     */
    @Query("SELECT a.service, COUNT(a) FROM AuditLog a GROUP BY a.service")
    List<Object[]> countByService();

    /**
     * Trouve les logs avec erreurs
     */
    List<AuditLog> findByStatusOrderByCreatedAtDesc(String status);

    /**
     * Recherche par texte dans la requête
     */
    @Query("SELECT a FROM AuditLog a WHERE LOWER(a.queryText) LIKE LOWER(CONCAT('%', :keyword, '%')) ORDER BY a.createdAt DESC")
    List<AuditLog> searchByQueryText(@Param("keyword") String keyword);

    /**
     * Temps moyen de traitement par service
     */
    @Query("SELECT a.service, AVG(a.processingTimeMs) FROM AuditLog a WHERE a.processingTimeMs IS NOT NULL GROUP BY a.service")
    List<Object[]> averageProcessingTimeByService();
}
