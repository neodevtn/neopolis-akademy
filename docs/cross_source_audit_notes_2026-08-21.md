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

## 22. DataCamp — IA pratique avec Google Gemini et NotebookLM

Le rapport croisé classe cette formation en **Critical** : il signalait une carte à 33 activités au lieu de 48, une première vidéo locale instable et l’exigence de vérifier que chaque activité non vidéo reste réellement answerable. Les données canoniques du cours recensent 4 chapitres, 48 activités, 15 vidéos, 15 tris interactifs, 10 QCM, 5 activités de prompting et 4 téléchargements.

### Preuves finales de conformité — publications `baa3f328`, `0876bf13` et `981ce54a`

| Contrôle | Référence source ou règle | Résultat constaté | Statut |
|---|---|---|---|
| Compteurs catalogue | 4 chapitres, 48 activités, 15 vidéos, 4 téléchargements | La fiche publique affiche `1 cours`, `48 activités`, `15 vidéos`, `4 téléchargements` et une carte cliquable. | Conforme |
| Préparation d’environnement | Prompt de correction, TP autonome | Le premier écran affiche les prérequis Google, le dossier de test non sensible, la vérification des sorties et la séquence Neopolis avant la vidéo. | Conforme |
| Activités interactives | 33 activités non vidéo attendues | 15 tris, 10 QCM et 5 exercices de prompting sont présents ; les 6 QCM simples ont tous des options et une réponse correcte déclarée. | Conforme |
| Médias corrigés | 7 MP4 instables signalés | Les 7 vidéos ont été restaurées depuis le ZIP Drive canonique sous des clés ASCII sûres ; `ffprobe` confirme une piste vidéo et une piste audio sur chaque fichier. | Conforme |
| Lecture de production | Tous les médias locaux doivent être lisibles | Les 8 vidéos non modifiées répondent HTTP `206`, type `video/mp4`. Le contrôle de reprise des 7 vidéos réuploadées confirme 7/7 lisibles via `/api/assets/`, au premier essai lors de l’audit de clôture. | Conforme |
| Reprise streaming | Erreurs de stockage transitoires | Le proxy réessaie cinq fois, renouvelle une signature après échec et réutilise une signature éphémère par média. Tests automatisés : 18 réussis. | Conforme |
| Mobile | Lisibilité et actions visibles | À 375 × 812, la préparation, le lecteur, les slides PDF, la transcription, le téléchargement et la navigation restent visibles sans troncature. | Conforme |

Le cours conserve la progression séquentielle, les tags de compétences du chapitre, les modalités de validation existantes et les liens de médias locaux `/api/assets/`. Aucun écart critique du rapport croisé ne reste ouvert pour cette formation.

## 28. DataCamp — Prompt Engineering avec l’API OpenAI

Le rapport croisé classe cette formation en **Critical**. Il compare les **55 exercices** et **15 vidéos** de la source DataCamp à une carte Neopolis auditée à **4 chapitres et 0 activité**, ainsi qu’à une page de formation affichant **1 cours, 4 chapitres, 0 activité, 40 exercices, 15 vidéos et 4 téléchargements**.

Les preuves visuelles du PDF montrent la fiche DataCamp avec un cours complet et un premier écran vidéo, alors que la capture Neopolis historique affiche bien le premier écran pédagogique mais conserve une fiche de catalogue incohérente à **0 activité**. La page de contrôle technique indique aussi qu’au moment de l’audit, le premier écran source exposait **9 boutons**, contre **10 boutons** côté Neopolis, avec un média principal détecté en **mp3** et non comme vidéo visible sur le premier écran.

Les exigences de correction sont donc : rétablir les compteurs catalogue à **55 activités**, confirmer que le cours publié expose un écran answerable pour chaque activité non vidéo, vérifier l’intégrité des médias locaux du premier écran (audio, sous-titres, PDF) et conserver la préparation d’environnement ainsi que le verrouillage séquentiel Neopolis sans UI libre.

