package com.observatoire.gestion_plaintes.DTOs;

public class PlainteDTO {
    private String description;
    private Double latitude;
    private Double longitude;
    private String imgUrl;
    private String localisation;
    private String utilisateurEmail;

    // New: Category information from frontend
    private CategorieDTO categorie;

    // Constructors
    public PlainteDTO() {}

    public PlainteDTO(String description, Double latitude, Double longitude,
                      String imgUrl, String localisation, String utilisateurEmail) {
        this.description = description;
        this.latitude = latitude;
        this.longitude = longitude;
        this.imgUrl = imgUrl;
        this.localisation = localisation;
        this.utilisateurEmail = utilisateurEmail;
    }

    // Getters and Setters
    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getImgUrl() {
        return imgUrl;
    }

    public void setImgUrl(String imgUrl) {
        this.imgUrl = imgUrl;
    }

    public String getLocalisation() {
        return localisation;
    }

    public void setLocalisation(String localisation) {
        this.localisation = localisation;
    }

    public String getUtilisateurEmail() {
        return utilisateurEmail;
    }

    public void setUtilisateurEmail(String utilisateurEmail) {
        this.utilisateurEmail = utilisateurEmail;
    }

    public CategorieDTO getCategorie() {
        return categorie;
    }

    public void setCategorie(CategorieDTO categorie) {
        this.categorie = categorie;
    }

    // Inner class for category data
    public static class CategorieDTO {
        private String id;      // String ID from frontend (dechets, agression, etc.)
        private String nom;     // Display name
        private String source;  // "manual" or "ai"

        public CategorieDTO() {}

        public CategorieDTO(String id, String nom, String source) {
            this.id = id;
            this.nom = nom;
            this.source = source;
        }

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getNom() {
            return nom;
        }

        public void setNom(String nom) {
            this.nom = nom;
        }

        public String getSource() {
            return source;
        }

        public void setSource(String source) {
            this.source = source;
        }
    }
}