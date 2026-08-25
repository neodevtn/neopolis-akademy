# Proposition de généralisation de la bibliothèque de blocs pédagogiques

## Conclusion de l’inventaire

La bibliothèque contient un noyau de blocs génériques déjà largement utilisé (`content`, `video`, `download`, `quiz`, `checkpoint`, `flip_cards`, `bucket_sort`, `code_repl`, `cloud_exercise`, `comparison`, `tabbed_content`). À côté de ce noyau, quatorze types ont été ajoutés pour le seul cours **Automatisation comptable par l’IA** : chacun n’apparaît que dans un fichier de cours, même s’il est répété sur ses douze unités. Ils sont regroupés dans `NovasavoLearningBlocks.tsx`, ce qui encode à la fois la sémantique pédagogique, le fournisseur et le style visuel dans un même type.

| Types spécifiques actuels | Occurrences | Problème | Famille générique cible |
|---|---:|---|---|
| `unit_hero_blue`, `learning_objectives_panel`, `course_completion_next_unit_panel` | 12 chacun | Nom dépendant du style ou d’un emplacement | `learning_section` avec `variant`, `eyebrow`, `metadata`, `objectives`, `completionCta` |
| `inline_myth_reality`, `inline_multiple_choice_feedback`, `inline_scenario_question_feedback` | 12, 7, 12 | Un même mécanisme d’évaluation est fragmenté en trois types | `knowledge_check` avec `mode`, `prompt`, `options`, `feedback`, `scenario`, `passingRule` |
| `timeline_step_cards`, `process_flow_diagram` | 13, 12 | Deux présentations d’une séquence ou d’un flux | `sequence_visual` avec `layout: timeline|flow|steps`, `items`, `connectors`, `orientation` |
| `mistake_correction_pairs`, `accounting_comparison_visual` | 12, 1 | Deux comparaisons à colonnes dont les styles sont figés | `comparison_panel` avec `columns`, `tone`, `labels`, `items`, `emphasis` |
| `key_points_summary` | 1 | Variante très limitée d’une liste de contenu | `callout_list` avec `tone`, `icon`, `items`, `numbering` |
| `ai_assistant_prompt_panel`, `notes_highlights_bookmarks_panel` | 12 chacun | Fonctions d’apprentissage transversales nommées comme un fournisseur | `learning_tools` avec `tools: assistant|notes|bookmark`, `context`, `suggestedPrompts`, `persistence` |
| `competency_progress_hud`, `xp_progress_hud` | 12, 0 publié | Indicateurs de progression doublonnés | `learning_progress` avec `metric: competency|completion`, `points`, `copy`, `display` |

## Contrat générique proposé

Tous les nouveaux blocs reposeraient sur quatre familles seulement, plus les blocs média/exercice existants. Les variantes visuelles ne seraient jamais des noms de types : elles seraient placées dans `appearance` et validées par un schéma fermé.

```ts
type GenericBlockAppearance = {
  variant?: "solid" | "soft" | "outlined" | "contrast" | "gradient";
  tone?: "brand" | "info" | "success" | "warning" | "neutral" | "danger";
  accent?: "blue" | "indigo" | "emerald" | "amber" | "slate";
  density?: "compact" | "comfortable" | "spacious";
  layout?: "stack" | "split" | "grid" | "timeline" | "flow";
  icon?: string;
};
```

| Nouveau type | Cas couverts | Attributs clés | États d’interaction |
|---|---|---|---|
| `learning_section` | Hero, objectifs, synthèse, passage d’unité | `title`, `body`, `eyebrow`, `metadata`, `items`, `appearance` | aucun ou `completionCta` |
| `knowledge_check` | QCM, mythe/réalité, scénario | `mode`, `prompt`, `scenario`, `options`, `correctAnswers`, `feedback`, `competencyPoints`, `required` | `unanswered`, `answered`, `correct`, `review` |
| `sequence_visual` | Timeline, étapes, diagramme de processus | `items`, `layout`, `connectors`, `orientation`, `appearance` | lecture seule, responsive horizontal/vertical |
| `comparison_panel` | Erreurs/corrections, avant/après, comparaison de pratiques | `columns`, `items`, `labels`, `appearance` | lecture seule ou révélation progressive |
| `learning_tools` | Assistant, notes, signet | `tools`, `context`, `suggestedPrompts`, `storageScope`, `appearance` | `idle`, `saving`, `saved`, `answering`, `error` |
| `learning_progress` | Points de compétences, avancement, conditions de passage | `metric`, `points`, `copy`, `appearance` | reflète les événements de compétence existants |

