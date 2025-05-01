package com.observatoire.gestion_plaintes.repository;

import com.observatoire.gestion_plaintes.model.serveurCible;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ServeurCibleRepository extends JpaRepository<serveurCible, Long> {
}
