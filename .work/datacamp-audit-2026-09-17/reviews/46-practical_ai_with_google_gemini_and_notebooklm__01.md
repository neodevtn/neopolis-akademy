# Revue de contenu — `practical_ai_with_google_gemini_and_notebooklm__01`

## Conclusion

Le cours est **structurellement aligné avec les preuves locales disponibles** : quatre leçons, 48 activités et 15 vidéos sont attendues et retrouvées. L’audit local signale 33 exercices interactifs, 73 médias tous locaux, une progression verrouillée séquentiellement et aucune erreur, aucun média invalide, aucun bloc inattendu ni laboratoire déclaré sous-préparé [1]. Aucun défaut factuel de reprise pédagogique ne peut donc être établi à partir des seules preuves locales autorisées.

La réserve principale concerne la **préparation à la pratique dans l’environnement de l’apprenant**. Le cours contient cinq activités d’évaluation de prompts, mais elles demandent surtout de formuler une requête à Gemini ; elles ne demandent pas explicitement de réaliser, conserver et vérifier le résultat dans le compte Google ou le document de l’apprenant. La préparation générale impose bien un navigateur récent, un compte autorisé, un dossier de test non sensible, une copie des originaux et une vérification des faits, mais elle reste regroupée dans un bloc introductif plutôt que reprise comme procédure opérationnelle au moment de chaque TP [2].

## Constats étayés par le JSON et les preuves locales

### Structure et séquence

Le fichier de cours déclare quatre chapitres et 48 activités attendues et extraites, avec les types d’exercices attendus : 15 vidéos, 10 QCM simples, 15 classements, 5 évaluations de prompts et 3 exercices visuels [2]. L’audit d’import indépendant confirme les mêmes volumes et indique que la séquence est verrouillée. La structure ne présente donc pas d’écart démontrable avec la preuve locale [1] [2].

### Interactions et modalités des TP

Les cinq `ai_evaluation` demandent notamment de rédiger un e-mail de présentation, une publication LinkedIn, une consigne structurée, des instructions système pour un Gem et une invite pour « Help me write » [2]. Le manifeste d’interactions confirme que l’évaluation porte sur des critères textuels tels que la présence d’une tâche, d’un contexte, d’une cible ou d’une structure de sortie ; il ne prévoit ni remise de fichier, ni vérification d’un document Google Docs, ni preuve de l’exécution de Gemini [3]. Il s’agit d’une **insuffisance de guidage observable**, pas d’une erreur factuelle de source.

Les nombreux `bucket_sort` évaluent la catégorisation ou la reconnaissance d’un usage de Gemini. Ils renforcent la compréhension conceptuelle, mais ne constituent pas, à eux seuls, une procédure guidée dans Gmail, Docs, Sheets, Slides, Gemini ou NotebookLM [2]. Cette limite est particulièrement importante pour le chapitre NotebookLM : le JSON fournit une préparation générale et des activités de classement/QCM, sans TP déclaratif demandant de créer un notebook, d’ajouter les sources de test, de poser une question et de contrôler une citation [2].

### Présentation et téléchargements

Les quatre blocs de téléchargement de diapositives ont des titres français mais conservent `Chapter 1 slides`, `Chapter 2 slides`, `Chapter 3 slides` et `Chapter 4 slides`, ainsi qu’une description uniquement en anglais (« Official course slides provided for this course. ») [2]. C’est une incohérence de présentation directement observable ; elle ne permet toutefois pas d’affirmer que le contenu des PDF est inexact.

Les URL des vidéos, sous-titres et PDF sont des chemins `/api/assets/...`. L’audit local confirme que les 73 médias référencés sont locaux et valides [1]. Aucun défaut de téléchargement ou de dépendance externe n’est donc démontré. Le cours demande un compte Google autorisé et l’usage de services Google, mais cette dépendance est explicitement signalée dans le bloc « Avant de commencer » [2].

## Risque pédagogique

**Niveau : moyen.** La formation est exploitable pour suivre une progression de découverte et pratiquer la rédaction de prompts dans le champ de réponse. Elle est moins prête pour une pratique autonome reproductible : l’apprenant ne reçoit pas, au niveau de chaque activité, de séquence « ouvrir l’outil → créer le support → utiliser le prompt → vérifier la sortie → sauvegarder/consigner la preuve → valider ». L’absence de consigne locale dans les hints des cinq `ai_evaluation` est également visible dans le JSON (`hint.fr` vide) [2] [3].

## Correctifs génériques réutilisables par blocs Neopolis

1. Ajouter avant chaque TP pratique un bloc standard **Environnement requis** indiquant l’outil à ouvrir, le compte autorisé, le support à créer, les données de test non sensibles et une solution de repli si la fonctionnalité n’est pas disponible.
2. Ajouter un bloc standard **Procédure en cinq étapes** : préparer, exécuter, inspecter, corriger et conserver la sortie. Le champ de réponse doit demander une trace minimale réutilisable, par exemple le prompt final et deux observations de vérification.
3. Ajouter un bloc standard **Critères de réussite** séparant la qualité du prompt, l’utilisation effective de l’outil, la vérification factuelle et la capacité à expliquer une modification apportée à la sortie.
4. Ajouter un bloc standard **Sécurité et confidentialité** au point d’usage, avec rappel de ne pas envoyer de données sensibles et de travailler sur des fichiers de test.
5. Localiser les titres et descriptions des téléchargements en français, ou afficher explicitement la langue originale du document au lieu de mélanger titre français et description anglaise.
6. Pour NotebookLM, utiliser un bloc pratique réutilisable demandant de créer un notebook de test, d’importer deux sources non sensibles, de poser une question, de relever une citation et de comparer la réponse aux sources.

## Références

[1]: `docs/gemini_notebooklm_import_audit.json` "Audit local d’import Gemini et NotebookLM"

[2]: `client/public/data/courses/practical_ai_with_google_gemini_and_notebooklm__01.json` "Cours Neopolis importé — IA pratique avec Google Gemini et NotebookLM"

[3]: `docs/gemini_notebooklm_interactions_manifest_extract.json` "Extrait local du manifeste des interactions Gemini et NotebookLM"

[4]: `scripts/import-datacamp-course.mjs` "Script local d’import DataCamp"

## Statut

- **Preuve locale :** partielle pour l’examen de fidélité détaillé, mais suffisante pour confirmer la structure et l’intégrité des médias.
- **Préparation pratique :** nécessite un guidage de l’environnement apprenant.
- **Aucun fichier de cours modifié.**
