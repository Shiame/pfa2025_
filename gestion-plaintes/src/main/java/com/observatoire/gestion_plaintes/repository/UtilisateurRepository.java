package com.observatoire.gestion_plaintes.repository;

import com.observatoire.gestion_plaintes.model.Role;
import com.observatoire.gestion_plaintes.model.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {

     Optional<Utilisateur>  findByEmail(String email);
     Utilisateur findByRole(Role role);
}
