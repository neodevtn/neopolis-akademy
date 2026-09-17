# Revue de contenu — `claude_code_101__01`

**Périmètre.** Lecture intégrale de [`client/public/data/courses/claude_code_101__01.json`](../../../client/public/data/courses/claude_code_101__01.json), puis recherche limitée aux preuves locales demandées (alignments, sources, productions, scripts d’import et manifestes). Aucune source DataCamp web n’a été utilisée. Aucun fichier de cours n’a été modifié.

## Statut de preuve

**Preuves locales partielles.** Aucun fichier `docs/datacamp_*alignment*.json`, `docs/datacamp_*source*.md` ou `docs/datacamp_*production*.md` ne contient de preuve dédiée à `claude_code_101__01`. Les éléments locaux disponibles sont l’inventaire, le rapport d’import, le manifeste visuel et le code d’import : [`docs/datacamp-course-inventory-2026-09-17.json`](../../../docs/datacamp-course-inventory-2026-09-17.json), [`docs/datacamp_import_final_report_2026-08-21.md`](../../../docs/datacamp_import_final_report_2026-08-21.md), [`docs/training-visual-manifest.json`](../../../docs/training-visual-manifest.json), [`scripts/datacamp-importer-core.mjs`](../../../scripts/datacamp-importer-core.mjs) et [`scripts/import-datacamp-course.mjs`](../../../scripts/import-datacamp-course.mjs). Le rapport d’import déclare pour Claude Code 101 4 chapitres, 37 activités, 12 vidéos et 48 téléchargements référencés existants ; le JSON porte les mêmes comptes dans `datacampImport`.

## Constats factuels

| Constat | Qualification | Preuve |
|---|---|---|
| La structure importée est bien séquencée en 4 leçons, avec 37 activités : vidéo, interaction/QCM, puis activité de pratique dans plusieurs séquences. | Alignement local de comptage seulement ; la correspondance pédagogique avec la source ne peut pas être certifiée sans alignment/source dédié. | JSON, champs `lessons`/`chapters` et `datacampImport.expected`; inventaire local précité. |
| Le cours contient 12 vidéos et 12 activités `code_repl`, mais l’inventaire local les comptabilise comme `practicalBlocks: 0`. | Incohérence de présentation/indicateur de catalogue : le JSON contient bien des TP `code_repl`, tandis que le manifeste d’inventaire n’en expose aucun comme bloc pratique. | JSON, notamment `dc_1_act_02_code` à `dc_4_act_15_code`; `docs/datacamp-course-inventory-2026-09-17.json`. |
| Les TP demandent de démarrer `claude`, mais ne donnent pas dans leurs consignes de procédure locale d’installation, de vérification de version, d’authentification, ni de solution de repli si la commande ou le projet n’existe pas. | Insuffisance de guidage directement observable dans le JSON ; ce n’est pas présenté comme un écart à la source faute de preuve source locale. | Instructions des blocs `code_repl` dans le JSON. |
| Le code de départ de chaque TP initialise un REPL avec `connect('bash')` et, pour les activités examinées, un chemin de travail `/home/repl/climate-analysis`; plusieurs solutions copient aussi une histoire de session depuis `~/solutions/.../history.jsonl`. | Dépendance à un environnement de laboratoire implicite, non transposée dans l’environnement propre de l’apprenant. | Champs `starterCode`/`solutionCode` du JSON, par exemple `dc_1_act_02_code`, `dc_2_act_02_code`, `dc_4_act_15_code`. |
| Certaines activités supposent des ressources non préparées dans la consigne : projet `climate-analysis`, fichiers Python/CSV, skill `summarize-station`, base Records via MCP, et outils `black`/Prettier. | Insuffisance de guidage apprenant directement observable ; les dépendances externes ne sont ni inventoriées ni accompagnées d’un setup dans le bloc. | Descriptions, instructions et solutions des TP du JSON (`@analyze.py`, `load_data.py`, `/mcp`, `summarize-station`, `settings.json`, `black`). |
| La localisation est incohérente : plusieurs titres/descriptions de leçons ou activités restent en anglais dans la branche `fr` (par exemple « Your first prompt », « Daily workflows », « Context management », « Code review », « Skills », « MCP », « Hooks »). | Présentation incohérente observable directement ; aucune conclusion sur la fidélité à une source n’est possible. | Valeurs `title.fr`/`description.fr` du JSON. |

## Préparation à la pratique

**Needs-learner-environment-guidance.** Les activités sont utilisables comme scénarios guidés dans un sandbox préconfiguré, mais elles ne sont pas suffisamment autonomes pour l’environnement propre de l’apprenant : le REPL, le répertoire `/home/repl/climate-analysis`, l’historique `~/solutions`, les fichiers de projet, l’installation de Claude Code, les outils de formatage et le serveur MCP sont présupposés. Le JSON ne fournit pas de vérification préalable, de création de projet, de données minimales, de commande d’installation/authentification, de résultat attendu vérifiable ou de dépannage.

## Correctifs génériques réutilisables

1. Ajouter avant tout TP un bloc standard **Préparer l’environnement** : prérequis, installation/version, authentification, création ou téléchargement local du projet, variables et contrôle de santé.
2. Remplacer les chemins sandbox et historiques de solution par un **workspace apprenant explicite** (chemin relatif ou variable), avec fichiers minimaux fournis et commande de positionnement.
3. Ajouter au bloc de pratique une séquence standard **Faire → Vérifier → Corriger** : objectif, commandes exactes, artefact attendu, critère de réussite observable et dépannage des erreurs courantes.
4. Pour MCP, Skills, hooks et outils externes, utiliser une fiche **Dépendances et alternatives** : service requis, configuration, test de connexion et variante sans service externe.
5. Uniformiser les champs `fr` des titres, descriptions, consignes, indices et feedbacks selon le **bloc standard de localisation**, puis contrôler l’absence de chaînes anglaises résiduelles.
6. Exposer les TP dans le catalogue avec un type/compteur de pratique cohérent avec les blocs `code_repl`, sans modifier rétroactivement la source pédagogique.

**Limite.** La structure et les insuffisances d’accompagnement ci-dessus sont observées dans le JSON. La reprise pédagogique exacte, la séquence originale, les modalités DataCamp et l’exhaustivité des dépendances ne peuvent pas être auditées au-delà des compteurs locaux, car aucune preuve locale dédiée alignment/source/production n’a été trouvée.
