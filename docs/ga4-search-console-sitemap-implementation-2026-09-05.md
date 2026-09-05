# GA4, Search Console et sitemap — conception d’implémentation

**Auteur : Achraf Khelil**  
**Date : 5 septembre 2026**

## Principes retenus

Google indique que le consentement par défaut doit être défini avant tout appel susceptible d’envoyer des mesures, puis mis à jour dès le choix de l’utilisateur. La plateforme utilisera donc un service client unique : consentement par défaut refusé, chargement du script GA4 seulement après acceptation explicite, aucune transmission d’URL brute ni de texte libre, et un mécanisme de déduplication par événement fonctionnel. [1]

Les événements `login`, `sign_up` et `search` font partie du vocabulaire recommandé par GA4. Pour la recherche, la consigne produit prévaudra sur le paramètre Google `search_term` : seules une catégorie de recherche et une quantité de résultats seront envoyées afin de ne pas risquer de transmettre une donnée personnelle. Les événements pédagogiques propres au produit resteront des événements personnalisés, avec des identifiants techniques de contenu et jamais les réponses, vidéos, téléchargements, sessions ou informations de l’apprenant. [2]

| Élément | Choix d’implémentation |
|---|---|
| Chargeur GA4 | Un seul service client racine, injection du script `async` uniquement après consentement `accepted`. |
| Consentement | `analytics_storage`, `ad_storage`, `ad_user_data` et `ad_personalization` refusés par défaut ; acceptation limitée à `analytics_storage` accordé, les paramètres publicitaires restant refusés. |
| `page_view` SPA | Configuration GA4 avec `send_page_view: false`, suivie d’une vue contrôlée au démarrage et à chaque changement effectif `pathname + search` nettoyé. |
| Paramètres | Liste blanche de chaînes techniques sans caractères à risque, valeurs bornées et suppression systématique des query strings. |
| Sitemap | `/sitemap.xml` est un index XML direct vers un fichier statique et cinq lots de formations/cours de 200 URL maximum. Seules les routes réellement publiques et indexables sont incluses ; aucune route privée, query string, redirection, candidature transactionnelle ou 404. |
| CSP GA4 | `script-src` autorise explicitement `www.googletagmanager.com`; `connect-src` autorise explicitement les points de collecte GA4, Sentry et la télémétrie existante, sans joker `https:`. |

## Dictionnaire d’événements GA4

Les événements métier ci-dessous sont centralisés dans le service Analytics. Les événements pédagogiques ajoutent seulement des paramètres fonctionnels validés : `course_slug`, `category_slug`, `language`, `lesson_slug`, `lesson_index`, `chapter_index`, `video_id`, `content_id`, `resource_type`, `resource_name_sanitized`, `progress_percent`, `score_band`, `passed` et `status`. Les réponses, scores bruts, adresses, noms, textes libres, jetons, mots de passe, numéros et URL sensibles sont rejetés avant tout envoi.

| Parcours | Événements effectivement émis |
|---|---|
| Compte et recherche | `sign_up`, `login`, `search` |
| Formation | `view_course`, `begin_course`, `lesson_start`, `lesson_complete`, `chapter_complete`, `course_complete` |
| Activités | `quiz_start`, `quiz_complete`, `exercise_start`, `exercise_complete`, `download_resource` |
| Média | `video_start`, `video_progress` aux jalons 25/50/75 %, `video_complete` |
| Évaluation blanche | `certificate_mock_start`, `certificate_mock_complete` |

Un même événement fonctionnel est dédupliqué par clé de contenu et de jalon durant la session. Les vues de page utilisent séparément une clé `pathname + search` nettoyée, afin de ne pas doubler les navigations SPA et de n’autoriser que les paramètres pédagogiques bornés `tab`, `lesson` et `chapter`.

## Limites et contrôles externes

La balise Search Console sera injectée côté serveur à chaque réponse HTML. La visibilité d’une visite dans GA4 DebugView ou Temps réel nécessite néanmoins une session Google disposant d’un accès à la propriété ; ce contrôle ne peut pas être attesté dans le dépôt seul. La configuration et les appels GA4 pourront en revanche être contrôlés dans le navigateur, sans consentement puis après consentement, et leurs paramètres seront inspectés pour garantir l’absence de PII.

