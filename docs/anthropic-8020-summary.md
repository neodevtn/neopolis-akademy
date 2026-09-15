# Balayage Anthropic — règle 80/20

Le balayage accéléré porte sur les 14 cours de certification Anthropic qui n’avaient pas encore reçu un correctif cours par cours : les cours Developer 3–5, Architect Foundations 2–7 et Architect Professional 1–5. Il ne modifie ni les noms de produits Anthropic (`Claude`, `Claude Code`, `Projects`, `Skills`, `Memory`, `MCP`, `Extended Thinking`, `Tool Use`), ni les extraits de code, ni les mécanismes de progression.

| Contrôle | Résultat |
|---|---:|
| Cours inventoriés | 14 |
| Cours présentant au moins un signal statique à fort impact | 14 |
| Variantes françaises normalisées | 121 |
| Contrat transversal de non-régression | Réussi |
| TypeScript | Réussi |
| Matrice de publication | 9/9 réussie |
| Vérifications tRPC publiques représentatives | 3/3 réussies |

Les normalisations portent uniquement sur les libellés génériques qui dégradaient l’interface francophone : `system prompt`, `workflow`, `Watch Out`, `What good looks like`, `few-shot examples`, `few-shot pairs`, `output constraint` et `structured outputs`. Les données publiques de trois parcours représentatifs — Developer 3, Architect Foundations 2 et Architect Professional 1 — sont servies par le canal tRPC non mis en cache et ne contiennent plus ces reliquats dans leurs variantes françaises.

Le retrait des tutoriels vidéo non qualifiés a été contrôlé publiquement sur Architect Foundations 2 et Architect Professional 3 : chaque écran concerné est désormais intitulé **Reference resources / Ressources de référence** et contient **0 bloc vidéo**. Cette politique est couverte par un contrat transversal ; les cours déjà clôturés, dont les médias ont leur propre preuve de provenance, en sont explicitement exclus.

> Les exercices racine `free_text`, les métadonnées de durée absentes et les médias non qualifiés demeurent volontairement ouverts pour un traitement cours par cours : une transformation générique de ces données modifierait les exigences pédagogiques sans preuve source suffisante.

Les rapports machine lisibles se trouvent dans `docs/anthropic-8020-static-audit.json` et `docs/anthropic-8020-normalization-report.json`.
