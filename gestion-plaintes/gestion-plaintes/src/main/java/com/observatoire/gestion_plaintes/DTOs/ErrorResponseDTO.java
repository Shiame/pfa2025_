package com.observatoire.gestion_plaintes.DTOs;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;

public class ErrorResponseDTO {
    private String status;
    private String message;
    private String error;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;

    @JsonProperty("error_code")
    private String errorCode;

    @JsonProperty("suggested_action")
    private String suggestedAction;

    public ErrorResponseDTO() {
        this.timestamp = LocalDateTime.now();
        this.status = "error";
    }

    public ErrorResponseDTO(String message, String error) {
        this();
        this.message = message;
        this.error = error;
    }

    public ErrorResponseDTO(String message, String error, String errorCode, String suggestedAction) {
        this(message, error);
        this.errorCode = errorCode;
        this.suggestedAction = suggestedAction;
    }

    // Getters and Setters
    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public void setErrorCode(String errorCode) {
        this.errorCode = errorCode;
    }

    public String getSuggestedAction() {
        return suggestedAction;
    }

    public void setSuggestedAction(String suggestedAction) {
        this.suggestedAction = suggestedAction;
    }
}