package com.example.projet_PF2A.Model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Administrateur extends Utilisateur{

    @OneToMany(mappedBy = "administrateur", cascade = CascadeType.ALL)
    private List<Plainte> plaintesGerees;
}
