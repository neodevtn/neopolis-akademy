# Parité — Developer Foundations, cours 2

> **Cours Neopolis :** `claude_certified_developer_foundations__02` — *Production-Grade Prompting, Agents & Tool Use*  
> **Durée officielle :** 209 minutes  
> **Méthode :** lot unique fondé sur l’audit et les contenus générés exclusivement avec Claude Sonnet ; blocs standards, aucune interface spécifique au cours.

| Écran Neopolis | Portée Skilljar | Bloc Neopolis | Statut | Preuve attendue |
|---|---|---|---|---|
| 1 | Introduction | Contenu | adapté | Durée officielle 209 min |
| 2 | Prompting Craft | Contenu, cartes, checkpoint | adapté | Contrainte de sortie |
| 3 | Extended Thinking | Contenu, cartes, tri | adapté | Décision de raisonnement |
| 4 | Tool Use & Schema | Contenu, cartes, tri | adapté | Appariement `tool_use`/`tool_result` |
| 5 | Streaming | Contenu, checkpoint | adapté | Abandon d’un tour incomplet |
| 6 | Context Engineering | Contenu, cartes, tri | adapté | Budget de contexte |
| 7 | Agent Construction | Contenu, cartes, checkpoint | adapté | Boucle agentique |
| 8 | Agent Memory | Contenu, cartes, tri | adapté | Mémoire inter-session |
| 9 | Multimodal & Batch | Contenu, cartes, checkpoint | adapté | Réutilisation d’un actif |
| 10 | Points clés | Synthèse | présent | Terminologie réconciliée |
| 11 | Ressources pratiques | Contenu | exclu justifié | Vidéos sans provenance retirées |
| 12 | Module terminé | Fin de module | présent | Navigation de suite |

## Correctifs regroupés

L’audit Claude Sonnet a confirmé douze écrans mais un décalage de durée, des exercices racine `free_text` contradictoires et mal rattachés, des cartes tronquées, des pseudo-tableaux non lisibles, des reliquats français et huit vidéos sans provenance. Le correctif réexécutable fixe la durée officielle, transforme les huit exercices en checkpoints à choix unique standardisés et obligatoires, restaure les cartes à partir de Claude Sonnet, localise les reliquats génériques sans traduire les noms produits, et remplace l’écran de vidéos non sourcées par une orientation factuelle vers les checkpoints et la documentation officielle.

## Contrôles à archiver avant clôture

La clôture exige : contrat ciblé, validation complète unique, matrice QA, canal tRPC public `no-store`, revue ciblée de l’introduction, d’un checkpoint, du streaming, de l’agent loop, des ressources pratiques et de la fin de module, ainsi qu’une console sans erreur applicative.

## Constat de prévisualisation post-correctif — non clôturant

Le canal tRPC public répond correctement (HTTP 200, JSON et `Cache-Control: no-store, max-age=0`) et expose bien la durée officielle de 209 minutes, les 12 écrans, les 8 checkpoints à choix unique et l’écran **Ressources pratiques**. Toutefois, l’écran **L’art du prompting** reste partiellement lisible de façon dégradée : les pseudo-tableaux demeurent des paragraphes concaténés et quelques termes génériques anglais subsistent (`output constraint`, `system prompt`, `Few-shot examples`). Ces éléments restent ouverts et doivent être normalisés avec les blocs Markdown standards avant le contrôle de clôture.

Après restructuration locale, les deux premiers pseudo-tableaux sont devenus des sections Markdown lisibles. Il reste un tableau compact de techniques dont les en-têtes sont concaténés (`System Prompts / XML Tags / Few-shot Examples / Output Constraints`) ainsi que des occurrences génériques dans les paragraphes suivants. Ils sont regroupés dans le dernier lot de Prompting Craft ; aucune publication supplémentaire ne sera déclenchée avant ce lot complet.

Le dernier contrôle de prévisualisation confirme que les trois sections restructurées sont rendues, mais il révèle un doublon de message utilisateur dans l’exemple de classification et des libellés génériques restants dans ce même exemple. Ces anomalies sont ajoutées au même lot de contenu avant toute republication.

Le diagnostic source confirme que les deux répétitions du message utilisateur appartiennent aux démonstrations distinctes avant/après, puis aux deux scénarios de l’étude « À surveiller » : elles ne constituent pas une duplication de données. Les libellés techniques génériques de la narration restent intégrés au correctif réexécutable et protégé par contrat.

## Disponibilité publique après `298df2a5`

Le premier chargement navigateur a reçu une page 404 Railway transitoire immédiatement après la publication. Le contrôle HTTP suivant, mené sur `https://akademy.neodev.click/` et `https://neopacademy-6qa7lvjq.manus.space/`, a confirmé HTTP 200 pour la racine, le lecteur Developer 2 et le canal tRPC. La réponse tRPC conserve `application/json` et `Cache-Control: no-store, max-age=0`. Le contrôle visuel public a donc été repris après cette récupération ; l’anomalie n’est pas attribuée au contenu Developer 2.
