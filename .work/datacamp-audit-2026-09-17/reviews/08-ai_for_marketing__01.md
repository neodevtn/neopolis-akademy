# Revue de contenu — `ai_for_marketing__01`

## Conclusion

**Statut de preuve : partiellement aligné. Gravité : élevée pour la mise en pratique, faible pour la structure importée.** Le paquet local confirme la structure canonique (3 chapitres, 29 activités, 10 vidéos, 14 CloudExercise, 2 DragAndDropExercise et 3 QCM), mais la représentation Neopolis contient 27 activités : les deux absences sont explicitement documentées comme des suppressions intentionnelles d’activités non reproductibles. Le défaut principal observable dans le JSON est donc le **guidage insuffisant des TP conservés**, plutôt qu’une reprise structurelle non justifiée.

## Éléments conformes ou justifiés par les preuves locales

Le JSON annonce 3 chapitres et 29 activités attendues/extraites (`client/public/data/courses/ai_for_marketing__01.json:5-23`). La preuve d’alignement locale confirme 29 activités source, 27 activités Neopolis, 0 activité manquante et 2 suppressions intentionnelles (`docs/datacamp_ai_for_marketing_alignment_2026-08-28.json:12-23`). Les activités supprimées sont « As du chiffre » (2.8) et « Mesurer et itérer » (2.13) ; les notes source expliquent qu’elles dépendent respectivement d’un tableur externe et d’interactions Copilot sans jeu de données local/rubrique exploitable (`docs/datacamp_ai_for_marketing_source_notes_2026-08-28.md:3-6`). Il ne s’agit donc pas d’un défaut factuel de reprise à corriger sans nouvelle preuve.

La séquence et les types conservés sont globalement cohérents avec l’alignement : les activités vidéo sont rendues en enseignement vidéo, les CloudExercise en TP, les activités de glisser-déposer en `bucket_sort` et les QCM en exercices de choix (`docs/datacamp_ai_for_marketing_alignment_2026-08-28.json:25-635`). Le manifeste restauré est la référence locale annoncée pour les 3 chapitres et les 29 activités ; la note de restauration interdit de prendre les fichiers de diagnostic comme sources pédagogiques (`docs/datacamp_ai_for_marketing_source_restore_2026-08-28.md:3-5`). Aucun écart factuel supplémentaire ne peut être affirmé à partir des seules preuves autorisées.

## Défauts observables dans le JSON

### 1. TP trop peu guidés dans l’environnement de l’apprenant — défaut principal

Les 12 CloudExercise conservés ont `instructions: ""`, `steps: []`, `solution: ""` et `successMessage: ""` (par exemple `client/public/data/courses/ai_for_marketing__01.json:399-441`, puis les occurrences correspondantes aux lignes 460-514, 929-983, 1512-1566, 1579-1633, 1999-2053, 2066-2120, 2456-2510, 3320-3374 ; le motif est répété pour les TP du chapitre 3). Le champ `hint` fournit parfois une invite à copier, mais il ne remplace pas une procédure découpée, un résultat attendu vérifiable ou une consigne de reprise en cas de sortie ambiguë. Le guidage d’environnement se limite à utiliser un assistant IA auquel l’apprenant a accès et à ne pas transmettre de données sensibles (`...json:407-410`), sans préciser un environnement minimal, une alternative lorsque l’outil n’est pas disponible, ni une méthode de vérification locale.

Conséquence pédagogique directement observable : l’apprenant doit quitter ou compléter mentalement l’activité Neopolis pour exécuter le travail dans son propre outil ; l’interface n’explicite pas les étapes à réaliser, les artefacts à produire ni le critère de fin, alors que chaque TP est bloquant (`requiredBeforeAdvance: true`). Ce point est distinct d’un défaut de source : il s’agit d’une insuffisance de guidage de l’adaptation Neopolis, constatée dans le JSON lui-même.

### 2. Évaluation trop permissive par rapport à certains objectifs annoncés

Le premier TP demande d’« identifier 10 cas d’usage » (`...json:405`), tandis que son unique critère vérifie seulement la présence d’une demande de liste de cas d’usage marketing, avec `minWords: 1` (`...json:429-441`). Ce critère ne vérifie pas le nombre 10 ni la qualité minimale de la liste. Le TP suivant demande en plus deux domaines et un tableau (`...json:466-486`), mais les critères indiquent que d’autres fonctions marketing ou un autre format font quand même réussir l’apprenant (`...json:490-514`). C’est une incohérence observable entre objectif, consigne et réussite ; elle est à traiter comme une faiblesse de rubric standard, sans prétendre que la source DataCamp évaluait autrement.

