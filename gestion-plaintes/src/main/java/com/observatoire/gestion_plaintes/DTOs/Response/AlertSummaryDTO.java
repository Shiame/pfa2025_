package com.observatoire.gestion_plaintes.DTOs.Response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.observatoire.gestion_plaintes.DTOs.AlertDTO;

import java.util.List;

public class AlertSummaryDTO {
    @JsonProperty("total_alerts")
    private int totalAlerts;

    @JsonProperty("critical_alerts")
    private int criticalAlerts;

    @JsonProperty("high_priority_alerts")
    private int highPriorityAlerts;

    @JsonProperty("recent_alerts")
    private List<AlertDTO> recentAlerts;

    @JsonProperty("top_affected_zones")
    private List<String> topAffectedZones;

    @JsonProperty("alert_trend")
    private String alertTrend; // "increasing", "decreasing", "stable"

    public AlertSummaryDTO() {}

    public AlertSummaryDTO(int totalAlerts, int criticalAlerts, int highPriorityAlerts) {
        this.totalAlerts = totalAlerts;
        this.criticalAlerts = criticalAlerts;
        this.highPriorityAlerts = highPriorityAlerts;
    }

    // Getters and Setters
    public int getTotalAlerts() {
        return totalAlerts;
    }

    public void setTotalAlerts(int totalAlerts) {
        this.totalAlerts = totalAlerts;
    }

    public int getCriticalAlerts() {
        return criticalAlerts;
    }

    public void setCriticalAlerts(int criticalAlerts) {
        this.criticalAlerts = criticalAlerts;
    }

    public int getHighPriorityAlerts() {
        return highPriorityAlerts;
    }

    public void setHighPriorityAlerts(int highPriorityAlerts) {
        this.highPriorityAlerts = highPriorityAlerts;
    }

    public List<AlertDTO> getRecentAlerts() {
        return recentAlerts;
    }

    public void setRecentAlerts(List<AlertDTO> recentAlerts) {
        this.recentAlerts = recentAlerts;
    }

    public List<String> getTopAffectedZones() {
        return topAffectedZones;
    }

    public void setTopAffectedZones(List<String> topAffectedZones) {
        this.topAffectedZones = topAffectedZones;
    }

    public String getAlertTrend() {
        return alertTrend;
    }

    public void setAlertTrend(String alertTrend) {
        this.alertTrend = alertTrend;
    }
}