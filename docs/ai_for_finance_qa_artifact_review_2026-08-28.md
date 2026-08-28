# Revue des artefacts QA — AI for Finance

## Périmètre revu

La revue couvre les preuves AI for Finance et la matrice QA globale conservées depuis le checkpoint précédent. Les artefacts générés ne sont pas des fichiers temporaires : ils constituent les preuves de régression du pipeline de publication. L’inventaire automatisé ne trouve aucun fichier `*.tmp`, `*.part` ou archive de paquet dans `docs/`.

| Catégorie | Artefacts conservés | Justification |
|---|---|---|
| Matrice QA globale | 46 captures desktop/mobile et `block_qa_browser_results_2026-08-25.json` | Preuves PNG valides de la matrice transversale des blocs ; nécessaires à la QA globale. |
| Vérification IA DataCamp | `ai-evaluation-datacamp-mobile.png`, `ai-evaluation-datacamp-competencies-mobile.png`, rapport d’évaluation | Preuves du TP rubricé, du feedback, de la lisibilité et de l’attribution de compétences. |
| AI for Finance | `ai-for-finance-card-sort-mobile.png`, rapport de tri, rapport de disponibilité des 9 TP, audit d’alignement et notes source | Preuves du tri cliquable, de la conversion rubricée et des deux retraits explicitement justifiés. |
| Publications | `publication_qa_report.json`, `interaction-source-audit.json` et `.md` | Résultats des six étapes de contrôle réussies et audit des interactions source. |

## Décision

Les artefacts sont conservés car chacun correspond à une vérification actuelle ou au cours AI for Finance. Les anciennes preuves de bloc supprimé ont déjà été écartées lors du pilote Novasavo ; aucun artefact périmé supplémentaire n’a été identifié dans cette revue. Le statut Git après revue ne contient que des sources, scripts, tests, données de cours et preuves QA attendus pour ce lot.

La revue a contrôlé individuellement les trois rapports propres au lot : le tri confirme le placement par clic, le verrou avant soumission, le feedback et le déverrouillage ; la disponibilité des TP confirme 9/9 rubriques source conservées ; l’alignement confirme 28 activités Neopolis pour 30 activités source, dont exactement 2 retraits assumés. Les captures mobile de l’évaluation, des compétences et du tri sont conservées car elles correspondent à ces rapports et reproduisent les contrôles réellement exécutés.

L’inventaire final `ai_for_finance_qa_artifact_inventory_2026-08-28.json` valide 57 artefacts : 8 rapports, 3 captures dédiées DataCamp et 46 captures de matrice. Il ne relève aucun artefact invalide, aucun candidat obsolète et documente explicitement `deletedObsoleteArtifacts: []`. La recherche finale d’archives et de fichiers temporaires dans `docs/` ne retourne aucun `*.tmp`, `*.part` ni `*.zip`. Une confirmation Git distincte est exécutée après cette revue documentée ; aucune suppression supplémentaire n’est nécessaire.