### Preuves finales de conformité — publications `9a35f82e`, `63eef6fe`, `02c7a31c` et `9c66c1b7`

| Contrôle | Référence source ou règle | Résultat constaté | Statut |
|---|---|---|---|
| Rattachement catalogue | 4 chapitres, 55 activités, 15 vidéos, 4 téléchargements | La fiche publique affiche `1 cours`, `55 activités`, `15 vidéos`, `4 téléchargements` et une carte cliquable. | Conforme |
| Navigation profonde | Identifiant et JSON de cours cohérents | Le cours charge sur `/training/datacamp_prompt_engineering_with_the_openai_api/prompt_engineering_with_the_openai_api__01` après alignement du courseId et du nom de fichier, avec repli temporaire sûr vers le nom historique pendant propagation. | Conforme |
| Préparation d’environnement | Prompt de correction, TP autonome | Le premier écran affiche les prérequis Python/OpenAI, la protection des clés API et des données, ainsi que la méthode de vérification attendue. | Conforme |
| Activités answerable | 40 activités interactives attendues | 37 exercices de code et 3 TP autonomes sont rendus par des blocs Neopolis avec consignes, validation et règles de complétion. | Conforme |
| Média local | 15 médias de cours | Les 15 pistes audio locales répondent HTTP `206`, type `audio/mpeg`; le premier écran affiche audio, sous-titres, transcription et slides PDF. | Conforme |
| Verrouillage séquentiel | Règle Neopolis | Les 4 leçons sont visibles, avec le premier chapitre en cours et les suivants verrouillés tant que la progression ne les débloque pas. | Conforme |
| Mobile | Lisibilité et actions visibles | Vérification à 375 × 812 : en-tête, progression, préparation et contrôles de cours sont utilisables ; le bandeau de consentement reste présent sans masquer les contrôles permanents. | Conforme |
| Tests | Régression catalogue et repli de fichier | Vitest : 14 tests ciblés réussis ; TypeScript et validation des cours sans erreur. | Conforme |

Aucun écart critique résiduel du rapport croisé ne reste ouvert pour cette formation.

## 29. DataCamp — Initiation à l’automatisation de workflows avec n8n

Le rapport croisé classe cette formation en **Critical**. Il compare les **32 exercices** et **10 vidéos** de la source DataCamp à une carte Neopolis auditée à **3 chapitres et 0 activité**, ainsi qu’à une page de formation affichant **1 cours, 0 chapitre, 0 activité, 10 vidéos et 3 téléchargements**.

Les preuves visuelles du PDF montrent la fiche DataCamp complète, puis un premier écran source avec instructions, inputs et blocs d’activité, alors que la capture Neopolis historique montrait déjà un premier écran pédagogique mais avec un comptage de progression incohérent sur la fiche de formation. La page de contrôles techniques du rapport signale que le premier écran Neopolis exposait bien un média local lisible (`mp4` HTTP 200, PDF HTTP 200), mais que les compteurs structurels restaient à zéro sur la fiche de cours.

Les exigences de correction sont donc : réaligner la fiche catalogue et la page formation sur **32 activités**, confirmer les **3 chapitres** et **10 vidéos**, vérifier que chaque TP et activité interactive reste réellement answerable dans le parcours publié, préserver la préparation d’environnement n8n déjà ajoutée, et conserver le verrouillage séquentiel Neopolis sans UI libre.

Après purge du cache utilisateur, le contrôle public de la fiche n8n confirme la propagation du bundle attendu : **1 cours, 32 activités, 10 vidéos et 3 téléchargements**. La carte de cours affiche désormais **3 chapitres · 32 activités · 10 vidéos · 3 téléchargements**, avec `22` exercices interactifs maintenus dans le détail. Le parcours public charge bien les trois leçons et conserve le mode de révision administrateur, le verrouillage séquentiel apprenant et les TP n8n à consigne, critères, ressources, champ de preuve et bouton de validation.

