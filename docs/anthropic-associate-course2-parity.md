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

Le test d’intégration associe explicitement les blocs réels de `Repair the Prompt` au helper de gate et au bouton `Next` du lecteur : hors revue, l’absence de l’identifiant de checkpoint laisse `isGated` vrai et le bouton est désactivé ; l’identifiant n’est ajouté qu’après une sélection correcte exacte. Le mode Review, réservé au contrôle administrateur, est le seul contournement explicite.

## Préparation du contrôle apprenant hors révision

Sur le domaine public, le compte apprenant de démonstration était réellement au chapitre 4/10 du cours Associate 1. Son activité de tri a été complétée par les cinq associations attendues, avec le résultat **5/5 · Perfect!** ; les trois questions du quiz de chapitre ont ensuite été réussies, donnant le résultat **Chapter validated — 3/3 correct**. Le chapitre suivant « Choosing Models » a également été validé question par question, sans contournement administrateur. Cette progression réelle ouvre la voie au contrôle du checkpoint Associate 2 hors mode Review, sans injection directe de progression ni modification de base de données.

## Contrôle public après publication

Le checkpoint `cd8c4014` a été chargé sur `https://akademy.neodev.click` après l’invite de rafraîchissement de version. Le lecteur public affiche le titre canonique **Prompting & Task Execution**, **Official duration 53 min** et **Neopolis estimate 15–25 min**. Le chapitre public **Repair the Prompt** affiche le checkpoint restauré, son choix unique et son texte de correction. L’index de recherche public contient également l’entrée mise à jour du cours ; la console du navigateur ne rapporte aucune erreur pendant ces contrôles. L’interface publique en anglais rend les libellés **Card** et **Flip** ; les variantes française et arabe avaient été contrôlées en prévisualisation sur le même composant standard.

## Contrôle apprenant hors révision

Le prérequis Associate 1 a été effectivement terminé avec le compte apprenant de démonstration sur le domaine public : activités de tri, quiz, écran final et confirmation de compétence validée. Le cours Associate 2 est alors devenu accessible hors revue. Sur son checkpoint, une réponse volontairement incorrecte a produit l’état soumis, un repère d’erreur et un bouton **Next** désactivé. Après redémarrage du checkpoint, la réponse complète correcte a été acceptée, affichée en vert et le bouton de navigation est devenu actif. Son activation a fait passer l’URL publique à `chapter=6` (**Module 2**). Aucun rôle administrateur, forçage d’URL ou écriture directe de progression n’a été utilisé pour cette preuve.

### Revue navigateur écran par écran — public, anglais

| Écran | Résultat observé |
|---:|---|
| 1/9 — Module Introduction | Titre de module, objectifs, séquence de contenus/activités, durée officielle et estimation distincte rendus ; navigation vers l’écran suivant disponible en revue. |
| 2/9 — Anatomy of a Prompt | Les cinq composants (Role, Context, Task, Constraints, Output format), les cinq cartes interactives et l’exemple Weak/Strong Prompt sont rendus sans texte tronqué. |
| 3/9 — Task Decomposition | Le flux séquentiel Derive criteria → Score vendors → Raise trade-offs → Recommend, les cartes et le scénario de trois livrables sont rendus dans l’ordre. |
| 4/9 — Iterating to Improve | La boucle de diagnostic et les prompts Round 1 / Round 2 / Round 3 sont rendus ; le contenu explicite la correction ciblée et le critère d’arrêt. |
| 5/9 — Strategy by Task Type | Les quatre stratégies (analysis, research, drafting, brainstorming), le tableau de référence et l’activité de classement par glisser/sélectionner sont rendus. |
| 6/9 — Repair the Prompt | Le checkpoint à choix unique affiche quatre réponses mélangées, la consigne de réponse correcte et les tags de compétences ; la correction détaillée avait déjà été contrôlée après une mauvaise réponse. |
| 7/9 — Module 2 Quiz | Cinq questions scénarisées, les cartes de rappel et la consigne « Turn over every study card / Submit the required validation activity » sont rendues. |
| 8/9 — Key Takeaways | La synthèse reprend Anatomy, Decomposition, Iteration et Strategy, avec les étapes suivantes et la navigation vers la complétion. |
| 9/9 — Module Complete | L’écran de complétion affiche le message de fin, les recommandations vidéo et le bouton standard de fin de leçon. |
