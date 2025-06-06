package com.observatoire.gestion_plaintes.DTOs.Response;

import java.util.Map;

public class ClassificationResponse {
    private String categorie;
    private Map<String, Double> scores;
    private Integer priorite;
    private String niveauUrgence;
    private Map<String, Object> detailsCalcul;

    public String getCategorie() {
        return categorie;
    }

    public void setCategorie(String categorie) {
        this.categorie = categorie;
    }

    public Map<String, Double> getScores() {
        return scores;
    }

    public void setScores(Map<String, Double> scores) {
        this.scores = scores;
    }

    public Integer getPriorite() {
        return priorite;
    }

    public void setPriorite(Integer priorite) {
        this.priorite = priorite;
    }

    public String getNiveauUrgence() {
        return niveauUrgence;
    }

    public void setNiveauUrgence(String niveauUrgence) {
        this.niveauUrgence = niveauUrgence;
    }

    public Map<String, Object> getDetailsCalcul() {
        return detailsCalcul;
    }

    public void setDetailsCalcul(Map<String, Object> detailsCalcul) {
        this.detailsCalcul = detailsCalcul;
    }
}