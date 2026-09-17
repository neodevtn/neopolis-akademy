# Revue de contenu — `gemini_in_google_sheets__01`

## Périmètre et niveau de preuve

Revue limitée à `client/public/data/courses/gemini_in_google_sheets__01.json` et aux preuves locales autorisées. Les preuves de dépôt disponibles sont le rapport global d’import (`docs/datacamp_import_final_report_2026-08-21.md`, tableau Catalogue Gemini, ligne « Gemini in Google Sheets »), le manifeste visuel (`docs/training-visual-manifest.json`, entrée `datacamp_gemini_in_google_sheets`) et les règles d’import (`scripts/datacamp-importer-core.mjs`). Aucun fichier local `datacamp_*alignment*.json`, `datacamp_*source*.md` ou `datacamp_*production*.md` propre à ce cours n’a été trouvé. La comparaison avec la source pédagogique DataCamp est donc **partielle** : elle confirme surtout la structure importée et la présence déclarée des assets, pas la fidélité au contenu source absent du dépôt.

## Constats factuels

| Constat | Appui local | Évaluation |
|---|---|---|
| La structure importée est cohérente avec les compteurs déclarés : 1 chapitre, 7 activités, 4 vidéos, 1 support et 3 activités non vidéo (1 `resource_review`, 2 QCM). | `client/public/data/courses/gemini_in_google_sheets__01.json`, lignes 4–20 et 24–349 ; `docs/datacamp_import_final_report_2026-08-21.md`, lignes 37–49 ; `docs/training-visual-manifest.json`, entrée du cours, champs `chapters`, `activities`, `exercises`, `videos`. | Aucun défaut structurel démontré. |
| La séquence est linéaire et chaque activité est obligatoire (`requiredBeforeAdvance: true`) : quatre vidéos, puis consultation du PDF, puis deux QCM. | JSON, lignes 40–347 ; règle d’import correspondante dans `scripts/datacamp-importer-core.mjs` (champ `requiredBeforeAdvance: true`, branche `VisualExercise` vers `resource_review`, branche QCM). | La séquence est présentée comme conforme dans le rapport global, mais cette preuve ne vérifie pas la pertinence pédagogique de l’ordre. |
| Le cours annonce un TP où l’apprenant doit agir comme commercial de Cymbal Retail et créer un plan de vente, mais aucune activité pratique autonome ne suit : l’activité 4 est seulement une vidéo d’explication ; l’activité 5 est une consultation du PDF ; les activités 6–7 sont des QCM. | JSON, lignes 171–186 (promesse du TP), 201–221 (PDF), 233–345 (QCM). | **Insuffisance de guidage directement observable** : l’apprenant ne reçoit ni bloc de réalisation, ni livrable attendu, ni critères de réussite, ni zone de preuve dans ce JSON. |
| Les consignes de l’activité 5 demandent seulement « View the PDF before continuing » / « Consultez le PDF avant de continuer ». | JSON, lignes 205–219. | **Interaction faible** : la consultation est bloquante mais ne demande pas d’identifier, appliquer ou vérifier un élément appris. |
| Le seul téléchargement est le PDF local des slides ; les vidéos/audio/sous-titres sont référencés par des URLs d’assets locales. Aucune installation ou dépendance API/clé externe n’est prescrite dans le JSON. | JSON, lignes 61–85, 109–112, 143–146, 177–180, 215 ; le script ajoute le téléchargement de slides au premier bloc quand le PDF existe (`scripts/datacamp-importer-core.mjs`). | Pas de défaut factuel de dépendance externe ou d’installation démontré. |
| Le contenu est annoncé en français (`sourceLanguage: fr-FR`), mais les titres, descriptions, questions, options, explications et consignes portent systématiquement des chaînes anglaises dans les champs `fr`. | JSON, lignes 8, 27–33, 43–49, 92–97, 126–131, 160–165, 192–199, 207–219, 226–342. | **Présentation incohérente / localisation incomplète** observée directement. Ce constat ne permet pas d’affirmer une divergence avec la source DataCamp, faute de preuve locale de référence. |
| Les avertissements d’usage sont présents dans la transcription : résultats potentiellement inexacts, absence de conseil professionnel et disponibilité variable selon l’édition/politiques Workspace. | JSON, lignes 65–69 et 113–117. | Point de prudence présent ; il ne remplace pas un protocole de vérification dans le TP. |

## Reprises pédagogiques et dépendances

Aucune reprise pédagogique inexacte ne peut être établie factuellement sans fichier local d’alignement ou de source propre à ce cours. Le rapport global classe le cours « Conforme », mais ce statut est une validation de lot/structure et non une preuve détaillée de fidélité pédagogique (`docs/datacamp_import_final_report_2026-08-21.md`, lignes 39–49 et paragraphe sur les audits canoniques). Le dépôt ne permet donc pas de distinguer une éventuelle reformulation incorrecte de la formulation source.

La dépendance d’usage observable est un navigateur ouvrant `sheets.google.com`, un nouveau tableur et l’accès à « Help me organize » (`client/public/data/courses/gemini_in_google_sheets__01.json`, lignes 113–117). Le transcript avertit que la fonctionnalité peut être indisponible ou restreinte par l’administrateur Workspace (lignes 65–69). Le JSON ne fournit toutefois pas de procédure de diagnostic, de parcours de repli sans Gemini, ni de consigne explicite de travailler dans un compte/sheet de démonstration.

## Verdict

**Sévérité : moyenne.** La structure et les assets sont cohérents avec les manifestes et le rapport d’import local, mais l’activité annoncée comme hands-on n’est pas matérialisée en TP guidé. L’apprenant doit inférer quoi faire dans son propre environnement, quel plan produire, comment vérifier le résultat et quelle preuve soumettre. La localisation française est également incohérente dans les champs `fr`.

**Préparation à la pratique : `needs-learner-environment-guidance`.** Le cours n’est pas démontré inutilisable : les actions de base sont décrites dans les transcriptions. Il n’est cependant pas prêt pour une pratique autonome vérifiable.

## Correctifs génériques réutilisables par blocs Neopolis

1. Ajouter, après la vidéo d’explication, un bloc standard **Préparation d’environnement** : compte de démonstration, nouveau fichier vierge, données fictives, vérification de l’accès à la fonctionnalité et alternative locale si elle est indisponible ; ne jamais demander de secret ou donnée réelle.
2. Remplacer la simple consultation bloquante par un bloc **TP guidé** comprenant objectif, étapes numérotées, prompt de départ, résultat attendu, points de contrôle et consigne de sauvegarde avant toute régénération/écrasement.
3. Ajouter un bloc **Preuve de réalisation** demandant le lien ou la capture autorisée, le prompt utilisé, le résultat obtenu, une vérification humaine et les limites constatées ; prévoir une validation humaine avant toute action irréversible.
4. Ajouter un bloc **Critères de réussite / auto-évaluation** aligné sur le livrable (colonnes attendues, pertinence des données, absence d’écrasement involontaire), plutôt que de compter uniquement sur des QCM.
5. Appliquer le bloc standard de **localisation QA** : traduire réellement les valeurs `fr`, vérifier titres/descriptions/questions/options/consignes et conserver l’anglais uniquement dans un champ `en`.

## Sources locales citées

- `client/public/data/courses/gemini_in_google_sheets__01.json`
- `docs/datacamp_import_final_report_2026-08-21.md`
- `docs/training-visual-manifest.json`
- `scripts/datacamp-importer-core.mjs`
- `scripts/import-datacamp-course.mjs`