L’éditeur administrateur recevrait des champs `select` fermés pour `appearance.variant`, `tone`, `accent`, `density` et `layout`. Il ne recevrait pas de HTML ou de classes Tailwind libres ; cela conserve une personnalisation explicite, prévisible et compatible avec le design system.

## Stratégie de migration sans régression

La migration ne supprimerait aucun type actuellement publié. Chaque type spécifique deviendrait un **adaptateur déprécié** qui normalise ses données vers l’un des blocs génériques. Les JSON existants continueraient donc à se rendre sans transformation immédiate. Une migration par lots écrirait ensuite les nouveaux types seulement après vérification du rendu.

| Lot | Périmètre | Contrôles bloquants |
|---|---|---|
| 0 — compatibilité | Adaptateurs, schémas, rendu générique et éditeur | TypeScript, tests unitaires de normalisation, snapshots de données |
| 1 — pilote | Cours Novasavo uniquement | Desktop, 390×844, 375×667, interactions obligatoires et `scrollWidth` |
| 2 — cours déjà normalisés | Cours utilisant `comparison`, `tabbed_content`, `flip_cards` | Navigation, progression, médias et éditions admin |
| 3 — catalogue complet | Tous les JSON restants par groupes homogènes | `validate-courses`, test de couverture, échantillons navigateur par type |

La publication d’un lot est refusée si l’un des éléments suivants échoue : chargement du cours, interaction obligatoire, compteurs, progression séquentielle, contenu bilingue, ou test navigateur d’overflow.

> Aucune suppression de type ne sera exécutée. Les anciens types deviennent des adaptateurs rétrocompatibles ; les cours déjà publiés restent fonctionnels jusqu’à leur migration explicite.

## Décision appliquée après validation

La bibliothèque comporte désormais les six familles génériques décrites ci-dessus. Le cours **Novasavo — Automatisation comptable par l’IA** est le pilote migré : son JSON ne contient plus `unit_hero_blue`, `inline_myth_reality`, `inline_multiple_choice_feedback`, `inline_scenario_question_feedback`, `timeline_step_cards`, `process_flow_diagram`, `mistake_correction_pairs`, `accounting_comparison_visual`, `key_points_summary`, `notes_highlights_bookmarks_panel` ni `competency_progress_hud`.

Les contenus existants ne nécessitent pas une réécriture JSON pour profiter du socle : chaque bloc rendu par `LessonViewer` passe désormais dans une enveloppe commune de thème et d’apparence. Les valeurs par défaut utilisent le template Neopolis et les nouvelles formations peuvent choisir un template explicitement.

## Templates et personnalisation CMS

Quatre templates sont disponibles : **Neopolis**, **Finance & Comptabilité**, **Laboratoire technique** et **Préparation certification**. Chaque formation stocke facultativement `learningTheme` dans le catalogue, avec palette, densité, rayon et police optionnelle. Le CMS de catalogue expose la sélection de template et les réglages des couleurs primaire, secondaire, accent et surface secondaire.

Tous les types de blocs reçoivent les champs universels `styleTone`, `styleVariant`, `styleAccent`, `styleDensity` et `styleLayout`. Des overrides `customHtml`, `customCss` et `overrideMode` sont également disponibles dans l’éditeur. Le HTML est nettoyé avant rendu ; le CSS est scopé au bloc et refuse imports, URLs, scripts, position fixe, `!important` et les propriétés non autorisées. Les blocs interactifs, exercices et évaluations ne peuvent pas être remplacés par HTML : leurs réponses, feedbacks et verrous restent garantis.

## Contrôles réalisés

Le bloc générique `knowledge_check` du pilote a été ouvert dans le navigateur, répondu avec succès et a déverrouillé la navigation. Les deux viewports mobiles de référence restent sans overflow après migration : `390 / 390` et `375 / 375`. Un cours non Novasavo, **IA pour les nuls**, a aussi été ouvert avec succès après l’ajout de l’enveloppe universelle. Les tests dédiés des thèmes et du pilote sont verts.
