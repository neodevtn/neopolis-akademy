# Rapport de remédiation — Claude Certified Developer – Fondations

**Date :** 18 septembre 2026  
**Périmètre :** `claude_certified_developer_foundations` exclusivement, soit les cinq cours `__01` à `__05`.  
**Référence :** paquet d’audit Débutant et Intermédiaire du 18 septembre 2026.

## Résumé de l’intervention

La remédiation a priorisé les défauts qui empêchaient un parcours cohérent ou exposaient des corrections : exercices racine tronqués, instructions sans interaction, rattachements d’activités à un mauvais chapitre, corrections présentes dans le JSON apprenant, et cartes pédagogiques incomplètes. Conformément au contrat de non-invention, les éléments dont la source complète n’était pas présente ont été retirés avec leur point de contrôle dépendant au lieu d’être reconstruits artificiellement.

| Sujet | Mesure appliquée | Résultat vérifié |
|---|---|---|
| Exercices tronqués, orphelins ou hors sujet | Retrait des définitions racine non rendues, ainsi que des checkpoints dépendants. | Aucun exercice racine restant n’est orphelin ; chaque checkpoint publié référence une définition existante. |
| Corrections et clés de réponse | Extraction de 15 corrections de checkpoints dans un registre serveur privé et activation de `serverCorrectionRequired`. | Les cinq API cours apprenant ne retournent ni `correct: true`, ni correction, rubric ou sample answer. |
| Soumission des checkpoints | Ajout des procédures serveur dédiées, persistance de la soumission et accès à la correction seulement après enregistrement. | Les tests couvrent le refus avant soumission, la correction post-soumission et la reprise d’état. |
| Activités statiques impossibles | Retrait des invitations à répondre qui n’avaient ni champ, ni correction, ni clé source complète. | Les écrans conservent le contenu pédagogique et ne prétendent plus proposer une activité réalisable. |
| Cartes tronquées / doublons cumulatives | Retrait des cartes interrompues et des préfigurations statiques qui dupliquaient les TP S17/S18. | Les TP cumulatives restent accessibles dans leurs chapitres dédiés. |
| Métadonnées et catalogue | Recalcul des compteurs de chapitres, checkpoints/TP, vidéos et téléchargements à partir des blocs publiés. | Le contrat de synchronisation catalogue est automatisé. |
| Titres et consignes identifiés | Correction d’un titre tronqué, suppression d’une contrainte linguistique contradictoire et restauration du prompt de packaging depuis le contenu source exact du checkpoint. | Les écrans concernés ont une consigne complète et une saisie sans obligation de langue incompatible avec l’interface. |

## Compteurs après remédiation

| Cours | Chapitres | Exercices racine sécurisés | Checkpoints | TP cumulatives | Vidéos gérées | Téléchargements gérés |
|---|---:|---:|---:|---:|---:|---:|
| Fondations MSO (`__01`) | 10 | 5 | 5 | 0 | 0 | 0 |
| Prompting, agents et outils (`__02`) | 12 | 8 | 8 | 0 | 0 | 0 |
| Claude Code, MCP et intégration (`__03`) | 11 | 1 | 1 | 2 | 0 | 0 |
| Production, évaluations et sécurité (`__04`) | 12 | 0 | 0 | 2 | 0 | 0 |
| Accélérateurs et contribution à la PI (`__05`) | 14 | 1 | 1 | 2 | 0 | 0 |

## Contrôles effectués

Le contrôle TypeScript est réussi. La suite ciblée comprend 24 tests réussis, couvrant les nouveaux contrats de remédiation, la confidentialité de la réponse cours, le service de checkpoint, et le verrouillage séquentiel. Les cinq routes de cours locales répondent HTTP 200. Les cinq réponses `/api/trpc/course-data/...` ont été inspectées : les corrections, barèmes, exemples de réponse et clés de choix ne sont pas présents. Aucune URL de médiathèque obligatoire n’est déclarée dans ces cinq cours ; aucun téléchargement ne peut donc être annoncé à tort.

Le rendu apprenant a été inspecté localement sur le cours `__03` en format bureau : navigation latérale, titre, séquençage, progression et lecteur mono-écran sont visibles et utilisables. Le parcours reste séquentiel ; le retrait d’une activité source-incomplète ne transforme pas les autres écrans en passages libres.

## Éléments non réécrits sans source autorisée

Une relecture automatisée signale encore des imperfections de localisation française, de mise en forme Markdown et de ventilation détaillée des durées, principalement dans `__02`, ainsi que quelques tableaux sources de `__04` et `__05`. Elles sont documentées dans les audits `docs/anthropic-developer-course*-claude-audit.json`. Elles ne sont pas maquillées : aucun texte, tableau ou durée n’a été inventé pour masquer ces absences de source. Les défauts qui rendaient une activité trompeuse ou impossible ont été supprimés ; les défauts éditoriaux restant exigent une source partenaire structurée ou une validation pédagogique explicite avant reconstruction.

## Fichiers de mise en œuvre

Les scripts déterministes `remediate_developer_foundations_audit.mjs`, `protect_developer_foundations_corrections.mjs`, `remove_developer_malformed_blocks.mjs` et `repair_developer_foundations_followup.mjs` rendent la remédiation reproductible. Le registre `developerFoundationsCorrectionRegistry.ts` n’est jamais envoyé par la route de données cours. Le service `developerFoundationsCheckpointService.ts` constitue l’autorité serveur pour la soumission et le déverrouillage de la correction.
