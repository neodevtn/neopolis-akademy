# Remédiation — gouvernance des rôles

**Date :** 7 septembre 2026  
**Portée :** attribution des rôles administratifs et traçabilité des changements.

## Constat

Un compte apprenant a été constaté avec le rôle `admin_learner` sans trace correspondante dans le journal administratif. L’horodatage de mise à jour du compte indique un changement antérieur, mais le flux historique de mise à jour du rôle n’enregistrait aucune action : l’auteur du changement ne peut donc pas être établi rétrospectivement de manière fiable.

L’audit de code confirme qu’aucun mécanisme automatique ne promeut un compte standard en `admin_learner`. La mutation administrative était toutefois trop large : un rôle `admin_learner` pouvait l’appeler, ce qui ouvrait un risque d’escalade de privilèges.

## Mesures appliquées

| Mesure | Effet |
|---|---|
| Restauration immédiate du compte concerné au rôle `user` | Suppression de l’accès administratif non attendu, sans suppression des progrès ni des statistiques pédagogiques. |
| Restriction serveur | Seul le rôle `admin` historique, présenté comme administrateur principal, peut désormais modifier un rôle. |
| Transaction journalisée | Chaque modification future écrit, dans la même transaction, le rôle précédent, le rôle suivant, l’administrateur auteur, la cible et la date. |
| Contrôle UI explicite | Dans la fiche d’un apprenant, l’administrateur principal voit une zone **Accès et rôle** et un bouton **Gérer le rôle**. Les autres rôles n’y ont pas accès. |
| Contrats de sécurité | Les tests vérifient que le rôle `admin_learner` conserve ses accès opérationnels et ses statistiques d’apprentissage, mais ne peut pas changer les privilèges. |

## Limite historique

L’absence de journalisation avant cette correction empêche d’identifier avec certitude l’auteur de l’ancien changement. La protection ajoutée garantit la traçabilité des modifications à venir, sans inventer de preuve sur l’événement passé.
