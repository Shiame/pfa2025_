package com.observatoire.gestion_plaintes.repository;

import com.observatoire.gestion_plaintes.model.Categorie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategorieRepository extends JpaRepository<Categorie, Long> {
    Categorie  findByNom(String nom);
}
