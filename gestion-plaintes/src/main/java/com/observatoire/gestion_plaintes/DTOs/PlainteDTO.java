package com.observatoire.gestion_plaintes.DTOs;

import com.observatoire.gestion_plaintes.model.Categorie;
import com.observatoire.gestion_plaintes.model.Utilisateur;

import java.time.LocalDateTime;

public class PlainteDTO {
    private String description;
    private double latitude;
    private double longitude;
    private String localisation;
    private String imgUrl;
    private Integer priorite;
    private Categorie categorie;

    public Integer getPriorite() {
        return priorite;
    }

    public String getLocalisation() {
        return localisation;
    }

    public void setLocalisation(String localisation) {
        this.localisation = localisation;
    }

    public void setPriorite(Integer priorite) {
        this.priorite = priorite;
    }

    public double getLongitude() {
        return longitude;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }

    public double getLatitude() {
        return latitude;
    }

    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    public Categorie getCategorie() {
        return categorie;
    }

    public void setCategorie(Categorie categorie) {
        this.categorie = categorie;
    }

    private LocalDateTime dateSoumission;
    private String utilisateurEmail;

    public String getUtilisateurEmail() {
        return utilisateurEmail;
    }

    public void setUtilisateurEmail(String utilisateurEmail) {
        this.utilisateurEmail = utilisateurEmail;
    }

    public LocalDateTime getDateSoumission() {
        return dateSoumission;
    }

    public void setDateSoumission(LocalDateTime dateSoumission) {
        this.dateSoumission = dateSoumission;
    }


    public String getImgUrl() {
        return imgUrl;
    }

    public void setImgUrl(String imgUrl) {
        this.imgUrl = imgUrl;
    }




    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }


}
