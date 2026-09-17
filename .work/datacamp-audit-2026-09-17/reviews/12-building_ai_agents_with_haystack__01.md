# Revue de contenu — `building_ai_agents_with_haystack__01`

## Conclusion

Le cours n’est pas prêt pour une pratique guidée fiable. Le JSON publié contient **5 activités vidéo et 2 téléchargements**, sans aucun bloc d’exercice interactif ni environnement d’exécution. Il conserve toutefois une préparation générale demandant à l’apprenant de disposer d’un chatbot approuvé, sans fournir d’environnement Haystack, de dépôt, de données, de clés de démonstration, d’installation ou de procédure de vérification. Cette insuffisance de guidage est directement observable dans le JSON. Sources : `client/public/data/courses/building_ai_agents_with_haystack__01.json`, notamment `datacampImport.expected`, les blocs des cinq chapitres et le bloc `environment_preparation`.

## Constats factuels soutenus par les preuves locales

### 1. Écart entre le parcours source annoncé et le parcours réellement présent

La preuve d’alignement locale recense **11 activités source** : cinq vidéos et six activités DataLab. Elle indique que les six DataLab ont été retirées comme non reproductibles et que Neopolis ne contient que **5 activités** (`neopolisActivities: 5`, `intentionallyRemovedActivities: 6`, `runtimeExercises: 6` dans `docs/datacamp_building_ai_agents_with_haystack_alignment_2026-08-28.json`). Le JSON du cours confirme pourtant dans ses métadonnées `activities_extracted: 11` et `LocalEnvironmentExercise: 6`, alors que sa structure ne contient que cinq chapitres, chacun de type `teaching`, avec seulement des blocs `content`, `video` et `download`.

Il s’agit d’une présentation incohérente : les métadonnées du cours décrivent encore les 11 activités et six TP, tandis que le contenu livré ne présente que cinq activités vidéo. La note d’import affirme également que les six TP DataLab ont été « convertis en TP guidés autonomes », mais aucun bloc de TP correspondant n’est présent dans le JSON. Source : `docs/datacamp_haystack_import_notes_2026-08-24.md`.

### 2. Manifeste d’index incohérent avec son propre descriptif

Le manifeste d’index local (`client/src/data/trainingIndex.json`) expose `exerciseCount: 0`, `totalActivities: 5` et `chapterCount: 5` pour le cours et la certification. Leur champ `breakdown` continue cependant d’annoncer « 11 activités », « 6 TP guidés » et « 2 chapitres ». Le script d’enregistrement associé encode la même description contradictoire : `scripts/register-building-ai-agents-with-haystack.mjs`. Cette incohérence peut induire l’apprenant ou l’administration en erreur sur le volume réel, les modalités et le nombre de chapitres.

### 3. Séquence pédagogique incomplète pour la mise en pratique

La preuve d’alignement source ordonne notamment les activités « Dialoguer avec des LLM à l’aide de composants », « Créer votre premier agent », « Connecter des outils à notre agent », « Personnaliser notre agent », « Interroger une base de données SQL » et « Transformer notre pipeline en outil pour les agents ». Elles sont toutes absentes de la structure Neopolis, avec la décision locale `removed_non_reproducible`. Le parcours livré passe donc d’explications vidéo à d’autres explications vidéo, puis à un récapitulatif, sans étape observable de construction, de test ou de progression par compétence.

Le défaut est pédagogique et structurel, pas une affirmation sur le contenu DataCamp en ligne : il est soutenu uniquement par `docs/datacamp_building_ai_agents_with_haystack_alignment_2026-08-28.json` et par l’énumération des blocs du JSON du cours.

### 4. Dépendances externes annoncées sans procédure opératoire

La vidéo d’introduction mentionne OpenAI et la recherche Google via Serper dans son transcript. Le JSON ne fournit toutefois aucune consigne d’installation, aucun fichier `requirements.txt`, aucun exemple de configuration, aucune gestion de variables d’environnement et aucun jeu de données SQL. Le seul texte de préparation demande de préparer « un chatbot IA autorisé » et de ne pas partager de clés API. Il ne permet pas à l’apprenant de reproduire l’agent Haystack décrit, ni de savoir quelles dépendances installer ou comment vérifier le résultat. Sources : `client/public/data/courses/building_ai_agents_with_haystack__01.json`, blocs vidéo de `dc_ch01_act01` et `dc_ch01_act03`.

