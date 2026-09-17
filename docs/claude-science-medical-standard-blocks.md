# Blocs standards — Claude Science et recherche médicale

Ce document décrit les deux ajouts génériques à la bibliothèque de blocs Neopolis. Ils sont réutilisables dans l’éditeur de cours et ne portent aucune logique propre à une page ou à une formation particulière.

| Bloc | Rôle | Champs essentiels | Garantie de sécurité et d’accessibilité |
|---|---|---|---|
| `annotated_screenshot` | Présenter une capture documentaire avec attribution explicite. | `imageUrl`, `title`, `alt`, `caption`, `sourceRefs` | L’image vient de la médiathèque Neopolis ; un texte alternatif, une légende et les liens des sources sont rendus avec la capture. |
| `module_quiz` | Évaluer un module après ses prérequis. | `moduleId`, `title`, `passingScore`, `questionCount`, `competencyPoints` | Les questions sont fournies par une procédure authentifiée et les bonnes réponses/corrections ne sont retournées qu’après la soumission complète côté serveur. |

Le composant vidéo standard accepte également des métadonnées optionnelles : langue, durée, objectif d’observation avant lecture, questions après lecture et alternative textuelle française originale. Ces champs n’altèrent pas les vidéos existantes lorsqu’ils sont absents.

## Règles d’utilisation

Les images et fichiers téléchargeables doivent utiliser une URL stable de la forme `/api/assets/...` issue de la médiathèque Neopolis. Les contenus qui résument une source doivent conserver `source_refs` dans le JSON de cours ; les captures de documentation ajoutent en plus les liens lisibles dans `sourceRefs`.

Le bloc `module_quiz` ne doit jamais recevoir de clé de réponse dans le JSON public du cours. Son implémentation serveur contrôle les prérequis, enregistre la tentative, applique les points de compétences après réussite et ne révèle les corrections qu’après soumission. Cette règle permet de préserver le verrouillage séquentiel sans exposer les réponses dans l’API de données de cours.
