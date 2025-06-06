package com.observatoire.gestion_plaintes.service;

import com.observatoire.gestion_plaintes.DTOs.Request.LoginRequest;
import com.observatoire.gestion_plaintes.DTOs.Request.RegisterRequest;
import com.observatoire.gestion_plaintes.DTOs.Response.JwtResponse;
import com.observatoire.gestion_plaintes.model.Utilisateur;
import com.observatoire.gestion_plaintes.repository.UtilisateurRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authManager;
    public AuthService(
            UtilisateurRepository utilisateurRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager
    ){
        this.utilisateurRepository = utilisateurRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authManager = authenticationManager;
    }

    public JwtResponse register(RegisterRequest request){
        Utilisateur user = new Utilisateur();
        user.setCin(request.getCin());
        user.setNom(request.getNom());
        user.setPrenom(request.getPrenom());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());

        utilisateurRepository.save(user);

        String token = jwtService.generateToken(user);
        return new JwtResponse(token);
    }

    public JwtResponse login(LoginRequest request){
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        Utilisateur user = utilisateurRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        String token = jwtService.generateToken(user);
        System.out.println("Tentative de login avec : " + request.getEmail() + " / " + request.getPassword());
        return new JwtResponse(token, user.getId()); // <-- passe aussi l'id
    }


}
