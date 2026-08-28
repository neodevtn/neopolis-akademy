# Contrôle de production — AI for Finance

## État après checkpoint `97f9af06`

Le checkpoint a été créé avec succès, mais le contrôle automatisé de la carte catalogue et de la fiche du cours sur `https://akademy.neodev.click` n’est pas encore validé.

| Tentative | Résultat observé | Décision |
|---|---|---|
| Après checkpoint | La carte publique affiche encore `30 activités` et `20 exercices interactifs` | Ne pas clôturer le contrôle de production |
| Après 30 secondes de propagation | Même métriques anciennes | Attendre et recontrôler |
| Après 60 secondes supplémentaires | Même métriques anciennes | Publier à nouveau une preuve traçable et recontrôler |

La source locale validée comporte **28 activités**, **18 exercices interactifs**, **10 vidéos** et **3 téléchargements**. Tant que la même valeur n’est pas observée depuis le domaine public, aucune affirmation de validation de production n’est faite.

## Contrôle final réussi

Après la seconde diffusion, la sonde de métriques a confirmé sur le domaine public les valeurs attendues, à la fois sur la carte du catalogue et la fiche de la formation : **28 activités**, **18 exercices interactifs**, **10 vidéos** et **3 téléchargements**. La première sonde a également été durcie : elle attend désormais le rendu des métriques de la fiche au lieu de considérer le texte du bandeau de cookies comme un chargement terminé.

| Point de contrôle | Preuve exécutée | Résultat |
|---|---|---|
| Carte catalogue et fiche de formation | `pnpm check:course-metrics` sur `https://akademy.neodev.click` | 28 / 18 / 10 / 3 confirmés |
| TP rubricé | `pnpm check:ai-evaluations` ciblé sur `ai_for_finance__01` | Feedback, Markdown, réponse complète, contrôle apprenant masqué et contribution de compétence confirmés |
| Tri mobile | `pnpm check:ai-for-finance-card-sort` | Placement par clic, verrou, soumission, feedback, déverrouillage et accessibilité confirmés |
| Neuf TP conservés | `pnpm check:ai-for-finance-tps` | 9/9 rubriques valides, seuils cohérents et aucune dépendance interdite visible |

Le contrôle de production est donc conclu. Il atteste l’expérience Neopolis publiée ; la comparaison DataCamp reste fondée sur le manifeste et les preuves d’audit fournies, et non sur une session Mighty-Shadow, qui n’était pas rattachée pendant cette vague.
