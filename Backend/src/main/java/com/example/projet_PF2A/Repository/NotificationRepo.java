package com.example.projet_PF2A.Repository;

import com.example.projet_PF2A.Model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepo extends JpaRepository<Notification, Long> {
    List<Notification> findByCitoyenCin(String cin);
    List<Notification> findByLueFalse();
}
