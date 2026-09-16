# Sources Anthropic publiques candidates — reliquats Developer 4 et 5

**Date de collecte :** 16 septembre 2026  
**Périmètre :** Developer Foundations uniquement

Les sources ci-dessous sont publiques et officielles. Elles peuvent étayer des notions générales de plugins, de distribution et d’observabilité, mais ne constituent pas à elles seules une preuve de l’ordre, de la rédaction ou du rattachement d’un écran Skilljar. Elles ne doivent donc pas servir à créer un TP, une étude de cas ou un checkpoint sans rapprochement explicite avec le cours.

| Thème | Source officielle | Usage possible | Limite constatée |
|---|---|---|---|
| Observabilité Agent SDK | [Documentation Claude Code — OpenTelemetry](https://code.claude.com/docs/en/agent-sdk/observability) | Vérifier les concepts d’instrumentation et de traces de production du cours 4 | Ne reconstitue pas l’activité ou l’écran Skilljar d’origine |
| Plugins Claude Code | [Documentation Claude Code — Plugins](https://code.claude.com/docs/en/plugins) | Vérifier la structure et la distribution de plugins abordées par les cours 3 et 5 | Ne justifie pas l’ajout d’un TP local exécutable |
| Distribution de marketplace | [Documentation Claude Code — Plugin marketplaces](https://code.claude.com/docs/en/plugin-marketplaces) | Vérifier les notions de partage et de marketplace d’équipe | Ne fournit pas l’étude de cas de livraison du cours 5 |
| Conception d’agents | [Anthropic Engineering — Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) | Vérifier un principe général de conception d’agents | Source générale, non équivalente au contenu de certification |

La récupération directe du parcours Skilljar reste indisponible depuis l’environnement de contrôle. Les contenus dont le rattachement dépend de cette source restent ouverts et ne sont pas inférés.

## Enseignements vérifiés le 16 septembre 2026

La documentation d’observabilité indique que l’Agent SDK délègue l’instrumentation au CLI, lequel peut produire des traces, métriques et événements structurés. Elle précise aussi que la collecte de contenu est optionnelle et ne doit pas être activée sans approbation de la chaîne de stockage. Cette source confirme les principes généraux d’observabilité du cours Developer 4, mais ne fournit pas le scénario, les critères de correction ni l’emplacement d’une activité de ce cours.

La documentation des plugins décrit un plugin comme un répertoire autonome qui contient ses composants, et recommande les tests locaux par `--plugin-dir`. La documentation des marketplaces précise en outre que les plugins installés sont copiés dans un cache, et ne peuvent pas référencer des fichiers extérieurs à leur répertoire. Ces éléments confirment le principe de portabilité enseigné dans le checkpoint Developer 3, mais ne suffisent pas à reconstituer les TP Claude Code/MCP restants.

L’article de conception d’agents distingue les flux de travail aux chemins prédéfinis des agents qui dirigent dynamiquement leurs actions, et recommande de conserver la solution la plus simple possible. Il apporte un fondement général aux contenus d’architecture, sans justifier la création de l’étude de cas de livraison Developer 5.

En conséquence, les sources publiques recueillies permettent de vérifier des notions déjà présentes, non de créer les activités ou l’étude de cas restantes. Celles-ci restent reportées jusqu’à rapprochement avec une source de cours explicite.

## Page de parcours Skilljar accessible en texte

La page [Claude Certified Developer - Foundations Prep Course](https://anthropic-partners.skilljar.com/path/claude-certified-developer-foundations) est accessible en extraction textuelle. Elle confirme les objectifs généraux du parcours : Claude Code sous modèle d’autorisations, contexte durable, Skills, plugins, MCP, évaluations, tests, traçage, sécurité, accélérateurs et contribution à l’infrastructure partagée. Elle ne fournit toutefois pas la liste des leçons ni les écrans, activités, corrections ou études de cas nécessaires à un rattachement écran par écran. Elle ne suffit donc pas à débloquer les TP Developer 3 ni l’étude de cas Developer 5.

Les descriptions des cours [Claude Code 101](https://anthropic.skilljar.com/claude-code-101) et [Building with the Claude API](https://anthropic.skilljar.com/claude-with-the-anthropic-api) sont également accessibles. La première décrit notamment les autorisations, la boucle agentique, `CLAUDE.md`, les sous-agents, les Skills, MCP et les hooks ; la seconde couvre les requêtes API, le tool use, les évaluations et MCP. Ces pages sont des prérequis et des sources de notions générales. Elles ne présentent ni les écrans ni les attendus d’évaluation de Developer Foundations, et ne permettent donc pas de substituer ou d’inventer les TP et activités encore ouverts.
