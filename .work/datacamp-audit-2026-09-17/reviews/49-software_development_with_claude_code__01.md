# Revue de contenu — `software_development_with_claude_code__01`

## Conclusion

La structure du cours est **cohérente en interne**, mais sa préparation à la pratique autonome est **insuffisante**. Le défaut principal observable dans le JSON est que les travaux pratiques supposent un environnement Claude Code déjà opérationnel et un projet déjà peuplé, sans fournir dans les consignes le bootstrap correspondant. La comparaison avec une source pédagogique DataCamp n’est toutefois pas démontrable à partir des preuves locales autorisées : aucun fichier `datacamp_*alignment*.json`, `datacamp_*source*.md` ou `datacamp_*production*.md` ne concerne ce cours. Le statut est donc **partial-evidence**, et non une confirmation de fidélité ou d’infidélité à la source.

## Constats étayés par les fichiers locaux

Le fichier de cours déclare quatre leçons, 43 chapitres/activités, 15 vidéos, 20 exercices console, six tris, deux QCM et quatre téléchargements. La séquence est progressive : fondations de Claude Code, agents/skills/hooks, MCP et base Chinook, puis construction d’un CLI. Les blocs et les types d’activités sont effectivement présents dans le JSON [1]. Le manifeste d’inventaire local confirme quatre leçons, 43 chapitres, 47 blocs et l’absence de blocs pratiques classés `practicalBlocks` [2].

La progression annoncée est donc lisible, mais la présentation est partiellement incohérente avec la localisation : le champ d’import indique `sourceLanguage: fr-FR`, tandis que les titres, descriptions et consignes des activités sont majoritairement ou entièrement en anglais, avec des valeurs françaises identiques à l’anglais dans de nombreux blocs [1]. Ce constat est directement observable ; il ne permet pas, à lui seul, d’affirmer une erreur par rapport à DataCamp.

Les dépendances pédagogiques sont explicites dans les textes d’exercice : commande `claude`, mode `/plan`, serveur MCP SQLite, base `chinook.db`, fichiers `PLAN.md`, `reporter.py`, `db_routes.py`, application `app.py`, `pytest` et agent `code-reviewer` [1]. En revanche, le JSON ne donne pas de procédure d’installation, de vérification de version, de création/récupération du projet, de génération de la base, de configuration du serveur MCP, ni de solution de repli si une commande ou un agent est absent. Les consignes disent notamment « Start Claude Code with claude » et « Reference @PLAN.md », mais ne disent pas où trouver ces fichiers ni comment obtenir l’état initial attendu [1]. Il s’agit d’une insuffisance de guidage apprenant observable directement, pas d’une déduction sur la source externe.

Les téléchargements référencés sont des PDF locaux via `/api/assets/chapter_01_slides_*.pdf` à `/api/assets/chapter_04_slides_*.pdf` et sont décrits comme des diapositives officielles ; aucun téléchargement ne constitue, dans les consignes visibles, un kit de démarrage avec code, base ou configuration [1]. Le bloc `datacampImport` affirme que 58 ressources référencées existent et que quatre PDF de diapositives sont valides, mais ce sont des métadonnées d’import embarquées dans le cours, non une preuve locale indépendante de la fidélité pédagogique [1].

## Comparaison aux preuves locales autorisées

La recherche dans `docs/` ne trouve pas de preuve d’alignement, de notes de source ou de production dédiée à `software_development_with_claude_code__01`. Le seul alignement DataCamp proche identifié concerne **GitHub Copilot**, et les notes disponibles concernent GitHub Copilot ou Windsurf, pas Claude Code [3] [4]. Le manifeste d’inventaire associe bien l’identifiant et le chemin du cours, mais ne fournit pas le plan source ni une comparaison activité par activité [2]. Aucun défaut factuel de reprise pédagogique, de séquence, d’interaction ou de modalité TP ne peut donc être déclaré comme une divergence de la source. Les observations ci-dessus restent limitées au JSON et aux manifestes locaux.

## Correctifs génériques réutilisables

1. Ajouter à tout bloc de TP console un **encart d’environnement** standard : prérequis, installation, versions, authentification éventuelle, commande de vérification et procédure de dépannage.
2. Fournir un **kit de démarrage local** standard (archive ou dépôt) avec arborescence, fichiers initiaux, données d’exemple et commande de remise à zéro ; nommer précisément chaque fichier utilisé par `@...`.
3. Ajouter à chaque TP un **objectif vérifiable** : commande à exécuter, résultat attendu, critère de réussite et contrôle de sortie avant de passer à l’activité suivante.
4. Pour toute dépendance MCP, agent ou service externe, fournir une fiche **configuration + test de disponibilité + solution de repli** sans exposer de secret.
5. Appliquer un bloc standard de **localisation** afin que la langue déclarée, les titres, descriptions, consignes et messages de validation soient cohérents.
6. Pour les téléchargements, indiquer leur rôle, le moment d’utilisation et, si nécessaire, inclure un lien ou une procédure de récupération du projet exécutable plutôt que de limiter le téléchargement aux diapositives.

## Références locales

[1]: ../../client/public/data/courses/software_development_with_claude_code__01.json "JSON du cours audité"
[2]: ../../docs/datacamp-course-inventory-2026-09-17.json "Inventaire local des cours DataCamp"
[3]: ../../docs/datacamp_software_development_with_github_copilot_alignment_2026-08-28.json "Alignement local du cours GitHub Copilot, cours voisin"
[4]: ../../docs/datacamp_software_development_github_copilot_verification_2026-08-24.md "Vérification locale du cours GitHub Copilot, cours voisin"

**Niveau de gravité : moyen.** Le cours reste lisible et séquencé, mais plusieurs TP centraux sont difficilement exécutables par un apprenant dans son propre environnement sans préparation supplémentaire.
