package com.observatoire.gestion_plaintes.stats.serivce;

import com.observatoire.gestion_plaintes.stats.DTOs.CommuneStats;
import com.observatoire.gestion_plaintes.stats.DTOs.CommuneStatsResponse;
import com.observatoire.gestion_plaintes.stats.DTOs.FrequencyStats.FrequencyStats;
import com.observatoire.gestion_plaintes.stats.DTOs.HoraireStats;
import com.observatoire.gestion_plaintes.stats.DTOs.ResolutionRate;
import com.observatoire.gestion_plaintes.stats.DTOs.TrendStats.TrendStats;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface StatistiquesService {


    FrequencyStats getFrequencyStats(LocalDateTime from, LocalDateTime to);

    TrendStats getTrendStats(LocalDateTime startCurrent, LocalDateTime endCurrent);

    List<CommuneStats> getTopCommunes(LocalDate referenceDate);

    List<ResolutionRate> getTauxResolution(LocalDateTime from, LocalDateTime to);
    List<HoraireStats> getVariationHoraire();
    CommuneStatsResponse getCommuneStats(LocalDateTime since);

}
