# Audit en reprise — Building with the Claude API

## Sources publiques consultées le 16 septembre 2026

Les deux pages publiques Anthropic confirment le titre canonique **Building with the Claude API**, son public cible d’ingénieurs logiciels et les objectifs de maîtrise de l’API, des prompts, de l’évaluation, du tool use, du RAG, de MCP et des architectures agentiques. Elles ne donnent toutefois pas une même granularité de sections : la page Skilljar affiche 87 leçons réparties en 7 sections, tandis que Claude Academy affiche 58 leçons pour une nomenclature de sections différente. Ces compteurs ne doivent donc pas déclencher à eux seuls une suppression ou une réorganisation des 95 écrans Neopolis. [1] [2]

| Point de contrôle | État local observé | Décision d’audit |
| --- | ---: | --- |
| Écrans Neopolis | 95 | Conforme au critère de conservation du prompt prioritaire ; aucun écran ne sera fusionné automatiquement. |
| Exercices | 16, tous rendus par un checkpoint | À contrôler par échantillonnage pédagogique et par verrouillage, sans en créer ni en retirer sur le seul comptage. |
| Blocs de téléchargement | 38 | Six URL sont répétées dans deux écrans ; le rapprochement avec les 35 ressources de référence exige une matrice de provenance avant toute déduplication. |
| Vidéo officielle attendue | Le contenu de cours ne contient pas encore de bloc `video` officiel standard | À réconcilier uniquement si une source et un média autorisés permettent de l’identifier ; ne pas remplacer par une vidéo générique. |

## Vérification des téléchargements locaux

Le 16 septembre 2026, le vérificateur réexécutable a demandé les 38 téléchargements rendus par le cours au serveur local. Les **38 réponses ont retourné HTTP 200 avec un contenu non vide**, soit 32 URL d’assets distinctes et six occurrences de répétition. L’audit ne constate donc aucun lien de téléchargement cassé à ce stade.

La même vérification confirme toutefois que les 38 blocs datent d’un format antérieur sans objet `assetMeta`. Cette absence de métadonnées ne rend pas le lien inutilisable, mais elle empêche de démontrer, bloc par bloc, l’origine, le type MIME déclaré, la taille et le checksum demandés par le protocole. La normalisation devra être faite par une migration de métadonnées réutilisable, après rapprochement de la matrice source, et non en supprimant des ressources valides par simple similarité d’URL.

> Les descriptions publiques servent à cadrer les objectifs et la structure générale. Elles ne sont pas employées pour reconstituer un écran, un média ou un exercice absent.

## Références

[1] [Building with the Claude API — Anthropic Courses](https://anthropic.skilljar.com/claude-with-the-anthropic-api)

[2] [Building with the Claude API — Claude Academy](https://academy.claude.com/courses/building-with-the-claude-api)
