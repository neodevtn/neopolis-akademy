# IA appliquée aux métiers - TP — vérification de structure autonome

La rubrique `IA appliquée aux métiers - TP` est désormais une collection de 40 formations indépendantes. Chaque TP canonique dispose de sa propre fiche de formation et d’un unique cours pédagogique de six écrans, sans examen blanc fictif.

| Invariant vérifié | Résultat |
|---|---:|
| Formations TP autonomes | 40 |
| Cours rattachés par formation | 1 |
| Sous-catégories métier | 8 |
| Supports de préparation associés | 40 |
| Anciens liens profonds contrôlés | 40 |
| Liens profonds avec `lesson` et `chapter` conservés | 40 |
| Formations représentatives rendues sur desktop | 8 |
| Formations représentatives rendues à 390 × 844 | 8 |

Les anciennes URL de type `/training/ia_appliquee_metiers_tp/<courseId>?lesson=0&chapter=2` sont redirigées côté client vers `/training/ia_appliquee_metiers_tp__formation_<ordre>/<courseId>?lesson=0&chapter=2`. Le rapport machine détaillé est disponible dans `docs/ia-appliquee-metiers-legacy-links-report.json`.

Le TP 01 contrôlé utilise désormais le libellé **Parcours pratique** et ne rend plus de bloc « Examen blanc ». Les contrôles de checkpoint, ressource source en nouvel onglet, mini-projet, quiz final et verrouillage séquentiel ont été rejoués sur les nouvelles routes.

## Contrôle public après publication

Après le checkpoint `cf45b228`, l’ancienne URL du TP 01 a été ouverte sur `https://akademy.neodev.click/training/ia_appliquee_metiers_tp/ia_appliquee_metiers_tp__01?lesson=0&chapter=2`. Elle a redirigé vers la fiche autonome `ia_appliquee_metiers_tp__formation_01`, en conservant `lesson=0` et `chapter=2`. Le parcours public affiche un seul cours, le libellé **Parcours pratique** et six chapitres ; aucun examen blanc n’est présenté.

Le catalogue public affiche désormais la catégorie **IA appliquée aux métiers - TP (40)** et quarante cartes portant chacune `1 cours`, `6 activités`, `7 exercices interactifs` et `1 téléchargement`. Les huit sous-catégories visibles couvrent les TP 01–06, 07–10, 11–16, 17–21, 22–26, 27–31, 32–36 et 37–40. La sonde mobile de production à 390 × 844 a rejoué les TP représentatifs 01, 07, 11, 17, 22, 27, 32 et 37 ainsi que les verrous de ressource, checkpoint, mini-projet et quiz final du TP 01 : 12 contrôles réussis, sans débordement horizontal.
