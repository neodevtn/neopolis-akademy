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

## Bugs signalés (30 juillet 2026)
- [x] Bug chiffres page d'accueil : les stats (300M, 92M, 30%, 220 Milliards $) affichent 0 sur mobile (fix: margin 0px + fallback 3s)
- [x] Bug rôle admin : le compte apprenant demo a accès admin (rôle promu pendant l'audit, remis en user via SQL)

## Bug crash admin consultation/édition cours (30 juillet 2026)
- [x] Fix TypeError: body?.replace is not a function dans AdminContentManager (resolveBody helper + tous block types)
- [x] Fix crash édition exercices admin (typeof checks pour exercise edit dialog)
- [x] Ajout renderers manquants: text, single_choice_exercise, bucket_sort, comparison, tabbed_content, download
- [x] Fix exercises rendering: title, prompt, instructions avec resolveBody()
- [x] Backend Zod schemas élargis pour accepter string | {en,fr} (updateQuizzes, updateMockExamQuestion, addMockExamQuestion, updateExercise)
- [x] Fix TypeScript errors: z.record(z.string()) -> z.record(z.string(), z.string()) pour Zod v4

## Onglets EN/FR dans les dialogues d'édition admin
- [x] Ajouter onglets EN/FR dans le dialogue d'édition des questions d'examen mock
- [x] Ajouter onglets EN/FR dans le dialogue d'édition des quiz
- [x] Ajouter onglets EN/FR dans le dialogue d'édition des exercices
- [x] Ajouter onglets EN/FR dans le dialogue d'édition des blocs de contenu (body)
- [x] Anglais comme langue par défaut (fallback si pas de traduction FR)
- [x] Helpers getI18n/setI18n pour normalisation string <-> {en,fr}

## Bug images disparaissent en navigation normale (31 juillet 2026)
- [x] Fix: créer /api/assets/ proxy custom qui pipe les fichiers directement (bypass platform 307 redirect)
- [x] Fix: migrer toutes les refs frontend de /manus-storage/ vers /api/assets/
- [x] Fix: storage.ts retourne /api/assets/ pour les nouveaux uploads
- [x] Fix: /manus-storage/ redirige 301 vers /api/assets/ pour compatibilité DB existante
- [x] Cache-Control: max-age=3600, must-revalidate (au lieu de 1 an immutable via CloudFront)

## Chapitres Tutoriels vidéo YouTube (31 juillet 2026)
- [x] Ajouter chapitre Tutoriels à la fin de chaque cours Developer Foundations (5 cours)
- [x] Ajouter chapitre Tutoriels à la fin de chaque cours Architect Foundations (7 cours)
- [x] Ajouter chapitre Tutoriels à la fin de chaque cours Architect Professional (5 cours)
- [x] Vidéos YouTube pertinentes et pratiques pour chaque module
- [x] Pas de quiz dans les chapitres tutoriels

## Enrichissement tutoriels + correction compteurs (31 juillet 2026)
- [x] Enrichir les chapitres tutoriels avec 5-8 vidéos YouTube par cours (au lieu de 3)
- [x] Mettre à jour lessonCount dans trainingIndex.json pour refléter les nouveaux chapitres
- [x] Mettre à jour totalVideos dans trainingIndex.json pour chaque certification
- [x] Mettre à jour le champ videos[] dans chaque cours de trainingIndex.json
- [x] Ajouter compteur totalDownloads par certification dans trainingIndex.json
- [x] Afficher le compteur downloads dans l'UI (TrainingCertification, TrainingDashboard, AdminContentManager)
- [x] Corriger le curseur pointer sur l'élément "Don't suffer the disruption" (ce n'est pas un bouton)
- [x] Transformer la section 5 étapes Ambassador en stepper horizontal interactif (pastilles cliquables)
- [x] Corriger le problème de contraste titre/fond dans cette section
- [x] Corriger les caractères unicode échappés (\u00b7 et \u2192) affichés littéralement
- [x] Refaire le diagramme "Project workflow" : couleurs adaptées au thème, flèches entre étapes, design dynamique compact
- [x] Refaire la section "Concrete project examples" : afficher titre + ROI client seulement, bouton "Afficher plus" pour déplier les détails
- [x] Refaire la section "Our Technology Partners" : plus compacte, meilleure présentation, moins d'espace vertical
- [x] Ajouter des vidéos anglaises équivalentes dans "IA pour les nuls" (garder FR, ajouter EN)
- [x] Supprimer blocs "Tech ecosystem" et "What we provide", améliorer design Anthropic/Claude
- [x] Réduire les espaces verticaux excessifs entre les sections de la landing page
- [x] Supprimer le lien "Diagnostic IA" du footer (accessible uniquement aux utilisateurs authentifiés)
- [x] Afficher une seule vidéo par page (pas deux vidéos sur le même écran)
- [x] Implémenter YouTube IFrame API Player avec détection auto 80% visionnage
- [x] Bouton "Marquer comme vue" en fallback manuel
- [x] Bloquer le bouton "Suivant" tant que la vidéo n'est pas marquée comme vue

## Diagnostic IA Avancé — BPMN + Recommandations détaillées (31 juillet 2026)
- [x] Créer la page AdvancedDiagnosticIA.tsx avec designer de processus BPMN
- [x] Permettre la décomposition en sous-processus et traitements unitaires
- [x] Pour chaque traitement unitaire : formulaire d'évaluation détaillé (type de données, volume, complexité)
- [x] Moteur de recommandation IA ultra-détaillé par traitement :
  - [x] Modèle exact recommandé (Claude Sonnet 4, Haiku, Opus, avec/sans extended thinking)
  - [x] Mode d'utilisation (Claude.ai chat, API directe, SDK Python/TS, Claude Code CLI, Bedrock, Vertex AI, Computer Use)
  - [x] Architecture (appel simple, chaîne de prompts, agent autonome multi-étapes, RAG, fine-tuning/customisation)
  - [x] Niveau d'autonomie (humain dans la boucle, supervision légère, autonome complet)
  - [x] Estimation RAG si nécessaire (volume docs, type embeddings, stratégie chunking)
  - [x] Estimation fine-tuning si nécessaire (dataset, coût, délai)
  - [x] Estimation coûts (tokens/mois, coût API mensuel, infrastructure)
- [x] Vue projection post-implémentation : redesign du processus global après IA
- [x] Estimation des gains probables (temps, coût, qualité, satisfaction)
- [x] Enregistrer route /diagnostic-avance (protégée, auth requise)
- [x] Lien depuis le TrainingDashboard vers le diagnostic avancé

## Fix: Incohérence des stats et ajout vidéos YouTube
- [x] Analyser et corriger l'incohérence des compteurs entre niveaux (dashboard/certification/cours/leçon)
- [x] Identifier les sources de données hardcodées dans TrainingCertification.tsx et TrainingCourse.tsx
- [x] Unifier la logique de comptage : tous les niveaux doivent calculer depuis le contenu réel
- [x] Rechercher et intégrer des vidéos YouTube récentes pour les 10 nouvelles certifications
- [x] Ajouter des blocs vidéo (cours principal + vidéos complémentaires + tutoriels) dans les fichiers de cours
- [x] Recomputer les stats à tous les niveaux et vérifier la cohérence

## Système de recommandation vidéos complémentaires
- [x] Créer une base de données de vidéos YouTube complémentaires par thème/sujet
- [x] Créer le composant VideoRecommendations (section en fin de leçon)
- [x] Intégrer le composant dans TrainingCourse après le dernier chapitre de chaque leçon
- [x] Afficher 3-5 vidéos recommandées par leçon (titre, durée, type: tutoriel/complémentaire/avancé)
- [x] Système de matching par mots-clés du contenu de la leçon

## Feedback vidéo recommandations - Bouton "Pas pertinent / Obsolète"
- [x] Créer la table video_feedback en base de données (userId, videoId, lessonId, reason, createdAt)
- [x] Créer l'endpoint tRPC pour soumettre un feedback vidéo
- [x] Ajouter le bouton "Pas pertinent" sur chaque carte de recommandation vidéo
- [x] Filtrer les vidéos signalées par l'utilisateur dans les recommandations futures
- [x] Afficher un feedback visuel (toast) après signalement

## Redesign badges flottants hero
- [x] Remplacer les badges "Certification CCA" et "Certification internationale" (wise-card blanc/bordure) par des pills gradient modernes (vert gradient + violet gradient, texte blanc, rounded-full, shadow)

## Refonte charte graphique — Harmonie avec le logo Neopolis
- [x] Mettre à jour les CSS variables (--wise-primary → bleu marine, supprimer tint-coral/cyan/pear)
- [x] Remplacer tous les fonds colorés (tint-*) par blanc/slate-50/bleu-pâle dans Home.tsx
- [x] Unifier les icônes en slate-400 ou bleu marine (supprimer coral, cyan, pear, lime)
- [x] Refaire les badges/pills en bleu marine + rouge carmin uniquement
- [x] Refaire les graphiques Chart.js en bleu marine + gris
- [x] Refaire la section CTA finale en bleu marine fond + texte blanc
- [x] Vérification visuelle complète

## Harmonisation finale landing page — badges et composants restants
- [x] Remplacer wise-badge-positive (fond vert) par fond bleu marine pâle
- [x] Remplacer wise-card-green (fond vert) par fond bleu marine pâle
- [x] Remplacer toutes les références wise-primary par neo-primary dans Home.tsx
- [x] Corriger le badge Certification CCA (gradient vert → bleu marine)
- [x] Corriger la carte "Reprendre la lecture" (fond vert/hue 145 → bleu hue 255)
- [x] Supprimer la dernière occurrence de hue 145 (chevron vert)
- [x] Vérification visuelle complète de la landing page

## Fix logo Claude cassé
- [x] Remplacer l'image cassée du logo Claude (logo_claude_ai_48b660b5.png) par le logo officiel Claude (icône app arrondie)

## Fix images + Optimisation + Parallax
- [x] Diagnostiquer le problème d'affichage des images en production (CDN convertit PNG→WebP, mismatch MIME type)
- [x] Re-uploader les images en format JPEG natif pour compatibilité navigateur
- [x] Optimiser le poids des images (4.2 MB → 51-110 KB par image, réduction de 95%)
- [x] Ajouter un effet parallax subtil (useScroll + useTransform) sur l'image "Devenez AI Solutions Partner"
- [x] Ajouter un glow background blur derrière l'image parallax pour la profondeur

## Remplacement graphique orbital hero
- [x] Générer une illustration 3D isométrique professionnelle (escalier de progression IA, bleu marine)
- [x] Remplacer le graphique orbital SVG animé par l'illustration statique
- [x] Supprimer le composant NetworkGraph inutilisé
- [x] Optimiser l'image (42 KB, 800x600)
- [x] Conserver les badges flottants "Certification CCA" et "Certification internationale"

## Refonte graphique orbital hero (animation)
- [x] Recréer le graphique orbital animé avec palette bleu marine
- [x] Orbites circulaires propres (2 anneaux concentriques)
- [x] Nœuds avec lettres sur fond coloré (dégradé bleu marine)
- [x] Logo Neopolis au centre avec ombre douce
- [x] Animations fluides : rotation conic-gradient, flottement des nœuds, dots circulants
- [x] Badges flottants "Certification CCA" et "Certification internationale" conservés

## Refonte UX/UI Training Dashboard (simplification)
- [x] Supprimer la grille de 16 mini-barres de progression du haut (trop dense)
- [x] Ajouter des onglets de navigation (Mon Parcours / Catalogue / Parcours recommandé)
- [x] Onglet "Mon Parcours" : progression globale + widget reprise lecture + prochaine étape
- [x] Onglet "Catalogue" : cartes de certifications avec filtres par catégorie
- [x] Onglet "Parcours recommandé" : ordre d'étude séquentiel clair
- [x] Simplifier la barre de stats (intégrer dans l'onglet catalogue)
- [x] Guidance "Commencez ici" pour les nouveaux utilisateurs (0% progression)
- [x] Supprimer la redondance entre section progression et ordre d'étude

## YouTube IFrame Player API + Navigation verrouillée
- [x] Créer composant YouTubePlayer avec API IFrame Player (pas simple iframe)
- [x] Détecter automatiquement 80%+ de visionnage via onStateChange + getCurrentTime
- [x] Auto-marquer la vidéo comme vue quand 80% atteint
- [x] Garder le bouton "Marquer comme vue" en fallback manuel
- [x] Bloquer le bouton "Suivant" tant que la vidéo du chapitre n'est pas marquée comme vue
- [x] Afficher une barre de progression de visionnage sous la vidéo
- [x] Afficher un message explicatif quand le bouton Suivant est bloqué

## Mélanger les réponses au retry
- [x] SingleChoiceExercise : shuffledOptions state + Fisher-Yates sur handleReset
- [x] ChapterQuiz : useMemo shuffled choices dépendant de attemptCount + currentQ
- [x] ExerciseRenderer : shuffledOptions state + shuffle on handleReset pour single/multi/checklist
- [x] LessonQuiz : useMemo shuffledChoices dépendant de q.id + currentQ + attemptCount

## Fix progression non affichée sur le dashboard
- [x] Fix getCompletedUnits : retourner fraction (chapterIndex/totalChapters) pour cours single-lesson
- [x] Fix isLessonComplete : gérer correctement les cours single-lesson avec chapter progress
- [x] Fix getNextUnlockedLesson : gérer correctement les cours single-lesson
- [x] Fix TrainingCertification : utiliser getChapterProgress pour le calcul par cours

## Bloquer navigation si flip cards non retournées et exercices non faits
- [x] FlipCardsGrid : ajouter callback onAllFlipped quand toutes les cartes ont été vues au moins une fois
- [x] TrainingCourse : tracker les flip cards complétées par chapitre
- [x] TrainingCourse : gater le bouton Next si flip cards non toutes retournées
- [x] TrainingCourse : gater le bouton Next si exercices (exercise blocks) non complétés
- [x] TrainingCourse : bloquer aussi la navigation clavier (ArrowRight) quand gaté
- [x] MatchingExercise : passer onComplete depuis TrainingCourse pour tracker la complétion

## Stabilité & Monitoring
- [x] Tester toutes les certifications (Developer, Architect) pour crashes
- [x] Ajouter un monitoring d'erreurs côté client (ErrorReporter)
- [x] Configurer ESLint avec react-hooks/rules-of-hooks
- [x] Extraire ProcessStepper en composant propre (fix hooks-in-callback)

## Dashboard Erreurs & Corrections ESLint
- [x] Dashboard admin "Erreurs client" (graphique temporel + liste filtrable)
- [x] Corriger warnings exhaustive-deps (TrainingCourse.tsx + Home.tsx)
- [x] Résoudre duplicate key chapter_13 (Architect Professional) - 627 chapitres corrigés

## Persistance Erreurs & Cleanup
- [x] Persister les erreurs client en base de données (table client_errors)
- [x] Nettoyer les unused imports (TrainingCourse.tsx, Home.tsx) - 25+ warnings résolus

## Détail Candidature
- [x] Ajouter vue détail candidature en cliquant sur une ligne du tableau (modale)

## Audit - Actions Critiques
- [x] Code-splitting React.lazy pour toutes les routes (15 pages lazy-loaded)
- [x] Ajouter 7 index de base de données manquants (déjà existants via migrations SQL)
- [x] Optimiser getApplicationStats avec requête agrégée SQL (GROUP BY status)
- [x] Décomposer TrainingCourse.tsx en sous-composants (3808→637 lignes + 5 sous-fichiers)

## Tests, Lazy-loading & Sécurité
- [x] Tests unitaires pour sous-composants extraits (contentDetectors) - 24 tests ajoutés
- [x] Lazy-loading des données JSON de cours (cache mémoire + prefetch cours suivant)
- [x] Header CSP renforcé (unsafe-eval retiré en prod, base-uri, form-action, HSTS)

## Performance & Tests d'intégration
- [x] Script Lighthouse automatisé avec rapport de performance (pnpm lighthouse)
- [x] Tests d'intégration API pour endpoints tRPC admin (25 tests - 65 total)

## Authentification Email/Mot de passe
- [x] Ajouter champs password_hash et reset_token au schéma DB
- [x] Créer endpoints login, register, forgot-password, reset-password
- [x] Pages frontend : Login, Register, Forgot Password, Reset Password
- [x] Email de récupération de mot de passe (lien avec token)
- [x] Intégrer avec le flux d'acceptation candidat (création compte auto)

## Intégration Sentry (Monitoring)
- [x] Créer le projet neopolis-akademy sur l'instance Sentry self-hosted (sentry.neopolis-dev.com)
- [x] Installer @sentry/react SDK
- [x] Configurer le suivi des bugs (Error Monitoring)
- [x] Configurer le suivi des performances (Browser Tracing, tracesSampleRate: 1.0)
- [x] Configurer Session Replay (replaysOnErrorSampleRate: 1.0)
- [x] Configurer le widget User Feedback (labels en français)

## Améliorations Sentry
- [x] Ajouter le contexte utilisateur (Sentry.setUser) quand l'utilisateur est connecté
- [x] Ajuster tracesSampleRate à 0.2 en production (garder 1.0 en dev)
- [x] Personnaliser le style du widget feedback pour s'intégrer au design du site

## Analyse Monitoring & Corrections
- [x] Analyser les logs Sentry (aucune erreur capturée - projet récent)
- [x] Analyser les logs de production (pas d'erreurs critiques, seulement "Missing session cookie" normal)
- [x] Analyser les logs dev server (erreurs historiques déjà corrigées)
- [x] Analyser les logs console navigateur (duplicate key chapter_13 déjà corrigé le 2 août)
- [x] Corriger la fuite du passwordHash dans la réponse auth.me (SÉCURITÉ)

## Rate Limiting Auth Endpoints
- [x] Ajouter rate limiting sur POST /api/auth/login (max 5 tentatives par IP par 15 min)
- [x] Ajouter rate limiting sur POST /api/auth/forgot-password (max 3 requêtes par IP par 15 min)

## Header Button Conditionnel
- [x] Bouton bleu header : "Se connecter" pour utilisateurs non connectés, "Formation" pour utilisateurs connectés

## Forgot Password - Fallback Invitation pour candidats acceptés
- [x] Modifier forgot-password pour chercher dans applications (status=selectionne) si email pas trouvé dans users
- [x] Envoyer automatiquement une invitation si candidat accepté sans compte

## Sentry Backend (Node.js/Express)
- [x] Installer @sentry/node
- [x] Initialiser Sentry côté serveur via --import (ESM pattern)
- [x] Configurer le tracing Express pour capturer les transactions backend
- [x] Configurer le error handler Express (setupExpressErrorHandler)

## Intégration Cours BI (Analyse de données, reporting et BI avec Codex)
- [x] Créer le groupe "bi_data_analytics" dans GROUP_CONFIG
- [x] Créer la certification "analyse_donnees_reporting_bi_codex" dans trainingIndex.json
- [x] Créer les 8 fichiers JSON de cours (modules 01-08) avec 4 leçons chacun
- [x] Enregistrer les 8 cours dans trainingIndex.json
- [x] Tester l'affichage dans le dashboard formation
- [x] Corriger le bug de déploiement (dist/index.js path avec esbuild)
## Fix React Crash + Sentry Replay
- [x] Corriger violation Rules of Hooks (useEffect après return conditionnel) dans TrainingCourse.tsx
- [x] Désactiver le masquage de texte dans Sentry Session Replay (maskAllText: false, blockAllMedia: false, maskAllInputs: false)
- [x] Ajouter trust proxy pour corriger le rate limiter derrière Cloud Run/reverse proxy

## Fix exercices bucket_sort cassés
- [x] Corriger les 29 exercices bucket_sort avec catégories invalides et correctBucket vides
- [x] Vérifier 0 exercices cassés restants

## Suivi candidats sélectionnés + Délivrabilité email (04 août 2026)
- [x] Ajouter colonnes email_delivery_status et resend_message_id dans la table user_invitations
- [x] Créer endpoint tRPC admin.getSelectedCandidates (vue dédiée candidats sélectionnés avec statut activation)
- [x] Créer endpoint admin.updateCandidateEmail (modification email d'un candidat)
- [x] Créer endpoint admin.resendInvitationForCandidate (renvoi invitation après correction email)
- [x] Implémenter webhook Resend pour tracker bounced/delivered/opened
- [x] Créer la vue admin "Candidats sélectionnés" avec tableau : nom, email, statut compte, statut email, actions
- [x] Ajouter la modification d'email inline dans la vue admin
- [x] Ajouter bouton "Renvoyer invitation" par candidat
- [x] Ajouter indicateurs visuels : compte créé (vert), invitation envoyée (orange), email invalide (rouge), en attente (gris)
- [x] Dashboard délivrabilité : compteurs emails envoyés/délivrés/rebondis

## Correction cours "Analyse de données, reporting et BI avec Codex" (04 août 2026)
- [x] Générer les 13 fichiers CSV de données de test (seed=20260804)
- [x] Générer les dumps SQL (OLTP, DW, star schema, faulty marts, expected results, data quality assertions)
- [x] Uploader tous les fichiers de données et obtenir les URLs
- [x] Réécrire les exercices/TP de chaque module avec présentation structurée et liens de téléchargement
- [x] Ajouter les fichiers de solutions (solution_lab_01 à solution_lab_07 + final)
- [x] Vérifier le rendu visuel des exercices corrigés

## Exercices à réponses numériques déterministes (cours BI Codex)
- [x] Calculer toutes les réponses numériques de référence à partir des CSV (CA net, marges, taux, etc.)
- [x] Reformater les exercices pour demander des valeurs numériques précises (avec tolérance)
- [x] Stocker les réponses attendues dans les JSON de cours (champ answers)
- [x] Créer un composant UI de saisie de réponse numérique avec validation
- [x] Intégrer la validation côté serveur (comparer réponse candidat vs réponse attendue avec tolérance)
- [x] Enregistrer les résultats en base de données (score par exercice)

## Correction marges et taux de change fixes (cours BI Codex)
- [x] Corriger les prix produits en MAD/TND pour obtenir des marges réalistes (36-37%)
- [x] Fixer les taux de change de référence dans les énoncés (1 EUR = 10.90 MAD, 3.35 TND, 1.47 CAD, 1.08 USD)
- [x] Recalculer toutes les réponses de référence avec les données corrigées
- [x] Mettre à jour les JSON de cours avec les nouvelles réponses et taux fixes
- [x] Re-uploader les fichiers CSV/SQL corrigés

## Boutons de téléchargement cours BI
- [x] Remplacer les liens markdown bruts par des boutons de téléchargement visuels dans le LessonViewer

## Correction lisibilité exercices
- [x] Corriger le rendu des exercices type "exercise" : espacement entre paragraphes, titre complet non tronqué

## Bug: Impossible de passer à la page suivante après exercice complété
- [x] Corriger la logique de validation qui bloque le bouton "Suivant" même quand l'exercice est complété (4/4)

## Bug: Exercices manquent de consignes et correction incohérente
- [x] Examiner la structure des exercices type "exercise" dans les cours Developer Foundations
- [x] Ajouter des consignes explicites aux exercices qui en manquent (nettoyage pollution 31 exercices + 41 blocs)
- [x] Corriger la correction affichée qui ne correspond pas à la question posée (correction était en fait cohérente après nettoyage)
- [x] Séparer correctement le contenu du chapitre de l'exercice (titre "Reveal model answer" supprimé de 20 fichiers)

## Refonte panneau monitoring erreurs admin
- [x] Filtrer les erreurs de build (Failed to fetch dynamically imported module) — ne plus les catcher
- [x] Afficher les erreurs dans un tableau (colonnes: date, type, message, URL, actions)
- [x] Ajouter un bouton Supprimer par ligne pour permettre à l'admin de marquer comme résolu
- [x] Persister la suppression côté serveur (endpoint tRPC)

## Bug: Stepper interactif non cliquable
- [x] Rendre les étapes numérotées (cercles 1-6) cliquables dans les cours
- [x] Afficher le contenu de l'étape sélectionnée sous le stepper
- [x] Mettre en surbrillance l'étape active

## Amélioration rendu prompt exercices
- [x] Parser le prompt pour détecter les blocs System:/User:/Broken prompt/ticket
- [x] Afficher System: et User: dans des blocs code stylisés
- [x] Afficher le contenu <ticket>...</ticket> dans un encadré distinct
- [x] Séparer visuellement les consignes (texte normal) du contenu technique
- [x] Supprimer la duplication du titre dans le prompt quand il est identique au title

## Nettoyage exercices parasites et checkpoints redondants
- [x] Supprimer 79 exercices parasites (Model answer, correct/incorrect, Pass/Retry) dans 14 fichiers
- [x] Supprimer 23 checkpoint blocks redondants dans chapitres ayant déjà un bucket_sort
- [x] Corriger le bug Screen 6 (Extended Thinking affiché comme free_text au lieu de bucket_sort)

## Bug: Tableau mal organisé + contenu qui suit
- [x] Première colonne du tableau trop étroite (mots coupés: "In-cont ext mem ory") - fix: whitespace-nowrap + min-width sur col 1
- [x] Contenu après le tableau collé sans espacement (4ème ligne manquante) - fix: détection punct+uppercase en plus de camelCase

## Bug: Vidéos YouTube non lisibles dans la page
- [x] La vidéo affiche un écran noir au lieu du player YouTube embed - fix: ajout https://www.youtube.com au script-src CSP
- [x] L'utilisateur est obligé de cliquer "Watch on YouTube" pour voir la vidéo - fix: le YouTube IFrame API peut maintenant se charger

## Bug: Exercice non valide (model answer affiché comme prompt)
- [x] Exercice ex_006 orphelin (chapter_06 inexistant) affichait la correction comme question
- [x] Suppression de 55 exercices orphelins dans 9 fichiers de cours (chapterId inexistant)
- [x] Nettoyage du texte 'Reveal model answers' dans les blocs de contenu

## Import cours DataCamp n8n dans catégorie BI
- [x] Upload des 8 vidéos MP4 + 3 slides PDF + 1 image via manus-upload-file
- [x] Générer le fichier JSON du cours (3 chapitres, 32 activités)
- [x] Intégrer les 10 vidéos avec transcripts FR segmentés
- [x] Transformer les 17 CloudExercise en TP autonomes avec préparation environnement n8n
- [x] Construire les 3 exercices DragAndDrop interactifs
- [x] Construire les 2 QCM interactifs avec corrections masquées
- [x] Enregistrer le cours dans l'index certifications (catégorie BI)
- [x] Tester le rendu et déployer
- [x] Rapport de vérification avec compteurs

## Correction TP n8n — Audit apprenant
- [x] Étapes TP vides (affichent "1 2 3 4" sans texte) → fix: lecture du champ instructions_text des steps
- [x] Critères d'évaluation bruts (<exercise_objective>, <grading_rules>, PASS/FAIL) visibles → fix: extractLearnerObjectives() parse required_elements en bullets propres
- [x] Appliquer à tous les 17 TP/labs → fix global via composant CloudExerciseBlock
- [x] Re-auditer production activité 2/9 → vérifié OK (4 steps détaillés, 2 bullets propres, aucun tag XML visible)

## Audit médias production — 2 vidéos sans MP4
- [x] Upload 2 MP3 (ch03_ex08 + ch03_ex12) via manus-upload-file --webdev
- [x] Mettre à jour le JSON avec audioUrl pour ces 2 blocs
- [x] Adapter le composant vidéo pour afficher lecteur audio + transcript + slides quand audioUrl existe et mp4Url absent
- [x] Audit HTTP de tous les liens /manus-storage (8 MP4 + 2 MP3 + 3 PDF + 1 PNG = 14 liens) → 14/14 HTTP 200
- [x] Tableau d'audit dans le rapport final

## Correction compteurs fiche cours n8n
- [x] Remplacer "22 exercices" par "32 activités" dans trainingIndex.json
- [x] Ajouter breakdown visible sur la fiche: 10 vidéos · 17 TP pratiques · 3 tris interactifs · 2 QCM · 3 téléchargements
- [x] Carte cours: 3 chapitres · 32 activités · 10 vidéos · 3 téléchargements
- [x] Vérifier la fiche publique après publication → confirmé OK: 32 activités + breakdown + carte cours correct

## Correction player vidéo/audio + PDF + UI ✓ Vue
- [x] Diagnostiquer ERR_BLOCKED_BY_CLIENT sur /manus-storage → cause: platform edge intercepte /manus-storage/ et redirige vers CloudFront signé, extensions bloquent
- [x] Corriger le proxy storage pour supporter Range requests + Content-Type exact → /api/assets/ avec HTTP 206, Accept-Ranges: bytes, MIME par extension
- [x] Corriger le markup vidéo (<video controls preload="metadata" playsinline><source src type="video/mp4">)
- [x] Corriger le markup audio (<audio controls preload="metadata"><source src type="audio/mpeg">)
- [x] Corriger les liens PDF (ouverture/téléchargement via /api/assets/ sans ERR_BLOCKED_BY_CLIENT)
- [x] Corriger l'artefact UI "✓ Vue" → utilise t() pour afficher proprement
- [x] Tester la lecture réelle en production → 14/14 HTTP 200, Range 206 OK
- [x] Rapport de vérification technique complet

## Lecteur hybride Projector (slides synchronisées)
- [x] Injecter slideDeckData (slides + timings) dans le JSON du cours pour les 8 vidéos MP4
- [x] Créer le composant ProjectorPlayer (audio + panneau slide synchronisé)
- [x] Intégrer dans LessonViewer (détection projectorSlides → lecteur hybride)
- [x] Slide 1 visible à t=0 (titre + instructeur + technologie n8n)
- [x] Navigation slides (dots + boutons prev/next)
- [x] Barre de progression + seek
- [x] Conserver transcripts + Slides PDF + progression

## Correction images Projector cassées (suffixe DataCamp =XX)
- [x] Nettoyer 28 suffixes de sizing dans le JSON (regex /\s+=\d+$/)
- [x] Ajouter cleanImageUrl() défensif dans ProjectorPlayer
- [x] Ajouter loading="lazy" decoding="async" sur toutes les images
- [x] Vérifier 36/36 images HTTP 200 (avec -L pour redirections)
- [x] Déployer en production

## Défauts bloquants parcours n8n (audit apprenant)
- [x] Gate Suivant pour cloud_exercise (TP) : bouton désactivé tant que non validé
- [x] Gate Suivant pour bucket_sort et single_choice : déjà implémenté
- [x] validatedChapter avance systématiquement quand Next est cliqué (tous gates passés)
- [x] Carte catalogue : affiche chapitres + activités + vidéos + téléchargements quand breakdown existe
- [x] TP collapsible : instructions/préparation dans un details/summary pliable
- [x] Cohérence progression : bouton Leçon terminée gatéé appelle onComplete -> markLessonComplete -> avance auto

## Bibliothèque de blocs v2 (consolidation LMS)
- [x] Créer le registre centralisé BlockRegistry (shared/blockRegistry.ts) — 25 types documentés
- [x] Implémenter CalloutBlock (encadrés info/tip/warning/danger/success)
- [x] Implémenter MatchingBlock (association par glisser-déposer)
- [x] Implémenter FillBlankBlock (texte à trous avec validation)
- [x] Implémenter TerminalSimBlock (simulation de terminal CLI multi-étapes)
- [x] Implémenter CodeReplBlock (éditeur de code interactif Python/JS/TS/SQL)
- [x] Implémenter OrderingBlock (remise en ordre par drag-and-drop)
- [x] Implémenter AiEvaluationBlock (évaluation IA des réponses libres via LLM)
- [x] Implémenter MultiChoiceBlock (QCM choix multiples avec feedback)
- [x] Intégrer les 8 nouveaux blocs dans le switch case de LessonViewer
- [x] Ajouter la procédure evaluateAnswer (backend LLM Claude Sonnet)
- [x] Créer le composant BlockLibrary (éditeur admin visuel avec palette catégorisée)
- [x] Intégrer BlockLibrary dans AdminContentManager (mode edit remplace JSON brut)
- [x] Vérifier la rétrocompatibilité avec les 80+ cours existants

## Correction compteur de chapitre dans la progression
- [x] Corriger le compteur de chapitre courant pour éviter les valeurs hors borne (ex. 7/6 au lieu de 1/6)
- [x] Vérifier le calcul dans la sidebar et la barre de progression du cours concerné

## Correction e-mail d’invitation
- [x] Corriger l’affichage du bouton « Accepter l’invitation » avec un HTML compatible clients e-mail
- [x] Vérifier la visibilité et le lien de secours du CTA dans le modèle HTML et via un test unitaire dédié

## Pilote éditeur de cours — n8n
- [x] Capturer les références visuelles avant modification du cours et de son éditeur
- [x] Cartographier les blocs, médias et checkpoints du cours pilote de manière rétrocompatible
- [x] Ajouter la bibliothèque médias au mode visuel de l’éditeur
- [x] Ajouter le mode avancé d’édition structurée avec validation et aperçu
- [x] Créer l’interface spécifique aux checkpoints et à la banque de questions pilote
- [x] Tester l’éditeur et le rendu apprenant sans régression
- [x] Capturer et comparer les références visuelles après modification sur desktop et mobile

## Régressions bloquantes de l’éditeur de contenu
- [x] Corriger le changement infini à l’ouverture du cours dans l’éditeur
- [x] Rétablir les actions visibles d’édition sur les blocs existants
- [x] Corriger le mode consultation et unifier ses actions avec le mode édition
- [x] Vérifier de bout en bout l’ouverture, la consultation, l’édition et la sauvegarde d’un cours

## WYSIWYG et qualité typographique des contenus texte
- [x] Auditer les blocs de contenu texte français et anglais pour identifier les formats bruts
- [x] Remplacer l’éditeur Markdown minimal par un véritable WYSIWYG structuré et sûr
- [x] Restaurer la hiérarchie de titres, emphases, listes et retours à la ligne sans modifier le sens
- [x] Vérifier les rendus apprenant et administrateur sur un échantillon bilingue représentatif

## Correctifs bloquants WYSIWYG et n8n
- [x] Corriger les commandes de listes numérotées et à puces dans l’éditeur de contenu texte
- [x] Ajouter un chargement visible, une reprise et une erreur récupérable au cours n8n
- [x] Vérifier la réactivité du chargement vidéo et des données du cours n8n

## Édition visuelle des checkpoints et modèles de blocs
- [x] Remplacer l’entrée ID des checkpoints par une interface de questions et critères visuels
- [x] Auditer les schémas de formulaires de tous les types de blocs
- [x] Corriger les formulaires qui exposent des champs techniques sans interface métier
- [x] Vérifier visuellement un échantillon représentatif de chaque famille de blocs

## Bibliothèque médias et visual designer
- [x] Inventorier les PDF, images, vidéos YouTube et médias locaux utilisés par les cours
- [x] Repeupler la bibliothèque médias avec les actifs existants et leurs métadonnées
- [x] Créer une page indépendante de gestion des médias avec recherche, filtres et usages
- [x] Déplacer le sélecteur médias dans les modales de création et d’édition de blocs
- [x] Mettre à jour les références de cours de manière contrôlée lors du remplacement d’un média
- [x] Protéger les suppressions de médias utilisés et vérifier les rendus sans régression

## Audit correctif de la gestion de contenu
- [x] Reproduire et corriger les erreurs 404 des aperçus de PDF et autres médias
- [x] Vérifier l’insertion effective d’un média existant dans chaque type de bloc média
- [x] Auditer les flux de création, édition, consultation, sauvegarde et suppression
- [x] Ajouter des états vides, erreurs et actions de reprise aux flux qui en manquent
- [x] Vérifier visuellement les parcours admin et apprenant après correction

## Relation bibliothèque médias et visual designer
- [x] Afficher les usages précis de chaque média avec accès direct au cours et bloc concernés
- [x] Proposer depuis la bibliothèque l’insertion dans un bloc existant ou la création d’un bloc média
- [x] Proposer depuis l’éditeur le bon type de bloc à créer selon le média sélectionné
- [x] Tester les parcours complets de liaison média, création de bloc et remplacement d’usage

## Logs et suivi détaillé des apprenants
- [x] Diagnostiquer pourquoi les journaux de la plateforme restent vides
- [x] Instrumenter les événements administratifs et pédagogiques essentiels avec persistance
- [x] Enregistrer les temps de présence et les résultats de première tentative par exercice
- [x] Enrichir le suivi apprenant par chapitre, exercice, temps et taux de réussite initiale
- [x] Ajouter des filtres, détails et vues visuelles aux logs et au suivi administrateur

## Reporting graphique des apprenants
- [x] Définir les indicateurs de performance, sérieux, implication et évolution calculables
- [x] Créer les agrégations réelles de reporting côté serveur
- [x] Ajouter les graphiques de progression, implication, réussite initiale et tendance dans l’administration
- [x] Ajouter filtres de période, cours et statut, avec état de données insuffisantes
- [x] Vérifier les calculs et le rendu des reportings graphiques

## Recommandations vidéo de fin de module administrables
- [x] Auditer les recommandations vidéo actuellement codées en dur et leur couverture par module
- [x] Définir un modèle éditable dans l’administration, compatible avec les bibliothèques de médias existantes
- [x] Ajouter l’édition, l’ajout, la réorganisation et la suppression des recommandations dans le gestionnaire de contenu
- [x] Généraliser le rendu des recommandations à tous les modules, avec état vide explicite
- [x] Vérifier les parcours administrateur et apprenant, puis publier

## Navigation et regroupements de l’administration
- [x] Auditer les menus administratifs, leurs redondances et leurs dépendances fonctionnelles
- [x] Définir des groupes de navigation et un ordre adaptés aux parcours administratifs prioritaires
- [x] Implémenter une navigation administrative persistante, structurée et cohérente sur toutes les pages concernées
- [x] Vérifier les liens, les états actifs et les parcours administrateur, puis publier

## Édition contextuelle depuis le parcours apprenant
- [x] Identifier les paramètres de leçon, chapitre et bloc disponibles dans le lecteur de cours
- [x] Ajouter une action réservée aux administrateurs pour ouvrir l’élément affiché dans l’éditeur
- [x] Transmettre la destination précise à l’éditeur dans un nouvel onglet
- [x] Vérifier les droits, le rendu et la navigation directe, puis publier

## Éditeur de recommandations et d’exercices
- [x] Afficher les vidéos recommandées une seule fois au niveau de la leçon dans l’éditeur
- [x] Supprimer leur répétition visuelle dans les chapitres et préserver leur rendu après la dernière étape apprenante
- [x] Séparer le contenu pédagogique des consignes, réponses et métadonnées d’exercice dans l’éditeur
- [x] Ajouter des formulaires structurés pour modifier les exercices sans texte agrégé ambigu
- [x] Vérifier les parcours d’édition et le rendu apprenant, puis publier

## Composants standards pour l’édition des exercices
- [x] Auditer les composants d’exercice et les schémas de blocs déjà disponibles
- [x] Associer chaque type d’exercice de cours à un éditeur visuel standard
- [x] Compléter les éditeurs manquants et remplacer les cartes génériques d’exercice
- [x] Vérifier les sauvegardes et les aperçus apprenants de tous les types d’exercice couverts
- [x] Dresser la liste des composants standards mis à jour et des nouveaux composants créés

## Alignement global lecteur apprenant et éditeur
- [x] Scanner tous les cours afin de cartographier les interactions et leur source canonique
- [x] Mettre en place un résolveur unique des éléments éditables par leçon et chapitre
- [x] Présenter dans l’éditeur uniquement les interactions effectivement rendues par le lecteur
- [x] Adapter les sauvegardes à la source de données réellement consommée par le lecteur
- [x] Ajouter les contrôles automatisés de cohérence, vérifier un échantillon multi-types et publier

## Catalogue pédagogique totalement administrable
- [x] Auditer les types de contenu existants et leur couverture par la bibliothèque de blocs
- [x] Ajouter les adaptateurs ou blocs manquants sans modifier le rendu apprenant existant
- [x] Ajouter la création, suppression sécurisée et réorganisation des leçons dans l’éditeur de cours
- [x] Rendre éditables les métadonnées de cours, certifications, catégories, tags et compteurs
- [x] Ajouter les contrôles de cohérence de catalogue, valider les parcours admin et publier

## Évaluations et écrans administrables
- [x] Auditer les QCM de validation, checkpoints et règles de passage utilisés par chaque écran
- [x] Ajouter la création, suppression et réorganisation des QCM et checkpoints au niveau de l’écran
- [x] Ajouter l’édition des règles de passage : score minimal, tirage, mélange et obligation de validation
- [x] Ajouter la création, suppression et réorganisation sécurisées des chapitres dans chaque leçon
- [x] Vérifier les règles dans le lecteur apprenant, tester les sauvegardes et publier

## Réorganisation et aperçu des évaluations
- [x] Ajouter le glisser-déposer aux questions de quiz et checkpoint
- [x] Ajouter le glisser-déposer aux écrans dans chaque leçon
- [x] Ajouter un aperçu de score et de règles avant la sauvegarde/publication
- [x] Vérifier les ordres sauvegardés et les parcours apprenants, puis publier

## Badges de compétences et certifications apprenantes
- [x] Auditer les données de progression, les succès d’évaluation et les flux e-mail existants
- [x] Définir les critères d’attribution des badges et certificats sans attribuer de réussite fictive
- [x] Ajouter la persistance, les vues apprenantes et l’écran de félicitations
- [x] Générer un diplôme PDF officiel Neopolis Development et envoyer l’e-mail de réussite
- [x] Tester les attributions, les documents et les notifications, puis publier

## Attribution rétroactive des acquis
- [x] Auditer les progrès et réussites historiques éligibles aux badges et diplômes
- [x] Ajouter une reprise idempotente fondée sur les critères actuels d’attribution
- [x] Attribuer les acquis rétrospectifs et envoyer les notifications correspondantes
- [x] Vérifier les résultats, les absences de doublons et publier le mécanisme

## Visibilité des badges et diplômes dans les profils
- [x] Auditer les écrans de profil apprenant et la fiche détaillée administrateur
- [x] Ajouter les données d’acquis nécessaires aux vues de profil sécurisées
- [x] Afficher les badges et diplômes avec leur statut et accès aux documents dans les deux profils
- [x] Vérifier les droits d’accès et le rendu, puis publier

## Compétences graduées et contributions administrables
- [x] Auditer les succès pédagogiques pouvant alimenter les compétences
- [x] Définir le référentiel de compétences et niveaux 1 à 100
- [x] Ajouter les règles administrables de contribution par contenu, évaluation, badge et diplôme
- [x] Persister les niveaux et la traçabilité détaillée des points accordés
- [x] Afficher les compétences dans les profils apprenants et administratifs
- [x] Vérifier les attributions et publier le référentiel

## Rangs, parcours et classements de compétences
- [x] Définir les seuils Bronze, Argent et Or visibles pour chaque niveau
- [x] Créer des parcours recommandés de montée en compétence à partir du catalogue réel
- [x] Afficher les rangs et recommandations dans le profil apprenant
- [x] Ajouter classements, filtres et tris par compétence dans l’administration
- [x] Vérifier les calculs, les profils et les classements, puis publier

## Ajustement du seuil de rang Bronze
- [x] Faire commencer le rang Bronze à 10 points et ajuster les tests
- [x] Vérifier le rendu des rangs puis publier

## Gamification et objectifs de progression
- [x] Ajouter le rang Émergent à partir de 5 points et rendre rangs, couleurs et icônes administrables
- [x] Définir et calculer des objectifs hebdomadaires à partir des contributions vérifiées
- [x] Ajouter les vues apprenantes de progression, objectifs et récompenses internes
- [x] Ajouter les contrôles administrateur de gamification et les animations respectueuses des préférences utilisateur
- [x] Vérifier les calculs, messages et accès, puis publier

## Compteurs dynamiques des certifications
- [x] Auditer les compteurs déclaratifs et les sources de contenu de chaque certification
- [x] Créer un calcul canonique des cours, leçons, exercices, vidéos et téléchargements
- [x] Afficher les compteurs calculés comme indicateurs non éditables dans Catalogue, certifications et catégories
- [x] Vérifier les compteurs publics et administratifs puis publier

## Contributions de compétences pilotées par tags
- [x] Auditer les règles de contribution et supprimer les sources non évaluatives
- [x] Définir des tags de compétences administrables pour les leçons et les évaluations
- [x] N’accorder des points que pour exercices, quiz, checkpoints, badges et certifications tagués
- [x] Recalculer les contributions historiques selon les tags explicites
- [x] Vérifier les niveaux et publier les règles ciblées

## Navigation admin et liens partageables
- [x] Corriger les clics du menu admin pour ouvrir immédiatement la vue ciblée sans rafraîchissement
- [x] Ajouter des URLs adressables pour les profils apprenants dans l’administration
- [x] Ajouter des URLs adressables pour l’ouverture ciblée des leçons et écrans dans l’éditeur
- [x] Tester les liens directs, le rechargement et la navigation historique navigateur
- [x] Étendre la synchronisation URL à tous les onglets, détails et vues administratives
- [x] Étendre la synchronisation URL à la navigation apprenant, aux certifications, cours, leçons et écrans
- [x] Vérifier les liens partageables, les rechargements et l’historique sur l’ensemble des parcours

## Invitations groupées
- [x] Rétablir la saisie de plusieurs e-mails pour les invitations directes séparés par point-virgule ou retour à la ligne
- [x] Valider et dédupliquer les adresses avant l’envoi groupé
- [x] Afficher un bilan clair des invitations envoyées ou refusées par adresse
- [x] Tester le flux groupé sans régression sur l’invitation individuelle

## Tableaux de données administratifs
- [x] Auditer toutes les listes administratives et leurs possibilités actuelles de recherche, tri et pagination
- [x] Normaliser en priorité les invitations directes avec pagination, recherche, tri et chargement serveur
- [x] Étendre les mêmes composants et conventions aux autres listes administratives prioritaires
- [x] Synchroniser les paramètres de tableau avec l’URL et tester les états de chargement, vides et erreur

## Communications de masse ciblées
- [x] Auditer le module de communications et les données de segmentation disponibles
- [x] Ajouter les segments : tous, invités, invités inscrits et apprenants inactifs ou ayant commencé
- [x] Ajouter les segments selon diplôme obtenu, compétence acquise et seuil de niveau
- [x] Afficher un aperçu vérifiable du nombre de destinataires avant la confirmation d’envoi
- [x] Tester les combinaisons de filtres sans déclencher de communication non confirmée

## Correctifs de crashs client
- [x] Diagnostiquer l’erreur MIME JavaScript détectée sur la page de candidature
- [x] Corriger l’erreur de filtrage détectée sur les candidats sélectionnés
- [x] Analyser les trois incidents Sentry récents et traiter leurs causes applicatives
- [x] Tester les pages affectées en navigateur et confirmer l’absence de nouveau crash

## Constructeur avancé de segments de communication
- [x] Auditer les données de progression, de cours, de compétences et de destinataires sélectionnables
- [x] Ajouter des critères combinables par cours, statut entamé/terminé et nombre de jours
- [x] Ajouter des critères de compétence par niveau et performance
- [x] Ajouter une sélection manuelle des destinataires avec recherche et dédoublonnage
- [x] Afficher la logique active, le nombre et un aperçu des destinataires avant l’envoi
- [x] Tester les intersections de critères sans déclencher de communication non confirmée

## Éditeur riche de communiqué
- [x] Auditer les composants WYSIWYG existants et le traitement sécurisé du HTML d’e-mail
- [x] Remplacer la saisie brute par un éditeur riche compatible avec le collage mis en forme
- [x] Préserver une mise en page e-mail sûre : titres, paragraphes, listes, liens et emphases
- [x] Tester le collage riche, la prévisualisation et le contenu transmis au brouillon

## Segments logiques et communications programmées
- [x] Ajouter des opérateurs ET/OU entre les critères de ciblage avancés
- [x] Sauvegarder, renommer, appliquer et supprimer des segments de destinataires réutilisables
- [x] Prévisualiser et valider explicitement une communication avant sa programmation
- [x] Programmer un brouillon validé à une date donnée, avec annulation avant exécution
- [x] Exécuter l’envoi différé de manière authentifiée, idempotente et traçable
- [x] Tester les règles logiques, les segments sauvegardés et la programmation sans e-mail non confirmé

## Communiqués importants et historique apprenant
- [x] Auditer les communications, notifications et l’intégration aux parcours apprenants
- [x] Ajouter une case Important aux brouillons et diffuser les communications à tous les nouveaux comptes lorsque ciblées « tout le monde »
- [x] Afficher les communiqués importants en lightbox jusqu’à accusé de réception
- [x] Créer une boîte de réception de communiqués accessible dans l’interface apprenant
- [x] Conserver l’état lu/accusé de réception par apprenant sans empêcher l’historique
- [x] Tester les nouveaux comptes, les accusés de réception et les communications non importantes

## Expéditeur des notifications et vidéo de candidature
- [x] Auditer les e-mails applicatifs encore envoyés par Manus et leur mécanisme d’expédition
- [x] Configurer les notifications applicatives pour utiliser exclusivement l’expéditeur Neopolis validé
- [x] Vérifier la présence de l’URL vidéo dans le détail de candidature côté API et administration
- [x] Corriger l’affichage et la lecture de la vidéo de candidature dans la fiche détaillée
- [x] Tester les parcours e-mail et vidéo sans déclencher d’envoi non confirmé

## Intégrité pédagogique et revue de suspicion
- [x] Auditer les données de progression, de temps, de tentatives et d’évaluations disponibles
- [x] Définir des signaux explicables de comportement atypique et leurs seuils de revue
- [x] Ajouter un tag de suspicion d’intégrité, une justification et un statut de revue humaine
- [x] Afficher un tableau admin d’analyse des signaux et des éléments de preuve
- [x] Prévoir le blocage uniquement par action explicite d’un administrateur après revue
- [x] Ajouter des contrôles de compréhension transparents plutôt que des pièges cachés
- [x] Tester le scoring, la traçabilité et les garde-fous de non-blocage automatique

## Propositions administratives et trajectoire de progression
- [x] Permettre aux administrateurs de proposer des ajustements d’objectifs depuis la fiche apprenant
- [x] Enregistrer la proposition, sa justification et sa date de création
- [x] Calculer une trajectoire prévue selon les objectifs, échéances et niveaux actuels
- [x] Afficher un graphique apprenant comparant avancement réel et prévu
- [x] Tester les autorisations administratives, le calcul et le rendu du graphique

## Parcours d’orientation et recommandations de formation
- [x] Auditer le référentiel de compétences, le catalogue, les certifications et les données de progression
- [x] Enregistrer les objectifs de compétences, niveaux cibles et projets de certification des apprenants
- [x] Créer un diagnostic QCM court aligné sur les compétences sélectionnées
- [x] Générer un parcours ordonné de cours et certifications adapté aux écarts de niveaux
- [x] Déclencher l’orientation pour les nouveaux comptes et rappeler les anciens apprenants par communiqué
- [x] Afficher les objectifs, le diagnostic, les recommandations et la progression aux apprenants et administrateurs
- [x] Tester les cas débutant, intermédiaire et avancé sans envoi non confirmé

## Ajustement des objectifs et suivi des écarts
- [x] Permettre la modification des objectifs de compétences après le diagnostic
- [x] Enregistrer une échéance cible pour chaque certification visée
- [x] Afficher le niveau actuel, le niveau cible et l’écart dans le suivi administrateur
- [x] Tester les modifications, échéances et comparatifs en vue apprenant et admin

## Libellés apprenants dans le reporting
- [x] Identifier l’enregistrement et le repli qui affichent un identifiant interne au lieu d’un nom
- [x] Corriger le libellé de secours avec l’adresse e-mail dans le reporting et les classements
- [x] Vérifier l’affichage mobile et ajouter un test contre la régression

## Lisibilité des noms dans les classements
- [x] Identifier les événements dont le profil utilisateur ne remonte pas dans le reporting
- [x] Afficher le nom en priorité, puis l’e-mail uniquement si le nom est absent
- [x] Remplacer le dernier recours par un libellé neutre et investigable
- [x] Vérifier les classements mobiles avec des profils complets et incomplets

## Séparation apprentissage et administration dans le reporting
- [x] Auditer les sources incluses dans les indicateurs d’apprentissage
- [x] Inclure un administrateur comme apprenant lorsque ses événements sont pédagogiques
- [x] Exclure explicitement toute activité administrative des compteurs et classements d’apprentissage
- [x] Tester la cohérence des profils mixtes sur le tableau de bord et mobile

## Récupération de compte, navigation et sécurité
- [x] Auditer le flux de mot de passe oublié, ses liens, ses tokens et ses e-mails
- [x] Vérifier la délivrabilité du lien de récupération vers le bon compte sans révéler l’existence d’un e-mail
- [x] Revoir l’arborescence des menus et promouvoir les communications à la navigation principale appropriée
- [x] Réaliser une revue de sécurité défensive : authentification, autorisations, sessions, validation, en-têtes et exposition des données
- [x] Corriger les protections prioritaires identifiées et les couvrir par tests
- [x] Tester les parcours de récupération et de navigation sans envoi ou action destructive non confirmée
- [x] Migrer Recharts v2 vers v3 afin de supprimer l’alerte de dépendance élevée restante

## Score global et tris du suivi apprenants
- [x] Auditer le contrat de données et les colonnes du tableau de suivi
- [x] Ajouter le score global des contributions pédagogiques à chaque apprenant
- [x] Rendre les en-têtes de colonne triables avec indicateur visuel de sens
- [x] Synchroniser le tri avec le serveur et vérifier le rendu mobile

## Formule du score global de compétences
- [x] Auditer l’agrégation des contributions de compétences graduées
- [x] Sommer les points de compétences graduées pour chaque apprenant
- [x] Préserver le tri serveur sur le score global corrigé
- [x] Vérifier les résultats sur les données réelles et les comptes sans contribution

## Formule du score global de performance
- [x] Piste abandonnée : le score demandé est la somme des compétences graduées, non les performances d’évaluation

## Propositions administratives et trajectoire de progression
- [x] Permettre aux administrateurs de proposer des ajustements d’objectifs depuis la fiche apprenant
- [x] Enregistrer la proposition, sa justification et sa date de création
- [x] Calculer une trajectoire prévue selon les objectifs, échéances et niveaux actuels
- [x] Afficher un graphique apprenant comparant avancement réel et prévu
- [x] Tester les autorisations administratives, le calcul et le rendu du graphique

## Navigation des nouveaux apprenants et orientation
- [x] Auditer la redirection automatique qui annule les clics sur les onglets
- [x] Conserver l’accès aux onglets apprenants pendant l’orientation incomplète
- [x] Afficher un rappel clair et une action prioritaire vers le diagnostic d’orientation
- [x] Tester les clics, le retour navigateur et le premier accès aux cours
## Corrections de l’audit des certifications Anthropic
- [x] Restaurer les titres officiels dégradés dans le catalogue et les métadonnées Developer / Architect Professional
- [x] Remplacer l’exercice AI Fluency erroné par la réflexion officielle, sans HTML libre, avec blocs `callout`, `content`, `checkpoint` et `download`
- [x] Distinguer visuellement les tutoriels complémentaires Neopolis du contenu officiel Anthropic
- [x] Migrer les références média locales des trois parcours vers le proxy `/api/assets/` et vérifier leur disponibilité
- [x] Ajouter un audit reproductible, des tests de non-régression et un rapport de contrôle visuel avant publication
## Régression de navigation lors de l’orientation incomplète
- [x] Reproduire le blocage des onglets pour un compte récent avec diagnostic d’orientation non finalisé
- [x] Supprimer toute redirection silencieuse qui annule l’intention de navigation de l’apprenant
- [x] Afficher une priorité d’orientation claire sans empêcher l’accès aux autres espaces apprenants
- [x] Couvrir l’accès aux onglets avec orientation incomplète par des tests unitaires
- [x] Vérifier la navigation authentifiée sur le domaine de production après publication
## Analyse des crashes et du monitoring
- [x] Recueillir et classifier les erreurs récentes client, serveur et performance dans le monitoring
- [x] Reproduire les incidents de priorité élevée et identifier leurs causes racines
- [x] Corriger les défauts reproductibles avec des tests de non-régression
- [x] Vérifier la disparition des erreurs pertinentes après publication et documenter les incidents non actionnables
## Dérogation administrateur au verrouillage séquentiel
- [x] Identifier les gardes client et serveur qui bloquent les cours séquentiels
- [x] Autoriser les administrateurs à ouvrir tout cours tout en préservant le verrouillage des apprenants
- [x] Ajouter des tests de séparation administrateur / apprenant et valider le parcours réel
## Triage complémentaire des derniers crashes Sentry
- [x] Recueillir les nouvelles issues et événements apparus après le dernier contrôle
- [x] Reproduire et corriger toute cause encore active ou régressée
- [x] Vérifier l’état Sentry en production et documenter le résultat
## Analyse du monitoring interne de la plateforme
- [x] Collecter les erreurs récentes des journaux client, serveur et réseau internes
- [x] Qualifier les défauts actifs, les reproduire et corriger les causes applicatives
- [x] Vérifier les journaux après correction et consigner le bilan interne
## Crash React du cours IA pour les nuls
- [x] Reproduire l’erreur `insertBefore` sur le lecteur du cours et localiser le bloc en cause
- [x] Corriger la cause de mutation DOM instable avec un test de non-régression
- [x] Vérifier la route en production et l’absence de nouveau crash dans les logs internes
## Régression de bundle et visibilité Sentry
- [x] Identifier pourquoi le bundle historique `index-gE23kOSs.js` reste chargé par certains apprenants
- [x] Vérifier et corriger la configuration de remontée client Sentry en production
- [x] Ajouter une stratégie de récupération ou d’invalidation des bundles obsolètes
- [x] Reproduire le crash, confirmer sa remontée Sentry et valider le correctif en production
## Notification de mise à jour disponible
- [x] Détecter périodiquement une nouvelle version de la plateforme sans interrompre l’apprentissage
- [x] Afficher un bandeau clair aux apprenants avec une action de rafraîchissement contrôlé
- [x] Tester la détection, le report et le rechargement puis valider le mécanisme en production
## Renforcement des sessions utilisant un bundle obsolète
- [x] Analyser pourquoi les sessions chargées avant publication atteignent encore le lecteur avant l’alerte
- [x] Détecter une transition risquée et demander un rafraîchissement avant que le crash React ne se produise
- [x] Empêcher tout cache partagé de servir un document HTML qui référence un ancien bundle
- [x] Tester les cas de bundle historique et vérifier la protection en production
## Analyse des issues Sentry 929549 et 929548
- [x] Examiner les événements, versions et traces des deux issues récentes
- [x] Reproduire et corriger toute cause encore active
- [x] Valider la résolution sur la plateforme et documenter le bilan
## Vérification des diagnostics Orientation et objectifs
- [x] Contrôler le nombre d’orientations démarrées, complétées et incomplètes
- [x] Identifier un profil d’exemple avec orientation complétée si les données existent
- [x] Vérifier le rendu administrateur et corriger un écart d’affichage éventuel
## Communiqué d’orientation et parcours recommandé
- [x] Préparer un brouillon de communiqué important expliquant l’intérêt de compléter Orientation et objectifs
- [x] Garantir qu’aucun e-mail, lightbox ou notification n’est diffusé avant validation administrative
- [x] Afficher les recommandations issues du diagnostic terminé dans Parcours d’apprentissage recommandé
- [x] Afficher un état explicite avec valeur par défaut lorsque le diagnostic n’est pas terminé
- [x] Tester les parcours avec et sans diagnostic puis valider en production
## Édition des communications en brouillon
- [x] Auditer l’éditeur de communication et les contrats de destinataires existants
- [x] Ajouter une mise à jour serveur limitée aux communications en brouillon
- [x] Permettre la modification de l’objet, du contenu riche, de l’importance et des destinataires
- [x] Prévisualiser et tester l’édition du brouillon sans déclencher d’envoi
## Audit comparatif du cours n8n
- [x] Relever la structure, les activités et les modalités du cours source DataCamp
- [x] Vérifier les compteurs, les médias, les TP et les interactions du cours Neopolis
- [x] Comparer les écarts fonctionnels et visuels reproductibles
- [x] Corriger les écarts confirmés et valider le parcours en production
## Conformité d’intégration DataCamp du cours n8n
- [x] Vérifier l’usage exclusif des blocs standards Neopolis et la rétrocompatibilité des composants
- [x] Vérifier les tags et contributions de compétences liés aux activités n8n
- [x] Vérifier les médias et fichiers locaux, leurs liens et leur disponibilité en production
- [x] Vérifier que chaque TP est autonome, guidé, accompagné des prérequis et de ses ressources téléchargeables
- [x] Remplacer dans les TP les consignes restantes dépendantes de la VM DataCamp par des alternatives réalisables dans l’environnement apprenant
- [x] Préserver les extensions des fichiers VM dans les consignes adaptées aux environnements apprenants
## Inventaire et intégration des catalogues DataCamp
- [x] Inventorier les cours des catalogues technologies 54, 52, 25 et 53
- [x] Vérifier pour chaque cours le paquet, les médias ou le droit d’intégration disponible
- [x] Proposer un classement Neopolis, les tags de compétences et le lot d’import prioritaire
- [x] Importer uniquement les cours autorisés avec blocs standards, médias locaux et TP autonomes

## Import contrôlé des paquets DataCamp depuis Google Drive
- [x] Inventorier uniquement les ZIP complets présents dans les dossiers claude_anthropic, openai, gemini et n8n
- [x] Valider COURSE_MANIFEST.json, COMPLETENESS_REPORT.md, download_assets_manifest.json et MEDIA_VALIDATION_REPORT.json quand présents, ainsi que l’exclusion autorisée
- [x] Déterminer pour chaque média Drive la stratégie de lecture fiable : diffusion directe autorisée ou copie versionnée nécessaire
- [x] Transformer catalogue, cours, chapitres et activités dans l’ordre canonique avec les blocs interactifs Neopolis
- [x] Vérifier les compteurs, médias, PDF, progression séquentielle, réponses masquées et le responsive mobile avant publication
- [x] Ajouter un convertisseur réutilisable pour les schémas de manifestes DataCamp autorisés et un rapport d’audit par cours
- [x] Importer et auditer un lot pilote multi-catalogues avant les paquets DataCamp volumineux
- [x] Importer les paquets restants par lots contrôlés, avec validation des médias et compteurs après chaque lot
- [x] Générer et auditer le cours pilote « Introduction to Claude Models » : 3 chapitres, 29 activités, 10 vidéos, 19 exercices interactifs et 3 supports PDF locaux
- [x] Générer et auditer le cours « Gemini in Gmail » : 1 chapitre, 7 activités, 4 vidéos, 3 activités interactives et 1 support PDF local
- [x] Générer et auditer le cours « Gemini in Google Meet » : 1 chapitre, 10 activités, 5 vidéos, 5 activités interactives et 1 support PDF local
- [x] Générer et auditer le cours « Gemini in Google Sheets » : 1 chapitre, 7 activités, 4 vidéos, 3 activités interactives et 1 support PDF local
- [x] Générer et auditer le cours « Gemini in Google Docs » : 1 chapitre, 9 activités, 5 vidéos, 4 activités interactives et 1 support PDF local
- [x] Décoder les états préchargés DataCamp sans les exécuter afin de convertir exactement les activités OpenAI interactives
- [x] Générer et auditer le cours pilote « Introduction to Google Workspace with Gemini » : 1 chapitre, 7 activités, 3 vidéos, 4 activités interactives et 1 support PDF local
- [x] Générer et auditer le cours « Systèmes multimodaux avec l’API OpenAI » : 2 chapitres, 24 activités, 7 vidéos, 17 activités interactives et 2 supports PDF locaux
- [x] Générer et auditer le cours « Introduction aux embeddings avec l’API OpenAI » : 3 chapitres, 37 activités, 11 vidéos, 26 activités interactives et 3 supports téléchargeables locaux
- [x] Générer et auditer le cours « IA pratique avec Google Gemini et NotebookLM » : 4 chapitres, 48 activités, 15 vidéos, 33 activités interactives et 4 supports téléchargeables locaux
- [x] Générer et auditer le cours « Gemini dans Google Drive » : 2 chapitres, 15 activités, 7 vidéos, 8 activités interactives et 1 support téléchargeable local
- [x] Générer et auditer le cours « Gemini dans Google Slides » : 1 chapitre, 8 activités, 4 vidéos, 4 activités interactives et 1 support téléchargeable local
- [x] Générer et auditer le cours « Développer des systèmes d’IA avec l’API OpenAI » : 3 chapitres, 36 activités, 11 vidéos, 25 activités interactives et 3 supports téléchargeables locaux
- [x] Générer et auditer le cours « Utiliser l’API OpenAI Responses » : 3 chapitres, 34 activités, 11 vidéos, 19 activités interactives et 3 supports téléchargeables locaux
- [x] Générer et auditer le cours « Travailler avec l’API OpenAI » : 3 chapitres, 29 activités, 9 vidéos, 20 activités interactives et 3 supports téléchargeables locaux
- [x] Générer et auditer le cours « Prompt Engineering avec l’API OpenAI » : 4 chapitres, 55 activités, 15 vidéos, 40 activités interactives et 4 supports téléchargeables locaux
- [x] Générer et auditer le cours « Créer des workflows marketing avec n8n » : 3 chapitres, 23 activités, 8 vidéos, 15 TP autonomes et 3 supports téléchargeables locaux
- [x] Générer et auditer le cours « Automatisation de workflows intermédiaires avec n8n » : 4 chapitres, 40 activités, 13 vidéos, 27 TP autonomes et médias locaux validés
- [x] Générer et auditer le cours « Développement logiciel avec Claude Code » : 4 chapitres, 43 activités, 15 vidéos, 28 exercices interactifs et 4 supports téléchargeables locaux
- [x] Générer et auditer le cours « Claude 101 » : 4 chapitres, 20 activités, 2 vidéos, 17 activités interactives et 2 supports téléchargeables locaux
- [x] Générer et auditer le cours « Claude Code en action » : 4 chapitres, 31 activités, 9 vidéos, 22 exercices interactifs et médias locaux validés
- [x] Générer et auditer le cours « Sujets avancés sur le Model Context Protocol » : 2 chapitres, 32 activités, 10 vidéos, 22 activités interactives et 2 supports téléchargeables locaux
- [x] Générer et auditer le cours « Introduction aux sous-agents » : 2 chapitres, 12 activités, 4 vidéos, 8 activités interactives et 2 supports téléchargeables locaux
- [x] Générer et auditer le cours « Claude Code 101 » : 4 chapitres, 37 activités, 12 vidéos et 23 activités interactives avec médias locaux validés
- [x] Remplacer le contrôle des états préchargés du paquet OpenAI pilote par la lecture des seuls champs canoniques du manifeste
- [x] Convertir « Travailler avec l’API OpenAI » depuis les champs canoniques du manifeste alternatif, avec médias locaux et TP autonomes
- [x] Importer Gemini Drive à partir de ses médias déclarés disponibles, sans rendre bloquante une ressource visuelle optionnelle non exposée
- [x] Importer Gemini Slides à partir de ses médias déclarés disponibles, sans rendre bloquante une ressource visuelle optionnelle non exposée
- [x] Adapter et valider les formats `SingleProcessExercise`, `DragAndDropExercise` et `TabExercise` du paquet « Concevoir des systèmes d’IA avec l’API OpenAI »
- [x] Restaurer le mapping exact des médias locaux et des ressources de TP du cours « Travailler avec l’API OpenAI » avant publication
- [x] Adapter et valider les 20 exercices console et 6 tris interactifs du paquet « Software Development with Claude Code »
- [x] Utiliser le cours n8n DataCamp existant comme référence fonctionnelle et de structure pour les conversions suivantes
- [x] Créer une catégorie distincte pour les parcours de préparation aux certifications Anthropic officielles
- [x] Ajouter un tag visible et une mention explicite de préparation aux certifications Anthropic officielles dans leurs descriptions
- [x] Vérifier que chaque cours DataCamp importé porte des tags de compétences et des règles de contribution administrables cohérentes
- [x] Vérifier en production les médias locaux téléversés pour chaque cours DataCamp avant publication
- [x] Vérifier que chaque TP DataCamp est autonome, présente ses prérequis, sa préparation d’environnement et ses ressources téléchargeables
- [x] Afficher les activités totales DataCamp comme compteur principal sans confondre les exercices interactifs et les écrans du cours
- [x] Diagnostiquer les causes du FCP/LCP mobile de la page d’accueil et optimiser le rendu critique sans dégrader l’accessibilité
- [x] Réviser l’audit DataCamp pour utiliser uniquement COURSE_MANIFEST, COMPLETENESS_REPORT, download_assets_manifest et MEDIA_VALIDATION_REPORT quand présents
- [x] Importer les 6 ZIP OpenAI conventionnels, les 8 ZIP Gemini conventionnels, les 3 ZIP n8n et les 8 ZIP Claude Anthropic autorisés
- [x] Écarter uniquement Building Claude Cowork Plugins et produire des preuves exactes pour tout autre blocage réel
- [x] Produire le tableau final par catalogue avec chapitres, leçons, exercices, vidéos, supports et statut QA
## Régressions brouillon et progression n8n
- [x] Reproduire et corriger le contenu absent à l’ouverture d’un brouillon de communication
- [x] Reproduire et corriger le passage bloqué entre les chapitres 2 et 3 du cours n8n
- [x] Corriger le pourcentage de progression affiché à 100 % avant la fin réelle du cours
- [x] Ajouter des tests et vérifier les deux parcours en production
## Déploiement du logo officiel Neopolis Akademy
- [x] Inventorier tous les logos, icônes et références de marque visibles de la plateforme
- [x] Stocker le logo SVG officiel dans les ressources web persistantes et le référencer via son URL de production
- [x] Remplacer les logos alternatifs dans les pages publiques, apprenantes, administratives et les modèles de document
- [x] Vérifier visuellement les principaux espaces après remplacement

## Partage social, SEO initial et favicon
- [x] Auditer les métadonnées HTML initiales et le routage public pour les crawlers
- [x] Préparer et publier une image Open Graph officielle à partir du logo fourni
- [x] Configurer les titres, descriptions, canonical, Open Graph et Twitter Cards côté serveur pour les pages publiques
- [x] Générer et configurer les favicons et icônes mobiles à partir du logo fourni
- [x] Ajouter des tests et vérifier les métadonnées ainsi que les assets publics sur le domaine de production

## Optimisation mesurable PageSpeed / Lighthouse
- [x] Établir une référence Google PageSpeed Insights et Lighthouse sur mobile et ordinateur, avec les métriques Core Web Vitals et tous les diagnostics
- [x] Identifier précisément les causes dans le code : LCP, images, bundles JavaScript, CSS, polices, scripts tiers, CLS et défauts d’accessibilité
- [x] Appliquer les optimisations de ressources, de chargement et de rendu sans supprimer de fonctionnalité, de contenu ni modifier la charte graphique
- [x] Répéter les mesures mobile et ordinateur, corriger les écarts restants et comparer les résultats à la référence
- [x] Vérifier les parcours publics et critiques, l’accessibilité, le responsive, le SEO/social, les erreurs console et publier le bilan mesurable

## Recherche intelligente de formation
- [x] Auditer le catalogue, les fichiers de cours, les métadonnées et les règles d’accès réutilisables pour la recherche
- [x] Définir un index pertinent : certifications, cours, leçons, chapitres, compétences, tags et extraits de contenu
- [x] Ajouter une recherche rapide avec tolérance aux accents, correspondances partielles, classement par pertinence et filtres utiles
- [x] Intégrer une interface accessible de recherche et de navigation directe vers les contenus autorisés
- [x] Ajouter des tests de pertinence, d’accès et de navigation ; vérifier le rendu puis publier

## Correctifs Agentic Browsing et performance mobile
- [x] Reproduire et corriger la progression Agentic Browsing bloquée à 2/3
- [x] Relever les audits de la mesure mobile publiée à 74 % et identifier les causes restantes
- [x] Corriger les freins confirmés sans retirer de contenu ni de fonctionnalités
- [x] Vérifier le parcours complet Agentic Browsing, la mesure mobile et publier les corrections

## Régression Agentic Browsing persistante
- [x] Identifier le cours et le profil exacts toujours affichés à 2/3 dans les données de production
- [x] Corriger la progression terminale ou la donnée concernée sans contourner les règles pédagogiques
- [x] Vérifier le passage réel à 3/3, ajouter le test de non-régression et publier

## Audit intégral Anthropic : passages, compteurs et gamification
- [x] Cartographier tous les parcours Anthropic, leurs cours, leçons, chapitres et conditions de passage
- [x] Scanner chaque parcours pour détecter les verrouillages incohérents, compteurs de contenus divergents et progressions impossibles
- [x] Vérifier les sources et calculs des scores, compétences, points XP et rangs sur données réelles
- [x] Corriger les écarts confirmés et afficher une explication claire des conditions de passage aux apprenants
- [x] Tester les parcours, compteurs et indicateurs en production puis publier le bilan de cohérence

## Progression Agentic Browsing vue par Google PageSpeed
- [x] Identifier que le score 2/3 concerne l’audit llms.txt de Google, non un parcours de formation
- [x] Corriger le fichier public llms.txt sans modifier les règles pédagogiques
- [x] Vérifier les critères corrigés sur le domaine publié et relancer les analyses Google mobile et ordinateur

## Conformité Agentic Browsing de Google PageSpeed
- [x] Auditer le llms.txt public et les pages canoniques à référencer
- [x] Ajouter un titre H1 Markdown, un résumé et des liens publics pertinents dans llms.txt
- [x] Vérifier llms.txt sur le domaine publié et relancer l’audit Google PageSpeed mobile/ordinateur

## Amélioration PageSpeed mobile — rapport 85
- [x] Extraire les métriques et opportunités exactes du rapport PageSpeed mobile fourni
- [x] Relier chaque diagnostic prioritaire aux ressources et composants concernés
- [x] Corriger les freins mobiles sans retirer de contenu ni modifier les parcours
- [x] Revalider Lighthouse et PageSpeed mobile, puis publier la comparaison mesurable

## Évaluation des cours et journal d’activité apprenant
- [x] Auditer les tables, procédures et traces existantes pour les retours de cours et actions apprenantes
- [x] Créer les modèles sécurisés de note 1–3 étoiles, feedback texte et événements d’activité horodatés
- [x] Ajouter l’évaluation de cours dans l’interface apprenante et enregistrer les actions pédagogiques importantes
- [x] Ajouter les vues administratives de feedback et le journal détaillé dans les profils apprenants
- [x] Tester les droits admin, la traçabilité, le rendu des états vides et publier

## Conformité du journal Logs administratif
- [x] Auditer les rôles administratifs et le journal global existant
- [x] Réserver le menu Logs et ses données aux rôles autorisés, avec un contrat d’accès explicite
- [x] Ajouter un tableau paginé, des filtres par utilisateur et période, ainsi qu’une vue détaillée d’événement
- [x] Vérifier les droits, la pagination, les filtres, les détails et publier
- [x] Corriger le panneau Journal publié afin que ses filtres et détails soient effectivement visibles et accessibles
- [x] Rendre explicites les données historiques et les comparaisons avant/après dans le détail d’événement

## Corrections contrôlées cours par cours — audit croisé DataCamp / Skilljar
- [x] Télécharger et analyser le paquet neopolis_cross_source_audit_2026-08-21 ainsi que son résumé global
- [x] Classer les écarts Critical, High, Medium et Info selon les rapports et prompts de correction associés
- [x] Corriger un seul cours prioritaire à la fois avec les blocs et médias standards Neopolis
- [x] Déployer chaque correctif de cours et contrôler le rendu réel sur ordinateur et mobile
- [x] Produire les preuves par cours : médias, exercices, compteurs source/Neopolis, corrections et risques restants
- [x] Préserver les checkpoints supplémentaires et les vidéos recommandées intentionnels pendant toutes les corrections d’audit
- [x] Traiter le cours critique « Introduction to Agent Skills » : analyser son PDF et son prompt, corriger, publier et produire les preuves avant tout autre cours
- [x] Traiter le cours critique « Model Context Protocol Advanced Topics » : analyser son PDF et son prompt, corriger, publier et produire les preuves avant le cours critique suivant
- [x] Traiter le cours critique « Introduction to Subagents » : analyser son PDF et son prompt, corriger, publier et produire les preuves avant le cours critique suivant
- [x] Traiter le cours critique « Claude Code 101 » : analyser son PDF et son prompt, corriger, publier et produire les preuves avant le cours critique suivant
- [x] Traiter le cours critique « Practical AI with Google Gemini and NotebookLM » : analyser son PDF et son prompt, corriger, publier et produire les preuves avant le cours critique suivant
- [x] Stabiliser les requêtes Range des 7 vidéos Gemini réuploadées et confirmer leur lecture de production sans erreur intermittente
- [x] Traiter le cours critique « Prompt Engineering with the OpenAI API » : analyser son PDF et son prompt, corriger, publier et produire les preuves avant le cours critique suivant
- [x] Ajouter un repli de fichier de cours pour le renommage Prompt Engineering pendant la propagation des assets statiques
- [x] Traiter le cours critique « Introduction to Workflow Automation with n8n » : analyser son PDF et son prompt, corriger, publier et produire les preuves avant le cours suivant
- [x] Traiter le cours High « Claude Certified Developer – Fondations » : analyser les sources disponibles, préserver les checkpoints et vidéos recommandées intentionnels, et tracer la différence historique non attribuable sans invention
- [x] Traiter le cours High « Claude Certified Architect – Fondations » : analyser les sources disponibles, préserver les checkpoints et vidéos recommandées intentionnels, et tracer la divergence de métrique sans invention
- [x] Traiter le cours High « Claude Certified Architect – Professionnel » : analyser les sources disponibles, préserver les checkpoints et vidéos recommandées intentionnels, et tracer la divergence de métrique sans invention
- [x] Traiter le cours High « Building Marketing Workflows with n8n » : confirmer 23 activités canoniques et 15 exercices interactifs, préserver les enrichissements intentionnels et couvrir la métrique par test
- [x] Traiter le cours High « Intermediate Workflow Automation with n8n » : confirmer 40 activités canoniques et 27 exercices interactifs, préserver les enrichissements intentionnels et couvrir la métrique par test
- [x] Traiter le cours High « Gemini in Google Meet » : vérifier le manifeste canonique à 10 activités et couvrir l’agrégation de compteur sans modifier les enrichissements intentionnels
- [x] Vérifier le total d’activités de la carte Gemini Meet afin d’afficher les 10 activités canoniques plutôt que les 5 exercices interactifs
- [x] Traiter le cours High « Gemini in Google Sheets » : vérifier le manifeste canonique à 7 activités et couvrir l’agrégation de compteur sans modifier les enrichissements intentionnels
- [x] Traiter le cours Medium « Introduction to Claude Models » : vérifier l’agrégation à 29 activités canoniques et couvrir la métrique sans modifier les enrichissements intentionnels
- [x] Traiter le cours Medium « Software Development with Claude Code » : vérifier l’agrégation à 43 activités canoniques et couvrir la métrique sans modifier les enrichissements intentionnels
- [x] Traiter le cours Medium « Claude 101 » : vérifier l’agrégation à 20 activités canoniques et couvrir la métrique sans modifier les enrichissements intentionnels
- [x] Traiter le cours Medium « Claude Code in Action » : vérifier l’agrégation à 31 activités canoniques et la stabilité Range du média signalé, sans modifier les enrichissements intentionnels
- [x] Stabiliser le streaming Range de la vidéo Claude Code in Action `ch01_ex01_video_steering_long_sessions_476f2ecf.mp4` après les erreurs 500 intermittentes confirmées
- [x] Traiter le cours Medium « Introduction to Google Workspace with Gemini » : vérifier l’agrégation à 7 activités canoniques et couvrir la métrique sans modifier les enrichissements intentionnels
- [x] Traiter le cours Medium « Gemini in Gmail » : vérifier l’agrégation à 7 activités canoniques et couvrir la métrique sans modifier les enrichissements intentionnels
- [x] Traiter le cours Medium « Gemini in Google Docs » : vérifier l’agrégation à 9 activités canoniques et couvrir la métrique sans modifier les enrichissements intentionnels
- [x] Traiter le cours Medium « Gemini in Google Drive » : vérifier l’agrégation à 15 activités canoniques et couvrir la métrique sans modifier les enrichissements intentionnels
- [x] Traiter le cours Medium « Gemini in Google Slides » : vérifier l’agrégation à 8 activités canoniques et couvrir la métrique sans modifier les enrichissements intentionnels
- [x] Traiter le cours Medium « Multi-Modal Systems with the OpenAI API » : vérifier l’agrégation à 24 activités canoniques et couvrir la métrique sans modifier les enrichissements intentionnels
- [x] Traiter le cours Medium « Introduction to Embeddings with the OpenAI API » : vérifier l’agrégation à 37 activités canoniques et couvrir la métrique sans modifier les enrichissements intentionnels
- [x] Traiter le cours Medium « Developing AI Systems with the OpenAI API » : vérifier l’agrégation à 36 activités canoniques et couvrir la métrique sans modifier les enrichissements intentionnels
- [x] Traiter le cours Medium « Working with the OpenAI API » : vérifier l’agrégation à 29 activités canoniques et couvrir la métrique sans modifier les enrichissements intentionnels
- [x] Traiter le cours Medium « Working with the OpenAI Responses API » : vérifier l’agrégation à 34 activités canoniques et couvrir la métrique sans modifier les enrichissements intentionnels

## Taxonomie des formations
- [x] Inventorier les catégories, certifications et cours sans catégorie explicite
- [x] Définir les catégories complémentaires nécessaires avec intitulés bilingues et descriptions administrables
- [x] Rattacher chaque formation et cours à une catégorie pertinente
- [x] Ajouter des tests de couverture de catégorie et vérifier le rendu du catalogue

## Feedback sur les formations
- [x] Auditer les modèles, écrans et données existantes liés aux avis et retours apprenants
- [x] Créer les tables et procédures sécurisées pour les notations, suggestions et statuts de traitement
- [x] Ajouter le formulaire apprenant de notation et suggestion par formation
- [x] Créer le tableau de bord admin de suivi, filtrage, réponse et résolution des feedbacks
- [x] Tester les droits, les parcours et publier le système de feedback
- [x] Envoyer une alerte e-mail aux administrateurs lors de la soumission d’un feedback critique

## Analyse des retours Sentry
- [x] Lire le feedback Sentry 929617 et qualifier les problèmes signalés
- [x] Reproduire les problèmes confirmés et prioriser les optimisations exploitables
- [x] Implémenter, tester et publier les correctifs retenus
- [x] Corriger le mélange de langues et de formats lors d’un changement de langue dans un cours
- [x] Éliminer les répétitions pédagogiques sourcées et améliorer la lisibilité des contenus concernés
- [x] Remplacer les consignes spatiales ambiguës (« à gauche ») par des repères adaptés au rendu réel
- [x] Corriger la table concaténée et les lignes dupliquées du chapitre « Ingénierie du contexte » Developer
