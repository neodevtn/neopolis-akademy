# Rapport d’import et de QA — Claude Science V3

**Date :** 18 septembre 2026  
**Auteur :** Manus AI  
**Statut :** import technique source-verrouillé terminé ; validation automatisée verte.

## Conclusion

La collection **Claude Science pour la recherche en santé** a été remplacée par les trois cours exactement déclarés dans le paquet V3. Aucun texte pédagogique, question, réponse, ressource, légende ou média n’a été généré, traduit ou substitué. Les deux payloads de cours remplacés qui ne sont plus canoniques ne sont plus distribués par l’API de données de cours.

Les compteurs source sont respectés : **3 cours**, **8 modules**, **12 leçons**, **9 checkpoints**, **3 travaux pratiques** et **12 questions d’évaluation finale**. Les contrôles TypeScript, ciblés, complets et de publication sont réussis. Les 19 ressources publiques utilisées dans le parcours répondent localement HTTP 200. Les 9 fichiers de correction ou de sortie attendue sont stockés mais restent absents des JSON apprenants et protégés par une autorisation serveur après soumission du TP concerné.

## Cours et URLs

| Ordre | Identifiant de cours | Titre canonique | URL apprenant après publication |
|---|---|---|---|
| 1 | `claude_science_01_fondamentaux` | Fondamentaux de Claude Science | `/training/claude_science_recherche_sante_v3/claude_science_01_fondamentaux` |
| 2 | `claude_science_02_pratique` | Pratique de Claude Science | `/training/claude_science_recherche_sante_v3/claude_science_02_pratique` |
| 3 | `claude_science_03_tp` | Travaux pratiques Claude Science | `/training/claude_science_recherche_sante_v3/claude_science_03_tp` |

Le catalogue et l’index de recherche utilisent l’identifiant de collection `claude_science_recherche_sante_v3`. La catégorie est **IA pour la recherche scientifique et la santé**. Le passage au cours suivant est séquentiel. Le second cours ne devient donc pas accessible avant le premier, et le troisième avant le second.

## Correspondance source vers blocs standards Neopolis

Chaque écran reste une unité paginée dans le lecteur. La correspondance repose exclusivement sur les blocs génériques déjà présents dans la bibliothèque Neopolis.

| Type déclaré dans le paquet V3 | Bloc ou composition standard intégrée | Comportement conservé |
|---|---|---|
| `Objectives` | `learning_objectives` | Lecture puis navigation vers l’écran suivant. |
| `SourceGroundedText` | `content` + `source_references` | Contenu source et références accessibles. |
| `VideoEmbed` | `video` | Intégration YouTube déclarée, URL officielle, objectif de visionnage et alternative textuelle fournie. |
| `AnnotatedScreenshot` | `annotated_screenshot` | Affichage `contain`, zoom, plein écran, texte alternatif, légende et zones guidées. |
| `GuidedAction` | `guided_action` | Étapes, preuve attendue, attestations et fichiers cités téléchargeables sur le même écran. |
| `CheckpointMCQ` | `single_choice_exercise` validé serveur | Choix, soumission, retour de correction et verrouillage de progression. |
| `LessonSummary` | `lesson_summary` | Synthèse fournie par le paquet et navigation paginée. |
| `EnvironmentPreparation` | `callout` + cartes `download` | Préparation fournie, puis liens aux fichiers déclarés requis. |
| `PracticalLab` | `cloud_exercise` | Consigne, critères, ressources, soumission de preuve et correction conditionnelle. |
| `Reflection` | `reflection` | Réponse textuelle persistée côté serveur avant déverrouillage. |

## Médias et téléchargements

Les empreintes SHA-256, tailles et chemins des 28 assets fournis ont été vérifiés avant chargement. Les cinq images officielles sont référencées avec leurs attributions de source, leur texte alternatif, leur légende et leurs zones explicatives. Les deux vidéos déclarées conservent l’URL d’intégration `youtube-nocookie` et l’URL YouTube officielle.

