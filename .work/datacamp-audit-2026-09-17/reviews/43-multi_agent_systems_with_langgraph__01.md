# Revue de contenu — `multi_agent_systems_with_langgraph__01`

## Conclusion

Le cours est **partiellement aligné**, mais il n’est pas prêt pour une pratique autonome. La structure publiée conserve quatre leçons vidéo et deux téléchargements, alors que le JSON conserve des métadonnées annonçant treize activités, dont neuf activités d’environnement local. Les neuf activités pratiques ne sont toutefois pas présentes dans le contenu livré. L’apprenant reçoit donc une présentation théorique cohérente dans son intention, mais aucun parcours de TP exécutable ni guidage suffisant pour reproduire les exemples dans son propre environnement.

## Constats factuels

### 1. Écart entre le plan importé et le contenu livré

Le bloc `datacampImport.expected` du cours annonce 13 activités extraites et 9 `LocalEnvironmentExercise` (`client/public/data/courses/multi_agent_systems_with_langgraph__01.json`, propriétés `datacampImport.expected`). Dans le même fichier, le contenu effectif ne contient que quatre chapitres, tous de type `VideoExercise`, et le champ final `exerciseCount` vaut 0. Il n’existe donc aucun TP local directement utilisable dans ce JSON.

La preuve d’alignement locale confirme l’écart : 13 activités source, 4 activités Neopolis, 9 activités intentionnellement retirées, 9 activités runtime et 0 exercice cloud (`docs/datacamp_multi_agent_systems_with_langgraph_alignment_2026-08-28.json`, propriétés `totals`). Elle identifie notamment comme retirées les activités Datalab consacrées à l’outil Wikipedia, aux données boursières, à l’outil Python, à l’orchestration LangGraph, au premier agent, aux appels conditionnels, aux agents en une ligne, à un autre agent et aux agents superviseurs (`findings` 1.2–1.6, 2.2–2.3 et 2.5–2.6). Ce n’est pas une reprise pédagogique complète : la séquence vidéo annonce une mise en pratique, mais les étapes de codage correspondantes ont été supprimées.

Le contrôle de production local confirme le résultat publié : 4 activités, 0 exercice interactif, 4 leçons vidéo Projector et 2 téléchargements (`docs/datacamp_multi_agent_systems_with_langgraph_production_2026-08-28.md`).

### 2. Guidage apprenant insuffisant pour l’environnement réel

Le seul bloc de préparation demande de disposer d’un chatbot autorisé et interdit de partager des données sensibles, des mots de passe ou des clés API (`client/public/data/courses/multi_agent_systems_with_langgraph__01.json`, bloc `neopolis_*_environment_preparation`). Il ne précise ni environnement Python ou notebook attendu, ni version, ni installation des dépendances LangGraph/LangChain, ni configuration du modèle, ni procédure de clé API, ni présence du fichier CSV et des données d’exemple, ni test de validation avant de commencer.

Le contenu vidéo indique pourtant que les exercices doivent être réalisés dans un environnement de développement local et que les notebooks contiennent des instructions détaillées (`client/public/data/courses/multi_agent_systems_with_langgraph__01.json`, transcript de `dc_1_act_01_video`). Comme les activités pratiques ont été retirées et qu’aucun bloc d’instructions ou de notebook n’est livré, l’apprenant ne dispose pas des éléments nécessaires pour transposer l’exemple de l’assistant d’entreprise, des outils de données boursières et de l’outil Python. Le niveau de préparation pratique est donc **à renforcer**, sans conclure à une impossibilité d’exécution d’un environnement externe non fourni.

### 3. Présentation linguistique et terminologique incohérente

Plusieurs champs `en` contiennent exactement le texte français du champ `fr`, notamment les descriptions de leçons et de chapitres (`client/public/data/courses/multi_agent_systems_with_langgraph__01.json`, descriptions de `datacamp_ch01`, `datacamp_ch02`, `dc_ch02_act01` et `dc_ch02_act07`). La vidéo du premier chapitre mélange également le français et l’anglais dans le script : « votre environnement de développement local », puis une référence à l’environnement de pratique et aux notebooks (`transcript` et `transcriptSegments` de `dc_1_act_01_video`).

Les descriptions du second chapitre contiennent en outre la graphie « conçoir », visible dans les propriétés `description.fr` et `description.en`. Ces défauts sont observables directement dans le JSON ; ils nuisent à la cohérence éditoriale, mais ne permettent pas à eux seuls d’inférer une erreur conceptuelle sur LangGraph.

### 4. Dépendances et téléchargements

Les médias et les deux supports de diapositives sont référencés par des chemins locaux `/api/assets/...`; la preuve d’alignement indique 0 média externe (`docs/datacamp_multi_agent_systems_with_langgraph_alignment_2026-08-28.json`, `totals.externalMedia`). Le JSON expose bien deux téléchargements PDF, un par chapitre (`dc_ch01_slides` et `dc_ch02_slides`), et le contrôle de production en confirme le nombre. En revanche, ces supports ne remplacent pas les notebooks, données et consignes d’installation nécessaires aux TP annoncés.

## Correctifs génériques réutilisables

1. Remplacer toute activité pratique supprimée par le bloc standard **TP environnement apprenant** : prérequis, version de runtime, installation, variables d’environnement, jeu de données fourni, commande de démarrage et test de bon fonctionnement.
2. Ajouter au début de chaque TP le bloc **objectif–livrable–critères de réussite**, puis un chemin en étapes courtes avec résultat attendu, point de contrôle et aide en cas d’échec.
3. Ajouter le bloc standard **dépendances et sécurité** pour distinguer les ressources locales des services externes, expliquer la gestion des clés sans exposer de secret et proposer un mode sans données sensibles.
4. Ajouter le bloc **reproduction autonome** : code de départ, emplacement des fichiers, commandes d’exécution, exemple d’entrée, sortie attendue et variante de vérification.
5. Appliquer le contrôle éditorial standard **fr/en** : traductions réellement distinctes, terminologie stable pour l’environnement d’exécution et correction orthotypographique avant publication.
6. Mettre à jour les compteurs et métadonnées d’import après retrait d’activités afin que le plan annoncé, `exerciseCount` et les activités effectivement accessibles décrivent le même parcours.

## Références

[1]: /home/ubuntu/neopolis-akademy/client/public/data/courses/multi_agent_systems_with_langgraph__01.json "Cours Neopolis importé — Systèmes multi-agents avec LangGraph"

[2]: /home/ubuntu/neopolis-akademy/docs/datacamp_multi_agent_systems_with_langgraph_alignment_2026-08-28.json "Preuve locale d’alignement DataCamp — Systèmes multi-agents avec LangGraph"

[3]: /home/ubuntu/neopolis-akademy/docs/datacamp_multi_agent_systems_with_langgraph_production_2026-08-28.md "Contrôle local de production — Systèmes multi-agents avec LangGraph"

[4]: /home/ubuntu/neopolis-akademy/scripts/adapt-langgraph-course.mjs "Script local d’adaptation LangGraph et retrait des activités Datalab"

[5]: /home/ubuntu/neopolis-akademy/scripts/datacamp-importer-core.mjs "Cœur local de l’importeur DataCamp"

## Statut

- **Niveau de gravité :** élevé pour la préparation pratique ; moyen pour la cohérence éditoriale.
- **État des preuves :** preuve locale partielle, suffisante pour constater la suppression des TP et les incohérences observables.
- **Préparation à la pratique :** nécessite un guidage de l’environnement apprenant.
- **Périmètre :** aucun fichier de cours n’a été modifié.

[1] [2] [3] [4] [5]
