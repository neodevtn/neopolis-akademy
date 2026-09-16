# Refonte des examens blancs Anthropic

## Objectif

Cette refonte remplace les banques existantes par des questions d’entraînement scénarisées plus proches du **format et du niveau** observés dans l’échantillon privé fourni par l’utilisateur. Les contenus restent des **questions Neopolis d’entraînement** : ils ne sont ni revendiqués comme officiels, ni présentés comme issus d’un examen réel. Les questions nouvellement produites seront rédigées exclusivement avec `claude-sonnet-4-6`.

| Certification | Session publiée | Banque existante | Banque cible | Exemples privés compatibles | Questions nouvelles à produire |
| --- | ---: | ---: | ---: | ---: | ---: |
| CCAR-F | 60 | 318 | 330 | 16 | 314 |
| CCAO-F | 60 | 300 | 330 | 15 | 315 |
| CCDV-F | 53 | 265 | 300 | 12 | 288 |
| CCAR-P | 63 | 300 | 315 | 0 | 315 |
| **Total** | — | **1 183** | **1 275** | **43** | **1 232** |

Les banques cibles sont au moins cinq fois plus larges que leur session, à l’exception de CCDV-F où 300 questions dépassent ce seuil de 265. Les huit lignes restantes de l’échantillon sont conservées comme référence interne de style, mais ne sont pas reprises directement car elles ont cinq ou six propositions ou plusieurs réponses justes, alors que le contrat de cette refonte impose quatre propositions et une seule meilleure réponse.

## Format obligatoire d’une question

Chaque question comprend une vignette professionnelle concrète, un choix de décision identifiable et quatre options plausibles. Les distracteurs doivent représenter des décisions réalistes mais incomplètes, risquées ou inadaptées au contexte ; ils ne peuvent pas être absurdes. Chaque item comporte les deux langues, le domaine, un sous-domaine de travail interne, un objectif pédagogique, un niveau de difficulté, une explication globale et une rationale spécifique pour les quatre options.

Les options seront brassées à l’exécution. Les clés seront équilibrées à l’échelle de chaque banque et resteront stockées seulement dans la source serveur. Aucun libellé artificiel de type « Q16 » ou aucune affirmation de statut officiel ne sera ajouté.

## Répartition cible par domaine

| Certification | Répartition de la banque cible |
| --- | --- |
| CCAR-F | Agentic Architecture & Orchestration 90 ; Tool Design & MCP Integration 59 ; Claude Code Configuration & Workflows 66 ; Prompt Engineering & Structured Output 66 ; Context Management & Reliability 49 |
| CCAO-F | Prompting and Task Execution 46 ; Output Evaluation and Validation 69 ; Product and Model Selection 40 ; Workflow Integration and Solution Design 53 ; Configuration and Knowledge Management 40 ; Governance, Risk, and Responsible Use 49 ; Troubleshooting and Optimization 33 |
| CCDV-F | Agents and Workflows 45 ; Applications and Integration 99 ; Claude Code 9 ; Eval, Testing, and Debugging 9 ; Model Selection and Optimization 51 ; Prompt and Context Engineering 33 ; Security and Safety 24 ; Tools and MCPs 30 |
| CCAR-P | Solution Design & Architecture 54 ; Claude Models, Prompting & Context Engineering 41 ; Integration 60 ; Evaluation, Testing & Optimization 50 ; Governance, Safety & Risk Management 44 ; Stakeholder Communication & Lifecycle Management 44 ; Developer Productivity & Operational Enablement 22 |

Pour CCAR-F, six familles scénarisées recevront six questions chacune : `research_coordination`, `migration_control`, `support_mcp`, `code_rollout`, `structured_intake` et `long_context_review`. Le moteur existant tirera toujours quatre familles et trois questions par famille, soit douze questions scénarisées dans une session de soixante.

## Source et traçabilité

Les questions autorisées du CSV privé sont intégrées avec la provenance `user-provided-mock-sample-2026-09-15`. Elles conservent leur énoncé anglais fourni, reçoivent une traduction et des rationales Claude Sonnet, et restent identifiées comme exemples d’entraînement. Les questions nouvelles porteront la provenance `claude-sonnet-4-6`, la version `neopolis-original-2026-09-16` et une source pédagogique faisant référence au cours local qui a fourni le contexte.

Le corpus envoyé au modèle est construit à partir des cours Anthropic locaux associés au domaine. Les paramètres de certification, de durée, de seuil, de pondération et de sélection des scénarios ne sont pas modifiés par cette refonte. La banque JSON est actuellement la source effectivement servie : aucune ligne Anthropic n’est présente dans `certification_exams` à la date de l’audit. Une future édition administrative devra préserver les métadonnées riches et les rationales afin de ne pas écraser cette banque.

## Contrôles avant intégration

Le pipeline refusera un lot qui contient un identifiant ou un énoncé dupliqué, une question sans EN/FR, un nombre d’options différent de quatre, une clé absente ou multiple, des options identiques, une rationale générique, une provenance non Claude pour une question générée, ou un chevauchement lexical trop proche d’un exemple privé. Il vérifiera aussi la couverture par domaine, la répartition des réponses et, pour CCAR-F, les six familles de scénarios.

Après intégration, les tests de projection apprenant confirmeront que ni clé, ni rationale, ni explication ne sont envoyées avant la soumission. La session scellée, la durée et le score restent évalués par le serveur.

## Références

[1] [Anthropic Partner Certifications](https://anthropic-partners.skilljar.com/page/partner-certifications)

[2] [Claude Certified Architect – Foundations Certification](https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification)
