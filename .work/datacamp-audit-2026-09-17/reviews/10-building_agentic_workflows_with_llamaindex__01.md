# Revue de contenu — `building_agentic_workflows_with_llamaindex__01`

**Périmètre.** Audit autonome fondé uniquement sur le JSON du cours et les preuves locales autorisées. Sources principales : [`client/public/data/courses/building_agentic_workflows_with_llamaindex__01.json`](../../../client/public/data/courses/building_agentic_workflows_with_llamaindex__01.json), [`docs/datacamp_building_agentic_workflows_with_llamaindex_alignment_2026-08-28.json`](../../../docs/datacamp_building_agentic_workflows_with_llamaindex_alignment_2026-08-28.json), [`docs/datacamp_llamaindex_source_notes_2026-08-28.md`](../../../docs/datacamp_llamaindex_source_notes_2026-08-28.md), [`docs/datacamp_llamaindex_production_check_2026-08-28.md`](../../../docs/datacamp_llamaindex_production_check_2026-08-28.md) et [`docs/datacamp_llamaindex_import_notes_2026-08-24.md`](../../../docs/datacamp_llamaindex_import_notes_2026-08-24.md).

## Synthèse

L’alignement structurel est **partiel** : la preuve locale décrit bien 2 chapitres et 15 activités source, dont 5 vidéos et 10 `DatalabExercise`, mais le cours livré ne contient que 5 activités d’enseignement vidéo. Les dix TP source ont été retirés, sans substitution évaluée localement. Ce choix est documenté comme lié à l’absence de rubrique et de critères explicites dans le paquet source ; il ne constitue donc pas une reprise pédagogique complète des interactions originales.

**Sévérité : élevée pour la préparation à la pratique, moyenne pour la cohérence éditoriale.** Le JSON expose directement une contradiction de présentation : `datacampImport.expected` annonce 15 activités extraites et 10 `LocalEnvironmentExercise` (lignes 9–19), tandis que la structure réelle ne contient que cinq chapitres vidéo et deux téléchargements (notamment lignes 24–56 et les chapitres suivants). La note de production locale confirme le résultat publié : **5 activités, 0 exercice interactif, 5 vidéos et 2 téléchargements**.

## Constats étayés par les preuves locales

| Constat | Preuve locale | Qualification |
|---|---|---|
| La source comporte 15 activités : 5 vidéos Projector et 10 `DatalabExercise`. | `datacamp_llamaindex_source_notes_2026-08-28.md`, lignes 3–5 ; alignement, lignes 12–24. | Fait source |
| Les 10 activités Datalab ne sont pas présentes dans Neopolis et sont marquées `removed_non_reproducible` (par exemple « Premiers pas avec LlamaIndex », « Créer un agent », puis les TP multi-agents). | `datacamp_building_agentic_workflows_with_llamaindex_alignment_2026-08-28.json`, lignes 51–68, 91–108, 131–166 et 191–302. | Fait d’écart |
| Aucune rubrique/aucun critère d’évaluation explicite n’est fourni pour ces dix activités ; la source locale dit qu’une conversion en réponses libres évaluées par IA impliquerait d’inventer des critères. | `datacamp_llamaindex_source_notes_2026-08-28.md`, lignes 3–5. | Limite de preuve, non défaut du contenu source |
| Aucun exercice libre de substitution n’a été créé. La production confirme 0 exercice interactif. | `datacamp_llamaindex_production_check_2026-08-28.md`, lignes 3–5. | Fait de livraison |
| Le JSON conserve 5 activités vidéo, 2 téléchargements et un bloc d’environnement dans « Bienvenue ! », mais ne contient aucun bloc d’exercice interactif, consigne de code, starter code, solution, installation ou procédure de validation. | JSON du cours, lignes 24–63, 418–430, et structure des 5 chapitres vidéo. | Observation directe |
| Le JSON promet dans les descriptions de « mettre immédiatement la main à la pâte » avec Tavily et OpenAI, et présente un format avec environnement local ; cette promesse n’est pas suivie d’un TP opérable dans le fichier livré. | JSON du cours, lignes 32–33, 50–52, 187–190 ; absence de blocs d’exercice observée directement. | Insuffisance de guidage observable |
| Le bloc « Avant de commencer » demande seulement de préparer un chatbot autorisé et de ne pas partager de secrets ; il ne précise ni environnement Python, ni dépendances, ni variables d’environnement, ni clés de test, ni étapes de vérification. | JSON du cours, lignes 58–63. | Insuffisance de guidage observable |
| L’import est présenté comme conservant « 15 activités ordonnées, 5 leçons Projector, 10 TP guidés » alors que la note de production indique que les 10 Datalab ont été retirés et que le site affiche 0 exercice interactif. | `datacamp_llamaindex_import_notes_2026-08-24.md`, lignes 3–5 ; `datacamp_llamaindex_production_check_2026-08-28.md`, lignes 3–5. | Incohérence documentaire de présentation |

