# Baseline — Associate Foundations cours 3

## Périmètre audité

Cours ciblé : `claude_certified_associate_foundations__03`.

Titre canonique actuel : **Evaluating & Validating Claude's Output**.

Le prompt Associate du 14 septembre 2026 fixe pour ce cours une **durée officielle de 74 minutes**, **11 chapitres** et une priorité de correction centrée sur les **exercices de vérification factuelle, hallucinations, citations et revue humaine**.

## Constats structurants relevés dans le JSON

Le cours comporte bien **11 écrans**, mais plusieurs éléments restent inégaux par rapport au standard Anthropic / Neopolis attendu.

La page d’introduction conserve une simple estimation locale **15–25 minutes** dans le contenu pédagogique, sans preuve encore relevée d’une **durée officielle standardisée** pour ce cours dans les métadonnées visibles.

Les chapitres 1 à 6 sont majoritairement en format enseignement avec cartes de retournement. Plusieurs libellés et formulations françaises restent perfectibles, avec des reliquats de traduction littérale, de casse incohérente ou de segments tronqués.

Le chapitre 7 contient déjà deux exercices de tri standard (`bucket_sort`) pertinents pour la compétence visée, ce qui constitue une bonne base à conserver plutôt qu’à remplacer par un bloc spécifique.

Le chapitre 8 est un quiz avec questions à choix, mais le fichier comporte aussi une longue série d’exercices annexes en `free_text`, tous marqués `required: false`, rattachés à plusieurs chapitres stratégiques. Cela suggère un décalage entre la priorité du prompt — renforcer les validations pratiques — et l’état actuel, où une part importante de l’évaluation reste non bloquante et peu intégrée au flux séquentiel.

## Écarts probables à corriger dans le cours 3

Le cours semble encore trop dépendre de **corrections en texte libre** plutôt que d’interactions standard réellement corrigeables et utiles pour contrôler la compréhension sur :

- la distinction entre exactitude, exhaustivité et normes professionnelles ;
- l’identification des hallucinations et des fabrications spécifiques ;
- l’ancrage par citations ;
- la décision d’escalade vers une revue humaine ;
- le choix du format de sortie le plus fiable.

Plusieurs formulations françaises laissent aussi présager un besoin de nettoyage éditorial, par exemple des expressions comme **« sortie »** ou **« assiduité »** là où une terminologie pédagogique plus naturelle devra être vérifiée écran par écran.

## Cadre de correction retenu

Le cours 3 devra être corrigé sans changer l’ordre des 11 écrans ni introduire de composant sur mesure. La priorité est de renforcer la **fiabilité pédagogique** au moyen des blocs standards existants, en privilégiant des activités auto-corrigées, bloquantes lorsque cela est cohérent avec le verrouillage séquentiel, et lisibles sur mobile.

## Points à vérifier ensuite dans le navigateur

Le prochain contrôle devra confirmer :

1. l’affichage de la durée officielle sur la carte et dans le lecteur ;
2. la lisibilité réelle des variantes EN/FR ;
3. la présence ou non d’exercices libres mal positionnés ;
4. la qualité du verrouillage séquentiel autour des activités de validation ;
5. l’absence de régression sur les blocs standards déjà corrigés, notamment `FlipCard` et le moteur d’exercices.

## Contrôle de prévisualisation après première correction

Le cours chargé en prévisualisation affiche bien le titre catalogue localisé, **11 chapitres** et **Durée officielle 74 min** dans l’en-tête. L’écran d’introduction reprend la même durée officielle dans le contenu et ne présente plus l’estimation de 15–25 minutes comme une durée du cours. La session était positionnée sur la variante arabe, pour laquelle le contenu de cours sans traduction AR se replie correctement sur l’anglais ; ce repli de contenu est distinct des libellés d’interface localisés.

La variante française confirme la terminologie d’introduction, dont **Diligence** dans le parcours. Le contrôle a également révélé un dernier décalage entre le titre du lecteur (« sortie ») et celui du catalogue (« résultats ») : la donnée de leçon est maintenant alignée sur **Évaluer et valider les résultats de Claude** et cette égalité est couverte par le contrat de cours.

Le chapitre de triage rend les deux activités standard, les quatre catégories de décision et le verrouillage du bouton Suivant. Le premier triage présente correctement la catégorie **Revue humaine requise** et les cartes de vérification révisées. Après modification de son instruction française, un rechargement a toutefois encore affiché l’ancienne copie incluant `Safe` et `Verify` : le fichier local et le contrat contiennent la copie française corrigée ; la réponse statique effectivement servie doit être contrôlée sans cache avant de conclure la validation visuelle.

Une navigation complète de la prévisualisation, après contrôle direct de la réponse JSON sans cache, confirme finalement le rendu de la copie française corrigée : aucun libellé `Safe` ou `Verify` ne subsiste dans l’instruction, le titre devient **« Trier l’ensemble des sorties — Le triage est un réflexe quotidien »**, les catégories restent localisées et le bouton Suivant demeure bloqué tant que les triages ne sont pas validés.

