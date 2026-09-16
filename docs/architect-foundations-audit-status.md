# Statut de reprise — Architect Foundations

**Périmètre :** sept cours du parcours `Claude Certified Architect Foundations`. Cette synthèse ne modifie pas les banques d’examens blancs Anthropic, publiées séparément.

## Corrections vérifiées dans le jalon courant

| Sujet | Cours | État | Preuve |
| --- | --- | --- | --- |
| Checkpoint Rewind présent hors contexte dans Plugins | 04 — Claude Code in Action | Corrigé | Le checkpoint n’existe plus que dans son écran Rewind source ; le chapitre Plugins devient une révision sans interaction dupliquée. |
| Capitalisation technique de RAG | 06 — Claude with Amazon Bedrock | Corrigé | Leçon et écran utilisent `Implementing the RAG Flow`. |
| Mélanges manifestes `AI` / `IA` dans les champs français | 01, 02, 03, 05, 06 | Corrigé | Les remplacements ont été qualifiés par Claude Sonnet, sans toucher aux noms de produits Anthropic. |
| Doublon de réflexion d’introduction non référencé | 01 — AI Fluency | Corrigé | L’exercice redondant est retiré ; le checkpoint actif conserve la réflexion liée `ex_ai_fluency_intro_reflection`. |
| Provenance des téléchargements historiques | 02, 03, 06, 07 | Corrigé | 129 ressources atteignables en HTTP 200 disposent de leur source, MIME, taille et SHA-256 observés. |
| Provenance des vidéos avec transcript local | 04, 05 | Corrigé | Treize vidéos portent une provenance Anthropic, un identifiant de transcript et une empreinte de référence. |

Les contrats ciblés ont validé ces règles, ainsi que le typecheck. L’inventaire actif ne détecte plus ni ID de checkpoint dupliqué, ni métadonnée média obligatoire absente.

La sonde applicative sans cache du 16 septembre 2026 confirme également que les cours modifiés sont servis en HTTP `200`, `Content-Type: application/json; charset=utf-8` et `Cache-Control: no-store, max-age=0`. Elle expose 15 leçons et 11 vidéos officielles pour AI Fluency, 9 vidéos officielles pour Claude Code in Action, le titre `Implementing the RAG Flow` pour Amazon Bedrock et aucune occurrence du doublon de réflexion supprimé. Ces vérifications attestent la donnée servie par le lecteur ; elles ne remplacent pas la validation visuelle apprenant, qui est bloquée dans l’environnement de contrôle par une communication globale non acquittée.

## Écarts volontairement non corrigés sans source complémentaire

| Écart | Cours | Pourquoi il reste ouvert | Décision sûre |
| --- | --- | --- | --- |
| 19 exercices optionnels non rendus | 01 | Ils n’ont aucun emplacement source suffisamment établi. | Ne pas les rendre obligatoires ni les publier dans un écran au hasard. |
| Écart de comptage de téléchargements | 02, 03, 06 | Les inventaires de travail divergent de 3, 4 et 3 éléments, sans liste source nominative. | Conserver les liens sains et rapprocher un inventaire autorisé avant ajout ou retrait. |
| Écart de comptage de vidéos | 04, 05 | Les vidéos connues sont sourcées et transcrites, mais l’inventaire initial ne donne pas les identifiants des vidéos prétendument absentes. | Ne pas insérer de vidéos de remplacement. |
| Introduction et complétions en fin de parcours | 06 | Les sections locales décrivent les thèmes, mais pas les frontières ni la position des exercices et de deux écrans `Module Complete`. | Attendre une matrice source de séquencement avant tout déplacement. |

> Les écarts d’inventaire sont enregistrés comme besoins de réconciliation, et non comme motifs de réécriture libre du contenu ou de la structure.

## Suites contrôlées

1. Obtenir ou valider une matrice de séquencement autorisée pour le cours Amazon Bedrock avant de déplacer ses écrans existants.
2. Rapprocher les inventaires source des ressources restantes avant d’ajouter ou de retirer des médias.
3. Rejouer visuellement les parcours avec une session apprenant sans communication globale bloquante, afin d’attester les écrans, les interactions et les verrous plutôt que l’interface administrative.
