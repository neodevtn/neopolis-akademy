# Revue de contenu — `building_scalable_agentic_systems__01`

**Périmètre.** Lecture intégrale de `client/public/data/courses/building_scalable_agentic_systems__01.json`, puis comparaison uniquement avec les preuves locales autorisées : `docs/datacamp_building_scalable_agentic_systems_alignment_2026-08-28.json`, `docs/datacamp_building_scalable_agentic_systems_source_notes_2026-08-28.md`, `docs/datacamp_building_scalable_agentic_systems_production_2026-08-28.md`, `scripts/import-datacamp-course.mjs` et `scripts/audit-datacamp-course-alignment.mjs`. Aucun accès DataCamp web/navigateur et aucune modification du fichier de cours.

## Conclusion

L’intégration est **structurellement alignée avec les preuves locales disponibles** : 3 chapitres, 29 activités source, 26 activités conservées, 10 leçons vidéo/Projector, 6 tris, 9 QCM et 1 scénario conversationnel source adapté en interaction QCM. Les 3 exercices visuels retirés sont explicitement documentés comme non reproductibles faute d’images locales ; ce n’est pas une reprise inexacte. Aucun défaut factuel de séquence, de dépendance externe, de média externe, de laboratoire cloud/runtime ou de téléchargement manquant n’est démontré par les preuves locales.

Le point de vigilance est **pédagogique et directement observable dans le JSON** : le cours annonce une pratique et demande seulement de « préparer un chatbot IA autorisé », mais ne fournit ni environnement de TP, ni procédure d’installation, ni étapes d’exécution, ni artefact à produire, ni critère de réussite dans l’environnement de l’apprenant. Les activités restantes sont des vidéos, tris, QCM ou le scénario représenté par `multi_choice_exercise`; elles vérifient la compréhension, sans faire réaliser un système agentique.

## Constats étayés

| Constat | Qualification | Preuve locale |
|---|---|---|
| L’écart 29 → 26 est expliqué par trois exercices visuels retirés, non par une omission non documentée. | Pas un défaut factuel | `docs/datacamp_building_scalable_agentic_systems_alignment_2026-08-28.json`, champs `totals` et entrées 2.6, 2.7, 2.9 ; `docs/datacamp_building_scalable_agentic_systems_source_notes_2026-08-28.md`, lignes 9–19 et 23–33. |
| Les trois visuels source (`mcp_exercise.png`, `mcp_detailed_exercise.jpg`, `a2a_exercise.jpg`) n’avaient pas de copie locale ; les conserver sans visuel aurait été non reproductible. | Décision d’adaptation cohérente | `docs/datacamp_building_scalable_agentic_systems_source_notes_2026-08-28.md`, lignes 11–17. |
| Les preuves d’alignement indiquent 0 exercice cloud, 0 runtime, 0 application embarquée fournisseur, 0 média externe et 0 téléchargement externe ; les activités présentes sont marquées `preserve_or_verify`. | Aucun défaut factuel démontré sur dépendances externes | `docs/datacamp_building_scalable_agentic_systems_alignment_2026-08-28.json`, lignes 12–25 et findings. |
| Le JSON contient 3 téléchargements, tous des PDF de slides locales (`chapter_01_slides.pdf`, `chapter_02_slides.pdf`, `chapter_03_slides.pdf`), pas des notebooks, jeux de données, scripts ou dépendances d’installation. | Insuffisance de guidage TP observable ; pas une dépendance cassée | `client/public/data/courses/building_scalable_agentic_systems__01.json`, blocs `download` aux lignes 597, 2951 et 4718 (références de recherche), notamment le bloc `dc_ch03_slides` autour des lignes 4718–4744 ; `docs/datacamp_building_scalable_agentic_systems_production_2026-08-28.md`, lignes 12–19. |
| La seule préparation explicite est : « préparez un chatbot IA autorisé par votre organisation » et « ne partagez jamais de données sensibles, de mots de passe ou de clés API ». Elle ne précise ni outil compatible, ni configuration, ni tâche à réaliser, ni livrable. | Insuffisance de guidage apprenant directement observable | `client/public/data/courses/building_scalable_agentic_systems__01.json`, lignes 61–66. |
| L’inventaire JSON attendu/extrait annonce 29 activités et les types 10 vidéos, 6 tris, 9 QCM, 3 visuels et 1 chat ; les 3 visuels retirés sont expliqués dans l’alignement. | Séquence et typologie globalement cohérentes avec la preuve locale | `client/public/data/courses/building_scalable_agentic_systems__01.json`, lignes 9–23 ; `docs/datacamp_building_scalable_agentic_systems_alignment_2026-08-28.json`, lignes 12–25 et 27–53. |

