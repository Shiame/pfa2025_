package com.observatoire.gestion_plaintes.DTOs;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;

public class SummaryDTO {
    private String zone;
    private String category;

    @JsonProperty("grouped_category")
    private String groupedCategory;

    private int count;

    @JsonProperty("natural_language_summary")
    private String naturalLanguageSummary;

    @JsonProperty("period_start")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime periodStart;

    @JsonProperty("period_end")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime periodEnd;

    @JsonProperty("is_anomaly")
    private boolean isAnomaly;

    @JsonProperty("percentage_change")
    private double percentageChange;

    @JsonProperty("severity_level")
    private String severityLevel;

    private String priority;

    @JsonProperty("trend_direction")
    private String trendDirection; // "increase", "decrease", "stable"

    // Constructors
    public SummaryDTO() {}

    public SummaryDTO(String zone, String category, int count) {
        this.zone = zone;
        this.category = category;
        this.count = count;
    }

    public SummaryDTO(String zone, String category, String groupedCategory, int count,
                      String naturalLanguageSummary, LocalDateTime periodStart,
                      LocalDateTime periodEnd, boolean isAnomaly, double percentageChange) {
        this.zone = zone;
        this.category = category;
        this.groupedCategory = groupedCategory;
        this.count = count;
        this.naturalLanguageSummary = naturalLanguageSummary;
        this.periodStart = periodStart;
        this.periodEnd = periodEnd;
        this.isAnomaly = isAnomaly;
        this.percentageChange = percentageChange;
    }

    // Getters and Setters
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

    public int getCount() {
        return count;
    }

    public void setCount(int count) {
        this.count = count;
    }

    public String getNaturalLanguageSummary() {
        return naturalLanguageSummary;
    }

    public void setNaturalLanguageSummary(String naturalLanguageSummary) {
        this.naturalLanguageSummary = naturalLanguageSummary;
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

    public boolean isAnomaly() {
        return isAnomaly;
    }

    public void setAnomaly(boolean anomaly) {
        isAnomaly = anomaly;
    }

    public double getPercentageChange() {
        return percentageChange;
    }

    public void setPercentageChange(double percentageChange) {
        this.percentageChange = percentageChange;
    }

    public String getSeverityLevel() {
        return severityLevel;
    }

    public void setSeverityLevel(String severityLevel) {
        this.severityLevel = severityLevel;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getTrendDirection() {
        return trendDirection;
    }

    public void setTrendDirection(String trendDirection) {
        this.trendDirection = trendDirection;
    }

    @Override
    public String toString() {
        return "SummaryDTO{" +
                "zone='" + zone + '\'' +
                ", category='" + category + '\'' +
                ", groupedCategory='" + groupedCategory + '\'' +
                ", count=" + count +
                ", naturalLanguageSummary='" + naturalLanguageSummary + '\'' +
                ", isAnomaly=" + isAnomaly +
                ", percentageChange=" + percentageChange +
                '}';
    }
}