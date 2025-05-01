package com.observatoire.gestion_plaintes.controller;


import com.observatoire.gestion_plaintes.DTOs.Request.LoginRequest;
import com.observatoire.gestion_plaintes.DTOs.Request.RegisterRequest;
import com.observatoire.gestion_plaintes.DTOs.Response.JwtResponse;
import com.observatoire.gestion_plaintes.model.Utilisateur;
import com.observatoire.gestion_plaintes.service.AuthService;
import com.observatoire.gestion_plaintes.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/auth")
@RestController
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService auth) {
        this.authService = auth;
    }

    @PostMapping("/register")
    public ResponseEntity<JwtResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
