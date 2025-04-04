package com.example.projet_PF2A.Model;

import jakarta.persistence.*;
import lombok.Getter;
import org.hibernate.boot.registry.selector.spi.StrategyCreator;

import java.time.LocalDateTime;


@Entity
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;

    private String message;

    private LocalDateTime date;

    private boolean lue;

    @ManyToOne
    private Citoyen citoyen;

    @ManyToOne
    private Administrateur administrateur;

    @ManyToOne
    private Plainte plainte;
}
