# Audit d’indexabilité Google — 17 septembre 2026

## Constats publics avant correction

Le domaine `https://akademy.neodev.click/` répondait HTTP 200 à un user-agent Googlebot. Les pages publiques contrôlées (`/`, `/formations-ia`, `/formations-ia/catalogue`) exposaient un canonical HTTPS cohérent et une directive HTML `index, follow`. `robots.txt` autorisait l’exploration et déclarait le sitemap racine.

L’index XML `/sitemap.xml` et les sous-sitemaps répondaient HTTP 200 avec `Content-Type: application/xml; charset=utf-8`, mais transmettaient aussi `X-Robots-Tag: noindex`. Cette directive est contradictoire avec l’objectif de rendre le sitemap exploitable pour l’exploration. Google documente qu’un `noindex` HTTP demande aux moteurs compatibles de retirer la ressource concernée des résultats ; son aide indique aussi qu’un en-tête `noindex` sert à empêcher Google de visiter un sitemap.

## Correctifs apportés localement

La directive `X-Robots-Tag: noindex` a été retirée de tous les sitemaps, avec un contrat automatisé Googlebot. Une nouvelle URL canonique, `/sitemap-index.xml`, a été ajoutée et déclarée dans `robots.txt`, tandis que `/sitemap.xml` reste compatible pour les soumissions historiques. Les contrôles locaux valident la réponse XML, l’absence de redirection, cookie, compression et directive `X-Robots-Tag` sur les index et lots.

## Vérification de propagation finale

Après propagation, le domaine principal sert `https://akademy.neodev.click/sitemap-index.xml` en HTTP 200 avec `Content-Type: application/xml; charset=utf-8`, sans `X-Robots-Tag`, redirection ni cookie. Un sous-sitemap canonique répond avec les mêmes garanties. `robots.txt` déclare désormais explicitement cette nouvelle URL. La réponse HTML de repli observée pendant la bascule n’était donc que transitoire.

## Références

- [Google Search Central — construire et soumettre un sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google Search Central — bloquer l’indexation avec noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing)
- [Google Search Console Help — rapport Sitemaps et erreurs de récupération](https://support.google.com/webmasters/answer/7451001)
