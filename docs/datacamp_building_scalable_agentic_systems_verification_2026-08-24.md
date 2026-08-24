# Rapport de vérification — « Concevoir des systèmes agentiques évolutifs »

**Date de contrôle :** 24 août 2026  
**Cours Neopolis :** `building_scalable_agentic_systems__01`  
**Certification :** `datacamp_building_scalable_agentic_systems`  
**Source canonique :** `COURSE_MANIFEST.json` du paquet DataCamp Drive validé par SHA-256.

## Intégrité du paquet source

| Contrôle | Résultat | Preuve |
| --- | --- | --- |
| Archive ZIP | Conforme | `source.zip` testé par `unzip -t` |
| SHA-256 | Conforme | `9ea2106bb9aad659b5141401b916c8d08eb7de8632963d114741afda72b90889` |
| Prompt Drive / prompt empaqueté | Identiques | comparaison binaire `cmp` réussie |
| Ressources locales téléchargées par le paquet | 399 / 399 | `COMPLETENESS_REPORT.md` et `PACKAGE_VALIDATION.json` |

## Parité pédagogique et médias

| Élément | Attendu DataCamp | Intégré dans Neopolis | État |
| --- | ---: | ---: | --- |
| Chapitres | 3 | 3 | Conforme |
| Activités | 29 | 29 | Conforme |
| Leçons Projector | 10 | 10 | Conforme |
| QCM source | 9 | 9 | Conforme |
| Tris interactifs | 6 | 6 | Conforme |
| Exercices visuels | 3 | 3 | Conforme |
| Exercice conversationnel | 1 | 1 scénario de chat interactif | Conforme |
| Ressources locales du paquet | 399 | 399 téléversées dans la bibliothèque média | Conforme |
| Références média réellement consommées par le cours | 193 | 193 via `/api/assets/` | Conforme |
| Références média HTTP locales | 193 | 193 réponses HTTP 200 | Conforme |

Les dix leçons DataCamp Projector conservent le format audio MP3 local, les slides synchronisées, la transcription segmentée, les sous-titres français et anglais ainsi que le PDF de slides. Aucune URL de média DataCamp ou chemin `/manus-storage/` n’est présent dans le JSON du cours publié.

## Activités contrôlées

| Type | Activité représentative | Contrôle effectué | Résultat |
| --- | --- | --- | --- |
| Projector chapitre 1 | « Agents IA en conditions réelles » | Audio, slide locale, progression des slides, PDF, sous-titres et transcript | Conforme |
| Tri interactif | « Agent ou pas agent » | Cartes, catégories, correction et verrouillage de progression | Conforme par contrôle de structure et composant standard |
| QCM | « Applications agentiques » | Choix multiples, réponses canoniques, feedback et correction masquée | Conforme par test du convertisseur |
| Exercice visuel | Activités visuelles du chapitre 2 | Rendues par blocs interactifs standards, non par texte brut | Conforme par compteurs et test de provenance |
| Scénario conversationnel | « Tester un agent de manière fiable » | Messages de test FoodGPT, sélection interactive et feedback | Conforme |
| Projector chapitre 3 | « De la validation du concept à la production » | Audio, slides, transcript, PDF et sous-titres locaux | Conforme par audit structurel et HTTP |

## Rendu et progression

La route vérifiée en développement est :

`/training/datacamp_building_scalable_agentic_systems/building_scalable_agentic_systems__01`

La vérification desktop montre le premier écran, le bloc de préparation de l’environnement, le lecteur Projector, le téléchargement du support et le verrouillage des chapitres ultérieurs. La vérification mobile confirme que le lecteur, les actions PDF/sous-titres/transcription, le téléchargement et la navigation restent accessibles dans une largeur de 375 px.

La progression séquentielle est appliquée à chacune des 29 activités. Les trois leçons portent des tags de compétences `ai_solution_design`, `ai_orchestration` et/ou `ai_devops`, qui alimentent les règles XP existantes. Le cours est classé dans la catégorie **Agents IA & Claude** et indexé dans la recherche avec ses chapitres, notamment pour les requêtes « systèmes agentiques » et « MCP ».

## Validation automatisée

| Commande | Résultat |
| --- | --- |
| `pnpm vitest run` | 82 fichiers, 308 tests réussis avec exécution sérialisée des suites DB partagées |
| `pnpm check` | TypeScript sans erreur |
| `pnpm validate-courses` | 0 erreur de validation ; avertissements historiques de similarité de distracteurs conservés hors de ce cours |
| Audit DataCamp structurel | 29 activités, 10 Projector, 19 activités interactives, 193 / 193 médias locaux, aucune erreur |
| Audit HTTP local à débit contrôlé | 193 / 193 réponses HTTP 200 |

## Écarts restants

Aucun écart bloquant n’est identifié. Les 399 fichiers du paquet ont été téléversés ; 193 références sont consommées par le rendu effectif du cours et ont fait l’objet du contrôle HTTP. Les avertissements de validation globaux concernent des distracteurs presque identiques dans des cours plus anciens et ne proviennent pas de cette importation.

## Références

1. [Paquet DataCamp — manifest, complétude et validation](../datacamp_imports/building-scalable-agentic-systems/package/building-scalable-agentic-systems/COURSE_MANIFEST.json)
2. [Rapport de complétude du paquet](../datacamp_imports/building-scalable-agentic-systems/package/building-scalable-agentic-systems/COMPLETENESS_REPORT.md)
3. [Prompt d’import DataCamp](../datacamp_imports/building-scalable-agentic-systems/PROMPT_MANUS_IMPORT_BUILDING_SCALABLE_AGENTIC_SYSTEMS.md)
