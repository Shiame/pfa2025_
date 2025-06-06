package com.observatoire.gestion_plaintes.DTOs;


import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.observatoire.gestion_plaintes.DTOs.Response.AlertSummaryDTO;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;



public class IntelligentDashboardDTO {
    @JsonProperty("comprehensive_analysis")
    private Map<String, Object> comprehensiveAnalysis;

    @JsonProperty("intelligent_summaries")
    private List<SummaryDTO> intelligentSummaries;

    @JsonProperty("trend_analysis")
    private Map<String, Object> trendAnalysis;

    @JsonProperty("alert_summary")
    private AlertSummaryDTO alertSummary;

    @JsonProperty("generated_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime generatedAt;

    @JsonProperty("analysis_period_hours")
    private int analysisPeriodHours;

    private String status;

    @JsonProperty("nlp_service_status")
    private String nlpServiceStatus;

    public IntelligentDashboardDTO() {
        this.generatedAt = LocalDateTime.now();
        this.status = "success";
    }

    // Getters and Setters
    public Map<String, Object> getComprehensiveAnalysis() {
        return comprehensiveAnalysis;
    }

    public void setComprehensiveAnalysis(Map<String, Object> comprehensiveAnalysis) {
        this.comprehensiveAnalysis = comprehensiveAnalysis;
    }

    public List<SummaryDTO> getIntelligentSummaries() {
        return intelligentSummaries;
    }

    public void setIntelligentSummaries(List<SummaryDTO> intelligentSummaries) {
        this.intelligentSummaries = intelligentSummaries;
    }

    public Map<String, Object> getTrendAnalysis() {
        return trendAnalysis;
    }

    public void setTrendAnalysis(Map<String, Object> trendAnalysis) {
        this.trendAnalysis = trendAnalysis;
    }

    public AlertSummaryDTO getAlertSummary() {
        return alertSummary;
    }

    public void setAlertSummary(AlertSummaryDTO alertSummary) {
        this.alertSummary = alertSummary;
    }

    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(LocalDateTime generatedAt) {
        this.generatedAt = generatedAt;
    }

    public int getAnalysisPeriodHours() {
        return analysisPeriodHours;
    }

    public void setAnalysisPeriodHours(int analysisPeriodHours) {
        this.analysisPeriodHours = analysisPeriodHours;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNlpServiceStatus() {
        return nlpServiceStatus;
    }

    public void setNlpServiceStatus(String nlpServiceStatus) {
        this.nlpServiceStatus = nlpServiceStatus;
    }
}

