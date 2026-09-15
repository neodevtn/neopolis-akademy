# Associate Foundations — cours 5 : matrice de parité

## Portée et sources de contrôle

Cette matrice documente le cours `claude_certified_associate_foundations__05`, **Configuration & Knowledge Management**. Le prompt Associate fixe la durée officielle à **47 minutes**, impose huit écrans, la conservation de **Projects**, des instructions, de la **knowledge base**, des **Skills** et de **Memory**, et requiert exclusivement des blocs standards Neopolis. La donnée de cours et le catalogue constituent les éléments contrôlables avant la revue publique.

| Écran Neopolis | Titre | Bloc(s) standard(s) | État de parité | Preuve prévue |
|---|---|---|---|---|
| 1 | Introduction du module | `content` | À contrôler | Durée officielle et absence d’estimation contradictoire |
| 2 | Configuring Projects | `content`, `flip_cards` | À contrôler | Quatre mécanismes, cartes complètes et noms produits préservés |
| 3 | Connectors & Uploaded Knowledge | `content`, `flip_cards` | À contrôler | Limites de capacité, cartes complètes, aucune activité libre externe |
| 4 | System-Level Instructions | `content`, `flip_cards` | À contrôler | Précision des instructions et carte complète |
| 5 | Maintaining Configurations | `content`, `flip_cards` | À contrôler | Cadence, versions de Skills, cycle de Memory et cartes complètes |
| 6 | Module 5 | `content`, `flip_cards`, `single_choice_exercise` | À contrôler | Cinq scénarios, feedback et verrouillage avant sortie |
| 7 | Key Takeaways | `content` | À contrôler | Synthèse cohérente des quatre thèmes |
| 8 | Module Complete | `content` | À contrôler | Confirmation de complétion et navigation |

## Décisions de conservation

Les cinq QCM intégrés au sixième écran sont le flux d’évaluation pédagogique conservé. Les neuf objets `free_text` situés dans la racine historique `exercises` sont exclus : ils sont hors écran, contiennent des consignes et corrections techniques non enseignées dans ce module et contredisent la matrice d’évaluation qui qualifie ce cours d’**interactions déterministes uniquement**. Aucun QCM intégré ni sa correction n’est remplacé par ces artefacts.

Le JSON ne contient aucun bloc média officiel ou téléchargement avec les champs de provenance, transcription, checksum et test requis. La leçon déclare donc explicitement `recommendedVideosManaged: false` et n’expose pas de recommandation externe non sourcée comme contenu du cours. La revue publique devra confirmer l’absence de média à tester plutôt que simuler un test d’image ou d’audio.

## Revue publique post-publication — checkpoint `4f2fd89c`

| Contrôle | Résultat factuel |
|---|---|
| Canal de données public | `https://akademy.neodev.click/api/trpc/course-data/claude_certified_associate_foundations__05` a répondu HTTP 200, `application/json; charset=utf-8` et `Cache-Control: no-store, max-age=0`. Après propagation, la réponse contient huit écrans, zéro exercice racine, `recommendedVideosManaged: false`, cinq QCM intégrés et le texte de durée officielle. |
| Écran 1 — Introduction | Domaine public contrôlé le 15 septembre 2026. Titre FR, durée officielle de 47 minutes, progression 1/8 et structure standard visibles. La formulation de navigation a été rendue neutre (« navigation dans les options proposées ») ; aucun média ou téléchargement n’est annoncé. La session administrative est explicitement en mode révision, donc elle ne sert pas de preuve du verrou apprenant. |
