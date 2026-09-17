# Revue de contenu — `software_development_with_windsurf__01`

## Conclusion

**Statut de preuve : partiel.** Les preuves locales confirment les compteurs, la séquence en trois chapitres, les formats d’activités et la présence de médias locaux. Elles ne fournissent toutefois pas le manifeste canonique ni le contenu source permettant de vérifier mot à mot les reprises pédagogiques. Aucune reprise inexacte ne peut donc être déclarée factuellement.

**Préparation à la pratique : nécessite un guidage de l’environnement apprenant.** Le cours contient une préparation initiale de Windsurf et des interactions correctement séquencées. Les activités observables dans le JSON sont des vidéos, QCM, exercices visuels et tris. Elles ne demandent pas à l’apprenant de réaliser, tester et vérifier une production dans son propre projet.

## Constats soutenus par les fichiers locaux

### Structure et séquence pédagogique

Le JSON déclare et contient **3 chapitres, 31 activités et 11 vidéos**. La répartition extraite du cours est de **11 `VideoExercise`, 9 `VisualExercise`, 6 `PureMultipleChoiceExercise` et 5 `DragAndDropExercise`** (`client/public/data/courses/software_development_with_windsurf__01.json`, section `datacampImport.expected`). Les mêmes compteurs sont consignés dans les notes d’import locales (`docs/datacamp_software_development_windsurf_import_notes_2026-08-24.md`, lignes 13–15 et 35–40).

Les activités sont verrouillées par `requiredBeforeAdvance: true` dans le JSON. La note d’import indique également que les chapitres et activités doivent respecter l’ordre et le verrouillage séquentiel, puis rapporte que ce contrôle est actif (`docs/datacamp_software_development_windsurf_import_notes_2026-08-24.md`, lignes 17–21 et 57–64). La structure et la progression importées sont donc alignées avec la preuve locale disponible.

Les descriptions des trois chapitres et des activités sont répétées à l’identique à plusieurs endroits du JSON. Cette répétition n’est pas, à elle seule, une erreur de reprise : elle constitue seulement une présentation peu différenciée entre le niveau chapitre et le niveau activité. Aucun document local ne permet d’affirmer que cette formulation diverge de la source DataCamp.

### Interactions et modalités des TP

Le JSON contient 20 activités interactives, mais leurs blocs sont exclusivement `multi_choice_exercise`, `single_choice_exercise` et `bucket_sort`. Les QCM et exercices visuels comportent des options, une réponse correcte, une explication et un indice ; les tris comportent un indice et une explication. Aucun bloc n’est de type `cloud_exercise`, évaluation de prompt, réponse libre ou exécution de code (`client/public/data/courses/software_development_with_windsurf__01.json`, blocs des activités `dc_ch01_*` à `dc_ch03_*`).

Cette structure permet de contrôler la compréhension déclarative ou le classement d’éléments. Elle ne guide pas directement une réalisation dans l’environnement Windsurf de l’apprenant. Le JSON ne fournit pas de dépôt de départ, d’arborescence attendue, de fichiers à créer, de commande de lancement, de commande de test, de résultat attendu ou de critère de validation exécutable. Il ne fournit pas non plus de consigne de transfert vers un petit projet personnel. Il s’agit d’une **insuffisance de guidage observable directement**, et non d’une affirmation sur la qualité du contenu source.

La première activité ajoute un encadré de préparation : installation de Windsurf, ouverture ou création d’un projet de démonstration, import facultatif des préférences VS Code et interdiction d’utiliser des secrets ou données confidentielles (`client/public/data/courses/software_development_with_windsurf__01.json`, premier bloc de `dc_ch01_act01`). Cette préparation est utile, mais elle reste générale : elle ne définit ni version, ni vérification d’installation, ni projet de départ, ni procédure de test pour les activités suivantes.

### Dépendances externes, téléchargements et médias

