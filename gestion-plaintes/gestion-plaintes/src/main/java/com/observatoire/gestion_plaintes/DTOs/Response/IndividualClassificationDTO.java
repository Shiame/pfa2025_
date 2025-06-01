package com.observatoire.gestion_plaintes.DTOs.Response;

import com.fasterxml.jackson.annotation.JsonProperty;

public class IndividualClassificationDTO {
    @JsonProperty("complaint_id")
    private Long complaintId;

    private String categorie;
    private int priorite;

    @JsonProperty("niveau_urgence")
    private String niveauUrgence;

    @JsonProperty("confidence_score")
    private Double confidenceScore;

    public IndividualClassificationDTO() {}

    public IndividualClassificationDTO(Long complaintId, String categorie, int priorite, String niveauUrgence) {
        this.complaintId = complaintId;
        this.categorie = categorie;
        this.priorite = priorite;
        this.niveauUrgence = niveauUrgence;
    }

    // Getters and Setters
    public Long getComplaintId() {
        return complaintId;
    }

    public void setComplaintId(Long complaintId) {
        this.complaintId = complaintId;
    }

    public String getCategorie() {
        return categorie;
    }

    public void setCategorie(String categorie) {
        this.categorie = categorie;
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

    public Double getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(Double confidenceScore) {
        this.confidenceScore = confidenceScore;
    }
}