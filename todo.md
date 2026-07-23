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
