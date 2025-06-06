package com.observatoire.gestion_plaintes.DTOs.Response;

import com.fasterxml.jackson.annotation.JsonProperty;

public class NLPHealthResponseDTO {
    private String status;

    @JsonProperty("nlp_service")
    private String nlpService;

    @JsonProperty("test_summaries_count")
    private int testSummariesCount;

    private String timestamp;
    private String error;

    public NLPHealthResponseDTO() {}

    // Getters and Setters
    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNlpService() {
        return nlpService;
    }

    public void setNlpService(String nlpService) {
        this.nlpService = nlpService;
    }

    public int getTestSummariesCount() {
        return testSummariesCount;
    }

    public void setTestSummariesCount(int testSummariesCount) {
        this.testSummariesCount = testSummariesCount;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }
}