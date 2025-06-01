package com.observatoire.gestion_plaintes.DTOs.Response;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;
import java.util.Map;

public class ComprehensiveAnalysisResponseDTO {
    @JsonProperty("individual_classifications")
    private List<IndividualClassificationDTO> individualClassifications;

    @JsonProperty("aggregate_summary")
    private String aggregateSummary;

    private Map<String, Object> trends;
    private List<String> recommendations;

    @JsonProperty("total_complaints")
    private int totalComplaints;

    @JsonProperty("analysis_timestamp")
    private String analysisTimestamp;

    public ComprehensiveAnalysisResponseDTO() {}

    // Getters and Setters
    public List<IndividualClassificationDTO> getIndividualClassifications() {
        return individualClassifications;
    }

    public void setIndividualClassifications(List<IndividualClassificationDTO> individualClassifications) {
        this.individualClassifications = individualClassifications;
    }

    public String getAggregateSummary() {
        return aggregateSummary;
    }

    public void setAggregateSummary(String aggregateSummary) {
        this.aggregateSummary = aggregateSummary;
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

    public int getTotalComplaints() {
        return totalComplaints;
    }

    public void setTotalComplaints(int totalComplaints) {
        this.totalComplaints = totalComplaints;
    }

    public String getAnalysisTimestamp() {
        return analysisTimestamp;
    }

    public void setAnalysisTimestamp(String analysisTimestamp) {
        this.analysisTimestamp = analysisTimestamp;
    }
}