# Audit des crashs client — 7 septembre 2026

## Périmètre et minimisation

Le monitoring interne des sept derniers jours et les journaux de production ont été consultés. L’analyse agrège uniquement la signature, la route sans paramètres, la source, la famille de navigateur et les premières frames techniques. Les adresses, cookies, IP, user-agents complets, identifiants longs et paramètres d’URL sont exclus du rapport.

## Signatures observées

| Signature | Occurrences | Dernière observation | Qualification |
|---|---:|---|---|
| `removeChild` dans un Select sur `/apply` | 1 | 2026-09-06 | Incident Chrome récent, compatible avec un arbre React modifié extérieurement ; récupération unique et protection des Select requises |
| `importScripts` sur un Worker blob externe | 1 | 2026-09-06 | Contexte Chrome externe ; aucun Web Worker n’est déclaré par l’application |
| Erreur d’intégration `/test` | 78 | 2026-09-07 | Pollution du monitoring par la suite Vitest, sans trafic utilisateur ; la dernière occurrence précède la correction définitive du garde-fou Vitest |
| `String.repeat(-2)` sur `/admin/training` | 8 | 2026-09-05 | Bug déjà corrigé et validé en production par bornage 0–3 |
| Export `default` indisponible dans `React.lazy` | 3 signatures isolées | 2026-08-31 au 2026-09-02 | Bundles obsolètes lors de déploiements ; récupération de chunk déjà en place |

Les journaux serveur récents ne montrent pas d’autre exception backend active ; ils reprennent seulement les deux incidents client du 6 septembre.

## Correctifs en cours

Le module de récupération client reconnaît désormais `removeChild` comme une mutation d’arbre récupérable une seule fois par route. Les champs Select de la candidature interdisent la traduction automatique de leur sous-arbre, la page disposant déjà de traductions internes FR/EN/AR. Le reporter et le serveur filtrent les Workers blob externes et les exports Lazy obsolètes. Les tests n’écrivent plus de faux incidents dans la base réelle.

La suite finale comporte 595 tests réussis et 2 tests ignorés. La matrice de publication passe ses neuf étapes, y compris les contrôles desktop et mobile.
