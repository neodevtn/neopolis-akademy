# Revue de contenu — `gemini_in_google_drive__01`

## Périmètre et preuves locales

L’audit porte uniquement sur le JSON du cours et les preuves locales autorisées. Le cours est déclaré comme une importation DataCamp en français (`sourceLanguage: fr-FR`) et annonce 2 chapitres, 15 activités et 7 vidéos ; ces volumes sont également ceux effectivement extraits (`client/public/data/courses/gemini_in_google_drive__01.json`, lignes 4–20). Le rapport d’import confirme 2 leçons, 15 activités, 7 vidéos, 7 exercices interactifs, 40 médias locaux, un verrouillage séquentiel, ainsi que l’absence d’erreurs, de médias invalides et de laboratoires sous-préparés (`docs/gemini_drive_import_audit.json`, lignes 1–35). Aucun fichier local `docs/datacamp_*alignment*.json`, `docs/datacamp_*source*.md` ou `docs/datacamp_*production*.md` spécifique à Gemini dans Google Drive n’a été trouvé ; il n’est donc pas possible de conclure à une divergence avec une source DataCamp non présente dans le dépôt.

## Constats factuels

### 1. Structure et séquence

La structure est techniquement cohérente avec les compteurs déclarés : la première leçon contient huit activités et la seconde sept (`client/public/data/courses/gemini_in_google_drive__01.json`, structure `lessons[].chapters[]`; `docs/gemini_drive_import_audit.json`, lignes 2–15). Toutes les activités sont `requiredBeforeAdvance: true`, et le rapport confirme le verrouillage séquentiel (`client/public/data/courses/gemini_in_google_drive__01.json`; `docs/gemini_drive_import_audit.json`, ligne 16).

En revanche, la séquence pédagogique est présentée deux fois : le chapitre 1 introduit le sujet puis traite « Ask Gemini about a file », le raffinement des prompts et la synthèse multi-sources ; le chapitre 2 reprend les trois mêmes thèmes, puis le même support/visuel et les mêmes trois QCM. Les QCM du chapitre 2 répètent notamment les questions du chapitre 1 (construction project manager, synthèse de fichiers marketing, et combinaison Workspace/web) avec les mêmes réponses correctes (`client/public/data/courses/gemini_in_google_drive__01.json`, activités `dc_ch01_act06–08` et `dc_ch02_act05–07`). Cette répétition est observable dans le JSON ; faute de preuve locale de l’outline source, elle est signalée comme incohérence éditoriale, non comme erreur d’import par rapport à DataCamp.

### 2. Présentation et localisation

Le champ `sourceLanguage` est `fr-FR`, mais de nombreux titres, descriptions, consignes de ressource et énoncés de QCM sont identiques en anglais et en français. Exemples : descriptions de cours et de chapitres, titres « Ask Gemini about a file », « Refine prompts with Gemini in Drive », « Synthesize information… », consigne « View the PDF before continuing », et options des QCM (`client/public/data/courses/gemini_in_google_drive__01.json`, notamment lignes 31–50, 93–100, 203–228 et activités de quiz). Il s’agit d’une présentation incohérente pour un cours déclaré français. La présence de médias locaux n’est pas en cause : le rapport indique 40 médias locaux et aucun média invalide (`docs/gemini_drive_import_audit.json`, lignes 13–15 et 29–31).

### 3. TP et préparation de l’environnement apprenant

Aucun bloc de pratique guidée n’est présent dans le JSON. Les activités sont composées de 7 vidéos, 1 téléchargement PDF, 1 `resource_review`, 1 bloc de contenu visuel et 6 QCM (`client/public/data/courses/gemini_in_google_drive__01.json`; `docs/gemini_drive_import_audit.json`, lignes 5–12). Le rapport qualifie correctement l’absence de laboratoire sous-préparé, mais cela signifie ici qu’aucun laboratoire n’a été détecté, pas que le cours fournit un TP complet (`docs/gemini_drive_import_audit.json`, ligne 28).

Le guidage observable est insuffisant pour une mise en pratique autonome : les transcriptions demandent d’ouvrir Google Drive, d’utiliser « Ask Gemini », de référencer des fichiers et, pour la synthèse, de sélectionner plusieurs documents ; elles ne fournissent toutefois dans le JSON ni jeu de fichiers d’exercice, ni procédure de création/nommage de fichiers, ni résultat attendu, ni critère de vérification, ni scénario de reprise en cas d’absence de fonctionnalité (`client/public/data/courses/gemini_in_google_drive__01.json`, transcriptions des vidéos `dc_1_act_02_video` à `dc_1_act_04_video`). Le cours indique explicitement qu’un compte Google Workspace avec Gemini et l’icône « Ask Gemini » sont nécessaires et renvoie l’apprenant vers l’administrateur de son organisation (`client/public/data/courses/gemini_in_google_drive__01.json`, transcription de `dc_1_act_01_video`, et rappel dans `dc_1_act_04_video`). Cette dépendance externe est documentée, mais aucun bloc d’installation ou de contrôle préalable n’est fourni.

## Évaluation

**Évidence : partielle.** Les preuves locales valident les volumes, la disponibilité des médias et la structure importée, mais aucune preuve locale d’alignement/source/production spécifique n’est disponible pour comparer le contenu à l’original DataCamp. **Sévérité : moyenne.** Le cours est lisible et séquentiellement exploitable, mais sa répétition et son absence de TP guidé réduisent fortement la valeur d’apprentissage autonome. **Prêt pour la pratique : nécessite un guidage de l’environnement apprenant.**

## Correctifs réutilisables par blocs Neopolis

1. Ajouter avant toute activité dépendante d’un SaaS un bloc standard **Pré-requis et contrôle d’accès** : compte requis, fonctionnalité à vérifier, alternative si indisponible et consigne de contacter l’administrateur.
2. Remplacer ou compléter la promesse de « hands-on activities » par un bloc standard **TP guidé** comprenant objectif, contexte, fichiers de départ locaux, étapes numérotées, prompts à copier, livrable attendu et critères de réussite.
3. Ajouter un bloc **Vérification / preuve de résultat** demandant à l’apprenant de contrôler les sources citées, la pertinence du résumé et les hallucinations, avec une checklist réutilisable.
4. Ajouter un bloc **Dépendances externes et confidentialité** couvrant accès Google Workspace, recherche web, droits de partage et interdiction d’envoyer des données sensibles.
5. Pour les cours bilingues, appliquer le bloc standard **QA de localisation** : traduire titres, descriptions, consignes, options et rétroactions, puis vérifier qu’aucun texte anglais ne reste dans la branche `fr`.
6. Supprimer les répétitions de séquence ou les transformer en progression explicite : démonstration, pratique sur fichiers fournis, variante métier, puis évaluation de transfert ; ne pas recopier les mêmes QCM dans deux leçons.

## Sources locales citées

- `client/public/data/courses/gemini_in_google_drive__01.json`
- `docs/gemini_drive_import_audit.json`
- `scripts/datacamp-importer-core.mjs` (règles locales de conversion des vidéos, QCM et blocs pratiques ; notamment fonctions `buildVideoBlock`, `extractChoiceData` et `buildPracticalBlock`)

Aucun fichier de cours n’a été modifié.
