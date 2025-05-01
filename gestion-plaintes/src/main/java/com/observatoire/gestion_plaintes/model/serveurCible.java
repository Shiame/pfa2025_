package com.observatoire.gestion_plaintes.model;

import jakarta.persistence.*;

import java.util.List;

@Entity
public class serveurCible {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nom;
    private String adresse;

    @OneToMany(mappedBy = "serveur")
    private List<Plainte> plaintes;

    public serveurCible(Long id, String adresse, String nom) {
        this.id = id;
        this.adresse = adresse;
        this.nom = nom;
    }
    public serveurCible() {}

    public String getAdresse() {
        return adresse;
    }

    public void setAdresse(String adresse) {
        this.adresse = adresse;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }
}
