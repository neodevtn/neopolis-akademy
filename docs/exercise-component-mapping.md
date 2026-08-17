# Correspondance des exercices et éditeurs standards

| Donnée ou bloc de cours | Composant d’édition standard | Rendu apprenant associé |
|---|---|---|
| `single_choice_exercise` / `multi_choice_exercise` | `ChoiceQuestionEditor` | QCM à réponse unique ou multiple |
| `bucket_sort` | `BucketSortBlockEditor` | Tri par glisser-déposer |
| `fill_blank` | `FillBlankBlockEditor` | Texte ou code à trous |
| `checkpoint` | `CheckpointBlockEditor` | Point de validation |
| `cloud_exercise`, `exercise`, `code_repl`, `matching` et autres blocs inscrits | Éditeur schématique de `BlockLibrary` | Composant de bloc correspondant |
| Objets historiques `course.exercises` | `LegacyExerciseEditor` | `ExerciseRenderer` |

L’éditeur `LegacyExerciseEditor` n’emploie plus une carte de texte générique. Il expose les mêmes structures prises en charge par `ExerciseRenderer` : réponse libre, scénario, code, QCM à choix unique ou multiples et liste de vérification. Il sépare aussi le contexte, la consigne, les contraintes d’entrée, les critères internes et la correction après tentative.
