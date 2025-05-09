package com.observatoire.gestion_plaintes.stats.DTOs;

public class ResolutionRate {
    private String commune;
    private String categorie;
    private Double taux = 0.0;
    private long totalPlaintes;      // NEW
    private long resoluePlaintes;// Initialisation par défaut

    public ResolutionRate(String commune, String categorie, Double taux, long totalPlaintes, long resoluePlaintes) {
        this.commune = commune;
        this.categorie = categorie;
        this.taux = taux;
        this.totalPlaintes = totalPlaintes;
        this.resoluePlaintes = resoluePlaintes;
    }

    public long getTotalPlaintes() {
        return totalPlaintes;
    }

    public void setTotalPlaintes(long totalPlaintes) {
        this.totalPlaintes = totalPlaintes;
    }

    public long getResoluePlaintes() {
        return resoluePlaintes;
    }

    public void setResoluePlaintes(long resoluePlaintes) {
        this.resoluePlaintes = resoluePlaintes;
    }

    public Double getTaux() {
        return taux;
    }

    public void setTaux(Double taux) {
        this.taux = taux;
    }

    // Constructeur
    public ResolutionRate(String commune, String categorie, Double taux) {
        this.commune = commune;
        this.categorie = categorie;
        this.taux = taux != null ? taux : 0.0;
    }


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

    public double getTauxResolution() {
        return taux;
    }

    public void setTauxResolution(double tauxResolution) {
        this.taux = tauxResolution;
    }


}