La valeur de validation Search Console est fournie par l’environnement serveur et n’est ni recopiée dans le code métier, ni inscrite dans cette documentation. Le rendu HTML serveur la conserve dans le `<head>` de chaque fiche publique.

## Catalogue public et couverture sitemap

Le catalogue canonique alimente désormais des fiches publiques séparées, sous des slugs dérivés des libellés d’affichage plutôt que des identifiants internes : index catalogue, fiche de formation et fiche de cours. Chaque route présente uniquement les métadonnées publiées du catalogue — titre, description, niveau, format, compteurs, compétences, métiers et domaines liés — sans activité pédagogique, progression, résultat, réponse ou autre donnée de compte.

Les routes sont disponibles en français, anglais et arabe, avec canonical absolue auto-référente, alternatives `hreflang` réciproques, Open Graph, carte X et données structurées `BreadcrumbList` et `Course`. Les appels à l’action mènent vers la connexion ou la candidature ; aucun lien public ne donne accès au lecteur `/training`.

La sonde locale du 5 septembre 2026 a analysé l’index, les six fichiers XML puis contrôlé chaque URL listée. Après la désindexation volontaire de `/apply`, la couverture comprend **909 URL indexables** : 8 pages éditoriales et index, 1 actualité, 21 pages de catégories, 3 index de catalogue, 345 fiches de formation et 531 fiches de cours. La répartition est de 305 URL françaises, 302 anglaises et 302 arabes. Les fichiers sont `/sitemaps/static.xml` (33 URL), `/sitemaps/formations-1.xml` à `formations-4.xml` (200 URL chacun) et `/sitemaps/formations-5.xml` (76 URL). Aucun `lastmod` synthétique n’est émis, car le catalogue ne fournit pas de date de publication fiable par fiche.

## Contrôle local avant consentement

Le 5 septembre 2026, l’accueil local a été ouvert dans un profil navigateur sans choix de consentement. La clé `neopolis_cookie_consent` était absente, aucune ressource `googletagmanager.com` ou `google-analytics.com` n’était chargée et `window.gtag` était absent. Ce contrôle confirme que le chargement GA4 reste bloqué avant une acceptation explicite.

Après une acceptation explicite via le bandeau, le navigateur a chargé une unique ressource `gtag/js`, a initialisé la configuration avec `send_page_view: false` et a envoyé une seule vue de page normalisée. La `dataLayer` confirme que `analytics_storage` est accordé seulement après l’action de l’utilisateur, tandis que `ad_storage`, `ad_user_data` et `ad_personalization` restent refusés. Aucun paramètre d’adresse, de nom, de requête de recherche, de lien de parrainage ou de formulaire n’est présent dans la vue de page vérifiée.

## Contrôle de production et diagnostic Search Console

Après publication du correctif CSP, une sonde navigateur indépendante a confirmé sur le domaine public : aucune balise GA4 avant consentement, une seule balise `gtag/js` après acceptation, `gtag` prêt, une unique `page_view` mise en file et aucune erreur console liée à la CSP, au chargeur Google ou à la collecte Analytics. Le chargement du script externe a été observé. L’absence d’appel de collecte immédiatement visible dans cette courte fenêtre de test ne constitue pas une erreur : la file locale, l’initialisation et le script sont vérifiés ; le constat dans DebugView dépend de l’accès à la propriété et d’un délai de réception côté Google.

La candidature `/apply` reste accessible au public pour déposer un dossier, mais elle est désormais `noindex, nofollow`, sans données structurées, sans contenu de secours pour robot et sans entrée sitemap. Les liens de recommandation continuent d’utiliser la page publique canonique `/refer` pour leurs aperçus sociaux.

Le sitemap est désormais livré comme un index XML indépendant de toute session. L’index et chacun de ses six fichiers répondent directement HTTP 200 avec `application/xml; charset=utf-8`, sans redirection, cookie ni repli HTML. `robots.txt` conserve l’URL canonique de l’index. Les contrôles Googlebot desktop et Googlebot Smartphone reçoivent la même liste et les mêmes statuts. Ce test écarte un filtrage applicatif simple par User-Agent, sans prétendre prouver l’identité réseau d’un robot Google ni l’état interne Search Console.

## Références

[1] [Google — Set up consent mode on websites](https://developers.google.com/tag-platform/security/guides/consent)  
[2] [Google — Analytics recommended events](https://developers.google.com/analytics/devguides/collection/ga4/reference/events)
