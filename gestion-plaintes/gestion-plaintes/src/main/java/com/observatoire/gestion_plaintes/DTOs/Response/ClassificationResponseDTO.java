package com.observatoire.gestion_plaintes.DTOs.Response;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Map;

public class ClassificationResponseDTO {
    private String categorie;
    private Map<String,Double> scores;
    private int priorite;

    @JsonProperty("niveau_urgence")
    private String niveauUrgence;

    // Détail du calcul : méthode / raison, etc.
    @JsonProperty("details_calcul")
    private Map<String, Object> detailsCalcul;


    public ClassificationResponseDTO() {}

    // Getters and Setters
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

    public int getPriorite() {
        return priorite;
    }

    public void setPriorite(int priorite) {
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
