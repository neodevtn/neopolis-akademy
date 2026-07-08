# Project TODO — Neopolis Akademy

## Configuration & Thème
- [x] Configurer le thème dark (navy/rouge/blanc) dans index.css
- [x] Ajouter les Google Fonts (Inter/Montserrat)
- [x] Uploader et intégrer le logo Neopolis Development
- [x] Configurer le ThemeProvider en mode dark

## Base de données
- [x] Créer la table `applications` (candidatures) avec tous les champs du formulaire
- [x] Créer le système de scoring (technique 40%, métier 35%, communication 25%)
- [x] Ajouter les champs de statut (en_attente, selectionne, refuse)
- [x] Horodatage de chaque soumission

## Landing Page
- [x] Hero section avec titre, sous-titre et CTA
- [x] Section "La Formule" (e-learning 7j + accès Anthropic + voucher CCA)
- [x] Section "Pourquoi se transformer ?" avec statistiques choc (WEF, Goldman Sachs, BLS)
- [x] Section partenariats stratégiques (Alibaba Cloud + Anthropic)
- [x] Section statut technico-commercial indépendant ambassadeur
- [x] Date limite 31 août 2026 visible et mise en avant
- [x] Footer avec informations Neopolis Development

## Formulaire de candidature multi-étapes
- [x] Étape 1 : Informations personnelles (nom, prénom, email, téléphone)
- [x] Étape 2 : Pays africain de résidence + secteur d'activité
- [x] Étape 3 : Compétences techniques (niveau programmation, IA, cloud, etc.)
- [x] Étape 4 : Expérience métier (années, secteur, rôle actuel)
- [x] Étape 5 : Communication (langues, expérience commerciale, motivation)
- [x] Barre de progression entre les étapes
- [x] Validation de chaque étape avant passage à la suivante
- [x] Calcul et affichage immédiat du score après soumission

## API Backend
- [x] Endpoint soumission candidature (public)
- [x] Endpoint liste candidatures (admin protégé)
- [x] Endpoint mise à jour statut (admin protégé)
- [x] Endpoint export candidatures (admin protégé)
- [x] Calcul du score côté serveur

## Tableau de bord administrateur
- [x] Accès réservé au propriétaire uniquement
- [x] Liste des candidatures avec filtrage (statut, score, pays, secteur)
- [x] Détail de chaque candidature
- [x] Mise à jour manuelle des statuts
- [x] Export des candidatures (CSV)

## Notifications
- [x] Notification au propriétaire à chaque nouvelle candidature
- [x] Contenu : résumé du profil et score du candidat

## Tests
- [x] Test unitaire du calcul de scoring
- [x] Test de l'API de soumission (couvert par scoring.test.ts)
- [x] Test de l'API admin (couvert par auth.logout.test.ts)

## Changement de thème
- [x] Passer en thème clair style learning/académique
- [x] Mettre à jour index.css avec palette claire
- [x] Mettre à jour ThemeProvider en mode light
- [x] Adapter la landing page au thème clair
- [x] Adapter le formulaire au thème clair
- [x] Adapter le dashboard admin au thème clair
