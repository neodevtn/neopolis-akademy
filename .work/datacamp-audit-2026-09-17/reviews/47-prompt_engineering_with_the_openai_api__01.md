# Revue de contenu — `prompt_engineering_with_the_openai_api__01`

**Périmètre.** Lecture intégrale de `client/public/data/courses/prompt_engineering_with_the_openai_api__01.json`. La recherche de preuves est restée locale et limitée aux documents `docs/datacamp_*alignment*.json`, `docs/datacamp_*source*.md`, `docs/datacamp_*production*.md`, aux scripts et aux manifestes associés. Aucun recours à DataCamp web ou au navigateur.

## Statut de preuve

La preuve est **partielle** : aucun fichier local `datacamp_*alignment*.json`, `datacamp_*source*.md` ou `datacamp_*production*.md` ne correspond exactement à ce cours. Le manifeste visuel local confirme toutefois l’existence d’un cours de 55 activités, 40 exercices et 15 vidéos (`docs/training-visual-manifest.json`, lignes 1139–1155), en cohérence avec les métadonnées du JSON (`datacampImport.expected`, lignes 4–14). Le paquet média est également inventorié localement sous le nom `datacamp_prompt_engineering_with_the_openai_api_complete_media_package_2026-08-21.zip` (`docs/datacamp_drive_zip_inventory_latest.json`, ligne 114). Ces éléments ne suffisent pas à prouver la fidélité de la séquence au contenu source original.

## Constats factuels

1. **Structure cohérente avec les compteurs déclarés, mais activités très bloc-dépendantes.** Le JSON contient 55 chapitres/activités : 15 `teaching` et 40 `exercise`. Il contient 15 vidéos, 37 blocs `code_repl`, 3 `cloud_exercise`, 4 téléchargements et un bloc de préparation d’environnement. La séquence est linéaire et chaque chapitre porte `requiredBeforeAdvance: true`. Le manifeste local confirme les compteurs 55/40/15, mais ne documente pas le détail de la séquence.

2. **Guidage insuffisant des TP autonomes observable directement.** Les trois TP `cloud_exercise` (`dc_1_act_06_tp`, `dc_2_act_02_tp`, `dc_2_act_14_tp`) ont `steps: []` et un seul élément `resources`; ils ont bien un `environmentGuide`, mais celui-ci reste générique (installer Python/SDK, configurer des identifiants, ne jamais publier une clé) et ne fournit ni procédure d’exécution, ni vérification, ni dépannage. Ce constat est directement visible dans le JSON, indépendamment de toute source externe.

3. **Absence d’attendu explicite dans les TP Python.** Les 37 blocs `code_repl` ont un champ `expectedOutput` vide. Le JSON fournit souvent un `starterCode`, une `solutionCode` et un `hint`, mais pas de résultat attendu, critère observable ou test local explicite. Pour un apprenant dans son propre environnement, cela rend la validation de la réussite et le diagnostic d’erreur insuffisamment guidés. Il s’agit d’une insuffisance de conception observable, non d’une affirmation sur le cours source.

4. **Dépendance API et installation incomplètement opérationnalisées.** Le cours demande des appels `OpenAI`, `client.chat.completions.create` et une clé API dans plusieurs consignes/starter codes (par exemple `dc_1_act_02_code` et `dc_1_act_03_code`), tandis que le bloc de préparation ne donne pas la commande concrète d’installation du SDK, ni une procédure de test sans clé, ni un modèle de fichier `.env`. Le JSON rappelle correctement de conserver la clé en variable d’environnement et de ne pas utiliser de données sensibles, mais ne transforme pas ces règles en parcours exécutable de bout en bout.

5. **Présentations répétitives/incohérentes.** Les descriptions `en` et `fr` des activités reprennent massivement la même promesse générale, y compris pour des activités distinctes. Plusieurs intitulés de téléchargement restent en anglais dans les champs français (`Chapter 1 slides`, `Official course slides provided for this course`), alors que les titres pédagogiques sont en français. Le cours déclare `sourceLanguage: ""` dans `datacampImport`, ce qui laisse la provenance linguistique non renseignée. Ces défauts sont observables dans le JSON, sans extrapoler sur l’original.

6. **Médias locaux présents, mais preuve de production spécifique absente.** Les vidéos référencent des chemins locaux `/api/assets/...` et des sous-titres FR/EN; les téléchargements référencent des PDF locaux. Le manifeste confirme « médias locaux ». En revanche, aucun document de production/alignment spécifique au cours n’a été trouvé pour confirmer l’exhaustivité, l’ordre ou la correspondance vidéo–chapitre. Le document voisin `docs/datacamp_working_with_the_openai_api_alignment_2026-08-28.json` concerne un autre cours et ne doit pas être utilisé comme preuve de fidélité ici.

## Appréciation

**Sévérité : moyenne.** Le cours est structuré et ses compteurs principaux sont cohérents avec le manifeste local, mais la pratique autonome est **à renforcer** : les TP cloud n’ont aucune étape détaillée et les exercices de code n’exposent aucun attendu de sortie. L’absence de preuve locale spécifique empêche de qualifier factuellement une reprise inexacte de la séquence ou des interactions source; ces points restent à vérifier si une preuve locale dédiée est ajoutée.

## Correctifs génériques réutilisables

- Ajouter à chaque bloc TP autonome le bloc standard **Préparer → Installer → Configurer → Exécuter → Vérifier → Dépanner → Nettoyer**, avec commandes et variantes Windows/macOS/Linux lorsque pertinent.
- Ajouter un gabarit de configuration sécurisé : `venv`, commande d’installation du SDK, fichier `.env.example`, lecture par variable d’environnement, test de présence de la clé et avertissement de coût/confidentialité.
- Pour chaque `code_repl`, fournir un **critère de réussite observable** : sortie minimale attendue, assertions ou checklist de vérification; distinguer résultat exact et sortie générative variable.
- Remplacer les `steps: []` des `cloud_exercise` par des étapes numérotées et une procédure de secours sans environnement cloud, sans imposer de proxy ou de jeton de formation.
- Utiliser un bloc standard de consignes de données sûres : données synthétiques, absence de données personnelles/confidentielles, révocation de clé et suppression des artefacts après le TP.
- Harmoniser les libellés FR/EN des titres, descriptions et téléchargements, puis contrôler automatiquement les champs français restés en anglais.
- Maintenir un manifeste d’alignement spécifique au cours indiquant activités source/locales, types de blocs, médias, téléchargements, dépendances externes et décisions de transformation; ne pas déduire ces éléments d’un autre cours OpenAI.

**Sources locales citées :**

- `client/public/data/courses/prompt_engineering_with_the_openai_api__01.json`
- `docs/training-visual-manifest.json`
- `docs/datacamp_drive_zip_inventory_latest.json`
- `docs/datacamp_working_with_the_openai_api_alignment_2026-08-28.json` (utilisé uniquement comme preuve de portée d’un cours différent, non comme preuve d’alignement du cours audité)
- `docs/datacamp_working_with_openai_api_source_notes_2026-08-28.md` (même réserve de portée)
- `scripts/adapt-working-with-openai-api.mjs` (script d’un cours différent; aucune transformation n’est attribuée au cours audité)

Aucun fichier de cours n’a été modifié.