## Séquence et modalités pédagogiques

La séquence vidéo conservée suit une progression intelligible : introduction, définition d’un agent, mémoire, systèmes multi-agents, puis récapitulatif. Toutefois, la séquence source comportait des points de pratique après l’introduction, la création d’agent, la mémoire, les événements et le système multi-agents ; ces étapes sont précisément celles retirées dans l’alignement local. Le parcours publié est donc principalement démonstratif : l’apprenant peut regarder les vidéos et télécharger les supports, mais le JSON ne lui fournit pas de boucle « préparer–coder–exécuter–observer–corriger » dans son propre environnement.

Aucune dépendance externe, aucun téléchargement de paquet et aucune consigne d’installation ne sont factuellement déclarés dans le JSON. Les mentions de Tavily et OpenAI sont des objectifs/concepts dans les descriptions et les vidéos, pas une procédure reproductible. Il serait donc incorrect d’affirmer, sur la seule base locale, qu’une clé ou un service externe est effectivement requis pour exécuter un TP ; on peut seulement constater que le fichier ne guide pas l’apprenant sur ce point.

## Recommandations génériques Neopolis

1. **Bloc standard “Préparer l’environnement”** : préciser version Python, création d’environnement virtuel, installation des dépendances, variables d’environnement, politique de secrets et commande de vérification.
2. **Bloc standard “TP guidé local”** : fournir objectif observable, contexte, fichiers de départ, étapes numérotées, commande d’exécution et résultat attendu ; prévoir un chemin sans service payant lorsque c’est possible.
3. **Bloc standard “Checkpoint de preuve”** : demander une sortie déterministe (log, structure d’événements ou capture textuelle), avec critères de réussite explicites et aide en cas d’échec.
4. **Bloc standard “Dépendances externes”** : distinguer clairement obligatoire/optionnel, documenter les clés API, les limites et un substitut local ou simulé ; interdire l’insertion de secrets réels.
5. **Bloc standard “Cohérence de catalogue”** : calculer les compteurs depuis les blocs réellement livrés et ne pas afficher “TP guidés”/`LocalEnvironmentExercise` lorsqu’il n’existe que des vidéos ; si des activités source sont retirées, l’indiquer dans la fiche du cours.
6. **Bloc standard “Évaluation locale”** : ne créer une activité évaluée que si ses critères sont présents dans la preuve source ou définis explicitement par Neopolis ; sinon la présenter comme pratique non notée, avec une consigne d’auto-vérification.

**Conclusion.** Le cours est techniquement cohérent comme paquet de cinq leçons vidéo et deux supports, mais il n’est pas prêt pour une pratique autonome guidée : les dix TP source ont été supprimés, aucune alternative interactive n’est fournie et les compteurs/mentions de TP restent incohérents avec la livraison observée. Aucun fichier de cours n’a été modifié.

## Sources locales citées

- [`client/public/data/courses/building_agentic_workflows_with_llamaindex__01.json`](../../../client/public/data/courses/building_agentic_workflows_with_llamaindex__01.json)
- [`docs/datacamp_building_agentic_workflows_with_llamaindex_alignment_2026-08-28.json`](../../../docs/datacamp_building_agentic_workflows_with_llamaindex_alignment_2026-08-28.json)
- [`docs/datacamp_llamaindex_source_notes_2026-08-28.md`](../../../docs/datacamp_llamaindex_source_notes_2026-08-28.md)
- [`docs/datacamp_llamaindex_production_check_2026-08-28.md`](../../../docs/datacamp_llamaindex_production_check_2026-08-28.md)
- [`docs/datacamp_llamaindex_import_notes_2026-08-24.md`](../../../docs/datacamp_llamaindex_import_notes_2026-08-24.md)
- [`scripts/register-building-agentic-workflows-with-llamaindex.mjs`](../../../scripts/register-building-agentic-workflows-with-llamaindex.mjs)

Audit effectué sans recours au web DataCamp et sans modification du fichier de cours.