Le QCM `ch03_ex09_mcq` (« Faut-il automatiser ce processus ? ») a été reconstruit depuis `chapter_03_intelligent_automation_with_llms_canonical.json` : quatre options, la réponse `a`, une correction et quatre feedbacks sont présents et couverts par test. La tentative de lien direct vers ce QCM depuis une leçon verrouillée conserve le lecteur sur le parcours autorisé ; ce comportement est cohérent avec le verrouillage séquentiel Neopolis et ne constitue pas une régression du QCM.

### Preuves finales de conformité — publications `726f1ff5`, `87e45731` et `d6266247`

| Contrôle | Référence source ou règle | Résultat constaté | Statut |
|---|---|---|---|
| Compteurs catalogue | 3 chapitres, 32 activités, 10 vidéos, 3 supports | La fiche publique et la carte affichent `3 chapitres · 32 activités · 10 vidéos · 3 téléchargements`. | Conforme |
| Activités interactives | 17 TP, 3 tris, 2 QCM | Le JSON contient 17 `cloud_exercise`, 3 `bucket_sort` et 2 QCM ; le QCM Acme restauré a quatre options, une réponse correcte et quatre feedbacks. | Conforme |
| Préparation n8n | TP autonome requis | Le premier écran ajoute les options n8n Cloud/Docker, l’espace de test, la protection des secrets et les ressources locales. | Conforme |
| Médias locaux | 8 MP4 et 2 MP3 | Audit Range public : 10/10 répondent HTTP `206` avec types `video/mp4` ou `audio/mpeg`. | Conforme |
| Supports PDF | 3 supports locaux | Les trois liens PDF sont calculés dynamiquement depuis les ressources et visibles comme téléchargements. | Conforme |
| Progression | Verrouillage séquentiel | La navigation directe ne contourne pas une leçon verrouillée ; les TP affichent consigne, critères, ressources, champ de preuve et validation. | Conforme |
| Réactivité | UI Neopolis existante | Aucun composant libre n’a été introduit ; la grille de fiche et les blocs d’activité utilisent les contraintes responsives existantes. | Conforme |
| Tests | Catalogue, proxy, métriques et JSON | Vitest : 17 tests ciblés réussis ; TypeScript et validation des cours sans erreur. | Conforme |

Aucun écart critique du rapport croisé ne reste ouvert pour cette formation.

## 02 — Claude Certified Developer – Fondations

Le rapport High signale un écart structurel entre la référence détaillée et Neopolis : **30 exercices visibles contre 35 attendus**, pour **5 cours** et **37 vidéos**. La fiche et la page formation Neopolis affichent actuellement **51 chapitres**, ce qui semble cohérent côté volume de parcours, mais l’audit demande explicitement de **restaurer tous les exercices, checkpoints et corrections** à partir de la source officielle et des exports locaux, sans se limiter aux compteurs actuellement publiés.

Les preuves visuelles indiquent aussi que le premier écran de certification reste surtout un écran de lecture/navigation, ce qui est acceptable, mais que **les écrans suivants doivent rester answerables** avec composants de réponse, validation, feedback et règles de complétion. Le rapport technique précise qu’aucune balise vidéo n’est présente sur le premier écran Neopolis, ce qui confirme que le premier travail doit porter sur la **couverture des exercices/checkpoints** plus que sur un média manquant au tout début du parcours.

### Décision de contrôle — conservation des enrichissements intentionnels

L’inventaire actuel des cinq JSON Developer confirme **30 blocs answerable** : 5 QCM, 10 checkpoints et 15 autres activités évaluables. La page Skilljar actuellement accessible confirme les cinq cours et leurs objectifs pédagogiques, mais ne révèle pas les cinq exercices nommés dans la référence détaillée historique. Aucun export local ne les contient. Par décision explicite du propriétaire, les **checkpoints supplémentaires** et les **vidéos recommandées** déjà présents sont intentionnels et doivent être conservés. Aucun bloc n’est donc supprimé, fusionné ni remplacé sans une source pédagogique détaillée additionnelle.

