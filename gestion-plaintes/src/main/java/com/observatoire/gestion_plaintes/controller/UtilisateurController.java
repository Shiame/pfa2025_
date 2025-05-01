package com.observatoire.gestion_plaintes.controller;

import com.observatoire.gestion_plaintes.model.Role;
import com.observatoire.gestion_plaintes.model.Utilisateur;
import com.observatoire.gestion_plaintes.repository.UtilisateurRepository;
import com.observatoire.gestion_plaintes.service.UtilisateurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/utilisateurs")
@CrossOrigin("*")

public class UtilisateurController {

    @Autowired
    private UtilisateurRepository utilisateurRepository;
    @Autowired
    private UtilisateurService utilisateurService;

    @PostMapping("/add")
    public Utilisateur ajouterUtilisateur(@RequestBody Utilisateur utilisateur) {
        return utilisateurRepository.save(utilisateur);
    }

    @GetMapping
    public List<Utilisateur> getUsers(){
        return utilisateurRepository.findAll();
    }

    @GetMapping("/{id}")
    public Utilisateur getUtilisateur(@PathVariable Long id){
        return utilisateurService.getUtilisateur(id);
    }

    @GetMapping("/by-email/{email}")
    public Optional<Utilisateur> getUtilisateurByEmail(@PathVariable String email){
        return utilisateurService.getUtilisateurByEmail(email);
    }

    @GetMapping("/by-role")
    public Utilisateur getUtilisateurByRole(@RequestParam Role role){
        return utilisateurService.getUtilisateurByRole(role);
    }

}
