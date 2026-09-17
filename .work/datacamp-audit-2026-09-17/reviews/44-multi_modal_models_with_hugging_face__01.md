# Revue de contenu — `multi_modal_models_with_hugging_face__01`

## Périmètre et preuves locales

L’audit porte uniquement sur `client/public/data/courses/multi_modal_models_with_hugging_face__01.json`. Les preuves locales consultées sont `docs/datacamp_multi_modal_hugging_face_import_notes_2026-08-24.md`, `scripts/datacamp-importer-core.mjs`, `scripts/import-datacamp-course.mjs`, `scripts/register-multi-modal-models-with-hugging-face.mjs` et `server/multiModalModelsWithHuggingFace.test.ts`. Aucun document local `datacamp_*alignment*.json`, `datacamp_*source*.md` ou `datacamp_*production*.md` propre à ce cours n’a été trouvé ; l’alignement pédagogique avec une source DataCamp ne peut donc pas être attesté au-delà des contrôles d’import et des invariants locaux.

## Constats étayés

| Niveau | Constat | Preuve locale |
|---|---|---|
| Positif | La structure importée est cohérente avec les contrôles locaux : 4 chapitres, 45 activités, 14 vidéos Projector, 3 TP `cloud_exercise`, 27 exercices `code_repl`, 4 téléchargements et des médias locaux. Toutes les activités sont verrouillées par `requiredBeforeAdvance`. | `docs/datacamp_multi_modal_hugging_face_import_notes_2026-08-24.md` §1 et §2 ; `server/multiModalModelsWithHuggingFace.test.ts` |
| Positif | Le cours ne contient pas d’URL DataCamp externe ni de chemin `/manus-storage/`; les téléchargements exposés dans le JSON sont des chemins `/api/assets/`. | `docs/datacamp_multi_modal_hugging_face_import_notes_2026-08-24.md` §2 ; `server/multiModalModelsWithHuggingFace.test.ts` ; JSON, blocs `download` et `resources` |
| Insuffisance de guidage observée | Les 30 exercices interactifs donnent souvent pour prérequis implicite des objets déjà chargés (`api`, `dataset`, `model`, `processor`, `image`, `audio_sample`, `frame_tensors`) ou des fichiers/checkpoints disponibles, sans procédure propre à l’environnement de l’apprenant. Le champ `environmentGuide` des 3 TP reste générique (« installez Python et le SDK requis », configurez des identifiants), sans versions, commandes, dépendances par chapitre, vérification d’installation, préparation des jeux de données ou solution de repli locale. | JSON, blocs `code_repl` et `cloud_exercise`, notamment `dc_ch01_act02`, `dc_ch01_act03`, `dc_ch03_act05`, `dc_ch04_act03`, `dc_ch03_act08` |
| Insuffisance de guidage observée | Plusieurs TP ne décrivent qu’une étape et renvoient à des données préchargées : par exemple le TP VLM demande `dataset[6]` et `image`, tandis que le TP modèle le plus populaire suppose `api` et `StableDiffusionPipeline` déjà disponibles. Le téléchargement de diapositives ne fournit pas les datasets, fichiers vidéo ou checkpoints nécessaires à une reproduction autonome. | JSON, `dc_ch01_act02`, `dc_ch01_act03`, `dc_ch03_act05` et leurs `resources` |
| Insuffisance de guidage observée | Le code de séparation vidéo utilise `bounce_ad.mp4` et produit `bounce_ad_5s.mp4`/`.mp3`, mais le bloc n’indique ni acquisition du fichier source, ni emplacement de travail, ni dépendance/commande d’installation. | JSON, `dc_ch03_act08_code` |
| Présentation incohérente | Le premier bloc de préparation conseille de préparer « un chatbot IA autorisé », consigne sans rapport explicite avec un cours centré sur les modèles multimodaux Hugging Face. | JSON, bloc `neopolis_multi_modal_models_with_hugging_face__01_environment_preparation` dans `dc_ch01_act01` |
| Présentation incohérente | Des libellés de ressources restent en anglais dans un cours `fr-FR` (« Chapter 1 slides », « Official course slides… », et descriptions des ressources). Un indice de guidage est également mal rendu dans le hint de `dc_ch01_act03` (« syntaxe : - : »). | JSON, `dc_ch01_slides`, `dc_ch01_act02`, `dc_ch01_act03` |

