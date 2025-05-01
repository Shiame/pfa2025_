package com.observatoire.gestion_plaintes.service;

import com.observatoire.gestion_plaintes.model.Role;
import com.observatoire.gestion_plaintes.model.Utilisateur;
import com.observatoire.gestion_plaintes.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UtilisateurService {

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    public Utilisateur getUtilisateur(Long id){
        return utilisateurRepository.findById(id).orElse(null);
    }
    public Optional<Utilisateur> getUtilisateurByEmail(String email){
        return utilisateurRepository.findByEmail(email);
    }
    public Utilisateur getUtilisateurByRole(Role role){
        return utilisateurRepository.findByRole(role);
    }
}
