package com.observatoire.gestion_plaintes.DTOs.Request;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class TrendAnalysisRequestDTO {
    @JsonProperty("current_period_data")
    private List<Map<String, Object>> currentPeriodData;

    @JsonProperty("previous_period_data")
    private List<Map<String, Object>> previousPeriodData;

    @JsonProperty("analysis_type")
    private String analysisType = "percentage_change";

    public TrendAnalysisRequestDTO() {}

    public TrendAnalysisRequestDTO(List<Map<String, Object>> currentPeriodData,
                                   List<Map<String, Object>> previousPeriodData,
                                   String analysisType) {
        this.currentPeriodData = currentPeriodData;
        this.previousPeriodData = previousPeriodData;
        this.analysisType = analysisType;
    }

    // Getters and Setters
    public List<Map<String, Object>> getCurrentPeriodData() {
        return currentPeriodData;
    }

    public void setCurrentPeriodData(List<Map<String, Object>> currentPeriodData) {
        this.currentPeriodData = currentPeriodData;
    }

    public List<Map<String, Object>> getPreviousPeriodData() {
        return previousPeriodData;
    }

    public void setPreviousPeriodData(List<Map<String, Object>> previousPeriodData) {
        this.previousPeriodData = previousPeriodData;
    }

    public String getAnalysisType() {
        return analysisType;
    }

    public void setAnalysisType(String analysisType) {
        this.analysisType = analysisType;
    }
}