Le contrôle public non authentifié confirme que le parcours exige une session apprenant ; la vérification end-to-end des tentatives se fera avec un compte autorisé, sans contourner l’authentification. Le risque restant est tracé comme une **différence de comptage historique non attribuable**, et non comme une raison de modifier le contenu existant de façon spéculative.

## 03 — Claude Certified Architect – Fondations

Le rapport High signale un écart de volume plus important encore que sur Developer : **88 exercices visibles contre 176 attendus** dans une référence détaillée historique, pour **7 cours**, **68 vidéos** et **143 téléchargements**. La carte et la page formation Neopolis affichent actuellement les mêmes compteurs visibles, avec **380 chapitres/écrans**, ce qui montre que la structure globale du parcours est déjà dense, mais que la divergence concerne surtout le **nombre d’écrans answerable** et leurs corrections associées.

Les preuves visuelles montrent que le premier écran reste principalement un écran d’introduction/navigation, ce qui n’est pas un problème en soi. Le rapport technique confirme qu’aucune balise vidéo n’est attendue sur ce premier écran et qu’aucun asset média n’est cassé sur l’échantillon audité. La priorité de correction n’est donc pas un média manquant mais la **couverture des exercices, checkpoints et corrections** sur les écrans suivants, en conservant les enrichissements intentionnels déjà ajoutés dans Neopolis.

### Décision de contrôle — divergence de métrique, contenu conservé

Les sept JSON Architect contiennent **88 checkpoints/activités de validation explicitement intégrés**, conformément au compteur aujourd’hui affiché par Neopolis. La banque de quiz associée possède des pools de questions plus larges, dont le lecteur sélectionne un sous-ensemble aléatoire selon les règles de banque ; ce mécanisme ne se confond donc pas avec le compteur de blocs de validation affiché sur la fiche de parcours. La page publique Skilljar accessible confirme les sept cours, mais n’expose pas le détail qui permettrait d’attribuer les 176 éléments de la référence historique à des écrans précis.

Conformément à la consigne explicite, **aucun checkpoint supplémentaire ni aucune vidéo recommandée ne sont supprimés, fusionnés ou remplacés**. Aucun écran n’est ajouté artificiellement pour atteindre un compteur non attribuable. Le risque est enregistré comme une divergence de méthodologie de comptage entre la référence historique, les pools de quiz et les blocs de parcours ; il n’autorise pas une modification spéculative du contenu pédagogique.

## 04 — Claude Certified Architect – Professionnel

Le rapport High signale un écart de volume entre la référence historique et les compteurs visibles de Neopolis : **27 exercices visibles contre 43 attendus**, pour **5 cours** et **33 vidéos**. La page formation Neopolis affiche en outre **56 chapitres/écrans**, ce qui montre que la structure du parcours est déjà complète côté navigation générale, mais que la divergence concerne surtout le nombre d’écrans answerable, checkpoints et corrections comptés par la référence d’audit antérieure.

Les preuves visuelles et techniques indiquent que le premier écran reste un écran d’introduction/navigation, sans média vidéo attendu ni asset cassé dans l’échantillon audité. Comme pour les autres parcours Anthropic, la priorité de correction porte donc sur la **méthode de comptage et la couverture des activités de validation**, sans supprimer les enrichissements Neopolis intentionnels ni inventer de nouveaux exercices sans source attribuable.

### Décision de contrôle — divergence de métrique, contenu conservé

La source Skilljar actuellement accessible confirme les **cinq cours** publiés par Neopolis, avec des objectifs cohérents avec le parcours : conception de solution, intégration d’entreprise, IA responsable, engagement des parties prenantes et enablement de l’équipe. Les cinq JSON actuels contiennent **27 activités answerable** (dont 16 checkpoints) et conservent leurs corrections. La source ne publie toutefois pas les seize exercices individualisés nécessaires pour relier la référence historique de 43 à des écrans précis.

