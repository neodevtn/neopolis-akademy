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

## Validation publique

Après propagation, le parcours `/apply` a été rejoué en production en 1280×720 et 390×844. Les sélections de pays et de secteur ont été changées plusieurs fois, puis le formulaire a navigué vers l’étape précédente et suivante sans soumission. Les deux scénarios affichent zéro ErrorBoundary, zéro pageerror, zéro erreur console et zéro ressource applicative en échec.

Le monitoring filtré ne conserve plus que deux signatures historiques réelles : le `removeChild` unique du 6 septembre et les huit occurrences AdminTraining du 5 septembre. Aucune nouvelle occurrence n’est apparue après les correctifs. Les erreurs de test, de Worker blob externe et de chunks Lazy obsolètes sont exclues des listes opérationnelles, sans suppression des enregistrements historiques en base.

## Revue Sentry du 7 septembre 2026

Source consultée en lecture seule : `https://sentry.neopolis-dev.com/organizations/neopolis-development/issues/?project=102&referrer=sidebar&statsPeriod=7d`.

Sentry affiche 11 issues prioritaires. La vue synthétique montre notamment : le `removeChild` unique sur `/apply`, un `importScripts` Worker blob sur `/apply`, deux issues `Invalid count value: -2` sur `/admin/training`, un `TransformError` esbuild sans utilisateur affecté, une erreur Lazy sur `/login`, deux erreurs Lazy sur des routes de formation, une requête tRPC de contribution de compétences sans utilisateur affecté et une erreur de module demandant un export absent. Les quatre premières signatures concordent avec le monitoring interne déjà corrigé ou filtré ; les issues restantes doivent être ouvertes individuellement avant qualification.

L’issue Sentry `NEOPOLIS-AKADEMY-2A` (`/issues/934049/`) contient un seul événement et un seul navigateur affecté. Elle a été observée sur Chrome 152 sous Windows, en production, sur `/apply`, et remonte à environ trois heures avant l’audit. La pile pointe vers l’opération React `removeChild`, sans frame applicative distincte. Ce contexte concorde avec une mutation externe du sous-arbre d’un Select ; la protection `translate="no"`, la récupération unique `react-tree` et la sonde production desktop/mobile ont été publiées après cet événement.

L’issue Sentry `NEOPOLIS-AKADEMY-29` (`https://sentry.neopolis-dev.com/organizations/neopolis-development/issues/934048/`) contient également un seul événement et un seul navigateur affecté, dans la même session Chrome 152 sous Windows et au même instant que `2A`. La pile est intégralement située dans une URL `blob:` et appelle `WorkerGlobalScope.importScripts`; aucun Worker n’est déclaré dans le code Neopolis. Cette issue est donc un artefact de contexte navigateur externe corrélé à la même session, déjà filtré côté client et serveur depuis le correctif du monitoring.

Les deux issues `NEOPOLIS-AKADEMY-27` et `NEOPOLIS-AKADEMY-28` correspondent exactement à `String.repeat(-2)` dans deux anciennes révisions du bundle AdminTraining. Chacune ne contient qu’un événement, le 5 septembre. Le bornage 0–3 publié ensuite couvre les valeurs négatives, excessives, décimales, infinies et textuelles.

`NEOPOLIS-AKADEMY-M` est un `TransformError` de développement, sans utilisateur affecté. Il pointe vers une ancienne erreur de syntaxe temporaire de `server/publicTrainingPages.ts`; le générateur courant compile, les tests sitemap passent et le dernier événement date du 5 septembre.

Les issues `NEOPOLIS-AKADEMY-25`, `24`, `23` et `1T` sont quatre échecs Lazy ponctuels sur d’anciennes révisions de bundles, observés entre le 31 août et le 3 septembre sur Safari, Chrome et Firefox. Leurs messages sont les trois variantes de `_result.default`/`reading 'default'` déjà reconnues par la récupération de chunk obsolète. Aucun groupe n’a reçu de nouvel événement depuis.

`NEOPOLIS-AKADEMY-22` est un signal N+1 de développement, émis six fois par HeadlessChrome lors de `training.markLessonComplete`, sans utilisateur affecté. `NEOPOLIS-AKADEMY-10` est une ancienne erreur de démarrage serveur de développement liée à l’export `claimExamReminder`, sans utilisateur affecté ; son dernier événement date du 1er septembre. Ces deux groupes nécessitent encore une vérification dans le code courant avant clôture.

Le dernier événement du groupe N+1 contient 42 spans dans l’entrée Sentry de type `spans`. Aucune donnée de requête, cookie ou paramètre n’a été lue ; l’analyse suivante doit uniquement agréger les opérations et descriptions normalisées afin d’identifier les répétitions utiles.

L’analyse agrégée des 42 spans confirme un N+1 réel de développement : sept sélections d’existence suivies de sept insertions unitaires dans le registre des contributions de compétences. Le service courant remplace cette boucle par une sélection groupée des règles déjà attribuées et une insertion multi-lignes protégée par la contrainte unique existante.

La variante Safari `undefined is not an object (evaluating 'E._result.default')` n’était pas couverte par le filtre client actuel. Elle est désormais classée dans la portée `lazy-default`, récupérée une seule fois par route et filtrée côté client et serveur comme ancien bundle après déploiement.

L’export `claimExamReminder` est bien présent dans `server/db.ts` et importé par le service actif. Le rendu sitemap compile et ses contrôles publics restent réussis ; les deux issues de développement correspondantes sont donc historiques.

L’API Sentry des feedbacks du projet ne retourne aucun feedback dans l’état courant. Aucun défaut fonctionnel supplémentaire n’a été identifié par cette source lors de cet audit.