Les vidéos utilisent des chemins `/api/assets/` pour les MP4, HLS, sous-titres et PDF de diapositives. Les notes d’import rapportent **72 références média locales sur 72**, zéro média invalide et aucun chemin `/manus-storage/` ou URL DataCamp externe dans le JSON public (`docs/datacamp_software_development_windsurf_import_notes_2026-08-24.md`, lignes 31–45 et 57–66). Les trois téléchargements enregistrés dans le manifeste associé sont des PDF de diapositives (`scripts/register-software-development-with-windsurf.mjs`, lignes 17–25 et 32–45) ; le JSON ne présente pas de téléchargement de données ou d’environnement d’exécution.

La préparation générée par le script prévoit explicitement le cas Windsurf et l’usage de données de test (`scripts/prepare-datacamp-projector-course.mjs`, lignes 195–221). Cette capacité du pipeline ne remplace pas un guidage TP détaillé : le JSON publié ne contient qu’une préparation générale au premier écran et aucun guide d’environnement par activité.

## Limites et défauts pouvant être établis

La preuve locale permet d’établir l’alignement des compteurs, des types et de la séquence. Elle ne permet pas de comparer le texte pédagogique, les objectifs détaillés ou l’ordre interne à un manifeste source canonique, car les notes citent une archive, un manifeste et un prompt d’import qui ne sont pas présents dans les fichiers de preuve examinés. **Aucune reprise pédagogique inexacte n’est donc retenue.**

Le défaut retenu concerne la pratique autonome : les activités sont des interactions fermées et la préparation Windsurf ne donne pas à l’apprenant un chemin reproductible pour ouvrir un projet, appliquer une consigne, exécuter une vérification et constater un résultat. Le risque est une compréhension théorique sans transfert opérationnel dans l’environnement propre de l’apprenant.

## Correctifs génériques réutilisables par blocs Neopolis

1. Ajouter avant le premier TP le bloc standard **« Préparer son environnement »** : version recommandée, vérification de l’installation, projet de démonstration, arborescence et procédure de nettoyage.
2. Fournir un **jeu de départ local versionné** pour chaque séquence pratique, avec les fichiers explicitement mentionnés dans les consignes et une solution de repli sans compte ou service externe.
3. Pour chaque activité de pratique, préciser séparément **l’action à réaliser**, **la commande ou l’observation de contrôle**, **le résultat attendu** et **le critère de réussite**.
4. Ajouter un bloc standard **« Transfert vers votre projet »** demandant d’adapter l’exercice à un petit projet ou fichier non sensible, avec rappel de ne jamais exposer secrets, clés, jetons ou données confidentielles.
5. Lorsque l’activité reste volontairement un QCM, un tri ou un exercice visuel, l’indiquer comme vérification de compréhension et ajouter, dans le bloc suivant, une micro-application guidée plutôt que de la présenter comme un TP exécuté.
6. Différencier les descriptions de chapitre et d’activité avec un objectif, un livrable et une condition de passage propres à chaque niveau, sans changer le contenu source présumé.

## Sources locales

[1]: client/public/data/courses/software_development_with_windsurf__01.json "Cours audité"
[2]: docs/datacamp_software_development_windsurf_import_notes_2026-08-24.md "Notes locales d’import et contrôles du cours Windsurf"
[3]: scripts/prepare-datacamp-projector-course.mjs "Préparation locale des cours DataCamp Projector"
[4]: scripts/register-software-development-with-windsurf.mjs "Manifeste d’enregistrement local du cours Windsurf"

Les constats de structure et de guidage renvoient à [1]. Les compteurs, contrôles de médias et séquence rapportée renvoient à [2]. Le comportement du bloc de préparation et la conversion des médias renvoient à [3]. Les compteurs de catalogue et téléchargements déclarés renvoient à [4].

> Aucun fichier de cours n’a été modifié.
>
> La revue a été réalisée uniquement à partir de fichiers locaux ; aucune consultation DataCamp web ni navigation n’a été utilisée.

[1]: client/public/data/courses/software_development_with_windsurf__01.json "Cours audité"
[2]: docs/datacamp_software_development_windsurf_import_notes_2026-08-24.md "Notes locales d’import et contrôles du cours Windsurf"
[3]: scripts/prepare-datacamp-projector-course.mjs "Préparation locale des cours DataCamp Projector"
[4]: scripts/register-software-development-with-windsurf.mjs "Manifeste d’enregistrement local du cours Windsurf"
