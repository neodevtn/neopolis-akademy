# Revue de contenu — `advanced_ai_assisted_coding_for_developers__01`

## Conclusion

L’audit est **partiellement étayé**. Le dépôt contient le JSON du cours et le script générique d’import, mais la recherche locale ne fournit pas de document `datacamp_*alignment*.json`, `datacamp_*source*.md` ou `datacamp_*production*.md` correspondant au slug `advanced-ai-assisted-coding-for-developers`. Il est donc impossible d’établir factuellement une reprise fidèle de la structure, de la séquence ou du contenu DataCamp à partir d’une preuve source locale dédiée.

Le JSON est toutefois exploitable pour constater des insuffisances de guidage apprenant. La pratique est **à renforcer avant de la considérer comme un TP utilisable dans l’environnement propre de l’apprenant**.

## Constats étayés par les fichiers locaux

### 1. Structure déclarée et structure observée

Le fichier de cours déclare trois chapitres, 32 activités, dix vidéos, huit activités `DragAndDropExercise`, neuf `VisualExercise` et cinq QCM (`PureMultipleChoiceExercise`). Les champs `chapters_expected`, `activities_expected_from_outline`, `videos_expected_from_chapter_metadata` et leurs équivalents `*_extracted` concordent, et `failed_pages` est vide ([`client/public/data/courses/advanced_ai_assisted_coding_for_developers__01.json`](../../../../client/public/data/courses/advanced_ai_assisted_coding_for_developers__01.json), lignes 4–23). Cette concordance interne ne constitue pas une preuve d’alignement avec la source DataCamp, faute de manifeste ou de rapport local dédié au cours.

La séquence alterne des activités d’enseignement vidéo et des interactions fermées de type tri, QCM simple ou QCM multiple. Les activités sont marquées `requiredBeforeAdvance: true`, mais le JSON ne contient aucun TP exécutable, terminal intégré, réponse libre, rubrique d’évaluation ou dépôt de projet. Les interactions reposent sur des données scénarisées et des réponses prédéfinies, plutôt que sur l’exécution du travail de l’apprenant dans son propre dépôt ([`client/public/data/courses/advanced_ai_assisted_coding_for_developers__01.json`](../../../../client/public/data/courses/advanced_ai_assisted_coding_for_developers__01.json), notamment lignes 43–57 et les blocs d’activités des trois chapitres).

### 2. Guidage de l’environnement apprenant insuffisant

Le seul bloc de préparation explicite indique de préparer « un chatbot IA autorisé par votre organisation » et de ne jamais partager de données sensibles, mots de passe ou clés API ([`client/public/data/courses/advanced_ai_assisted_coding_for_developers__01.json`](../../../../client/public/data/courses/advanced_ai_assisted_coding_for_developers__01.json), lignes 59–64). Il ne précise pas :

- l’outil ou le modèle compatible ;
- la configuration minimale et les droits nécessaires ;
- un dépôt, jeu de données ou fichier de départ ;
- les commandes d’installation ou d’exécution ;
- les versions de langage et de dépendances ;
- la manière de fournir le contexte au chatbot ;
- le format attendu pour conserver ou vérifier le résultat.

Les diapositives demandent pourtant à l’apprenant d’analyser un dépôt, de lancer une analyse statique ou dynamique, de profiler une application et de proposer des commandes ([`client/public/data/courses/advanced_ai_assisted_coding_for_developers__01.json`](../../../../client/public/data/courses/advanced_ai_assisted_coding_for_developers__01.json), contenu de la vidéo `dc_ch01_act01`, en particulier les diapositives 6–12 et 19–21 du bloc `projectorSlides`). Le JSON ne fournit pas le dépôt Atlas, ses données d’exemple, ni une procédure reproductible permettant de réaliser ces actions. Le scénario Wayfarer Labs/Atlas reste donc une démonstration narrative, non un TP autonome ([même fichier](../../../../client/public/data/courses/advanced_ai_assisted_coding_for_developers__01.json), diapositives 4–5).

### 3. Dépendances, téléchargements et installation

Les vidéos référencent des actifs internes `/api/assets/...` pour MP4, audio, sous-titres et PDF de diapositives. Ces chemins sont des médias Neopolis, pas des dépendances d’installation de l’apprenant. Le JSON ne contient pas de bloc `download` dans la structure inspectée ni de lien externe opérationnel associé au cours ; il ne décrit donc aucun téléchargement de dépôt, paquet ou jeu de données nécessaire à la pratique.

