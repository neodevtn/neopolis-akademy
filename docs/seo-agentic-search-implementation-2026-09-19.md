# Rapport d’implémentation SEO et Agentic Search — Neopolis Akademy

**Date :** 19 septembre 2026  
**Domaine canonique :** <https://akademy.neodev.click>  
**Périmètre :** pages publiques, catalogue multilingue, Golden Jobs, AI News, robots, sitemaps, données structurées et découverte par agents IA.

## Résumé exécutif

La plateforme dispose désormais d’une couche de découverte unifiée pour les moteurs classiques et les agents IA. L’implémentation reste fondée sur les pages canoniques publiques et n’expose aucune route d’apprentissage authentifiée, correction, réponse d’évaluation, donnée personnelle, jeton ou identifiant privé.

Aucun robot IA n’est bloqué par son nom. La règle générale autorise l’exploration publique, y compris les médias publics de `/api/assets/`, tandis que les zones privées telles que `/training`, `/admin`, `/api/`, les examens, le compte et l’authentification restent exclues. Cette distinction protège les apprenants sans empêcher GPTBot, ClaudeBot, OAI-SearchBot, Googlebot ou les autres robots d’accéder aux contenus publics.

## Implémentations livrées

### Découverte agentique

| Ressource | Rôle | Contenu |
|---|---|---|
| `/llms.txt` | Contexte concis pour assistants IA | Présentation, ressources canoniques, domaines métier FR/EN/AR et limites d’accès |
| `/llms-full.txt` | Contexte public détaillé | Catalogue complet des programmes et cours, compétences, métiers, métriques et URLs canoniques |
| `/ai-index.json` | Index machine-readable | 116 programmes, 180 cours, 12 parcours métiers et leurs variantes linguistiques |
| `/robots.txt` | Politique d’exploration | Tous les robots publics autorisés, médias publics autorisés, espaces privés exclus |
| `/ai-news/rss.xml` | Découverte éditoriale | Flux RSS 2.0 des dernières ressources AI News, avec liens vers les sources publiques |

Les documents sont générés depuis le catalogue publié avant chaque build. Cela évite qu’un ajout ou une suppression de formation laisse `llms.txt` ou l’index JSON obsolète. Les mêmes documents sont servis dynamiquement avec leur type MIME, leur longueur UTF-8, un cache public maîtrisé et sans cookie ni redirection.

### Sitemaps et soumission rapide

L’index de sitemaps référence **20 lots** de **50 URL maximum** et couvre **960 URL canoniques publiques uniques**. Chaque URL contient un `lastmod` ISO fiable correspondant à la révision de catalogue du 19 septembre 2026. Les routes privées, le formulaire de candidature non indexable, l’administration, les API privées et les parcours authentifiés sont absents.

Une intégration **IndexNow** a été ajoutée en mode contrôlé :

- fichier de preuve servi à la racine du domaine ;
- charge utile limitée aux 960 URL réellement présentes dans le sitemap ;
- contrôle de parité sitemap/IndexNow ;
- mode dry-run par défaut ;
- soumission réelle uniquement après publication et vérification du domaine.

### Knowledge Graph et données structurées

Les pages publiques exposent maintenant un graphe cohérent comprenant :

- `Organization` avec identifiant stable, logo et profils sociaux vérifiés ;
- `WebSite` avec `SearchAction` vers la recherche publique du catalogue ;
- `WebPage` ou `CollectionPage` avec langue, canonical, date de révision et éditeur ;
- `Course` et `CourseInstance` sur les fiches de programmes et cours ;
- `FAQPage` sur les accueils FR, EN et AR à partir du contenu réellement affiché ;
- `Occupation` sur les fiches Golden Jobs, avec description et compétences documentées ;
- `BreadcrumbList` sur les pages de catalogue.

Les balises de découverte du sitemap, de `llms.txt`, de l’index JSON et du flux RSS sont ajoutées dans le `<head>` des pages publiques.

## Qualité, sécurité et anti-spam

L’optimisation n’ajoute ni texte caché, ni pages satellites, ni répétition artificielle de mots-clés, ni données structurées non visibles. `llms.txt` est traité comme une convention émergente de découverte, pas comme un facteur garanti de classement. Les fondations prioritaires restent les canoniques, le contenu utile, les liens internes, les sitemaps, l’accessibilité HTTP et les données structurées conformes.

Un audit dédié vérifie automatiquement : couverture du catalogue, trois langues, absence de données privées, robots sans blocage nominatif, exclusion des routes privées, intégrité des fichiers LLM, unicité des URLs, `lastmod`, parité IndexNow, Knowledge Graph et preuve de propriété IndexNow.

## Résultats de validation

| Contrôle | Résultat |
|---|---|
| TypeScript | PASS |
| Tests unitaires globaux | PASS — 974 réussis, 2 ignorés |
| Tests SEO/agentic ciblés | PASS |
| Audit SEO/agentic | PASS |
| Sitemaps | PASS — 960 URL, 20 lots, aucun doublon |
| Parité IndexNow | PASS — 960/960 URL |
| Googlebot, ChatGPT-User et ClaudeBot en local | PASS — HTTP 200, sans redirection, cookie ni `X-Robots-Tag` |
| RSS AI News | PASS — HTTP 200, RSS 2.0, 50 entrées lors du contrôle |
| QA de publication | PASS — matrice complète sans échec |
| Build production | PASS |
| Publication sur le domaine canonique | PASS |
| Contrôle public Googlebot/ClaudeBot/OAI-SearchBot | PASS |
| Soumission IndexNow | PASS — 960 URL acceptées, HTTP 200 |

Le contrôle post-publication a confirmé HTTP 200 et les bons types MIME pour `robots.txt`, `llms.txt`, `llms-full.txt`, `ai-index.json`, le flux RSS, l’index de sitemaps et le catalogue public. Aucune redirection, aucun cookie requis et aucun `X-Robots-Tag: noindex` n’ont été observés sur ces ressources. Les graphes `Organization`, `WebSite`, `SearchAction`, `FAQPage`, `Course` et `BreadcrumbList` ont également été retrouvés dans le HTML public correspondant.

## Références méthodologiques

L’implémentation suit les recommandations officielles de Google sur les [sitemaps][1], le [robots.txt][2] et les [données structurées][3], le vocabulaire [Schema.org][4], la spécification [IndexNow][5] et la proposition publique [llms.txt][6].

[1]: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
[2]: https://developers.google.com/search/docs/crawling-indexing/robots/intro
[3]: https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
[4]: https://schema.org/
[5]: https://www.indexnow.org/documentation
[6]: https://llmstxt.org/

## Limites et suivi

La publication de ces signaux ne garantit pas une indexation ou une citation immédiate : les moteurs conservent leur propre calendrier d’exploration et d’évaluation. Après publication, la procédure finale consiste à contrôler les endpoints sur le domaine canonique avec plusieurs user-agents, soumettre les 960 URL à IndexNow, puis surveiller Search Console et les journaux d’exploration sans modifier quotidiennement les sitemaps.
