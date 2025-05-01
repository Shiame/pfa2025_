package com.observatoire.gestion_plaintes.model;

import jakarta.persistence.*;

@Entity
public class AnalyseIA {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String résumé;
    private String catégoriePrévue;
    private String catégorie;

    public AnalyseIA(Long id, String résumé, String catégoriePrévue, String catégorie) {
        this.id = id;
        this.résumé = résumé;
        this.catégoriePrévue = catégoriePrévue;
        this.catégorie = catégorie;
    }
    public AnalyseIA(){}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRésumé() {
        return résumé;
    }

    public void setRésumé(String résumé) {
        this.résumé = résumé;
    }

    public String getCatégoriePrévue() {
        return catégoriePrévue;
    }

    public void setCatégoriePrévue(String catégoriePrévue) {
        this.catégoriePrévue = catégoriePrévue;
    }

    public String getCatégorie() {
        return catégorie;
    }

    public void setCatégorie(String catégorie) {
        this.catégorie = catégorie;
    }
}
