# Audit pédagogique — Novasavo « Automatisation comptable par l’IA »

## Sources d’autorité consultées

Le paquet Drive restauré contient `COURSE_MANIFEST.json`, `UI_AUDIT_NOVASAVO_TO_NEOPOLIS.md`, `NEOPOLIS_PAGINATION_SPEC.md` et les captures authentifiées de l’unité 1. Le manifeste confirme **12 unités** et impose un lecteur paginé à verrouillage séquentiel. Il documente explicitement, pour l’unité 1, les interactions suivantes : Mythe/Réalité, choix multiple, scénario, frise, flux, paires erreur/correction, assistant contextuel, comparaison et résumé.

## Constats sur le JSON publié

| Élément | Occurrences | Décision |
|---|---:|---|
| `learning_progress` | 12 avant correction ; 0 après régénération | Retiré : la progression de compétences est une fonction transversale Neopolis, non un écran pédagogique source. |
| `learning_tools` avec `toolMode: notes` | 12 avant correction ; 0 après régénération | Retiré des écrans : les notes et signets restent une capacité du lecteur/profil, mais ne doivent plus bloquer ou occuper un écran de fin d’unité. |
| Transition « Passage à l’unité suivante » | 12 avant correction ; 0 après régénération | Retirée : la navigation standard Neopolis suffit et conserve le verrouillage séquentiel. |
| Assistant contextuel | 12 | À conserver, sous réserve de ne pas présenter son résultat comme une décision comptable ou fiscale. |
| Mythe/Réalité | 12 | À conserver : réponse déterministe et feedback déjà documentés. |
| QCM / scénarios | 19 | À conserver : options et réponses correctes déterministes déjà présentes. |
| Réponse libre avec rubrique source exploitable | 0 | Ne pas créer ni noter avec IA dans Novasavo sans énoncé et rubrique source autorisés. |

## Évaluation IA des réponses libres

La fonctionnalité générique doit être créée uniquement pour les activités dont le contenu fournit : objectif pédagogique, critères explicites, seuil de réussite et éléments attendus. L’évaluation retournera un JSON structuré, expliquera ses critères, demandera une nouvelle tentative si nécessaire et ne devra jamais constituer une décision comptable, fiscale ou réglementaire.

Le modèle évaluateur retenu pour l’intégration OpenRouter est `google/gemini-3.7-flash`, vérifié dans le catalogue OpenRouter le 26 août 2026. La clé a été validée via l’endpoint OpenRouter d’authentification.

La capacité générique est désormais prévue pour les seuls blocs ayant une rubrique structurée explicite : critères identifiés, libellés apprenant, descriptions, pondérations, score maximal et seuil de passage. Chaque tentative est immuable, enregistrée avec son contexte de cours, le résultat, les feedbacks, le numéro de tentative et le modèle utilisé. Aucun bloc Novasavo ne l’emploie : le manifeste ne fournit aucune activité de réponse libre accompagnée d’une rubrique autorisée.

## Contrôle de régénération

La régénération canonique conserve **12 unités**, **13 leçons** (dont l’examen final), **77 écrans** et **31 contrôles déterministes obligatoires**. Les recherches statiques confirment zéro bloc `learning_progress`, zéro outil `notes` et zéro transition « Passage à l’unité suivante » dans le JSON public régénéré. Les Mythe/Réalité, QCM et scénarios conservent leur état `requiredBeforeAdvance` et leur feedback déterministe.

## Relecture de parcours et validation QA

La sonde `check:novasavo-replay` a relu les **77 écrans** avec la session administrateur, laquelle dispose du contournement d’accès prévu pour l’audit de contenu. Les 77 écrans ont rendu leur titre et au moins un bloc pédagogique. Avec le compte apprenant, quatre interactions déterministes représentatives de l’unité 1 ont été rejouées : Mythe/Réalité, QCM sur la partie double, QCM sur la première étape du cycle et scénario PME. Dans chaque cas, le message de passage obligatoire était présent avant réponse puis retiré après la bonne réponse.

| Contrôle | Résultat constaté | Portée |
|---|---:|---|
| Écrans Novasavo rendus | 77 / 77 | Parcours complet, accès administrateur d’audit |
| Interactions obligatoires rejouées | 4 / 4 | Unité 1, session apprenant |
| Débordement mobile à 390 × 844 | 0 px | Lecteur Novasavo, écran interactif |
| Débordement mobile à 375 × 667 | 0 px | Lecteur Novasavo, écran interactif |
| Pipeline `qa:publish` | Réussi | TypeScript, JSON, tests, audit d’interactions, QA desktop/mobile |

La capacité OpenRouter reste disponible uniquement pour les futurs blocs `ai_evaluation` pourvus d’une rubrique source explicite. Elle ne transforme pas les QCM, scénarios ou Mythe/Réalité de Novasavo en réponses libres et aucun appel au modèle n’est donc déclenché par ce cours.
