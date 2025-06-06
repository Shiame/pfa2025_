package com.observatoire.gestion_plaintes.stats;

import com.observatoire.gestion_plaintes.model.StatutPlainte;
import com.observatoire.gestion_plaintes.repository.PlainteRepository;
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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;


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

    private final PlainteRepository plainteRepository;
    private static final Logger logger = LoggerFactory.getLogger(StatistiquesController.class);



    public StatistiquesController(StatistiquesService statistiquesService, PlainteRepository plainteRepository) {
        this.statistiquesService = statistiquesService;
        this.plainteRepository = plainteRepository;
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
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {

        try {
            // Si aucune date fournie, utiliser une plage très large pour inclure TOUTES les plaintes
            if (from == null && to == null) {
                from = LocalDateTime.of(2020, 1, 1, 0, 0); // Très ancien
                to = LocalDateTime.of(2030, 12, 31, 23, 59); // Très futur
                logger.info("No dates provided, using extended range: {} to {}", from, to);
            } else if (from == null) {
                from = LocalDateTime.of(2020, 1, 1, 0, 0);
                logger.info("No start date, using extended start: {}", from);
            } else if (to == null) {
                to = LocalDateTime.of(2030, 12, 31, 23, 59);
                logger.info("No end date, using extended end: {}", to);
            }

            logger.info("Resolution rates requested with from={}, to={}", from, to);

            List<ResolutionRate> rates = statistiquesService.getTauxResolution(from, to);

            logger.info("Returning {} resolution rate records", rates.size());

            // Log some debug info
            if (!rates.isEmpty()) {
                long totalPlaintes = rates.stream().mapToLong(ResolutionRate::getTotalPlaintes).sum();
                long totalResolues = rates.stream().mapToLong(ResolutionRate::getResoluePlaintes).sum();
                logger.info("Total plaintes in resolution data: {}, total resolved: {}", totalPlaintes, totalResolues);
            }

            return ResponseEntity.ok(rates);

        } catch (Exception e) {
            logger.error("Error fetching resolution rates: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Collections.emptyList());
        }
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

    @GetMapping("/global-stats")
    public ResponseEntity<Map<String, Object>> getGlobalStats() {
        try {
            logger.info("Calculating global stats (all time, no date filter)");

            // 1. Compte total des plaintes (TOUTES, sans exception)
            Long totalComplaints = plainteRepository.count();
            logger.info("Total complaints found: {}", totalComplaints);

            // 2. Compte des plaintes résolues (TOUTES, sans filtre de date)
            Long resolvedComplaints = plainteRepository.countByStatut(StatutPlainte.RESOLUE);
            logger.info("Resolved complaints found: {}", resolvedComplaints);

            // 3. Calcul du taux global
            double globalRate = totalComplaints > 0
                    ? (resolvedComplaints * 100.0) / totalComplaints
                    : 0.0;

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalComplaints", totalComplaints);
            stats.put("totalResolved", resolvedComplaints);
            stats.put("globalResolutionRate", Math.round(globalRate * 10.0) / 10.0);
            stats.put("source", "direct_count_all_time");
            stats.put("calculated_at", LocalDateTime.now());

            // Debug info
            stats.put("debug_info", Map.of(
                    "total_method", "plainteRepository.count()",
                    "resolved_method", "plainteRepository.countByStatut(RESOLUE)",
                    "calculation", String.format("%d resolved / %d total * 100", resolvedComplaints, totalComplaints)
            ));

            logger.info("Global stats calculated: {} total, {} resolved, {}% rate",
                    totalComplaints, resolvedComplaints, Math.round(globalRate * 10.0) / 10.0);

            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            logger.error("Error calculating global stats: {}", e.getMessage(), e);

            Map<String, Object> error = new HashMap<>();
            error.put("error", "Erreur calcul stats globales: " + e.getMessage());
            error.put("totalComplaints", 0L);
            error.put("totalResolved", 0L);
            error.put("globalResolutionRate", 0.0);
            error.put("source", "error_fallback");

            return ResponseEntity.status(500).body(error);
        }
    }
}
