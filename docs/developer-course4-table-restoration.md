# Developer Foundations — Cours 4 : restauration des tableaux

**Périmètre.** Cette note couvre exclusivement `claude_certified_developer_foundations__04` et les tableaux concaténés des chapitres Évaluations et juges, Tests et traçage, Gestion des défaillances, ainsi que Coût et orchestration. Elle ne modifie aucun cours Architect.

Le correctif idempotent `scripts/repair-developer-course4-critical.mjs` remplace uniquement les segments de tableau dégradés, délimités par leurs intertitres et le contenu suivant. Les explications, cartes, interactions et checkpoints existants sont conservés.

| Chapitre | Segment restauré | Contrôle réalisé |
| --- | --- | --- |
| `chapter_01` — Évaluations et juges | Référence de sélection du grader | Rendu de la table Markdown confirmé dans le lecteur local le 16 septembre 2026. |
| `chapter_03` — Tests et traçage | Référence sur les niveaux de test et la récupération | Contrat de structure ajouté ; contrôle navigateur à effectuer avec le lot. |
| `chapter_05` — Gestion des défaillances | Référence de décision de gestion des erreurs | Contrat de structure ajouté ; contrôle navigateur à effectuer avec le lot. |
| `chapter_09` — Coût et orchestration | Référence sur l’observabilité et l’orchestration | Contrat de structure ajouté ; contrôle navigateur à effectuer avec le lot. |

La commande de correctif a été exécutée deux fois avec une empreinte identique au second passage. Le test ciblé `TrainingCourse.developerCourse4.checkpoints.test.ts` confirme les trois rattachements de checkpoints, les cartes restaurées et les quatre en-têtes Markdown ; `pnpm check` est vert.

## Localisation complémentaire limitée

Une seconde analyse structurée, exécutée exclusivement avec **Claude Sonnet**, a retenu onze remplacements exacts dans `chapter_09`. Ils localisent uniquement des libellés pédagogiques génériques, tels que la sélection du modèle, la taille du prompt et du contexte, les appels d’outils, les notions de référence et le contrôle avant déploiement. Les identifiants et termes techniques nécessaires — notamment `orchestrator-worker`, `single-agent`, `stop_reason`, les statuts HTTP et les extraits de code — sont conservés. Dix-sept termes techniques ou ambigus ont été volontairement laissés sans modification.
