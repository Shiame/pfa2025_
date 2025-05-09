package com.observatoire.gestion_plaintes.stats.serivce;


import com.observatoire.gestion_plaintes.repository.PlainteRepository;
import com.observatoire.gestion_plaintes.stats.DTOs.CommuneStats;
import com.observatoire.gestion_plaintes.stats.DTOs.CommuneStatsResponse;
import com.observatoire.gestion_plaintes.stats.DTOs.FrequencyStats.FrequencyStats;
import com.observatoire.gestion_plaintes.stats.DTOs.FrequencyStats.ZoneCategoryCount;
import com.observatoire.gestion_plaintes.stats.DTOs.HoraireStats;
import com.observatoire.gestion_plaintes.stats.DTOs.ResolutionRate;
import com.observatoire.gestion_plaintes.stats.DTOs.TrendStats.TrendStats;
import com.observatoire.gestion_plaintes.stats.DTOs.TrendStats.ZoneCategoryTrend;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class StatistiquesServiceImpl implements StatistiquesService {

    private final PlainteRepository plainteRepository;
    private static final double MAX_PERCENTAGE_CHANGE = 200.0;

    public StatistiquesServiceImpl(PlainteRepository plainteRepository) {
        this.plainteRepository = plainteRepository;
    }

    @Override
    public FrequencyStats getFrequencyStats(LocalDateTime from, LocalDateTime to) {
        List<Object[]> raw = plainteRepository.countByZoneAndCategorie(from, to);
        List<ZoneCategoryCount> counts = raw.stream()
                .map(r -> new ZoneCategoryCount(
                        (String) r[0],
                        (String) r[1],
                        ((Number) r[2]).longValue()))
                .sorted(Comparator
                        .comparing(ZoneCategoryCount::getZone, Comparator.nullsFirst(String::compareTo))
                        .thenComparing(ZoneCategoryCount::getCategory))
                .collect(Collectors.toList());
        FrequencyStats stats = new FrequencyStats();
        stats.setCounts(counts);
        return stats;

    }

    @Override
    public TrendStats getTrendStats(LocalDateTime startCurrent, LocalDateTime endCurrent) {
        // 1) Determine window length (inclusive days)
        long days = ChronoUnit.DAYS.between(
                startCurrent.toLocalDate(), endCurrent.toLocalDate()) + 1;

        // 2) Build previous window [startPrev, endPrev]
        LocalDateTime endPrev = startCurrent.minusSeconds(1);
        LocalDateTime startPrev = startCurrent.minusDays(days);

        // 3) Fetch raw counts
        List<Object[]> rawCurrent = plainteRepository.countByZoneAndCategorie(startCurrent, endCurrent);
        List<Object[]> rawPrev = plainteRepository.countByZoneAndCategorie(startPrev, endPrev);

        // 4) Normalize null→"Inconnu", cast counts to long
        Function<Object[], Object[]> normalize = r -> new Object[] {
                r[0] == null ? "Inconnu" : r[0],
                r[1] == null ? "Inconnu" : r[1],
                ((Number) r[2]).longValue()
        };

        Map<String, Map<String, Long>> mapCurrent = rawCurrent.stream()
                .map(normalize)
                .collect(Collectors.groupingBy(
                        r -> (String) r[0],
                        Collectors.toMap(
                                r -> (String) r[1],
                                r -> (Long) r[2],
                                Long::sum
                        )
                ));

        Map<String, Map<String, Long>> mapPrev = rawPrev.stream()
                .map(normalize)
                .collect(Collectors.groupingBy(
                        r -> (String) r[0],
                        Collectors.toMap(
                                r -> (String) r[1],
                                r -> (Long) r[2],
                                Long::sum
                        )
                ));

        // 5) Compute percentage changes
        List<ZoneCategoryTrend> trends = new ArrayList<>();
        Set<String> allZones = new HashSet<>();
        allZones.addAll(mapCurrent.keySet());
        allZones.addAll(mapPrev.keySet());

        for (String zone : allZones) {
            Map<String, Long> currCounts = mapCurrent.getOrDefault(zone, Collections.emptyMap());
            Map<String, Long> prevCounts = mapPrev.getOrDefault(zone, Collections.emptyMap());

            Set<String> allCats = new HashSet<>();
            allCats.addAll(currCounts.keySet());
            allCats.addAll(prevCounts.keySet());

            for (String cat : allCats) {
                long cN = currCounts.getOrDefault(cat, 0L);
                long cPrev = prevCounts.getOrDefault(cat, 0L);

                // Skip if both are zero
                if (cN == 0 && cPrev == 0) continue;

                double pct;
                if (cPrev == 0) {
                    // Handle new categories that didn't exist in previous period
                    // Instead of infinity, use a reasonable value like 100%
                    pct = cN > 0 ? 100.0 : 0.0;
                } else {
                    pct = ((cN - cPrev) * 100.0) / cPrev;

                    // Cap extreme values
                    if (pct > MAX_PERCENTAGE_CHANGE) {
                        pct = MAX_PERCENTAGE_CHANGE;
                    } else if (pct < -MAX_PERCENTAGE_CHANGE) {
                        pct = -MAX_PERCENTAGE_CHANGE;
                    }
                }

                // Round to 1 decimal place
                pct = Math.round(pct * 10.0) / 10.0;

                trends.add(new ZoneCategoryTrend(zone, cat, pct));
            }
        }

        trends.sort(Comparator
                .comparing(ZoneCategoryTrend::getZone)
                .thenComparing(ZoneCategoryTrend::getCategory));

        TrendStats stats = new TrendStats();
        stats.setTrends(trends);
        return stats;
    }

    public List<CommuneStats> getTopCommunes(LocalDate referenceDate) {
        LocalDateTime end = referenceDate.atTime(23, 59, 59);
        LocalDateTime start = referenceDate.minusDays(6).atStartOfDay();

        return plainteRepository.findTopCommunes(start, end).stream()
                .map(arr -> new CommuneStats(
                        (String) arr[0],
                        ((Number) arr[1]).longValue()
                ))
                .collect(Collectors.toList());
    }

    @Override
    public CommuneStatsResponse getCommuneStats(LocalDateTime since) {
        List<Object[]> raw = plainteRepository.countByZoneWithCoords(since);
        List<CommuneStats> list = raw.stream()
                .map(r -> new CommuneStats(
                        (String)  r[0],                 // zone
                        ((Number) r[3]).longValue(),    // count
                        ((Number) r[1]).doubleValue(),  // latitude
                        ((Number) r[2]).doubleValue())) // longitude
                .collect(Collectors.toList());

        CommuneStatsResponse resp = new CommuneStatsResponse();
        resp.setCommunes(list);
        return resp;
    }

    public List<ResolutionRate> getTauxResolution(LocalDateTime from, LocalDateTime to) {
        return plainteRepository.calculateTauxResolution(from, to).stream()
                .map(arr -> new ResolutionRate(
                        (String)  arr[0],          // commune
                        (String)  arr[1],          // catégorie
                        (Double)  arr[4],          // taux %
                        ((Number) arr[2]).longValue(), // total
                        ((Number) arr[3]).longValue()  // résolues
                ))
                .toList();
    }


    public List<HoraireStats> getVariationHoraire() {
        Map<Integer, Long> rawCounts = plainteRepository.countByHeure().stream()
                .collect(Collectors.toMap(
                        arr -> ((Number) arr[0]).intValue(),
                        arr -> ((Number) arr[1]).longValue()
                ));

        Map<String, Long> result = new LinkedHashMap<>();
        for (int h = 0; h < 24; h += 2) {
            String tranche = String.format("%02dh-%02dh", h, h+2);
            long count = rawCounts.getOrDefault(h, 0L) + rawCounts.getOrDefault(h+1, 0L);
            result.put(tranche, count);
        }

        return result.entrySet().stream()
                .map(e -> new HoraireStats(e.getKey(), e.getValue()))
                .collect(Collectors.toList());
    }




}
