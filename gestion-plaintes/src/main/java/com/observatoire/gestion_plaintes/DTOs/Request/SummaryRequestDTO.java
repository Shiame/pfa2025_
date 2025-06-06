package com.observatoire.gestion_plaintes.DTOs.Request;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;
import java.util.Map;

public class SummaryRequestDTO {
    private List<Map<String, Object>> complaints;

    @JsonProperty("hours_back")
    private int hoursBack;

    @JsonProperty("zone_filter")
    private String zoneFilter;

    public SummaryRequestDTO() {}

    public SummaryRequestDTO(List<Map<String, Object>> complaints, int hoursBack, String zoneFilter) {
        this.complaints = complaints;
        this.hoursBack = hoursBack;
        this.zoneFilter = zoneFilter;
    }

    // Getters and Setters
    public List<Map<String, Object>> getComplaints() {
        return complaints;
    }

    public void setComplaints(List<Map<String, Object>> complaints) {
        this.complaints = complaints;
    }

    public int getHoursBack() {
        return hoursBack;
    }

    public void setHoursBack(int hoursBack) {
        this.hoursBack = hoursBack;
    }

    public String getZoneFilter() {
        return zoneFilter;
    }

    public void setZoneFilter(String zoneFilter) {
        this.zoneFilter = zoneFilter;
    }
}