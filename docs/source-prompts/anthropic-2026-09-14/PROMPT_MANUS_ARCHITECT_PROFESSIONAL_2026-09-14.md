# Prompt Manus - Claude Certified Architect - Professional (CCAR-P)

Tu dois corriger ce parcours cours par cours, dans l'ordre ci-dessous, sans modifier le cours suivant tant que le gate du cours courant n'est pas vert.

- Source officielle: https://anthropic-partners.skilljar.com/path/claude-certified-architect-professional
- Cible Neopolis: https://akademy.neodev.click/training/claude_certified_architect_professional
- Format mock officiel: 63 questions, 120 minutes, seuil 720/1000

## Blueprint officiel

- Solution Design & Architecture: 17%
- Claude Models, Prompting & Context Engineering: 13%
- Integration: 19%
- Evaluation, Testing & Optimization: 16%
- Governance, Safety & Risk Management: 14%
- Stakeholder Communication & Lifecycle Management: 14%
- Developer Productivity & Operational Enablement: 7%

## Plan cours par cours

### 1. Claude Platform & Solution Design
- Reference officielle: 238 min
- Etat Neopolis: 14 chapitres, 13 exercices interactifs
- Correction prioritaire: Afficher la duree officielle et controler la parite de chaque decision d'architecture, pattern, decomposition et reference architecture.
- Livraison: matrice de parite, correction dans les blocs standards, test complet, captures avant/apres et validation avant le cours suivant.
### 2. Enterprise Integration & Production
- Reference officielle: 158 min
- Etat Neopolis: 15 chapitres, 6 exercices interactifs
- Correction prioritaire: Ajouter des checkpoints sur integration, securite, fiabilite, observabilite et passage POC-production; verifier les supports.
- Livraison: matrice de parite, correction dans les blocs standards, test complet, captures avant/apres et validation avant le cours suivant.
### 3. Responsible AI, Safety & Risk for Architects
- Reference officielle: 114 min
- Etat Neopolis: 15 chapitres, 6 exercices interactifs
- Correction prioritaire: Tester la pile de controles, les modes de defaillance et les decisions d'escalade dans des scenarios interactifs.
- Livraison: matrice de parite, correction dans les blocs standards, test complet, captures avant/apres et validation avant le cours suivant.
### 4. Stakeholder Engagement, Lifecycle & GTM
- Reference officielle: 178 min
- Etat Neopolis: 6 chapitres, 1 exercices interactifs
- Correction prioritaire: Un seul exercice est insuffisant pour 178 minutes; ajouter cas de cadrage, arbitrage, adoption, GTM et gouvernance du cycle de vie.
- Livraison: matrice de parite, correction dans les blocs standards, test complet, captures avant/apres et validation avant le cours suivant.
### 5. Team Enablement & Operational Productivity
- Reference officielle: 45 min
- Etat Neopolis: 6 chapitres, 1 exercices interactifs
- Correction prioritaire: Ajouter un exercice d'enablement et un checkpoint operationnel; conserver un format court sans contenu artificiel.
- Livraison: matrice de parite, correction dans les blocs standards, test complet, captures avant/apres et validation avant le cours suivant.


## Regles d'implementation obligatoires

1. Utiliser exclusivement la bibliotheque de blocs standards Neopolis et la bibliotheque media. Aucun composant de cours hardcode dans une page.
2. Conserver le verrouillage sequentiel demande: chapitre N+1 apres validation de l'activite obligatoire de N; cours N+1 apres completion du cours N; mock apres completion du parcours.
3. Preserver une hierarchie lisible `certification > cours > lecon/section > ecran > activite`, avec navigation precedent/suivant. Eviter les blocs de plusieurs kilometres.
4. Afficher le titre officiel anglais comme identifiant canonique et la traduction francaise comme libelle localise. Ne jamais traduire les noms produits (Claude Code, Skills, Projects, Code Execution, MCP).
5. Ajouter la duree officielle Skilljar sur chaque carte. Une estimation Neopolis differente doit etre etiquetee `Estimation Neopolis`.
6. Pour chaque video, stocker `origin`, `official`, `source_url`, `local_asset_id`, `language`, `captions`, `transcript_id`, `duration`, `checksum` et `tested_at`. Tester image et audio, debut/milieu/fin.
7. Pour chaque telechargement, utiliser un asset local stable, conserver nom, type MIME, taille, checksum et URL source d'audit. Tester HTTP 200, contenu non vide et ouverture reelle.
8. Pour chaque cours, produire une matrice de parite avec chaque ecran source, son bloc cible, son statut (`present`, `adapte`, `exclu_justifie`, `manquant`) et une preuve.
9. Ne pas inventer un lab cloud. Le remplacer par un TP local autonome avec prerequis, installation, donnees, etapes, livrables, validation et correction, ou supprimer toute mention si la reproduction raisonnable est impossible.
10. Les questions doivent etre originales et redigees a partir des objectifs des guides officiels Anthropic.
11. Les points gagnes alimentent les points de competences par tags. Ne pas introduire de XP DataCamp.
12. Indexer chaque cours et ses metadonnees dans la recherche Neopolis.

## Exigences checkpoints et examens blancs

- Respecter exactement le nombre, la duree et le seuil du guide officiel.
- Generer des questions de scenario au niveau candidat qualifie, avec 4 a 6 options plausibles.
- Melanger choix unique et reponses multiples; pour une reponse multiple, annoncer explicitement le nombre de choix attendus.
- Stocker domaine, sous-domaine, objectif du blueprint, difficulte, competence, source pedagogique et version.
- Donner apres soumission une explication de la bonne reponse et une explication specifique pour chaque distracteur.
- Ne jamais exposer `correct_answer` ou `rationale` dans le HTML/JSON public avant soumission; correction cote serveur.
- Randomiser ordre des questions/options, utiliser plusieurs variantes parametrees et detecter les doublons semantiques.
- Les checkpoints doivent tester la lecon qui precede; le mock doit respecter la ponderation globale du blueprint.
- Ajouter mode entrainement avec feedback immediat et mode examen sans feedback, avec rapport final par domaine.
- Pour CCAR-F, construire 6 familles de scenarios et tirer 4 scenarios par tentative, conformement au guide officiel.

## Gate de controle avant le cours suivant

- Zero ecran source manquant sans justification approuvee.
- Zero lien 404; zero media muet, noir ou non demarrable.
- Toutes les interactions utilisables au clavier et sur mobile 390 px.
- Progression et verrouillage testes avec un compte vierge et un compte en reprise.
- Version EN et FR verifiees; pas de texte brut Markdown, symbole parasite ou libelle tronque.
- Rapport de test joint avec captures avant/apres, liste des assets et resultats automatises.


## Protocole de livraison

1. Commence uniquement par le cours 1.
2. Publie une version testable et fournis la matrice de parite ainsi que le rapport de medias/interactions.
3. Controle toi-meme dans un vrai navigateur desktop et mobile avec le compte apprenant de test.
4. Corrige jusqu'a ce que tous les criteres soient verts.
5. Attends la validation explicite du controleur avant de passer au cours suivant.
6. A la fin du parcours, execute un mock complet et compare la distribution obtenue au blueprint ci-dessus.
