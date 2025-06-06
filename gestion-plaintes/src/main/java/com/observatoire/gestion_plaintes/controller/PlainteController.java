package com.observatoire.gestion_plaintes.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.observatoire.gestion_plaintes.DTOs.PlainteDTO;
import com.observatoire.gestion_plaintes.DTOs.Response.ClassificationResponse;
import com.observatoire.gestion_plaintes.DTOs.Response.ClassificationResponseDTO;
import com.observatoire.gestion_plaintes.DTOs.SummaryDTO;
import com.observatoire.gestion_plaintes.model.*;
import com.observatoire.gestion_plaintes.repository.AnalyseIARepository;
import com.observatoire.gestion_plaintes.repository.CategorieRepository;
import com.observatoire.gestion_plaintes.repository.PlainteRepository;
import com.observatoire.gestion_plaintes.repository.UtilisateurRepository;
import com.observatoire.gestion_plaintes.service.ClassificationService;
import com.observatoire.gestion_plaintes.service.EnhancedNLPService;
import com.observatoire.gestion_plaintes.service.GeoCodingService;
import com.observatoire.gestion_plaintes.service.PlainteService;
import com.observatoire.gestion_plaintes.service.ExpoPushService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.*;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/plaintes")
@CrossOrigin(origins = "*")
public class PlainteController {

    private static final Logger logger = LoggerFactory.getLogger(PlainteController.class);

    @Autowired
    private PlainteRepository plainteRepo;

    @Autowired
    private GeoCodingService geoCodingService;

    @Autowired
    private PlainteService plainteService;

    @Autowired
    private CategorieRepository categorieRepo;

    @Autowired
    private JavaMailSender javaMailSender;


    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private ClassificationService classificationService;

    @Autowired
    private AnalyseIARepository analyseIARepository;

    @Autowired
    private EnhancedNLPService enhancedNLPService;

    @Autowired
    private ExpoPushService expoPushService;

    @Value("${nlp.service.url:http://localhost:8000}")
    private String nlpServiceUrl;

    private final ObjectMapper objectMapper = new ObjectMapper();


