# Audit en reprise — Claude on Google Cloud

## Constats de structure et de ressources

Le cours local compte **99 écrans**, **26 exercices** tous rendus par un checkpoint, et **44 téléchargements**. La page Anthropic accessible publiquement confirme le périmètre général : utilisation de Claude via Google Cloud/Vertex AI, SDK, streaming, outils, évaluations, RAG, MCP, workflows et agents. [1]

Le 16 septembre 2026, le vérificateur local a demandé les 44 ressources telles qu’elles sont affichées aux apprenants. Les **44 requêtes ont répondu HTTP 200 avec un contenu non vide**. Elles correspondent à 37 URL distinctes et sept occurrences répétées. Aucun lien cassé n’est donc établi par ce contrôle.

| Écart constaté | Interprétation sûre | Suite de l’audit |
| --- | --- | --- |
| 44 blocs de téléchargement pour une référence de travail à 40 ressources | Quatre occurrences peuvent être des compléments, des duplications pédagogiques ou un écart d’inventaire. | Créer une matrice de provenance avant toute suppression. |
| Sept occurrences d’URL déjà présentes ailleurs | Une répétition d’URL ne prouve pas qu’un écran est incorrect : elle peut réapparaître dans une étape guidée et une correction. | Contrôler le contexte de chaque occurrence répétée. |
| Aucun bloc ne possède `assetMeta` | La disponibilité est prouvée, mais pas la provenance structurée de chaque ressource. | Préparer une normalisation de métadonnées générique après le rapprochement source. |

> La source publique permet de vérifier les objectifs, mais ne justifie pas de supprimer ou de réécrire des écrans détaillés sans preuve d’inventaire complémentaire.

## Références

[1] [Claude on Google Cloud — Anthropic Courses](https://anthropic.skilljar.com/claude-with-google-vertex)
