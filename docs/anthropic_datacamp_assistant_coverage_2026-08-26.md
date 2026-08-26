# Couverture des assistants et évaluations IA — Anthropic et DataCamp

## Résultat de l’inventaire

Le scan structurel différencie les panneaux d’assistance, qui répondent à une question libre dans le contexte de l’écran, des blocs d’évaluation IA, qui donnent un feedback après une tentative apprenant. Aucun de ces deux types n’est présent dans les cours Anthropic actuellement importés. Aucun panneau d’assistant libre n’est présent dans DataCamp. Treize évaluations IA sont présentes dans trois cours DataCamp et partagent le composant standard d’évaluation.

| Périmètre | Assistants libres | Évaluations IA | Décision |
|---|---:|---:|---|
| Anthropic | 0 | 0 | Aucun correctif local à propager ; le standard partagé reste applicable aux futurs blocs. |
| DataCamp | 0 | 13 | Rendu Markdown standardisé pour consigne, feedback, forces, améliorations et exemple ; seuil de complétion aligné sur `passingScore`. |

## Contrôles rendus

Une évaluation DataCamp représentative a été rejouée sur desktop et mobile avec une réponse fictive suffisamment longue. Le retour obtenu est intégralement lisible, aucun marqueur Markdown brut tel que `**` n’est affiché, et le bloc n’a aucune hauteur maximale ou zone de défilement interne qui pourrait masquer la fin du feedback. La réponse de test a volontairement reçu un score nul, car elle ne répondait pas à l’énoncé de programmation : ce résultat valide que le feedback reste cohérent avec l’exercice et ne prétend pas réussir une réponse générique.

Les contrôles apprenant restent sans commande de modification d’écran. Le comportement administrateur est celui du lecteur commun et a déjà été vérifié par la sonde d’assistants ; il n’est pas modifié par le composant d’évaluation.
