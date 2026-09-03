# Aperçus sociaux — pages publiques et parrainage

## Périmètre

Les métadonnées de partage sont rendues côté serveur, ce qui permet à LinkedIn, Facebook, Instagram/Meta, WhatsApp, Slack et X de les lire sans exécuter l’application React. Les routes concernées sont l’accueil, AI News, la candidature, les mentions légales, les pages de formations publiques et les landings de recommandation ou de parrainage (`/refer` et `/apply?ref=…`).

Les pages authentifiées, d’administration et les liens d’acceptation individuels conservent leurs règles `noindex`. Elles reçoivent seulement le visuel de marque générique déjà injecté par le head serveur, sans exposer de jeton, de paramètre sensible ni de donnée personnelle dans la balise canonique.

## Actifs fournis et publiés

| Usage | Dimensions | URL persistante |
| --- | ---: | --- |
| Open Graph, LinkedIn et Meta | 1200 × 630 | `/manus-storage/og-neopolis-akademy-1200x630_eef162a5.png` |
| X / Twitter | 1200 × 675 | `/manus-storage/x-neopolis-akademy-1200x675_28f812f5.png` |
| Aperçu carré compatible | 1200 × 1200 | `/manus-storage/square-neopolis-akademy-1200x1200_a2756579.png` |
| Icône de marque | 512 × 512 | `/manus-storage/neopolis-akademy-512x512_da5efc09.png` |

Les quatre URL ont été contrôlées avec suivi de redirection : elles renvoient HTTP 200 et `image/png`. Les cartes utilisent le format 1200 × 630 pour Open Graph et le format 1200 × 675 pour X, conformément aux fichiers fournis.

## Balises appliquées

Chaque head public publie un `og:type`, `og:site_name`, `og:title`, `og:description`, `og:url`, `og:image`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, ainsi que `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`, `twitter:image:alt` et les liens canoniques existants. Les pages de formation conservent leurs `hreflang` et leurs titres localisés.

## Validation locale

La sonde `scripts/check-social-share-metadata.mjs` a contrôlé onze routes : accueil, AI News, candidature, recommandation, candidature parrainée, mentions légales, index Formations, domaine Finance, index anglais, index arabe et page d’acceptation d’invitation. Les onze réponses HTTP ont inclus un titre et une description Open Graph, la balise canonique, l’image Open Graph sécurisée de 1200 × 630 et la carte X de 1200 × 675.

Les URLs de recommandation utilisent une `og:url` neutre vers `/refer`, afin que les aperçus de réseaux sociaux ne divulguent aucun code de parrainage ni paramètre de campagne. Le contrat est inclus dans la suite de publication sous l’étape `social_share_metadata`. La matrice complète a passé TypeScript, validation de contenu, 550 tests réussis et les contrôles de blocs desktop/mobile.
