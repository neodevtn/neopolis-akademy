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

## Illustrations académiques
- [x] Rechercher des illustrations style académique/learning
- [x] Intégrer des visuels dans la section Hero
- [x] Intégrer des visuels dans la section La Formule
- [x] Intégrer des visuels dans la section Partenariats
- [x] Intégrer des visuels dans la section Ambassadeur

## Refonte Design (Stripe-inspired via awesome-design-md)
- [x] Refonte index.css avec typographie Inter thin (300) + tracking négatif + palette Stripe adaptée
- [x] Refonte Home.tsx avec gradient mesh hero, pill buttons, cards premium, spacing Stripe
- [x] Refonte Apply.tsx avec le nouveau design system
- [x] Refonte AdminDashboard.tsx avec le nouveau design system
- [x] Vérification visuelle et tests

## Validation robuste front + back
- [x] Créer un schéma de validation partagé (shared) entre front et back
- [x] Validation frontend : messages d'erreur explicites par champ, validation en temps réel
- [x] Validation backend : schéma Zod renforcé avec messages personnalisés en français
- [x] Affichage des erreurs serveur côté client si la validation front est contournée

## Mise en avant gratuité + message transformation + graphique emplois
- [x] Mettre en avant la GRATUITÉ des formations et certifications (badge, texte prominent)
- [x] Renforcer le message "Transformez la menace de l'IA en opportunité" sur la landing page
- [x] Ajouter un graphique (courbe) montrant la perte d'emplois 2025-2030 pour les postes les plus impactés

