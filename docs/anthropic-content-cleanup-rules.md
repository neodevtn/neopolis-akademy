# Règles de nettoyage pédagogique — formations Anthropic

## Objet et périmètre

Ces règles s’appliquent uniquement aux contenus dont le fichier source suit le préfixe `claude_certified_` dans `client/public/data/courses/`. Elles visent à supprimer les traces d’import et les répétitions accidentelles sans modifier la structure pédagogique : cours, leçons, chapitres, positions d’exercices, checkpoints, règles de complétion, ressources, vidéos, compétences et verrouillage séquentiel restent inchangés.

## Hiérarchie des preuves

| Niveau | Source | Décision permise |
| --- | --- | --- |
| 1 | Données locales canoniques, interaction associée et version localisée parallèle | Corriger une duplication exacte, une concaténation, une traduction incomplète ou une structure de texte aplatie. |
| 2 | Objectifs et structure de parcours publiquement confirmés par Skilljar | Vérifier que la correction reste dans le sujet de la leçon et ne retire pas une activité officielle. |
| 3 | Détail SCORM inaccessible ou source ambiguë | Ne pas reconstituer un média, un graphique, une question ou une réponse non présents localement ; conserver l’élément et consigner l’ambiguïté. |

Le journal [`anthropic-source-verification.md`](./anthropic-source-verification.md) documente les parcours Skilljar consultés et la limite CloudFront constatée pour le détail SCORM.

## Classification et traitement

| Catégorie | Signal requis | Traitement autorisé | Interdit |
| --- | --- | --- | --- |
| Doublon accidentel | Même texte dans le même écran, ou texte d’un composant interactif répété juste avant/après ce composant | Conserver la source structurée et retirer uniquement la copie textuelle non interactive | Retirer une carte, un onglet, un exercice ou un checkpoint parce que son sujet réapparaît ailleurs. |
| Placeholder ou scorie technique | Marqueur tel que `Illustrative Scenario`, `Flip each card`, `Checkpoint…`, `${expls}`, CSS/JS ou libellé de bouton injecté | Retirer le marqueur ; utiliser seulement les données présentes pour produire un titre, une liste, un tableau ou un encadré Markdown | Inventer un visuel, une vidéo, une solution d’exercice ou un résultat absent de la source locale. |
| Localisation incomplète | Phrase descriptive dans `fr` ou `en` manifestement restée dans l’autre langue | Traduction fidèle en gardant les noms produits, commandes, extensions et termes techniques nécessaires | Réécrire librement le fond pédagogique ou modifier du code/exemple exécutable sans preuve. |
| Données structurées aplaties | En-tête et lignes de correspondance, comparaison ou étapes déjà disponibles dans le texte | Convertir en titres Markdown, puces, liste numérotée ou tableau pipes compatible avec `PageContent` | Créer un bloc visuel spécifique à un seul cours. |
| Texte tronqué ou attribution incertaine | Phrase incomplète, contenu injecté dans un exercice, ou source locale contradictoire | Chercher une version complète dans le champ parallèle et, à défaut, laisser le bloc pour revue de source | Compléter la phrase par inférence ou supprimer un exercice requis. |

## Stratégie de rendu

Le contenu doit d’abord être exprimé en Markdown valide, rendu par les composants standards existants : titres, gras, listes, tableaux, onglets, cartes, encadrés et étapes. Toute amélioration de `PageContent` ou de la normalisation doit être générique, testée et sans logique propre à un cours donné.

## Contrôles obligatoires

Avant chaque lot publié :

1. L’audit déterministe est exécuté avant et après changement ; les alertes sont revues, elles ne déclenchent jamais une suppression automatique.
2. Le nombre de cours, leçons, chapitres, exercices, blocs interactifs et règles de complétion est comparé à l’état précédent.
3. Les cas modifiés sont vus dans le lecteur en français et en anglais, sur bureau et mobile ; les interactions et passages obligatoires sont testés.
4. Les contrôles TypeScript, unitaires, QA de publication, diff et vérification publique sont réalisés avant livraison.

## Premier lot retenu

Pour `claude_certified_associate_foundations__01.json`, les changements sûrs sont :

* convertir le modèle à quatre couches et la table de points d’entrée en Markdown standard ;
* retirer la copie du scénario injectée dans l’onglet Mémoire, qui duplique un bloc de contenu séparé ;
* localiser strictement le scénario déjà présent, sans prétendre restituer un graphique SCORM inaccessible ;
* remplacer la synthèse répétitive par les conclusions factuelles déjà enseignées dans le module ;
* conserver sans modification les onglets, le tri de seaux, les exercices et leurs positions.

Le contrôle de développement du chapitre « Capability Layer » confirme le rendu des deux tableaux Markdown, l’absence du placeholder « Illustrative Scenario » dans le bloc de scénario et le maintien du tri interactif avec son verrou de poursuite. Après rechargement, les sous-titres utilisent correctement le niveau `###` du moteur de contenu standard ; aucun marqueur Markdown brut n’est affiché. Le lecteur affiche encore le bouton de soumission du tri et son message « Complete the interactive sorting activity », ce qui confirme que le nettoyage textuel n’a pas supprimé le verrou de progression. Une carte de tri a été sélectionnée puis déposée dans sa couche correcte : elle a quitté la réserve, est apparue dans « Standing Instructions » et l’action « Reset » est devenue disponible, confirmant que l’état interactif est toujours actif.

Le contrôle du chapitre « Anatomy of a Prompt » de Associate Foundations 02 confirme que la copie textuelle des cartes a été remplacée par une courte introduction, tandis que les cinq flip-cards et leur verrou « Flip all cards to continue » restent présents. Une carte « Output format » révélée par ce contrôle était tronquée dans la donnée source locale ; elle est complétée à partir de l’énoncé parallèle du même écran, sans ajout de contenu externe.

Le contrôle du lecteur sur « Delegation Mapping » dans Associate Foundations 04 confirme que les deux exemples sont désormais rendus sous forme de tableaux lisibles et que les flip-cards ainsi que le tri obligatoire restent présents. Le passage reste verrouillé tant que les cartes n’ont pas été retournées et que le tri n’est pas terminé ; aucun checkpoint ou exercice n’a été retiré.
