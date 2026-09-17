# Revue de contenu — `graph_rag_with_langchain_and_neo4j__01`

**Périmètre.** Lecture du JSON du cours et comparaison exclusivement avec les preuves locales autorisées : fichier de cours, notes d’import, deux rapports d’alignement, contrôle de production et scripts d’import/adaptation/enregistrement. Aucun recours à DataCamp web ou au navigateur.

## Synthèse

Le cours est **partiellement étayé** par les preuves locales et présente une **séquence globalement cohérente**, mais il n’est pas suffisamment prêt pour une pratique autonome dans l’environnement personnel de l’apprenant. La structure actuelle contient 3 leçons et 36 activités conservées, avec une progression lisible : création de graphe/Cypher, graphes lexicaux et récupération hybride, puis résolution d’entités, évaluation RAGAS et mémoire graphe. Le contrôle de production confirme 36 activités, 22 exercices interactifs, 11 leçons vidéo et 3 téléchargements [1].

## Constats factuels soutenus localement

### 1. Écart de comptage et retrait d’activité : gravité moyenne

Le JSON conserve effectivement **36 chapitres/activités** (`dc_ch01_act01` à `dc_ch03_act11`, avec absence de `dc_ch02_act02`), alors que son bloc `datacampImport.expected` indique encore `activities_extracted: 37` et `chapters_extracted: 3` [2]. Le rapport d’alignement du 29 août documente explicitement 37 activités source, 36 dans Neopolis et le retrait canonique de `dc_ch02_act02`, l’exercice visuel « Éléments d’un graphe lexical », car son image source n’était pas livrée localement [3]. Les notes d’import donnent la cause précise : référence à `identifying-elements.png` absente du ZIP, de `downloads/` et de `download_assets_manifest.json` [4].

Ce retrait est donc justifié par une preuve locale et préférable à un exercice non reproductible. En revanche, la métadonnée embarquée dans le JSON n’est pas resynchronisée avec l’état final : cela crée une présentation incohérente entre le contenu livré et ses compteurs d’import. Le script d’adaptation confirme que la suppression est codée sur l’identifiant `dc_ch02_act02` [5].

### 2. Parité de séquence et types d’interaction : plutôt alignées, avec une limite de vérifiabilité

Le rapport d’alignement du 29 août associe les activités restantes aux titres et types attendus : vidéos en blocs `video`, exercices guidés en `cloud_exercise`, exercices procéduraux en `code_repl`, et contenus explicatifs en `content` [3]. Le JSON suit cette séquence en trois leçons ; il n’y a pas d’URL HTTP externe dans le fichier et les téléchargements référencent des chemins `/api/assets/...` locaux [2]. Les notes d’import signalent aussi l’absence d’URL DataCamp externe et de média invalide [4].

La preuve locale ne permet toutefois pas de valider la fidélité pédagogique du texte, des exemples ou des scripts par rapport à une source distante : les décisions d’alignement restent `preserve_or_verify` et aucun barème explicite n’est présent (`explicitRubric: false`) pour les activités listées [3]. Il faut donc éviter de qualifier les reprises textuelles d’« inexactes » sur cette seule base.

### 3. Guidage insuffisant pour l’environnement personnel : défaut observable directement, gravité moyenne à élevée pour la pratique

Le JSON contient de nombreux TP `cloud_exercise` et `code_repl`, mais ne fournit pas un parcours autonome complet de préparation, d’installation, de connexion et de dépannage. Les snippets de code consomment des objets et variables préexistants (`graph`, `line_retriever`, `text_to_cypher_chain`, `NEO4J_URL`, `NEO4J_USERNAME`, `NEO4J_PASSWORD`, `SESSION_ID`, `cypher_dataset`, `metrics`, etc.) sans bloc standard préalable qui explique comment les créer dans l’environnement de l’apprenant [2]. Par exemple, les activités « Enregistrer la mémoire de conversation dans le graphe » et « Extraire des faits… » commencent par l’utilisation de `NEO4J_URL`/identifiants et d’une chaîne déjà constituée ; « Évaluer la récupération de contexte avec Ragas » suppose `cypher_dataset`, `metrics` et `evaluate` déjà disponibles [2].

