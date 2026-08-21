# Notes d’audit croisé — 21 août 2026

## 11. DataCamp — Introduction to Agent Skills

- **Sévérité** : Critical.
- **Source officielle** : DataCamp `introduction-to-agent-skills`.
- **Constat principal** : le rapport croisé signale un écart entre la source et Neopolis sur la navigation profonde et les compteurs affichés.
- **Compteurs relevés dans le rapport** : source `18 exercices, 6 vidéos`; carte catalogue Neopolis `3 chapitres, 0 activités`; page formation Neopolis `0 cours, 3 chapitres, 0 activités, 5 exercices, 6 vidéos`.
- **Écarts critiques listés** :
  - 0 activité navigable exposée alors que la source contient 18 exercices.
  - carte catalogue publiée avec 0 activité malgré la présence d’exercices dans le manifeste.
  - aucun lien d’écran ou chapitre profond détecté depuis la page Neopolis.
- **Fondamentaux rappelés par l’audit** :
  - reconstruire depuis `COURSE_MANIFEST.json` et non depuis les compteurs de carte si ceux-ci divergent ;
  - créer un écran Neopolis standard pour chaque activité source ;
  - conserver le verrouillage séquentiel pour les parcours certifiants ;
  - n’utiliser que les blocs standards et la bibliothèque média ;
  - vérifier indexation recherche, tags de compétences, XP et progression ;
  - ajouter un bloc de préparation d’environnement au début du cours.
- **Preuves visuelles du rapport PDF** :
  - page 2 : capture DataCamp de la fiche cours et du premier écran pédagogique ;
  - page 3 : capture Neopolis montrant la fiche cours avec `0 activité` et absence de capture du premier écran pédagogique ;
  - page 4 : contrôle technique indiquant `buttons=7` côté source sur le premier écran contre `buttons=0` côté Neopolis, et absence de balise vidéo visible sur le premier écran Neopolis.

### Contrôle de production après correctif — 21 août 2026

La route profonde `https://akademy.neodev.click/training/datacamp_introduction_to_agent_skills/introduction_to_agent_skills__01` charge désormais le cours. Le premier écran présente le chapitre « Creating Your First Skill », l’activité « Video: What are skills », le lecteur vidéo local, la commande manuelle de complétion, la transcription et la navigation séquentielle `Écran 1 sur 6`.

La fiche de certification restait temporairement servie par un bundle de production antérieur au correctif pendant le contrôle navigateur. La prévisualisation courante affiche bien les compteurs corrigés : **1 cours, 18 activités et 6 vidéos**. Une vérification de propagation supplémentaire reste requise avant de déclarer le cours conforme.

### Preuves finales de conformité — publication `930d31a4`

| Contrôle | Référence source ou règle | Résultat constaté | Statut |
|---|---|---|---|
| Rattachement catalogue | 3 chapitres, 18 activités, 6 vidéos | La fiche publique affiche désormais `1 cours`, `18 activités`, `6 vidéos` et une carte cliquable. | Conforme |
| Navigation profonde | Lien écran/chapitre requis | La carte ouvre `/training/datacamp_introduction_to_agent_skills/introduction_to_agent_skills__01`. | Conforme |
| Préparation d’environnement | Prompt de correction, règle TP autonome | Le premier écran affiche les prérequis Claude Code et le dossier de projet avant la vidéo. | Conforme |
| Verrouillage séquentiel | Règle Neopolis | Les 3 leçons sont visibles avec la première en cours ; les suivantes restent verrouillées tant que la progression ne les débloque pas. | Conforme |
| Vidéo locale | Média local requis | Requête Range sur `ch01_ex01_video_what_are_skills_c29a04fe.mp4` : HTTP `206`, type `video/mp4`, `accept-ranges: bytes`. | Conforme |
| Mobile | Lisibilité et actions visibles | Vérification à 375 × 812 : préparation, lecteur, transcript et navigation sont rendus sans troncature. | Conforme |
| Tests | Régression catalogue et préparation | Vitest : 4 tests ciblés réussis ; TypeScript et validation des cours sans erreur. | Conforme |

