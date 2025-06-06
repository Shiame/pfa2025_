package com.observatoire.gestion_plaintes.service;

import com.observatoire.gestion_plaintes.DTOs.Request.ClassificationRequestDTO;
import com.observatoire.gestion_plaintes.DTOs.Response.ClassificationResponse;
import com.observatoire.gestion_plaintes.DTOs.Response.ClassificationResponseDTO;
import com.observatoire.gestion_plaintes.config.NLPServiceConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class ClassificationService {

    private static final Logger logger = LoggerFactory.getLogger(ClassificationService.class);

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private NLPServiceConfig nlpConfig;

    private static final String CLASSIFY_ENDPOINT = "/classify";

    // Fallback classification rules when NLP service is unavailable
    private static final Map<String, String> KEYWORD_CATEGORIES = new HashMap<>();
    private static final Map<String, Integer> BASE_PRIORITIES = new HashMap<>();

    static {
        // Keyword-based fallback classification
        KEYWORD_CATEGORIES.put("agression", "AGRESSION");
        KEYWORD_CATEGORIES.put("agresse", "AGRESSION");
        KEYWORD_CATEGORIES.put("violence", "AGRESSION");
        KEYWORD_CATEGORIES.put("attaque", "AGRESSION");
        KEYWORD_CATEGORIES.put("vol", "AGRESSION");

        KEYWORD_CATEGORIES.put("dechet", "DECHETS");
        KEYWORD_CATEGORIES.put("dechets", "DECHETS");
        KEYWORD_CATEGORIES.put("ordure", "DECHETS");
        KEYWORD_CATEGORIES.put("ordures", "DECHETS");
        KEYWORD_CATEGORIES.put("poubelle", "DECHETS");

        KEYWORD_CATEGORIES.put("corruption", "CORRUPTION");
        KEYWORD_CATEGORIES.put("pot-de-vin", "CORRUPTION");
        KEYWORD_CATEGORIES.put("corrompu", "CORRUPTION");

        KEYWORD_CATEGORIES.put("route", "VOIRIE");
        KEYWORD_CATEGORIES.put("trottoir", "VOIRIE");
        KEYWORD_CATEGORIES.put("chaussee", "VOIRIE");
        KEYWORD_CATEGORIES.put("nid-de-poule", "VOIRIE");

        // Base priorities by category
        BASE_PRIORITIES.put("AGRESSION", 15);
        BASE_PRIORITIES.put("CORRUPTION", 12);
        BASE_PRIORITIES.put("VOIRIE", 10);
        BASE_PRIORITIES.put("DECHETS", 8);
        BASE_PRIORITIES.put("AUTRES", 5);
    }

    /**
     * Main classification method - calls your FastAPI NLP service
     * This preserves your existing spaCy model and priority calculation
     */
    public ClassificationResponse classifyAndPrioritize(String description, String zone) {
        logger.info("Classifying complaint for zone: {} with description length: {}",
                zone, description != null ? description.length() : 0);

        try {
            // Create request DTO
            ClassificationRequestDTO request = new ClassificationRequestDTO(
                    description, zone, LocalDateTime.now()
            );

            // Call your FastAPI service
            ClassificationResponseDTO response = callNLPClassificationService(request);

            // Convert to existing ClassificationResponse format
            return convertToClassificationResponse(response);

        } catch (Exception e) {
            logger.warn("NLP service unavailable, using fallback classification: {}", e.getMessage());
            return createFallbackClassification(description, zone);
        }
    }

    /**
     * Enhanced classification with additional metadata
     * New method that provides more detailed analysis
     */
    public ClassificationResponseDTO classifyWithDetails(String description, String zone) {
        logger.info("Enhanced classification for zone: {}", zone);

        try {
            ClassificationRequestDTO request = new ClassificationRequestDTO(
                    description, zone, LocalDateTime.now()
            );

            return callNLPClassificationService(request);

        } catch (Exception e) {
            logger.warn("Enhanced classification failed, using fallback: {}", e.getMessage());
            return createFallbackClassificationDTO(description, zone);
        }
    }

    /**
     * Batch classification for multiple complaints
     * Useful for processing historical data or bulk operations
     */
    public Map<String, ClassificationResponse> classifyBatch(Map<String, String> descriptions, String zone) {
        logger.info("Batch classifying {} complaints for zone: {}", descriptions.size(), zone);

        Map<String, ClassificationResponse> results = new HashMap<>();

        for (Map.Entry<String, String> entry : descriptions.entrySet()) {
            try {
                ClassificationResponse result = classifyAndPrioritize(entry.getValue(), zone);
                results.put(entry.getKey(), result);
            } catch (Exception e) {
                logger.error("Failed to classify complaint {}: {}", entry.getKey(), e.getMessage());
                results.put(entry.getKey(), createFallbackClassification(entry.getValue(), zone));
            }
        }

        return results;
    }

    /**
     * Check if NLP service is available
     */
    public boolean isNLPServiceAvailable() {
        try {
            String url = nlpConfig.getNlpServiceUrl() + "/";
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            return response.getStatusCode() == HttpStatus.OK;
        } catch (Exception e) {
            logger.debug("NLP service health check failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Get NLP service status information
     */
    public Map<String, Object> getNLPServiceStatus() {
        Map<String, Object> status = new HashMap<>();

        try {
            String url = nlpConfig.getNlpServiceUrl() + "/";
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                status.put("available", true);
                status.put("status", "healthy");
                status.put("response", response.getBody());
            } else {
                status.put("available", false);
                status.put("status", "unhealthy");
            }
        } catch (Exception e) {
            status.put("available", false);
            status.put("status", "error");
            status.put("error", e.getMessage());
        }

        status.put("service_url", nlpConfig.getNlpServiceUrl());
        status.put("checked_at", LocalDateTime.now());

        return status;
    }

    // ============================================================================
    // PRIVATE HELPER METHODS
    // ============================================================================

    /**
     * Call your FastAPI NLP service with proper error handling
     */
    private ClassificationResponseDTO callNLPClassificationService(ClassificationRequestDTO request) {
        String url = nlpConfig.getNlpServiceUrl() + CLASSIFY_ENDPOINT;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<ClassificationRequestDTO> entity = new HttpEntity<>(request, headers);

        try {
            logger.debug("Calling NLP service at: {}", url);
            ResponseEntity<ClassificationResponseDTO> response = restTemplate.postForEntity(
                    url, entity, ClassificationResponseDTO.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                logger.debug("NLP classification successful");
                return response.getBody();
            } else {
                throw new RestClientException("Invalid response from NLP service");
            }

        } catch (RestClientException e) {
            logger.error("Failed to call NLP service: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Convert NLP service response to existing ClassificationResponse format
     * This ensures backward compatibility with your existing code
     */
    private ClassificationResponse convertToClassificationResponse(ClassificationResponseDTO dto) {
        ClassificationResponse response = new ClassificationResponse();
        response.setCategorie(dto.getCategorie());
        response.setScores(dto.getScores());
        response.setPriorite(dto.getPriorite());
        response.setNiveauUrgence(dto.getNiveauUrgence());
        return response;
    }

    /**
     * Create fallback classification when NLP service is unavailable
     * Uses simple keyword matching and basic priority rules
     */
    private ClassificationResponse createFallbackClassification(String description, String zone) {
        logger.info("Creating fallback classification");

        String category = determineFallbackCategory(description);
        int priority = calculateFallbackPriority(category, description, zone);
        String urgencyLevel = determineUrgencyLevel(priority);

        ClassificationResponse response = new ClassificationResponse();
        response.setCategorie(category);
        response.setPriorite(priority);
        response.setNiveauUrgence(urgencyLevel);

        // Create basic confidence scores
        Map<String, Double> scores = new HashMap<>();
        scores.put(category, 0.7); // Medium confidence for fallback
        scores.put("AUTRES", 0.3);
        response.setScores(scores);

        return response;
    }

    /**
     * Create fallback classification DTO
     */
    private ClassificationResponseDTO createFallbackClassificationDTO(String description, String zone) {
        String category = determineFallbackCategory(description);
        int priority = calculateFallbackPriority(category, description, zone);
        String urgencyLevel = determineUrgencyLevel(priority);

        ClassificationResponseDTO dto = new ClassificationResponseDTO();
        dto.setCategorie(category);
        dto.setPriorite(priority);
        dto.setNiveauUrgence(urgencyLevel);

        Map<String, Double> scores = new HashMap<>();
        scores.put(category, 0.7);
        scores.put("AUTRES", 0.3);
        dto.setScores(scores);

        Map<String, Object> details = new HashMap<>();
        details.put("method", "fallback");
        details.put("reason", "nlp_service_unavailable");
        dto.setDetailsCalcul(details);

        return dto;
    }

    /**
     * Determine category using simple keyword matching
     */
    private String determineFallbackCategory(String description) {
        if (description == null || description.trim().isEmpty()) {
            return "AUTRES";
        }

        String lowerDesc = description.toLowerCase();

        for (Map.Entry<String, String> entry : KEYWORD_CATEGORIES.entrySet()) {
            if (lowerDesc.contains(entry.getKey())) {
                return entry.getValue();
            }
        }

        return "AUTRES";
    }

    /**
     * Calculate basic priority using simple rules
     */
    private int calculateFallbackPriority(String category, String description, String zone) {
        int basePriority = BASE_PRIORITIES.getOrDefault(category, 5);

        // Add urgency bonus for urgent keywords
        if (description != null) {
            String lowerDesc = description.toLowerCase();
            if (lowerDesc.contains("urgence") || lowerDesc.contains("danger")) {
                basePriority += 5;
            }
            if (lowerDesc.contains("blessé") || lowerDesc.contains("armé")) {
                basePriority += 3;
            }
        }

        // Add location bonus for sensitive areas
        if (zone != null) {
            String lowerZone = zone.toLowerCase();
            if (lowerZone.contains("école") || lowerZone.contains("hôpital") ||
                    lowerZone.contains("mosquée") || lowerZone.contains("lycée")) {
                basePriority += 3;
            }
        }

        return Math.min(basePriority, 25); // Cap at maximum priority
    }
    public Map<String,Object> classifyRaw(String description, String zone) {
        String url = nlpConfig.getNlpServiceUrl() + CLASSIFY_ENDPOINT;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        ClassificationRequestDTO request = new ClassificationRequestDTO(description, zone, LocalDateTime.now());
        HttpEntity<ClassificationRequestDTO> entity = new HttpEntity<>(request, headers);

        ResponseEntity<Map> resp = restTemplate.postForEntity(url, entity, Map.class);
        if (resp.getStatusCode() != HttpStatus.OK || resp.getBody() == null) {
            throw new RestClientException("NLP service returned invalid response");
        }
        //noinspection unchecked
        return resp.getBody();
    }

    /**
     * Determine urgency level based on priority score
     */
    private String determineUrgencyLevel(int priority) {
        if (priority >= 20) return "critical";
        if (priority >= 15) return "high";
        if (priority >= 8) return "medium";
        return "low";
    }


}