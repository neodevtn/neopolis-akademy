# Revue défensive de sécurité — Neopolis Akademy

**Date :** 18 août 2026  
**Périmètre :** application web `akademy.neodev.click`, code applicatif, authentification, e-mails transactionnels, navigation administrative, dépendances de production.  
**Méthode :** revue Grey Box non destructive, analyse de code et de configuration, contrôles HTTP, tests de récupération et audit des dépendances. Aucun test destructif, aucune tentative de contournement de compte et aucun e-mail réel n’ont été déclenchés.

## Synthèse

La plateforme dispose déjà de protections importantes : HTTPS/HSTS, CSP, anti-clickjacking, `nosniff`, politique de référent, limitation globale, limitation des connexions et récupération de compte par token à durée de vie limitée. La revue a permis de renforcer la récupération de mot de passe, les cookies de session, l’origine des liens, la limitation IP et les dépendances directes.

| Statut | Constat | Traitement |
|---|---|---|
| Corrigé | Liens de récupération construits depuis l’en-tête `Host` | Domaine public Neopolis fixé en production |
| Corrigé | Réinitialisation sans limitation dédiée et mot de passe trop court | Limites dédiées et mot de passe de 12 à 128 caractères |
| Corrigé | Cookie de session permissif pour les requêtes inter-sites | Cookie `HttpOnly`, `Secure` et `SameSite=Lax` |
| Corrigé | Contournement potentiel de limite IP par en-tête transmis | Utilisation de l’IP résolue par Express derrière proxy approuvé |
| Corrigé | Composants directs comportant des avis de sécurité | AWS SDK, tRPC, Axios, Drizzle, Nanoid, Express et Streamdown mis à niveau |
| À traiter | Une alerte élevée transitive demeure via Recharts v2 et Lodash | Prévoir migration contrôlée vers Recharts v3 ; aucune exécution de `_.template` n’est utilisée par l’application |

## Contrôles vérifiés

| Domaine | Résultat |
|---|---|
| En-têtes HTTP | HSTS, CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, Permissions-Policy et Referrer-Policy observés |
| Authentification | Connexion limitée à 5 tentatives par 15 min et réponses génériques sur identifiants erronés |
| Récupération de compte | Réponse non énumérante, token aléatoire, invalidation des tokens précédents, expiration d’une heure, limite de 3 demandes par 15 min |
| Réinitialisation | Limite de 5 tentatives par 15 min, validation de token limitée, mot de passe 12–128 caractères et invalidation après usage |
| Sessions | Cookies `HttpOnly`, `Secure` sur HTTPS et `SameSite=Lax` |
| Autorisations | Procédures administratives protégées par rôle ; pages apprenantes limitées au compte de la session |
| Contenu riche | Les communiqués sont assainis côté serveur avant e-mail et rendu apprenant |
| Navigation admin | Les communications, invitations, Kanban, évaluation et activité sont accessibles depuis la navigation verticale, avec URLs dédiées |

## Tests de régression

La compilation TypeScript a réussi. La suite locale compte **162 tests réussis**. Les tests non destructifs du parcours de récupération ont confirmé une réponse générique pour un compte inconnu et le rejet des mots de passe courts.

## Recommandations restantes

1. Planifier la migration de Recharts v2 vers v3 pour supprimer l’alerte transitive restante et réexécuter l’audit de dépendances.
2. Remplacer à moyen terme la limitation IP mémoire par un magasin partagé persistant si l’application est déployée sur plusieurs instances.
3. Réaliser une revue annuelle des rôles administratifs, des journaux de sécurité et des dépendances.
