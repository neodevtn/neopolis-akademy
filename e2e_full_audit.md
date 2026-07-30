# Audit Fonctionnel Exhaustif E2E - Neopolis Akademy
## Date: 30 juillet 2026
## URL Production: https://akademy.neodev.click
## URL Preview: https://3000-iief5i2kig0d5tmaqksya-9ee8d1b2.us2.manus.computer

---

## 1. FRONT PUBLIC

### 1.1 Landing Page (/)
- [ ] Hero: titre, sous-titre, CTA "Déposer ma candidature", "Découvrir le programme"
- [ ] Navigation: La Formule, Pourquoi maintenant, Partenaires, FAQ, Formation
- [ ] Sélecteur de langue FR/EN/AR
- [ ] Bouton Déconnexion (si connecté)
- [ ] Bouton Postuler
- [ ] Section statistiques + graphique Chart.js
- [ ] Section "La Formule" (3 étapes)
- [ ] Section Partenaires
- [ ] Section Process Commercial (5 phases)
- [ ] Section FAQ (accordéon)
- [ ] Section Exemples de projets + Simulateur de revenus
- [ ] Footer + liens
- [ ] Cookie banner
- [ ] Widget "Reprendre la lecture"
- [ ] Scroll smooth vers les sections (ancres)

### 1.2 Page Apply (/apply)
- [ ] Étape 1: Prénom, Nom, Email, Téléphone - validation
- [ ] Étape 2: Pays, Ville, Secteur, Poste, Expérience - validation
- [ ] Étape 3: Programmation, IA, Cloud, Outils, Certifications
- [ ] Étape 4: Expertise secteur, Réseau client, Dev commercial
- [ ] Étape 5: Réseau distribution, Contacts industrie, Partenariats, Marché
- [ ] Étape 6: Tolérance risque, Autonomie, Résilience, Leadership, Expérience entrepreneuriale
- [ ] Étape 7: Scénario IA (100 chars min), Secteur cible, Impact attendu
- [ ] Étape 8: Langues, Prise de parole, Vente, Motivation (50 chars min)
- [ ] Étape 9: LinkedIn, Twitter, GitHub, Website, CV upload, Photo upload
- [ ] Étape 10: Video pitch (enregistrement obligatoire)
- [ ] Navigation Précédent/Suivant
- [ ] Barre de progression
- [ ] Soumission finale

### 1.3 Page Login (/login)
- [ ] Formulaire email/mot de passe
- [ ] Bouton connexion OAuth Manus
- [ ] Message "inscription sur invitation uniquement"
- [ ] Lien vers page d'accueil

### 1.4 Page Accept Invitation (/accept-invitation)
- [ ] Formulaire de création de compte avec token
- [ ] Validation du token
- [ ] Création du mot de passe

---

## 2. PARCOURS APPRENANT

### 2.1 Training Dashboard (/training)
- [ ] Liste des certifications disponibles
- [ ] Progression par certification
- [ ] Statistiques (leçons terminées, quiz réussis)
- [ ] Accès aux cours
- [ ] Filtres par niveau

### 2.2 Training Course (/training/course/:id)
- [ ] Affichage du contenu de la leçon
- [ ] Navigation entre leçons
- [ ] Vidéos intégrées
- [ ] Quiz interactifs
- [ ] Marquage de progression
- [ ] Bouton suivant/précédent

### 2.3 Training Certification (/training/certification/:id)
- [ ] Examen simulé
- [ ] Timer
- [ ] Questions à choix multiples
- [ ] Score final
- [ ] Certificat de réussite

---

## 3. ADMIN

### 3.1 Admin Dashboard (/admin)
#### Onglet Candidatures
- [ ] Tableau des candidatures (nom, email, date, statut)
- [ ] Filtres (statut, date, recherche)
- [ ] Actions: Sélectionner, Refuser, Voir détails
- [ ] Modal détails candidature
- [ ] Téléchargement CV
- [ ] Lecture vidéo pitch

#### Onglet Communications
- [ ] Envoi d'email individuel
- [ ] Templates d'email
- [ ] Historique des communications

#### Onglet Invitations
- [ ] Liste des invitations envoyées (statut, date)
- [ ] Bouton "Envoi en masse"
- [ ] Dialog d'envoi en masse (emails, noms)
- [ ] Renvoi d'invitation
- [ ] Annulation d'invitation

#### Onglet Kanban
- [ ] Colonnes de statut
- [ ] Drag & drop des candidatures
- [ ] Mise à jour du statut

#### Onglet Évaluation
- [ ] Grille d'évaluation
- [ ] Scoring des candidats
- [ ] Notes et commentaires

#### Onglet Activité
- [ ] Journal d'activité
- [ ] Actions récentes
- [ ] Filtres par type

### 3.2 Admin Content (/admin/content)
- [ ] Liste des certifications
- [ ] Liste des cours par certification
- [ ] Bouton Consulter (voir le contenu)
- [ ] Bouton Quiz (voir les quiz)
- [ ] Bouton Éditer (modifier le contenu)
- [ ] Bouton Simuler Examen
- [ ] Bouton Éditer Examen
- [ ] Barre de recherche
- [ ] Compteurs (cours, leçons, exercices)

### 3.3 Admin Training (/admin/training)
- [ ] Liste des apprenants
- [ ] Progression par apprenant
- [ ] Statistiques globales
- [ ] Bouton Inviter
- [ ] Actions: Bloquer, Détails
- [ ] Onglet Analytics

---

## 4. RÉSULTATS DES TESTS

### BUGS CRITIQUES (bloquants)
(à remplir)

### BUGS MAJEURS (fonctionnalité dégradée)
(à remplir)

### BUGS MINEURS (cosmétiques)
(à remplir)

### FONCTIONNALITÉS OK
(à remplir)
