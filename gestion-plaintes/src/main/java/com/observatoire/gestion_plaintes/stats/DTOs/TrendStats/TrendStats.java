package com.observatoire.gestion_plaintes.stats.DTOs.TrendStats;

import java.util.List;

public class TrendStats {
    List<ZoneCategoryTrend> trends;

    public List<ZoneCategoryTrend> getTrends() {
        return trends;
    }

    public void setTrends(List<ZoneCategoryTrend> trends) {
        this.trends = trends;
    }
}
