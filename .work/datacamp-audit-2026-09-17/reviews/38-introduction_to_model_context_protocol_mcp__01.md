# Revue de contenu — Introduction au Model Context Protocol (MCP)

**Conclusion.** L’import est structurellement aligné avec les preuves locales : le cours conserve 3 chapitres et 34 activités, dans l’ordre séquentiel attendu, avec 11 vidéos, 3 tris, 18 TP et 3 supports PDF. Les médias contrôlés sont locaux et valides. Le principal point de vigilance n’est donc pas une reprise factuellement démontrée comme erronée, mais la **préparation d’un environnement apprenant réellement autonome** pour les TP MCP.

## Constats étayés par les fichiers locaux

Le fichier de cours déclare 3 chapitres, 34 activités et la répartition `VideoExercise: 11`, `DragAndDropExercise: 3`, `NormalExercise: 18`, `TabExercise: 2` (`client/public/data/courses/introduction_to_model_context_protocol_mcp__01.json`, objet `datacampImport.expected`). La séquence est bien matérialisée par les identifiants `dc_ch01_act01` à `dc_ch03_act10` et par `requiredBeforeAdvance: true` sur les activités. La vérification locale confirme cette conservation de l’ordre, des 18 TP MCP, des 3 tris et des 3 téléchargements (`docs/datacamp_introduction_mcp_verification_2026-08-24.md`). Aucun fichier local d’alignement, de source ou de production spécifique portant un nom MCP n’a été trouvé en dehors de cette note de vérification ; il n’est donc pas possible d’inférer davantage sur le contenu original à partir d’une preuve locale dédiée.

Les activités pratiques sont importées comme blocs `cloud_exercise`. Chacun contient un `environmentGuide` générique demandant d’installer Python et le SDK, de configurer les identifiants par variables d’environnement et de remplacer les proxys ou jetons de formation. En revanche, le champ `steps` est vide pour les TP examinés. Le cours ne fournit pas, dans ces blocs, une procédure pas à pas indiquant la version Python, la commande d’installation du SDK, les fichiers serveur à obtenir, les commandes exactes de lancement, les variables attendues par TP, ni un test de diagnostic. Les ressources liées aux TP sont des PDF de diapositives de chapitre, et non un paquet exécutable ou un guide d’installation. Ces insuffisances sont observables directement dans le JSON ; elles ne constituent pas la preuve d’une impossibilité d’exécution dans l’infrastructure Neopolis.

Une dépendance externe est explicitement décrite pour `dc_ch03_act09` : l’Open Library MCP interroge l’API Open Library de l’Internet Archive. Le même bloc précise que `OPEN_LIBRARY_SERVER_CMD` et `OPEN_LIBRARY_SERVER_ARGS` dépendent de la configuration Neopolis et que le serveur est lancé depuis des fichiers sources installés. Le JSON ne documente toutefois ni l’emplacement de ces fichiers, ni leur installation, ni la commande de vérification. Pour les TP d’API et d’authentification, les consignes renvoient également à des variables d’environnement, sans tableau local des noms, valeurs attendues, portée ou procédure de validation. Ce constat porte sur le guidage fourni, pas sur la disponibilité effective des services.

La note de vérification locale indique par ailleurs que les 55 références média uniques contrôlées répondent HTTP 200 et qu’aucune URL DataCamp externe ou chemin de stockage direct n’a été relevé (`docs/datacamp_introduction_mcp_verification_2026-08-24.md`). Elle soutient donc l’alignement des téléchargements et médias, mais ne valide pas l’installation d’un environnement MCP côté apprenant.

## Présentation et cohérence

Les titres et descriptions bilingues sont généralement dupliqués en français et en anglais, ce qui est cohérent avec le schéma importé mais peu informatif pour un parcours francophone. Les trois téléchargements de slides portent encore le titre et la description anglaise « Chapter N slides » / « Official course slides provided for this course » dans le JSON. C’est une incohérence de présentation observable, de gravité faible, sans impact démontré sur la progression.

Le contenu pédagogique segmente parfois une phrase entre deux activités vidéo ou diapositives successives, par exemple les séquences « ... y accèdent via » puis « des A-P-I », et « ... se connecter aux outils et aux données » puis « de manière sûre et efficace ». Le transcript local confirme ces coupures. Il s’agit d’une présentation saccadée, non d’une erreur factuelle démontrée.

## Niveau de risque et préparation à la pratique

**Sévérité : moyenne.** La couverture et les médias sont documentés comme conformes, mais les TP qui prétendent reproduire un serveur MCP local ou une intégration API ne donnent pas assez d’éléments pour qu’un apprenant puisse préparer, lancer et diagnostiquer son propre environnement sans assistance. La préparation pratique est donc **à renforcer par un guidage d’environnement apprenant**. Aucun défaut factuel de reprise ne peut être affirmé au-delà des constats de structure et de présentation ci-dessus, faute de preuve locale source plus détaillée.

## Correctifs génériques réutilisables

1. Ajouter à tout bloc pratique un encart standard « Environnement » avec version supportée, commande d’installation, dépendances, fichiers requis, variables d’environnement, exemple de configuration sans secret et commande de vérification.
2. Remplacer `steps: []` par une courte séquence standardisée : préparer, installer, lancer, exécuter, observer le résultat, nettoyer. Prévoir un résultat attendu et une étape de diagnostic pour chaque TP.
3. Pour chaque serveur ou API externe, fournir un bloc « Dépendance externe » indiquant le service, le mode local ou distant, la disponibilité attendue, le comportement hors ligne et une alternative sans secret lorsque c’est possible.
4. Ajouter un encart de sécurité uniforme pour les clés et données sensibles, avec noms de variables cohérents et vérification locale de leur présence sans afficher leur valeur.
5. Localiser les titres et descriptions des téléchargements dans la langue du cours et utiliser un libellé explicite indiquant le rôle du PDF.
6. Vérifier les coupures de transcript lors de l’assemblage des diapositives ; rattacher chaque phrase complète à une unité d’écoute ou de lecture sans modifier le fond pédagogique.

## Sources locales

[1]: `client/public/data/courses/introduction_to_model_context_protocol_mcp__01.json` "Cours importé et contenu des activités"
[2]: `docs/datacamp_introduction_mcp_verification_2026-08-24.md` "Vérification locale de l’import MCP"
[3]: `scripts/datacamp-importer-core.mjs` "Convertisseur local des activités DataCamp"