Les notes d’import confirment la séquence et la conversion des activités, mais ne constituent pas une preuve du contenu pédagogique source : elles indiquent elles-mêmes un audit structurel et multimédia, pas une comparaison avec un manifeste pédagogique local. En conséquence, aucune reprise pédagogique inexacte vis-à-vis de DataCamp n’est déclarée comme fait.

## Appréciation des TP

**Prêt pour la pratique : nécessite un guidage de l’environnement apprenant.** La progression vidéo → exercice est claire et le verrouillage séquentiel est présent. En revanche, la reproduction hors environnement préconfiguré n’est pas suffisamment opérable : l’apprenant ne sait pas précisément quoi installer, quelles versions utiliser, quels checkpoints télécharger, comment obtenir les datasets/fichiers d’entrée, comment vérifier les objets préchargés ni comment gérer CPU/GPU, mémoire et temps d’exécution. Ce constat est une insuffisance directement observable dans le JSON, non une affirmation sur l’environnement de production.

## Correctifs génériques réutilisables par blocs Neopolis

1. Ajouter au bloc standard **Préparation d’environnement** une matrice reproductible : version Python, commande d’installation, dépendances et versions, vérification minimale (`import`/version), variantes CPU/GPU et estimation de ressources.
2. Ajouter au début de chaque `code_repl`/`cloud_exercise` un bloc **Entrées et état attendu** listant les variables préchargées, leur type, une commande d’inspection et une procédure de création ou de chargement local si elles manquent.
3. Pour chaque dataset, checkpoint, image, audio ou vidéo, utiliser le bloc standard **Ressources de TP** : provenance locale ou URL autorisée, commande de téléchargement, nom de fichier, taille/format attendu, cache et contrôle d’intégrité ; ne jamais supposer un fichier tel que `bounce_ad.mp4`.
4. Ajouter un bloc **Validation et dépannage** avec sortie attendue courte, test de connectivité/authentification séparé, erreurs fréquentes et solution sans secret ; conserver les clés uniquement dans des variables d’environnement.
5. Pour les TP multi-étapes, remplacer le guidage générique par une checklist numérotée (préparer → charger → exécuter → inspecter → interpréter) et préciser les critères de réussite, sans changer le contenu pédagogique source.
6. Appliquer le bloc standard **Localisation QA** aux titres, descriptions, ressources et hints afin d’éliminer les libellés anglais résiduels et de vérifier le rendu des placeholders/code.

## Conclusion

Le dossier local soutient une importation structurellement complète et localisée côté médias, mais pas une validation d’alignement pédagogique avec la source DataCamp. Le principal risque qualité est la **reproductibilité insuffisamment guidée dans l’environnement propre de l’apprenant**, aggravée par quelques consignes et libellés incohérents. Aucun fichier de cours n’a été modifié.

### Sources

- [`client/public/data/courses/multi_modal_models_with_hugging_face__01.json`](../../../../client/public/data/courses/multi_modal_models_with_hugging_face__01.json)
- [`docs/datacamp_multi_modal_hugging_face_import_notes_2026-08-24.md`](../../../docs/datacamp_multi_modal_hugging_face_import_notes_2026-08-24.md)
- [`scripts/datacamp-importer-core.mjs`](../../../scripts/datacamp-importer-core.mjs)
- [`scripts/import-datacamp-course.mjs`](../../../scripts/import-datacamp-course.mjs)
- [`scripts/register-multi-modal-models-with-hugging-face.mjs`](../../../scripts/register-multi-modal-models-with-hugging-face.mjs)
- [`server/multiModalModelsWithHuggingFace.test.ts`](../../../server/multiModalModelsWithHuggingFace.test.ts)

> Les chemins relatifs ci-dessus sont fournis pour lecture depuis ce rapport ; les chemins absolus sont ceux indiqués dans le périmètre et dans le résultat de l’audit.

**Statut de preuve : partial-evidence.**
**Sévérité : medium.**
**Préparation pratique : needs-learner-environment-guidance.**
