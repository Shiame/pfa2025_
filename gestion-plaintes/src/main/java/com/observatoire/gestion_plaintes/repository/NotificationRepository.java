package com.observatoire.gestion_plaintes.repository;

import com.observatoire.gestion_plaintes.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
}
