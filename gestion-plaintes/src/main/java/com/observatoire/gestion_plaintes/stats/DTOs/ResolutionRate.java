package com.observatoire.gestion_plaintes.stats.DTOs;

public class ResolutionRate {
    private String commune;
    private String categorie;
    private Long totalPlaintes;
    private Long resoluePlaintes;
    private Double tauxResolution;

    public ResolutionRate() {}

    public ResolutionRate(String commune, String categorie, Long totalPlaintes, Long resoluePlaintes, Double tauxResolution) {
        this.commune = commune;
        this.categorie = categorie;
        this.totalPlaintes = totalPlaintes;
        this.resoluePlaintes = resoluePlaintes;
        this.tauxResolution = tauxResolution;
    }

    // Getters and Setters
    public String getCommune() {
        return commune;
    }

    public void setCommune(String commune) {
        this.commune = commune;
    }

    public String getCategorie() {
        return categorie;
    }

    public void setCategorie(String categorie) {
        this.categorie = categorie;
    }

    public Long getTotalPlaintes() {
        return totalPlaintes;
    }

    public void setTotalPlaintes(Long totalPlaintes) {
        this.totalPlaintes = totalPlaintes;
    }

    public Long getResoluePlaintes() {
        return resoluePlaintes;
    }

    public void setResoluePlaintes(Long resoluePlaintes) {
        this.resoluePlaintes = resoluePlaintes;
    }

    public Double getTauxResolution() {
        return tauxResolution;
    }

    public void setTauxResolution(Double tauxResolution) {
        this.tauxResolution = tauxResolution;
    }

    // Utility methods
    public double getTauxResolutionSafe() {
        return tauxResolution != null ? tauxResolution : 0.0;
    }

    public String getTauxResolutionFormatted() {
        return String.format("%.1f%%", getTauxResolutionSafe());
    }

    public String getPerformanceLevel() {
        double taux = getTauxResolutionSafe();
        if (taux >= 80) return "Excellent";
        if (taux >= 60) return "Bon";
        if (taux >= 40) return "Moyen";
        return "Faible";
    }

    public String getPerformanceColor() {
        double taux = getTauxResolutionSafe();
        if (taux >= 70) return "success";
        if (taux >= 40) return "warning";
        return "danger";
    }
}