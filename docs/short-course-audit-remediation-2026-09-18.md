# Rapport de remédiation — Parcours courts et intermédiaires

**Date :** 18 septembre 2026  
**Périmètre :** paquet d’audit « débutant/intermédiaire » et uniquement les parcours explicitement qualifiés durant ce lot.  
**Principe appliqué :** un bloc n’a été retiré que lorsqu’une source obligatoire était absente ou qu’une URL indispensable renvoyait réellement une erreur confirmée. Les P0 et P1 contredits par le contenu publié actuel sont consignés comme **faux positifs vérifiés**. Aucun texte pédagogique, réponse ou correction n’a été inventé.

## Résultat global

Le lot couvre **16 parcours**. Les contenus ont été normalisés de manière déterministe par `scripts/remediate_short_blocking_courses.mjs`, les compteurs du catalogue et des programmes ont été recalculés à partir des blocs effectivement publiés, et l’index de recherche a été régénéré. Le contrôle final trouve **180 parcours**, **3 553 écrans pédagogiques indexables** et **3 849 entrées de recherche**, sans entrée manquante, doublon ni lien de cours invalide.

| Statut | Parcours | Décision vérifiée |
|---|---|---|
| P0 supprimé | IA pour le conseil | Le tri sans catégories source a été retiré. |
| P0 supprimé | Microsoft Copilot dans PowerPoint | Les pratiques dépendant des fichiers SolarHome non fournis ont été retirées. |
| P0/P1 corrigés | Coder avec l’aide de l’IA | Le tri incomplet a été retiré; le compteur est désormais 17 interactions publiées. |
| P0/P1 corrigés | Développement avec Claude Code | La vidéo sans source ni transcription a été retirée; le compteur reste 28 car les 20 exercices console sont bien rendus. |
| P0/P1 corrigés | Développement avec Windsurf | Le tri incomplet et les liens malformés ont été retirés. |
| P0/P1 corrigés | Claude 101 | Le tri incomplet a été retiré; les deux médias anciennement inconclusifs répondent maintenant localement en HTTP 200 avec `video/mp4`. |
| P0/P1 corrigés | Workflows marketing | Les 15 TP dont les starters/corrections autorisés étaient absents ont été retirés; 8 écrans vidéo et 3 téléchargements gérés restent disponibles. |
| P0 supprimé | IA pour les ressources humaines | Deux tris à catégorie unique sans source de restauration ont été retirés sans supprimer le reste des chapitres. |
| P0 supprimé | Vibe coding avec Replit | Deux tris dont les catégories 4P ne pouvaient pas être sourcées ont été retirés. |
| P0 supprimé | Transformation des processus par l’IA — modules 1 et 4 | Six checkpoints et exercices non traçables ont été retirés. |
| Faux positif P0 vérifié | Transformation des processus par l’IA — modules 2, 3 et 5 | Les prompts, instructions et corrections sont déjà présents dans les checkpoints référencés. Aucun retrait n’était justifié. |
| P0 supprimé | Claude Certified Associate Foundations — cours 2 | Le checkpoint promettait un prompt faible, une sortie et un objectif absents : il a été retiré avec son exercice dépendant. |
| Faux positif P0 vérifié | Claude Certified Associate Foundations — cours 8 | Le checkpoint possède une question bilingue, quatre choix, une réponse correcte, un feedback et un verrouillage de réussite. |
| P0/P1 corrigés | Introduction à MCP | Quatre TP dépendant de l’endpoint Frankfurter confirmé 404 ont été retirés; les 14 TP restants affichent maintenant des critères tirés mot pour mot de leur objectif ou consigne publiés. |
| P0/P1 corrigés | Développer des systèmes IA avec l’API OpenAI | Le tri de fonction sans catégories source a été retiré; les erreurs média 502 restent des contrôles inconclusifs et n’ont donc pas provoqué de suppression. |
| P1 corrigé | Travailler avec l’API OpenAI Responses | Les 17 TP conservés affichent désormais des critères visibles, dérivés sans modification de leur objectif, consigne ou indice publiés. |
| Faux positifs vérifiés | IA pour la finance, GitHub Copilot, Claude Code 101 | Les tris concernés sont des exercices d’ordonnancement complets; les compteurs et les références média présents dans le paquet concordent avec les blocs publiés. |

## Traitement des P1

Les P1 ont été traités selon leur nature. Les écarts de compteurs ont été recalculés à partir de tous les types interactifs réellement pris en charge par le lecteur, notamment les exercices console et les évaluations IA. Les erreurs HTTP 502, 403 et 405 ont été classées comme **inconclusives**, conformément au cahier des charges : elles ne constituent pas une preuve d’indisponibilité et n’autorisent ni suppression ni remplacement arbitraire. Les seuls liens externes confirmés indisponibles étaient les quatre TP MCP utilisant l’endpoint Frankfurter en HTTP 404; ils ont été retirés.

Les P1 relatifs à l’absence de critères de TP ont été résolus par l’ajout du champ standard `learnerCriteria`. Sa valeur reprend exclusivement l’objectif, la consigne ou l’indice déjà présent sur le bloc. Le composant réutilisable `CloudExerciseBlock` l’affiche dans « Ce que votre travail doit montrer ». Cette mesure améliore la lisibilité sans exposer une correction ni inventer une règle d’évaluation.

## Validation technique

La suite complète et la QA de publication ont réussi. Le build de production a également réussi. Les contrats ciblés couvrent les retraits, l’absence de bloc P0 restant, les compteurs du cours et du programme, la confidentialité de l’exercice retiré, et la présence de critères visibles sur les TP MCP et Responses API.

Le vérificateur `scripts/verify_short_blocking_courses.mjs` a interrogé les payloads apprenant et les assets déclarés. Les échantillons validés couvrent notamment 34 médias MCP, 36 médias du cours OpenAI API, 36 médias IA RH et 60 médias Vibe Coding; chaque requête locale a retourné HTTP 200. La prévisualisation navigateur sans session a confirmé le comportement attendu de protection de la route de formation, qui exige l’authentification; elle ne permet pas de simuler un parcours apprenant complet sans session de test.

## Limite de publication

Ce rapport atteste la version locale checkpointée. La publication du domaine public demeure séparée : les déploiements précédents sont bloqués en amont par le paramètre infrastructurel Railway `healthcheckPath` invalide. Le domaine public ne doit donc pas être décrit comme mis à jour tant qu’une nouvelle révision n’y répond pas effectivement.

## Références

[1]: https://drive.google.com/drive/folders/1-y-8c14g6XxtO-Gu3cxeXuLCf7QS01N8 "Paquet d’audit débutant et intermédiaire fourni"
[2]: https://akademy.neodev.click "Domaine canonique de Neopolis Akademy"