| Type d’asset | Déclarés et chargés | Accès apprenant |
|---|---:|---|
| Images déclarées | 5 | Public via médiathèque Neopolis, depuis leurs écrans annotés. |
| Téléchargements de travail | 14 | Public via les actions guidées ou TP qui les citent. |
| Fichiers de correction et sorties attendues | 9 | URL interne Neopolis, uniquement après une soumission du TP associé. |
| Total | 28 | Aucun chemin Drive, URL temporaire ou secret n’est remis à l’apprenant. |

La vérification locale a contrôlé trois réponses de cours, dix-neuf URL d’assets publiques et deux anciennes URLs de cours retirées. Les trois cours ont répondu HTTP 200, les dix-neuf assets publics ont répondu HTTP 200 et les deux anciens payloads ont répondu HTTP 404. Les réponses apprenant ne contenaient ni `correctAnswer`, ni `correction`, ni index de bonne réponse, ni nom de fichier de solution.

## Évaluations, verrouillage et confidentialité

Les neuf checkpoints sont conservés dans le registre serveur d’évaluation. Les douze réponses de quiz final sont également maintenues dans le registre serveur et ne sont jamais sérialisées dans les JSON de cours apprenant. Les travaux pratiques conservent leur correction source côté serveur. Le proxy d’assets vérifie une soumission du TP correspondant avant de servir une ressource de correction ; une tentative sans soumission, ou liée à un autre TP, est refusée.

Les évaluations de TP passent exclusivement par le mécanisme serveur déjà dédié à Claude Sonnet (`claude-sonnet-4-6`). Aucun fournisseur OpenRouter, GPT, DeepSeek ou Ollama n’est appelé pour cette collection. Le paquet ne définit pas de plafond de tentatives pour les évaluations finales ; l’interface et le service interprètent donc cette valeur comme des tentatives sans limite plutôt que comme zéro tentative disponible.

## Résultats de validation

| Contrôle | Résultat |
|---|---|
| Validation de structure et compteurs V3 | PASS — 3 cours, 8 modules, 12 leçons, 9 checkpoints, 3 TP, 12 questions finales. |
| Vérification des ressources déclarées | PASS — 28 assets chargés, dont 19 publics et 9 conditionnels. |
| Livraison locale des cours et fichiers publics | PASS — 24 contrôles HTTP ; 3 payloads et 19 assets à 200, 2 routes retirées à 404. |
| Confidentialité des réponses et corrections | PASS — contrats de sanitation, registre serveur et proxy conditionnel validés. |
| TypeScript | PASS. |
| Tests ciblés V3 | PASS — 39 tests dans 6 fichiers. |
| Régression complète | PASS — 270 fichiers de test, 921 tests réussis, 2 ignorés. |
| QA de publication | PASS — 9 contrôles sur 9, y compris rendu desktop et mobile des blocs standards. |

La prévisualisation isolée demandait une authentification et ne disposait pas de session apprenant. La couverture automatisée de navigation, de verrouillage, des réponses serveur, des téléchargements et des vues desktop/mobile a donc été exécutée avant publication. Le contrôle visuel authentifié de bout en bout sera réalisé sur le domaine canonique dès que la version publiée sera effectivement servie.

## Anomalies corrigées

La collection V2 non canonique n’est plus exposée dans le catalogue, la recherche ou les routes de données concernées. Les actions guidées qui mentionnent un fichier téléchargable affichent désormais le lien Neopolis correspondant sur le même écran. Le comportement des tentatives de quiz final n’interprète plus l’absence de plafond comme un verrouillage. Enfin, la grille de navigation reconnaît les états de quiz final, de réflexion et d’action guidée, ce qui évite le contournement visuel des activités obligatoires.

## Références

[1]: https://drive.google.com/drive/folders/1fgI9sdooJv4eAlnhaqZAxLy9Q9S9q07E "Paquet canonique Claude Science V3 fourni par l’utilisateur"
