# Validation du reporting graphique

## Contrôles réalisés — 17 août 2026

La compilation TypeScript est valide et la suite Vitest passe avec **93 tests**. Deux tests unitaires supplémentaires vérifient les règles de calcul du taux de réussite au premier essai et les bornes de répartition d’implication. Un test d’intégration protège aussi le contrat tRPC administrateur sur une période de 7 jours.

La base contient déjà des données réelles exploitables pour l’état initial du reporting : **35 événements** d’apprentissage, **4 apprenants** ayant des événements et **60 secondes** de temps suivi. Aucune donnée de démonstration n’a été insérée.

Le navigateur de contrôle atteint bien la route `/admin/training`, mais la session utilisée n’a pas le rôle administrateur et reçoit correctement l’écran « Accès refusé ». Le rendu interne du nouvel onglet ne peut donc pas être confirmé par cette session ; les contrôles TypeScript, unitaires et de contrat de données ont été effectués avant publication.
