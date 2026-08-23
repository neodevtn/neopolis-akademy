# Feedback Sentry 929617 — Chams Eddin Bouagga

**Source :** <https://sentry.neopolis-dev.com/organizations/neopolis-development/feedback/?feedbackSlug=neopolis-akademy%3A929617&project=102&referrer=feedback_list_page&statsPeriod=24h>

**Parcours concerné :** `claude_certified_developer_foundations__02`, URL de replay : `https://akademy.neodev.click/training/claude_certified_developer_foundations/claude_certified_developer_foundations__02?lesson=0&chapter=5`.

Le retour confirme l’intérêt du parcours et de la progression ludique, mais signale les problèmes suivants : le changement de langue peut mélanger les langues et modifier le format d’un cours ; certains contenus sont répétés, dont « pruning » entre *Model Selection* et *Keeping Multi-Turn Sessions Within Budget* ; les formats français et anglais sont incohérents ; certains mots sont concaténés ou rendus de façon illisible ; des problèmes de mise en page nuisent à la lecture ; enfin, des consignes font référence à une réponse « à gauche » alors que la question est rendue en bas de l’écran.

La recherche initiale confirme des consignes spatiales dans le JSON du cours, notamment à proximité des lignes 783–784 et 1309–1310. Toute correction doit préserver le contenu officiel source tout en adaptant les consignes au layout réellement rendu par Neopolis.

## Diagnostic et corrections

| Signal apprenant | Diagnostic | Correction appliquée | Validation |
|---|---|---|---|
| Alternance de langue et format instable | Des libellés structurels issus d’exports historiques pouvaient rester en anglais dans un écran français et modifier les heuristiques de mise en forme. | Normalisation du contenu avant détection de structure ; traduction des libellés `Pruning`, `Clearing` et `Subagent Handoffs` pour la vue française. | TypeScript et validation des cours réussis ; rendu complet vérifié. |
| Texte concaténé | L’en-tête historique `StrategyWhat it doesWhen to applyWhat continuity you lose` n’avait aucun séparateur. | Remplacement de l’artefact par un intertitre localisé : « Comparaison des stratégies de gestion du contexte ». | Le rendu complet n’affiche plus de ligne concaténée. |
| Répétitions perçues | Le contenu mélangeait une vue de synthèse et des développements ultérieurs sans repère clair, aggravé par l’artefact de tableau. | La normalisation empêche la détection de tableau erronée ; les développements pédagogiques distincts sont conservés. | Vérification visuelle du chapitre complet. |
| Consignes « à gauche / à droite » | Les consignes source supposaient une disposition horizontale qui peut changer sur mobile. | Consignes reformulées pour demander l’association ou la sélection sans référence spatiale ; options séparées sur le checkpoint de réflexion prolongée. | Test de non-régression du parcours Developer. |

Le feedback reste privé et les corrections ne modifient ni le verrouillage séquentiel, ni les checkpoints supplémentaires, ni les vidéos recommandées intentionnelles.
