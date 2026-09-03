# Vérification de restauration du compte apprenant

## Constat

Le compte ciblé est actuellement dans le rôle **apprenant**, actif et non bloqué. La commande idempotente de restauration de rôle n’a nécessité aucune modification supplémentaire : le rôle était déjà `user`.

Les données d’apprentissage n’ont pas été supprimées lors du passage temporaire au rôle administrateur. L’inventaire contrôlé confirme la présence de progressions de leçons, de chapitres et de vidéos, d’une tentative d’examen, de contributions de compétences, de succès, d’événements et d’activités. Le total calculé des contributions de compétences est non nul.

## Validation de visibilité

Le parcours de progression personnel récupère ses données à partir de l’identifiant du compte authentifié, sans condition sur le rôle administrateur. Après retour au rôle apprenant, les données persistées sont donc de nouveau accessibles par l’espace Formation. L’accès du compte est actif et le rôle administrateur n’est plus présent.

## Garanties

Aucune progression, tentative, contribution, réussite ou activité n’a été recréée ni modifiée. Aucun autre compte n’a été touché. La vérification a porté uniquement sur le compte ciblé et sur des totaux agrégés.
