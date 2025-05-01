package com.observatoire.gestion_plaintes.controller;

import com.observatoire.gestion_plaintes.model.Categorie;
import com.observatoire.gestion_plaintes.repository.CategorieRepository;
import com.observatoire.gestion_plaintes.service.CategorieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categories")
@CrossOrigin("*")
public class CategorieController {

    @Autowired
    private CategorieService categorieService;
    @Autowired
    private CategorieRepository categorieRepository;

    @PostMapping
    private Categorie addCategorie(@RequestBody Categorie categorie) {
        return categorieService.addCategorie(categorie);
    }

    @GetMapping
    private List<Categorie> getAllCategories() {
        return categorieService.getAllCategories();
    }
    @GetMapping("/{id}")
    private Categorie getCategorie(@PathVariable Long id) {
        return categorieService.getCategorieById(id);
    }

}
