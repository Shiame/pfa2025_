package com.example.projet_PF2A.Model;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;


@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Citoyen extends Utilisateur{

    @OneToMany(mappedBy = "citoyen", cascade = CascadeType.ALL)
    private List<Plainte> plaintes;

    @OneToMany(mappedBy = "citoyen", cascade = CascadeType.ALL)
    private List<Notification> notifications;

}
