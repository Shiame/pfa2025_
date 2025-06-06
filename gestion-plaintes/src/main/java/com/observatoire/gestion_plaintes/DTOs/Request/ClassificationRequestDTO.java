package com.observatoire.gestion_plaintes.DTOs.Request;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;

public class ClassificationRequestDTO {
    private String description;
    private String localisation;

    @JsonProperty("date_incident")
    private LocalDateTime dateIncident;

    public ClassificationRequestDTO() {}

    public ClassificationRequestDTO(String description, String localisation, LocalDateTime dateIncident) {
        this.description = description;
        this.localisation = localisation;
        this.dateIncident = dateIncident;
    }

    // Getters and Setters
    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLocalisation() {
        return localisation;
    }

    public void setLocalisation(String localisation) {
        this.localisation = localisation;
    }

    public LocalDateTime getDateIncident() {
        return dateIncident;
    }

    public void setDateIncident(LocalDateTime dateIncident) {
        this.dateIncident = dateIncident;
    }
}
