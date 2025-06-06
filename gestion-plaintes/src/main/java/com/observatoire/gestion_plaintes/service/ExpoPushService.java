package com.observatoire.gestion_plaintes.service;

import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.ObjectMapper; // <-- à ajouter

import java.util.HashMap;
import java.util.Map;

@Service
public class ExpoPushService {

    public void sendPushMessage(String expoToken, String title, String body) {
        if (expoToken == null || expoToken.isEmpty()) return; // Ne rien faire si pas de token

        String expoUrl = "https://exp.host/--/api/v2/push/send";
        RestTemplate restTemplate = new RestTemplate();

        Map<String, Object> message = new HashMap<>();
        message.put("to", expoToken);
        message.put("title", title);
        message.put("body", body);
        message.put("sound", "default");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        try {
            ObjectMapper objectMapper = new ObjectMapper(); // <-- Jackson
            String jsonMessage = objectMapper.writeValueAsString(message);

            HttpEntity<String> entity = new HttpEntity<>(jsonMessage, headers);

            restTemplate.postForEntity(expoUrl, entity, String.class);
        } catch (Exception e) {
            System.out.println("Expo push error: " + e.getMessage());
        }
    }
}
