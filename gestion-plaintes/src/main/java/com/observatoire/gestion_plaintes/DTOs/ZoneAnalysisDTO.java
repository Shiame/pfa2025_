package com.observatoire.gestion_plaintes.DTOs;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class ZoneAnalysisDTO {
    @JsonProperty("zone_name")
    private String zoneName;

    private List<SummaryDTO> summaries;

    @JsonProperty("zone_analysis")
    private Map<String, Object> zoneAnalysis;

    @JsonProperty("analysis_period_hours")
    private int analysisPeriodHours;

    @JsonProperty("generated_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime generatedAt;

    @JsonProperty("total_complaints_in_zone")
    private int totalComplaintsInZone;

    @JsonProperty("zone_priority_score")
    private double zonePriorityScore;

    @JsonProperty("most_common_category")
    private String mostCommonCategory;

    @JsonProperty("zone_recommendations")
    private List<String> zoneRecommendations;

    public ZoneAnalysisDTO() {
        this.generatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getZoneName() {
        return zoneName;
    }

    public void setZoneName(String zoneName) {
        this.zoneName = zoneName;
    }

    public List<SummaryDTO> getSummaries() {
        return summaries;
    }

    public void setSummaries(List<SummaryDTO> summaries) {
        this.summaries = summaries;
    }

    public Map<String, Object> getZoneAnalysis() {
        return zoneAnalysis;
    }

    public void setZoneAnalysis(Map<String, Object> zoneAnalysis) {
        this.zoneAnalysis = zoneAnalysis;
    }

    public int getAnalysisPeriodHours() {
        return analysisPeriodHours;
    }

    public void setAnalysisPeriodHours(int analysisPeriodHours) {
        this.analysisPeriodHours = analysisPeriodHours;
    }

    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(LocalDateTime generatedAt) {
        this.generatedAt = generatedAt;
    }

    public int getTotalComplaintsInZone() {
        return totalComplaintsInZone;
    }

    public void setTotalComplaintsInZone(int totalComplaintsInZone) {
        this.totalComplaintsInZone = totalComplaintsInZone;
    }

    public double getZonePriorityScore() {
        return zonePriorityScore;
    }

    public void setZonePriorityScore(double zonePriorityScore) {
        this.zonePriorityScore = zonePriorityScore;
    }

    public String getMostCommonCategory() {
        return mostCommonCategory;
    }

    public void setMostCommonCategory(String mostCommonCategory) {
        this.mostCommonCategory = mostCommonCategory;
    }

    public List<String> getZoneRecommendations() {
        return zoneRecommendations;
    }

    public void setZoneRecommendations(List<String> zoneRecommendations) {
        this.zoneRecommendations = zoneRecommendations;
    }
}
