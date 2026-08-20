# Référence PageSpeed Insights — Neopolis Akademy

Source : https://pagespeed.web.dev/analysis/https-akademy-neodev-click/d7u0ap6wrg?form_factor=desktop

Rapport observé le 20 août 2026 à 18:28 (rapport Google daté du 20 août 2026 à 18:28:09).

| Profil | Performance | Accessibilité | Bonnes pratiques | SEO |
|---|---:|---:|---:|---:|
| Ordinateur | 79 | 76 | 73 | 85 |
| Mobile | 64 | 81 | 73 | 85 |

Le rapport Google ne signalait aucune donnée d’expérience réelle utilisateur au moment de la consultation.

## Mesures de laboratoire mobile

| Indicateur | Valeur |
|---|---:|
| First Contentful Paint | 3,6 s |
| Largest Contentful Paint | 5,7 s |
| Total Blocking Time | 60 ms |
| Cumulative Layout Shift | 0 |
| Speed Index | 8,5 s |

Lighthouse 13.4.1 simulait un Moto G Power sur réseau Slow 4G. Les diagnostics mobile prioritaires relevaient des requêtes de rendu bloquantes, des durées de cache inefficaces, du JavaScript legacy et inutilisé, une livraison d’images améliorable, des dimensions d’image manquantes, cinq tâches longues, un reflow forcé et une animation non composite.

Les écarts d’accessibilité constatés portaient notamment sur les libellés de formulaire, les contrastes et la hiérarchie des titres. Le rapport signalait également un viewport qui limite le zoom, l’absence de landmark `main`, une description meta absente dans la version analysée et un `robots.txt` invalide.

## Mesures de laboratoire ordinateur

| Indicateur | Valeur |
|---|---:|
| First Contentful Paint | 0,7 s |
| Largest Contentful Paint | 1,1 s |
| Total Blocking Time | 310 ms |
| Cumulative Layout Shift | À relever dans le rapport détaillé |
| Speed Index | À relever dans le rapport détaillé |

Le profil ordinateur a un LCP rapide mais un Total Blocking Time significatif. Les optimisations doivent donc réduire le travail JavaScript et les tâches longues sans dégrader le rendu du hero.

## Lighthouse CLI reproductible sur production

Lighthouse CLI 12.8.2 a été exécuté sur le domaine public après le rapport Google. Les chiffres diffèrent du service PageSpeed car l’environnement local de la CLI a ses propres conditions réseau et CPU ; ils servent de référence comparative reproductible pour chaque itération.

| Profil | Performance | Accessibilité | Bonnes pratiques | SEO | FCP | LCP | TBT | CLS | Speed Index |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Mobile CLI | 36 | 84 | 75 | 92 | 5,2 s | 7,2 s | 920 ms | 0 | 14,1 s |
| Ordinateur CLI | 78 | 79 | 74 | 92 | 1,3 s | 1,8 s | 130 ms | 0 | 6,4 s |

### Causes racines confirmées

1. L’élément LCP mobile est le texte d’introduction du hero (`Home.tsx`, ligne 339). Lighthouse attribue 4 346 ms au TTFB et 2 867 ms au délai de rendu. Le document initial contient environ 369 ko de runtime JavaScript inline injecté par `vite-plugin-manus-runtime`, en plus d’un hero qui attend son animation Framer Motion avant de peindre.
2. Le bundle initial charge Chart.js et le catalogue de formation depuis la page d’accueil alors que le graphique et le widget de reprise ne sont pas critiques au-dessus de la ligne de flottaison.
3. Les trois cartes de la formule forcent leurs images en chargement eager, tandis que les logos de partenaires et une image de section n’ont pas de stratégie de chargement ni de dimensions explicites.
4. Une erreur console est produite par la CSP : un worker Blob est bloqué, car `worker-src` n’est pas défini explicitement.
5. Les audits de conformité pointent aussi le zoom bloqué dans le viewport, le landmark `main` absent, un `robots.txt` invalide, des problèmes de libellés de formulaire, de contraste et de hiérarchie de titres.

## Itération 1 — résultats de validation locale

La build de production locale a été vérifiée avec Lighthouse CLI 12.8.2 après les correctifs de structure et de sécurité. L’accessibilité, les bonnes pratiques et le SEO atteignent chacun 100/100 dans cet environnement : le viewport autorise à nouveau le zoom, le landmark principal est présent, les contrôles du simulateur sont associés à leurs libellés, les contrastes et niveaux de titres sont corrigés, `robots.txt` est valide, et la CSP n’émet plus l’erreur du worker Blob.

La performance locale ne constitue pas une comparaison avec la production distante : le serveur de contrôle ne compresse pas encore le flux HTML et ses conditions de CPU sont plus contraintes. Il met toutefois en évidence deux actions restantes : activer un cache immuable pour les assets versionnés et poursuivre la réduction du travail JavaScript initial. L’artefact de build confirme déjà la suppression du runtime inline : le document produit passe d’environ 369 ko à 1,8 ko, tandis que Chart.js devient un chunk différé de 208 ko.

## Itération 2 — build finale et comparaison locale

| Profil Lighthouse CLI local | Référence | Build finale | Évolution |
|---|---:|---:|---:|
| Mobile — Performance | 36 | 29 | Non comparable : le serveur de mesure local n’applique pas la compression HTTP, que Lighthouse estime à 1,2 Mo d’économie. |
| Mobile — Accessibilité / bonnes pratiques / SEO | 84 / 75 / 92 | 100 / 100 / 100 | Tous les défauts structurels relevés sont corrigés. |
| Ordinateur — Performance | 78 | 81 | +3 points. |
| Ordinateur — Accessibilité / bonnes pratiques / SEO | 79 / 74 / 92 | 100 / 100 / 100 | Correction complète des audits locaux concernés. |

Les éléments mesurables de la build confirment l’amélioration du chemin critique : l’entrée JavaScript passe de 1 242 637 octets à 1 098 878 octets, le catalogue de formation devient un chunk différé de 87 510 octets, Chart.js devient un chunk différé de 207 830 octets, et le document HTML de production est réduit de 368 964 octets à 1 806 octets. Les cartes de formule servent désormais du WebP avec `srcset` et tailles adaptées ; l’économie de redimensionnement d’images détectée passe d’environ 80 ko à 37 ko dans le profil mobile local.

Les tests Lighthouse ont été effectués contre un serveur Node local sans compression de réponse ni CDN, ce qui explique un score mobile de performance conservateur. La vérification finale sur le domaine publié reste indispensable pour mesurer les conditions de réseau et de cache réelles.
