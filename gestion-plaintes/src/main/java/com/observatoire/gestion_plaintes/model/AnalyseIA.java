package com.observatoire.gestion_plaintes.model;

import jakarta.persistence.*;

import java.util.Map;

@Entity
public class AnalyseIA {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String résumé;
    private String catégoriePrévue;
    private String niveauUrgence;
    @ElementCollection
    @CollectionTable(name = "analyse_ia_nlp_scores",
            joinColumns = @JoinColumn(name = "analyse_ia_id"))
    @MapKeyColumn(name = "score_key")
    @Column(name = "score_value")
    private Map<String, Double> NLPScore;


    public AnalyseIA(Long id,
                     String résumé,
                     String catégoriePrévue,
                     String niveauUrgence,
                     Map<String,Double> NLPScore) {
        this.id            = id;
        this.résumé        = résumé;
        this.catégoriePrévue = catégoriePrévue;
        this.niveauUrgence   = niveauUrgence;
        this.NLPScore        = NLPScore;
    }

    public Map<String,Double> getNLPScore() {
        return NLPScore;
    }
    public void setNLPScore(Map<String,Double> NLPScore) {
        this.NLPScore = NLPScore;
    }


    public AnalyseIA() {
    }

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


    public String getNiveauUrgence() {
        return niveauUrgence;
    }

    public void setNiveauUrgence(String niveauUrgence) {
        this.niveauUrgence = niveauUrgence;
    }
}
