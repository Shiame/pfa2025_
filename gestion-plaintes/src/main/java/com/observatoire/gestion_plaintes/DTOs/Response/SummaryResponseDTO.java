package com.observatoire.gestion_plaintes.DTOs.Response;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;
import java.util.Map;

public class SummaryResponseDTO {
    @JsonProperty("natural_language_summary")
    private String naturalLanguageSummary;

    private Map<String, Object> trends;
    private List<String> recommendations;

    @JsonProperty("anomalies_detected")
    private boolean anomaliesDetected;

    @JsonProperty("severity_level")
    private String severityLevel;

    public SummaryResponseDTO() {}

    // Getters and Setters
    public String getNaturalLanguageSummary() {
        return naturalLanguageSummary;
    }

    public void setNaturalLanguageSummary(String naturalLanguageSummary) {
        this.naturalLanguageSummary = naturalLanguageSummary;
    }

    public Map<String, Object> getTrends() {
        return trends;
    }

    public void setTrends(Map<String, Object> trends) {
        this.trends = trends;
    }

    public List<String> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<String> recommendations) {
        this.recommendations = recommendations;
    }

    public boolean isAnomaliesDetected() {
        return anomaliesDetected;
    }

    public void setAnomaliesDetected(boolean anomaliesDetected) {
        this.anomaliesDetected = anomaliesDetected;
    }

    public String getSeverityLevel() {
        return severityLevel;
    }

    public void setSeverityLevel(String severityLevel) {
        this.severityLevel = severityLevel;
    }
}
