# Contrôle de production — AI for Finance

## État après checkpoint `97f9af06`

Le checkpoint a été créé avec succès, mais le contrôle automatisé de la carte catalogue et de la fiche du cours sur `https://akademy.neodev.click` n’est pas encore validé.

| Tentative | Résultat observé | Décision |
|---|---|---|
| Après checkpoint | La carte publique affiche encore `30 activités` et `20 exercices interactifs` | Ne pas clôturer le contrôle de production |
| Après 30 secondes de propagation | Même métriques anciennes | Attendre et recontrôler |
| Après 60 secondes supplémentaires | Même métriques anciennes | Publier à nouveau une preuve traçable et recontrôler |

La source locale validée comporte **28 activités**, **18 exercices interactifs**, **10 vidéos** et **3 téléchargements**. Tant que la même valeur n’est pas observée depuis le domaine public, aucune affirmation de validation de production n’est faite.
