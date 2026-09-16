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

Les contrats ciblés ont validé ces règles, ainsi que le typecheck. L’inventaire actif ne détecte plus ni ID de checkpoint dupliqué, ni métadonnée média obligatoire absente, ni exercice obligatoire non rendu. Les 19 exercices restant hors écran dans AI Fluency sont explicitement optionnels et demeurent documentés comme contenu dont le placement source n’est pas établi.

La sonde applicative sans cache du 16 septembre 2026 confirme également que les cours modifiés sont servis en HTTP `200`, `Content-Type: application/json; charset=utf-8` et `Cache-Control: no-store, max-age=0`. Elle expose 15 leçons et 11 vidéos officielles pour AI Fluency, 9 vidéos officielles pour Claude Code in Action, le titre `Implementing the RAG Flow` pour Amazon Bedrock et aucune occurrence du doublon de réflexion supprimé. Ces vérifications attestent la donnée servie par le lecteur ; elles ne remplacent pas la validation visuelle apprenant, qui est bloquée dans l’environnement de contrôle par une communication globale non acquittée.

## Écarts d’inventaire non transformés en corrections spéculatives

| Écart | Cours | Pourquoi il reste ouvert | Décision sûre |
| --- | --- | --- | --- |
| 19 exercices optionnels non rendus | 01 | Ils n’ont aucun emplacement source suffisamment établi. | Ne pas les rendre obligatoires ni les publier dans un écran au hasard. |
| Écart de comptage de téléchargements | 02, 03, 06 | Les inventaires de travail divergent de 3, 4 et 3 éléments, sans liste source nominative. La revue Claude Sonnet les classe comme signaux historiques, pas comme ressources prouvées manquantes ou excédentaires. | Conserver les liens sains et leurs métadonnées vérifiées ; ne modifier que sur manifeste autorisé. |
| Écart de comptage de vidéos | 04, 05 | Les vidéos connues sont sourcées et transcrites, mais l’inventaire initial ne donne pas les identifiants des vidéos prétendument absentes. | Ne pas insérer de vidéos de remplacement ni retirer les vidéos saines. |
| Introduction et complétions en fin de parcours | 06 | Les sections locales décrivent les thèmes, mais pas les frontières ni la position des exercices et de deux écrans `Module Complete`. | Attendre une matrice source de séquencement avant tout déplacement. |
| Jalons Claude 101 absents des données locales | 05 | La source publique les nomme, mais ne fournit pas les écrans, médias ni activités nécessaires pour les reconstituer fidèlement. | Conserver les 14 jalons déjà couverts ; ne pas créer artificiellement *Meet Claude*, la conclusion ou les certificats. |

> Les écarts d’inventaire sont enregistrés comme besoins de réconciliation, et non comme motifs de réécriture libre du contenu ou de la structure.

## Conclusion d’audit

L’audit couvre les sept cours du parcours. Les corrections étayées ont été appliquées et testées. Les différences de décompte qui ne peuvent pas être rapprochées à un fichier ou un média identifié sont enregistrées avec leur limite de preuve et ne sont pas considérées comme des défauts publiés. Une réconciliation supplémentaire n’est utile que si un inventaire source nominatif autorisé devient disponible.

La reprise visuelle complète reste une étape de validation d’expérience : elle doit être effectuée dans une session apprenant qui ne soit pas masquée par une communication globale imposant un acquittement, afin de vérifier les interactions et verrous dans leur contexte réel.