## Présentation et séquence

La progression visible est cohérente : introduction aux agents et à leur conception, modèles multi-agents/MCP/A2A, puis validation, mise en production et atténuation des risques. Les chapitres et titres d’activités sont présents dans l’ordre source documenté. Les contrôles locaux signalent également 166/166 segments Projector contrôlés et une QA d’interactions réussie sur des activités représentatives (`docs/datacamp_building_scalable_agentic_systems_source_notes_2026-08-28.md`, lignes 21–39).

Une présentation perfectible est toutefois observable : le premier chapitre répète plusieurs intitulés de slides (« Le parcours qui vous attend ! », « Composants d’un agent », « Quand utiliser des agents ? »), mais cette répétition appartient au contenu Projector importé et aucune preuve locale ne permet de la qualifier d’inexactitude pédagogique. Elle est donc signalée comme cohérence éditoriale à vérifier, pas comme défaut factuel.

## Pratique et environnement apprenant

**Prêt pour la compréhension guidée, pas pour un TP autonome.** Le cours est utilisable pour regarder, trier et répondre à des questions dans Neopolis. En revanche, le JSON n’expose aucune activité de type `CloudExercise`, `DatalabExercise` ou `IDEExercise`, et l’alignement confirme `cloudExercises: 0` et `runtimeExercises: 0`. Le scénario « Tester un agent de manière fiable » demande d’identifier des types d’entrées problématiques à partir de prompts fournis, mais ne fait pas exécuter ces prompts dans un agent propre à l’apprenant et ne demande pas de consigner les résultats (`client/public/data/courses/building_scalable_agentic_systems__01.json`, bloc `dc_ch03_act02` autour des lignes 4748 et suivantes).

Le risque est donc un **écart entre la promesse “Passons à la pratique !” et l’action réellement demandée**. Il ne s’agit pas d’un problème de clé API ou d’installation cassée : aucune installation n’est requise ni fournie. Le problème est l’absence de guidage pour transférer les concepts dans l’environnement personnel de l’apprenant.

## Correctifs génériques réutilisables par blocs Neopolis

1. Ajouter un bloc standard **EnvironmentPreparation** qui indique les prérequis minimaux, les outils autorisés, la politique de données et une solution sans clé/API pour les apprenants ne disposant pas d’un accès fournisseur.
2. Ajouter un bloc **GuidedAction** par TP : objectif, étapes numérotées, prompts ou entrées à exécuter, résultat attendu, et procédure de reprise en cas d’échec.
3. Ajouter un bloc **ArtifactSubmission** ou **Reflection** demandant un livrable léger et vérifiable (journal de tests, matrice entrées/résultats, schéma d’architecture ou checklist de garde-fous), sans imposer une plateforme externe.
4. Ajouter un bloc **Checkpoint** avec critères de réussite observables et feedback ; conserver les tris/QCM comme contrôles de connaissances, mais ne pas les présenter comme remplacement d’une exécution pratique.
5. Pour les sujets MCP/A2A et production, fournir un **scénario local simulé** ou un jeu de données fictif téléchargeable, avec commandes génériques optionnelles et avertissement explicite de ne jamais utiliser secrets ou données sensibles.

**Verdict :** source-aligned pour la structure et les omissions documentées ; **practiceReadiness = needs-learner-environment-guidance**. Gravité globale : **medium**, car le cours reste consommable mais ne permet pas de réaliser de manière autonome la pratique annoncée.

## Sources citées

- `client/public/data/courses/building_scalable_agentic_systems__01.json`
- `docs/datacamp_building_scalable_agentic_systems_alignment_2026-08-28.json`
- `docs/datacamp_building_scalable_agentic_systems_source_notes_2026-08-28.md`
- `docs/datacamp_building_scalable_agentic_systems_production_2026-08-28.md`
- `scripts/import-datacamp-course.mjs`
- `scripts/audit-datacamp-course-alignment.mjs`

> Le fichier `docs/datacamp_building_scalable_agentic_systems_verification_2026-08-28.md` a été recherché mais n’existe pas dans le dépôt ; aucun constat ne repose sur ce chemin absent.
