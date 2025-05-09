package com.observatoire.gestion_plaintes.repository;

import com.observatoire.gestion_plaintes.model.Plainte;
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
  SELECT p.zone, c.nom,
         COUNT(p)                                       AS total,
         SUM(CASE WHEN p.statut='RESOLUE' THEN 1 ELSE 0 END) AS resolues,
         SUM(CASE WHEN p.statut='RESOLUE' THEN 1 ELSE 0 END)*100.0 / COUNT(p) AS taux
  FROM   Plainte p
  JOIN   p.categorie c
  WHERE  p.dateSoumission BETWEEN :from AND :to
  GROUP  BY p.zone, c.nom
""")
    List<Object[]> calculateTauxResolution(LocalDateTime from, LocalDateTime to);


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
}
