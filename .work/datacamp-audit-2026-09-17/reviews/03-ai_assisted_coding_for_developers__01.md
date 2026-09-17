# Revue de contenu — `ai_assisted_coding_for_developers__01`

## Conclusion

**Statut de preuve : partiel.** Le dépôt contient une vérification dédiée et le script de conversion, mais pas les manifestes canoniques DataCamp mentionnés dans cette vérification. Les éléments locaux permettent de confirmer la structure importée, la séquence déclarée et la localisation des médias. Ils ne permettent pas d’attester l’exactitude pédagogique par rapport à la source DataCamp ni de valider la totalité des contrôles annoncés.

**Préparation à la pratique : nécessite un guidage de l’environnement apprenant.** Le cours est utilisable comme parcours interactif de prompts, QCM, tris et évaluations IA. En revanche, les activités observées directement dans le JSON ne constituent pas un TP exécutable dans l’environnement propre de l’apprenant.

## Constats soutenus par les fichiers locaux

### Structure et séquence

Le fichier de cours contient **3 chapitres, 28 activités et une progression séquentielle**. La vérification locale indique les mêmes compteurs pour la conversion : « 3 chapitres, 28 activités », avec « 10 vidéos Projector » et « 18 exercices interactifs » (`docs/datacamp_ai_assisted_coding_for_developers_verification_2026-08-24.md`, lignes 7–14). L’audit du JSON confirme une alternance de blocs `video`, `single_choice_exercise`, `ai_evaluation`, `bucket_sort`, `content` et `download`.

La séquence est donc cohérente au niveau de l’enchaînement importé : enseignement vidéo, vérification par question ou tri, puis évaluations de prompts. La preuve locale ne suffit toutefois pas à conclure que cette séquence est fidèle à la séquence pédagogique canonique, car le manifeste et le contenu source cités par la vérification (`COURSE_MANIFEST.json`, `LLM_OPTIMIZED_COURSE_CONTENT.md`, `COMPLETENESS_REPORT.md`) ne sont pas présents parmi les preuves locales examinées.

### Médias, dépendances externes et téléchargements

La vérification locale affirme que les **118 références média consommées** répondent `HTTP 200` via `/api/assets/`, sans URL DataCamp externe ni chemin `/manus-storage/` dans les données publiées (même document, lignes 22–28). Le JSON examiné utilise effectivement des chemins locaux `/api/assets/` pour les fichiers audio et les PDF de diapositives.

Le JSON ne contient pas, dans les blocs d’activité examinés, de champ d’installation, de dépendance Python/SDK, de commande de lancement, d’URL externe d’API ou de téléchargement de données. Les téléchargements présents sont des PDF locaux de diapositives (`type: "download"`), et non des jeux de données ou environnements d’exécution. Le script d’import prévoit pourtant un bloc standard `cloud_exercise` avec `environmentGuide`, l’installation de Python et du SDK requis, la configuration des identifiants par variables d’environnement et l’interdiction de coller une clé API (`scripts/datacamp-importer-core.mjs`, autour des lignes 260–273). Ce guide n’est pas présent dans le JSON de ce cours : il s’agit donc d’un écart observable entre la capacité du convertisseur et le contenu publié, pas d’une preuve de défaut de la source DataCamp.

### Guidage des TP et activités pratiques

Les cinq blocs `ai_evaluation` observés demandent à l’apprenant de rédiger un prompt. Le contexte indique parfois qu’un fichier comme `process_data.py`, `interest.py` ou un fichier de validation est « lisible et utilisable par le LLM », mais le JSON ne fournit pas de chemin local, de contenu de fichier, de dépôt de départ, de procédure pour créer le fichier, de commande d’installation, de clé de configuration, de critères de test exécutables ni de résultat attendu vérifiable dans l’environnement de l’apprenant. Les champs disponibles sont essentiellement `prompt`, `rubric`, `maxScore`, `sampleAnswer`, `minWords` et `hint`; certains `hint` sont vides.

