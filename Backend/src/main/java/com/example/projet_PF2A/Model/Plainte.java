package com.example.projet_PF2A.Model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
public class Plainte {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;

    private String description;

    private LocalDateTime dateDepot;
    private String statut;
    private String localisation;
    private String imageURL;

    @ManyToOne
    private Citoyen citoyen;

    @ManyToOne
    private Categorie categorie;

    @ManyToOne
    private Administrateur administrateur;

    @OneToMany(mappedBy = "plainte", cascade = CascadeType.ALL)
    private List<Notification> notifications;
}
