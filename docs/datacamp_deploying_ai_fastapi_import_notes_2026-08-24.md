# Notes d’import — Déployer l’IA en production avec FastAPI

## Sources canoniques

| Élément | Référence |
|---|---|
| Cours | `deploying-ai-into-production-with-fastapi` |
| Source partenaire | `https://campus.datacamp.com/fr/courses/deploying-ai-into-production-with-fastapi` |
| Dossier Drive public | `https://drive.google.com/drive/folders/1Z_DB59obJigKg3uCYn9I7fbUtaHZNRYi` |
| Archive | `datacamp_deploying-ai-into-production-with-fastapi_complete_media_package_2026-08-24.zip` |
| SHA-256 archive | `832a64cb5fa5b94ebb3e9315d50ae251ce94278f11c39a1de8b6c09ad0a5d52a` |
| Consigne | `PROMPT_MANUS_IMPORT_DEPLOYING_AI_INTO_PRODUCTION_WITH_FASTAPI.md` |

L’archive a été reconstituée à partir de 24 fragments Drive, validée par SHA-256 et par `unzip -t`. Les sources utilisées sont le manifeste, le rapport de complétude, l’inventaire d’assets et `PACKAGE_VALIDATION.json`.

## Parité locale

| Élément | Source | Neopolis |
|---|---:|---:|
| Chapitres | 4 | 4 |
| Activités | 46 | 46 |
| Leçons Projector | 14 | 14 |
| TP guidés (`NormalExercise`) | 22 | 22 `cloud_exercise` |
| Éditeurs de code (`IDEExercise`) | 9 | 9 `code_repl` |
| Tris interactifs | 1 | 1 `bucket_sort` |
| Ressources téléchargées | 105 / 105 | 105 téléversées localement |
| Médias effectivement consommés | — | 90 / 90 locaux et valides |

La préparation FastAPI affichée au premier écran demande Python 3.11+, un environnement virtuel, FastAPI/Uvicorn/Pydantic/Joblib, des API exécutées uniquement en local et l’absence totale de secrets ou données personnelles. Les activités restent séquentiellement verrouillées et les compétences sont associées par chapitre.

Quatre leçons contiennent un VTT local publié ; les dix autres ne déclarent aucun VTT local dans le paquet canonique mais conservent leur transcript segmenté. Aucun sous-titre n’est inventé ni récupéré depuis DataCamp.

## Contrôles visuels locaux

| Écran contrôlé | Résultat |
|---|---|
| Premier écran desktop | Préparation FastAPI, lecteur Projector, slides PDF, sous-titres disponibles et transcript visibles |
| Premier écran mobile | Mise en page mobile lisible, ressources et progression conservées |
| TP guidé — endpoint GET | Objectif, consignes repliables, ressources locales et correction masquée avant tentative |
| Éditeur de code — chargement du modèle | Écran d’exercice de code accessible via le bypass administrateur, sans erreur client détectée |
| Tri — versionnement d’endpoint | Cartes, deux zones de dépôt, consigne de clic et bouton de soumission présents |

## Validations de code et de données

`pnpm check`, `pnpm validate-courses` et la suite complète Vitest sont réussis : **96 fichiers de test et 352 tests**. Le validateur de cours ne relève aucune erreur ; ses avertissements historiques de similarité d’options hors de ce cours restent non bloquants. L’audit structurel FastAPI confirme 46 activités, 14 vidéos, 32 exercices interactifs, 90 références média locales et aucune référence invalide.

## Vérification de production

L’audit automatisé sur `https://akademy.neodev.click` confirme que les **90 / 90** références média effectivement consommées répondent correctement. Il ne détecte aucune erreur de média, aucune URL DataCamp externe, aucun chemin `/manus-storage/` public, aucun bloc inattendu, aucune activité non préparée et aucun écart de progression séquentielle.

| Contrôle public | Résultat |
|---|---:|
| Activités / vidéos | 46 / 14 |
| Exercices interactifs | 32 |
| Médias consommés | 90 / 90 locaux valides |
| Références média invalides | 0 |
| Erreurs structurelles | 0 |
| Tags de compétence par chapitre | 4 / 4 |

Le cours est publié et l’audit de production est clôturé.
