# Google PageSpeed mobile après publication — 20 août 2026

Le rapport Google relancé après propagation de la version `26df751a` affiche les scores suivants :

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
