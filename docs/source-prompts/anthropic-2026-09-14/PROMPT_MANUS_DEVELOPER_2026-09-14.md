# Prompt Manus - Claude Certified Developer - Foundations (CCDV-F)

Tu dois corriger ce parcours cours par cours, dans l'ordre ci-dessous, sans modifier le cours suivant tant que le gate du cours courant n'est pas vert.

- Source officielle: https://anthropic-partners.skilljar.com/path/claude-certified-developer-foundations
- Cible Neopolis: https://akademy.neodev.click/training/claude_certified_developer_foundations
- Format mock officiel: 53 questions, 120 minutes, seuil 720/1000

## Blueprint officiel

- Agents and Workflows: 14.7%
- Applications and Integration: 33.1%
- Claude Code: 3.1%
- Eval, Testing, and Debugging: 2.6%
- Model Selection and Optimization: 16.8%
- Prompt and Context Engineering: 11.0%
- Security and Safety: 8.1%
- Tools and MCPs: 10.6%

## Plan cours par cours

### 1. MSO Foundations
- Reference officielle: 57 min
- Etat Neopolis: 10 chapitres, 6 exercices interactifs
- Correction prioritaire: Aligner les 10 ecrans sur les 6 sections Skilljar et afficher la duree; conserver MSO comme acronyme canonique avec sa definition.
- Livraison: matrice de parite, correction dans les blocs standards, test complet, captures avant/apres et validation avant le cours suivant.
### 2. Production-Grade Prompting, Agents & Tool Use
- Reference officielle: 209 min
- Etat Neopolis: 12 chapitres, 8 exercices interactifs
- Correction prioritaire: Le volume officiel est long: reconstruire une carte de parite par ecran, ajouter des TP locaux executables et des checkpoints sur agent loop/tool use.
- Livraison: matrice de parite, correction dans les blocs standards, test complet, captures avant/apres et validation avant le cours suivant.
### 3. Claude Code, MCP & Integration
- Reference officielle: 142 min
- Etat Neopolis: 7 chapitres, 3 exercices interactifs
- Correction prioritaire: Le ratio 3 exercices pour 142 minutes est faible; ajouter des TP locaux Claude Code/MCP avec fichiers de depart et corrections expliquees.
- Livraison: matrice de parite, correction dans les blocs standards, test complet, captures avant/apres et validation avant le cours suivant.
### 4. Production Engineering, Evals & Security
- Reference officielle: 211 min
- Etat Neopolis: 10 chapitres, 6 exercices interactifs
- Correction prioritaire: Verifier observabilite, jeux d'eval, regression, red teaming et securite; fournir artefacts telechargeables et criteres d'acceptation.
- Livraison: matrice de parite, correction dans les blocs standards, test complet, captures avant/apres et validation avant le cours suivant.
### 5. Accelerators & IP Contribution
- Reference officielle: 155 min
- Etat Neopolis: 12 chapitres, 7 exercices interactifs
- Correction prioritaire: Verifier packaging, reutilisation, revue IP et deploiement; ajouter une etude de cas de livraison complete.
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
