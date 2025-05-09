package com.observatoire.gestion_plaintes.controller;

import com.observatoire.gestion_plaintes.DTOs.PlainteDTO;
import com.observatoire.gestion_plaintes.DTOs.Response.ClassificationResponse;
import com.observatoire.gestion_plaintes.model.*;
import com.observatoire.gestion_plaintes.repository.AnalyseIARepository;
import com.observatoire.gestion_plaintes.repository.CategorieRepository;
import com.observatoire.gestion_plaintes.repository.PlainteRepository;
import com.observatoire.gestion_plaintes.repository.UtilisateurRepository;
import com.observatoire.gestion_plaintes.service.ClassificationService;
import com.observatoire.gestion_plaintes.service.GeoCodingService;
import com.observatoire.gestion_plaintes.service.PlainteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static com.observatoire.gestion_plaintes.model.StatutPlainte.SOUMISE;

@RestController
@RequestMapping("/plaintes")
@CrossOrigin(origins = "*")
public class PlainteController {

    @Autowired
    private PlainteRepository plainteRepo;
    @Autowired
    private GeoCodingService geoCodingService;
    @Autowired
    private PlainteService plainteService;
    @Autowired
    private CategorieRepository categorieRepo;
    @Autowired
    private UtilisateurRepository utilisateurRepository;
    @Autowired
    private ClassificationService classificationService;
    @Autowired
    private AnalyseIARepository analyseIARepository;


    @PostMapping
    public ResponseEntity<?> ajouterPlainte(@RequestBody PlainteDTO plainteDTO) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(plainteDTO.getUtilisateurEmail())
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé"));

        String zone = geoCodingService.fetchZone(
                plainteDTO.getLatitude(),
                plainteDTO.getLongitude()
        );

        ClassificationResponse cr = classificationService
                .classifyAndPrioritize(
                        plainteDTO.getDescription(),
                        zone
                );

        Plainte plainte = new Plainte();
        plainte.setDescription(plainteDTO.getDescription());
        plainte.setLatitude(plainteDTO.getLatitude());
        plainte.setLongitude(plainteDTO.getLongitude());
        plainte.setImgUrl(plainteDTO.getImgUrl());
        plainte.setDateSoumission(LocalDateTime.now());
        plainte.setStatut(StatutPlainte.SOUMISE);
        plainte.setLocalisation(plainteDTO.getLocalisation());
        plainte.setZone(zone);
        plainte.setUtilisateur(utilisateur);

        Categorie cat = categorieRepo.findByNom(cr.getCategorie());
        if(cat == null){
            return ResponseEntity
                    .badRequest()
                    .body("Catégorie prédite inconnue : " + cr.getCategorie());
        }
        plainte.setCategorie(cat);

        AnalyseIA analyseIA = new AnalyseIA();
        analyseIA.setCatégoriePrévue(cr.getCategorie());
        analyseIA.setNLPScore(cr.getScores());
        analyseIA.setNiveauUrgence(cr.getNiveauUrgence());
        analyseIARepository.save(analyseIA);
        plainte.setAnalyseIA(analyseIA);
        plainte.setPriorite(cr.getPriorite());


        plainteRepo.save(plainte);


        return ResponseEntity.ok(Map.of(
                "message", "Plainte enregistrée",
                "zone", zone,
                "categorie", cat
        ));    }

    @GetMapping
    public Page<Plainte> getPlaintes(
            @RequestParam(defaultValue = "0")   int page,
            @RequestParam(defaultValue = "10")  int size,
            @RequestParam(defaultValue = "dateSoumission") String sortBy,
            @RequestParam(defaultValue = "desc")        String sortDir,
            @RequestParam(required = false) StatutPlainte status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String commune,
            @RequestParam(required = false) String query
    ) {
        Sort.Direction dir = "asc".equalsIgnoreCase(sortDir)
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, sortBy));

        Specification<Plainte> spec = Specification.where(null);
        if (status   != null) spec = spec.and((r, q, cb) ->
                cb.equal(r.get("statut"), status));
        if (category != null) spec = spec.and((r, q, cb) ->
                cb.equal(r.join("categorie").get("nom"), category));
        if (commune  != null) spec = spec.and((r, q, cb) ->
                cb.equal(r.get("zone"), commune));

        if (query != null && !query.isBlank()) {
            String pattern = "%" + query.toLowerCase() + "%";
            spec = spec.and((r, q, cb) -> cb.or(
                    cb.like(cb.lower(r.get("description")), pattern),
                    cb.like(cb.lower(r.get("zone")),        pattern),
                    cb.like(cb.lower(r.join("categorie").get("nom")), pattern),
                    cb.like(cb.lower(r.get("statut")),      pattern)
            ));
        }

        return plainteRepo.findAll(spec, pageable);
    }

    @GetMapping("/mes-plaintes")
    public ResponseEntity<List<Plainte>> getMesPlaintes() {
        List<Plainte> plaintes = plainteService.getPlaintesByUser();
        return ResponseEntity.ok(plaintes);
    }

    @GetMapping("/{id}")
    public Plainte getPlainteById(@PathVariable Long id){
        return plainteService.getPlainteById(id);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Plainte> patchStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        StatutPlainte status = StatutPlainte.valueOf(body.get("status"));
        return ResponseEntity.ok(plainteService.updateStatus(id, status));
    }

    @GetMapping("/{id}/citoyen")
    public ResponseEntity<Utilisateur> getCitoyen(@PathVariable Long id) {
        return ResponseEntity.ok(plainteService.getCitoyenByPlainteId(id));
    }





}