Le cours conserve les enrichissements Neopolis exigés : progression séquentielle, bouton de complétion vidéo, transcript et accès administrateur à l’édition contextuelle. Aucun écart critique résiduel n’est constaté sur cette formation après la propagation du second déploiement.

## 12. DataCamp — Model Context Protocol Advanced Topics

Le rapport croisé classe ce cours en **Critical**. Le prompt de correction signale le même triptyque d’écarts que pour Agent Skills : la source DataCamp expose **32 exercices** et **10 vidéos**, tandis que la carte Neopolis auditée affichait **2 chapitres et 0 activité**, la page de formation **0 cours, 2 chapitres, 0 activités, 10 vidéos et 2 téléchargements**, et aucun lien d’écran profond n’était détecté [rapport PDF pages 1 et 3, prompt de correction].

Les preuves visuelles du PDF montrent la fiche DataCamp et le premier écran pédagogique avec une vidéo et des contrôles utilisateur, alors que la capture Neopolis ne montrait encore qu’une fiche vide sans premier écran pédagogique. La page technique du rapport indique, pour le premier écran, **8 boutons** côté source contre **0 bouton** côté Neopolis, ainsi qu’une **absence de balise vidéo visible** sur le premier écran Neopolis [rapport PDF page 4].

Les exigences de correction pour ce cours sont donc déjà fixées : rétablir le rattachement catalogue et la navigation profonde, reconstruire l’ensemble des écrans depuis le manifeste canonique, vérifier les vidéos et téléchargements locaux, puis ajouter au premier écran un bloc standard de préparation d’environnement conforme aux règles d’intégration Neopolis, sans UI libre ni régression sur le verrouillage séquentiel.

### Preuves finales de conformité — publication `73259849`

| Contrôle | Référence source ou règle | Résultat constaté | Statut |
|---|---|---|---|
| Rattachement catalogue | 2 chapitres, 32 activités, 10 vidéos, 2 téléchargements | La fiche publique affiche `1 cours`, `32 activités`, `10 vidéos`, `2 téléchargements` et une carte cliquable. | Conforme |
| Navigation profonde | Lien écran/chapitre requis | La carte ouvre `/training/datacamp_model_context_protocol_advanced_topics/model_context_protocol_advanced_topics__01`. | Conforme |
| Préparation d’environnement | Prompt de correction, activité pratique autonome | Le premier écran affiche les prérequis Python, MCP, environnement virtuel et sécurité des fichiers avant la vidéo. | Conforme |
| Verrouillage séquentiel | Règle Neopolis | Les 2 leçons sont visibles ; la première contient 14 écrans et la seconde reste verrouillée jusqu’à la progression requise. | Conforme |
| Vidéo locale | Média local requis | La première vidéo répond HTTP `206`, type `video/mp4`, avec lecture partielle. | Conforme |
| Support PDF | Support local déclaré | Les slides du chapitre 1 répondent HTTP `206`, type `application/pdf`. | Conforme |
| Mobile | Lisibilité et actions visibles | Vérification à 375 × 812 : préparation, vidéo, transcript, PDF, téléchargement et navigation sont visibles sans chevauchement. | Conforme |
| Tests | Régression catalogue et préparation | Vitest : 6 tests ciblés réussis ; TypeScript et validation des cours sans erreur. | Conforme |

Après la propagation du bundle de production, aucun écart critique résiduel du rapport croisé n'est constaté pour ce cours.

## 14. DataCamp — Claude Code 101

Le rapport croisé attribue à ce cours le niveau **Critical**. Il compare les **37 exercices** et **12 vidéos** de la source DataCamp à une carte Neopolis auditée à **4 chapitres et 0 activité**, et à une page formation affichant **0 cours, 4 chapitres, 0 activité, 12 exercices et 12 vidéos** [rapport PDF page 1, prompt de correction].

Les pages de preuve montrent la fiche DataCamp avec son premier écran de vidéo, tandis que la capture Neopolis historique ne contient pas de premier écran pédagogique. La correction doit reprendre la même discipline : entrée de cours indexée, compteurs canoniques (37 activités, 12 vidéos, 4 chapitres), navigation profonde, préparation d'environnement Claude Code, médias locaux et verrouillage séquentiel préservé.

