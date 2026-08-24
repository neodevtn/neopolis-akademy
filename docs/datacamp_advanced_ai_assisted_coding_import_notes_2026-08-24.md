# Notes d’import — Programmation assistée par IA avancée pour les développeurs

## Sources canoniques

| Élément | Référence |
|---|---|
| Cours | `advanced-ai-assisted-coding-for-developers` |
| Source partenaire | `https://campus.datacamp.com/fr/courses/advanced-ai-assisted-coding-for-developers` |
| Dossier Drive public | `https://drive.google.com/drive/folders/1PbzWipa1msm8qKJ4SpgCfour56pInudx` |
| Archive | `datacamp_advanced-ai-assisted-coding-for-developers_complete_media_package_2026-08-24.zip` |
| SHA-256 archive | `2a03b0fe50296614676edc66817c9210be6f02f4362e46e51a2ac113d574b874` |
| Prompt prioritaire | `PROMPT_MANUS_IMPORT_ADVANCED_AI_ASSISTED_CODING_FOR_DEVELOPERS.md` |

L’archive a été reconstituée à partir de 13 fragments Drive, contrôlée par SHA-256 et validée par `unzip -t`. Les autorités de conversion sont `COURSE_MANIFEST.json`, `COMPLETENESS_REPORT.md`, `download_assets_manifest.json` et `PACKAGE_VALIDATION.json`.

## Comptage canonique et conversion locale

| Élément | Source | Conversion locale |
|---|---:|---:|
| Chapitres | 3 | 3 |
| Activités | 32 | 32 |
| Leçons Projector | 10 | 10 |
| Expériences visuelles | 9 | 9 exercices à choix interactifs |
| QCM | 5 | 5 exercices à choix uniques |
| Tris interactifs | 8 | 8 `bucket_sort` |
| Ressources téléchargées source | 304 / 304 | 304 préparées et téléversées |
| Références média consommées | — | 97 / 97 locales et valides en local |

Les activités sont séquentiellement verrouillées, les trois chapitres sont taggés pour les compétences et aucune activité évaluative n’est dépourvue de tag. Le premier écran contient les instructions de préparation et l’interdiction explicite de données sensibles.

## Exception média Projector documentée

Sept animations MP4 sont référencées dans les données de slide Projector, mais ne sont pas déclarées parmi les images locales du paquet. Elles sont déjà intégrées aux MP4 Projector locaux de leurs leçons. Le pipeline les omet donc uniquement comme image de slide, sans URL externe et sans substitut inventé ; la vidéo locale reste la représentation fidèle de ces animations. Cette règle générique préserve les médias locaux exigés tout en empêchant qu’une ressource non déclarée bloque un paquet validé 304 / 304.

Quatre leçons Projector ne fournissent qu’un sous-titre anglais local (`ch02_ex04`, `ch02_ex08`, `ch03_ex05`, `ch03_ex08`) : le manifeste ne déclare pas de VTT français pour celles-ci, mais leurs transcripts français segmentés restent disponibles dans le paquet et dans Neopolis. Les six autres leçons conservent leur VTT français local. Aucun VTT n’est inventé ni téléchargé depuis une URL DataCamp.

## État

### Contrôles locaux réalisés

| Contrôle | Résultat |
|---|---|
| Audit structurel | 3 leçons, 32 activités, 10 vidéos, 22 exercices interactifs, 97 / 97 médias locaux valides, aucune erreur |
| Catalogue / recherche | Certification dans `fullstack_ai_engineering`, index de recherche régénéré à 2 948 entrées |
| Tests ciblés | 3 / 3 réussis |
| Suite Vitest complète | 95 fichiers, 349 tests réussis |
| Typage TypeScript | Réussi |
| Desktop | Premier écran : préparation, Projector, PDF, sous-titres et transcript rendus |
| Mobile | Premier écran lisible avec vidéo, ressources et progression empilées |
| Tri interactif | `Structurer votre invite pour l’IA` affiche ses cartes, trois zones de dépôt et le bouton de soumission |
| Expérience visuelle | `Concevoir des invites efficaces pour l’analyse de code` affiche les consignes et les choix interactifs |
| QCM | `Évaluer les suggestions d’optimisation de l’IA` affiche ses réponses et son indice masqué |
| Vidéo finale | `Félicitations et prochaines étapes` affiche le lecteur Projector, les slides, le PDF et le transcript |

Les captures de QA ont été faites avec le bypass administrateur, qui permet de vérifier les écrans futurs sans assouplir le verrouillage apprenant. Les premières tentatives groupées de capture ont temporairement rencontré une limite de requêtes de prévisualisation ; les contrôles individuels stabilisés consignés ci-dessus ont ensuite été effectués sans erreur de rendu ni erreur client.

Restent l’archivage final du diff, le checkpoint de publication et l’audit média sur le domaine de production.
