package com.observatoire.gestion_plaintes.stats.DTOs.FrequencyStats;

import java.util.List;

public class FrequencyStats {
    public List<ZoneCategoryCount> getCounts() {
        return counts;
    }

    public void setCounts(List<ZoneCategoryCount> counts) {
        this.counts = counts;
    }

    private List<ZoneCategoryCount> counts;
}