Les `bucket_sort` et QCM sont des interactions fermées. Leurs instructions et indices guident le classement ou le choix, mais ne demandent pas de produire, exécuter, tester ou inspecter du code dans un environnement réel. Les vidéos et les téléchargements de diapositives apportent du contenu, mais pas une procédure de mise en pratique autonome. Cette insuffisance de guidage est une observation directe du JSON et ne dépend pas d’une comparaison web.

## Incohérences ou limites de preuve

La note de vérification indique d’abord que les contrôles mobile, médias HTTP, activités représentatives, recherche et production ont été complétés, puis précise à sa ligne 30 que ces contrôles « restent à exécuter avant publication » (`docs/datacamp_ai_assisted_coding_for_developers_verification_2026-08-24.md`, lignes 26–30). Cette contradiction interne réduit la portée de l’attestation de production. Elle ne permet pas d’affirmer que le cours est défaillant en production, mais impose de classer la preuve comme partielle.

Aucune reprise pédagogique inexacte ne peut être déclarée factuellement sur la seule base des fichiers locaux examinés. La vérification cite des sources canoniques absentes du périmètre disponible ; sans ces fichiers, une comparaison détaillée du texte source, des objectifs, des interactions et des dépendances serait spéculative.

## Correctifs génériques réutilisables par blocs Neopolis

1. Pour tout bloc de pratique de type `cloud_exercise` ou évaluation de prompt, ajouter un **encadré “Préparer son environnement”** avec prérequis, version recommandée, installation, emplacement de travail, commande de vérification et procédure de nettoyage.
2. Ajouter un **jeu de départ local minimal** ou un lien de téléchargement interne versionné, avec arborescence attendue et contenu des fichiers mentionnés dans l’énoncé.
3. Remplacer les références abstraites à « un fichier que le LLM peut lire » par une consigne opérationnelle : créer ou ouvrir le fichier, exécuter une commande de test, observer la sortie, puis soumettre le prompt et le résultat.
4. Pour chaque TP, distinguer explicitement **ce que l’apprenant doit produire**, **comment le tester**, **les critères de réussite** et **un exemple de résultat**. Conserver le `rubric` pour l’évaluation rédactionnelle, mais fournir aussi au moins un contrôle reproductible.
5. Pour les activités utilisant une API ou un SDK, utiliser le bloc standard de guide d’environnement prévu par `scripts/datacamp-importer-core.mjs` : variables d’environnement pour les secrets, avertissement de sécurité, limites de coût et solution de repli sans compte externe.
6. Ajouter une courte étape de transfert : demander à l’apprenant de remplacer le scénario bancaire ou générique par un petit fichier et une fonction de son propre projet, sans exposer de données sensibles.

## Sources locales

[1]: `client/public/data/courses/ai_assisted_coding_for_developers__01.json` "Cours audité"
[2]: `docs/datacamp_ai_assisted_coding_for_developers_verification_2026-08-24.md` "Vérification locale du cours"
[3]: `scripts/datacamp-importer-core.mjs` "Convertisseur local des cours DataCamp"
[4]: `scripts/import-datacamp-course.mjs` "Script local d’import de cours"

Les constats relatifs au contenu publié renvoient à [1]. Les compteurs, médias et limites de vérification renvoient à [2]. Le comportement attendu du bloc standard d’environnement renvoie à [3].

> Aucun fichier de cours n’a été modifié.
> 
> La revue a été réalisée uniquement à partir des fichiers locaux demandés ; aucune consultation DataCamp web ou navigation n’a été utilisée.

[1]: client/public/data/courses/ai_assisted_coding_for_developers__01.json "Cours audité"
[2]: docs/datacamp_ai_assisted_coding_for_developers_verification_2026-08-24.md "Vérification locale du cours"
[3]: scripts/datacamp-importer-core.mjs "Convertisseur local des cours DataCamp"
[4]: scripts/import-datacamp-course.mjs "Script local d’import de cours"
