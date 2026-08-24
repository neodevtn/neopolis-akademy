# Vérification d’import — DataCamp « Introduction au Model Context Protocol (MCP) »

## Source et intégrité

Le paquet Drive a été reconstitué depuis ses quatre parties et sa somme SHA-256 locale correspond exactement à la somme officielle. Le manifeste canonique et le rapport de complétude confirment 3 chapitres, 34 activités, 11 leçons Projector et 339 téléchargements locaux valides.

## Conversion

La conversion Neopolis conserve l’ordre de 34 activités, le verrouillage séquentiel, 11 leçons Projector audio avec slides, transcripts et PDF, 18 TP MCP autonomes, 3 tris et 3 supports téléchargeables. Les 88 références média réellement consommées sont toutes locales via `/api/assets/` ; l’audit structurel ne remonte aucun bloc non autorisé, média invalide ou TP dépourvu de préparation d’environnement.

## Contrôles visuels locaux

| Vue | Résultat observé |
|---|---|
| Desktop | Le chargement initial dépend de la récupération du JSON de 471 Ko ; après réception, aucune erreur client ou serveur n’est relevée. |
| Mobile (375 × 812) | La certification est correctement résolue, avec 0/3 leçons, le chapitre « Les fondations de MCP », l’activité 1/10 et les contrôles de navigation adaptés à la largeur mobile. |

Le bandeau de consentement aux cookies du preview recouvre le bas de la zone de contenu pendant les captures, sans affecter la progression ni le chargement du cours.

## Validation automatisée

La suite complète a validé **87 fichiers et 324 tests**. Le typage TypeScript et la validation de tous les JSON pédagogiques sont réussis. Les 223 alertes de similarité de choix concernent des cours historiques et ne constituent pas des erreurs pour le cours MCP. Le cours est présent dans l’index de recherche généré et sa catégorie est `fullstack_ai_engineering`.

Le contrôle média de production sera réalisé après la publication, sur les 88 références uniques réellement consommées par le cours.
