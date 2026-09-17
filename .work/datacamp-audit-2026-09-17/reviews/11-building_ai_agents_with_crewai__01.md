# Revue de contenu — `building_ai_agents_with_crewai__01`

## Périmètre et preuves locales

Cette revue porte uniquement sur le JSON du cours et les preuves présentes dans le dépôt. Les sources utilisées sont [`client/public/data/courses/building_ai_agents_with_crewai__01.json`](../../../client/public/data/courses/building_ai_agents_with_crewai__01.json), [`docs/datacamp_building_ai_agents_with_crewai_alignment_2026-08-28.json`](../../../docs/datacamp_building_ai_agents_with_crewai_alignment_2026-08-28.json), [`docs/datacamp_crewai_source_restore_2026-08-28.md`](../../../docs/datacamp_crewai_source_restore_2026-08-28.md), ainsi que le convertisseur [`scripts/datacamp-importer-core.mjs`](../../../scripts/datacamp-importer-core.mjs) et son lanceur [`scripts/import-datacamp-course.mjs`](../../../scripts/import-datacamp-course.mjs). Aucun recours à DataCamp web n’a été effectué.

## Conclusion synthétique

Le périmètre vidéo est **partiellement aligné** avec la preuve locale : le manifeste restauré décrit deux chapitres, sept activités et deux activités vidéo, tandis que cinq activités pratiques Datalab ont été retirées comme non reproductibles. Le JSON conserve bien les deux vidéos, mais il ne contient **aucun TP exploitable** : `exerciseCount` vaut `0` et les cinq activités pratiques attendues ne sont pas représentées. Le principal risque pédagogique est donc une promesse de pratique non tenue dans Neopolis, plutôt qu’une erreur factuelle démontrable sur le contenu source.

## Constats étayés

| Constat | Niveau | Preuve locale |
|---|---:|---|
| La structure conservée est de deux chapitres et deux activités vidéo. Le fichier contient `chapters_expected: 2`, `chapters_extracted: 2`, sept activités attendues, mais seulement deux chapitres d’activité présents dans `lessons`; les deux activités conservées sont de type `VideoExercise`. | Faible | JSON du cours, lignes 4–20, 24–40, 459–489, 846–848 ; preuve d’alignement, lignes 12–24 et 26–49, 146–165. |
| La séquence pédagogique source n’est pas entièrement représentée : les activités locales « Découvrez votre premier agent CrewAI », « Lancer une équipe », « Une mémoire au service des flux », « Constituer des équipes de spécialistes » et « Orchestration de flux multi-équipages » sont absentes. La preuve les classe explicitement `removed_non_reproducible`, et le document de restauration confirme que les cinq activités restantes sont des `DatalabExercise`. | Moyen | Preuve d’alignement, lignes 51–143 ; `docs/datacamp_crewai_source_restore_2026-08-28.md`, lignes 3–6. |
| Le JSON annonce dans ses métadonnées cinq `LocalEnvironmentExercise`, mais ne fournit aucun bloc d’exercice correspondant et termine par `exerciseCount: 0`. Cette présentation est incohérente pour l’apprenant et pour un contrôle de complétude : elle mélange une attente d’import avec un contenu effectivement absent. | Moyen | JSON du cours, lignes 4–20 et 846–848 ; absence vérifiable de blocs `cloud_exercise`, `code_repl` ou autres blocs d’exercice dans les deux activités conservées. |
| La pratique est annoncée mais insuffisamment guidée dans l’environnement de l’apprenant. La vidéo demande d’utiliser un environnement local et cite Python (fonctions, dictionnaires, boucles) et les API, tandis que le seul bloc préparatoire demande seulement de préparer un chatbot IA autorisé. Aucun TP ne fournit commandes d’installation, version Python, paquet CrewAI, variables d’environnement nommées, procédure d’exécution, vérification de sortie, solution ou critères de réussite. | Élevé | JSON du cours, lignes 56–61, 173–180, 199–240 ; la fin du fichier ne contient aucun bloc pratique. Le convertisseur prévoit un guide générique uniquement lorsqu’il construit un `cloud_exercise` (`scripts/datacamp-importer-core.mjs`, lignes 249–279), ce qui ne s’applique ici à aucun bloc présent. |
| Les téléchargements sont présentés de façon incohérente : le chapitre 1 expose un PDF de diapositives comme téléchargement, alors que le chapitre 2 contient une vidéo sans bloc `download`. Ce n’est pas en soi une preuve de fichier manquant, mais cela rend le parcours asymétrique. | Faible | JSON du cours, lignes 442–454 et 489–499 ; règle d’ajout du téléchargement seulement à la première activité d’un chapitre dans `scripts/datacamp-importer-core.mjs`, lignes 430–438. |
| La preuve locale ne signale ni laboratoire externe, ni média externe, ni activité cloud, et ne fournit aucun candidat de rubric locale. Il ne faut donc pas présenter les cinq suppressions comme une reprise pédagogique inexacte : la preuve les justifie comme non reproductibles dans l’import actuel. | — | Preuve d’alignement, lignes 12–24, 51–68, 70–143. |

