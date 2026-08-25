# Cohérence visuelle entre éditeur et lecteur

## Écarts corrigés

Les cartes de la **Bibliothèque de blocs** pouvaient dépasser leur colonne lorsque le type interne était long. La grille emploie désormais une colonne tant que la largeur disponible ne garantit pas deux colonnes lisibles ; chaque carte a une largeur minimale nulle, un libellé à retour à la ligne et un identifiant raccourci visuellement avec son nom complet en infobulle.

Les réglages universels de thème et de personnalisation ne sont plus injectés parmi les champs pédagogiques. Ils sont regroupés dans le panneau repliable **Apparence et overrides avancés**. Les valeurs par défaut de palette, densité et disposition sont désormais hydratées dans les blocs existants, afin d’empêcher l’affichage de sélecteurs sans valeur.

Les anciens blocs Novasavo restent lisibles pour préserver les anciens cours, mais sont marqués dépréciés et ne sont plus proposés lors de l’ajout d’un bloc. Les familles génériques restent la seule voie de création pour les contenus nouveaux.

## Médias du cours

L’illustration du graphe « Intelligence Artificielle » ne figurait pas dans les blocs déclarés par le cours et était ajoutée par une heuristique de « contenu court ». Cette injection automatique est désactivée : le lecteur affiche désormais **uniquement** les médias définis dans les données du cours ou la bibliothèque média.

## Contrôles réalisés

| Surface | Vérification | Résultat |
|---|---|---|
| Administration du contenu | Capture de la liste de formations et de la console opérationnelle | Rendu stable et table lisible à 1440 px |
| Bibliothèque de blocs | Contrat de création | Les types `unit_hero_blue`, `inline_myth_reality` et `notes_highlights_bookmarks_panel` sont exclus de la sélection |
| Éditeur avancé | Hydratation des valeurs par défaut | Les options de style ont une valeur explicite et sont regroupées dans un panneau repliable |
| Lecteur apprenant Novasavo | Écran 2/17, session démo | Le Mythe/Réalité est affiché sans illustration heuristique ; le verrou de réponse reste visible |

Les tests automatisés couvrent l’exclusion des blocs dépréciés, l’hydratation de l’éditeur et l’interdiction d’injecter les illustrations automatiques.
