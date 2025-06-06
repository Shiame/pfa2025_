package com.observatoire.gestion_plaintes.service;

import com.observatoire.gestion_plaintes.model.Categorie;
import com.observatoire.gestion_plaintes.repository.CategorieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategorieService {

    @Autowired
    private CategorieRepository categorieRepository;

    public Categorie getCategorieById(Long id){
        return categorieRepository.findById(id).orElse(null);
    }

    public List<Categorie> getAllCategories(){
        return categorieRepository.findAll();
    }


    public Categorie addCategorie(Categorie categorie){
        return categorieRepository.save(categorie);
    }
}