### Preuves finales de conformité — publication `54c1dbc4`

| Contrôle | Référence source ou règle | Résultat constaté | Statut |
|---|---|---|---|
| Rattachement catalogue | 4 chapitres, 37 activités, 12 vidéos | La fiche publique affiche `1 cours`, `37 activités`, `12 vidéos` et une carte cliquable. | Conforme |
| Navigation profonde | Lien écran/chapitre requis | La carte ouvre `/training/datacamp_claude_code_101/claude_code_101__01`. | Conforme |
| Préparation d'environnement | Prompt de correction, activité pratique autonome | Le premier écran affiche l'installation, l'authentification, le projet jetable et les règles de confidentialité avant la vidéo. | Conforme |
| Verrouillage séquentiel | Règle Neopolis | Les 4 leçons sont visibles ; la première contient 6 écrans et les suivantes restent verrouillées jusqu'à la progression requise. | Conforme |
| Vidéo locale | Média local requis | Trois contrôles Range consécutifs de la première vidéo retournent HTTP `206`, type `video/mp4`. | Conforme |
| Mobile | Lisibilité et actions visibles | Vérification à 375 × 812 : préparation, lecteur, transcript et navigation sont visibles sans chevauchement. | Conforme |
| Tests | Régression catalogue et préparation | Vitest : 10 tests ciblés réussis ; TypeScript et validation des cours sans erreur. | Conforme |

Après la propagation du bundle de production, aucun écart critique résiduel du rapport croisé n'est constaté pour ce cours.

## 13. DataCamp — Introduction to Subagents

Le rapport croisé attribue à ce cours le niveau **Critical**. Il compare les **12 exercices** et **4 vidéos** de la source DataCamp à une carte Neopolis alors auditée à **2 chapitres et 0 activité**, et à une page formation affichant **0 cours, 2 chapitres, 0 activité, 3 exercices, 4 vidéos et 2 téléchargements** [rapport PDF page 1, prompt de correction].

Les pages de preuve illustrent la fiche DataCamp et sa première vidéo, tandis que la capture Neopolis historique ne contient pas de premier écran pédagogique. La correction doit donc reprendre la même discipline : entrée de cours indexée, compteurs canoniques, navigation profonde, préparation d’environnement Claude Code, médias locaux et verrouillage séquentiel préservé.

### Preuves finales de conformité — publication `f66a200d`

| Contrôle | Référence source ou règle | Résultat constaté | Statut |
|---|---|---|---|
| Rattachement catalogue | 2 chapitres, 12 activités, 4 vidéos, 2 téléchargements | La fiche publique affiche `1 cours`, `12 activités`, `4 vidéos`, `2 téléchargements` et une carte cliquable. | Conforme |
| Navigation profonde | Lien écran/chapitre requis | La carte ouvre `/training/datacamp_introduction_to_subagents/introduction_to_subagents__01`. | Conforme |
| Préparation d’environnement | Prompt de correction, activité pratique autonome | Le premier écran affiche les prérequis Claude Code, `/agents`, projet jetable et protection des données avant la vidéo. | Conforme |
| Verrouillage séquentiel | Règle Neopolis | Les 2 leçons sont visibles ; la première contient 6 écrans et la seconde reste verrouillée jusqu’à la progression requise. | Conforme |
| Vidéo locale | Média local requis | Après une réponse transitoire, trois contrôles Range consécutifs de la première vidéo retournent HTTP `206`, type `video/mp4`. | Conforme avec reprise proxy |
| Support PDF | Support local déclaré | Les slides du chapitre 1 répondent HTTP `206`, type `application/pdf`. | Conforme |
| Mobile | Lisibilité et actions visibles | Vérification à 375 × 812 : préparation, lecteur, transcript, PDF, téléchargement et navigation sont visibles sans chevauchement. | Conforme |
| Tests | Régression catalogue et préparation | Vitest : 8 tests ciblés réussis ; TypeScript et validation des cours sans erreur. | Conforme |

Après la propagation du bundle de production, aucun écart critique résiduel du rapport croisé n’est constaté pour ce cours.
