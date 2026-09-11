# Feedback Sentry 934422 — accès Training après invitation

## Signal rapporté

Un apprenant nouvellement accepté indique avoir validé son invitation, puis recevoir « Authentification requise » lors de l’accès à l’espace Training. Le feedback est associé à la page d’accueil publique ; aucun jeton, mot de passe ni donnée de compte n’est reproduit dans ce document.

## Hypothèses à vérifier

1. La session n’est pas établie, renouvelée ou conservée après l’acceptation d’invitation.
2. Le compte accepté ne possède pas un état d’accès apprenant compatible avec `/training`.
3. Une redirection depuis l’accueil ou l’espace Training perd un paramètre, un cookie ou un état de connexion.

## Critère de correction

Après acceptation valide d’une invitation, le compte peut atteindre `/training` dans la même session ou, à défaut, reçoit une indication claire de se reconnecter avec les identifiants qu’il vient de définir. Les contrôles d’accès aux formations restent inchangés.
