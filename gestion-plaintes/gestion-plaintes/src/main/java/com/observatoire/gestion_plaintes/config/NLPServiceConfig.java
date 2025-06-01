package com.observatoire.gestion_plaintes.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

/**
 * Configuration class for NLP service integration
 */
@Configuration
public class NLPServiceConfig {

    @Value("${nlp.service.url:http://localhost:8000}")
    private String nlpServiceUrl;

    @Value("${nlp.service.timeout.connect:5000}")
    private int connectTimeout;

    @Value("${nlp.service.timeout.read:30000}")
    private int readTimeout;

    /**
     * RestTemplate bean configured for NLP service calls
     */
    @Bean
    public RestTemplate restTemplate() {
        RestTemplate restTemplate = new RestTemplate(clientHttpRequestFactory());
        return restTemplate;
    }

    /**
     * HTTP client factory with timeouts configured for NLP calls
     */
    @Bean
    public ClientHttpRequestFactory clientHttpRequestFactory() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(connectTimeout);
        factory.setReadTimeout(readTimeout);
        return factory;
    }

    /**
     * Get NLP service base URL
     */
    public String getNlpServiceUrl() {
        return nlpServiceUrl;
    }
}

