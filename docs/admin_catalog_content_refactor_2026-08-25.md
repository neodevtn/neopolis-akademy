# Refonte de l’administration du catalogue et des contenus

## Objet

Les pages **Contenus des cours** et **Catalogue & publications** partagent désormais une console de pilotage cohérente. Elle remplace l’ancienne juxtaposition d’une recherche simple, de cartes de certifications et d’un tableau d’actions peu hiérarchisé.

## Parcours administrateur

| Espace | Usage principal | Capacités livrées |
|---|---|---|
| `/admin/content` | Piloter et éditer les formations | Recherche, filtres par certification et état, pagination, sélection multiple, ouverture et édition directe |
| `/admin/content?mode=catalog` | Organiser la publication et la taxonomie | Vue des programmes, compteurs calculés, paramètres avancés des catégories/certifications/cours |
| Ligne de formation | Décider et agir sans perdre le contexte | Aperçu, édition, changement d’état et affichage du motif administratif |

La navigation latérale sépare explicitement **Contenus des cours** de **Catalogue & publications**. Les deux vues utilisent les mêmes filtres et la même table opérationnelle : titre, identifiant, programme, structure, état et actions sont accessibles au même endroit.

## Cycle de vie sûr

Le registre persistant `course_lifecycle_states` introduit trois états : `active`, `disabled` et `archived`. Une formation désactivée ou archivée reste dans le catalogue pour préserver la transparence, mais son ouverture est refusée aux apprenants, avec le motif renseigné par l’administrateur. Les administrateurs gardent le bypass de consultation.

> L’archivage est une suppression logique, confirmée dans l’interface et entièrement réversible. Il ne supprime ni le JSON du cours, ni les médias, ni la progression, ni les résultats. Une suppression physique n’est volontairement pas exposée dans l’administration : elle nécessiterait un audit des dépendances et une procédure de conservation distincte.

Les changements individuels ou groupés demandent une confirmation et permettent de saisir un motif. La réactivation rétablit ensuite l’accès, sous réserve des règles de groupes déjà configurées.

## Validation

La migration `0034_clammy_doorman.sql` a été appliquée sans opération destructive. La règle de disponibilité apprenant est couverte par un test dédié. La validation finale a exécuté `pnpm check`, `pnpm validate-courses`, `pnpm vitest run` et `git diff --check` : 116 fichiers de tests et 380 assertions ont réussi.
