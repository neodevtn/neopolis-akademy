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

| Écrans 2 à 5 — Concepts et maintenance | Les cartes Projects, Connectors, instructions et maintenance ont été contrôlées sur le domaine public. Les correctifs de localisation Connectors et de titres ont été confirmés après propagation. Deux anomalies résiduelles sont regroupées dans le même lot avant clôture : le verso « Rédigez les garde-fous une seule fois » doit inclure son exemple complet, et la mise à jour publique finale doit supprimer les recommandations vidéo externes déjà déclarées non gérées par la source. |
| Écran 6 — Quiz | Cinq QCM intégrés, leurs quatre options et le message de verrou (« Retournez toutes les cartes… Soumettez l’activité… ») sont visibles. La revue est en mode administrateur et ne revendique donc pas une preuve de verrou apprenant ; cette règle est couverte par les contrats de progression standards. |
| Écrans 7 et 8 — Synthèse et fin | Synthèse FR, navigation et fin de module sont accessibles. La version publique encore observée affiche des recommandations externes héritées : elles ne font pas partie du lot source et seront retirées par la republication finale où `recommendedVideosManaged: false` est déjà appliqué au JSON. |

### Confirmation finale après checkpoint `1e41867f`

Le canal public tRPC a finalement confirmé le verso complet de la carte de garde-fous, zéro exercice historique racine, `recommendedVideosManaged: false` et zéro recommandation vidéo. Le lecteur public confirme ensuite le verso complet de la carte sur l’écran 4/8 et l’écran 8/8 sans section de recommandations externe. La console n’a rapporté aucune erreur applicative pendant la revue. La clôture demeure **ouverte** : l’écran Projects contient encore des sections mal structurées et l’exemple « Avant / Après » de l’écran Instructions doit être remis en forme avant le rejeu public final. La revue administrateur ne constitue pas une preuve de verrou en compte apprenant.

### Contrôle public après checkpoint `027bfdc2`

Les deux écrans affectés par le dernier lot ont été rejoués après propagation tRPC. L’écran **Configuration des Projects** présente désormais une hiérarchie lisible, une liste explicite Instructions / knowledge base / Skills / Scoped Memory et une explication continue des mécanismes liés ; les intertitres isolés ont disparu. L’écran **Instructions au niveau système** présente une comparaison cohérente « Version vague » / « Version précise », sans libellé « Après » détaché. Les cartes standards, la durée officielle, le quiz à cinq questions, la synthèse et l’écran de fin avaient déjà été contrôlés au cours de la revue des huit écrans ; aucune modification fonctionnelle ne les a affectés dans ce dernier lot.

### Revue complète après checkpoint `02f2a118`

Les écrans 1/8 et 2/8 ont été rejoués après la dernière propagation : durée officielle de 47 minutes, introduction française, huit chapitres, listes et cartes Projects sont cohérents ; Instructions, knowledge base, Skills et Scoped Memory restent des termes explicites dans le lecteur public.

Les écrans 3/8 et 4/8 ont ensuite été confirmés : Connectors est entièrement localisé, les cinq cartes restent lisibles et les titres ne sont plus doublés ; l’exemple Instructions affiche les deux versions cohérentes et la carte de garde-fous contient son exemple complet.

Les écrans 5/8 et 6/8 ont été rejoués : le corps Maintenance préserve désormais Instructions, knowledge base, Skills et Memory ; le quiz affiche cinq scénarios et le verrou standard avant passage. Une exception restante est consignée : le verso de la première carte Maintenance emploie encore les termes génériques « connaissances » et « compétences » ; il doit être aligné sur les noms produits avant la clôture.
