package com.observatoire.gestion_plaintes.stats.DTOs;

public class HoraireStats {
    private String trancheHoraire;
    private Long totalPlaintes;

    public HoraireStats(String trancheHoraire, Long totalPlaintes) {
        this.trancheHoraire = trancheHoraire;
        this.totalPlaintes = totalPlaintes;
    }

    public String getTrancheHoraire() {
        return trancheHoraire;
    }

    public void setTrancheHoraire(String trancheHoraire) {
        this.trancheHoraire = trancheHoraire;
    }

    public Long getTotalPlaintes() {
        return totalPlaintes;
    }

    public void setTotalPlaintes(Long totalPlaintes) {
        this.totalPlaintes = totalPlaintes;
    }
}
