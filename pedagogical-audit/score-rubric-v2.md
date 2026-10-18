# Grille de réévaluation pédagogique 0–100

Cette grille réutilise le principe du premier audit : chaque écran est noté uniquement sur les dimensions **observables dans le JSON actuel et dans les composants de rendu**. Les aspects non observables (qualité réelle d’une vidéo externe, compréhension par un échantillon, compte tiers) sont listés comme non vérifiés et **ne reçoivent aucune pénalité ou bonus**. Les dimensions applicables sont renormalisées sur 100.

## Dimensions observables

| Dimension | Poids indicatif | Ce qui est vérifié |
|---|---:|---|
| Clarté et intention pédagogique | 25 | Titre explicite, explication/objectif, enchaînement compréhensible avec l’écran précédent ou suivant. |
| Faisabilité de l’action demandée | 25 | Toute activité obligatoire est réellement réalisable avec les données, médias ou mécanismes fournis par la plateforme ; aucun prérequis externe non fourni ne bloque. |
| Richesse pédagogique et ressources | 20 | Contenu utile, média contextualisé, transcription/alternative ou ressource si elles sont nécessaires au dispositif ; fichiers internes contrôlés comme livrables. |
| Évaluation et feedback | 20 | Pour une activité : énoncé, réponse possible, correction/feedback et nouvelle tentative lorsqu’ils sont pertinents. Pour un écran purement explicatif, cette dimension est non applicable et les autres sont renormalisées. |
| Navigation, progression et langue | 10 | Écran rendu par un bloc standard, une vidéo au plus, aucune porte fantôme, verrou sur l’activité affichée, traduction cohérente et indication de progression par chapitre disponible dans la sidebar. |

## Règles de décision

- **P0** : l’apprenant ne peut pas réaliser ou franchir une activité obligatoire à cause d’une dépendance absente, d’un verrou incohérent ou d’une erreur de rendu prouvable.
- **P1** : défaut substantiel qui dégrade clairement l’apprentissage ou l’évaluation, sans blocage absolu.
- **P2** : amélioration pédagogique utile mais non bloquante.
- **P3** : finition éditoriale ou ergonomique mineure.
- Un élément supprimé de manière documentée n’est pas pénalisé : il n’est plus présenté à l’apprenant et ne participe plus au verrouillage.
- Les ressources `/api/assets/` sont considérées disponibles uniquement lorsqu’elles figurent dans le rapport HTTP de cette passe ; les ressources externes restent non vérifiées, pas absentes par hypothèse.
- Toute note doit être justifiée par les données du cours courant. Ne pas reprendre un constat ou une note historique sans le vérifier dans l’état courant.

## Agrégation

La note globale est la moyenne arithmétique des notes des écrans actuels, chaque écran comptant une fois. Le rapport doit fournir : nombre d’écrans notés, moyenne, médiane, distribution 0–39 / 40–59 / 60–79 / 80–100, P0–P3 ouverts et les constats avec chemin de preuve.