### 5. Téléchargements présentés sans aide d’usage

Les deux téléchargements sont des PDF de diapositives (`chapter_01_slides.pdf` et `chapter_02_slides.pdf`). Leurs descriptions sont en anglais (« Official course slides provided for this course »), alors que le cours est en français. Le JSON ne précise pas à quel moment consulter chaque document ni quelle activité il soutient. Source : `client/public/data/courses/building_ai_agents_with_haystack__01.json`.

## Préparation à la pratique

**Statut : needs-learner-environment-guidance.** Les médias vidéo et les chemins d’assets sont présents, et les preuves de production locales rapportent cinq leçons Projector et deux téléchargements (`docs/datacamp_building_ai_agents_with_haystack_production_2026-08-28.md`). En revanche, le cours livré ne permet pas d’exécuter les six TP annoncés. La préparation actuelle est une mise en garde de sécurité, pas un guide d’environnement apprenant.

## Correctifs génériques réutilisables par blocs Neopolis

1. Employer un bloc standard **Prérequis et environnement** indiquant le niveau requis, la version Python, les dépendances, la commande d’installation, les variables d’environnement nécessaires, la politique de clés et une commande de vérification sans secret.
2. Employer un bloc standard **TP guidé autonome** avec objectif, contexte, fichiers de départ, étapes numérotées, résultat attendu, critères de réussite, indice progressif et solution ou correction après soumission.
3. Employer un bloc standard **Données et dépendances locales** fournissant un petit jeu de données non sensible, un schéma SQL, les fixtures et les instructions de téléchargement local ou de génération.
4. Employer un bloc standard **Alternative sans API externe** pour permettre l’apprentissage sans compte OpenAI/Serper, avec fournisseur simulé, réponses déterministes ou mode local explicitement signalé.
5. Employer un contrôle de cohérence **index–cours** qui calcule les totaux à partir du JSON et interdit qu’un descriptif annonce 11 activités ou six TP lorsque le cours en expose cinq et zéro exercice.
6. Employer un bloc standard **Transition et validation** entre vidéo et TP : ce que l’apprenant doit réutiliser, l’action à effectuer dans son environnement, la sortie à comparer et la condition de passage.

## Références locales

[1]: `client/public/data/courses/building_ai_agents_with_haystack__01.json` — JSON exact du cours audité.

[2]: `docs/datacamp_building_ai_agents_with_haystack_alignment_2026-08-28.json` — preuve locale d’alignement des activités.

[3]: `docs/datacamp_haystack_import_notes_2026-08-24.md` — notes locales de conversion et d’import.

[4]: `docs/datacamp_building_ai_agents_with_haystack_production_2026-08-28.md` — contrôle local de production.

[5]: `docs/datacamp_haystack_production_status_2026-08-28.md` — statut local de production.

[6]: `client/src/data/trainingIndex.json` — manifeste d’index local.

[7]: `scripts/register-building-ai-agents-with-haystack.mjs` — script local d’enregistrement et de description du cours.

[8]: `scripts/datacamp-importer-core.mjs` — règles locales génériques d’import et d’autonomisation des activités.

> Aucune source DataCamp web ou navigation externe n’a été utilisée. La restauration source locale signale en outre qu’elle n’est pas considérée comme achevée (`docs/datacamp_haystack_source_restore_2026-08-28.md`) ; aucune comparaison factuelle supplémentaire avec une source fournisseur n’est donc revendiquée.

[1] [2] [3] [4] [5] [6] [7] [8]

[1]: client/public/data/courses/building_ai_agents_with_haystack__01.json
[2]: docs/datacamp_building_ai_agents_with_haystack_alignment_2026-08-28.json
[3]: docs/datacamp_haystack_import_notes_2026-08-24.md
[4]: docs/datacamp_building_ai_agents_with_haystack_production_2026-08-28.md
[5]: docs/datacamp_haystack_production_status_2026-08-28.md
[6]: client/src/data/trainingIndex.json
[7]: scripts/register-building-ai-agents-with-haystack.mjs
[8]: scripts/datacamp-importer-core.mjs

