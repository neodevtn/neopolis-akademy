# Mesure Google PageSpeed Insights — mobile — 21 août 2026

## Résultat publié

La mesure Google PageSpeed Insights finalisée sur `https://akademy.neodev.click/` indique :

| Catégorie | Score |
| --- | ---: |
| Performance | 82 |
| Accessibilité | 100 |
| Bonnes pratiques | 100 |
| SEO | 100 |
| Navigation agentique | 3/3 |

Les métriques de laboratoire affichées sont : FCP **3,0 s**, LCP **3,7 s**, TBT **0 ms**, CLS **0** et Speed Index **4,4 s**, sous émulation Moto G Power / 4G lente.

## Améliorations déjà distribuées

- `llms.txt` conforme (titre et liens canoniques) : Navigation agentique portée à **3/3**.
- Cache long et immuable des assets publics versionnés.
- Logo Anthropic WebP compact, dimensions explicites des images et logos.
- Polices non bloquantes, sections sous le pli différées et instrumentation de développement exclue.
- Contrôles authentifiés, reprise de lecture et bandeau de consentement différés hors du chemin critique.

## Diagnostics résiduels Google

| Diagnostic | Estimation |
| --- | ---: |
| Requêtes bloquant le rendu | 150 ms |
| JavaScript inutilisé | 63 Kio |
| Animation non composée | 1 élément |

Ces diagnostics sont désormais marginaux par rapport aux optimisations déjà distribuées. Le TBT nul et le CLS nul confirment que le comportement interactif et la stabilité visuelle sont préservés.
