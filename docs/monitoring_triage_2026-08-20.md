# Triage du monitoring — 20 août 2026

## Incidents non résolus observés dans Sentry

Le projet `neopolis-akademy` présentait quatre incidents non résolus sur les quatorze derniers jours. Deux incidents client `TypeError: Load failed` sont associés à la route `/apply`, chacun observé une fois il y a deux jours. Les autres incidents sont des erreurs de build et de module serveur, la dernière occurrence remontant également à deux jours ou deux semaines.

| Référence Sentry | Symptôme | Dernière occurrence | Première qualification |
| --- | --- | --- | --- |
| `NEOPOLIS-AKADEMY-12` | `TypeError: Load failed` sur `/apply` | Il y a 2 jours, 1 événement | Échec de chargement de trois chunks JavaScript sur Mobile Safari iOS 15.8.8 ; candidat à la récupération de chunk ou à un incident réseau transitoire. |
| `NEOPOLIS-AKADEMY-11` | `TypeError: Load failed` sur `/apply` | Il y a 2 jours, 1 événement | À comparer avec `-12` afin d’éviter de compter deux fois le même parcours. |
| `NEOPOLIS-AKADEMY-10` | Export manquant `getCompetencyLeaderboard` | Il y a 2 jours, 1 événement | Erreur de module serveur historique, à vérifier contre les exports actuels. |
| `NEOPOLIS-AKADEMY-M` | Erreur de syntaxe `server/routers.ts` | Il y a 2 semaines, 3 événements | Erreur de compilation historique, à vérifier contre l’état TypeScript et build actuels. |

## Détail vérifié — NEOPOLIS-AKADEMY-12

L’événement provient de Mobile Safari 15.6.8 sous iOS 15.8.8, sur `https://akademy.neodev.click/apply`. Les breadcrumbs montrent trois requêtes de chunks échouées : `textarea-CIYYDR1B.js`, `circle-check-big-3LOd5bMY.js` et `select-qb5JA09s.js`. L’erreur est non gérée via `onunhandledrejection`. L’incident ne comporte qu’un événement et un utilisateur, et aucune répétition plus récente n’est visible au moment du triage.

`NEOPOLIS-AKADEMY-11` correspond au même utilisateur, au même navigateur, à la même route et surtout au même `traceId` (`1d846a3814334780b4434e152d072fc6`). Il inclut en plus l’échec du chunk principal `index-Xv3Kw5Ve.js`. Les deux issues doivent donc être traitées comme **un seul échec de chargement de bundles obsolètes ou indisponibles**, et non comme deux défaillances fonctionnelles indépendantes.

## Vérification du verrouillage séquentiel

En prévisualisation, un compte apprenant qui ouvre directement le cinquième cours Developer Foundations sans avoir terminé le quatrième reçoit bien l’écran « Cours verrouillé ». La dérogation ajoutée est donc limitée au rôle administrateur et ne modifie pas la progression imposée aux apprenants.
