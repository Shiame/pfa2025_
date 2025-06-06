package com.observatoire.gestion_plaintes.DTOs;

import com.fasterxml.jackson.annotation.JsonProperty;

public class StatisticsOverviewDTO {
    @JsonProperty("total_complaints_analyzed")
    private int totalComplaintsAnalyzed;

    @JsonProperty("total_classifications")
    private int totalClassifications;

    @JsonProperty("total_recommendations_generated")
    private int totalRecommendationsGenerated;

    @JsonProperty("total_anomalies_detected")
    private int totalAnomaliesDetected;

    @JsonProperty("total_zones_analyzed")
    private int totalZonesAnalyzed;

    @JsonProperty("total_categories_processed")
    private int totalCategoriesProcessed;

    @JsonProperty("analysis_accuracy_percentage")
    private double analysisAccuracyPercentage;

    @JsonProperty("average_priority_score")
    private double averagePriorityScore;

    @JsonProperty("nlp_service_uptime_percentage")
    private double nlpServiceUptimePercentage;

    public StatisticsOverviewDTO() {}

    // Getters and Setters
    public int getTotalComplaintsAnalyzed() {
        return totalComplaintsAnalyzed;
    }

    public void setTotalComplaintsAnalyzed(int totalComplaintsAnalyzed) {
        this.totalComplaintsAnalyzed = totalComplaintsAnalyzed;
    }

    public int getTotalClassifications() {
        return totalClassifications;
    }

    public void setTotalClassifications(int totalClassifications) {
        this.totalClassifications = totalClassifications;
    }

    public int getTotalRecommendationsGenerated() {
        return totalRecommendationsGenerated;
    }

    public void setTotalRecommendationsGenerated(int totalRecommendationsGenerated) {
        this.totalRecommendationsGenerated = totalRecommendationsGenerated;
    }

    public int getTotalAnomaliesDetected() {
        return totalAnomaliesDetected;
    }

    public void setTotalAnomaliesDetected(int totalAnomaliesDetected) {
        this.totalAnomaliesDetected = totalAnomaliesDetected;
    }

    public int getTotalZonesAnalyzed() {
        return totalZonesAnalyzed;
    }

    public void setTotalZonesAnalyzed(int totalZonesAnalyzed) {
        this.totalZonesAnalyzed = totalZonesAnalyzed;
    }

    public int getTotalCategoriesProcessed() {
        return totalCategoriesProcessed;
    }

    public void setTotalCategoriesProcessed(int totalCategoriesProcessed) {
        this.totalCategoriesProcessed = totalCategoriesProcessed;
    }

    public double getAnalysisAccuracyPercentage() {
        return analysisAccuracyPercentage;
    }

    public void setAnalysisAccuracyPercentage(double analysisAccuracyPercentage) {
        this.analysisAccuracyPercentage = analysisAccuracyPercentage;
    }

    public double getAveragePriorityScore() {
        return averagePriorityScore;
    }

    public void setAveragePriorityScore(double averagePriorityScore) {
        this.averagePriorityScore = averagePriorityScore;
    }

    public double getNlpServiceUptimePercentage() {
        return nlpServiceUptimePercentage;
    }

    public void setNlpServiceUptimePercentage(double nlpServiceUptimePercentage) {
        this.nlpServiceUptimePercentage = nlpServiceUptimePercentage;
    }
}