# Developer Foundations — état de stabilisation 80/20

La présente fenêtre est limitée à Developer Foundations. Elle privilégie les erreurs qui bloquent le parcours, faussent une métrique visible ou dégradent fortement la lisibilité. Les enrichissements pédagogiques qui exigent une source Skilljar complémentaire — notamment les nouveaux TP locaux et les études de cas de livraison — ne sont pas inventés dans le cadre de cette stabilisation.

| Cours | Corrections publiées à fort impact | Éléments volontairement reportés |
|---|---|---|
| 1 — MSO Foundations | Durée 57 min, contenus restaurés, checkpoints standards, ressources sans vidéo générique | Réconciliation détaillée écran par écran Skilljar |
| 2 — Production-Grade Prompting, Agents & Tool Use | Durée 209 min, 8 checkpoints standards, contenus structurés, reliquats localisés et vidéos non sourcées retirées | TP locaux exécutables sourcés |
| 3 — Claude Code, MCP & Integration | Durée 142 min affichée également dans l’introduction, cartes critiques restaurées, métadonnées de cartes structurées, checkpoint Modes d’autorisation requis, catalogue vidéo cohérent | TP Claude Code/MCP supplémentaires, contenu tronqué du checkpoint 4 et exercices racine ambigus |
| 4 — Production Engineering, Evals & Security | Trois checkpoints réparés et requis, durée 211 min, six cartes critiques restaurées, quatre tableaux concaténés restaurés en Markdown (évaluations, tests/récupération, erreurs, observabilité) et onze localisations françaises ciblées | Activités racine et médias non sourcés à réconcilier ; les termes techniques ambigus sont conservés |
| 5 — Accelerators & IP Contribution | Checkpoint Packaging réparé, checkpoint orphelin retiré, durée 155 min, cartes critiques, quatre tableaux concaténés et localisations françaises ciblées restaurés | Étude de cas complète, activités racine ambiguës et contenus nécessitant une source complémentaire |

Les données publiques confirment maintenant les durées officielles de 142, 211 et 155 minutes pour les cours 3, 4 et 5, ainsi que les références de checkpoint corrigées des cours 4 et 5.

Le cycle de vie localisé du cours 5 est désormais confirmé par le canal tRPC public, avec les sept étapes **Exigences**, **Conception**, **Construction**, **Test**, **Déploiement**, **Exploitation** et **Itération**.

La restauration des tableaux Developer 4 est limitée aux segments dégradés et délimités des quatre chapitres concernés. Elle est rejouable via `scripts/repair-developer-course4-critical.mjs`, dont l’idempotence est contrôlée par empreinte. Le contrat ciblé vérifie les en-têtes Markdown en français et l’absence des anciens en-têtes concaténés ; un rendu du tableau Évaluations et juges a été contrôlé dans le lecteur standard local.

Le 16 septembre 2026, la source officielle Skilljar du parcours Developer a répondu `403` depuis l’environnement de contrôle. En conséquence, les activités racine ambiguës, le checkpoint 4 tronqué du cours 3 et l’étude de cas de livraison du cours 5 demeurent explicitement ouverts : aucun TP, média ou contenu pédagogique nouveau n’est inféré en leur absence.

## Parcours explicitement reportés

Les six cours restants d’Architect Foundations et les cinq cours d’Architect Professional ne font l’objet d’aucune correction cours par cours pendant la présente fenêtre. Les normalisations 80/20 déjà publiées — traduction des libellés génériques et retrait des tutoriels vidéo sans provenance — restent actives. Les audits approfondis, les médias officiels, les exercices et les validations publiques de ces deux parcours sont reportés à une session dédiée.
