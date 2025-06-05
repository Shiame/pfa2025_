# Observatoire de Plaintes Urbaines – Plateforme Complète

Ce projet est une solution de gestion intelligente des plaintes citoyennes (web, mobile, back-end, service NLP).  
Il permet la soumission, l'analyse, la priorisation, la visualisation et la gestion des plaintes grâce à l'IA.

---

## ⚡ Lancement rapide

1. **Cloner le projet**

   ```bash
   git clone <url-du-repo>
   cd observatoire-app
   ```

2. **Lancer toute la stack (nécessite Docker et Docker Compose)**

   ```bash
   docker-compose up --build
   ```

3. **Tout s'installe et se connecte automatiquement**
   
   Les images nécessaires seront construites, la base restaurée, et les services démarrés.

---

## 🌐 Accès aux différents services

| Service             | Port | URL d'accès                                              | Description                           |
| ------------------- | ---- | -------------------------------------------------------- | ------------------------------------- |
| **Back-end API**    | 8080 | [http://localhost:8080](http://localhost:8080)           | API principale (Spring Boot)          |
| **Front-end Web**   | 80   | [http://localhost](http://localhost)                     | Interface web (React/Vite + Nginx)    |
| **Service NLP**     | 8000 | [http://localhost:8000/docs](http://localhost:8000/docs) | API NLP + documentation Swagger       |
| **Base de données** | 5432 | *Non accessible via navigateur*                          | PostgreSQL, utilisé par l'application |

**Remarques** :
- Si le port 80 est déjà utilisé, le front web peut être sur 5173 ou un autre port (voir les logs Docker).
- L'API NLP expose automatiquement la documentation interactive sur `/docs`.

---

## 👤 Authentification & Comptes de test

Des comptes d'exemple sont déjà présents dans la base :

- **Administrateur**
  - Email : `admintest@gmail.com`
  - Mot de passe : Draft12345

- **Citoyen**
  - Email : `chaimaetest@gmail.com`
  - Mot de passe : Chaimae12345

*(Tu peux facilement ajouter ou modifier les utilisateurs en éditant la base ou via l'API)*

---

## 🗃️ Données et restauration de la base

- La base PostgreSQL est automatiquement initialisée au premier lancement avec le fichier `sauvegarde.sql`.
- Ce fichier contient la structure et les données de test (catégories, plaintes, utilisateurs, etc.).

**Pour restaurer la base :**
- Supprime le volume Docker associé à la base, puis relance la commande `docker-compose up --build`
- Ou copie un nouveau fichier `sauvegarde.sql` dans le dossier racine du projet avant lancement

---

## 📱 Utilisation du front mobile (Expo/React Native)

Le front mobile n'est **pas dockérisé**. Pour le lancer en local :

1. **Installer Expo CLI si besoin** (si tu ne l'as pas déjà) :

   ```bash
   npm install -g expo-cli
   ```

2. **Se positionner dans le dossier du mobile**

   ```bash
   cd mobile-front
   ```

3. **Installer les dépendances**

   ```bash
   npm install
   ```

4. **Lancer l'application mobile**

   ```bash
   expo start
   ```

   - Un QR code s'affiche dans le terminal.
   - **Scanner le QR code** avec l'appli Expo Go sur ton smartphone pour tester en réel.
   - Ou utiliser un émulateur Android/iOS sur ton poste.

> **Remarque** :
> L'application mobile utilise les endpoints du back-end définis dans le code (modifier l'URL API si besoin pour pointer vers `localhost`, ou l'IP locale de ta machine, selon ton environnement).

---

## ⏹️ Arrêter le projet

Pour tout arrêter proprement, dans le dossier du projet, fais :

```bash
docker-compose down
```

---

## 📂 Arborescence du projet

```
observatoire-app/
│
├── DashboardAdmin/        # Front web (React/Vite)
├── gestion-plaintes/      # Backend Spring Boot (Java)
├── nlp-service/           # Service NLP (FastAPI)
├── mobile-front/          # Application mobile (React Native/Expo)
├── sauvegarde.sql         # Script SQL d'initialisation de la base
├── docker-compose.yml     # Le fichier de composition multi-services
└── ...                   # Autres dossiers (landing page, docs, etc.)
```

---

## 🚀 Fonctionnalités principales

- **Gestion des plaintes** : Soumission, suivi et traitement des plaintes citoyennes
- **Intelligence artificielle** : Analyse automatique et catégorisation des plaintes via NLP
- **Interface multi-plateforme** : Web et mobile pour une accessibilité maximale
- **Tableau de bord administrateur** : Visualisation et gestion centralisée
- **Authentification sécurisée** : Gestion des rôles et permissions

---

## 🛠️ Technologies utilisées

- **Backend** : Spring Boot (Java)
- **Frontend Web** : React + Vite
- **Mobile** : React Native + Expo
- **NLP Service** : FastAPI (Python) + Spacy
- **Base de données** : PostgreSQL
- **Conteneurisation** : Docker & Docker Compose

---

## 💬 Contact

Pour toute question, suggestion ou bug, contacte l'équipe projet.

**Encadrant** : Pr. Abdellatif EL FAKER – ENSIAS – Université Mohammed V

---

## 📄 Licence

Ce projet est développé dans le cadre académique à l'ENSIAS.
