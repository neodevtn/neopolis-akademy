# Politique de sécurité des systèmes d’information — Neopolis Akademy

## Objet et périmètre

Cette politique s’applique à Neopolis Akademy, à ses utilisateurs, aux administrateurs, aux données pédagogiques, aux candidatures, aux communications et aux intégrations de messagerie et de stockage.

## Principes directeurs

Les données ne sont accessibles qu’aux personnes autorisées, uniquement pour une finalité légitime. Les comptes administrateurs bénéficient de droits supplémentaires, mais leurs activités pédagogiques restent séparées de leurs activités d’administration dans les indicateurs d’apprentissage. Toute modification sensible doit être traçable.

## Identités et accès

Les comptes sont créés uniquement par invitation ou après acceptation d’une candidature. L’inscription libre est interdite. Les mots de passe comportent au moins 12 caractères. Les liens de récupération sont à usage unique, expirent après une heure et sont expédiés au compte correspondant sans divulguer l’existence d’une adresse demandée.

## Sessions et protection applicative

Les sessions utilisent des cookies `HttpOnly`, `Secure` sur HTTPS et `SameSite=Lax`. L’application impose HTTPS, HSTS, une CSP, une protection anti-clickjacking, une politique de référent et des limites de débit. Les entrées riches destinées aux e-mails ou aux interfaces apprenantes sont assainies avant rendu.

## Données et confidentialité

Les données de candidature et d’apprentissage sont limitées aux fonctions de recrutement et de formation. Les vidéos de candidature sont accessibles aux administrateurs autorisés. Les exports et rapports administratifs doivent rester réservés aux rôles habilités.

## Gestion des incidents

Les erreurs client sont surveillées via Sentry et l’interface d’administration. Toute anomalie de sécurité est documentée, corrigée, testée et publiée avec un point de restauration. Les administrateurs évaluent les signaux d’intégrité pédagogique avant toute restriction de compte.

## Gestion des changements

Chaque modification applicative fait l’objet d’une vérification TypeScript, de tests pertinents, d’un contrôle visuel lorsque l’interface est concernée et d’un point de restauration publié. Les dépendances font l’objet d’un audit régulier et les correctifs critiques sont priorisés.

## Responsabilités

L’administrateur principal valide les accès, les blocages de comptes, les communications sensibles et les changements de politique. Les administrateurs respectent le principe de moindre privilège. Les apprenants protègent leurs identifiants et signalent toute activité suspecte.
