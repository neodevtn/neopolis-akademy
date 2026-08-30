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

## Contrôles de publication

La procédure est protégée par les droits administrateur : un appel sans session reçoit `HTTP 403`. Après publication, une session QA administrateur a obtenu `HTTP 200` sur le catalogue et la réponse contenait les objets KPI agrégés. Le navigateur local administrateur confirme leur affichage dans la colonne dédiée du catalogue. Les apprenants et visiteurs ne reçoivent ni la colonne ni les données, car l’agrégation est uniquement exposée par la procédure administrateur.

La sonde administrateur à 390 × 844 confirme que la colonne KPI, une ligne renseignée et l’état **Pas encore de données** sont réellement rendus. La capture dédiée montre des lignes avec **démarrages**, **actifs/minutes** et **abandons/taux** — par exemple `1 démarrage`, `1 actif · 7 min`, `0 abandon · 0 %` — ainsi que des lignes vides. Le document reste contenu dans le viewport (`clientWidth = 390`, `scrollWidth = 390`). Le tableau garde une largeur interne de 1 325 px dans un conteneur de 356 px : ce défilement horizontal local est intentionnel pour préserver toutes les colonnes d’administration sans provoquer de débordement de page.