En conséquence, et conformément à la consigne de conservation, aucun checkpoint supplémentaire ni vidéo recommandée n’est touché. Les compteurs visibles restent ceux des blocs/activités réellement présents ; aucune activité n’est créée ou supprimée pour satisfaire une métrique historique non attribuable.

## 05 — DataCamp - Créer des workflows marketing avec n8n

Le rapport High documente ici un écart **attribuable** entre la source et Neopolis, contrairement aux parcours Anthropic précédents : la source DataCamp expose **23 exercices** et **8 vidéos**, alors que Neopolis n’affiche actuellement que **15 activités** pour **8 vidéos**. Les preuves visuelles montrent que le premier écran source est bien une vidéo, et que le premier écran Neopolis reste cohérent côté média local, avec lecture MP4 validée et PDF accessible. Le problème ne porte donc pas sur la lecture média initiale mais sur la **couverture des activités non vidéo manquantes**.

Le rapport technique indique que le premier écran Neopolis possède déjà les composants nécessaires côté bloc standard, et que les médias vérifiés répondent correctement. La priorité devient donc : comparer le JSON publié au manifeste canonique du paquet n8n, identifier les **8 activités manquantes** par type (quiz, checkpoint, lab autonome, autre activité non vidéo), puis les restaurer sans retirer les enrichissements Neopolis intentionnels déjà présents.

### Résolution — correction de sémantique de compteur

La vérification du JSON publié établit que le cours contient déjà **23 chapitres/écrans d’activité** et **15 activités interactives**. Les huit éléments que le rapport identifiait comme absents correspondent en réalité à des écrans pédagogiques non interactifs : le cours n’était pas tronqué. L’écart venait de l’emploi ambigu du libellé « exercices » dans l’audit source, alors que DataCamp emploie ce compteur pour l’ensemble des 23 activités.

La règle de métrique est désormais explicitement couverte par test : pour un cours `datacamp_partner`, le compteur principal utilise les **23 activités canoniques**, tandis que les **15 exercices interactifs** restent un sous-détail. Aucun checkpoint supplémentaire, aucune vidéo recommandée, aucun média ni activité existante n’a été supprimé ou modifié.

## 06 — DataCamp - Automatisation de workflows intermédiaires avec n8n

Le rapport High documente ici un écart du même type que sur le cours n8n Marketing : la source DataCamp expose **40 exercices** et **13 vidéos**, tandis que Neopolis affiche actuellement **27 activités** pour **13 vidéos**. Les preuves visuelles montrent cependant que le premier écran source comme le premier écran Neopolis sont cohérents sur le plan média, et que le MP4 local est valide. Le problème n’est donc pas un défaut de lecture sur l’écran d’ouverture, mais la **sémantique du compteur d’activités** et la couverture des écrans non vidéo.

Le rapport technique confirme que les composants du premier écran sont déjà rendus par la bibliothèque standard Neopolis et que le média principal répond correctement. La prochaine étape consiste à comparer le JSON publié au manifeste canonique pour déterminer si les 27 éléments affichés sont des **exercices interactifs** à l’intérieur d’un parcours plus large de **40 activités**, sans supprimer les enrichissements intentionnels déjà ajoutés.

### Résolution — correction de sémantique de compteur

La vérification du JSON publié confirme **40 chapitres/écrans d’activité**, **13 vidéos** et **27 exercices interactifs**. Aucun écran source n’est absent : l’écart provenait de l’emploi de « 40 exercices » par DataCamp pour désigner le total d’activités du cours, alors que Neopolis affichait seulement le sous-total des activités interactives.

