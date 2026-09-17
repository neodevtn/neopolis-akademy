# Revue de contenu — `microsoft_copilot_in_powerpoint__01`

## Synthèse

Le cours est **structurellement aligné** avec les preuves locales : 20 activités conservées, dans la séquence de 3 chapitres, avec 7 vidéos, 2 QCM et 11 TP cloud. Les preuves locales indiquent également que les 11 TP ont une rubrique, un seuil de réussite et aucune dépendance fournisseur visible. Aucun défaut factuel de reprise ou de suppression n’est établi par les fichiers locaux consultés.

Le principal point d’attention est la **préparation de la pratique dans l’environnement de l’apprenant**. Les TP sont bien rubricés, mais le JSON fournit presque partout un guidage d’environnement très générique et ne rend pas toujours explicites les fichiers ou les étapes de préparation nécessaires à la reproduction de la situation.

## Vérifications fondées sur les sources locales

| Contrôle | Constat | Source locale |
|---|---|---|
| Structure et séquence | 20 activités source et 20 activités Neopolis ; 3 chapitres ; aucune activité manquante ni retirée. | [`docs/datacamp_microsoft_copilot_in_powerpoint_alignment_2026-08-28.json`](../../../docs/datacamp_microsoft_copilot_in_powerpoint_alignment_2026-08-28.json) |
| Répartition pédagogique | 7 `VideoExercise`, 2 `PureMultipleChoiceExercise` et 11 `CloudExercise`, conformément aux métadonnées d’import du JSON. | [`client/public/data/courses/microsoft_copilot_in_powerpoint__01.json`](../../../client/public/data/courses/microsoft_copilot_in_powerpoint__01.json), [`docs/datacamp_powerpoint_source_notes_2026-08-28.md`](../../../docs/datacamp_powerpoint_source_notes_2026-08-28.md) |
| Interactions TP | Les 11 TP sont présents comme `cloud_exercise`, requis avant progression et munis de critères, score maximal et seuil. | [`docs/microsoft_copilot_in_powerpoint__01_cloud_exercise_readiness_2026-08-28.json`](../../../docs/microsoft_copilot_in_powerpoint__01_cloud_exercise_readiness_2026-08-28.json) |
| Dépendances externes | L’alignement local signale `externalLab: 0`, `externalMedia: 0` et `rawHtml: 0`. La note source signale une URL externe dans une slide de recommandations DataCamp, mais pas comme ressource locale du cours. | [`docs/datacamp_microsoft_copilot_in_powerpoint_alignment_2026-08-28.json`](../../../docs/datacamp_microsoft_copilot_in_powerpoint_alignment_2026-08-28.json), [`docs/datacamp_powerpoint_source_notes_2026-08-28.md`](../../../docs/datacamp_powerpoint_source_notes_2026-08-28.md) |
| Production | La publication locale est rapportée avec 20 activités, 13 exercices interactifs, 7 vidéos et 3 téléchargements ; le rejeu confirme le verrouillage d’un TP rubricé sans revendiquer de score IA. | [`docs/datacamp_powerpoint_production_status_2026-08-28.md`](../../../docs/datacamp_powerpoint_production_status_2026-08-28.md) |

## Défauts et insuffisances observables

### 1. Guidage d’environnement trop générique pour les TP

Dans le JSON, les 11 TP reprennent le même `environmentGuide` : « Utilisez un assistant IA génératif auquel vous avez personnellement accès. Ne partagez ni clé API, ni donnée confidentielle. » Cette consigne ne précise ni le chemin d’accès à PowerPoint/Copilot, ni les prérequis de compte/licence, ni la procédure de repli si Copilot n’est pas disponible. Il s’agit d’une **insuffisance de guidage directement observable**, et non d’un défaut d’alignement source.

### 2. Fichiers nécessaires non exposés comme ressources TP

Les blocs de ressources des TP référencent uniquement le PDF local du chapitre (`chapter_01_slides.pdf`, `chapter_02_slides.pdf` ou `chapter_03_slides.pdf`). Pourtant, les indications des TP `dc_ch03_act05` et `dc_ch03_act06` demandent de charger `SolarHome_StrategySlides.pptx` depuis `Desktop > Resources` / le dossier Resources sur le Bureau. Le JSON ne fournit pas ce fichier dans `resources` ni d’instruction générale expliquant comment obtenir ce dossier dans l’environnement personnel. La rubrique peut donc vérifier une action attendue, mais l’apprenant ne dispose pas, dans le bloc de ressources déclaré, du support de travail correspondant.

### 3. Cohérence de localisation des fichiers à clarifier

Les deux TP du chapitre 3 emploient des formulations différentes — `Desktop > Resources` dans l’un, « dossier Resources sur le Bureau » dans l’autre — tandis que le guide d’environnement reste générique. Cette variation est observable dans le JSON et peut désorienter un apprenant hors de l’environnement QA utilisé par la production. Le même contrôle devrait être appliqué aux autres TP lorsqu’ils supposent un fichier, une application ou un emplacement local.

### 4. Téléchargements et installation

Aucune consigne d’installation n’est exigée par les preuves locales et aucun laboratoire externe n’est signalé. Les trois téléchargements sont des PDF de diapositives locales, non des dépendances d’exécution. Le risque porte donc sur l’accès à l’outil et aux fichiers de pratique, pas sur une installation manquante démontrée.

## Correctifs génériques réutilisables

1. Ajouter au bloc standard de préparation un encart **« Vérifier avant de commencer »** : outil compatible, accès au compte, disponibilité de la fonctionnalité IA, solution de repli et rappel de ne pas utiliser de données sensibles.
2. Ajouter un bloc standard **« Fichiers de pratique »** listant chaque nom de fichier attendu, son bouton ou chemin de téléchargement local, son format et l’étape d’import correspondante.
3. Remplacer les chemins dépendants d’un poste (`Desktop > Resources`) par une instruction portable : **télécharger la ressource depuis le bloc**, l’enregistrer localement, puis l’importer dans l’outil ; conserver le chemin de bureau uniquement comme exemple facultatif.
4. Pour chaque TP rubricé, afficher une mini-checklist en trois temps : **préparer**, **exécuter**, **vérifier avant soumission**. La checklist doit reprendre les mêmes termes que les critères de la rubrique.
5. Ajouter un bloc standard **« Alternative si l’outil n’est pas disponible »** qui autorise un assistant IA accessible à l’apprenant, sans prétendre reproduire les contrôles propres à Copilot et sans exposer de données confidentielles.

## Verdict

**Sévérité : moyenne.** La reprise pédagogique et la chaîne interactive sont étayées comme conformes par les preuves locales. La pratique est toutefois **à renforcer pour un environnement apprenant autonome**, principalement pour l’accès à l’outil et la mise à disposition explicite des fichiers attendus dans les TP du chapitre 3.

**Statut de préparation pratique : needs-learner-environment-guidance.**

Aucun fichier de cours n’a été modifié.
