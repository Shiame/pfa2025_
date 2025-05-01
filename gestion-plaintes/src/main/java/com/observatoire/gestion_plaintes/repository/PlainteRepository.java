package com.observatoire.gestion_plaintes.repository;

import com.observatoire.gestion_plaintes.model.Plainte;
import com.observatoire.gestion_plaintes.model.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlainteRepository extends JpaRepository<Plainte, Long> {
    List<Plainte> findByUtilisateur(Utilisateur utilisateur);
}
