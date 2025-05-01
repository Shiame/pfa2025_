package com.observatoire.gestion_plaintes.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String message;
    private LocalDateTime dateTime;
    private Boolean lue;

    @ManyToOne
    @JoinColumn(name="plainte_id")
    private Plainte plainte;

    @ManyToOne
    @JoinColumn(name="utilisateur_id")
    private Utilisateur destinataire;

    public Notification(Long id, LocalDateTime dateTime, String message, Boolean lue) {
        this.id = id;
        this.dateTime = dateTime;
        this.message = message;
        this.lue = lue;
    }
    public Notification() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Boolean getLue() {
        return lue;
    }

    public void setLue(Boolean lue) {
        this.lue = lue;
    }

    public LocalDateTime getDateTime() {
        return dateTime;
    }

    public void setDateTime(LocalDateTime dateTime) {
        this.dateTime = dateTime;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
