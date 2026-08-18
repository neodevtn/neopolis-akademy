# Investigation des crashs client — 18 août 2026

## Candidature `/apply`

L’ouverture de la page en production a d’abord affiché le chargement différé, puis le formulaire complet à l’étape 1 sur 10. Après chargement, aucune erreur n’a été relevée dans la console du navigateur. L’alerte MIME reste donc à corréler avec une ressource chargée de manière transitoire ou une version de bundle antérieure.

## Candidats sélectionnés `/admin/training?tab=selected`

La pile fournie pointe vers les appels `filter` de `SelectedCandidatesPanel`. Cette vue repose sur un contrat paginé dont la collection attendue est `data.candidates`; le correctif doit rendre cette lecture défensive face à une réponse non tabulaire.

## Sentry

Après authentification, Sentry expose trois incidents non résolus pour le projet `neopolis-akademy` : deux erreurs `Load failed` sur `/apply` (dont une correspond à l’échec MIME JavaScript reçu par e-mail) et une erreur serveur fatale antérieure indiquant que `./competencyService` n’exportait pas `getCompetencyLeaderboard`.

L’erreur de chargement de la candidature est compatible avec un document HTML mis en cache qui référence un chunk JavaScript Vite dont le nom haché a changé après publication. La page `/apply` se charge actuellement avec succès ; un mécanisme de récupération unique de bundle obsolète est ajouté pour éviter que l’utilisateur voie l’ErrorBoundary lors de ce cas transitoire.

Le détail Sentry `NEOPOLIS-AKADEMY-12` confirme un rejet de promesse non géré sur Mobile Safari 15.6.8 / iOS 15.8.8 lors du chargement de `/apply`. Les requêtes qui échouent ciblent plusieurs chunks hachés (`textarea`, `circle-check-big`, `select`) provenant du build `index-DMmYFWOx.js`, ce qui confirme qu’il ne s’agit pas d’un champ particulier du formulaire mais d’un chargement de chunks différés après changement de version.

Le second incident de candidature `NEOPOLIS-AKADEMY-11` a été ouvert séparément pour isoler l’erreur MIME signalée par e-mail, qui appartient au même contexte de chargement différé de la page.

L’erreur d’export de compétence date d’avant le checkpoint courant : l’export est bien présent dans le code actuel et fera l’objet d’un contrôle de démarrage serveur.
