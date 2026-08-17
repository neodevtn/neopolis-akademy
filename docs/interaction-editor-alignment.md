# Alignement global entre lecteur apprenant et éditeur

## Règle de provenance appliquée

L’administration ne présente plus une liste générique d’objets `course.exercises` associés seulement par un champ de chapitre. Pour chaque écran, elle s’appuie désormais sur `resolveEditableInteractions`, qui reflète les sources réellement utilisées par le lecteur : blocs interactifs du chapitre, exercices appelés explicitement par un bloc `checkpoint`, et banque `lessonQuizzes` appelée par `ChapterQuiz`.

Les QCM de validation apparaissent dans une section distincte. Elle indique la taille totale de la banque ainsi que le nombre de questions réellement tirées à chaque tentative. Les exercices historiques non référencés par un checkpoint sont exclus de la vue de l’écran afin d’éviter les incohérences observées dans l’éditeur.

## Couverture auditée

| Élément | Couverture |
|---|---:|
| Cours analysés | 80 |
| Leçons analysées | 551 |
| Chapitres analysés | 1 707 |
| Blocs interactifs | 326 |
| Questions de quiz de chapitre | 2 166 |
| Exercices historiques référencés par checkpoint | 124 |
| Exercices historiques orphelins | 0 |

Le cours `claude_certified_associate_foundations__01` a servi de contrôle visuel. Son écran **Comment Claude se comporte** présente désormais sa banque réelle de 11 QCM et indique que 3 questions y sont tirées aléatoirement par tentative ; les exercices libres historiques non consommés par ce rendu ne sont plus affichés dans cette section.

## Validation

La compilation TypeScript est valide. La suite locale compte **106 tests** réussis, incluant un contrôle du catalogue complet qui vérifie que les 80 cours ne proposent jamais un exercice historique sans checkpoint le référençant. L’audit et le validateur de cours s’exécutent sans erreur ; les avertissements de QCM quasi similaires déjà connus restent inchangés et ne bloquent pas la publication.
