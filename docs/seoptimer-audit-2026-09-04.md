# Audit SEOptimer — 4 septembre 2026

## Résultat directement accessible

Le rapport public de SEOptimer pour `akademy.neodev.click`, généré le 4 septembre 2026 à 23:58 UTC, présente une note globale **B** et signale **7 recommandations**. Les sous-notes visibles sont : SEO on-page **A-**, liens **A-**, performance **A**, social **A+** et utilisabilité **F**.

Les éléments détaillés du rapport sont chargés dynamiquement et ne sont pas fournis dans l’extraction textuelle initiale. L’analyse poursuit donc avec l’examen contrôlé du contenu rendu et des réponses publiques du site afin de reproduire chaque signalement avant correction. Le score Social A+ est cohérent avec l’ajout récent des balises Open Graph et X ; il est néanmoins conservé comme indication externe, non comme preuve de conformité définitive.

## Recommandations extraites du rendu dynamique

L’inspection du rendu dynamique du rapport révèle notamment les recommandations suivantes : ajouter un enregistrement **DMARC**, ajouter un enregistrement **SPF**, implémenter un outil de suivi analytique, ajouter l’adresse et le numéro de téléphone de l’entreprise, puis ajouter un schéma `LocalBusiness`. SEOptimer les classe comme recommandations de priorité basse.

Les trois premières catégories seront qualifiées séparément : SPF/DMARC sont des réglages DNS et de messagerie hors code applicatif ; le suivi analytique doit être vérifié dans la configuration déployée ; l’adresse et le téléphone ne seront pas inventés. Le schéma local ne sera ajouté que si des coordonnées professionnelles vérifiées peuvent être affichées de façon cohérente sur le site.

Le rapport propose aussi de créer ou lier une page Facebook, un profil X, un profil Instagram, une chaîne YouTube, un profil LinkedIn et d’installer le pixel Meta. Ces recommandations relèvent de comptes et de paramètres externes : elles ne seront ni inventées ni activées sans identifiants de comptes officiels, consentement conforme et décision explicite sur le traitement publicitaire.

## Mesures de performance relevées

La section utilisabilité du rapport indique que le viewport mobile est correctement déclaré, mais relaie un score PageSpeed mobile de **80** depuis des serveurs américains. Ses mesures de laboratoire sont : First Contentful Paint **3,1 s**, Speed Index **4 s**, Largest Contentful Paint **3,9 s**, Time to Interactive **3,9 s**, Total Blocking Time **0 s** et Cumulative Layout Shift **0**. Les opportunités identifiées sont : éviter des redirections de page multiples (gain estimé **0,63 s**) et réduire le JavaScript inutilisé (gain estimé **0,31 s**).

Ces chiffres constituent un point de départ externe : la phase suivante reproduit les signaux à partir du HTML, des en-têtes et des bundles effectivement servis avant d’appliquer des corrections. Aucune adresse, numéro de téléphone, profil social ni pixel ne sera ajouté sans donnée officielle et validation adaptée.

## Mesures publiques complémentaires

La racine `https://akademy.neodev.click/` répond directement en HTTP 200 sans redirection. Son HTML sert les en-têtes `Cache-Control: no-cache, no-store, must-revalidate` et `X-Content-Type-Options: nosniff`; la recommandation sur les redirections ne se reproduit donc pas sur la requête principale actuelle.

Le suivi analytique est déjà configuré avec un chargement différé après consentement aux cookies. Cette conformité explique que le robot de SEOptimer, qui ne consent pas, ne détecte pas l’outil. Il ne serait pas approprié de le charger avant le consentement uniquement pour améliorer une note.

Le premier chargement produit plusieurs fragments JavaScript issus du découpage par route : shell, accueil, authentification différée, composants de navigation et icônes. Les éléments de mesure du navigateur ne donnent pas de taille transférée exploitable pour ces ressources en cache, mais confirment que le graphique chargé sous le pli, les surcouches d’authentification et le bandeau cookies sont déjà différés. L’amélioration retenue doit donc viser le code de premier rendu et les modules tiers, pas une suppression de fonctions nécessaires.

## Profils publics vérifiés

Le site officiel de Neopolis Development publie une page Facebook et une page LinkedIn officielles. Ce sont les seuls profils sociaux pour lesquels une URL officielle a été vérifiée durant l’audit. Ils peuvent donc être liés depuis le footer commun et déclarés dans les données structurées `Organization`. Les autres réseaux recommandés par SEOptimer ne seront pas ajoutés tant qu’une URL officielle n’est pas fournie ou publiée.

## Décisions de traitement

