package com.observatoire.gestion_plaintes.model;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

public enum StatutPlainte {
    SOUMISE,
    EN_COURS,
    RESOLUE,
    REJETEE
}
