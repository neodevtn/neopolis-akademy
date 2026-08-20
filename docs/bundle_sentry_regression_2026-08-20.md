# Régression de bundle et visibilité Sentry — 20 août 2026

**Auteur :** Manus AI  
**Statut :** correctif implémenté, validation de production à effectuer après propagation

## Constats

| Élément | Observation | Impact |
| --- | --- | --- |
| Capture fournie | Elle référence `index-gE23kOSs.js`, un bundle historique qui n’est plus l’entrée de production. | Certains navigateurs pouvaient conserver une session exécutant une version périmée. |
| Réponse du bundle historique | `GET /assets/index-gE23kOSs.js` retournait le document HTML de l’application avec HTTP 200 au lieu d’un 404. | Un ancien navigateur pouvait recevoir du HTML à la place d’un module JavaScript, ce qui masque la vraie nature d’un bundle devenu indisponible. |
| Sentry | Les erreurs absorbées par l’`ErrorBoundary` étaient envoyées au monitoring interne, mais pas explicitement à Sentry. | Les emails internes pouvaient signaler un crash sans issue associée dans Sentry. |

## Correctifs

La diffusion statique renvoie désormais un **404 texte** pour tout asset absent sous `/assets/*`, avant le repli de route SPA. Le mécanisme client de récupération de bundle périmé peut donc reconnaître un échec d’asset sans recevoir une page HTML.

`reportBoundaryError` transmet désormais toute exception capturée par l’`ErrorBoundary` à Sentry avec les tags `source=ErrorBoundary` et `error_kind=react_boundary`, ainsi que la pile de composants React lorsqu’elle est disponible. Le reporting interne reste en place.

## Validation locale

Les tests ciblés de récupération de bundle et de remontée ErrorBoundary vers Sentry sont réussis. TypeScript est valide. La vérification finale devra confirmer en production que l’ancien hash répond 404 et qu’une exception de boundary crée une issue Sentry.
