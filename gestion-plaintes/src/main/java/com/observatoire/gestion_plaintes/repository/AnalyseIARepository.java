package com.observatoire.gestion_plaintes.repository;

import com.observatoire.gestion_plaintes.model.AnalyseIA;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface AnalyseIARepository extends JpaRepository<AnalyseIA, Long> {

    // FIXED: Use a custom query instead of method name derivation
    // since AnalyseIA doesn't have a direct plainteId property
    @Query("SELECT p.analyseIA FROM Plainte p WHERE p.id = :plainteId")
    Optional<AnalyseIA> findByPlainteId(@Param("plainteId") Long plainteId);

    // Alternative: If you want to add a back-reference to Plainte in AnalyseIA,
    // you could use this method instead (see option 2 below)
    // Optional<AnalyseIA> findByPlainteId(Long plainteId);
}