La première carte du triage — affirmation factuelle sans source — a été sélectionnée puis placée dans **Peu fiable**. L’interface a accepté l’association, retiré la carte de la liste et laissé la soumission indisponible tant que les autres sorties et le second tri ne sont pas complétés.

La sortie contenant des instructions procédurales pour la synthèse d’un explosif a été placée dans **Revue humaine requise**. Les deux associations déjà posées restent visibles dans leurs catégories respectives, tandis que les cartes non classées demeurent disponibles : le triage conserve donc son état et son contrôle séquentiel.

La sortie médicale aux citations plausibles mais non retracées a été classée dans **Vérifier**. Cette association confirme la correction pédagogique du triage : une citation de forme convaincante n’est pas considérée sûre tant que sa provenance n’est pas vérifiée.

La dernière sortie du premier triage — conseil fiscal opaque sans avertissement juridique ni règle de juridiction — est sélectionnée pour une **Revue humaine requise**. Les quatre cas du tri distinguent désormais explicitement erreur factuelle, citation à vérifier et cas à haut risque nécessitant une intervention humaine.

Le premier triage a été soumis avec succès et retourne **4/4 · Parfait !**. Un essai de remplissage accéléré du second triage par script navigateur a confirmé que les événements rapides sont traités de manière asynchrone par React, mais ne constitue pas une preuve pédagogique valide : un classement intermédiaire erroné a été obtenu sans attendre les re-rendus successifs. Le second triage doit donc être réinitialisé et rejoué par sélections et placements unitaires dans l’interface avant toute conclusion sur son déverrouillage.

Le second triage a été réinitialisé puis terminé avec des placements progressifs : événement ou citation inventée en **Hallucination**, perspective manquante et couverture partielle en **Exhaustivité**, statistique périmée en **Précision**, favoritisme non justifié en **Biais / Incohérence**. Il retourne **6/6 · Parfait !**. Les deux activités étant validées, le bouton **Suivant** du lecteur est devenu actif : le verrouillage du chapitre est donc confirmé après les deux contrôles standard, sans modifier directement l’état de progression.

Après cette navigation, le quiz Module 3 s’affiche avec les sept cartes de révision et les cinq premières questions scénarisées. Le contrôle desktop montre les faces de cartes dans leur grille standard, sans troncature visible des textes de face avant ; les formulations françaises corrigées « Je ne sais pas » et « Choisissez le format en fonction de la fiabilité » sont servies. Les cartes et le quiz restent tous deux requis avant le passage suivant. Le contrôle mobile et la preuve de correction détaillée post-triage restent ouverts.

Après évolution du bloc standard de triage, le rechargement de l’écran de tri confirme désormais les deux messages pédagogiques après succès : le premier explique les règles **Peu fiable / Vérifier / Revue humaine requise**, et le second explicite **Hallucination / Exhaustivité / Précision / Biais**. Ils sont affichés sous les scores respectifs 4/4 et 6/6, y compris lorsque le tri est entièrement correct. La capture mobile automatisée a été prise à 390 × 844, mais son contenu de cours était masqué par le communiqué obligatoire de la session ; la QA mobile de publication reste valide, et une preuve spécifique de cartes mobile doit être rejouée après accusé de réception du communiqué.

Une émulation mobile dans la session de prévisualisation authentifiée confirme déjà les métriques de sept cartes : viewport et `scrollWidth` à 390 px, chaque carte à 322 px de large avec une borne droite à 356 px, et les deux faces avec `scrollHeight === clientHeight` et `scrollWidth === clientWidth`. La première paire de captures ne cadrait toutefois que le haut du quiz, pas les cartes elles-mêmes ; elle ne constitue donc pas la preuve visuelle finale et sera recadrée sur une carte avant/arrière.

Le recadrage final à **390 × 844** est archivé dans `docs/anthropic-associate-course3-mobile-card-front.png` et `docs/anthropic-associate-course3-mobile-card-back.png`. Il montre la face avant puis la face arrière retournée de la première carte, avec le texte complet et sans dépassement horizontal. Les mesures associées sont stockées dans `docs/anthropic-associate-course3-mobile-proof.json` : les deux faces de chacune des sept cartes ont une taille de défilement égale à leur taille cliente, et le document ne dépasse pas le viewport.

Le même contrôle à **375 × 667** est archivé dans `docs/anthropic-associate-course3-card-375x667-front.png` et `docs/anthropic-associate-course3-card-375x667-back.png`. Les cartes restent à l’intérieur du viewport (307 px de large, borne droite à 341 px), les deux faces ont `scrollHeight === clientHeight` et `scrollWidth === clientWidth`, et la face arrière retournée est intégralement visible.

La preuve desktop est archivée dans `docs/anthropic-associate-course3-card-1280x720-front.png` et `docs/anthropic-associate-course3-card-1280x720-back.png`. Elle montre la même première carte avant et après retournement dans la grille à trois colonnes. À 1280 px, les sept cartes et leurs faces respectives n’ont aucun dépassement interne ; la face arrière ouverte est lisible sans troncature.
