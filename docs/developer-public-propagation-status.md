# État de propagation publique — Developer Foundations

Contrôle par le canal tRPC public avec `Cache-Control: no-cache` après les checkpoints Developer de la fenêtre 80/20.

| Cours | Dernier correctif concerné | État observé publiquement |
|---|---|---|
| Developer 3 | Durée officielle 142 min et métriques vidéo | `officialDurationMinutes: 142`, `durationMinutes: 142` servis publiquement |
| Developer 4 | Checkpoints réassociés et durée officielle 211 min | Les trois références de checkpoint sont déjà valides ; les nouveaux champs de durée ne sont pas encore servis |
| Developer 5 | Checkpoint Packaging et retrait du checkpoint absent, durée officielle 155 min | La réponse publique sert encore les anciennes références et ne contient pas les nouveaux champs de durée |

> Les checkpoints locaux `41ba7b49`, `06590446` et `adaebbaa` sont propres et enregistrés. Aucun correctif supplémentaire ne doit être appliqué sur la seule base de cette révision publique transitoire.

## Mise à jour après propagation

Les trois corrections sont désormais visibles sur le domaine public. Developer 4 retourne `officialDurationMinutes: 211` et `durationMinutes: 211`, avec les checkpoints valides des chapitres 5, 7 et 11. Developer 5 retourne `officialDurationMinutes: 155` et `durationMinutes: 155` ; le seul checkpoint restant est bien Packaging au chapitre 2, associé à l’exercice `__05_002`. Le checkpoint absent du chapitre 13 n’est plus exposé.