### 3. Présentation localisée incohérente

Des éléments d’interface restent en anglais malgré un cours déclaré `fr-FR` : le téléchargement est titré « Chapter slides » dans le premier TP (`...json:412-423`), plusieurs scripts de vidéos restent en anglais (`...json:82-95`, `...json:120-130`), et une aide mélange français et anglais (« Can't log in? ») (`...json:486`). Cette observation concerne la présentation livrée, non une altération de la séquence source. Elle mérite une harmonisation éditoriale, mais ne justifie pas à elle seule une réécriture pédagogique.

### 4. Répétition de descriptions génériques

La description du cours et celle de nombreuses activités répètent le même paragraphe introductif (`...json:33-36`, `...json:49-51`, `...json:391-393`). Les titres des activités sont spécifiques, mais la description ne donne pas toujours l’objectif opérationnel de l’activité. Cela rend la navigation moins informative ; c’est une incohérence de présentation observable, pas une preuve d’un mauvais ordre pédagogique source.

## Dépendances, téléchargements et installation

Les TP demandent un assistant IA génératif personnel et interdisent les secrets (`...json:407-410`). Les ressources déclarées sont principalement les PDF locaux des diapositives, servis sous `/api/assets/` (`...json:412-423`). Le JSON n’impose pas d’installation de paquet, de clé API ou de téléchargement de données pour les TP conservés. En revanche, certains hints demandent d’importer des fichiers de ressources dans l’assistant (par exemple `customer_pain_points.txt`, `article_outline.pdf` ou `zenleaf_logo.png`, visibles dans les hints des TP du chapitre 2) ; l’activité doit donc indiquer explicitement où trouver ces fichiers et quoi faire si l’outil choisi ne permet pas leur import. La preuve locale signale seulement que les activités 2.8 et 2.13 dépendaient de ressources/produits externes et ont été retirées (`docs/datacamp_ai_for_marketing_source_notes_2026-08-28.md:5-6`).

## Correctifs génériques réutilisables par blocs Neopolis

1. **Bloc `environmentGuide` standard** : prérequis, outil autorisé, alternative sans compte/import, politique de données sensibles, et test de disponibilité avant démarrage.
2. **Bloc `steps` standard pour TP externe** : étapes numérotées « préparer → saisir → observer → vérifier → remettre », avec une consigne distincte pour chaque fichier ou ressource.
3. **Bloc de résultat attendu** : artefact minimal à produire, exemple de forme (sans imposer une réponse unique), et contrôle de complétude adapté à l’objectif quantifié.
4. **Rubrique alignée sur l’énoncé** : vérifier les contraintes réellement demandées (par exemple le nombre d’éléments, le périmètre et le format), au lieu d’un simple seuil d’un mot ; prévoir un feedback expliquant l’écart accepté lorsque l’objectif autorise des variantes.
5. **Bloc de reprise et sécurité** : que faire en cas d’outil indisponible, de fichier impossible à téléverser, de réponse vide ou de résultat non fiable ; rappeler de ne jamais fournir de données confidentielles, secrets ou clés.
6. **Passe de localisation** : titres de téléchargements, boutons cités dans les hints, scripts et messages de réussite en français cohérent ; conserver les noms propres d’outils uniquement lorsqu’ils sont nécessaires.
7. **Description courte par activité** : remplacer les paragraphes génériques répétés par objectif, contexte, livrable et prérequis propres à l’activité.

Aucun fichier de cours n’a été modifié. Sources consultées uniquement dans le dépôt : `client/public/data/courses/ai_for_marketing__01.json`, `docs/datacamp_ai_for_marketing_alignment_2026-08-28.json`, `docs/datacamp_ai_for_marketing_source_notes_2026-08-28.md` et `docs/datacamp_ai_for_marketing_source_restore_2026-08-28.md`.

**Appréciation de préparation pratique : nécessite un guidage de l’environnement apprenant.** Les TP ne sont pas nécessairement inutilisables, mais leur procédure, leurs critères de réussite et leurs solutions de reprise sont trop incomplets pour une exécution autonome fiable.

## Schéma de synthèse

- `courseId`: `ai_for_marketing__01`
- `evidenceStatus`: `partial-evidence`
- `severity`: `high`
- `practiceReadiness`: `needs-learner-environment-guidance`

> La sévérité « élevée » vise l’autonomie pratique des TP ; la structure importée et les deux suppressions sont, elles, documentées et ne sont pas signalées comme erreurs.
