# Remédiations critiques de sécurité — 7 septembre 2026

## Portée

Cette livraison traite les trois constats critiques identifiés par l’audit interne : exposition des corrections d’examen, acceptation de webhooks e-mail non authentifiés et possibilité d’écrasement du mot de passe d’un compte existant par une invitation. Les parcours de formation, le verrouillage séquentiel, la minuterie et le calcul serveur des examens sont conservés.

## Mesures appliquées

| Domaine | Mesure | Garantie vérifiable |
|---|---|---|
| Examens | Les objets envoyés au navigateur ne contiennent plus que l’énoncé, le domaine et les choix. | `correctChoiceIds` et les explications restent dans la session serveur utilisée lors de la correction. |
| Webhook Resend | La route reçoit le corps brut, vérifie la signature Svix avec un secret d’environnement, refuse les signatures invalides et les messages trop anciens. | Un événement non signé reçoit `401`; l’identifiant d’événement possède une contrainte unique durable. |
| Rejeu webhook | Chaque événement signé est inscrit avec une clé unique; les mises à jour de livraison sont idempotentes et peuvent être rejouées après un incident transitoire. | La migration ajoute `webhookEventId` et son index unique à `email_events`. |
| Invitations | La création de compte exige un mot de passe de 12 à 128 caractères. Une invitation pour une adresse déjà inscrite ne modifie jamais le mot de passe. | Le compte doit se connecter, puis revendiquer l’invitation avec une adresse qui correspond exactement à son compte. |
| Banque d’examen | Les fichiers de questions et de configuration ont quitté `client/public` pour `server/data`, copié uniquement dans `dist/data` au build serveur. | Aucune URL statique ne sert plus la banque d’examen ; le repli de quiz demande une projection authentifiée, puis une correction serveur après réponse. |
| Révocation historique | Les deux anciennes URLs publiques sont interceptées avant le middleware de fichiers statiques. | Toute demande reçoit `410 Gone` avec `Cache-Control: no-store, max-age=0`, y compris si un cache a connu une version antérieure du fichier. |

## Validation locale

Les tests ciblés couvrent la projection d’examen, l’absence de banque statique, une signature de webhook acceptée, une signature rejetée, la politique de mot de passe, le refus d’écrasement d’un compte existant et la revendication authentifiée. La suite complète a validé 606 tests (2 ignorés) et la matrice de publication a validé ses neuf étapes. La vérification sur le domaine publié reste requise avant la clôture.

## Exploitation

Le secret de signature Resend est configuré exclusivement dans l’environnement sécurisé et ne doit jamais être ajouté au dépôt, à un journal ou à un rapport. Les tentatives de webhook ne journalisent que le type d’événement et la présence d’un identifiant de message, sans adresse ou contenu de message.

## Vérification publiée

Sur le domaine public, les deux anciennes URLs de fichiers d’examen répondent `410 Gone`, avec `Cache-Control: no-store, max-age=0`, sans marqueur de réponse correcte dans le corps. Un POST de webhook sans signature est rejeté en `401`. Cette vérification ne simule pas un événement Resend réel signé ; le test HTTP local signé couvre cette branche avec le secret sécurisé.
