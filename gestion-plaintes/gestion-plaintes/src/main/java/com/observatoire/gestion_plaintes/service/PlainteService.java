package com.observatoire.gestion_plaintes.service;

import com.observatoire.gestion_plaintes.model.Plainte;
import com.observatoire.gestion_plaintes.model.StatutPlainte;
import com.observatoire.gestion_plaintes.model.Utilisateur;
import com.observatoire.gestion_plaintes.repository.PlainteRepository;
import com.observatoire.gestion_plaintes.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PlainteService {

    @Autowired
    private PlainteRepository plainteRepository;
    @Autowired
    private UtilisateurRepository userRepository;

    public Plainte getPlainteById(Long id) {
        return plainteRepository.findById(id).orElse(null);
    }

    public List<Plainte> getPlaintesByUser(){
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        Utilisateur user = userRepository.findByEmail(email).orElseThrow();

        return plainteRepository.findByUtilisateur(user);
    }

    public Plainte updateStatus(Long id, StatutPlainte newStatus) {
        Plainte p = getPlainteById(id);
        p.setStatut(newStatus);
        return plainteRepository.save(p);
    }


    public Utilisateur getCitoyenByPlainteId(Long plainteId) {
        Plainte p = getPlainteById(plainteId);
        return p.getUtilisateur();
    }

}
