package com.observatoire.gestion_plaintes.DTOs.Response;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;
import java.util.Map;

public class TrendAnalysisResponseDTO {
    private Map<String, Object> trends;

    @JsonProperty("trend_message")
    private String trendMessage;

    private List<String> recommendations;

    public TrendAnalysisResponseDTO() {}

    // Getters and Setters
    public Map<String, Object> getTrends() {
        return trends;
    }

    public void setTrends(Map<String, Object> trends) {
        this.trends = trends;
    }

    public String getTrendMessage() {
        return trendMessage;
    }

    public void setTrendMessage(String trendMessage) {
        this.trendMessage = trendMessage;
    }

    public List<String> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<String> recommendations) {
        this.recommendations = recommendations;
    }
}