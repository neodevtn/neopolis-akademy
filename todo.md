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
