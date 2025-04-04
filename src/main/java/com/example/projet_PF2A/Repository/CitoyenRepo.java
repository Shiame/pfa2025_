package com.example.projet_PF2A.Repository;

import com.example.projet_PF2A.Model.Citoyen;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CitoyenRepo extends JpaRepository<Citoyen, String> {
}
