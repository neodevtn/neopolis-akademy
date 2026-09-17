# Revue de contenu — `introduction_to_subagents__01`

## Conclusion

Le cours est **structurellement complet dans le JSON** : deux leçons, douze activités et quatre vidéos sont déclarées comme attendues et extraites. La preuve locale indépendante est toutefois **partielle** : aucun fichier `docs/datacamp_*alignment*.json`, `docs/datacamp_*source*.md` ou `docs/datacamp_*production*.md` propre à `introduction_to_subagents` n’a été trouvé. Le manifeste média associé confirme seulement l’existence d’un paquet local de médias ; il ne permet pas de valider la fidélité pédagogique à une source externe.

La priorité est donc la **préparation de l’environnement apprenant**. Les deux TP `code_repl` sont difficilement transférables tels quels dans l’environnement personnel d’un apprenant, car ils présupposent un dépôt, Claude Code et une session déjà disponibles sans fournir une procédure complète d’installation, de vérification et de retour attendu.

## Constats étayés par le JSON et les preuves locales

### 1. Parité déclarée, mais absence de dossier d’alignement dédié

Le bloc `datacampImport` du cours déclare `chapters_expected: 2`, `chapters_extracted: 2`, `activities_expected_from_outline: 12`, `activities_extracted: 12`, ainsi que quatre vidéos et dix-huit téléchargements référencés. Ces valeurs sont cohérentes avec la structure effectivement parcourue : deux leçons de six activités chacune, quatre blocs vidéo et deux blocs de téléchargement PDF [1]. Elles restent des métadonnées d’import dans le cours, et non une preuve locale indépendante de séquence ou de contenu source.

Le seul inventaire associé trouvé est `docs/datacamp_drive_zip_inventory_latest.json`, qui référence un paquet média nommé `datacamp_introduction_to_subagents_complete_media_package_2026-08-20.zip` et sa taille. Il ne contient ni plan pédagogique, ni comparaison activité par activité [2]. Le manifeste visuel associe le catalogue `datacamp_introduction_to_subagents` à des images de formation, sans fournir d’alignement pédagogique [3]. **Aucune reprise inexacte par rapport à la source ne peut donc être rapportée comme un défaut factuel sur la base des seules preuves locales autorisées.**

### 2. Incohérences de présentation directement observables

Le cours annonce `sourceLanguage: fr-FR`, mais les titres, questions et consignes de nombreuses activités restent en anglais dans les champs `fr`. Par exemple, les activités « What are subagents », « Where do refunds live? », « Creating a subagent » et « Spin up a code reviewer » conservent leurs titres et instructions anglaises. Les descriptions de leçons sont également identiques en anglais et en français [1]. Il s’agit d’une incohérence de présentation/localisation observable, sans inférer un écart avec la source DataCamp.

La première activité ajoute un écran de préparation en français, puis les deux TP repassent à des consignes anglaises. Cette alternance augmente la charge de compréhension au moment où l’apprenant doit exécuter des commandes et configurer un outil.

### 3. TP insuffisamment guidés dans l’environnement de l’apprenant

Le premier TP (`dc_ch01_act03`) demande de lancer `claude` puis d’interroger un projet pour trouver le service qui gère les remboursements. Le code de démarrage impose pourtant `cd /home/repl/payments-app`, supprime `.claude` et une historique utilisateur. Le JSON ne fournit pas de procédure pour créer ou cloner un projet équivalent, vérifier que le chemin existe, installer Claude Code, se connecter, ni confirmer la présence d’un exemple de fonction de remboursement. La solution ne contient qu’un scénario attendu et `expectedOutput` est vide [1]. Le guidage ne permet donc pas à un apprenant dans son propre environnement de savoir quel résultat produire ou comment diagnostiquer un chemin différent.

Le second TP du premier chapitre (`dc_ch01_act06`) demande de créer un agent dans `/agents`, de choisir le périmètre Project, Haiku et une couleur. Là encore, le dépôt de départ est implicitement `/home/repl/payments-app`, et aucune procédure autonome ne décrit l’installation de Claude Code, la vérification de la version, l’activation de `/agents`, ou le contrôle que `.claude/agents/` contient bien le fichier généré. La consigne indique que la notation vérifie l’ouverture du panneau et l’enregistrement du fichier, mais aucune sortie apprenant ni preuve de réussite n’est demandée dans le bloc [1].

