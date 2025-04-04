package com.example.projet_PF2A.Model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Categorie {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private String nom;
    private String couleur;

    @OneToMany(mappedBy = "categorie", cascade = CascadeType.ALL)
    private List<Plainte> plaintes;


}
