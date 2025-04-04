# 🛰️ Observatoire pour la Gestion des Plaintes

## 👥 Réalisé par
- **Chaymae BOUAZZA**
- **Imane BENABBOU**
- **Encadrante :** Pr. Abdellatif EL FAKER  
  📧 abdel.elfaker@gmail.com / abdellatif.elfaker@ensias.um5.ac.ma

## 🧠 Contexte du projet

Ce projet a été développé dans le cadre du **Projet de Fin de 2ème Année** à l'**ENSIAS** (Rabat).  
L’idée est de permettre aux **citoyens** de signaler des **anomalies de sécurité et de vie publique** (agressions, déchets, corruption, routes dégradées, etc.) via une application mobile, et aux **administrations** de consulter, trier et analyser ces plaintes via un portail web intelligent.

---

## 🎯 Objectifs

### Objectif général
Créer une plateforme numérique unifiée pour la gestion des plaintes, combinant :
- Une **application mobile** citoyenne
- Un **site web analytique** pour les administrations

### Objectifs spécifiques
- 📸 Soumission de plaintes avec photo, description et géolocalisation
- 📍 Carte interactive et suivi en temps réel
- 🤖 Classification automatique des plaintes (NLP avec spaCy)
- 📊 Tableaux de bord pour les gestionnaires
- 📢 Rapports publics sur les statistiques et interventions

---

## 🧰 Technologies utilisées

| Composant             | Technologies                                | Raison principale                         |
|----------------------|---------------------------------------------|-------------------------------------------|
| **Backend**          | Spring Boot (Java)                          | Robustesse, sécurité, microservices       |
| **Application Mobile**| React Native                                | Multiplateforme (iOS/Android)             |
| **Frontend Web**     | React.js + D3.js                            | Visualisations dynamiques                 |
| **Base de données**  | PostgreSQL + MongoDB                        | Données structurées + logs                |
| **NLP**              | spaCy + FastAPI (Python)                    | Classification automatique                |
| **Déploiement**      | Docker, Kubernetes                          | Scalabilité, portabilité                  |
| **Sécurité**         | JWT + OAuth2                                | Authentification sécurisée                |
| **Notifications**    | Firebase                                    | Notifications push multi-plateformes      |

---

## 🏗️ Architecture du système

### 📱 Application Mobile (Utilisateur)
- Formulaire de plainte avec photo et localisation
- Suivi du statut : *Soumise → En cours → Résolue*
- Notifications push et support multilingue

### 💻 Site Web (Administrations)
- Dashboard analytique : types, zones, délais
- Carte interactive des anomalies
- Statistiques et tendances (ex. : +25% d’agressions cette semaine)
- Système de priorisation automatique via NLP

---

## 🚀 Lancement du projet (en local)

> ⚠️ Pré-requis : Java 17+, Node.js, Python 3.10+, Docker

1. Cloner le projet :
```bash
git clone https://github.com/utilisateur/observatoire-plaite-pfa.git
cd observatoire-plaite-pfa
