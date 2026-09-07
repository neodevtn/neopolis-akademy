# Audit et remédiation des crashs — 7 septembre 2026

## Périmètre

L’audit exploite le monitoring interne sur les sept derniers jours. Les données ont été regroupées par signature et par famille de route afin d’éviter d’exposer des données d’apprenants, des adresses IP, ou les détails d’une session.

## Constats qualifiés

| Signature | État | Qualification | Traitement |
| --- | --- | --- | --- |
| Import différé `DeferredAuthenticatedOverlays` indisponible | Corrigé | Incident ErrorBoundary observé sur l’onglet Parrainage pendant un ancien bundle | Chargement par export par défaut et récupération unique des bundles obsolètes |
| `insertBefore` / `removeChild` | Protection existante confirmée | Réconciliation React sur bundle ou arbre DOM ancien ; aucune nouvelle récurrence après les correctifs déjà livrés | Rechargement unique avec conservation de l’URL, sans boucle |
| Échec de promesse « Object Not Found … update » | Non reproductible / à surveiller | Deux traces isolées sur `/apply`, sans signature applicative correspondante ni nouveau crash de frontière | Pas de masquage : le monitoring conserve le signal pour une investigation si la signature réapparaît |
| Erreurs de test historiques | Non produit | Artefacts de tests d’intégration déjà exclus des vues opérationnelles | Filtre de monitoring maintenu ; aucune action sur les données réelles |

## Correctif préventif

Les overlays authentifiés sont désormais chargés comme module par défaut au lieu de convertir un export nommé dans le chargeur paresseux. La récupération de bundle obsolète reconnaît aussi les signatures nommées des overlays et du composant de progression de l’accueil. Une anomalie de cache ou de déploiement déclenche donc au plus un rechargement avec les paramètres de navigation conservés, avant toute frontière d’erreur visible.

## Vérifications locales

La route `training?tab=parrainage` a été rejouée localement et affiche le programme sans ErrorBoundary. Le contrat de récupération de bundles couvre maintenant les variantes `default`, `DeferredAuthenticatedOverlays` et `ProcessStepper`. La suite complète a réussi avec 620 tests et 2 ignorés, suivie du contrôle TypeScript.
