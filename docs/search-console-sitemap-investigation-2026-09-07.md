# Investigation Search Console — sitemaps

**Date :** 7 septembre 2026  
**Objet :** état « Impossible de récupérer le sitemap » dans Google Search Console.

## Constat initial

La capture fournie montre que l’index `/sitemap.xml` et les cinq sous-sitemaps de formations sont affichés avec le statut « Impossible de récupérer le sitemap » et le type « Inconnu ». La date affichée correspond à l’envoi, tandis que le champ de dernière lecture est vide : Search Console n’a donc pas encore enregistré de lecture réussie de ces URLs.

Les sondes publiques initiales en HTTP/1.1, avec les user-agents Googlebot Desktop et Googlebot Smartphone, reçoivent HTTP 200, `Content-Type: application/xml; charset=utf-8`, compression gzip et aucune redirection pour l’index et les sous-sitemaps. Elles sont à compléter par une inspection stricte des corps XML, de `robots.txt`, de la chaîne applicative et des variations réseau.

## Références officielles

Google exige que les sitemaps soient encodés en UTF-8, contiennent des URLs absolues canoniques et puissent être subdivisés dans un index, les sitemaps enfants devant rester sur le même site et à un niveau de chemin identique ou inférieur. Il rappelle que l’état « Impossible de récupérer » reflète le dernier essai de Google et que les nouvelles tentatives peuvent se poursuivre pendant plusieurs jours avant arrêt. [1] [2] [3]

## Cause confirmée

La capture liste des chemins historiques à la racine — `/static.xml` et `/formations-1.xml` à `/formations-5.xml` — alors que l’index actif déclare désormais les chemins `/sitemaps/static.xml` et `/sitemaps/formations-1.xml` à `/sitemaps/formations-5.xml`.

Avant le correctif, les anciens chemins recevaient le repli HTML de l’application en HTTP 200, avec `Content-Type: text/html`. Cela explique le type « Inconnu » et l’impossibilité de lecture des soumissions encore enregistrées dans Search Console. À l’inverse, la sonde complète de l’index actif a validé les six XML actuels, leurs 909 URLs publiques, les canonicals, l’absence de noindex et les réponses Googlebot desktop/mobile.

Le correctif conserve les chemins canoniques sous `/sitemaps/`, mais sert désormais les anciens chemins directement en XML identique, HTTP 200, sans redirection, cookie ou HTML de repli. Cette compatibilité est couverte par les tests et la sonde de publication.

## Vérifications locales avant publication

La suite complète a validé 611 tests réussis et 2 ignorés. Le contrôle sitemap a validé 6 fichiers, 909 URL publiques, sans doublon ni route privée ; la distribution contrôlée est de 305 URLs françaises, 302 anglaises et 302 arabes. La sonde vérifie aussi les anciens chemins racine auprès de Googlebot desktop et smartphone.

## Vérification de production après publication

Après propagation de la version `d8f79ef0`, l’index, les six chemins canoniques et les six alias historiques répondent en HTTP 200 avec `application/xml; charset=utf-8` et une déclaration XML UTF-8, pour les profils Googlebot desktop et smartphone. Aucun de ces chemins ne redirige, ne demande de cookie ou ne bascule vers le HTML de l’application.

La sonde exhaustive de production a ensuite validé les 6 fichiers, les 909 URLs publiques et les alias historiques. Le contrôle utilise désormais un débit prudent et des reprises limitées pour ne pas assimiler une limitation transitoire HTTP 429 de la sonde elle-même à une erreur de sitemap.

Search Console peut conserver l’état de dernière récupération antérieur jusqu’à sa prochaine lecture. Désormais, les URLs exactes affichées dans la capture retournent un XML valide ; il est donc recommandé de conserver uniquement `/sitemap.xml` comme soumission principale et de laisser Google réexplorer les anciens enregistrements, sans recréer de nouveaux sous-sitemaps manuellement.

## Références

[1]: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap "Google Search Central — Build and submit a sitemap"
[2]: https://developers.google.com/search/docs/crawling-indexing/sitemaps/large-sitemaps "Google Search Central — Manage your sitemaps with a sitemap index file"
[3]: https://support.google.com/webmasters/answer/7451001?hl=fr "Aide Search Console — Rapport sur les sitemaps"
