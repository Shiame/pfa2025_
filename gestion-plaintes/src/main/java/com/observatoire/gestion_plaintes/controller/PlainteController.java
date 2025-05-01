package com.observatoire.gestion_plaintes.controller;

import com.observatoire.gestion_plaintes.DTOs.PlainteDTO;
import com.observatoire.gestion_plaintes.model.Categorie;
import com.observatoire.gestion_plaintes.model.Plainte;
import com.observatoire.gestion_plaintes.model.StatutPlainte;
import com.observatoire.gestion_plaintes.model.Utilisateur;
import com.observatoire.gestion_plaintes.repository.CategorieRepository;
import com.observatoire.gestion_plaintes.repository.PlainteRepository;
import com.observatoire.gestion_plaintes.repository.UtilisateurRepository;
import com.observatoire.gestion_plaintes.service.PlainteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

import static com.observatoire.gestion_plaintes.model.StatutPlainte.SOUMISE;

@RestController
@RequestMapping("/plaintes")
@CrossOrigin("*")

public class PlainteController {

    @Autowired
    private PlainteRepository plainteRepo;
    @Autowired
    private PlainteService plainteService;
    @Autowired
    private CategorieRepository categorieRepository;
    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @PostMapping
    public ResponseEntity<?> ajouterPlainte(@RequestBody PlainteDTO plainteDTO) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(plainteDTO.getUtilisateurEmail())
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé"));
        Categorie categorie = categorieRepository.findByNom(plainteDTO.getCategorie());
        if (categorie == null) {
            return ResponseEntity.badRequest().body("Catégorie non trouvée");
        }

        Plainte plainte = new Plainte();
        plainte.setDescription(plainteDTO.getDescription());
        plainte.setLatitude(plainteDTO.getLatitude());
        plainte.setLongitude(plainteDTO.getLongitude());
        plainte.setLocalisation(plainteDTO.getLocalisation());
        plainte.setImgUrl(plainteDTO.getImgUrl());
        plainte.setCategorie(categorie);
        plainte.setDateSoumission(LocalDateTime.now());
        plainte.setStatut(StatutPlainte.SOUMISE);
        plainte.setUtilisateur(utilisateur);


        plainteRepo.save(plainte);

        return ResponseEntity.ok("Plainte enregistrée avec succès !");
    }

    @GetMapping
    public List<Plainte> getPlaintes(){
        return plainteRepo.findAll();
    }

    @PreAuthorize("hasRole('CITOYEN')")
    @GetMapping("/mes-plaintes")
    public ResponseEntity<List<Plainte>> getMesPlaintes() {
        List<Plainte> plaintes = plainteService.getPlaintesByUser();
        return ResponseEntity.ok(plaintes);
    }

    @GetMapping("/{id}")
    public Plainte getPlainteById(@PathVariable Long id){
        return plainteService.getPlainteById(id);
    }





}