## Présentation et interactions

Les deux éléments conservés sont des vidéos obligatoires (`requiredBeforeAdvance: true`) avec transcript et diapositives. La vidéo d’introduction contient une longue série de diapositives dont plusieurs titres sont répétés (« Créer un studio de contenu IA », « Votre formateur pour ce parcours », « Construire bloc par bloc », « Prêt à rejoindre l’équipe ? ») et dont certains fragments de transcript sont très courts (« analyze, », « role, », « goal, »). Cela peut nuire à la lisibilité, mais constitue une observation de présentation du JSON, pas une preuve que la source originale est incorrecte. Le second chapitre est réduit à une vidéo de félicitations, sans activité de consolidation ni interaction observable.

## Insuffisance de préparation au TP

La conclusion opérationnelle est **needs-learner-environment-guidance**. Un apprenant peut regarder les vidéos, mais ne peut pas suivre les activités annoncées dans son propre environnement à partir du cours importé : les cinq Datalab ont été supprimées et aucun substitut Neopolis n’est fourni. Le texte de sécurité sur les clés API est utile, mais il ne remplace pas un parcours reproductible : prérequis, installation, configuration, données d’entrée, commande de lancement, résultat attendu et dépannage manquent tous au niveau effectivement livré.

## Correctifs génériques réutilisables

1. Remplacer toute activité pratique supprimée par le bloc standard **TP environnement apprenant** : objectif observable, prérequis, version/runtime, installation, configuration par variables d’environnement, étapes numérotées, commande d’exécution, sortie attendue, vérification et solution de référence.
2. Ajouter le bloc standard **contrôle de disponibilité** avant le TP : vérification de Python, du paquet requis, des identifiants et d’un appel minimal non sensible, avec message d’erreur et résolution.
3. Ajouter le bloc standard **adaptation sans secret** : emplacement exact où renseigner ses propres clés, rappel de ne jamais les coller dans la réponse, et alternative sans clé lorsque le fournisseur le permet.
4. Ajouter le bloc standard **validation de résultat** : critères de réussite indépendants du fournisseur, exemple de sortie anonymisé, auto-évaluation et possibilité de reprise.
5. Uniformiser les ressources par chapitre avec le bloc standard **ressource téléchargeable contextualisée** : titre et langue cohérents, usage du PDF expliqué, et indication explicite lorsque le chapitre ne comporte aucune ressource.
6. Corriger les métadonnées de complétude afin de distinguer clairement « activités source supprimées » et « activités disponibles dans Neopolis » ; ne pas afficher cinq exercices locaux si `exerciseCount` reste nul.

Cette revue ne recommande ni la restauration automatique des Datalab, ni l’invention de consignes absentes de la preuve source ; elle recommande uniquement des blocs Neopolis génériques pour rendre une éventuelle adaptation praticable et vérifiable.

## Références locales

- [`client/public/data/courses/building_ai_agents_with_crewai__01.json`](../../../client/public/data/courses/building_ai_agents_with_crewai__01.json)
- [`docs/datacamp_building_ai_agents_with_crewai_alignment_2026-08-28.json`](../../../docs/datacamp_building_ai_agents_with_crewai_alignment_2026-08-28.json)
- [`docs/datacamp_crewai_source_restore_2026-08-28.md`](../../../docs/datacamp_crewai_source_restore_2026-08-28.md)
- [`scripts/datacamp-importer-core.mjs`](../../../scripts/datacamp-importer-core.mjs)
- [`scripts/import-datacamp-course.mjs`](../../../scripts/import-datacamp-course.mjs)

*Les numéros de lignes cités renvoient aux sorties de lecture du dépôt au moment de l’audit.*
