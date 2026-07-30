# Notes de test E2E - 30 juillet 2026

## Test 1 : Landing Page FR
- ✅ Page chargée correctement
- ✅ Navigation header visible (La Formule, Pourquoi maintenant, Partenaires, FAQ, Formation)
- ✅ Bouton "Postuler" visible
- ✅ Sélecteur de langue FR visible
- ✅ Hero s'affiche correctement (titre + graphique réseau + badges + CTA)
- ✅ Cookie banner s'affiche en bas
- ✅ Section "Pourquoi se transformer maintenant" visible
- ✅ Statistiques animées (0M affichées car pas encore scrollé)
- ⚠️ Le graphique Chart.js (canvas 14) est dans la zone mais pas visible dans le viewport initial

## Test 2 : Landing Page EN
- ✅ Traduction complète du header (The Formula, Why now, Partners, FAQ, Training, Apply)
- ✅ Hero traduit (Turn the AI threat into opportunity)
- ✅ Badges traduits (100% Free, 296 spots, Before August 31, 2026)
- ✅ Section "Why transform now?" traduite
- ✅ Statistiques traduites (jobs exposed to automation, jobs displaced by 2030, of work hours automated, of SaaS threatened by AI agents)
- ✅ CTA traduit (Don't suffer the disruption. Become the agent of change.)
- ✅ Sources traduites
- ✅ Cookie banner traduit (We respect your privacy, Decline, Accept)
- ⚠️ BUG: Les labels du graphique Chart.js sont encore en français ("Goldman Sachs (emplois exposés, M)", "WEF (emplois déplacés, M)", "McKinsey (scénario haut, M)")
- ⚠️ BUG: Le graphique ne s'anime pas au premier scroll (les courbes restent à 0 - flat line) - CORRIGÉ au 2ème scroll
- ✅ Section "The Complete Formula" traduite (STEP 01/02/03, 7-Day E-Learning, CCA Certification, Ambassador Status)
- ✅ Section "Our Technology Partners" traduite
- ✅ Section "What we provide" traduite (6 points)
- ✅ Section "Become an AI Solutions Partner" traduite
- ✅ Section "The Ambassador's Commercial Process" traduite (5 phases)
- ✅ Phase 2 classification traduite (Project size, Identified need, Proposed solution)
- ✅ FAQ traduite (7 questions en anglais)
- ✅ Footer traduit (About Neopolis Dev, Legal notice, Learn more)

## BUGS TROUVÉS - Landing Page EN:
1. Labels du graphique Chart.js en français au lieu d'anglais
2. Graphique ne s'anime pas au premier scroll (animation trigger issue)

## Test 3 : Page Candidature (/apply)
- ✅ Page chargée correctement
- ✅ Logo Neopolis Akademy visible
- ✅ Bouton "Retour" vers la page d'accueil
- ✅ Formulaire étape 1/10 : Informations personnelles
- ✅ Champs : Prénom, Nom, Email, Téléphone
- ✅ Bouton "Suivant" visible
- ⚠️ NOTE: Le formulaire est en FRANÇAIS alors que la langue sélectionnée est EN (pas de traduction du formulaire)
- ⚠️ BUG: Les labels du formulaire ne sont pas traduits (Prénom, Nom, Email, Téléphone, Suivant, Étape 1 sur 10)
- ✅ Étape 1 validée et passage à l'étape 2 OK
- ✅ Étape 2 : Localisation & Secteur - champs Pays, Ville, Secteur, Poste actuel, Années d'expérience
- ✅ Boutons Précédent/Suivant fonctionnels
- ⚠️ BUG: Formulaire non traduit en anglais (labels en français : Localisation & Secteur, Pays de résidence, etc.)

## Test 4 : Page Formation (/training)
- ✅ Page chargée correctement
- ✅ Message "Authentication Required" affiché (traduit en EN)
- ✅ Bouton "Log in to continue" visible
- ✅ Sélecteur de langue EN visible
- ✅ Logo "Neopolis TRAINING" visible

## Test 5 : Page Login (/login)
- ✅ Page chargée correctement
- ✅ Titre "Neopolis Akademy" visible
- ✅ Sous-titre "Plateforme de formation certifiante en Intelligence Artificielle"
- ✅ Formulaire de connexion (Email, Mot de passe, Se connecter)
- ✅ Message "Accès sur invitation uniquement" visible
- ✅ Lien "Vous souhaitez devenir ambassadeur ? Postulez ici" visible
- ⚠️ BUG: Page de login non traduite (tout en français alors que la langue est EN)

## RÉSUMÉ DES BUGS À CORRIGER (PRIORITÉ PROD)

### BUG 1 - Labels graphique Chart.js non traduits (CRITIQUE)
- Les labels du graphique "Emplois exposés à l'automatisation" restent en français quand la langue est EN
- Labels actuels: "Goldman Sachs (emplois exposés, M)", "WEF (emplois déplacés, M)", "McKinsey (scénario haut, M)"
- Cause probable: le useEffect du graphique ne se re-exécute pas quand la langue change (dépendance manquante ou labels non dynamiques)

### BUG 2 - Formulaire Apply.tsx non traduit (IMPORTANT)
- Tous les labels du formulaire de candidature restent en français quelle que soit la langue sélectionnée
- Affecte: titres d'étapes, labels de champs, placeholders, boutons Suivant/Précédent
- Solution: intégrer le fichier formLabels.ts déjà créé dans Apply.tsx

### BUG 3 - Page Login non traduite (IMPORTANT)
- La page /login est entièrement en français (Connexion, Email, Mot de passe, Se connecter, message invitation)
- Solution: ajouter useLanguage et t() dans Login.tsx

### BUG 4 - Graphique ne s'anime pas au premier scroll (MINEUR)
- Les courbes du graphique restent à 0 au premier passage dans le viewport
- Elles s'animent correctement au 2ème scroll
- Cause probable: IntersectionObserver trigger issue ou animation delay

### PAGES TESTÉES OK:
- ✅ Landing page FR : toutes les sections s'affichent correctement
- ✅ Landing page EN : toutes les sections traduites (sauf graphique labels)
- ✅ Navigation header : liens fonctionnels (La Formule, Pourquoi maintenant, Partenaires, FAQ, Formation)
- ✅ Sélecteur de langue : FR/EN/AR fonctionne
- ✅ Cookie banner : traduit en EN
- ✅ Formulaire Apply : navigation entre étapes fonctionne (étape 1 → 2 OK)
- ✅ Page Training : message "Authentication Required" traduit en EN
- ✅ Page Login : formulaire fonctionnel (champs email/password, bouton Se connecter)
- ✅ Bouton "Postulez ici" dans login redirige vers /apply
