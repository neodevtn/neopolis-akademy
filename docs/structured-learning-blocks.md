# Blocs pédagogiques structurés réutilisables

Les blocs ci-dessous sont enregistrés dans `shared/blockRegistry.ts` et rendus par le lecteur standard. Ils évitent de transformer les écrans d’un cours en composants dédiés ou hardcodés.

| Bloc | Données attendues | Règle de progression |
|---|---|---|
| `learning_objectives` | `title`, `items` localisés | Lecture libre ; chaque élément est rendu dans une liste accessible sous le titre de l’écran. |
| `lesson_summary` | `title`, `items` localisés | Lecture libre ; la synthèse est rendue sous le titre, sans le répéter. |
| `guided_action` | `id` stable, `title`, `steps`, `expectedEvidence`, `resources` optionnelles | L’apprenant rédige une note, atteste son action et l’enregistre. Lorsqu’une étape cite un fichier, il est affiché dans un encart de téléchargement sur ce même écran via une URL de médiathèque gérée. La note et l’état sont persistés côté serveur ; l’écran reste verrouillé jusqu’à l’enregistrement. |

Ces trois blocs sont génériques. Ils peuvent être utilisés dans tout cours Neopolis si le contenu source impose respectivement une liste d’objectifs, une synthèse ou une action dont la réalisation doit être attestée. Les blocs ne contiennent aucune logique propre à Claude Science.
