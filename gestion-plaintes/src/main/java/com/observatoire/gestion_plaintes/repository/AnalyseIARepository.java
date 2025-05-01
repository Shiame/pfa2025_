package com.observatoire.gestion_plaintes.repository;


import com.observatoire.gestion_plaintes.model.AnalyseIA;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AnalyseIARepository extends JpaRepository<AnalyseIA, Long> {
}