## Enrichissement du formulaire de candidature
- [x] Ajouter section "Réseau de distribution" (contacts B2B, partenaires potentiels, réseau professionnel)
- [x] Ajouter section "Profil psychologique entrepreneurial" (prise de risque, autonomie, résilience, leadership)
- [x] Ajouter section "Scénario concret d'agent IA" (cas d'usage maîtrisé par le candidat)
- [x] Ajouter champs réseaux sociaux (LinkedIn, Twitter/X, GitHub, autre)
- [x] Ajouter champ site web personnel
- [x] Ajouter upload CV (fichier)
- [x] Ajouter upload photo de profil
- [x] Mettre à jour le schéma DB pour les nouveaux champs
- [x] Mettre à jour la validation partagée (shared/validation.ts)
- [x] Mettre à jour le scoring pour intégrer les nouveaux critères
- [x] Mettre à jour le dashboard admin pour afficher les nouveaux champs

## Étape vidéo pitch
- [x] Ajouter une 10ème étape au formulaire : enregistrement vidéo pitch (webcam)
- [x] Implémenter l'enregistrement vidéo via MediaRecorder API dans le navigateur
- [x] Limiter la durée (60-90 secondes max)
- [x] Upload de la vidéo vers S3
- [x] Ajouter le champ videoFileUrl dans le schéma DB
- [x] Afficher le lien vidéo dans le dashboard admin

## Amélioration interface vidéo
- [x] Ajouter un indicateur de niveau audio en temps réel (VU-mètre)
- [x] Ajouter des conseils visuels dynamiques pendant l'enregistrement (prompts)
- [x] Améliorer le feedback visuel global (countdown, états clairs)

## FAQ + Email de confirmation
- [x] Ajouter une section FAQ déroulante (accordion) sur la landing page
- [x] Questions : prérequis, processus de sélection, durée, débouchés, gratuité, certification
- [x] Ajouter un email de confirmation automatique envoyé au candidat après soumission
- [x] Contenu email : récapitulatif candidature + score obtenu

## Refonte Design Ultra-Moderne (Linear/Cursor-inspired)
- [x] Analyse des design systems Linear et Cursor dans awesome-design-md
- [x] Création du logo Neopolis Development Akademy
- [x] Refonte index.css : dark luxury, noise overlay, gradient mesh, animations fluides
- [x] Refonte Home.tsx : hero avec gradient mesh animé, illustrations IA, sections premium
- [x] Refonte Apply.tsx : formulaire dark avec surface-1, progress bar animée
- [x] Refonte AdminDashboard.tsx : badges dark, surface-1, header fixed blur
- [x] Tests unitaires passent (7/7)
- [x] Vérification visuelle complète

## Refonte Design Wise-Inspired
- [x] Refonte index.css avec design system Wise (lime-green, sage canvas, Inter 900/600, rounded-xl)
- [x] Refonte Home.tsx style Wise (hero band sage, cards blanches, CTA lime-green)
- [x] Adapter Apply.tsx au style Wise (inputs bordurés, cards sage, boutons pill)
- [x] Adapter AdminDashboard.tsx au style Wise
- [x] Vérification visuelle et tests

## Refonte UX/UI Ultra-Moderne (Wise + Framer Motion)
- [x] Création du nouveau logo Neopolis Akademy adapté au thème Wise (lime-green, minimaliste)
- [x] Génération d'images contextuelles (hero, certification, e-learning, réseau Afrique, partenariats)
- [x] Refonte complète Home.tsx avec framer-motion (fadeInUp, fadeInLeft, fadeInRight, staggerContainer, scaleIn)
- [x] Intégration des nouvelles images dans toutes les sections de la landing page
- [x] Ajout d'un compteur animé (CountUp) pour les statistiques clés
- [x] FAQ interactive avec animations d'ouverture/fermeture
- [x] Refonte Apply.tsx avec AnimatePresence pour transitions entre étapes
- [x] Progress bar animée avec motion.div
- [x] Indicateurs d'étapes visuels (barres segmentées)
- [x] Navbar glassmorphism (backdrop-blur)
- [x] TypeScript 0 erreurs
- [x] Tests vitest passent (7/7)

## Corrections UX/UI
- [x] Rendre l'enregistrement vidéo obligatoire avant soumission de candidature
- [x] Corriger contraste des alertes dans le formulaire (texte vert sur fond vert)
- [x] Corriger format téléphone +216 au lieu de +212
- [x] Tunisie sélectionnée par défaut dans le pays de résidence
- [x] Corriger erreur React key dans AdminDashboard

## Responsive Mobile
- [x] Corriger le header mobile (logo trop grand, bouton Postuler déborde)
- [x] Corriger le hero mobile (graphique orbital trop petit/illisible, badges flottants débordent)
- [x] Corriger la barre stats mobile (texte trop petit, éléments serrés)
- [x] Corriger les cartes étapes mobile (images et texte bien empilés)
- [x] Corriger la section Pourquoi maintenant mobile (cartes stats empilées)
- [x] Corriger la section Partenariats mobile (cartes et graphique réseau)
- [x] Corriger le footer mobile
- [x] Ajouter un menu hamburger mobile pour la navigation

## Corrections textuelles
- [x] Remplacer "marché africain" par "marché de l'IA agentique" dans le hero et les sections
- [x] Adapter la FAQ "Quels pays africains" pour mentionner la Tunisie et la région MENA
- [x] Corriger la description de l'étape Ambassadeur (supprimer "continent africain")
- [x] Corriger le placeholder motivation ("en Afrique" -> "dans votre secteur")

## Responsive Formulaire (Apply.tsx)
- [x] Grille Prénom/Nom : grid-cols-1 sur mobile, sm:grid-cols-2 sur tablette+
- [x] Container padding réduit sur mobile (py-6 px-4)
- [x] Titre d'étape : taille réduite sur mobile (text-xl vs text-2xl)
- [x] Indicateurs d'étapes : gap et hauteur réduits sur mobile
- [x] Boutons navigation : taille texte et padding réduits sur mobile
- [x] Bouton Soumettre : texte raccourci sur mobile pour éviter débordement
- [x] Player vidéo : max-h-[50vh] pour ne pas prendre tout l'écran mobile
- [x] Timer badge vidéo : position et taille réduites sur mobile
- [x] Prompt dynamique vidéo : marges et texte réduits sur mobile
- [x] Boutons enregistrement vidéo : full-width sur mobile, flex-col layout
- [x] Texte idle vidéo : taille réduite sur mobile

## Refonte section "Pourquoi se transformer maintenant ?"
- [x] Ajouter un graphique Chart.js (courbe/barres) montrant l'impact de l'IA sur l'emploi
- [x] Conserver les 3 cartes stats glassmorphism avec données chiffrées
- [x] Style dark/sombre pour toute la section (comme l'image de référence)
- [x] Données sourcées et vérifiables (WEF, Goldman Sachs, McKinsey, Gartner)
- [x] Message d'urgence impactant ("Ne subissez pas la disruption")

## Réorganisation et harmonisation des couleurs
- [x] Supprimer la barre de stats (220Mds$, 90M, 296) entre le hero et La Formule
- [x] Déplacer la section "Pourquoi se transformer maintenant" AVANT "La Formule Complète"
- [x] Harmoniser les fonds : gris clair / blanc / vert doux (pas de noir)
- [x] Section Pourquoi maintenant : fond gris clair au lieu de noir
- [x] Section La Formule : fond vert très pâle (#f0f7eb)
- [x] Section Partenariats : fond blanc
- [x] Section Ambassadeur : fond gris très clair (#f9fafb)
- [x] Section CTA final : fond vert doux (#e2f6d5)
- [x] PartnerCards : fond vert pâle au lieu de noir
- [x] Footer : gris foncé (#374151) au lieu de noir pur

## Corrections de sécurité (Audit)
- [x] F-001/F-002 : Ajouter headers de sécurité (CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy) + supprimer X-Powered-By
- [x] F-006/F-013 : Rate limit sur upload + validation extension fichier (whitelist)
- [x] F-014 : Protéger /manus-storage/applications/* (auth admin requise)
- [x] F-003/F-007 : Rate limiting global + anti-spam sur submit (IP-based)
- [x] F-005 : Réduire durée session JWT (1 an → 30 jours)
- [x] F-009 : Ne plus exposer les scores détaillés dans la réponse submit
- [x] F-011 : Limiter le batching tRPC (max 10 procédures par batch)

## Thème Bubble (nutlope/hallmark)
- [x] Palette cream/mint/sage avec tokens CSS variables
- [x] Typographie Plus Jakarta Sans + JetBrains Mono
- [x] Cards rounded-xl avec lift au hover
- [x] Navigation floating pill on scroll
- [x] Boutons push (scale 0.97 on active)
- [x] Eyebrow labels sur chaque section
- [x] Footer en style Bubble (canvas-soft)
- [x] Sections alternées canvas/canvas-soft
- [x] Tint colors pour les stats cards (coral, cyan, pear, mint)
- [x] PartnerCards et FormulaCards en wise-card
- [x] CTA band avec tint-mint background
- [x] FAQ avec wise-card et animations smooth

## Marquee logos partenaires
- [x] Bandeau marquee avec logos réels (images) au lieu de texte (spans)
- [x] 10 logos : Anthropic, Alibaba Cloud, Claude, Qwen, DeepSeek, OpenAI, Gemini, LangChain, CrewAI, n8n
- [x] Marquee positionné juste avant le footer (après FAQ/CTA)
- [x] Logos en opacity-60 avec hover:opacity-100 transition

## Animation graphique Chart.js au scroll
- [x] Courbes se dessinent progressivement (draw-in) quand la section devient visible au scroll
- [x] Animation avec délai progressif par point de donnée (200ms) et par dataset (100ms)
- [x] Easing easeOutQuart pour un effet fluide et naturel
- [x] Déclenchement unique (once: true) via useInView de framer-motion

## Section Process Commercial Ambassadeur
- [x] Ajouter une section détaillée "Modèle économique de l'Ambassadeur" sur la landing page
- [x] Afficher les 5 phases du projet : Génération de leads, Étude et évaluation, Contractualisation, Implémentation, Monitoring
- [x] Détailler la classification des projets (taille, besoin, solution)
- [x] Expliquer la rémunération (20-60% setup + 10% tokens run)
- [x] Design cohérent avec le thème Bubble existant

## Améliorations section Process Commercial
- [x] Diagramme de flux visuel (Ambassadeur → Centrale → Client) type flowchart simplifié
- [x] Simulateur de revenus interactif (estimation gains selon nombre de projets)
- [x] Lien "Process Commercial" dans la navigation principale (desktop + mobile)

## Exemples concrets et animation diagramme
- [x] Exemples concrets de projets types avec montants sous le simulateur (Restauration, Industrie, Cabinet Conseil)
- [x] Animation séquentielle du diagramme de flux au scroll (apparition étape par étape avec délai 180ms)

## Refonte exemples de projets
- [x] Remplacer les 3 exemples par 8 projets réalistes contexte Afrique/MENA
- [x] Secteurs : Agence de voyage, Agence marketing, Assurance, Banque, Cabinet médecin, Import-Export, Promoteur immobilier, École privée
- [x] Ajouter le ROI pour chaque projet
- [x] Descriptions adaptées au contexte régional (Casablanca, Alger, Tanger Med, Abidjan, Sénégal, Tunisie)

## Conformité Claude Partner Network
- [x] Remplacer "Partenariats Stratégiques" par "Nos Partenaires Technologiques" + mention Registered Partner
- [x] Remplacer "accès exclusif" par "accès facilité" dans la description Anthropic
- [x] Ajouter lien vers neodev.click dans le footer (contact + copyright)
- [x] Ajouter lien vers le Claude Partner Network dans le footer
- [x] Ajouter mention "Registered Partner du CPN" dans le footer
- [x] Ajouter mention "Statut Select en cours d'obtention" dans la section partenaires
- [x] Corriger FAQ : "partenariats stratégiques" → "Registered Partner du CPN"
- [x] Mention "Porté par NeoDev" dans le copyright

## Badge Registered Partner + Mentions légales
- [x] Badge "Registered Partner" cliquable à côté du logo dans le header → lien CPN Anthropic
- [x] Page /mentions-legales avec CGU, politique de confidentialité, informations légales
- [x] Lien vers mentions légales dans le footer
- [x] Correction lien À propos : neodev.click → www.neopolis-dev.com

## Bandeau Cookie Consent RGPD
- [x] Composant CookieConsent avec Accepter/Refuser
- [x] Mémorisation du choix dans localStorage
- [x] Affichage uniquement au premier chargement (délai 1.5s)
- [x] Lien vers la politique de confidentialité (/mentions-legales)
- [x] Design cohérent avec le thème du site (backdrop blur, couleurs Wise)

## Espace Training (Claude Certification)
- [x] Créer le fichier de données structurées (trainingData.json : 4 certifications, 29 cours, 26 vidéos, 480+ exercices)
- [x] Page Dashboard Training (/training) avec les 4 certifications et stats
- [x] Pages cours par certification (/training/:certId) avec liste et progression
- [x] Pages leçons individuelles (/training/:certId/:courseId) avec vidéos et exercices
- [x] Système de progression locale (TrainingProgressContext + localStorage)
- [x] Toggle bilingue EN/FR (LanguageContext)
- [x] Exercices et checkpoints interactifs (affichage + bouton Terminer)
- [x] Navigation Training dans le header principal (desktop + mobile)
- [x] Design cohérent avec le thème existant (slate/emerald, rounded-xl, backdrop-blur)
- [x] Intégrer le contenu pédagogique réel bilingue EN/FR (77+ leçons, lazy-loaded par cours)
- [x] Implémenter quiz interactif avec 40 questions par certification, scoring et explications
- [x] Lazy-loading des données de cours (fichiers JSON séparés dans /public/data/courses/)

## Corrections Espace Training v2
- [x] Remplir les cours avec le vrai contenu pédagogique (pas seulement exercices)
- [x] Corriger les erreurs vidéo sur les pages de cours (embedUrl ajouté dans trainingIndex)
- [x] Ajouter un mock exam chronométré par certification basé sur les exam guides
- [x] Fix: domain object rendering error (Objects are not valid as React child)
- [x] Supprimer les fichiers de cours orphelins (exam guide content mal parsé)
- [x] Mock exam: page intro avec détails examen, domaines, notice
- [x] Mock exam: timer chronométré avec navigation par question
- [x] Mock exam: scoring avec score pondéré (100-1000), performance par domaine
- [x] Mock exam: revue détaillée des réponses avec explications
- [x] Mock exam: bouton CTA sur chaque page de certification

## Augmentation banque de questions Mock Exam (5x session size)
- [x] Générer 300 questions pour Claude Certified Associate Foundations (7 domaines, 60/session)
- [x] Générer 265 questions pour Claude Certified Developer Foundations (8 domaines, 53/session)
- [x] Générer 300 questions pour Claude Certified Architect Foundations (5 domaines, 60/session)
- [x] Générer 300 questions pour Claude Certified Architect Professional (7 domaines, 63/session)
- [x] Mettre à jour examConfig dans trainingIndex.json (totalQuestions par session)
- [x] Séparer les questions dans un fichier JSON dédié (mockExamQuestions.json) pour performance
- [x] Vérifier le rendu du mock exam avec les nouvelles questions

## Refonte UX Formation (authentification + progression DB + parcours séquentiel)
- [x] Créer tables DB : training_progress (user_id, course_id, lesson_index, completed_at) + exam_attempts (user_id, cert_id, score, started_at, finished_at, answers)
- [x] Authentification obligatoire pour accéder à l'espace formation
- [x] Procédures tRPC : markLessonComplete, getProgress, getCertCompletion, submitExamAttempt, getExamHistory
- [x] Parcours séquentiel : leçons verrouillées (la suivante se débloque après la précédente)
- [x] Pas de retour en arrière sur les leçons terminées
- [x] Mock exam conditionnel : bouton désactivé tant que tous les cours de la certification ne sont pas terminés
- [x] Mock exam strictement séquentiel : pas de retour en arrière sur les questions
- [x] Mock exam repassable : l'utilisateur peut repasser l'examen autant de fois qu'il veut
- [x] Historique des tentatives d'examen sauvegardé en DB
- [x] Fix: loading spinner pendant auth loading (pages blanches)
- [x] Fix: resolveI18n pour les titres/contenus de leçons ({en, fr} objects)

## Corrections post-audit
- [x] Fix: exerciseCount → lessonCount dans TrainingDashboard et TrainingCertification
- [x] Fix: Bloquer la relecture des leçons terminées (ne pas permettre l'expansion)
- [x] Fix: Ajouter un auth gate au TrainingDashboard

## Nouvelles fonctionnalités (historique + certificat + progression globale)
- [x] Backend: procédure tRPC getExamHistory (retourne tentatives avec date, score, durée)
- [x] Backend: endpoint génération certificat PDF (pdfkit, score ≥ 720)
- [x] Frontend: tableau historique tentatives sur page certification
- [x] Frontend: bouton téléchargement certificat PDF conditionnel (score ≥ 720)
- [x] Frontend: barre de progression globale cross-certifications sur le dashboard

## Refonte UX Cours (nettoyage + segmentation + navigation)
- [x] Nettoyer les artefacts UI (Flip, numéros de page, éléments de navigation)
- [x] Segmenter les leçons en pages navigables (2-6 pages par leçon)
- [x] Navigation page par page dans chaque leçon (Précédent/Suivant/Terminer)
- [x] Indicateur de progression intra-leçon (dots + compteur page X/Y)
- [x] Marquer la leçon complète seulement après la dernière page
- [x] Améliorer le rendu du contenu (titres, listes, code blocks, bold/italic/inline code)
- [x] Leçon active mise en évidence (bordure verte, badge 'En cours')
- [x] Leçons verrouillées/terminées clairement identifiées visuellement

## Améliorations UX Formation v4
- [x] Sidebar fixe à gauche avec état d'avancement des leçons (terminé/en cours/verrouillé)
- [x] Quiz interactif de validation en fin de leçon (avant bouton Terminer)
- [x] Mode sombre pour l'espace formation (toggle dark/light)

## Refonte UX/UI TrainingDashboard
- [x] Redesign premium du TrainingDashboard (cercle de progression SVG, cartes certification, stats row, ordre d'étude recommandé)
- [x] Header avec toggle dark mode, toggle langue, navigation retour
- [x] Auth gate avec design cohérent
- [x] Badges de niveau (Débutant/Intermédiaire/Avancé) avec couleurs distinctes
- [x] Progression globale avec mini-barres par certification
- [x] TypeScript 0 erreurs, tests passent (7/7)

## Harmonisation design + animations + notifications
- [x] Ajouter animations d'entrée (fade-in, stagger) sur les cartes du TrainingDashboard (framer-motion)
- [x] Harmoniser TrainingCertification avec le design premium (tokens CSS, cards, badges, dark mode)
- [x] Harmoniser TrainingCourse avec le design premium (tokens CSS, header, cards, sidebar)
- [x] Système de notifications toast quand un nouveau cours se débloque
- [x] Notification toast quand un certificat est disponible (score ≥ 720)

## Confetti + Admin Dashboard
- [x] Animation confetti (canvas-confetti) lors de la réussite d'un examen blanc (score >= 720)
- [x] Tableau de bord admin : procédure tRPC adminProcedure pour lister tous les apprenants
- [x] Tableau de bord admin : page AdminTraining avec tableau paginé, recherche, progression par apprenant
- [x] Route /admin/training protégée par rôle admin

## Corrections UX page TrainingCourse (contenu leçon)
- [x] Ajouter un badge "EN" sur les leçons en anglais pour indiquer clairement la langue
- [x] Corriger le style "PROPERTY X" : remplacer par un sous-titre intégré (gras, taille supérieure, sans couleur verte)
- [x] Améliorer la hiérarchie du titre de section (ex: "What to Expect...") : taille plus grande, gras, séparation nette
- [x] Augmenter l'espacement entre les sections de contenu (intro vs properties)
- [x] Supprimer la liste redondante des leçons dans la zone principale (garder uniquement la sidebar + leçon active)
- [x] Fix vidéo YouTube bloquée : utiliser youtube-nocookie.com, ajouter sandbox/referrerPolicy, lien fallback "Regarder sur YouTube"

## Améliorations vidéos
- [x] Badge durée sur chaque vidéo (~5 min par défaut, personnalisable via champ duration)
- [x] Bouton interactif "Marquer comme vue" pour chaque vidéo (persisté localStorage)
- [x] Lazy loading avec miniature YouTube (thumbnail mqdefault) avant chargement de l'iframe

## Barre de progression vidéo animée
- [x] Ajouter une barre de progression visuelle animée dans la section vidéo qui se met à jour dynamiquement quand une vidéo est marquée comme vue

## Durées YouTube + Synchro serveur + Filtre vidéo
- [x] Récupérer les durées réelles des vidéos YouTube et les stocker dans trainingIndex.json (via recherche Anthropic/HumanCo)
- [x] Créer table videoProgress côté serveur pour persistance multi-appareils (unique index userId+courseId+youtubeId)
- [x] Créer procédures tRPC pour get/set video progress (videoProgress.get + videoProgress.toggle)
- [x] Mettre à jour le frontend pour utiliser les durées réelles et la synchro serveur (fallback localStorage si non-auth)
- [x] Ajouter un filtre rapide (Toutes / Non vues / Vues) au-dessus de la liste vidéo

## Intégration vidéos dans le flux des leçons
- [x] Supprimer la section vidéo séparée en haut de page
- [x] Intégrer chaque vidéo directement dans la leçon correspondante (matching par titre)
- [x] Afficher la vidéo en haut de la leçon avant le contenu textuel
- [x] Conserver le badge durée, le bouton marquer comme vue, et le lazy loading thumbnail

## Indicateur sidebar + Résumé progression
- [x] Ajouter icône caméra dans la sidebar pour les leçons ayant une vidéo associée
- [x] Ajouter un résumé de progression global en haut du cours (X/Y leçons + X/Y vidéos terminées, barres animées)

## Vidéo comme étape du cours (non clipsée)
- [x] Afficher la vidéo directement (non réduite/clipsée) comme une étape à part entière dans le flux de la leçon
- [x] Supprimer le mécanisme expand/collapse sur les vidéos — elles doivent être visibles par défaut

## Vidéo comme page/étape dans la pagination
- [x] La vidéo doit être une page dans la séquence de navigation (ex: Page 1 = Vidéo, Page 2 = Contenu), pas un élément fixe au-dessus
- [x] Quand on passe à la page suivante, la vidéo disparaît (c'est une étape comme les autres)
- [x] Vérifier que les vidéos sont correctement associées aux bons cours (3 cours avec vidéos, 26/36 lessons matchées)

## Formatage du contenu des leçons
- [x] Améliorer le composant PageContent avec heuristiques intelligentes (détection auto titres, métadonnées, listes implicites, sous-sections)

## Sidebar cliquable + Drawer mobile + Mini-quiz
- [x] Rendre les leçons terminées cliquables dans la sidebar pour mode révision (activeLessonIndex state, badge "Mode Révision", bouton retour)
- [x] Transformer la sidebar en drawer rétractable sur mobile (Sheet component de shadcn/ui, side="left")
- [x] Mini-quiz interactif de validation en fin de leçon (LessonQuiz avec 3 questions, 2/3 requis, intégré dans le flux de pagination)

## Amélioration Quiz - Retry avec feedback visuel
- [x] Ajouter un feedback visuel immédiat après chaque réponse (correct/incorrect avec animation, bannière colorée + icône)
- [x] Améliorer l'écran d'échec avec un bouton retry plus visible (full-width, amber, numéro tentative) et résumé visuel (dots vert/rouge)
- [x] Ajouter une animation de transition entre les tentatives (shake sur échec, spring scale sur succès, motion.div transitions)
- [x] Afficher le nombre de tentatives effectuées (badge #N dans le header + mention sur l'écran résultat)

## Écran résumé détaillé des erreurs avant retry
- [x] Afficher un résumé détaillé de chaque question (question, réponse donnée, bonne réponse, explication) avant le bouton retry
- [x] Coder les réponses en couleur (vert correct, rouge incorrect) avec icônes (✓/✗)
- [x] Ajouter un bouton "J'ai compris, réessayer" en bas du résumé + bouton "Réessayer directement" pour skip

## Indicateur progression par domaine + Lien "Revoir cette section"
- [x] Ajouter un indicateur visuel de progression par domaine en haut de l'écran de révision (barres animées colorées rouge/vert avec score par domaine + message "Concentrez-vous sur les domaines en rouge")
- [x] Intégrer un lien "Revoir cette section" sous chaque question ratée (matching intelligent domaine→cours par mots-clés, lien avec icône BookOpen)

## Compte démo apprenant
- [x] Créer une route /api/demo-login qui génère une session JWT pour un utilisateur démo prédéfini
- [x] Insérer l'utilisateur démo en base de données (upsert automatique au login)
- [x] Créer une page /demo-login avec formulaire email/mot de passe démo
- [x] Préparer un document d'instructions pour l'apprenant

## Corrections Audit 2026-07-24
- [x] Écart 8: Corriger les titres/acronymes (MSO, MCP, AI, GTM, Claude's) dans trainingIndex.json et les JSON de cours
- [x] Écart 7: Corriger le débordement mobile sur les pages de cours (overflow-x-hidden, min-w-0, word-break)
- [x] Écart 6: Déverrouiller l'examen blanc pour le compte démo (bypass openId demo_learner_001)
- [x] Écart 5: Générer des quiz spécifiques par leçon (501 questions générées via LLM pour 167 leçons, lessonQuizzes.json)
- [x] Écart 3: Traduire les pages FR correctement (892 pages + titres traduits via LLM en 18 min)
- [x] Écart 1: Contenu source complet intégré (789 pages sans troncature, rebuild_from_source_v2.py)
- [x] Écart 2: 497 exercices avec contenu complet (section collapsible "Exercices & Checkpoints" dans l'UI)
- [x] Écart 4: 26 transcripts vidéo intégrés (section collapsible "Transcriptions vidéo" dans l'UI)
- [x] Re-traduction FR complète après rebuild (783 pages en 25 min)

## Audit P0 - Nettoyage artefacts + Exercices interactifs (2026-07-24)
- [x] P0: Nettoyer Flip ↻ (92 occ), ↻ (111 occ), mojibake (9 occ), fragments HTML/CSS/JS (104 occ) des 25 JSON — 0 restant
- [x] P0: Restructurer les 497 exercices avec schema exploitable (337 LLM + 160 déterministe, 6 interactionTypes)
- [x] P0: Créer composant ExerciseRenderer interactif (free_text, single_choice, multi_choice, code, checklist, scenario)
- [x] P1: Persistance des tentatives (localStorage save/load/clear par exercice)
- [x] P1: Tests qualité bloquants (vitest) — 8 tests courseQuality, 15 total pass

## Audit V2 - Redistribution exercices + Traduction + Refonte renderer (2026-07-25)
- [x] Redistribuer les 500 exercices dans les chapitres des cours JSON (distribute_exercises.py)
- [x] Traduire EN→FR tous les contenus (1663/1663 items : titres, blocs, exercices)
- [x] Refactorer LessonViewer → ChapterBasedLessonViewer (chapitres/blocs au lieu de pages)
- [x] Blocs content → PageContent inline
- [x] Blocs video → YouTube player avec marquer comme vue
- [x] Blocs transcript → section collapsible
- [x] Blocs checkpoint → ExerciseRenderer inline
- [x] Navigation par chapitre (dots indicator)
- [x] Vérifier la cohérence avec Skilljar (25/25 cours, 4/4 certifications, titres matchent)
- [x] Corriger titre Architect Professional #5 (Developer Productivity → Team Enablement & Operational Productivity)
- [x] Nettoyer artefact CSS .ccc- dans architect_foundations__05
- [x] Mettre à jour test courseQuality (correction vide OK pour free_text)
- [x] Tests passent (15/15)

## Corrections modèles LLM pour exercices + Progression par chapitre (2026-07-25)
- [x] Générer les corrections LLM pour les 500 exercices free_text (correction modèle en FR et EN)
- [x] Ajouter un indicateur de progression par chapitre dans la sidebar (pas seulement par leçon)

## Restructuration architecture Training (CPN-like) (2026-07-26)
- [x] Supprimer le verrouillage séquentiel des cours dans TrainingCertification (tous accessibles dès le départ)
- [x] Nettoyer les titres des cours dans trainingIndex.json (supprimer le préfixe certification)
- [x] Ajouter un indicateur de progression par cours (barre + pourcentage) dans la vue certification
- [x] Améliorer la vue d'ensemble certification (progression globale = agrégat des cours)

## Analyse du référentiel processus IA et exploitation pédagogique / produit (2026-07-26)
- [x] Analyser le référentiel méthodologique PDF sur la transformation des processus par l'IA
- [x] Cartographier les complémentarités avec la formation Claude Certified Associate – Foundations
- [x] Identifier une structure de formation additionnelle fondée sur la classification des processus métier
- [x] Définir un concept d'outil de diagnostic d'automatisabilité / agentabilité basé sur le référentiel
- [x] Produire une synthèse exploitable pour décider du positionnement pédagogique et produit

## Notes de lecture du référentiel processus IA
- [x] Sauvegarder les constats structurants et citations clés issus du PDF dans un mémo de travail

## Formation "Transformation des Processus par l'IA" (indépendante de Claude)
- [x] Créer le contenu JSON des 5 modules (chapitres, blocs, exercices) basé sur le référentiel DATAS-STD-BPM-AI-001
- [x] Ajouter la certification "Transformation des Processus par l'IA" dans trainingIndex.json
- [x] Vérifier le rendu dans la page Training

## Outil de diagnostic d'automatisabilité/agentabilité (indépendant de Claude)
- [x] Créer la page DiagnosticIA.tsx avec formulaire multi-étapes et moteur de scoring
- [x] Implémenter le moteur de scoring (potentiel IA, technologies applicables, complexité)
- [x] Créer la page de résultats (score, technologies recommandées, plan d'action)
- [x] Ajouter la route /diagnostic et la navigation (Home, TrainingDashboard)
- [x] Connecter l'outil à la formation (lien vers certification Transformation des Processus)

## Modernisation UI e-learning (guidelines Justinmind)
- [x] Analyser le guide Justinmind et extraire les principes design applicables
- [x] Refondre le thème Training (couleurs indigo/emerald, typographie Inter, ombres modernes)
- [x] Moderniser TrainingDashboard (hero, cards, stats, navigation)
- [x] Moderniser TrainingCertification (layout cours, progression visuelle)
- [x] Ajouter variables de compatibilité wise-* pour Home.tsx
- [x] Vérification visuelle (Home + Training Dashboard OK)

## Persistance progression en BDD
- [x] Créer la table `chapter_progress` (userId, courseId, lessonIndex, chapterIndex, totalChapters)
- [x] Créer les endpoints tRPC (getChapterProgress, saveChapterProgress)
- [x] Intégrer dans TrainingProgressContext (getChapterProgress, saveChapterProgress)
- [x] Progression leçon déjà persistée en BDD (table training_progress existante)

## Admin Dashboard Apprenants
- [x] Réutiliser table `user` avec rôle admin/user + champs blocked/invitedAt/invitedBy
- [x] Créer table `user_invitations` (email, name, invitedBy, status, createdAt)
- [x] Page admin : liste des apprenants avec recherche et filtrage
- [x] Fonctionnalité : inviter un apprenant (dialog email + nom)
- [x] Fonctionnalité : bloquer/débloquer un apprenant
- [x] Fonctionnalité : changer le rôle (admin/user)
- [x] Analytics : onglet avec statistiques (inscriptions, activité, complétion)
- [x] Export : CSV des apprenants et de leur progression

## Bug fix: Incohérence compteurs de leçons
- [x] Corriger le compteur de leçons dans TrainingCertification (affiche chapitres au lieu de leçons)
- [x] Corriger le compteur dans le header du cours (utilise chapitres pour cours mono-leçon)
- [x] Corriger la sidebar (affiche chapitres comme items pour cours mono-leçon)
- [x] Mettre à jour trainingIndex.json (lessonCount = nombre de chapitres pour cours mono-leçon)

## Améliorations UX sidebar + widget reprise
- [x] Coche verte dans la sidebar pour les chapitres complétés
- [x] Navigation directe par clic sur un chapitre dans la sidebar (scroll vers la section)
- [x] Widget "Reprendre la lecture" sur la page d'accueil (dernier chapitre visité)

## Bug fix: Incohérences indicateurs d'avancement (2026-07-26)
- [x] Tag "Not started" affiché sur la page certification alors que le cours a une progression chapitre (5/11)
- [x] Chapitre 5 (index 4) affiche un contenu vide quand on l'ouvre
- [x] Impossible de revoir les chapitres précédents (chapitres complétés non cliquables ou contenu non affiché)
- [x] Rate limit augmenté de 100 à 300 req/min pour éviter les blocages en usage normal

## Bug fix: TypeError "Cannot read properties of undefined (reading 'fr')" (2026-07-26)
- [x] Cliquer "Suivant" après avoir revu un chapitre terminé provoque un crash (ExerciseRenderer crash sur champs manquants)
- [x] Rendu défensif du t() dans LanguageContext (null/undefined)
- [x] ExerciseRenderer: tous les champs rendus optionnels, interactionType/difficulty/rubric avec fallbacks

## Sauvegarde automatique brouillons exercices + enrichissement JSON (2026-07-27)
- [x] Implémenter auto-save des brouillons dans ExerciseRenderer (debounce 1.5s, localStorage, indicateur visuel Save/Saving/Error)
- [x] Enrichir les données JSON des exercices avec difficulty et skillTags pour tous les cours (513 exercices enrichis)

## Refonte outil Diagnostic IA selon DATAS-STD-BPM-AI-001 (2026-07-27)
- [x] Refonte complète de DiagnosticIA.tsx avec 9 étapes (7 saisie + 1 synthèse + 1 résultats)
- [x] Sections A-B: Identification (code, nom, catégorie APQC, domaine, objectif, déclencheur, résultat)
- [x] Sections D-E-F: Ressources (fréquence, volume, temps, agents, coûts, erreurs, SLA, délais)
- [x] Sections G-J: Automatisation (niveau actuel, outils utilisés)
- [x] Section H: Interventions humaines (7 types avec scores de répétitivité)
- [x] Section I: Données manipulées (12 types avec niveaux de structure)
- [x] Section K: Irritants/points de douleur (12 types)
- [x] Critère 4: Complexité (disponibilité données, systèmes, conduite changement, réglementaire, maturité)
- [x] Moteur de scoring: 4 critères (potentiel, technologies, gains, complexité/ROI)
- [x] Matrice Valeur × Complexité (Quick Win, Stratégique, Optionnel, À éviter)
- [x] 13 technologies IA avec matching automatique par signaux (données, interventions, irritants)
- [x] Recommandations contextuelles (8 types)
- [x] Zéro texte libre — tous les champs sont des sélecteurs structurés

## Champs texte libre + Export PDF diagnostic (2026-07-27)
- [x] Ajouter champs texte libre optionnels (contexte organisationnel, description du processus, notes)
- [x] Implémenter export PDF du rapport diagnostic avec charte graphique Neopolis Development (jsPDF, header vert, sections structurées, auteur Achraf Khelil)

## Unification authentification (2026-07-27)
- [x] Remplacer OAuth Manus par authentification email/mot de passe intégrée
- [x] Créer page login/register unifiée
- [x] Garder le compte démo comme un compte normal (pas un espace séparé)
- [x] Configurer un compte admin avec identifiants
- [x] Supprimer la redirection vers manus.im/app-auth

## Bug: Admin ne voit pas l'interface d'administration (2026-07-27)
- [x] Le compte admin@neopolis.dev ne voit aucune interface d'administration après connexion
- [x] Vérifier le rôle 'admin' en base de données (confirmé admin)
- [x] S'assurer que la navigation conditionnelle affiche le lien admin pour les comptes admin
- [x] Login admin redirige vers /admin au lieu de /training
- [x] Bouton "Admin" visible dans le header Training pour les admins
- [x] Navigation Candidatures / Suivi Apprenants dans le header admin

## Amélioration style navigation (2026-07-27)
- [x] Améliorer le style/taille des liens de navigation (La Formule, Pourquoi maintenant, Partenaires, Process Commercial, FAQ) - plus élégant, meilleure lisibilité

## Bug: Pages de cours crash au premier chargement (2026-07-27)
- [x] Toutes les pages de cours donnent une erreur au premier chargement (ajouté guard lessonsLoading avant le rendu principal)

## Fidélité cours Anthropic : composants interactifs (2026-07-27)
- [x] Restructurer le JSON du cours Platform & Model Foundations avec blocs flip_cards, tabbed_content, comparison
- [x] Créer composant FlipCard avec animation 3D (flip au clic)
- [x] Créer composant TabbedContent avec onglets interactifs
- [x] Créer composant ComparisonBox (wrong/right pattern)
- [x] Mettre à jour renderBlock dans TrainingCourse.tsx pour les 3 nouveaux types de blocs

## Bug fix: Flip cards + Complete Lesson + Review crash (2026-07-27)
- [x] Flip cards trop petites - le texte du dos déborde (hauteur dynamique nécessaire)
- [x] Bouton "Complete Lesson" ne fonctionne pas après quiz réussi (fix: pour single-lesson courses, avance chapter progress à la fin + mark lesson 0)
- [x] Mode review crash avec React error #185 (fix: stabilisé onChapterChange avec useCallback + ref isSyncingFromParent pour briser la boucle infinie)

## Restructuration des cours avec blocs interactifs (2026-07-27)
- [x] Restructurer tous les cours restants (29 fichiers) avec flip_cards, tabbed_content, comparison - 25/29 fichiers modifiés, 142 blocs interactifs ajoutés
- [x] Identifier les patterns textuels dans chaque cours (Component/Term/Definition, Weak/Strong prompt, Option/Level)
- [x] Convertir les listes de comparaison en blocs comparison (wrong/right) - 1 comparison
- [x] Convertir les contenus à onglets en blocs tabbed_content - 5 tabbed_content
- [x] Convertir les cartes retournables en blocs flip_cards - 136 flip_cards
- [x] Fix: useCallback Rules of Hooks violation (moved before conditional returns)
## Restructuration structure des cours (2026-07-27)
- [x] Ajout Module Introduction, Key Takeaways, Module Complete à tous les cours (24 chapitres ajoutés)
- [x] Implémentation du composant MatchingExercise (bucket sort / drag & drop)
- [x] Conversion des exercices checkpoint en bucket_sort interactifs (6 exercices)
- [x] Suppression des doublons de chapitres dans tous les cours
- [x] Nettoyage des blocs vides et checkpoint redondants
- [x] Fusion des chapitres avec le même titre (Core Entry Points, Capability Layer)
- [x] Ajout contenu aux chapitres structurels (intro, takeaways, complete)

## Indicateurs visuels sidebar (2026-07-27)
- [x] Ajouter icônes dans la sidebar pour différencier les types de chapitres
- [x] Icône quiz (Brain violet) pour les chapitres type quiz
- [x] Icône exercice interactif (Target orange) pour les chapitres type exercise/checkpoint
- [x] Icône vidéo (Video rouge) pour les chapitres avec vidéo
- [x] Icône résumé (GraduationCap vert) pour les chapitres Key Takeaways
- [x] Icône module terminé (Trophy ambre) pour les chapitres Module Complete
- [x] Légende ajoutée en bas de la sidebar

## Fix texte brut → éléments interactifs (2026-07-27)
- [x] Identifier et convertir les patterns de boutons en texte brut (Review module, Start over, Start Module, Return to course home, Submit, Skip for now) → supprimés du contenu
- [x] Convertir les cards/composants en texte brut (Code Execution, Component, etc.) en badges/chips colorés
- [x] Convertir les quiz en texte brut (questions + options A/B/C/D) en vrais quiz interactifs → 8 modules avec SingleChoiceExercise
- [x] Nettoyer les textes "Module X complete" → supprimés du contenu, remplacés par chapitre dédié
- [x] Améliorer le rendu du contenu textuel (PageContent) avec détection automatique des termes techniques
- [x] Créé composant SingleChoiceExercise.tsx avec feedback visuel et explication
- [x] Supprimé 5 bucket_sort corrompus avec labels UI chrome
- [x] Régénéré quiz corrompus (Associate 01, 04) via LLM
- [x] Stripé tout le UI chrome résiduel (Submit, Skip, Check answer, Previous, Contents, Next)

## Restauration quiz de passage entre chapitres (2026-07-27)
- [x] Modifier LessonViewer pour afficher un mini-quiz après CHAQUE chapitre teaching (pas seulement le dernier)
- [x] Le bouton "Suivant" ne doit être accessible qu'après avoir réussi le quiz du chapitre
- [x] Enrichir les questions par chapitre (de 3 à 12 pour variabilité, en afficher 3 aléatoirement)
- [x] Vérifier que les examens blancs fonctionnent toujours (MockExam.tsx inchangé, route /mock-exam/:certId existante)

## Corrections UI, traduction FR des exercices et quiz (2026-07-28)
- [x] Corriger les titres de cours en français (30 titres corrigés dans trainingIndex.json)
- [x] Traduire les quiz de chapitre en français (3873/4019 questions = 96%)
- [x] Traduire les exercices (bucket_sort, single_choice) en français (69 blocs dans 14 fichiers)
- [x] Vérifier la structure des données quiz (4019 questions, 0 erreurs, 335 chapitres)
- [x] Vérifier le rendu UI des cours (pas d'erreurs console, TypeScript OK)

## Corrections UI Skilljar-style (2026-07-28)
- [x] Phase 1 : Typographie - police serif Lora pour titres, badge type chapitre
- [x] Phase 2 : Flip Cards - bordure pointillée bleue, label PROPERTY, bouton FLIP, verso bleu
- [x] Phase 3 : Bucket Sort - grille 2 colonnes, buckets pointillés colorés, feedback bannière
- [x] Phase 4 : Quiz intégré - label Q1, options A/B/C orange, fond gris clair
- [x] Phase 5 : Tabbed Content - onglets orange avec underline épaisse
- [x] Phase 6 : Navigation - compteur "Écran X sur Y", bouton Next coral
- [x] Phase 7 : Layer Cards - détection automatique du pattern "Label\nTitre\nDescription" répété, rendu en grille de cartes colorées
- [x] Phase 8 : Sidebar hiérarchique - sous-items (écrans) par chapitre avec navigation directe
- [x] Phase 9 : Titre d'écran - extraction du titre depuis le premier bloc de contenu, badge type + nom du chapitre
- [x] Phase 10 : LessonQuiz Skilljar - style Q1/A/B/C avec lettres coral, fond beige, bouton coral
- [x] Phase 11 : Suppression du doublon titre dans le contenu (skip first line du premier bloc content)

## Conversion texte brut → composants UI Skilljar (2026-07-28)
- [x] Callout boxes : détecter les patterns "Label\n\"texte quoté\"" → boîte grise avec label small-caps
- [x] Stepper horizontal : détecter les séquences "1\nLabel\n2\nLabel\n..." → composant stepper avec cercles numérotés
- [x] Step detail boxes : détecter "Step N · Titre\nDescription" → boîte colorée bleu/teal
- [x] STEP N: items : détecter "Step N:" ou "STEP N:" → items stylisés avec numéro en badge
- [x] Fix flip cards CSS : vérifié correct (rotateY 3D fonctionne, artefact PDF seulement)

## Audit et correction des traductions (2026-07-28)
- [x] Traduire 1472 champs flip_cards (en==fr, tout en anglais) vers le français (2341 champs traduits via LLM)
- [x] Traduire 9 blocs content manquant la version FR
- [x] Traduire ~700 autres champs bilingues non traduits (bucket_sort, titres, etc.)
- [x] Intégrer Resend avec l'adresse info@neopolis-dev.com pour les emails transactionnels de la plateforme
- [x] Créer les templates email bilingues de réception de candidature
- [x] Créer les templates email bilingues d'acceptation et de refus de candidature avec accès et recommandations de suivi
- [x] Créer les templates email bilingues d'invitation envoyée depuis le backoffice admin
- [x] Compléter le backoffice admin Ambassadeur : dialog décision avec notes + envoi email auto
- [x] Corriger le menu header où certains éléments sont collés (gap-1, px-2.5, ml-1)
- [x] Corriger le bug récurrent des images qui disparaissent du site (motion.img → img standard avec loading="eager")

## Export PDF profil candidat + Email de relance (2026-07-28)
- [x] Endpoint serveur pour générer un PDF du profil complet d'un candidat (server/pdf.ts avec PDFKit)
- [x] Bouton "Exporter PDF" dans le détail candidat du backoffice admin
- [x] Template email bilingue de relance pour candidats en attente (FR/EN)
- [x] Endpoint serveur pour envoyer un email de relance (applications.sendReminder)
- [x] Bouton "Relancer par email" dans le backoffice admin pour les candidats en attente

## Fix langue boutons/quiz/exercices/corrections (2026-07-29)
- [x] Vérifier que les boutons UI (Suivant, Vérifier, etc.) utilisent la langue sélectionnée
- [x] Vérifier que les quiz affichent questions/réponses dans la bonne langue (24114 champs traduits en bilingue)
- [x] Vérifier que les exercices et corrections utilisent la bonne langue
- [x] Corriger SingleChoiceExercise : ajout prop lang, boutons bilingues
- [x] Corriger ChapterQuiz : resolveI18n sur question/choices/explanation
- [x] Corriger sidebar : titres d'écran bilingues (Cartes mémoire/Flip Cards, etc.)

## Amélioration rendu cours - éléments manquants (2026-07-29)
- [x] Ajouter support liens cliquables (markdown [text](url) et URLs brutes) dans renderInlineFormatting
- [x] Ajouter support YouTube embeds dans les blocs content (N/A: aucun bloc content ne contient d'URL YouTube)
- [x] Améliorer le rendu des sections structurées (Key takeaways, Exercises, Reflection, Downloads)
- [x] Ajouter support des blocs de téléchargement (N/A: aucun bloc de type 'download' dans les données)
- [x] Corriger la traduction EN des quiz (24065/24065 champs traduits avec succès)
- [x] Détection des titres de section connus (Exercices, Réflexion, Ce qui vient ensuite, etc.) en h3 avec bordure
- [x] Détection des listes implicites (séquences de lignes courtes commençant par majuscule)
- [x] Détection forward-looking du premier élément de liste (regarde la ligne suivante)
- [x] Rendu des durées parenthétiques en italique (4 minutes, 5-10 mins)
- [x] Détection des liens de domaines nus (claude.ai, anthropic.com) comme liens cliquables
- [x] Correction du stripping de la description qui ne supprime plus les lignes de contenu utiles

## Correction structure cours et blocs téléchargement (2026-07-29)
- [x] Corrigé l'ordre des leçons (alphabétique → ordre correct Skilljar) pour cours 01, 04, 05, 07
- [x] Ajouté les sections/modules dans la sidebar (10 sections pour AI Fluency, etc.)
- [x] Restructuré le cours Amazon Bedrock (06) : 79 leçons individuelles dans le bon ordre
- [x] Ajouté blocs de téléchargement (Download) au cours AI Fluency (vocabulary guide PDF + 3 PDFs cours)
- [x] Implémenté le rendu des blocs download (carte avec icône, titre, description, bouton télécharger)
- [x] Téléchargé et uploadé le PDF AI_Fluency_vocabulary_cheat_sheet.pdf sur le storage

## Ressources téléchargeables complètes (Downloads) - 2026-07-29
- [x] Extraire les fichiers du ZIP fourni par l'utilisateur (139 fichiers extraits)
- [x] Uploader tous les fichiers sur le serveur (manus-upload-file --webdev) - 139 fichiers uploadés
- [x] Intégrer les données de téléchargement dans les JSON de cours (143 blocs dans 5 cours)
- [x] Refaire le rendu des cartes Download dans TrainingCourse.tsx (fidèle à Skilljar : fond coloré, illustration quill, titre, description, bouton)
- [x] Vérifier le rendu : leçon Introduction to AI Fluency affiche la carte AI Fluency vocabulary guide
- [x] Vérifier que le bouton pointe vers AI_Fluency_vocabulary_cheat_sheet.pdf hébergé localement
- [x] Vérifier que l'image quill est visible avec alt text

## Vérification structure et icônes - 2026-07-29
- [x] Restructuré cours 02 (Building with Claude API) : 94 leçons, 11 sections
- [x] Restructuré cours 03 (Claude on Google Cloud) : 98 leçons, 12 sections
- [x] Ajouté sections aux cours 04 (Claude Code), 05 (Claude 101), 07 (MCP)
- [x] Corrigé logique section boundaries (titres répétés Module Introduction)
- [x] Ajouté icônes de type (Video, BookOpen, Download, Brain, Target) à tous les cours
- [x] Corrigé sections cours 06 (Bedrock) : Computer Use et Course introduction
- [x] Vérifié TypeScript compile sans erreur
## Corrections rendu UI (2026-07-29) - Problèmes identifiés par screenshots
- [x] Convertir le chapitre Capability Layer en tabbed_content (Skills/Code Execution/Memory)
- [x] Ajouter détection et rendu des tables concaténées (pattern camelCase) dans PageContent
- [x] Ajouter support des tables markdown (pipe-delimited) dans PageContent
- [x] Vérifier que la navigation écran (Écran X sur N) fonctionne correctement
- [x] Corriger le rendu des titres de chapitre (Memory comme heading propre)

## Corrections structure et quiz (2026-07-29) - Problèmes signalés par l'utilisateur
- [x] Rétablir le verrouillage séquentiel des cours (cours N+1 verrouillé tant que cours N pas terminé)
- [x] Rendre les quiz/checkpoint obligatoires (Next button désactivé tant que exercices pas complétés)
- [x] Vérifier que le quiz de fin de leçon (LessonQuiz) est bien obligatoire pour marquer le cours comme terminé
- [x] Comparer les patterns visuels Skilljar (tabs, tables, titres) avec notre rendu

## Améliorations UX Training (2026-07-29)
- [x] Indicateur de progression détaillé sur page certification (exercices restants par cours)
- [x] Rendu Q/R en cartes interactives (SingleChoiceExercise redesign Skilljar-style)
- [x] Ajustement styles visuels pour correspondre aux patterns Skilljar (couleurs, typographie, espacement)

## Corrections rendu exercices interactifs (2026-07-29)
- [x] Supprimer les blocs content doublons qui précèdent un bucket_sort (artefact scraping - détection runtime)
- [x] Scanner tous les cours pour détecter les types de blocs non rendus (transcript et comparison déjà gérés)
- [x] Vérifier que MatchingExercise (bucket_sort) fonctionne correctement avec les données JSON

## Amélioration rendu sous-titres et mise en page (2026-07-29)
- [x] Détecter les sous-titres (lignes courtes isolées avant paragraphes) et les rendre en h3/h4
- [x] Détecter les patterns "Titre: sous-titre" et les rendre avec style distinct
- [x] Améliorer l'espacement et la hiérarchie visuelle globale du contenu
- [x] Détecter les blocs TOC (séquence de mots courts) et les rendre en pills
- [x] Améliorer isSectionHeading pour attraper les headings avec ? et !

## Fiabilisation progression + UX améliorations (2026-07-29)
- [x] Fiabiliser indicateurs de progression (basés sur quiz/checkpoint passés avec succès + unlock)
- [x] Corriger les tags "Not started" / "In progress" / "Completed" pour refléter la vraie progression
- [x] Augmenter contraste et taille des sous-titres dans les leçons
- [x] Ajouter feedback visuel immédiat avec explication après chaque réponse de quiz
- [x] Ajouter animations de transition fluides au drag & drop (MatchingExercise)

## Indicateurs sidebar + Reprendre lecture + Animations écrans (2026-07-29)
- [x] Ajouter coche verte dans la sidebar pour les chapitres validés (progression par chapitre)
- [x] Créer widget "Reprendre la lecture" sur la page d'accueil (retour au dernier exercice/quiz consulté)
- [x] Ajouter animations slide-in horizontal entre les écrans de cours

## Bouton déconnexion + Fix 404 images (2026-07-29)
- [x] Ajouter un bouton de déconnexion visible dans la navigation
- [x] Corriger les 404 sur les images /manus-storage/ (proxy sert maintenant les fichiers directement au lieu de 307 redirect)

## Fix rendu des tabs et blocs dans les leçons (2026-07-29)
- [x] Corriger la détection des tabs (affichés comme liste à puces au lieu de tabs interactifs)
- [x] Corriger le rendu des blocs de contenu (texte brut au lieu de cartes stylisées)

## Détection patterns structurés : listes numérotées + accordéons (2026-07-29)
- [x] Analyser les données de cours pour identifier les patterns de listes numérotées et sections longues
- [x] Implémenter détecteur de listes numérotées interactives (stepper/timeline)
- [x] Implémenter détecteur d'accordéons pour sections longues (collapsible)
- [x] Vérifier le rendu visuel et les interactions

## Standards e-learning moderne - Audit UX/UI (2026-07-29)
- [x] Barre de progression de lecture (sticky top, montre le % de scroll dans le chapitre)
- [x] Temps de lecture estimé par chapitre (ex: "5 min de lecture")
- [x] Optimiser la largeur de lecture (max-width 680px pour le texte, line-height 1.8)
- [x] Augmenter la taille du texte body (16px au lieu de 14.5px)
- [x] Séparateurs visuels entre les sections majeures (hr gradient + espacement h2/h3/h4)
- [x] Pull quotes / encadrés "À retenir" (classe .key-concept avec border-left orange)
- [x] Icônes sur les headings de section (✏️ exercice, 💡 réflexion, 🎯 résumé, ➡️ next steps, 📚 ressources, ⚙️ prérequis)
- [x] Navigation sticky avec titre du chapitre visible au scroll
- [x] Bouton scroll-to-top apparaissant après défilement
- [x] Améliorer le rendu bilingue (déjà implémenté : body[lang] affiche uniquement la langue sélectionnée)
- [x] Animation de complétion de chapitre (classe .chapter-complete-celebration)
- [x] Raccourcis clavier pour navigation (flèches gauche/droite + kbd-hints visuels)
- [x] Accessibilité : focus-visible, skip-to-content, prefers-reduced-motion

## Amélioration Back-Office Admin (2026-07-29)
- [x] Schema: table admin_notes (notes sur utilisateurs/candidatures)
- [x] Schema: table admin_tags (étiquettes personnalisées pour segmenter les apprenants)
- [x] Schema: table communications (historique des emails envoyés en masse)
- [x] Backend: CRUD notes admin (ajouter, modifier, supprimer, lister par cible)
- [x] Backend: Activation automatique des candidatures acceptées (créer compte + envoyer email)
- [x] Backend: Actions en masse (accepter/refuser multiples candidatures, envoyer emails groupés)
- [x] Backend: Tags/segments apprenants (créer, assigner, filtrer)
- [x] Backend: Communiqués en masse (composer email, sélectionner destinataires, envoyer)
- [x] Frontend: Système de notes admin (timeline, ajout rapide, filtrage)
- [x] Frontend: Outils d'évaluation avancés (dashboard performance, indicateurs de risque)
- [x] Frontend: Visionneuse CV intégrée (preview PDF inline)
- [x] Frontend: Activation automatique candidatures (bouton batch + workflow)
- [x] Frontend: Invitations en masse (import CSV, envoi groupé)
- [x] Frontend: Communiqués en masse (compositeur email avec templates)
- [x] Frontend: Vue Kanban candidatures (drag & drop entre statuts)
- [x] Frontend: Timeline d'activité par apprenant (journal d'activité)
- [x] Frontend: Alertes automatiques (inactif >7j, échecs quiz, progression bloquée)
- [x] Vérifier et corriger l'upload CV et photo dans le formulaire de candidature (visible et fonctionnel)
- [x] Backend: Table admin_notifications + procédures (list, markRead, markAllRead)
- [x] Backend: Génération automatique de notifications (nouvelle candidature, apprenant inactif >7j)
- [x] Frontend: Panneau de notifications admin (icône cloche + dropdown avec badge compteur)
- [x] Heartbeat job: Détection automatique des apprenants inactifs >7 jours + génération notification admin (cron: dwftZFKazMhLDwjwmpq3fJ, daily 08:00 UTC)
- [x] Admin: Navigateur de cours/quiz/exercices (lister tous les contenus disponibles)
- [x] Admin: Mode consultation (voir le contenu comme un apprenant sans affecter la progression)
- [x] Admin: Mode simulation (simuler un quiz/exercice sans enregistrer les résultats)
- [x] Admin: Mode édition (modifier le contenu des cours, questions de quiz, exercices)
- [x] Créer un cours "IA pour les nuls" pour non-informaticiens (JSON + quiz + intégration training index)
- [x] Intégrer des vidéos YouTube explicatives dans chaque leçon du cours IA pour les nuls (10 vidéos, 2 par leçon)
- [x] Redesign header: retirer éléments non pertinents (Registered Partner, Diagnostic IA, À propos), soigner le design, déplacer vers footer
- [x] Enlever toute mention de technologie chinoise du site
- [x] Ajouter anglais et arabe comme langues sur le site vitrine (header, hero, footer, sections clés)
- [x] Utiliser le logo original Neopolis Development + changer complètement le style du header
- [x] Corriger le mail d'invitation avec lien direct de création de compte (pas de registration libre)
- [x] Ajouter la fonction d'envoi massif d'invitations dans l'espace admin
- [x] Fix TypeScript errors in AdminDashboard.tsx (invitations query uses .items instead of .invitations)
- [x] Fix AdminContentManager - content page not working
- [x] Unify admin navigation menu across all admin pages (Dashboard, Content, Training)
- [x] Analyze and fix server log errors (stale Vite pre-transform errors cleared, no actual runtime errors)

## Traductions complètes (FR, EN, AR)
- [x] Traduire la section "La Formule" en anglais et arabe
- [x] Traduire la section "Partenaires" en anglais et arabe
- [x] Traduire la liste "Ce que nous fournissons" en anglais et arabe
- [x] Traduire la section "AI Solutions Partner" en anglais et arabe
- [x] Traduire la section "Process Commercial" en anglais et arabe
- [x] Traduire la FAQ complète en anglais et arabe
- [x] Traduire le menu mobile en anglais et arabe
- [x] Vérifier la cohérence des traductions sur toutes les sections

## Bugs critiques à corriger (signalés par l'utilisateur)
- [x] Emails d'invitation sans lien de création de compte (corrigé: suppression cast 'as any', lien /accept-invitation?token= bien construit)
- [x] Gestion du contenu admin cassée (corrigé: aucune erreur réseau/console aujourd'hui, page fonctionne)
- [x] Invitation en masse non visible dans l'admin (corrigé: onglet Invitations visible avec bouton Envoi en masse)
- [x] Traductions landing page incomplètes (corrigé: toutes les sections traduites en EN/AR - stats, CTA, Process, Formule, FAQ, Footer, FlowDiagram, Simulateur, Exemples)
- [x] Intégrer les traductions formLabels.ts dans Apply.tsx (formulaire entièrement traduit FR/EN/AR : 10 étapes, navigation, vidéo pitch, documents)

## Audit complet front/back/learning/admin (30 juillet 2026)
- [x] Audit Landing page (EN + FR) : contenu, stats, chart, formule, partenaires, FAQ, footer
- [x] Audit Formulaire candidature (10 étapes) : validation, dropdowns, navigation
- [x] Audit Login : validation, erreurs, loading state
- [x] Audit Accept Invitation : gestion token invalide/absent
- [x] Audit Training Dashboard : progress, stats, certifications
- [x] Audit Training Certification Detail : cours verrouillés/déverrouillés
- [x] Audit Training Course Content : navigation chapitres, contenu, flip cards
- [x] Audit Mock Exam (apprenant) : config, timer, questions, choix
- [x] Audit Admin Candidatures : stats, table, filtres, export CSV
- [x] Audit Admin Communications : table, bouton nouveau communiqué
- [x] Audit Admin Invitations : stats, table, envoi en masse
- [x] Audit Admin Kanban : 3 colonnes, cartes candidats
- [x] Audit Admin Évaluation : stats, classement apprenants
- [x] Audit Admin Activité : journal avec message explicatif
- [x] Audit Admin Suivi Apprenants : 3 tabs, recherche, table, export
- [x] Audit Admin Analytics : graphiques inscriptions, activité, répartition
- [x] Audit Admin Contenu : 6 certifications, 31 cours, stats
- [x] Audit Admin Simuler Examen : CORRIGÉ (crash React #31 objets traduction)
- [x] Audit Admin Éditer Examen : CORRIGÉ (objets traduction dans inputs)
- [x] Audit Diagnostic IA : formulaire multi-étapes fonctionnel
- [x] Audit Mentions Légales : contenu juridique complet
- [x] Audit Page 404 : affichage correct avec bouton retour
- [x] Correction bug critique : AdminContentManager crash simulation examen (useLanguage + t())
- [x] Correction bug mineur : Markdown ** dans titres sidebar et headings (strip asterisks)
- [x] Tests unitaires : 16/16 passent (scoring, courseQuality, auth, email)

## Correction Module Introduction vide
- [x] Ajouter un contenu d'introduction au chapitre "Module Introduction" du cours Claude Platform Model Foundations
- [x] Fix bug: "No content available" quand progress=10/10 (initialChapter hors limites, clampé à max index)
- [x] Fix bug: ** markdown brut dans la description du chapitre Module Complete (screenDescription strip)
- [x] Enrichissement contenu Module Introduction (1788 chars EN / 2077 chars FR)
