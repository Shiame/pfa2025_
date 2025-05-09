package com.observatoire.gestion_plaintes.stats.DTOs.FrequencyStats;

public class ZoneCategoryCount {
    private String zone;
    private String category;
    private long count;

    public String getZone() {
        return zone;
    }

    public ZoneCategoryCount(String zone, String category, long count) {
        this.zone = zone;
        this.category = category;
        this.count = count;
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

    public long getCount() {
        return count;
    }

    public void setCount(long count) {
        this.count = count;
    }
}
