# Revue de contenu — `gemini_in_google_meet__01`

**Périmètre.** Lecture intégrale de `client/public/data/courses/gemini_in_google_meet__01.json`, puis recherche limitée aux preuves locales demandées (`docs/datacamp_*alignment*.json`, `docs/datacamp_*source*.md`, `docs/datacamp_*production*.md`, scripts d’import/audit et manifestes). Aucun site DataCamp ni navigateur n’a été utilisé. Aucun fichier de cours n’a été modifié.

## Verdict

L’alignement avec la source est **non vérifiable localement** : aucun fichier autorisé de type alignment/source/production ne mentionne ce cours. Le JSON contient toutefois une auto-déclaration d’import complète (1 chapitre, 10 activités, 5 vidéos, 1 activité visuelle et 4 QCM), cohérente avec la structure effectivement observée. La revue ne qualifie donc aucune reprise pédagogique de « factuellement inexacte » : la preuve locale de comparaison avec la source manque.

**Sévérité : moyenne.** Le parcours est navigable et séquentiellement verrouillé, mais sa préparation à une mise en pratique autonome est insuffisante.

## Constats étayés

| Constat | Qualification | Preuve locale |
|---|---|---|
| La séquence est linéaire : cinq activités `teaching` (vidéos), une ressource PDF, puis quatre `quiz`; chaque chapitre porte `requiredBeforeAdvance: true`. | Structure cohérente observée, sans preuve d’équivalence à la source. | `client/public/data/courses/gemini_in_google_meet__01.json` (`lessons[0].chapters[0..9]`) |
| Le bloc d’activité pratique annoncé par la vidéo « Activity Explained » n’est pas un TP exécutable : l’inventaire local compte `practicalBlocks: 0`, et le chapitre correspondant ne contient qu’un bloc `video`. | **Insuffisance de guidage apprenant directement observable.** | `client/public/data/courses/gemini_in_google_meet__01.json` (`dc_ch01_act05`); `docs/datacamp-course-inventory-2026-09-17.json` (entrée `gemini_in_google_meet__01`) |
| La consigne de la ressource est seulement « View the PDF before continuing »; elle ne précise ni objectif opératoire, ni étapes dans Google Meet, ni résultat attendu. | **Insuffisance de guidage directement observable.** | `client/public/data/courses/gemini_in_google_meet__01.json` (`dc_ch01_act06`, `instructions`) |
| Les quatre évaluations sont des `single_choice_exercise` : elles testent la reconnaissance de fonctionnalités (arrière-plan, qualité vidéo, traduction des sous-titres, prise de notes), sans action dans le compte ou l’environnement Meet de l’apprenant. | **Préparation pratique limitée, observable dans le JSON.** | `client/public/data/courses/gemini_in_google_meet__01.json` (`dc_ch01_act07` à `dc_ch01_act10`) |
| Les titres, descriptions, consignes, questions, explications et indices du champ `fr` restent fréquemment en anglais (« Generate a Background Image using Gemini », « View the PDF before continuing », etc.). | **Présentation incohérente / localisation incomplète**, directement observable; ce n’est pas une erreur de fond démontrée. | `client/public/data/courses/gemini_in_google_meet__01.json` |
| Les médias référencés sont des chemins locaux `/api/assets/...` (MP4, MP3, VTT et PDF); aucune URL externe, téléchargement de logiciel ou consigne d’installation n’est présente dans le cours. | Dépendance externe non démontrée; la dépendance aux médias servis localement est explicite. | `client/public/data/courses/gemini_in_google_meet__01.json` (champs `mp4Url`, `audioUrl`, `subtitleUrlEn`, `slidesPdf`, `resourceUrl`); `scripts/audit-datacamp-course.mjs` (contrôles `invalidMedia`, `productionMedia`) |
| Le manifeste d’import embarqué annonce `chapters_extracted: 1`, `activities_extracted: 10`, `videos_extracted: 5` et les types `VideoExercise: 5`, `VisualExercise: 1`, `PureMultipleChoiceExercise: 4`; ces nombres concordent avec le JSON. | Contrôle de complétude structurelle, pas validation pédagogique. | `client/public/data/courses/gemini_in_google_meet__01.json` (`datacampImport.expected`); `docs/datacamp-course-inventory-2026-09-17.json` |

## Limites de preuve

La recherche des seuls motifs autorisés ne retourne aucun document `docs/datacamp_*alignment*.json`, `docs/datacamp_*source*.md` ou `docs/datacamp_*production*.md` relatif à `gemini_in_google_meet__01` ou à « Gemini in Google Meet ». Les scripts indiquent bien que l’audit standard vérifie les blocs inattendus, les médias non locaux, le verrouillage séquentiel, les tags et les TP sous-préparés (`scripts/audit-datacamp-course.mjs`), mais aucun rapport de sortie propre à ce cours n’a été trouvé. Il est donc impossible d’établir localement une divergence de séquence, d’interactions ou de contenu par rapport à DataCamp.

## Correctifs réutilisables par blocs Neopolis

1. Ajouter un **bloc TP guidé standard** après la vidéo « Activity Explained » : prérequis (compte Google Workspace/Meet et droits Gemini), objectif, données/scénario, étapes numérotées dans l’interface, résultat attendu et critère de réussite.
2. Ajouter un **bloc de vérification d’environnement** non bloquant : disponibilité de Gemini dans Meet, langue, navigateur compatible, droits d’enregistrement/notes et solution de repli si la fonctionnalité n’est pas activée.
3. Transformer la ressource PDF en **bloc ressource + consigne active** : pages/éléments à repérer, question de transfert et mini-production à réaliser dans l’environnement de l’apprenant.
4. Remplacer au moins un QCM de reconnaissance par une **validation de tâche** (checklist, capture/description du résultat ou auto-évaluation structurée), sans dépendre d’un compte administrateur.
5. Appliquer le **bloc standard de localisation FR** à tous les champs visibles (`title`, `description`, `instructions`, questions, réponses, explications et indices), puis effectuer un contrôle de cohérence FR/EN.
6. Conserver les médias sous chemins locaux et ajouter au bloc standard un **contrôle de disponibilité média**; ne pas introduire de téléchargement ou d’installation externe sans prérequis, lien officiel et alternative explicités.

**Conclusion.** Le cours est structurellement complet selon ses propres métadonnées et l’inventaire local, mais il est **à compléter avant pratique autonome** : aucun TP exécutable n’est présent, l’activité annoncée n’est pas matérialisée, et la localisation française est inégale. Ces constats sont séparés de toute prétendue erreur de reprise, qui reste non démontrable faute de preuve source locale.
