package com.observatoire.gestion_plaintes.stats.DTOs;

import java.util.List;

// entrée
public class CommuneStats {
    private String commune;
    private Long totalPlaintes;
    private double lat;
    private double lon;

    public CommuneStats() { }
    public CommuneStats(String commune, Long totalPlaintes, double lat, double lon) {
        this.commune = commune;
        this.totalPlaintes = totalPlaintes;
        this.lat = lat;
        this.lon = lon;
    }

    public CommuneStats(String commune, Long totalPlaintes) {
        this.commune = commune;
        this.totalPlaintes = totalPlaintes;
    }

    public String getCommune() {
        return commune;
    }

    public void setCommune(String commune) {
        this.commune = commune;
    }

    public double getLat() {
        return lat;
    }

    public void setLat(double lat) {
        this.lat = lat;
    }

    public double getLon() {
        return lon;
    }

    public void setLon(double lon) {
        this.lon = lon;
    }

    public Long getTotalPlaintes() {
        return totalPlaintes;
    }

    public void setTotalPlaintes(Long totalPlaintes) {
        this.totalPlaintes = totalPlaintes;
    }
}
