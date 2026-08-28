# Pagination du journal opérationnel

Le journal de la page **Administration → Erreurs client** ne se limite plus aux cinquante événements les plus récents. Son agrégation interroge directement les événements d’apprentissage et les incidents client, applique le filtre de recherche en base puis retourne la page demandée.

| Contrôle | Résultat vérifié |
|---|---|
| Volume consultable | 10 345 événements, répartis sur 414 pages de 25 éléments |
| Navigation | Passage de la page 1 (1–25) à la page 2 (26–50) réussi |
| Recherche | « learning time » retrouve 8 216 événements, sur 329 pages |
| Accessibilité | Boutons précédente/suivante explicitement libellés et désactivés aux bornes |
| Réactivité | Contrôles validés aux formats desktop et mobile 390 × 844 |

Le filtre normalise les séparateurs dans les types d’événements. Une recherche lisible comme « learning time » trouve ainsi le type stocké `learning_time`.