Le troisième TP (`dc_ch02_act03`) suppose qu’un fichier `.claude/agents/code-reviewer.md` existe déjà après préparation automatique du bac. Il demande de modifier ce fichier, de restreindre les outils à Bash, Glob, Grep et Read, puis de quitter Claude Code. Dans un environnement personnel, le chemin, le contenu initial et la possibilité d’éditer ce fichier ne sont pas établis par l’activité. Le bloc ne définit pas non plus de résultat observable à remettre [1].

Enfin, le TP de tri (`dc_ch02_act06`) est bien présent comme `bucket_sort`, mais le JSON ne donne pas, dans les éléments inspectés, de contexte d’environnement ni de consigne de transfert vers un cas réel. Il évalue une décision conceptuelle, contrairement aux trois TP précédents ; la distinction entre exercice simulé et pratique locale devrait être explicitée à l’écran [1].

### 4. Contradiction pédagogique interne sur les permissions

La transcription de la vidéo « Designing effective subagents » recommande de limiter un agent de lecture à des outils en lecture seule et indique qu’un agent de revue n’a pas besoin d’éditer les fichiers. L’activité précédente « Spin up a code reviewer » demande cependant de laisser **tous les outils** sélectionnés. Cette contradiction est observable dans le JSON lui-même ; elle ne constitue pas, faute de preuve source locale indépendante, une preuve d’inexactitude par rapport à DataCamp [1].

## Niveau de risque et aptitude à la pratique

**Sévérité : moyenne.** La structure, les médias déclarés et le verrouillage séquentiel sont présents, mais trois TP reposent sur un environnement de bac implicite. Un apprenant peut suivre la lecture sans pouvoir reproduire les manipulations dans son propre dépôt, ou ne pas savoir distinguer un échec d’installation d’un échec de compétence.

**Aptitude pratique : nécessite un guidage de l’environnement apprenant.** Le cours n’est pas à classer comme inutilisable : les objectifs sont compréhensibles et les étapes principales existent. La reproductibilité est néanmoins insuffisamment explicitée.

## Correctifs génériques réutilisables par les blocs Neopolis

1. Ajouter avant tout premier TP un bloc standard **Préparer l’environnement** : prérequis, installation, authentification, version minimale, création d’un projet jetable, vérification de commande et procédure de nettoyage.
2. Remplacer les chemins fixes de bac (`/home/repl/payments-app`) par un emplacement abstrait configurable, avec une commande de positionnement et une variante pour dépôt existant ou projet de démonstration local.
3. Ajouter à chaque TP un bloc standard **Résultat attendu et validation** : artefact à produire, emplacement, exemple minimal de sortie, critère de réussite et action de diagnostic en cas d’échec.
4. Ajouter une consigne standard de sécurité : utiliser uniquement des fichiers de test autorisés, ne pas exposer secrets ou données personnelles, et révoquer/supprimer les artefacts temporaires.
5. Uniformiser les champs `fr` : traduire titres, questions, instructions, aides et descriptions, ou afficher explicitement qu’un extrait technique reste en anglais.
6. Pour les agents, utiliser un bloc standard **Permissions minimales** qui relie l’objectif aux outils autorisés et vérifie que les droits d’écriture sont désactivés lorsque l’activité est une revue en lecture seule.
7. Pour les activités simulées comme `bucket_sort`, afficher un badge ou une phrase indiquant qu’aucune installation n’est requise et préciser le transfert attendu vers un cas professionnel.

## Références

[1]: /home/ubuntu/neopolis-akademy/client/public/data/courses/introduction_to_subagents__01.json "JSON du cours audité"
[2]: /home/ubuntu/neopolis-akademy/docs/datacamp_drive_zip_inventory_latest.json "Inventaire local des paquets média DataCamp"
[3]: /home/ubuntu/neopolis-akademy/docs/training-visual-manifest.json "Manifeste local des visuels de formation"
[4]: /home/ubuntu/neopolis-akademy/docs/interaction-source-audit.json "Audit local de présence des blocs interactifs"
[5]: /home/ubuntu/neopolis-akademy/scripts/datacamp-importer-core.mjs "Cœur local de l’import DataCamp"
[6]: /home/ubuntu/neopolis-akademy/scripts/audit-datacamp-course-alignment.mjs "Script local d’audit d’alignement DataCamp"

> Les références [4] à [6] ont été examinées comme preuves de structure et de méthode locales ; aucune ne fournit un fichier source ou un alignement dédié à ce cours permettant d’établir une reprise pédagogique factuellement inexacte.

*Revue autonome, sans modification du fichier de cours.*
