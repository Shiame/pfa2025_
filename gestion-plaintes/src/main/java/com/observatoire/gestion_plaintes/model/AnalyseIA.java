package com.observatoire.gestion_plaintes.model;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.Map;

@Entity
public class AnalyseIA {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String résumé;
    private String catégoriePrévue;
    private String niveauUrgence;
    private Integer priorite;

    @ElementCollection
    @CollectionTable(name = "analyse_ia_nlp_scores",
            joinColumns = @JoinColumn(name = "analyse_ia_id"))
    @MapKeyColumn(name = "score_key")
    @Column(name = "score_value")
    private Map<String, Double> NLPScore;

    // NEW: Store the complete raw response from NLP service
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> fullResponse;

    // Constructors
    public AnalyseIA() {
    }

    public AnalyseIA(Long id, String résumé, String catégoriePrévue, String niveauUrgence, Map<String, Double> NLPScore) {
        this.id = id;
        this.résumé = résumé;
        this.catégoriePrévue = catégoriePrévue;
        this.niveauUrgence = niveauUrgence;
        this.NLPScore = NLPScore;
    }

    // Getters and Setters
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

    // NEW: Alias methods for controller compatibility
    public void setCategoriePrev(String catégoriePrévue) {
        this.catégoriePrévue = catégoriePrévue;
    }

    public String getCategoriePrev() {
        return this.catégoriePrévue;
    }

    public String getNiveauUrgence() {
        return niveauUrgence;
    }

    public void setNiveauUrgence(String niveauUrgence) {
        this.niveauUrgence = niveauUrgence;
    }

    public Integer getPriorite() {
        return priorite;
    }

    public void setPriorite(Integer priorite) {
        this.priorite = priorite;
    }

    public Map<String, Double> getNLPScore() {
        return NLPScore;
    }

    public void setNLPScore(Map<String, Double> NLPScore) {
        this.NLPScore = NLPScore;
    }

    // NEW: Full response storage
    public Map<String, Object> getFullResponse() {
        return fullResponse;
    }

    public void setFullResponse(Map<String, Object> fullResponse) {
        this.fullResponse = fullResponse;
    }

    // Convenience getters for common fields from fullResponse
    public Map<String, Double> getScores() {
        if (fullResponse != null && fullResponse.containsKey("scores")) {
            return (Map<String, Double>) fullResponse.get("scores");
        }
        return NLPScore;
    }

    public Map<String, Object> getDetailsCalcul() {
        if (fullResponse != null && fullResponse.containsKey("details_calcul")) {
            return (Map<String, Object>) fullResponse.get("details_calcul");
        }
        return null;
    }
}