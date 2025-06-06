package com.observatoire.gestion_plaintes.DTOs;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;

public class AlertDTO {
    @JsonProperty("alert_id")
    private String alertId;

    private String zone;
    private String category;

    @JsonProperty("grouped_category")
    private String groupedCategory;

    @JsonProperty("current_count")
    private int currentCount;

    @JsonProperty("previous_count")
    private int previousCount;

    @JsonProperty("percentage_increase")
    private double percentageIncrease;

    @JsonProperty("alert_message")
    private String alertMessage;

    private String severity; // LOW, MEDIUM, HIGH, CRITICAL

    @JsonProperty("detected_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime detectedAt;

    @JsonProperty("period_start")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime periodStart;

    @JsonProperty("period_end")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime periodEnd;

    @JsonProperty("recommended_action")
    private String recommendedAction;

    @JsonProperty("urgency_level")
    private String urgencyLevel;

    @JsonProperty("requires_immediate_attention")
    private boolean requiresImmediateAttention;

    // Constructors
    public AlertDTO() {}

    public AlertDTO(String zone, String category, int currentCount, int previousCount,
                    double percentageIncrease, String severity) {
        this.zone = zone;
        this.category = category;
        this.currentCount = currentCount;
        this.previousCount = previousCount;
        this.percentageIncrease = percentageIncrease;
        this.severity = severity;
        this.detectedAt = LocalDateTime.now();
        this.requiresImmediateAttention = severity.equals("CRITICAL") || severity.equals("HIGH");
    }

    // Getters and Setters
    public String getAlertId() {
        return alertId;
    }

    public void setAlertId(String alertId) {
        this.alertId = alertId;
    }

    public String getZone() {
        return zone;
    }

    public void setZone(String zone) {
        this.zone = zone;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getGroupedCategory() {
        return groupedCategory;
    }

    public void setGroupedCategory(String groupedCategory) {
        this.groupedCategory = groupedCategory;
    }

    public int getCurrentCount() {
        return currentCount;
    }

    public void setCurrentCount(int currentCount) {
        this.currentCount = currentCount;
    }

    public int getPreviousCount() {
        return previousCount;
    }

    public void setPreviousCount(int previousCount) {
        this.previousCount = previousCount;
    }

    public double getPercentageIncrease() {
        return percentageIncrease;
    }

    public void setPercentageIncrease(double percentageIncrease) {
        this.percentageIncrease = percentageIncrease;
    }

    public String getAlertMessage() {
        return alertMessage;
    }

    public void setAlertMessage(String alertMessage) {
        this.alertMessage = alertMessage;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
        this.requiresImmediateAttention = severity.equals("CRITICAL") || severity.equals("HIGH");
    }

    public LocalDateTime getDetectedAt() {
        return detectedAt;
    }

    public void setDetectedAt(LocalDateTime detectedAt) {
        this.detectedAt = detectedAt;
    }

    public LocalDateTime getPeriodStart() {
        return periodStart;
    }

    public void setPeriodStart(LocalDateTime periodStart) {
        this.periodStart = periodStart;
    }

    public LocalDateTime getPeriodEnd() {
        return periodEnd;
    }

    public void setPeriodEnd(LocalDateTime periodEnd) {
        this.periodEnd = periodEnd;
    }

    public String getRecommendedAction() {
        return recommendedAction;
    }

    public void setRecommendedAction(String recommendedAction) {
        this.recommendedAction = recommendedAction;
    }

    public String getUrgencyLevel() {
        return urgencyLevel;
    }

    public void setUrgencyLevel(String urgencyLevel) {
        this.urgencyLevel = urgencyLevel;
    }

    public boolean isRequiresImmediateAttention() {
        return requiresImmediateAttention;
    }

    public void setRequiresImmediateAttention(boolean requiresImmediateAttention) {
        this.requiresImmediateAttention = requiresImmediateAttention;
    }

    @Override
    public String toString() {
        return "AlertDTO{" +
                "alertId='" + alertId + '\'' +
                ", zone='" + zone + '\'' +
                ", category='" + category + '\'' +
                ", currentCount=" + currentCount +
                ", previousCount=" + previousCount +
                ", percentageIncrease=" + percentageIncrease +
                ", severity='" + severity + '\'' +
                ", alertMessage='" + alertMessage + '\'' +
                '}';
    }
}