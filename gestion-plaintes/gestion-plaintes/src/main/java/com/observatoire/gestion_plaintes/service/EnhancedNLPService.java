package com.observatoire.gestion_plaintes.service;

import com.observatoire.gestion_plaintes.DTOs.Response.ClassificationResponse;
import com.observatoire.gestion_plaintes.DTOs.SummaryDTO;
import com.observatoire.gestion_plaintes.model.Plainte;
import com.observatoire.gestion_plaintes.repository.PlainteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class EnhancedNLPService {

    @Autowired
    private PlainteRepository plainteRepository;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${nlp.service.url:http://localhost:8000}")
    private String nlpServiceUrl;

    /**
     * EXISTING METHOD - Keep your current classification logic
     */
    public ClassificationResponse classifyAndPrioritize(String description, String zone) {
        try {
            String url = nlpServiceUrl + "/classify";

            Map<String, Object> request = new HashMap<>();
            request.put("description", description);
            request.put("localisation", zone);
            request.put("date_incident", LocalDateTime.now().toString());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                Map<String, Object> responseBody = response.getBody();

                ClassificationResponse classificationResponse = new ClassificationResponse();
                classificationResponse.setCategorie((String) responseBody.get("categorie"));
                classificationResponse.setScores((Map<String, Double>) responseBody.get("scores"));
                classificationResponse.setPriorite((Integer) responseBody.get("priorite"));
                classificationResponse.setNiveauUrgence((String) responseBody.get("niveau_urgence"));

                return classificationResponse;
            }
        } catch (Exception e) {
            // Fallback logic if NLP service is down
            return createFallbackClassification(description);
        }

        return createFallbackClassification(description);
    }

    /**
     * NEW METHOD - Generate intelligent summaries using enhanced NLP service
     */
    public List<SummaryDTO> generateIntelligentSummaries(int hours, String zoneFilter) {
        try {
            // Get recent complaints from database
            LocalDateTime from = LocalDateTime.now().minusHours(hours);
            List<Object[]> rawData = plainteRepository.countRecentByZoneAndCategory(from);

            // Get detailed complaint data for NLP analysis
            List<Plainte> recentComplaints = plainteRepository.findAll()
                    .stream()
                    .filter(p -> p.getDateSoumission().isAfter(from))
                    .filter(p -> zoneFilter == null || zoneFilter.equals(p.getZone()))
                    .collect(Collectors.toList());

            // Prepare data for NLP service
            List<Map<String, Object>> complaintsForNLP = recentComplaints.stream()
                    .map(this::convertPlainteToNLPFormat)
                    .collect(Collectors.toList());

            // Call enhanced NLP service
            String url = nlpServiceUrl + "/generate-summary";

            Map<String, Object> request = new HashMap<>();
            request.put("complaints", complaintsForNLP);
            request.put("hours_back", hours);
            request.put("zone_filter", zoneFilter);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                Map<String, Object> nlpResponse = response.getBody();

                // Convert NLP response to SummaryDTO list
                return convertNLPResponseToSummaries(nlpResponse, rawData, from);
            }

        } catch (Exception e) {
            // Fallback to basic summaries if NLP service fails
            return generateBasicSummaries(hours, zoneFilter);
        }

        return generateBasicSummaries(hours, zoneFilter);
    }

    /**
     * NEW METHOD - Comprehensive analysis for dashboard
     */
    public Map<String, Object> getComprehensiveAnalysis(int hours) {
        try {
            LocalDateTime from = LocalDateTime.now().minusHours(hours);

            // Get recent complaints
            List<Plainte> recentComplaints = plainteRepository.findAll()
                    .stream()
                    .filter(p -> p.getDateSoumission().isAfter(from))
                    .collect(Collectors.toList());

            List<Map<String, Object>> complaintsForNLP = recentComplaints.stream()
                    .map(this::convertPlainteToNLPFormat)
                    .collect(Collectors.toList());

            // Call comprehensive analysis endpoint
            String url = nlpServiceUrl + "/comprehensive-analysis";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<List<Map<String, Object>>> entity = new HttpEntity<>(complaintsForNLP, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                Map<String, Object> analysisResult = response.getBody();

                // Enhance with database statistics
                Map<String, Object> enhancedResult = new HashMap<>(analysisResult);
                enhancedResult.put("total_complaints", recentComplaints.size());
                enhancedResult.put("period_hours", hours);
                enhancedResult.put("analysis_timestamp", LocalDateTime.now());

                return enhancedResult;
            }

        } catch (Exception e) {
            // Fallback analysis
            return createFallbackAnalysis(hours);
        }

        return createFallbackAnalysis(hours);
    }

    /**
     * NEW METHOD - Trend analysis between periods
     */
    public Map<String, Object> analyzeTrends(int currentHours, int previousHours) {
        try {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime currentStart = now.minusHours(currentHours);
            LocalDateTime previousStart = now.minusHours(previousHours);
            LocalDateTime previousEnd = now.minusHours(currentHours);

            // Get current period complaints
            List<Plainte> currentComplaints = plainteRepository.findAll()
                    .stream()
                    .filter(p -> p.getDateSoumission().isAfter(currentStart))
                    .collect(Collectors.toList());

            // Get previous period complaints
            List<Plainte> previousComplaints = plainteRepository.findAll()
                    .stream()
                    .filter(p -> p.getDateSoumission().isAfter(previousStart) &&
                            p.getDateSoumission().isBefore(previousEnd))
                    .collect(Collectors.toList());

            // Convert to NLP format
            List<Map<String, Object>> currentForNLP = currentComplaints.stream()
                    .map(this::convertPlainteToNLPFormat)
                    .collect(Collectors.toList());

            List<Map<String, Object>> previousForNLP = previousComplaints.stream()
                    .map(this::convertPlainteToNLPFormat)
                    .collect(Collectors.toList());

            // Call NLP trend analysis
            String url = nlpServiceUrl + "/analyze-trends";

            Map<String, Object> request = new HashMap<>();
            request.put("current_period_data", currentForNLP);
            request.put("previous_period_data", previousForNLP);
            request.put("analysis_type", "percentage_change");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                return response.getBody();
            }

        } catch (Exception e) {
            // Fallback trend analysis
            return createFallbackTrendAnalysis(currentHours, previousHours);
        }

        return createFallbackTrendAnalysis(currentHours, previousHours);
    }

    // ============================================================================
    // HELPER METHODS
    // ============================================================================

    private Map<String, Object> convertPlainteToNLPFormat(Plainte plainte) {
        Map<String, Object> nlpData = new HashMap<>();
        nlpData.put("id", plainte.getId());
        nlpData.put("description", plainte.getDescription());
        nlpData.put("zone", plainte.getZone());
        nlpData.put("category", plainte.getCategorie() != null ? plainte.getCategorie().getNom() : "AUTRES");
        nlpData.put("priority", plainte.getPriorite());
        nlpData.put("date_soumission", plainte.getDateSoumission().toString());
        nlpData.put("localisation", plainte.getLocalisation());
        return nlpData;
    }

    private List<SummaryDTO> convertNLPResponseToSummaries(Map<String, Object> nlpResponse,
                                                           List<Object[]> rawData,
                                                           LocalDateTime from) {
        List<SummaryDTO> summaries = new ArrayList<>();

        String naturalSummary = (String) nlpResponse.get("natural_language_summary");
        List<String> recommendations = (List<String>) nlpResponse.get("recommendations");
        Boolean anomalyDetected = (Boolean) nlpResponse.get("anomalies_detected");
        String severityLevel = (String) nlpResponse.get("severity_level");

        // Create summaries from raw data enhanced with NLP insights
        for (Object[] row : rawData) {
            String zone = (String) row[0];
            String category = (String) row[1];
            int count = ((Number) row[2]).intValue();

            SummaryDTO summary = new SummaryDTO();
            summary.setZone(zone);
            summary.setCategory(category);
            summary.setCount(count);
            summary.setPeriodStart(from);
            summary.setPeriodEnd(LocalDateTime.now());
            summary.setAnomaly(anomalyDetected != null ? anomalyDetected : false);

            // Use NLP-generated summary for the first/main summary
            if (summaries.isEmpty()) {
                summary.setNaturalLanguageSummary(naturalSummary);
            } else {
                summary.setNaturalLanguageSummary(
                        String.format("À %s, %d plainte(s) pour %s", zone, count, category.toLowerCase())
                );
            }

            summaries.add(summary);
        }

        return summaries;
    }

    private ClassificationResponse createFallbackClassification(String description) {
        // Basic fallback when NLP service is unavailable
        ClassificationResponse fallback = new ClassificationResponse();
        fallback.setCategorie("AUTRES");
        fallback.setPriorite(5);
        fallback.setNiveauUrgence("medium");

        Map<String, Double> scores = new HashMap<>();
        scores.put("AUTRES", 0.8);
        fallback.setScores(scores);

        return fallback;
    }

    private List<SummaryDTO> generateBasicSummaries(int hours, String zoneFilter) {
        // Basic summaries without NLP enhancement
        LocalDateTime from = LocalDateTime.now().minusHours(hours);
        List<Object[]> rawData = plainteRepository.countRecentByZoneAndCategory(from);

        return rawData.stream()
                .filter(row -> zoneFilter == null || zoneFilter.equals((String) row[0]))
                .map(row -> {
                    SummaryDTO summary = new SummaryDTO();
                    summary.setZone((String) row[0]);
                    summary.setCategory((String) row[1]);
                    summary.setCount(((Number) row[2]).intValue());
                    summary.setPeriodStart(from);
                    summary.setPeriodEnd(LocalDateTime.now());
                    summary.setNaturalLanguageSummary(
                            String.format("Dans les %d dernières heures à %s, %d plainte(s) pour %s",
                                    hours, row[0], ((Number) row[2]).intValue(), row[1])
                    );
                    return summary;
                })
                .collect(Collectors.toList());
    }

    private Map<String, Object> createFallbackAnalysis(int hours) {
        Map<String, Object> fallback = new HashMap<>();
        fallback.put("status", "fallback");
        fallback.put("message", "Service NLP indisponible - analyse basique");
        fallback.put("recommendations", Arrays.asList("Vérifier la connectivité au service NLP"));
        return fallback;
    }

    private Map<String, Object> createFallbackTrendAnalysis(int currentHours, int previousHours) {
        Map<String, Object> fallback = new HashMap<>();
        fallback.put("trend_message", "Analyse des tendances indisponible");
        fallback.put("recommendations", Arrays.asList("Service NLP requis pour l'analyse des tendances"));
        return fallback;
    }
}