# Comparaison visuelle des menus publics — 3 septembre 2026

## Références analysées

Les captures fournies comparent l’accueil et la page publique des formations. Les deux affichent un fond blanc, le logo officiel à gauche et la même hiérarchie de navigation. Le menu de la page Formations reste cependant visuellement plus dense : ses libellés sont plus gras, plus proches et ses contrôles de langue et de candidature ne reprennent pas les mêmes dimensions que l’accueil.

## Constats initiaux

La référence Accueil utilise un en-tête bas, un logo relativement compact, des liens à graisse moyenne et des respirations régulières. Les premiers segments de la référence Formations confirment la même intention de navigation, mais font apparaître une typographie plus lourde et des espacements différents. Les liens sont particulièrement denses entre « Partenaires », « Formations IA », « AI News », « FAQ » et « Se connecter ». La correction doit donc dériver les deux rendus d’un jeu unique de variables : hauteur du header, taille du logo, police, graisse, espacement des liens, boutons de langue et CTA.

## Règle de correction

La page d’accueil devient la référence visuelle. Le rendu HTML serveur des formations adoptera strictement ses dimensions et ses classes de style, sans modifier les liens, la traduction ni les métadonnées SEO.

Les captures confirment que la différence est strictement visuelle. Le bouton de langue actif doit conserver un fond bleu très clair et un rayon doux ; les langues inactives restent sans fond. Le CTA « Postuler » doit avoir la même hauteur, le même fond navy, le même rayon et la même graisse sur toutes les routes. L’accueil rend le logo légèrement plus grand dans une zone gauche plus respirante ; le serveur doit reprendre ce calibrage plutôt qu’un approximatif distinct.

Les segments centraux de l’accueil montrent des liens moins gras et des espacements plus réguliers entre « Partenaires », « Formations IA », « AI News » et « FAQ ». Ces valeurs servent de référence de densité : le rendu serveur doit éviter la police 700–800 et des écarts arbitraires entre les groupes de navigation.

La référence finale confirme la hiérarchie attendue : connexion en capsule bleu moyen, langue active en pastille bleu très clair, langues inactives sans capsule, puis CTA de candidature navy avec chevron. Ces éléments doivent être définis une fois et consommés tant par le composant React que par le HTML serveur.
