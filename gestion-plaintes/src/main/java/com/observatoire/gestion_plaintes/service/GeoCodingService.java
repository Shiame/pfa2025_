package com.observatoire.gestion_plaintes.service;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class GeoCodingService {

    private RestTemplate rest;
    private static final List<String> ZONE_KEYS = List.of(
            "suburb",
            "city_district",
            "town",
            "village",
            "county",
            "city",
            "state_district",
            "region"
    );

    @Value("${geocoding.nominatim.url}")
    private String nominatimUrl;

    @Value("${geocoding.nominatim.email}")
    private String email;

    @PostConstruct
    public void init() {
        SimpleClientHttpRequestFactory f = new SimpleClientHttpRequestFactory();
        f.setConnectTimeout(2000);
        f.setReadTimeout(5000);
        this.rest = new RestTemplate(f);
    }

    public String fetchZone(double lat, double lon) {
        if (!isValidCoordinate(lat, lon)) {
            System.err.println("Invalid coordinates: lat=" + lat + ", lon=" + lon);
            return "Inconnu";
        }

        String url = String.format(
                Locale.US,  // Force decimal formatting with periods
                "%s?lat=%.6f&lon=%.6f&format=json&addressdetails=1&email=%s",
                nominatimUrl, lat, lon, email
        );

        HttpHeaders headers = new HttpHeaders();
        headers.set("User-Agent", "ObservatoirePlaintes/1.0 (" + email + ")");
        headers.set("Accept-Language", "fr");
        headers.set("From", email);

        System.out.println("[DEBUG] Geocoding request URL: " + url);

        try {
            ResponseEntity<Object> response = rest.exchange(
                    url,
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    Object.class
            );

            return processNominatimResponse(response.getBody());

        } catch (Exception ex) {
            System.err.println("Geocoding error: " + ex.getMessage());
            ex.printStackTrace();
            return "Inconnu";
        }
    }

    private String processNominatimResponse(Object responseBody) {
        if (responseBody == null) {
            System.err.println("Empty Nominatim response");
            return "Inconnu";
        }

        // Handle array responses
        Map<String, Object> responseMap;
        if (responseBody instanceof List) {
            List<?> responseList = (List<?>) responseBody;
            if (responseList.isEmpty()) {
                return "Inconnu";
            }
            responseMap = (Map<String, Object>) responseList.get(0);
        } else {
            responseMap = (Map<String, Object>) responseBody;
        }

        System.out.println("[DEBUG] Nominatim response: " + responseMap);

        // Try to extract address components
        Map<String, Object> address = (Map<String, Object>) responseMap.get("address");
        if (address != null) {
            for (String key : ZONE_KEYS) {
                if (address.containsKey(key)) {
                    String zone = address.get(key).toString();
                    System.out.println("Found zone in '" + key + "': " + zone);
                    return zone;
                }
            }
        }

        // Fallback 1: Parse display_name
        if (responseMap.containsKey("display_name")) {
            String displayName = responseMap.get("display_name").toString();
            String[] parts = displayName.split(",\\s*");
            if (parts.length >= 3) {
                System.out.println("Fallback to display_name: " + parts[2]);
                return parts[2];
            }
        }

        // Fallback 2: Country
        if (address != null && address.containsKey("country")) {
            return address.get("country").toString();
        }

        return "Inconnu";
    }

    private boolean isValidCoordinate(double lat, double lon) {
        return !Double.isNaN(lat) && !Double.isNaN(lon)
                && lat >= -90 && lat <= 90
                && lon >= -180 && lon <= 180
                && !Double.isInfinite(lat)
                && !Double.isInfinite(lon);
    }
}