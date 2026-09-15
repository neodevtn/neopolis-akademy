# Claude Certified Associate Foundations — Cours 2 : matrice de parité

> **Cours ciblé :** `claude_certified_associate_foundations__02` — **Prompting & Task Execution**. La référence de cadrage exige neuf chapitres, une durée officielle de 53 minutes, la conservation des exemples de prompting et d’itération, ainsi qu’un checkpoint appliqué avant la suite du parcours.

## Matrice écran → bloc Neopolis

| # | Écran / section de référence | Bloc Neopolis rendu | Statut | Preuve de contrôle |
|---:|---|---|---|---|
| 1 | Module Introduction | Introduction standard et métadonnées de durée | Adapté | 53 min officielles et estimation Neopolis distincte dans le lecteur et la carte |
| 2 | Anatomy of a Prompt | Contenu structuré et cartes de révision | Présent | Libellés de retournement FR/AR et activation clavier contrôlés |
| 3 | Task Decomposition | Contenu structuré et exemple de prompt | Présent | Hiérarchie et navigation conservées |
| 4 | Iterating to Improve | Comparatif de prompts et boucle d’itération | Adapté | Prompt faible français corrigé et rechargé hors cache mémoire |
| 5 | Strategy by Task Type | Sections et exemples contextualisés | Présent | Neuf chapitres préservés par le contrat de cours |
| 6 | Repair the Prompt | Checkpoint standard `single_choice` | Corrigé | Exercice restauré, distracteurs et correction explicative visibles |
| 7 | Module 2 | Quiz de module standard | Présent | Ordre des activités et progression préservés |
| 8 | Key Takeaways | Synthèse structurée | Présent | Étape finale conservée sans fusion de contenu |
| 9 | Module Complete | Écran de complétion standard | Présent | Navigation finale et structure à neuf écrans couvertes par le contrat |

## Corrections apportées

La durée officielle **53 min** est désormais stockée dans le catalogue et exposée dans les composants standards de carte et de lecteur, à côté d’une estimation Neopolis explicitement identifiée. Le titre anglais reste l’identifiant canonique tandis que le libellé français est localisé. L’index de recherche a été régénéré à partir du catalogue afin que ce titre public soit retrouvé par la recherche Neopolis.

Le comparatif de prompts français ne laisse plus de prompt faible anglais visible. Le bloc standard **FlipCard** localise ses indicateurs en français et en arabe, conserve son rôle de bouton et son activation au clavier. En arabe, lorsqu’un libellé de type d’exercice n’est pas traduit, le moteur conserve le libellé anglais exact — par exemple **Single Choice** — plutôt que d’afficher un type erroné.

Le chapitre **Repair the Prompt** référençait un exercice absent. Il contient maintenant un checkpoint auto-corrigé à quatre options : il teste la correction d’un prompt insuffisant à partir du rôle, contexte, tâche, contraintes et format de sortie. La réponse incorrecte produit une correction expliquant la bonne option et les limites de chaque distracteur. La sélection correcte est exigée par la règle de complétion.

## Validation et limites contrôlées

| Contrôle | Résultat |
|---|---|
| TypeScript et tests ciblés | Validés, dont les contrats de durée, de checkpoint et de recherche |
| Suite complète | **237 fichiers, 772 tests réussis, 2 ignorés** |
| Matrice QA de publication | **9 contrôles sur 9 réussis** |
| Checkpoint dans le navigateur | Visible en prévisualisation ; réponse incorrecte, état soumis et correction détaillée contrôlés |
| Verrouillage d’un chapitre | Test d’intégration sur les données réelles : checkpoint non complété = verrouillé ; identifiant complété = déverrouillé ; revue = seul contournement explicite |
| Verrouillage inter-cours apprenant | Contrôlé avec le compte démo : le cours 2 reste inaccessible tant que le cours 1 Associate n’est pas terminé |
| Mobile | QA automatique mobile réussie ; la capture isolée était recouverte par un communiqué obligatoire de session, sans altérer les contrôles automatisés du lecteur |

Le compte apprenant de démonstration étant volontairement verrouillé sur le cours 1 Associate, aucun faux progrès n’a été injecté pour forcer artificiellement l’accès au cours 2. La validation de la règle interne de checkpoint est donc couverte par le test d’intégration sur les données réelles du chapitre et par le contrôle visuel en mode administrateur de revue ; la règle de séquence entre cours est séparément confirmée côté apprenant.
