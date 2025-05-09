package com.observatoire.gestion_plaintes.stats.DTOs.TrendStats;

public class ZoneCategoryTrend {
    private String zone;
    private String category;
    private double percentageChange;

    public ZoneCategoryTrend(String zone, String category, double percentageChange) {
        this.zone = zone;
        this.category = category;
        this.percentageChange = percentageChange;
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

    public double getPercentageChange() {
        return percentageChange;
    }

    public void setPercentageChange(double percentageChange) {
        this.percentageChange = percentageChange;
    }
}
