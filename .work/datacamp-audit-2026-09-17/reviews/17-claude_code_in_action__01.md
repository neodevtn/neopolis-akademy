# Revue de contenu — `claude_code_in_action__01`

**Périmètre.** Audit autonome du fichier `client/public/data/courses/claude_code_in_action__01.json`, sans modification de l’application et sans consultation DataCamp web. Les seules preuves de dépôt consultées sont le JSON du cours, le script d’import `scripts/import-datacamp-course.mjs` et son cœur `scripts/datacamp-importer-core.mjs`. Aucun fichier local correspondant exactement aux motifs `docs/datacamp_*alignment*.json`, `docs/datacamp_*source*.md` ou `docs/datacamp_*production*.md` n’a été trouvé pour ce cours ; les affirmations de parité avec une source DataCamp sont donc **non vérifiables localement**.

## Constat factuel et niveau de preuve

Le JSON annonce quatre chapitres et 31 activités extraites, avec neuf vidéos, neuf exercices visuels, neuf exercices console et quatre glisser-déposer (`datacampImport.expected`, lignes 9–20). Les quatre séquences effectivement présentes sont : **Steer the Work**, **Configure Claude**, **Automatiser les tâches répétitives**, puis **Verify and Share**. La composition observée est cohérente en interne avec cette progression : enseignement vidéo, QCM ou tri, puis TP ; toutefois, faute de manifeste ou de notes locales de source spécifiques, cette cohérence ne constitue pas une preuve d’exactitude par rapport au cours importé.

Les actifs déclarés dans le JSON sont locaux (`/api/assets/...`) et le bloc d’import indique 36 téléchargements référencés existants sur 36, neuf MP4 valides, neuf MP3 valides, neuf VTT valides et neuf transcriptions (`datacampImport`, lignes 22–34). Le script d’import confirme que les médias sont résolus via une carte d’actifs locale et que, sans actif local, un média est marqué indisponible (`scripts/datacamp-importer-core.mjs`, fonctions `buildVideoBlock` et `assetFor`). Aucun défaut de téléchargement ne peut donc être affirmé à partir des preuves disponibles.

## Reprises et présentations à surveiller

La présentation est **incohérente pour un parcours francophone**, observation directe du JSON : plusieurs titres restent en anglais (« Steer the Work », « Configure Claude », « Put the file on a diet », « Wire up the action », « Verify and Share »), certaines consignes restent partiellement en anglais (« Enter plan mode with /plan », « Start Claude Code with claude », « Start Claude Code… »), et le vocabulaire alterne anglais non traduit et français (« rewind menu », « goal », « worktrees », « skill », « hook »). Cette observation ne prouve pas une divergence avec la source ; elle documente une incohérence éditoriale dans la version livrée.

La structure ne montre pas de doublon mécanique évident dans le JSON : chaque chapitre suit une séquence distincte et les activités sont identifiées de façon unique. En l’absence de fichier d’alignement/source/production spécifique, aucune reprise pédagogique inexacte ne doit être déclarée comme fait.

## Guidage des TP et préparation de l’environnement

Le principal risque est la **faible préparation explicite de l’environnement apprenant**. Les neuf TP `code_repl` demandent de lancer `claude`, de manipuler un dépôt et des fichiers précis (`task.md`, `queries`, `CLAUDE.md`, `.claude/settings.json`, `hooks/...`, `.github/workflows/claude.yaml`, `queries-verify/`), mais les instructions visibles ne donnent pas de procédure générique d’installation, de connexion/authentification, de vérification de version, de disponibilité de Node/npm, de clé API/secrets, de droits GitHub, ni de méthode de nettoyage/retour arrière. Les exemples sont observables directement dans les instructions des blocs `dc_ch01_act03`, `dc_ch02_act03`, `dc_ch02_act06`, `dc_ch02_act13`, `dc_ch02_act14`, `dc_ch03_act06`, `dc_ch04_act03`, `dc_ch04_act04` et `dc_ch04_act07`.

Le JSON fournit des `starterCode` qui préparent silencieusement un bac à sable (`connect('bash')`, chemins `/home/repl`, suppression de settings/historiques et copie de solutions), tandis que l’apprenant lit des consignes formulées comme s’il travaillait dans son propre environnement. Cette différence est susceptible de masquer les prérequis et les effets réels des commandes. Elle est visible dans les champs `starterCode` et `solutionCode`, notamment pour `dc_ch01_act03` et les TP de configuration/hooks. Les TP ont tous `expectedOutput: ""` ; le JSON n’expose donc pas de résultat attendu lisible, de critères de réussite ou de contrôle de l’état final. C’est une insuffisance de guidage directement observable, pas une affirmation sur la source DataCamp.

Deux consignes de TP sont en outre rédigées en anglais alors que le reste du bloc est en français (`dc_ch04_act03` et `dc_ch04_act04`, champ `instructions.fr`). Le TP GitHub Actions (`dc_ch03_act06`) suppose implicitement un dépôt GitHub et un secret API, sans pas-à-pas de création/configuration du secret. Le TP de packaging (`dc_ch04_act07`) suppose une configuration `.claude` déjà construite dans un projet `queries`, sans procédure de vérification des fichiers réellement présents.

## Verdict

**Statut de preuve : partiel.** Les métriques et la structure sont documentées dans le JSON et le fonctionnement général de l’import est traçable dans les scripts, mais aucune preuve locale autorisée spécifique ne permet de valider l’alignement pédagogique avec la source. **Sévérité : moyenne.** Le cours est exploitable pour un apprenant déjà équipé, mais les TP ne sont pas suffisamment autonomes pour un environnement personnel non préparé. **Prêt pour la pratique : nécessite un guidage de l’environnement apprenant.**

## Correctifs génériques réutilisables par blocs Neopolis

1. Ajouter avant le premier TP un bloc standard **« Préparer votre environnement »** : version minimale, installation, authentification, vérification par commande, permissions et procédure de nettoyage ; ne pas inventer de dépendance propre à un fournisseur absent des preuves.
2. Encadrer chaque `code_repl` par un bloc standard **« Contexte / objectif / état initial / résultat attendu / vérification / sortie de secours »**, avec chemins relatifs au projet et commandes de contrôle explicites.
3. Remplacer les amorces silencieuses de sandbox par un bloc standard **« Ce que le bac à sable prépare »**, distinguant clairement ce qui est préconfiguré de ce que l’apprenant doit reproduire dans son propre environnement.
4. Ajouter un bloc standard **« Critères de réussite »** ou une sortie attendue vérifiable pour chaque TP ; conserver l’évaluation déterministe lorsque cela est possible.
5. Appliquer un contrôle éditorial de localisation aux champs `title`, `instructions`, `hint` et aux libellés d’interaction afin de traduire les textes pédagogiques, tout en conservant les commandes et noms d’API exacts.
6. Pour les TP GitHub/API/hooks, ajouter un encart standard de sécurité : secrets via variables protégées, interdiction de coller une clé dans le dépôt, permissions minimales, et suppression des ressources de test après l’activité.

**Sources locales citées :** `client/public/data/courses/claude_code_in_action__01.json` ; `scripts/import-datacamp-course.mjs` ; `scripts/datacamp-importer-core.mjs`.

**Caveat :** aucune conclusion de non-conformité à la source DataCamp ne peut être tirée sans manifeste, fichier d’alignement, notes de source ou notes de production locales spécifiques à ce cours.
