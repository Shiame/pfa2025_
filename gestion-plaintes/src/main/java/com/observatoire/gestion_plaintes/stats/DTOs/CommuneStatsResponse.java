package com.observatoire.gestion_plaintes.stats.DTOs;

import java.util.List;

// wrapper
public class CommuneStatsResponse {
    private List<CommuneStats> communes;
    public CommuneStatsResponse() { }
    public List<CommuneStats> getCommunes() { return communes; }
    public void setCommunes(List<CommuneStats> communes) { this.communes = communes; }

    public CommuneStatsResponse(List<CommuneStats> communes) {
        this.communes = communes;
    }
}
