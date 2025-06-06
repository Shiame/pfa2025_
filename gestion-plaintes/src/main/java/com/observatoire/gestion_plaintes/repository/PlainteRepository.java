package com.observatoire.gestion_plaintes.repository;

import com.observatoire.gestion_plaintes.model.Plainte;
import com.observatoire.gestion_plaintes.model.StatutPlainte;
import com.observatoire.gestion_plaintes.model.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PlainteRepository extends JpaRepository<Plainte, Long>, JpaSpecificationExecutor<Plainte> {
    List<Plainte> findByUtilisateur(Utilisateur utilisateur);
    @Query("  SELECT p.zone, p.categorie.nom, COUNT(p) " +
            " FROM Plainte p " +
            " WHERE p.dateSoumission BETWEEN :from AND :to " +
            " GROUP BY p.zone, p.categorie.nom " +
            " ORDER BY p.zone ASC, p.categorie.nom ASC")
    List<Object[]> countByZoneAndCategorie(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );

    @Query(nativeQuery = true, value = """
    SELECT 
        COALESCE(zone, 'Inconnu') AS commune, 
        COUNT(*) AS total 
    FROM plainte 
    WHERE date_soumission BETWEEN ?1 AND ?2
    GROUP BY commune 
    ORDER BY total DESC 
    LIMIT 5""")
    List<Object[]> findTopCommunes(LocalDateTime start, LocalDateTime end);

    @Query("""
  SELECT COALESCE(p.zone, 'Zone inconnue') as zone, 
         COALESCE(c.nom, 'Catégorie inconnue') as categorie,
         COUNT(p) as total,
         SUM(CASE WHEN p.statut = 'RESOLUE' THEN 1 ELSE 0 END) as resolues,
         CASE 
           WHEN COUNT(p) = 0 THEN 0.0
           ELSE ROUND(
             CAST(SUM(CASE WHEN p.statut = 'RESOLUE' THEN 1 ELSE 0 END) AS DOUBLE) * 100.0 / 
             CAST(COUNT(p) AS DOUBLE), 
             1
           )
         END as taux
  FROM   Plainte p
  LEFT JOIN p.categorie c
  WHERE  p.dateSoumission BETWEEN :from AND :to
  GROUP  BY COALESCE(p.zone, 'Zone inconnue'), COALESCE(c.nom, 'Catégorie inconnue')
  HAVING COUNT(p) > 0
  ORDER BY zone ASC, categorie ASC
""")
    List<Object[]> calculateTauxResolution(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );


    @Query(value = """
        SELECT 
            EXTRACT(HOUR FROM p.date_soumission) AS heure,
            COUNT(*) AS total
        FROM plainte p
        GROUP BY heure
        ORDER BY heure""",
          nativeQuery = true)
    List<Object[]> countByHeure();

    @Query("""
        SELECT p.zone, p.latitude, p.longitude, COUNT(p)
        FROM Plainte p
        WHERE p.dateSoumission >= :since
        GROUP BY p.zone, p.latitude, p.longitude
        """)
    List<Object[]> countByZoneWithCoords(
            @Param("since") LocalDateTime since
    );

    // ============================================================================
    // NEW METHODS FOR ENHANCED NLP SERVICE
    // ============================================================================

    /**
     * Get recent complaints for summary generation
     * Used by EnhancedNLPService.generateIntelligentSummaries()
     */
    @Query("SELECT p.zone, p.categorie.nom, COUNT(p) " +
            "FROM Plainte p " +
            "WHERE p.dateSoumission >= :from " +
            "GROUP BY p.zone, p.categorie.nom " +
            "ORDER BY COUNT(p) DESC, p.zone ASC")
    List<Object[]> countRecentByZoneAndCategory(@Param("from") LocalDateTime from);

    /**
     * Count complaints in specific time window for anomaly detection
     * Used by EnhancedNLPService.analyzeTrends()
     */
    @Query("SELECT COUNT(p) FROM Plainte p " +
            "WHERE p.zone = :zone AND p.categorie.nom = :category " +
            "AND p.dateSoumission BETWEEN :from AND :to")
    Long countByZoneAndCategoryInPeriod(
            @Param("zone") String zone,
            @Param("category") String category,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );

    /**
     * Get all unique zone-category combinations for comprehensive analysis
     * Used by EnhancedNLPService.detectAnomalies()
     */
    @Query("SELECT DISTINCT p.zone, p.categorie.nom " +
            "FROM Plainte p " +
            "WHERE p.dateSoumission >= :since " +
            "ORDER BY p.zone, p.categorie.nom")
    List<Object[]> getDistinctZoneCategoryCombinations(@Param("since") LocalDateTime since);

    /**
     * Get recent complaints with full details for NLP analysis
     * Used by EnhancedNLPService.getComprehensiveAnalysis()
     */
    @Query("SELECT p FROM Plainte p " +
            "WHERE p.dateSoumission >= :from " +
            "ORDER BY p.dateSoumission DESC")
    List<Plainte> findRecentComplaints(@Param("from") LocalDateTime from);

    /**
     * Get recent complaints filtered by zone
     * Used by EnhancedNLPService for zone-specific analysis
     */
    @Query("SELECT p FROM Plainte p " +
            "WHERE p.dateSoumission >= :from " +
            "AND (:zone IS NULL OR p.zone = :zone) " +
            "ORDER BY p.dateSoumission DESC")
    List<Plainte> findRecentComplaintsByZone(
            @Param("from") LocalDateTime from,
            @Param("zone") String zone
    );

    /**
     * Get complaints by hour of day for time-aware summaries
     * Enhanced version with zone and category grouping
     */
    @Query("SELECT EXTRACT(HOUR FROM p.dateSoumission) as hour, " +
            "p.zone, p.categorie.nom, COUNT(p) " +
            "FROM Plainte p " +
            "WHERE p.dateSoumission BETWEEN :from AND :to " +
            "GROUP BY EXTRACT(HOUR FROM p.dateSoumission), p.zone, p.categorie.nom " +
            "ORDER BY hour, p.zone, p.categorie.nom")
    List<Object[]> countByHourZoneAndCategory(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );

    /**
     * Get complaints with high priority for immediate attention alerts
     */
    @Query("SELECT p FROM Plainte p " +
            "WHERE p.dateSoumission >= :from " +
            "AND p.priorite >= :minPriority " +
            "ORDER BY p.priorite DESC, p.dateSoumission DESC")
    List<Plainte> findHighPriorityComplaints(
            @Param("from") LocalDateTime from,
            @Param("minPriority") Integer minPriority
    );

    /**
     * Count complaints by status for dashboard metrics
     */
    @Query("SELECT p.statut, COUNT(p) " +
            "FROM Plainte p " +
            "WHERE p.dateSoumission >= :from " +
            "GROUP BY p.statut")
    List<Object[]> countByStatus(@Param("from") LocalDateTime from);

    /**
     * Get complaints with their analysis data for comprehensive reporting
     */
    @Query("SELECT p, p.analyseIA FROM Plainte p " +
            "LEFT JOIN p.analyseIA " +
            "WHERE p.dateSoumission >= :from " +
            "ORDER BY p.dateSoumission DESC")
    List<Object[]> findComplaintsWithAnalysis(@Param("from") LocalDateTime from);

    /**
     * Count complaints by zone and priority level
     */
    @Query("SELECT p.zone, " +
            "SUM(CASE WHEN p.priorite >= 15 THEN 1 ELSE 0 END) as high_priority, " +
            "SUM(CASE WHEN p.priorite >= 8 AND p.priorite < 15 THEN 1 ELSE 0 END) as medium_priority, " +
            "SUM(CASE WHEN p.priorite < 8 THEN 1 ELSE 0 END) as low_priority, " +
            "COUNT(p) as total " +
            "FROM Plainte p " +
            "WHERE p.dateSoumission >= :from " +
            "GROUP BY p.zone " +
            "ORDER BY total DESC")
    List<Object[]> countByZoneAndPriority(@Param("from") LocalDateTime from);

    /**
     * Get trending categories (categories with increasing complaint counts)
     */
    @Query(nativeQuery = true, value = """
        WITH current_period AS (
            SELECT c.nom as category, COUNT(*) as current_count
            FROM plainte p
            JOIN categorie c ON p.categorie_id = c.id
            WHERE p.date_soumission >= :currentStart
            GROUP BY c.nom
        ),
        previous_period AS (
            SELECT c.nom as category, COUNT(*) as previous_count
            FROM plainte p
            JOIN categorie c ON p.categorie_id = c.id
            WHERE p.date_soumission >= :previousStart 
            AND p.date_soumission < :currentStart
            GROUP BY c.nom
        )
        SELECT 
            COALESCE(curr.category, prev.category) as category,
            COALESCE(curr.current_count, 0) as current_count,
            COALESCE(prev.previous_count, 0) as previous_count,
            CASE 
                WHEN prev.previous_count = 0 THEN 100.0
                ELSE ((COALESCE(curr.current_count, 0) - prev.previous_count) * 100.0 / prev.previous_count)
            END as percentage_change
        FROM current_period curr
        FULL OUTER JOIN previous_period prev ON curr.category = prev.category
        WHERE COALESCE(curr.current_count, 0) > 0 OR prev.previous_count > 0
        ORDER BY percentage_change DESC
        """)
    List<Object[]> getTrendingCategories(
            @Param("currentStart") LocalDateTime currentStart,
            @Param("previousStart") LocalDateTime previousStart
    );

    /**
     * Get complaints needing follow-up (submitted but not updated recently)
     */
    @Query("SELECT p FROM Plainte p " +
            "WHERE p.dateSoumission <= :before " +
            "AND p.statut IN :statuses " +
            "ORDER BY p.dateSoumission ASC")
    List<Plainte> findComplaintsNeedingFollowUp(
            @Param("before") LocalDateTime before,
            @Param("statuses") List<StatutPlainte> statuses
    );


    /**
     * Comptage direct simple pour validation croisée
     */
    @Query("SELECT COUNT(p) FROM Plainte p WHERE p.dateSoumission BETWEEN :from AND :to")
    Long countByDateRange(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    /**
     * Requête détaillée pour analyse de cohérence
     */
    @Query("""
    SELECT 
        p.zone,
        c.nom as categorie,
        COUNT(p) as total,
        SUM(CASE WHEN p.statut = 'RESOLUE' THEN 1 ELSE 0 END) as resolues,
        SUM(CASE WHEN p.statut = 'EN_COURS' THEN 1 ELSE 0 END) as en_cours,
        SUM(CASE WHEN p.statut = 'EN_ATTENTE' THEN 1 ELSE 0 END) as en_attente,
        SUM(CASE WHEN p.statut = 'REJETEE' THEN 1 ELSE 0 END) as rejetees,
        AVG(COALESCE(p.priorite, 5)) as avg_priority,
        MIN(p.dateSoumission) as first_complaint,
        MAX(p.dateSoumission) as last_complaint
    FROM Plainte p 
    LEFT JOIN p.categorie c
    WHERE p.dateSoumission BETWEEN :from AND :to
    GROUP BY p.zone, c.nom
    ORDER BY total DESC
""")
    List<Object[]> getDetailedStats(@Param("from") LocalDateTime from,
                                    @Param("to") LocalDateTime to);

    /**
     * Validation de l'intégrité des données
     */
    @Query("""
    SELECT 
        COUNT(*) as total_records,
        COUNT(DISTINCT p.zone) as unique_zones,
        COUNT(DISTINCT c.nom) as unique_categories,
        COUNT(CASE WHEN p.zone IS NULL THEN 1 END) as null_zones,
        COUNT(CASE WHEN c.nom IS NULL THEN 1 END) as null_categories,
        COUNT(CASE WHEN p.priorite IS NULL THEN 1 END) as null_priorities,
        COUNT(CASE WHEN p.statut IS NULL THEN 1 END) as null_statuses
    FROM Plainte p 
    LEFT JOIN p.categorie c
    WHERE p.dateSoumission BETWEEN :from AND :to
""")
    Object[] getDataIntegrityStats(@Param("from") LocalDateTime from,
                                   @Param("to") LocalDateTime to);

    /**
     * Comparaison entre périodes pour détecter les anomalies
     */
    @Query("""
    SELECT 
        p.zone,
        c.nom as categorie,
        COUNT(p) as count,
        'current' as period
    FROM Plainte p 
    LEFT JOIN p.categorie c
    WHERE p.dateSoumission BETWEEN :currentFrom AND :currentTo
    GROUP BY p.zone, c.nom
    
    UNION ALL
    
    SELECT 
        p.zone,
        c.nom as categorie,
        COUNT(p) as count,
        'previous' as period
    FROM Plainte p 
    LEFT JOIN p.categorie c
    WHERE p.dateSoumission BETWEEN :previousFrom AND :previousTo
    GROUP BY p.zone, c.nom
    ORDER BY zone, categorie, period
""")
    List<Object[]> getComparativePeriodStats(
            @Param("currentFrom") LocalDateTime currentFrom,
            @Param("currentTo") LocalDateTime currentTo,
            @Param("previousFrom") LocalDateTime previousFrom,
            @Param("previousTo") LocalDateTime previousTo
    );

    /**
     * Obtenir les plaintes avec données IA pour analyse avancée
     */
    @Query("""
    SELECT p, a FROM Plainte p 
    LEFT JOIN p.analyseIA a
    WHERE p.dateSoumission BETWEEN :from AND :to
    ORDER BY p.dateSoumission DESC
""")
    List<Object[]> getPlaintesWithAIAnalysis(@Param("from") LocalDateTime from,
                                             @Param("to") LocalDateTime to);

    /**
     * Statistiques de performance par zone
     */
    @Query(nativeQuery = true, value = """
    WITH zone_stats AS (
        SELECT 
            COALESCE(zone, 'Zone Inconnue') as zone,
            COUNT(*) as total_plaintes,
            COUNT(CASE WHEN statut = 'RESOLUE' THEN 1 END) as resolues,
            AVG(CASE 
                WHEN statut = 'RESOLUE' 
                THEN EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - date_soumission))/3600 
                ELSE NULL 
            END) as avg_resolution_hours,
            COUNT(CASE WHEN priorite >= 15 THEN 1 END) as high_priority,
            COUNT(DISTINCT categorie_id) as categories_count
        FROM plainte 
        WHERE date_soumission BETWEEN :from AND :to
        GROUP BY zone
    )
    SELECT 
        zone,
        total_plaintes,
        resolues,
        CASE 
            WHEN total_plaintes > 0 
            THEN ROUND((resolues * 100.0 / total_plaintes), 1)
            ELSE 0 
        END as taux_resolution,
        COALESCE(ROUND(avg_resolution_hours, 1), 0) as avg_resolution_hours,
        high_priority,
        categories_count
    FROM zone_stats
    WHERE total_plaintes > 0
    ORDER BY total_plaintes DESC, taux_resolution DESC
""")
    List<Object[]> getZonePerformanceStats(@Param("from") LocalDateTime from,
                                           @Param("to") LocalDateTime to);

    /**
     * Détection d'anomalies dans les données
     */
    @Query(nativeQuery = true, value = """
    WITH daily_counts AS (
        SELECT 
            DATE(date_soumission) as complaint_date,
            zone,
            COUNT(*) as daily_count
        FROM plainte 
        WHERE date_soumission BETWEEN :from AND :to
        GROUP BY DATE(date_soumission), zone
    ),
    zone_averages AS (
        SELECT 
            zone,
            AVG(daily_count) as avg_daily,
            STDDEV(daily_count) as stddev_daily
        FROM daily_counts
        GROUP BY zone
    )
    SELECT 
        dc.complaint_date,
        dc.zone,
        dc.daily_count,
        za.avg_daily,
        za.stddev_daily,
        CASE 
            WHEN dc.daily_count > (za.avg_daily + 2 * COALESCE(za.stddev_daily, 0))
            THEN 'HIGH_ANOMALY'
            WHEN dc.daily_count > (za.avg_daily + COALESCE(za.stddev_daily, 0))
            THEN 'MODERATE_ANOMALY'
            ELSE 'NORMAL'
        END as anomaly_status
    FROM daily_counts dc
    JOIN zone_averages za ON dc.zone = za.zone
    WHERE dc.daily_count > (za.avg_daily + COALESCE(za.stddev_daily, 0))
    ORDER BY dc.complaint_date DESC, dc.daily_count DESC
""")
    List<Object[]> detectDataAnomalies(@Param("from") LocalDateTime from,
                                       @Param("to") LocalDateTime to);

    /**
     * Get zone performance metrics (average resolution time, complaint volume)
     */
    @Query(nativeQuery = true, value = """
        SELECT 
            zone,
            COUNT(*) as total_complaints,
            AVG(CASE WHEN statut = 'RESOLUE' THEN 
                EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - date_soumission))/3600 
                ELSE NULL END) as avg_resolution_hours,
            COUNT(CASE WHEN statut = 'RESOLUE' THEN 1 END) * 100.0 / COUNT(*) as resolution_rate
        FROM plainte 
        WHERE date_soumission >= :from
        GROUP BY zone
        HAVING COUNT(*) >= :minComplaints
        ORDER BY resolution_rate DESC, total_complaints DESC
        """)
    List<Object[]> getZonePerformanceMetrics(
            @Param("from") LocalDateTime from,
            @Param("minComplaints") int minComplaints
    );


    @Query("SELECT COUNT(p) FROM Plainte p")
    Long countAllComplaints();

    /**
     * ✅ NOUVELLE MÉTHODE - Taux de résolution global (sans filtre date)
     * Pour avoir exactement la même base que ComplaintsPage
     */
    @Query("""
    SELECT 
        COUNT(p) as total,
        SUM(CASE WHEN p.statut = 'RESOLUE' THEN 1 ELSE 0 END) as resolues,
        (SUM(CASE WHEN p.statut = 'RESOLUE' THEN 1 ELSE 0 END) * 100.0 / COUNT(p)) as taux
    FROM Plainte p
    """)
    Object[] calculateGlobalResolutionRate();


    @Query("""
  SELECT p.zone, c.nom,
         COUNT(p) AS total,
         SUM(CASE WHEN p.statut='RESOLUE' THEN 1 ELSE 0 END) AS resolues,
         SUM(CASE WHEN p.statut='RESOLUE' THEN 1 ELSE 0 END)*100.0 / COUNT(p) AS taux
  FROM   Plainte p
  JOIN   p.categorie c
  WHERE  (:from IS NULL OR p.dateSoumission >= :from)
    AND  (:to IS NULL OR p.dateSoumission <= :to)
  GROUP  BY p.zone, c.nom
""")
    List<Object[]> calculateTauxResolutionOptionalDates(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );

    @Query("SELECT COUNT(p) FROM Plainte p WHERE p.statut = :statut")
    Long countByStatut(@Param("statut") StatutPlainte statut);

    }






