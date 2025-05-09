package com.observatoire.gestion_plaintes.stats;

import com.observatoire.gestion_plaintes.stats.DTOs.CommuneStats;
import com.observatoire.gestion_plaintes.stats.DTOs.CommuneStatsResponse;
import com.observatoire.gestion_plaintes.stats.DTOs.FrequencyStats.FrequencyStats;
import com.observatoire.gestion_plaintes.stats.DTOs.HoraireStats;
import com.observatoire.gestion_plaintes.stats.DTOs.ResolutionRate;
import com.observatoire.gestion_plaintes.stats.DTOs.TrendStats.TrendStats;
import com.observatoire.gestion_plaintes.stats.DTOs.FrequencyStats.ZoneCategoryCount;

import com.observatoire.gestion_plaintes.stats.serivce.StatistiquesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/stats")
@CrossOrigin(origins = "http://localhost:5173")
public class StatistiquesController {
    private final StatistiquesService statistiquesService;

    public StatistiquesController(StatistiquesService statistiquesService) {
        this.statistiquesService = statistiquesService;
    }

    @GetMapping("/frequency")
    public ResponseEntity<FrequencyStats> getFrequencyStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {

        // Default values if not provided
        LocalDateTime fromDate = from != null ? from : LocalDateTime.now().minusDays(30);
        LocalDateTime toDate = to != null ? to : LocalDateTime.now();

        FrequencyStats stats = statistiquesService.getFrequencyStats(fromDate, toDate);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/trends")
    public ResponseEntity<TrendStats> getTrendStats(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime from,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime to) {

        // Default to last 7 days if not provided
        LocalDateTime endDate = to != null ? to : LocalDateTime.now();
        LocalDateTime startDate = from != null ? from : endDate.minusDays(7);

        TrendStats stats = statistiquesService.getTrendStats(startDate, endDate);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/TopCommunes")
    public ResponseEntity<List<CommuneStats>> getTopCommunes(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate referenceDate) {

        // Default to today if not provided
        LocalDate date = referenceDate != null ? referenceDate : LocalDate.now();

        List<CommuneStats> stats = statistiquesService.getTopCommunes(date);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/communes")
    public ResponseEntity<CommuneStatsResponse> getCommuneStats(
            @RequestParam(value = "since", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime since) {

        LocalDateTime ref = since != null ? since : LocalDateTime.now().minusDays(30);
        return ResponseEntity.ok(statistiquesService.getCommuneStats(ref));
    }

    @GetMapping("/resolution")
    public ResponseEntity<List<ResolutionRate>> getResolutionRates(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return ResponseEntity.ok(statistiquesService.getTauxResolution(from, to));
    }


    @GetMapping("/horaire")
    public ResponseEntity<List<HoraireStats>> getHoraireStats() {
        List<HoraireStats> stats = statistiquesService.getVariationHoraire();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate referenceDate) {

        LocalDate date = referenceDate != null ? referenceDate : LocalDate.now();
        LocalDateTime end = date.atTime(23, 59, 59);
        LocalDateTime start = date.minusDays(30).atStartOfDay();

        // Current period
        FrequencyStats freqCurrent = statistiquesService.getFrequencyStats(start, end);

        // Previous period
        LocalDateTime prevEnd = date.minusDays(31).atTime(23, 59, 59);
        LocalDateTime prevStart = date.minusDays(60).atStartOfDay();
        FrequencyStats freqPrev = statistiquesService.getFrequencyStats(prevStart, prevEnd);

        long previousTotal = freqPrev.getCounts()
                .stream()
                .mapToLong(ZoneCategoryCount::getCount)
                .sum();

        // For trends, use the current period dates
        LocalDateTime trendEnd = end;
        LocalDateTime trendStart = date.minusDays(7).atStartOfDay();

        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("frequency", freqCurrent);
        dashboard.put("previousTotal", previousTotal);
        dashboard.put("trends", statistiquesService.getTrendStats(trendStart, trendEnd));
        dashboard.put("communes", statistiquesService.getTopCommunes(date));
        dashboard.put("resolution", statistiquesService.getTauxResolution(start, end));
        dashboard.put("horaire", statistiquesService.getVariationHoraire());

        return ResponseEntity.ok(dashboard);
    }
}