Une consigne générique est bien présente dans le JSON : installer Python et le SDK requis, configurer les identifiants en variables d’environnement et remplacer tout proxy ou jeton de formation par sa propre configuration [2]. Elle reste trop générale pour guider l’exécution de ce cours : aucun inventaire des paquets/versions, aucune procédure de création ou de sélection d’une base Neo4j, aucun schéma de variables attendu, aucun jeu de données local de repli, aucune commande de test de connexion, et aucune procédure de diagnostic n’est fournie dans les blocs examinés. Il s’agit d’une **insuffisance de guidage directement observable**, non d’une prétendue défaillance du fournisseur.

Le contrôle de production et les notes locales confirment la disponibilité des supports et médias, mais ne démontrent pas que les TP peuvent être rejoués de bout en bout dans un environnement personnel [1][4]. La readiness pratique est donc : **needs-learner-environment-guidance**.

## Correctifs génériques réutilisables par blocs Neopolis

1. Ajouter avant le premier TP un bloc standard **Préparer l’environnement** : versions Python, installation des dépendances, création du fichier `.env`, noms des variables, emplacement du projet et commande de vérification.
2. Ajouter un bloc standard **Connexion au service externe** : paramètres Neo4j requis, test de connexion non destructif, jeu de valeurs fictives, rappel de ne jamais afficher de secret, et procédure de renouvellement/révocation.
3. Pour chaque `code_repl` ou `cloud_exercise`, fournir un contrat d’entrée explicite : variables/objets déjà disponibles, provenance des données, état attendu de la base, et commandes minimales pour reconstruire cet état localement.
4. Ajouter à chaque TP un format standard **Objectif → Étapes → Vérification → Dépannage → Résultat attendu**, avec au moins une sortie vérifiable et un indice progressif ; conserver la solution masquée uniquement comme dernier recours.
5. Pour les dépendances comme RAGAS, LangChain et les modèles d’embedding, ajouter un bloc standard **Versions et compatibilité**, ainsi qu’un chemin de repli sans clé distante lorsque l’exercice le permet.
6. Maintenir les compteurs dans `datacampImport` et les manifestes synchronisés après tout retrait documenté ; conserver, pour un média non reproductible, un statut explicite « retiré — preuve locale manquante » plutôt qu’un compteur source présenté comme livré.

## Sources locales

[1] [`docs/datacamp_graph_rag_with_langchain_and_neo4j_production_2026-08-29.md`](../../../docs/datacamp_graph_rag_with_langchain_and_neo4j_production_2026-08-29.md), lignes 8–17.

[2] [`client/public/data/courses/graph_rag_with_langchain_and_neo4j__01.json`](../../../client/public/data/courses/graph_rag_with_langchain_and_neo4j__01.json), structure, `datacampImport`, chapitres et blocs d’exercices.

[3] [`docs/datacamp_graph_rag_with_langchain_and_neo4j_alignment_2026-08-29.json`](../../../docs/datacamp_graph_rag_with_langchain_and_neo4j_alignment_2026-08-29.json), lignes 12–25 et entrée `2.2` lignes 332–353, ainsi que les entrées de blocs d’exercices.

[4] [`docs/datacamp_graph_rag_langchain_neo4j_import_notes_2026-08-24.md`](../../../docs/datacamp_graph_rag_langchain_neo4j_import_notes_2026-08-24.md), lignes 3–19.

[5] [`scripts/adapt-graph-rag-course.mjs`](../../../scripts/adapt-graph-rag-course.mjs), lignes 9–14.

**Conclusion.** Aucune reprise pédagogique inexacte ne peut être affirmée factuellement avec les seules preuves locales. Le défaut démontrable est la désynchronisation des compteurs après retrait de l’activité visuelle et, surtout, le manque de blocs de préparation et de contrats d’environnement nécessaires à la rejouabilité autonome des TP.
