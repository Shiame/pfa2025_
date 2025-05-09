package com.observatoire.gestion_plaintes.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
public class Plainte {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String description;
    private LocalDateTime dateSoumission;
    @Column(columnDefinition = "double precision")
    private double latitude;
    @Column(columnDefinition = "double precision")
    private double longitude;
    private String imgUrl;
    private String zone;
    private String localisation;
    private Integer priorite;

    public String getLocalisation() {
        return localisation;
    }

    public void setLocalisation(String localisation) {
        this.localisation = localisation;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }

    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "analyse_id")
    private AnalyseIA analyseIA;
    @ManyToOne
    @JoinColumn(name = "utilisateur_id")
    private Utilisateur utilisateur;

    @ManyToOne
    @JoinColumn(name = "categorie_id")
    private Categorie categorie;

    @ManyToOne
    @JoinColumn(name = "serveurCible_id")
    private serveurCible serveur;


    @OneToMany(mappedBy="plainte")
    private List<Notification> notifications;


    public String getZone() {
        return zone;
    }

    public void setZone(String zone) {
        this.zone = zone;
    }

    public Integer getPriorite() {
        return priorite;
    }

    public void setPriorite(Integer priorite) {
        this.priorite = priorite;
    }

    @Enumerated(EnumType.STRING)
    private StatutPlainte statut;





    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Utilisateur getUtilisateur() {
        return utilisateur;
    }

    public void setUtilisateur(Utilisateur utilisateur) {
        this.utilisateur = utilisateur;
    }

    public Categorie getCategorie() {
        return categorie;
    }

    public void setCategorie(Categorie categorie) {
        this.categorie = categorie;
    }

    public serveurCible getServeur() {
        return serveur;
    }

    public void setServeur(serveurCible serveur) {
        this.serveur = serveur;
    }

    public AnalyseIA getAnalyseIA() {
        return analyseIA;
    }

    public void setAnalyseIA(AnalyseIA analyseIA) {
        this.analyseIA = analyseIA;
    }

    public List<Notification> getNotifications() {
        return notifications;
    }

    public void setNotifications(List<Notification> notifications) {
        this.notifications = notifications;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public StatutPlainte getStatut() {
        return statut;
    }

    public Plainte(Long id, LocalDateTime dateSoumission, String description, Double longitude, Double latitude, String imgUrl, StatutPlainte statut) {
        this.id = id;
        this.dateSoumission = dateSoumission;
        this.description = description;
        this.longitude = longitude;
        this.latitude = latitude;
        this.imgUrl = imgUrl;
        this.statut = statut;
    }

    public void setStatut(StatutPlainte statut) {
        this.statut = statut;
    }

    public Plainte() {}



    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getDateSoumission () {
        return dateSoumission ;
    }

    public void setDateSoumission (LocalDateTime dateSoumission ) {
        this.dateSoumission  = dateSoumission ;
    }



    public String getImgUrl() {
        return imgUrl;
    }

    public void setImgUrl(String imgUrl) {
        this.imgUrl = imgUrl;
    }
}
