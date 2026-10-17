# Audit pédagogique et UX — Synthèse exécutive

> **Périmètre audité en lecture seule :** 116 formations, 180 cours et 3563 écrans. Aucun contenu, code applicatif ou enregistrement de base n’a été modifié.

## Résultat global

| Indicateur | Résultat |
|---|---:|
| Score moyen pédagogique (dimensions vérifiables) | **71.83/100** |
| Couverture des scores | 3552 / 3563 écrans (99.69 %) |
| Blocs interactifs audités | 1859 |
| Définitions d’exercices auditées | 259 |
| Références checkpoint → exercice auditées | 134 |
| Constats confirmés | **1960** |
| Constats liés à une activité | 1255 |
| P0 — bloquants | **223** |
| P1 — majeurs | **926** |
| P2 — modérés | 679 |
| P3 — mineurs | 132 |

Le score est un **indicateur de qualité pédagogique observable**, pas une note de conformité académique : les médias externes, le comportement E2E authentifié et la correction dynamique ne sont pas inclus lorsqu’ils n’ont pas été exécutés.

## Diagnostic prioritaire

1. **L’intégrité de la progression est le défaut dominant.** Des checkpoints invisibles, des validations de réponses libres trop permissives, des médias obligatoires ignorés par le verrou et des activités pratiques déverrouillées après une saisie minimale empêchent de garantir l’acquisition avant passage.
2. **Les TPs ne sont pas toujours faisables dans Neopolis.** Plusieurs activités demandent un fichier, une interface, une session ou un environnement non fourni dans l’écran. C’est un P0 lorsque l’activité est obligatoire et ne peut être réalisée sans cet élément.
3. **Le feedback existe souvent dans les données mais pas dans l’expérience apprenant.** Les indices, corrections de tri et explications ne sont pas systématiquement transmis aux composants de rendu.
4. **Les cours techniques souffrent d’une fausse pratique.** Plusieurs `code_repl` comparent une saisie à une solution canonique sans exécuter le code ni valider le résultat attendu ; certains ne conditionnent pas la progression.
5. **La contextualisation multimédia et la localisation restent inégales.** Des vidéos isolées n’explicitent pas leur objectif ni leur réinvestissement ; des parcours français conservent des feedbacks, transcriptions ou critères visibles en anglais.

## Cours concentrant le plus de P0

| Cours | P0 | Risque principal |
|---|---:|---|
| `claude_certified_architect_foundations__03` | 26 | Validation ou activité bloquante non fiable / non rendue |
| `working_with_the_openai_api__01` | 20 | Validation ou activité bloquante non fiable / non rendue |
| `claude_certified_architect_foundations__02` | 16 | Validation ou activité bloquante non fiable / non rendue |
| `claude_certified_architect_foundations__01` | 13 | Validation ou activité bloquante non fiable / non rendue |
| `claude_certified_architect_foundations__06` | 12 | Validation ou activité bloquante non fiable / non rendue |
| `claude_code_101__01` | 12 | Validation ou activité bloquante non fiable / non rendue |
| `claude_certified_architect_foundations__04` | 9 | Validation ou activité bloquante non fiable / non rendue |
| `claude_code_in_action__01` | 9 | Validation ou activité bloquante non fiable / non rendue |
| `deploying_ai_into_production_with_fastapi__01` | 9 | Validation ou activité bloquante non fiable / non rendue |
| `claude_certified_architect_foundations__05` | 7 | Validation ou activité bloquante non fiable / non rendue |

## Recommandations de pilotage

### Lot A — sécuriser l’apprentissage avant la navigation
- Unifier la clé de complétion entre les blocs, les événements de média et `chapterProgress`.
- Rendre tout checkpoint configuré soit avec un exercice valide, soit avec des questions directement affichables — jamais les deux contrats partiels.
- Empêcher un passage sur une réponse libre non qualifiée, une mauvaise réponse ou un simple caractère lorsqu’une preuve structurée est requise.

### Lot B — rendre les activités praticables et évaluables
- Fournir chaque fichier annoncé directement dans `resources`, ou déclarer clairement une alternative reproductible.
- Pour le code : exécuter dans un environnement sûr, ou évaluer une preuve manuelle/rubrique cohérente ; ne pas présenter une comparaison textuelle comme une pratique réelle.
- Pour les TPs externes : vérifier l’accès requis ou proposer un mode simulation/documentation qui reste équitable.

### Lot C — améliorer la clarté et le retour pédagogique
- Afficher le feedback déjà configuré pour les tris, associations et remises en ordre.
- Rendre visibles : objectif, action attendue, résultat/livrable et critère de réussite avant toute activité.
- Normaliser les chaînes visibles FR/EN, alternatives textuelles et métadonnées vidéo.

## Limites et statut de vérification

- Les rapports vérifient les données réellement lues par l’application et les chemins de rendu/progression ; ils ne remplacent pas un test E2E connecté sur desktop, tablette et mobile.
- Les vidéos, PDF, téléchargements, environnements externes et évaluations dynamiques non exécutés sont marqués non vérifiés, jamais présumés absents.
- Aucune correction de contenu, donnée ou code n’est effectuée dans cette phase d’audit.
- Six identifiants de constats du matériau brut étaient dupliqués ; le livrable normalise les doublons par le suffixe `:duplicate-n` et conserve `original_issue_id`.

Les détails, preuves et corrections proposées sont disponibles dans `courses-audit.md`, `activities-audit.md` et `audit-data.json`.
