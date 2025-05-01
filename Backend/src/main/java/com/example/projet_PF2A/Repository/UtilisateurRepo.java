package com.example.projet_PF2A.Repository;

import com.example.projet_PF2A.Model.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UtilisateurRepo extends JpaRepository<Utilisateur, String> {
    Optional<Utilisateur> findByEmail(String email);
}