    /**
     * ENHANCED: Add complaint with improved NLP analysis
     * Keeps existing functionality but adds enhanced classification details
     */
    @PostMapping
    public ResponseEntity<?> ajouterPlainte(@RequestBody PlainteDTO plainteDTO) {
        logger.info("Receiving new complaint for zone analysis");

        try {
            // 1) Récupération de l'utilisateur et de la zone géographique
            Utilisateur utilisateur = utilisateurRepository.findByEmail(plainteDTO.getUtilisateurEmail())
                    .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé"));

            String zone = geoCodingService.fetchZone(
                    plainteDTO.getLatitude(),
                    plainteDTO.getLongitude()
            );

            // 2) Appel au service NLP qui retourne le JSON brut
            Map<String, Object> nlpFullResponse = classificationService
                    .classifyRaw(plainteDTO.getDescription(), zone);

            // 3) Transformez ce JSON brut en DTO si besoin
            ClassificationResponseDTO enhancedResult = objectMapper.convertValue(
                    nlpFullResponse,
                    new TypeReference<ClassificationResponseDTO>() {}
            );

            // 4) Construisez l'entité Plainte
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

            // 5) Liaison Catégorie
            Categorie cat = categorieRepo.findByNom(enhancedResult.getCategorie());
            if (cat == null) {
                return ResponseEntity
                        .badRequest()
                        .body("Catégorie prédite inconnue : " + enhancedResult.getCategorie());
            }
            plainte.setCategorie(cat);
            plainte.setPriorite(enhancedResult.getPriorite());

            // 6) Stockage de l'analyse IA complète en JSONB
            AnalyseIA analyseIA = new AnalyseIA();
            analyseIA.setFullResponse(nlpFullResponse);

            // Extraire et stocker les champs principaux pour indexation
            analyseIA.setCategoriePrev(enhancedResult.getCategorie());
            analyseIA.setNiveauUrgence(enhancedResult.getNiveauUrgence());
            analyseIA.setPriorite(enhancedResult.getPriorite());

            // Stocker les scores NLP si disponibles
            if (enhancedResult.getScores() != null) {
                analyseIA.setNLPScore(enhancedResult.getScores());
            }

            // Save AnalyseIA first
            analyseIARepository.save(analyseIA);

            // 7) Liez la plainte à son AnalyseIA
            plainte.setAnalyseIA(analyseIA);
            plainteRepo.save(plainte);

            // 8) Réponse enrichie
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Plainte enregistrée avec analyse intelligente");
            response.put("zone", zone);
            response.put("categorie", cat.getNom());
            response.put("priorite", enhancedResult.getPriorite());
            response.put("niveau_urgence", enhancedResult.getNiveauUrgence());
            response.put("confidence_scores", enhancedResult.getScores());
            response.put("plainte_id", plainte.getId());
            response.put("full_nlp_response", nlpFullResponse);
            response.put("nlp_service_used", classificationService.isNLPServiceAvailable());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error processing complaint: {}", e.getMessage(), e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erreur lors du traitement de la plainte: " + e.getMessage()));
        }
    }

    /**
     * EXISTING: Get complaints with filtering (unchanged)
     */
    @GetMapping
    public Page<Plainte> getPlaintes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "dateSoumission") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) StatutPlainte status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String commune,
            @RequestParam(required = false) String query
    ) {
        Sort.Direction dir = "asc".equalsIgnoreCase(sortDir)
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, sortBy));

        Specification<Plainte> spec = Specification.where(null);
        if (status != null) spec = spec.and((r, q, cb) ->
                cb.equal(r.get("statut"), status));
        if (category != null) spec = spec.and((r, q, cb) ->
                cb.equal(r.join("categorie").get("nom"), category));
        if (commune != null) spec = spec.and((r, q, cb) ->
                cb.equal(r.get("zone"), commune));

        if (query != null && !query.isBlank()) {
            String pattern = "%" + query.toLowerCase() + "%";
            spec = spec.and((r, q, cb) -> cb.or(
                    cb.like(cb.lower(r.get("description")), pattern),
                    cb.like(cb.lower(r.get("zone")), pattern),
                    cb.like(cb.lower(r.join("categorie").get("nom")), pattern),
                    cb.like(cb.lower(r.get("statut")), pattern)
            ));
        }

        return plainteRepo.findAll(spec, pageable);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePlainte(@PathVariable Long id) {
        try {
            plainteRepo.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Plainte supprimée avec succès", "plainte_id", id));
        } catch (Exception e) {
            logger.error("Erreur lors de la suppression de la plainte: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Erreur lors de la suppression de la plainte: " + e.getMessage()));
        }
    }

    /**
     * EXISTING: Get user's complaints (unchanged)
     */
    @GetMapping("/mes-plaintes")
    public ResponseEntity<List<Plainte>> getMesPlaintes() {
        List<Plainte> plaintes = plainteService.getPlaintesByUser();
        return ResponseEntity.ok(plaintes);
    }

    /**
     * ENHANCED: Get complaint by ID with NLP insights
     */
    /**
     * ENHANCED: Get complaint by ID with full NLP insights
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getPlainteById(@PathVariable Long id) {
        try {
            Plainte plainte = plainteService.getPlainteById(id);

            Map<String, Object> response = new HashMap<>();
            response.put("plainte", plainte);

            // Add intelligent analysis if available
            if (plainte.getAnalyseIA() != null) {
                AnalyseIA analyseIA = plainte.getAnalyseIA();

                // Create a comprehensive analysis object
                Map<String, Object> analysisData = new HashMap<>();
                analysisData.put("id", analyseIA.getId());
                analysisData.put("categorie", analyseIA.getCatégoriePrévue());
                analysisData.put("niveau_urgence", analyseIA.getNiveauUrgence());
                analysisData.put("priorite", analyseIA.getPriorite());
                analysisData.put("scores", analyseIA.getScores());
                analysisData.put("details_calcul", analyseIA.getDetailsCalcul());
                analysisData.put("full_response", analyseIA.getFullResponse());

                response.put("analyse_ia", analysisData);
                response.put("has_ai_analysis", true);
            } else {
                response.put("has_ai_analysis", false);
            }

            // Generate contextual summary for this specific complaint
            try {
                List<SummaryDTO> contextualSummaries = enhancedNLPService
                        .generateIntelligentSummaries(24, plainte.getZone());
                response.put("zone_context", contextualSummaries);
            } catch (Exception e) {
                logger.warn("Failed to generate contextual summaries: {}", e.getMessage());
                response.put("zone_context", Collections.emptyList());
            }

            response.put("generated_at", LocalDateTime.now());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error fetching complaint details: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Erreur lors de la récupération des détails"));
        }
    }

    /**
     * EXISTING: Update complaint status (unchanged)
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<Plainte> patchStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        StatutPlainte status = StatutPlainte.valueOf(body.get("status"));
        Plainte plainte = plainteService.updateStatus(id, status);

        // Récupérer l'utilisateur de la plainte
        Utilisateur user = plainte.getUtilisateur();
        String expoToken = user.getExpoPushToken();

        // Créer le message personnalisé selon le nouveau statut
        String message;
        switch (status.name()) {
            case "EN_COURS":
                message = "Votre plainte est en cours de traitement.";
                break;
            case "RESOLUE":
                message = "Bonne nouvelle ! Votre plainte a été résolue.";
                break;
            case "REJETEE":
                message = "Votre plainte a été rejetée.";
                break;
            default:
                message = "Le statut de votre plainte a été mis à jour.";
        }

        // Appel du service qui envoie la notification (à injecter en haut)
        expoPushService.sendPushMessage(
                expoToken,
                "Mise à jour de votre plainte",
                message
        );

        return ResponseEntity.ok(plainte);
    }


    /**
     * EXISTING: Get citizen info (unchanged)
     */
    @GetMapping("/{id}/citoyen")
    public ResponseEntity<Utilisateur> getCitoyen(@PathVariable Long id) {
        return ResponseEntity.ok(plainteService.getCitoyenByPlainteId(id));
    }

    // ============================================================================
    // NEW ENHANCED ENDPOINTS
    // ============================================================================

    /**
     * NEW: Get intelligent summaries for complaints
     */
    @GetMapping("/intelligent-summary")
    public ResponseEntity<List<SummaryDTO>> getIntelligentSummaries(
            @RequestParam(defaultValue = "7") int hours,
            @RequestParam(required = false) String zone) {

        try {
            List<SummaryDTO> summaries = enhancedNLPService.generateIntelligentSummaries(hours, zone);
            return ResponseEntity.ok(summaries);
        } catch (Exception e) {
            logger.error("Error generating intelligent summaries: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * NEW: Get comprehensive analysis dashboard
     */
    @GetMapping("/comprehensive-analysis")
    public ResponseEntity<Map<String, Object>> getComprehensiveAnalysis(
            @RequestParam(defaultValue = "7") int hours) {

        try {
            Map<String, Object> analysis = enhancedNLPService.getComprehensiveAnalysis(hours);
            return ResponseEntity.ok(analysis);
        } catch (Exception e) {
            logger.error("Error generating comprehensive analysis: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * NEW: Get trend analysis between periods
     */
    @GetMapping("/trend-analysis")
    public ResponseEntity<Map<String, Object>> getTrendAnalysis(
            @RequestParam(defaultValue = "7") int currentHours,
            @RequestParam(defaultValue = "14") int comparisonHours) {

        try {
            Map<String, Object> trends = enhancedNLPService.analyzeTrends(currentHours, comparisonHours);
            return ResponseEntity.ok(trends);
        } catch (Exception e) {
            logger.error("Error analyzing trends: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * NEW: Bulk classify existing complaints (for data migration/analysis)
     */
    @PostMapping("/bulk-classify")
    public ResponseEntity<Map<String, Object>> bulkClassifyComplaints(
            @RequestParam(defaultValue = "100") int limit) {

        try {
            // Get unclassified or old complaints
            LocalDateTime cutoff = LocalDateTime.now().minusDays(30);
            List<Plainte> complaints = plainteRepo.findRecentComplaints(cutoff)
                    .stream()
                    .limit(limit)
                    .toList();

            Map<String, Object> results = new HashMap<>();
            int processed = 0;
            int updated = 0;

            for (Plainte plainte : complaints) {
                try {
                    ClassificationResponseDTO result = classificationService
                            .classifyWithDetails(plainte.getDescription(), plainte.getZone());

                    // Update category if different
                    Categorie newCat = categorieRepo.findByNom(result.getCategorie());
                    if (newCat != null && !newCat.equals(plainte.getCategorie())) {
                        plainte.setCategorie(newCat);
                        plainte.setPriorite(result.getPriorite());
                        plainteRepo.save(plainte);
                        updated++;
                    }

                    processed++;

                } catch (Exception e) {
                    logger.warn("Failed to classify complaint {}: {}", plainte.getId(), e.getMessage());
                }
            }

            results.put("processed", processed);
            results.put("updated", updated);
            results.put("total_available", complaints.size());
            results.put("nlp_service_status", classificationService.isNLPServiceAvailable());

            return ResponseEntity.ok(results);

        } catch (Exception e) {
            logger.error("Error in bulk classification: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Erreur lors de la classification en lot"));
        }
    }

    /**
     * NEW: Get NLP service health and statistics
     */
    @GetMapping("/nlp-status")
    public ResponseEntity<Map<String, Object>> getNLPServiceStatus() {
        try {
            Map<String, Object> status = classificationService.getNLPServiceStatus();

            // Add usage statistics
            LocalDateTime since = LocalDateTime.now().minusHours(24);
            List<Plainte> recentComplaints = plainteRepo.findRecentComplaints(since);

            status.put("recent_classifications", recentComplaints.size());
            status.put("categories_processed", recentComplaints.stream()
                    .map(p -> p.getCategorie() != null ? p.getCategorie().getNom() : "UNKNOWN")
                    .distinct()
                    .count());

            return ResponseEntity.ok(status);

        } catch (Exception e) {
            logger.error("Error checking NLP service status: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Erreur lors de la vérification du statut NLP"));
        }
    }

    /**
     * NEW: Test individual classification (for debugging)
     */
    @PostMapping("/test-classification")
    public ResponseEntity<Map<String, Object>> testClassification(
            @RequestBody Map<String, String> request) {

        try {
            String description = request.get("description");
            String zone = request.getOrDefault("zone", "TEST_ZONE");

            if (description == null || description.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Description is required"));
            }

            // Test both methods
            ClassificationResponse basicResult = classificationService
                    .classifyAndPrioritize(description, zone);

            ClassificationResponseDTO enhancedResult = classificationService
                    .classifyWithDetails(description, zone);

            Map<String, Object> response = new HashMap<>();
            response.put("basic_classification", basicResult);
            response.put("enhanced_classification", enhancedResult);
            response.put("nlp_service_available", classificationService.isNLPServiceAvailable());
            response.put("test_performed_at", LocalDateTime.now());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error testing classification: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Erreur lors du test de classification: " + e.getMessage()));
        }
    }

    /**
     * NEW: Get zone-specific intelligent analysis
     */
    @GetMapping("/zone-analysis/{zoneName}")
    public ResponseEntity<Map<String, Object>> getZoneAnalysis(
            @PathVariable String zoneName,
            @RequestParam(defaultValue = "24") int hours) {

        try {
            // Get zone-specific summaries
            List<SummaryDTO> zoneSummaries = enhancedNLPService
                    .generateIntelligentSummaries(hours, zoneName);

            // Get zone statistics
            LocalDateTime since = LocalDateTime.now().minusHours(hours);
            List<Plainte> zoneComplaints = plainteRepo.findRecentComplaintsByZone(since, zoneName);

            Map<String, Object> analysis = new HashMap<>();
            analysis.put("zone_name", zoneName);
            analysis.put("summaries", zoneSummaries);
            analysis.put("total_complaints", zoneComplaints.size());
            analysis.put("analysis_period_hours", hours);
            analysis.put("generated_at", LocalDateTime.now());

            // Calculate zone-specific metrics
            long highPriorityCount = zoneComplaints.stream()
                    .mapToInt(p -> p.getPriorite() != null ? p.getPriorite() : 0)
                    .filter(p -> p >= 15)
                    .count();

            analysis.put("high_priority_complaints", highPriorityCount);

            Map<String, Long> categoryDistribution = zoneComplaints.stream()
                    .collect(java.util.stream.Collectors.groupingBy(
                            p -> p.getCategorie() != null ? p.getCategorie().getNom() : "UNKNOWN",
                            java.util.stream.Collectors.counting()
                    ));

            analysis.put("category_distribution", categoryDistribution);

            return ResponseEntity.ok(analysis);

        } catch (Exception e) {
            logger.error("Error analyzing zone {}: {}", zoneName, e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Erreur lors de l'analyse de zone"));
        }
    }

    @GetMapping("/{id}/recommandations")
    public ResponseEntity<List<String>> getRecommandationsForPlainte(@PathVariable Long id) {
        Plainte plainte = plainteRepo.findById(id).orElse(null);
        if (plainte == null) {
            return ResponseEntity.notFound().build();
        }

        // Construire le JSON à envoyer à FastAPI
        Map<String, Object> complaintJson = new HashMap<>();
        complaintJson.put("description", plainte.getDescription());
        complaintJson.put("category", plainte.getCategorie() != null ? plainte.getCategorie().getNom() : "AUTRES");
        complaintJson.put("zone", plainte.getZone());
        complaintJson.put("priority", plainte.getPriorite());

        // Appel à FastAPI: POST http://localhost:8000/generate-recommendations
        RestTemplate restTemplate = new RestTemplate();
        String url = nlpServiceUrl + "/generate-recommendations";

        // Crée la requête JSON
        Map<String, Object> requestBody = new HashMap<>();
        // Envoie une liste de plaintes, car ton endpoint FastAPI attend complaints: List[Dict]
        requestBody.put("complaints", List.of(complaintJson));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Object recs = response.getBody().get("recommendations");
                if (recs instanceof List) {
                    //noinspection unchecked
                    return ResponseEntity.ok((List<String>) recs);
                }
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/{id}/envoyer-mail")
    public ResponseEntity<?> envoyerMailCommune(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        Plainte plainte = plainteService.getPlainteById(id);

        // Récupérer l’adresse e-mail de la commune (ici, simulé, tu peux adapter)
        String emailCommune = "commune@ville.ma";
        // Ou plainte.getCommune().getEmail(); si tu as une relation

        String subject = body.getOrDefault("subject", "Plainte à traiter n°" + plainte.getId());
        String message = body.getOrDefault("message", "Veuillez traiter la plainte.");

        // Corps de mail enrichi (tu peux améliorer selon tes besoins)
        String contenu =
                "Bonjour,\n\n"
                        + "Une nouvelle plainte a été enregistrée.\n"
                        + "ID: " + plainte.getId() + "\n"
                        + "Description: " + plainte.getDescription() + "\n"
                        + "Catégorie: " + (plainte.getCategorie() != null ? plainte.getCategorie().getNom() : "N/A") + "\n"
                        + "Zone: " + plainte.getZone() + "\n"
                        + "Date: " + plainte.getDateSoumission() + "\n"
                        + "\n" + message + "\n\n"
                        + "Merci de faire le nécessaire.\n";

        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setTo(emailCommune);
            mailMessage.setSubject(subject);
            mailMessage.setText(contenu);
            mailMessage.setFrom("tonemail@gmail.com"); // Optionnel mais conseillé

            javaMailSender.send(mailMessage);

            return ResponseEntity.ok(Map.of("status", "mail_sent"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

}