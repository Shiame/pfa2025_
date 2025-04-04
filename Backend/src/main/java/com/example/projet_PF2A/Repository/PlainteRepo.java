package com.example.projet_PF2A.Repository;

import com.example.projet_PF2A.Model.Plainte;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PlainteRepo extends JpaRepository<Plainte, Long> {
    List<Plainte> findByCitoyenCin(String cin);
    List<Plainte> findByStatut(String statut);
}
