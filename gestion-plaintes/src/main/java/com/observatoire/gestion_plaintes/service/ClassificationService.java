package com.observatoire.gestion_plaintes.service;

import com.observatoire.gestion_plaintes.DTOs.Response.ClassificationResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class ClassificationService {

    @Value("${fastapi.base.url}")
    private String fastApiBaseUrl;

    private final RestTemplate rest;


    public ClassificationService(@Qualifier("RestTemplate") RestTemplate restTemplate) {
        this.rest = restTemplate;
    }

    public ClassificationResponse classifyAndPrioritize(String description, String localisation) {
        String url = fastApiBaseUrl + "/classify";

        Map<String, Object> body = Map.of(
                "description", description,
                "localisation", localisation);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String,Object>> req = new HttpEntity<>(body, headers);

        ResponseEntity<ClassificationResponse> response =
                rest.exchange(url, HttpMethod.POST, req, ClassificationResponse.class);

        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new IllegalStateException("FastAPI classify failed: " + response.getStatusCode());
        }
        return response.getBody();
    }



}
