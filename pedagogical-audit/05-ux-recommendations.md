# Recommandations UX et techniques

> Ces recommandations visent les causes structurelles qui expliquent plusieurs constats, plutôt qu’une correction isolée par écran.

| Priorité | Problème confirmé | Composants / données concernés | Correction proposée | Effort | Critères d’acceptation |
|---|---|---|---|---|---|
| P0 | Activité obligatoire absente, invisible ou non reliée à son exercice | `LessonViewer`, `ExerciseRenderer`, normalisation des checkpoints | Définir un contrat unique : un checkpoint doit avoir **soit** `exerciseId` valide, **soit** des questions directement rendues ; refuser le contenu à la publication lorsqu’aucun chemin de rendu n’existe. | M | Chaque checkpoint déclaré est visible, répondable, corrigé et son état est utilisé par le verrouillage. |
| P0 | Verrouillage incohérent entre média/activité et navigation | `LessonViewer`, `chapterProgress`, clés de complétion Projector/MP4/YouTube/IA/code | Centraliser la résolution des clés de complétion et couvrir tous les types requis ; rendre impossible un décalage entre la clé marquée complète et la clé vérifiée par Suivant. | L | Pour chaque type obligatoire, Suivant reste verrouillé avant réussite/visionnage et se déverrouille après ; reprise de session conservée. |
| P0 | Validation superficielle d’une réponse libre ou d’une preuve de TP | `CloudExerciseBlock`, services de correction, rubriques | Séparer « réponse saisie » de « activité réussie » ; appliquer une rubrique serveur, une longueur/structure minimale pertinente et une boucle de révision. | L | Une saisie d’un caractère ou une mauvaise réponse ne révèle pas la correction et ne déverrouille pas le chapitre. |
| P0 | Code présenté comme pratique sans exécution ni critère de résultat | `code_repl`, `terminal_sim`, activités Claude Code/API | Offrir un bac à sable contrôlé, ou requalifier en analyse guidée avec preuve manuelle/rubrique ; ne jamais comparer uniquement à une chaîne canonique. | XL | Plusieurs solutions valides passent, les erreurs donnent un feedback exploitable et la progression dépend de la réussite définie. |
| P1 | Ressource annoncée non fournie dans le TP | `cloud_exercise.resources`, médiathèque | Exiger que tout fichier explicitement nommé ait une ressource locale gérée ou une alternative clairement déclarée et indépendante d’un environnement source. | M | Chaque fichier cité est téléchargeable depuis l’écran ou remplacé par une table/donnée de substitution explicitement signalée. |
| P1 | Feedback, indice ou correction stockés mais non affichés | `MatchingExercise`, `OrderingBlock`, `CloudExerciseBlock`, renderers | Mapper systématiquement les propriétés de feedback vers le composant et afficher un retour après tentative ; distinguer réussite, erreur et remédiation. | M | Les champs `hint`, `feedback`, `explanation` et correction sont visibles au bon moment, testés par type de bloc. |
| P2 | Médias sans cadrage ni alternative adaptée à la langue | `YouTubePlayer`, `ProjectorPlayer`, métadonnées vidéo | Rendre obligatoires pour un média requis : objectif avant lecture, durée/langue, question ou synthèse après lecture et alternative textuelle localisée quand nécessaire. | M | Aucune vidéo requise ne peut être publiée sans objectif et stratégie d’accessibilité déclarés. |
| P2 | Localisation fragmentée dans des parcours français | champs i18n de blocs, assets VTT/transcriptions, rubriques | Ajouter un audit de parité des champs visibles et une liste de substitution assumée quand la ressource n’existe qu’en anglais. | M | Aucun texte visible non intentionnellement anglais dans une session FR ; les exceptions sont étiquetées. |
| P2 | Activités et écrans peu distingués visuellement | `LessonViewer`, badges de type, titres de blocs | Afficher de manière stable : **À apprendre**, **À regarder**, **À pratiquer**, **À valider**, puis l’objectif et l’état de complétion. | S | Un apprenant peut identifier le type d’écran, l’action attendue et la condition de passage sans lire le contenu intégral. |

## Éléments les plus touchés

| Type de contenu | Constats associés |
|---|---:|
| `cloud_exercise` | 423 |
| `video` | 389 |
| `code_repl` | 222 |
| `content` | 167 |
| `bucket_sort` | 134 |
| `checkpoint` | 104 |
| `multi_choice_exercise` | 90 |
| `checkpoint_exercise` | 87 |
| `single_choice_exercise` | 53 |
| `knowledge_check` | 43 |
| `chapter` | 42 |
| `resource_review` | 25 |
| `ordering` | 19 |
| `exercise` | 18 |
| `chapter_quiz` | 18 |

## Contrats de non-régression recommandés

1. **Contenu** : toute activité requise possède un énoncé, une action, un résultat attendu et un feedback possible.
2. **Rendu** : chaque type référencé par les JSON est rendu, sinon le pipeline échoue.
3. **Progression** : un test contractuel simule l’état incomplet puis complet pour chaque bloc obligatoire.
4. **Ressources** : tout nom de fichier cité dans un énoncé existe dans `resources` ou est explicitement déclaré indisponible avec alternative.
5. **Langues** : un parcours FR/EN/AR ne rend pas un champ vide ou un fallback non intentionnel dans une zone critique.
