# Prévol DataCamp — Concevoir des systèmes d’IA avec l’API OpenAI

## Source et statut

- Paquet Drive : `datacamp_developing_ai_systems_with_the_openai_api_complete_media_package_2026-08-21.zip`.
- Manifeste canonique : `developing-ai-systems-with-the-openai-api/COURSE_MANIFEST.json`.
- Rapport de complétude : **3 chapitres**, **36 activités**, **11 vidéos**.
- La source déclarée est le cours DataCamp autorisé « Concevoir des systèmes d’IA avec l’API OpenAI » : `https://app.datacamp.com/learn/courses/developing-ai-systems-with-the-openai-api`.

## Types à convertir sans perte

| Type DataCamp | Nombre | Traitement Neopolis requis |
|---|---:|---|
| `VideoExercise` | 11 | Bloc `video`, médias locaux, transcript et sous-titres locaux. |
| `MultipleChoiceExercise` | 1 | QCM standard avec correction masquée. |
| `PureMultipleChoiceExercise` | 4 | QCM standard avec correction masquée. |
| `SingleProcessExercise` | 17 | TP autonome : code de départ, préparation d’environnement personnel, indice et solution masqués. |
| `DragAndDropExercise` | 2 | Bloc `bucket_sort` ou `matching`, uniquement après extraction complète des données canoniques. |
| `TabExercise` | 1 | Bloc standard `tabbed_content`, avec contenu et validation canoniques. |

## Règle de blocage

Le paquet ne contient pas de `LOCAL_ASSET_INDEX.json`. Avant import, les médias présents dans `downloads/` et les éventuels états préchargés doivent être inventoriés. Toute activité interactive dont la réponse, les catégories ou les feedbacks canoniques seraient absents ou tronqués reste **non importée** : aucune réponse ne doit être inférée ou remplacée par du contenu libre.
