package com.observatoire.gestion_plaintes.DTOs.Request;

public class SaveTokenRequest {
    private Long userId;
    private String expoPushToken;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getExpoPushToken() {
        return expoPushToken;
    }

    public void setExpoPushToken(String expoPushToken) {
        this.expoPushToken = expoPushToken;
    }
}