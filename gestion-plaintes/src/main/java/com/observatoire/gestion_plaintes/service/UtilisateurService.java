package com.observatoire.gestion_plaintes.service;

import com.observatoire.gestion_plaintes.DTOs.AdminDto;
import com.observatoire.gestion_plaintes.model.Role;
import com.observatoire.gestion_plaintes.model.Utilisateur;
import com.observatoire.gestion_plaintes.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

import static com.observatoire.gestion_plaintes.model.Role.ADMIN;

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
    public void saveExpoToken(Long userId, String expoToken) {
        Utilisateur user = utilisateurRepository.findById(userId).orElseThrow();
        user.setExpoPushToken(expoToken);
        utilisateurRepository.save(user);
    }
    public AdminDto getAdminProfile() {
        Utilisateur admin = utilisateurRepository.findByRole(ADMIN);
        return new AdminDto(admin.getNom(), admin.getPrenom(), admin.getEmail());
    }
    @Transactional
    public void updateAdminProfile(AdminDto adminDto) {
        // On suppose qu’il n’y a qu’un seul admin dans la base,
        // ou alors tu peux l’identifier par email ou id (à adapter)
        Utilisateur admin = utilisateurRepository.findByRole(ADMIN);

        if (admin == null) {
            throw new RuntimeException("Administrateur non trouvé !");
        }

        // Met à jour les champs
        admin.setNom(adminDto.getNom());
        admin.setPrenom(adminDto.getPrenom());
        admin.setEmail(adminDto.getEmail());

        utilisateurRepository.save(admin);
    }


}
