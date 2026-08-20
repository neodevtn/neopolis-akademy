# Google PageSpeed mobile après publication — 20 août 2026

Le rapport Google relancé après propagation de la version `26df751a` affichait les scores suivants :

| Catégorie | Score |
| --- | ---: |
| Performances | 84 |
| Accessibilité | 100 |
| Bonnes pratiques | 100 |
| SEO | 100 |
| Navigation agentique | 3/3 |

Les métriques mobiles relevées sont : FCP 2,9 s, LCP 3,4 s, TBT 30 ms, CLS 0 et Speed Index 4,6 s.

Les diagnostics de performance restants, à traiter sans régression, sont : ressources de blocage du rendu (280 ms estimées), optimisation d’images (7 Kio estimés), 83 Kio de JavaScript inutilisé, deux tâches longues et une animation non composée.

Les images du bandeau de partenaires et le logo de pied de page disposent désormais de dimensions HTML explicites ; le diagnostic de dimensions d’image a été traité dans l’itération suivante, avec validation TypeScript et tests ciblés.

## Mesure finale du rapport Google

Après propagation de la version `929d99a2`, le rapport Google mobile `xlttfik5gv` affiche **85/100** en performance, **100/100** en accessibilité, bonnes pratiques et SEO, ainsi que **3/3** pour la navigation agentique.

Les métriques sont FCP **2,9 s**, LCP **3,2 s**, TBT **0 ms**, CLS **0** et Speed Index **4,8 s**. Les diagnostics encore signalés sont le CSS de rendu critique (270 ms estimées), 83 Kio de JavaScript inutilisé et une animation non composée. Ces diagnostics ne remettent pas en cause les scores parfaits d’accessibilité, bonnes pratiques, SEO et navigation agentique.

## Propagation de la réduction finale du bundle

La version `08221f24` est distribuée avec le bundle initial `/assets/index-DaPcxICq.js`, servi en HTTP 200 avec `content-length: 548436` et `cache-control: max-age=7776000`. Le collecteur de développement est absent du HTML de production.

Une nouvelle analyse Google mobile a été déclenchée après cette propagation (rapport `92hy8fmktk`). L’interface Google est restée à l’état de chargement pendant le contrôle automatisé ; son score final doit être relu après la finalisation côté Google. Les contrôles locaux et la disponibilité de la version publiée restent validés.
