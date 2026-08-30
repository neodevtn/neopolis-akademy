# KPI de catalogue par cours

Les indicateurs sont affichés uniquement dans le catalogue administrateur. Ils ne contiennent aucun nom, courriel ou détail de comportement individuel.

| Indicateur | Définition | Fenêtre / condition |
|---|---|---|
| Démarrages | Nombre d’apprenants distincts ayant au moins une activité persistée sur le cours. | Historique disponible. |
| Actifs | Nombre d’apprenants distincts ayant une activité, progression, vidéo ou complétion sur le cours. | 30 derniers jours. |
| Minutes | Somme des événements `learning_time` associés au cours. | 30 derniers jours. |
| Abandons | Démarrages non terminés qui n’ont plus enregistré d’activité. | Inactivité d’au moins 14 jours. |
| Taux d’abandon | Abandons divisés par démarrages. | Non affiché lorsqu’aucun démarrage n’existe. |

Une formation est considérée terminée lorsqu’un même apprenant a complété toutes les leçons déclarées pour le cours. Un cours sans donnée affiche **Pas encore de données** plutôt qu’une valeur ou un taux estimé.