La même règle de métrique partenaire est désormais couverte par test pour ce cours : le compteur principal est **40 activités canoniques**, et les **27 exercices interactifs** demeurent un sous-détail. Aucun checkpoint supplémentaire, aucune vidéo recommandée, aucun média et aucune activité existante n’est supprimé ou modifié.

## 17 — DataCamp - Gemini dans Google Meet

Le rapport High distingue ici deux écarts. Le premier est un écart de contenu apparent : la source DataCamp annonce **13 exercices**, alors que Neopolis n’en expose que **10 activités** sur la page de formation. Le second est un écart d’agrégation : la **carte catalogue n’affiche que 5 activités**, alors que la page formation en affiche 10. Les preuves visuelles confirment en revanche que le premier écran Neopolis est bien cohérent avec la source sur le plan du média local, avec vidéo MP4 et PDF de slides valides ; l’ouverture du parcours ne souffre donc pas d’un défaut de média sur l’écran initial.

Le rapport technique montre que les composants standards du premier écran sont bien rendus et que la page de formation possède déjà **10 activités**. La priorité de correction est donc d’abord de **réconcilier le compteur de carte catalogue avec la page formation**, puis de comparer le JSON publié au manifeste canonique pour déterminer si les 10 activités correspondent déjà à tous les écrans du cours ou si **3 activités supplémentaires** doivent être restaurées depuis la source canonique, sans supprimer les enrichissements intentionnels déjà présents.

### Résolution — manifeste canonique et agrégation catalogue

Le paquet Drive canonique du 21 août confirme strictement **1 chapitre**, **10 activités extraites**, **5 vidéos**, **4 QCM** et **1 activité visuelle**. Les 13 exercices visibles dans l’interface DataCamp n’étaient donc pas une liste de 13 écrans à importer ; aucune activité source ne manque dans le JSON Neopolis. La carte possède déjà `totalActivities: 10` et le rendu partenaire utilise cette valeur plutôt que son sous-total de 5 exercices interactifs.

Cette règle est couverte par un test de non-régression dédié. Les médias MP4/PDF locaux, les QCM et l’activité visuelle restent inchangés, tout comme les checkpoints supplémentaires et les vidéos recommandées intentionnels.

## 18 — DataCamp - Gemini dans Google Sheets

Le rapport High signale ici la même double divergence que pour Gemini Meet : un écart apparent entre la source DataCamp (**16 exercices**) et la page de formation Neopolis (**7 activités**), ainsi qu’un écart d’agrégation entre la **carte catalogue (3 activités)** et la **page formation (7 activités)**. Les preuves techniques montrent néanmoins que le premier écran Neopolis est cohérent sur le plan média, avec MP4 local lisible et PDF de slides valide. Le premier écran n’est donc pas en cause ; la priorité est la **sémantique du compteur** et la comparaison du manifeste canonique au JSON publié.

Le rapport visuel confirme aussi que la page formation affiche déjà **7 activités** et **4 vidéos**. La prochaine étape consiste à vérifier si ces 7 activités correspondent à tous les écrans canoniques du paquet, puis à corriger le **compteur de carte catalogue** s’il continue d’afficher un sous-total d’exercices interactifs au lieu du total d’activités attendues, sans supprimer les enrichissements intentionnels déjà présents.

### Résolution — manifeste canonique et agrégation catalogue

Le paquet Drive canonique du 21 août confirme strictement **1 chapitre**, **7 activités extraites**, **4 vidéos**, **2 QCM** et **1 activité visuelle**. Les 16 exercices visibles dans l’interface DataCamp ne correspondent donc pas à 16 écrans canoniques à importer ; le JSON Neopolis reproduit déjà l’intégralité du manifeste disponible. La carte contient `totalActivities: 7` et le rendu partenaire utilise cette valeur en priorité sur son sous-total de 3 exercices interactifs.

La règle est couverte par un test de non-régression. Les médias MP4/PDF, QCM et activité visuelle restent inchangés, tout comme les checkpoints supplémentaires et les vidéos recommandées intentionnels.
