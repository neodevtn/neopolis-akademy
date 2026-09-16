# Audit en reprise — Claude Code in Action

## Source publique consultée le 16 septembre 2026

Les pages publiques Anthropic décrivent le cours **Claude Code in Action** comme neuf leçons organisées autour de quatre séquences : pilotage du travail, configuration, automatisation puis vérification et partage. La fonction **Rewind** figure explicitement dans l’objectif de pilotage des longues sessions, aux côtés du plan, de la compaction et du choix entre supervision directe et exécution autonome. Les plugins sont, au contraire, cités dans la dernière séquence de portabilité et de partage. [1] [2]

| Constat local | Preuve | Décision |
| --- | --- | --- |
| Le checkpoint requis `ex_claude_certified_architect_foundations__04_005` / Rewind est rendu dans le premier écran du cours. | Inventaire et JSON local. | Conserver le checkpoint et son verrou dans cet écran cohérent. |
| Le même checkpoint est rendu une seconde fois dans l’écran `Exercise: Plugins`. | Inventaire statique et repérage des deux blocs. | Retirer ce doublon : il réemploie une activité hors contexte, crée un identifiant de checkpoint dupliqué et déforme l’exercice Plugins. |
| La page publique confirme neuf leçons et situe Rewind dans le pilotage, tandis que Plugins relève du partage. | Descriptions officielles publiques. | Cette correction rétablit la cohérence de la séquence sans inventer de nouvel exercice ni réécrire le contenu source. |

> Les sources publiques recoupent la position de la compétence, mais ne sont pas utilisées pour reconstituer des écrans privés ou un exercice Plugins absent.

## Contrôle de rendu en prévisualisation

Le 16 septembre 2026, l’écran `Review: Plugins` a été ciblé dans l’aperçu de développement. Le contenu corrigé est présent en arrière-plan de la page ; le contrôle visuel n’est cependant pas qualifiant, car une communication globale obligatoire masque la zone de cours et la session utilisée est administrative, ce qui affiche légitimement le bouton `Modifier cet écran`. Ces deux éléments appartiennent à des flux transversaux, et ne sont pas assimilés à un défaut de l’écran apprenant Architect Foundations. La vérification de rendu apprenant doit être rejouée avec une session sans communication non acquittée.

## Références

[1] [Claude Code in Action — Anthropic Courses](https://anthropic.skilljar.com/claude-code-in-action)

[2] [Claude Code in Action — Claude Academy](https://academy.claude.com/courses/claude-code-in-action)
