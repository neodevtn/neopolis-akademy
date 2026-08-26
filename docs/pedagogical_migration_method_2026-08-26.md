# Méthode de migration pédagogique par vagues

## Principe de décision

La migration d’une formation ne part jamais du type de composant seul. Elle part de la source pédagogique : énoncé, ordre de progression, correction, règle de passage, ressources et, pour une réponse libre, rubrique explicite. Les composants standards Neopolis restent la seule cible de rendu. Un contenu source déterministe reste local et ne doit pas appeler un modèle de langage.

| Situation trouvée dans la source | Décision Neopolis | Évaluation IA |
|---|---|---|
| QCM, scénario à choix, tri, association, frise, vidéo ou ressource avec validation déterministe | Conserver ou mapper vers le bloc standard équivalent ; conserver feedback et verrou séquentiel | Interdite : aucun appel LLM nécessaire |
| Réponse libre accompagnée d’un objectif, critères, éléments attendus, score maximal et seuil | Configurer `ai_evaluation` avec rubrique versionnée, contexte de cours et règle de compétence | Autorisée côté serveur après revue humaine |
| Réponse libre sans rubrique ou correction source exploitable | Conserver en brouillon/TP non noté ou revoir le paquet source | Interdite : aucune grille ne sera inventée |
| Écran artificiel du générateur sans correspondance source utile | Retirer ou ramener à une capacité transversale du lecteur | Sans objet |

## Vague 1 — Parcours Anthropic

L’inventaire du 26 août 2026 identifie **25 cours Anthropic**, **328 interactions déterministes**, **zéro candidat de réponse libre** et **zéro rubrique explicitement prête**. Cette vague ne requiert donc aucune insertion d’évaluation IA. Elle consiste à vérifier, cours par cours, la cohérence entre JSON, catalogue et rendu : libellés structurels français, verrous séquentiels justifiés, comptes d’activités, feedbacks QCM/checkpoints et familles de blocs standard.

## Vague 2 — Parcours DataCamp

L’inventaire recense **111 cours attribués à DataCamp**, **712 interactions déterministes** et **696 blocs qui peuvent correspondre à un TP, une réponse de code ou un exercice cloud**, mais **aucune rubrique explicite prête à automatiser**. Ces 696 éléments ne sont pas des autorisations d’évaluation IA : ils forment une file de revue par paquet source. Chaque lot doit être rapproché de son `COURSE_MANIFEST.json`, de son rapport de complétude et de ses consignes avant toute décision.

> L’absence de rubrique explicite conduit à une décision de non-activation. Le système ne déduit ni la bonne réponse, ni le seuil, ni la grille à partir d’un texte de TP.

## Exécution et preuves obligatoires pour chaque lot

Chaque vague suit la même séquence : inventaire statique, rapprochement avec les documents sources, décision de mapping par bloc, régénération contrôlée, relecture apprenant/admin, tests desktop et mobile, puis `pnpm qa:publish`. Un rapport conserve les compteurs, la liste des blocs retirés ou convertis, les réponses libres activées avec leur version de rubrique, et les écarts source restants. Une vague n’est publiée qu’après un checkpoint distinct afin d’éviter qu’une correction d’un cours ne régresse les autres.