Le script d’import local confirme seulement le mécanisme générique de conversion : il lit un `COURSE_MANIFEST.json`, une racine de paquet et un journal d’upload, remappe les actifs vers des URL relatives, puis écrit le cours converti. Il ne constitue pas une preuve du manifeste source de ce cours ni de la présence d’un laboratoire ([`scripts/import-datacamp-course.mjs`](../../../../scripts/import-datacamp-course.mjs), lignes 1–29).

### 4. Incohérences ou reprises inexactes : preuve insuffisante

Aucun défaut factuel d’alignement DataCamp ne peut être affirmé. La recherche limitée aux preuves locales demandées n’a pas retrouvé de fichier dédié au slug du cours. Les notes et alignements GitHub Copilot présents dans `docs/` concernent un autre cours (`software-development-with-github-copilot`) et ne doivent pas être utilisés comme preuve par substitution ([`docs/datacamp_software_development_with_github_copilot_alignment_2026-08-28.json`](../../../../docs/datacamp_software_development_with_github_copilot_alignment_2026-08-28.json), lignes 3–23 ; [`docs/datacamp_github_copilot_source_notes_2026-08-28.md`](../../../../docs/datacamp_github_copilot_source_notes_2026-08-28.md), lignes 1–6). Les éventuelles différences de titre, d’ordre pédagogique, de nombre d’activités ou de modalités avec DataCamp restent donc **non vérifiables localement**.

## Correctifs génériques réutilisables

1. Ajouter au début de tout parcours de pratique un bloc standard **Préparer mon environnement** : outil autorisé, versions, droits, installation, vérification par commande et solution de repli sans données sensibles.
2. Ajouter un bloc standard **Jeu de départ** : dépôt ou fichiers fournis, arborescence attendue, données synthétiques, commande de lancement et état initial vérifiable.
3. Transformer chaque démonstration d’analyse en fiche TP standard : objectif, contexte à copier dans l’IA, étapes numérotées, commandes, résultat attendu, critères de contrôle humain et livrable à conserver.
4. Ajouter un bloc standard **Sécurité et confidentialité** avec procédure de nettoyage des secrets, données fictives obligatoires et rappel de validation avant exécution d’un correctif généré.
5. Pour chaque dépendance externe ou téléchargement, indiquer la source locale, la version, le hash ou la date de référence, l’installation et une alternative lorsque l’environnement de l’apprenant ne permet pas l’installation.
6. Ajouter une vérification finale standard : l’apprenant compare son résultat à une sortie attendue, documente les écarts et sait quoi faire si le chatbot, le dépôt ou l’outil n’est pas disponible.

## Sources locales consultées

- [`client/public/data/courses/advanced_ai_assisted_coding_for_developers__01.json`](../../../../client/public/data/courses/advanced_ai_assisted_coding_for_developers__01.json)
- [`scripts/import-datacamp-course.mjs`](../../../../scripts/import-datacamp-course.mjs)
- [`docs/datacamp_software_development_with_github_copilot_alignment_2026-08-28.json`](../../../../docs/datacamp_software_development_with_github_copilot_alignment_2026-08-28.json) — consulté pour éviter de confondre une preuve d’un autre cours avec celle du cours audité.
- [`docs/datacamp_github_copilot_source_notes_2026-08-28.md`](../../../../docs/datacamp_github_copilot_source_notes_2026-08-28.md) — même réserve.
- [`docs/datacamp_github_copilot_production_check_2026-08-28.md`](../../../../docs/datacamp_github_copilot_production_check_2026-08-28.md) — même réserve.

Aucun fichier de cours n’a été modifié.

## Références

[1]: ../../../../client/public/data/courses/advanced_ai_assisted_coding_for_developers__01.json "JSON local du cours audité"
[2]: ../../../../scripts/import-datacamp-course.mjs "Script local d’import DataCamp"
[3]: ../../../../docs/datacamp_software_development_with_github_copilot_alignment_2026-08-28.json "Alignement local d’un autre cours, non substitutif"
[4]: ../../../../docs/datacamp_github_copilot_source_notes_2026-08-28.md "Notes locales d’un autre cours, non substitutives"
[5]: ../../../../docs/datacamp_github_copilot_production_check_2026-08-28.md "Contrôle local d’un autre cours, non substitutif"
