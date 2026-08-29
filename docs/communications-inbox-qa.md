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
| Tests de boîte de réception | 6 réussis |
| QA de publication | 6 étapes réussies |

Les règles de visibilité, de réception et d’accusé des communications importantes sont conservées côté serveur. La fenêtre obligatoire indépendante continue donc de demander l’accusé de réception lorsqu’il est requis. L’ouverture du message non lu de démonstration a été confirmée par l’API : son état est devenu lu et le compteur est passé à zéro ; le message important déjà accusé est resté lu et accusé. Le test de pagination garantit aussi qu’un message important non lu et non accusé reste identifiable avec cet état requis dans la liste.

## Contrôle mobile

La structure utilise un panneau unique empilé sous le point de rupture `lg`, avec un champ de recherche, un filtre de priorité et des éléments de liste accessibles au clavier. Une sonde Playwright reproductible couvre maintenant la boîte de réception à 390 × 844 : liste, sélection, recherche, filtres et absence de débordement. Après le compactage générique de l’en-tête apprenant et le bornage explicite de la grille, la sonde publiée finale a mesuré une section de 358 px, une grille à une colonne de 356 px, une liste de 356 px, `scrollWidth = 390` et `clientWidth = 390`.

## Contrôle de production

Après propagation du checkpoint, l’onglet [Communiqués](https://akademy.neodev.click/training?tab=communications) a été rejoué avec le compte apprenant de démonstration. Le domaine public rend la boîte de réception en deux panneaux, avec deux aperçus courts dans la liste et un seul communiqué complet dans le volet de lecture. La recherche et les filtres restent présents ; les messages importants conservent leur état de réception confirmée. La sonde publiée finale à 390 × 844 confirme les contrôles et la sélection, avec `scrollWidth = 390`, `clientWidth = 390` et `overflow = false`.

Le communiqué non lu du compte de démonstration a été ouvert depuis la ligne de liste, sans appeler directement une mutation depuis la console. La sonde a confirmé la transition de lecture et le compteur de non lus est passé de `1` à `0`. La réponse de la boîte de réception a ensuite confirmé l’état lu persistant. Les règles d’accusé des messages importants n’ont pas été modifiées.
