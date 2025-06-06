package com.observatoire.gestion_plaintes.controller;

import com.observatoire.gestion_plaintes.DTOs.AdminDto;
import com.observatoire.gestion_plaintes.DTOs.Request.SaveTokenRequest;
import com.observatoire.gestion_plaintes.model.Role;
import com.observatoire.gestion_plaintes.model.Utilisateur;
import com.observatoire.gestion_plaintes.repository.UtilisateurRepository;
import com.observatoire.gestion_plaintes.service.UtilisateurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Principal principal) {
        // Récupérer l’email (username)
        String email = principal.getName();

        // Récupérer l’utilisateur depuis la base
        Optional<Utilisateur> user = utilisateurRepository.findByEmail(email);
        if (user.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Utilisateur non trouvé");
        }

        // Construire la réponse profil
        Map<String, Object> profile = new HashMap<>();
        profile.put("email", user.get().getEmail());
        profile.put("nom", user.get().getNom());
        profile.put("prenom", user.get().getPrenom());
        profile.put("cin", user.get().getCin());
        // Pour le nom complet si tu veux l’afficher
        profile.put("fullName", user.get().getNom() + " " + user.get().getPrenom());

        return ResponseEntity.ok(profile);
    }

    @GetMapping("/admin")
    public ResponseEntity<AdminDto> getAdminProfile() {
        // Récupère l’admin (par exemple le premier user avec rôle ADMIN)
        AdminDto admin = utilisateurService.getAdminProfile();
        return ResponseEntity.ok(admin);
    }
    @PutMapping("/admin")
    public ResponseEntity<?> updateAdminProfile(@RequestBody AdminDto adminDto) {
        utilisateurService.updateAdminProfile(adminDto);
        return ResponseEntity.ok().build();
    }


    @PostMapping("/save-token")
    public ResponseEntity<?> saveExpoToken(@RequestBody SaveTokenRequest req) {
        utilisateurService.saveExpoToken(req.getUserId(), req.getExpoPushToken());
        System.out.println("SaveExpoToken called for userId: " + req.getUserId() + ", token: " + req.getExpoPushToken());
        return ResponseEntity.ok().build();
    }





}
