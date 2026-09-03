# Contrôle de bout en bout des acceptations d’invitation

## Portée du contrôle

Deux branches du flux réel ont été testées depuis la page publique d’acceptation, sans envoi d’e-mail et sans toucher aux comptes de production hors démonstration.

| Scénario | Étapes vérifiées | Résultat |
| --- | --- | --- |
| Compte de démonstration existant | Validation du lien, création de mot de passe, acceptation, session, groupe Full access et arrivée à `/training` | Réussi |
| Invité temporaire `invite_demo` | Validation du lien, création de compte, acceptation, session, groupe Full access et arrivée à `/training` | Réussi |

Les deux invitations ont suivi l’interface réelle : ouverture du lien, validation, formulaire, confirmation « Compte créé avec succès ! » puis redirection vers l’espace Formation. Les contrôles de groupe ont confirmé l’accès Full access pour les deux branches. Aucune erreur de page n’a été relevée.

## Nettoyage et garanties

Le mot de passe du compte de démonstration a été restauré après le test. Le compte `invite_demo` temporaire, ses appartenances de groupe et ses invitations de contrôle ont été supprimés. La vérification finale agrégée confirme : compte démo conservé, zéro invitation temporaire restante, zéro compte temporaire restant et zéro appartenance temporaire restante.

Le premier blocage rencontré provenait uniquement d’un sélecteur de test qui supposait un titre sémantique ; le formulaire réel était correctement rendu. Le contrôle a été ajusté pour cibler le texte visible, sans changement applicatif. L’exécuteur de test temporaire et ses artefacts locaux ont été retirés après réussite.
