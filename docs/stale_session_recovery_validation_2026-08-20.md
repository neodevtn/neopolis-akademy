# Validation de récupération des sessions obsolètes — 20 août 2026

**Auteur :** Manus AI  
**Statut :** validé en production

Le crash `NotFoundError: insertBefore` signalé depuis `index-DRA6Srom.js` provient d’une session chargée avant les correctifs. Un bundle déjà exécuté ne peut pas recevoir un nouveau mécanisme client sans un premier rafraîchissement.

La version publiée protège les sessions qui basculent ensuite : l’ErrorBoundary reconnaît ce crash précis, déclenche une récupération unique vers une URL fraîche avec cache-buster et évite toute boucle. Les documents HTML de l’application portent maintenant les en-têtes `Cache-Control: no-cache, no-store, must-revalidate`, `Pragma: no-cache` et `Expires: 0`, afin que les prochaines navigations reçoivent l’entrée JavaScript actuelle. Les assets hashés restent distincts ; le bundle historique `index-DRA6Srom.js` répond désormais `404 text/plain` et ne peut plus être interprété comme du HTML.

Validation automatisée : 54 fichiers de tests, 193 tests réussis, TypeScript valide. Validation réseau : en-têtes anti-cache vérifiés sur la route de cours et ancien bundle vérifié en `404`.