| Recommandation ou signalement | Décision | Justification |
|---|---|---|
| Réduire le JavaScript inutilisé | Traiter | Le chargement des enrichissements d’authentification et des surcouches non critiques sera différé jusqu’à l’inactivité du navigateur. Les sections visuelles restent inchangées. |
| Améliorer l’exploration et le contenu lisible sans JavaScript | Traiter | Un résumé éditorial fidèle, localisé et limité aux routes publiques sera injecté dans un bloc `noscript`, sans contenu privé ni divergence fonctionnelle. |
| Données structurées organisationnelles | Traiter | `Organization` et `WebPage` peuvent être déclarés avec le nom, l’URL et les visuels officiels, sans inventer adresse ou téléphone. |
| Lier Facebook et LinkedIn | Traiter | Les deux adresses sont publiées sur le site officiel de Neopolis Development. Les autres profils ne sont pas connus. |
| SPF et DMARC | Hors code | Les interrogations DNS publiques ne retournent pas d’enregistrement TXT SPF ni DMARC pour `neodev.click`. Ces réglages exigent l’accès au gestionnaire DNS et la configuration de l’émetteur de messagerie. |
| Adresse, téléphone et `LocalBusiness` | Ne pas traiter | Aucun couple adresse/téléphone vérifié n’est publié dans Akademy. Ajouter un schéma local sans coordonnées cohérentes serait trompeur. |
| Pixel Meta | Ne pas traiter sans décision | Un pixel publicitaire engage une finalité de suivi et de consentement distincte ; il ne sera pas activé seulement pour satisfaire un score. |
| Redirections | Ne pas traiter à ce stade | La racine et les ressources critiques testées répondent directement en HTTP 200, sans redirection. |

Les axes retenus s’appuient sur la recommandation de charger les fonctionnalités nécessaires au bon moment et d’éviter les scripts tiers superflus. Les animations, le catalogue et les espaces d’apprentissage ne sont pas supprimés. [1] [2]

## Correctifs généralisés

Les routes publiques rendues par l’application reçoivent désormais une directive robots explicite autorisant l’indexation, les grands aperçus d’images et des extraits non limités. Les routes sécurisées conservent `noindex, nofollow`. Chaque page publique non thématique reçoit entre cinq et six mots-clés propres à son contenu ; les pages Formation conservent leurs métadonnées localisées par domaine et par langue.

Le head global inclut un graphe JSON-LD avec `Organization` et `WebPage`, un logo carré et les deux profils officiels vérifiés. Le sitemap contient maintenant l’accueil, AI News, la candidature, les mentions légales et les pages de formations multilingues. Le contenu de secours injecté dans `noscript` ne couvre que l’accueil, AI News, la candidature, le parrainage et les mentions légales ; il reprend des titres, descriptions et liens cohérents avec leurs pages et n’est jamais injecté dans les routes privées.

Les enrichissements de progression de l’accueil restent chargés à l’inactivité du navigateur et le `ProcessStepper`, situé sous le pli, est maintenant chargé à la demande. Le bundle de la page Home est passé de 127,40 kB (28,56 kB gzip) à 117,42 kB (26,16 kB gzip) dans le build local, soit une réduction mesurée de 9,98 kB minifiés et 2,40 kB gzip pour ce fragment. Les images non critiques du bloc partenaire sont différées. Enfin, le document HTML est révalidé à chaque utilisation plutôt que totalement interdit de cache : les assets versionnés restent immuables, le navigateur revalide le HTML pour recevoir un nouveau hash après publication.

Les tests TypeScript, les 554 tests automatisés (2 ignorés) et la matrice `qa:publish` ont réussi localement. La matrice couvre notamment la validation de catalogue, les pages Formation, les métadonnées sociales, le contrôle d’interactions et les contrôles de blocs desktop/mobile.

## Validation publiée

Après propagation du checkpoint `7f494abb`, les contrôles ont été rejoués sur `https://akademy.neodev.click`. Les pages publiques d’accueil, AI News, candidature, parrainage et mentions légales servent la directive `index, follow` enrichie, les images Open Graph, les données structurées et les contenus de secours prévus. La page Formation et ses variantes FR/EN/AR conservent canonical, `hreflang`, images sociales, JSON-LD et l’absence de débordement aux largeurs 1280, 390 et 375 pixels. Les thèmes inexistants répondent HTTP 404 avec `noindex`, tandis que les redirections des anciens thèmes renvoient HTTP 301 vers les nouveaux domaines. Les routes d’apprentissage restent `noindex, nofollow`.

## Références

[1] [Chrome for Developers — *Reduce unused JavaScript*](https://developer.chrome.com/docs/lighthouse/performance/unused-javascript)

[2] [web.dev — *Third-party JavaScript performance*](https://web.dev/articles/third-party-javascript)
