# Contrôle — boîte de réception des communiqués

## Portée

La pile de cartes affichant le contenu intégral de tous les communiqués a été remplacée par une boîte de réception en deux panneaux. La colonne gauche affiche l’objet, la date, l’état non lu, la priorité et un aperçu strictement limité ; le volet de droite affiche le seul message sélectionné dans son intégralité.

## Contrôles effectués

| Contrôle | Résultat |
|---|---|
| Session apprenante de démonstration | Réussie |
| Liste compacte et volet de lecture | Réussis |
| Recherche « orientation » | Réussie : 2 à 1 communiqué |
| États important, non lu et réception confirmée | Visibles et cohérents |
| Pagination et filtres | Contrat serveur et tests unitaires ajoutés |
| Typage TypeScript | Réussi |
| Tests de boîte de réception | 5 réussis |
| QA de publication | 6 étapes réussies |

Les règles de visibilité, de réception et d’accusé des communications importantes sont conservées côté serveur. La fenêtre obligatoire indépendante continue donc de demander l’accusé de réception lorsqu’il est requis.

## Contrôle mobile

La structure utilise un panneau unique empilé sous le point de rupture `lg`, avec un champ de recherche, un filtre de priorité et des éléments de liste accessibles au clavier. La sonde de matrice mobile de publication est réussie ; sa capture authentifiée spécifique n’a pas été retenue car la session isolée de prévisualisation est restée sur l’état transitoire de chargement.
