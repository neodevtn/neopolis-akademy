# Revue autonome — `ai_for_data_analysts__01`

## Périmètre et conclusion

L’audit porte exactement sur `client/public/data/courses/ai_for_data_analysts__01.json` et sur les preuves locales autorisées. **La structure publiée est globalement alignée et reproductible**, mais la préparation à une pratique dans l’environnement réel de l’apprenant est insuffisamment opérationnelle. Le principal point de vigilance est le bonus Snowflake, qui introduit une dépendance externe et une inscription à un essai sans parcours de préparation correspondant.

**Statut de preuve : partiellement étayé. Sévérité : moyenne.** Les défauts ci-dessous ne prétendent pas comparer le cours au site DataCamp : ils sont déduits du JSON et/ou explicitement consignés par les documents locaux.

## Vérifications de structure et de séquence

Le JSON déclare quatre chapitres, 39 activités source et 39 activités extraites, avec 11 vidéos, 21 exercices visuels, quatre tris et trois QCM (`client/public/data/courses/ai_for_data_analysts__01.json`, lignes 9–23). La preuve d’alignement locale confirme toutefois **37 activités Neopolis**, 39 activités source, zéro activité manquante et deux suppressions intentionnelles (`docs/datacamp_ai_for_data_analysts_alignment_2026-08-28.json`, lignes 12–25). Les suppressions sont identifiées comme les activités visuelles `1.2 — Faites connaissance avec The Daily Grind` et `4.2 — Faites connaissance avec Board and Beyond`, reposant sur une application intégrée non livrée et sans réponse déterministe (`...alignment...json`, lignes 54–73 et 745–764 ; `docs/datacamp_ai_for_data_analysts_source_notes_2026-08-28.md`, lignes 16–20). Il s’agit d’une omission documentée et volontaire, pas d’une reprise inexacte non expliquée.

La séquence restante est cohérente avec les preuves locales : chapitre 1, boîte à outils/prompting et connexions ; chapitre 2, qualité, enrichissement et insights ; chapitre 3, tableaux de bord, récits et vérification ; chapitre 4, étude de cas et bonus. Les notes d’import donnent explicitement ces objectifs (`docs/datacamp_ai_for_data_analysts_import_notes_2026-08-24.md`, lignes 9–14). Les activités conservées utilisent les blocs standard `video`, `multi_choice_exercise`, `single_choice_exercise`, `bucket_sort` et `resource_review`, ce que confirme l’alignement activité par activité (`docs/datacamp_ai_for_data_analysts_alignment_2026-08-28.json`, notamment lignes 75–233, 236–465, 467–718 et 766–924).

## Défauts factuels soutenus par les preuves locales

1. **Écart de comptage affiché dans les métadonnées d’import.** Le JSON conserve `activities_expected_from_outline: 39` et `activities_extracted: 39` (lignes 11–14), alors que le cours Neopolis contient 37 activités après les deux retraits documentés. Le manifeste de publication est cohérent avec 37 activités, 26 exercices interactifs, 11 Projector et quatre téléchargements (`docs/datacamp_ai_for_data_analysts_production_2026-08-28.md`, lignes 8–19 ; `scripts/register-ai-for-data-analysts.mjs`, lignes 17–25). Ce n’est pas une erreur de séquence, mais une présentation potentiellement ambiguë : le lecteur du JSON doit distinguer le total source du total effectivement praticable.

2. **Bonus avec dépendance externe non préparée.** Le bloc `resource_review` du bonus Snowflake demande de regarder une vidéo puis d’essayer le projet et précise : « Vous devrez vous inscrire à un essai gratuit de Snowflake » (`client/public/data/courses/ai_for_data_analysts__01.json`, lignes 5303–5327). Le même JSON ne fournit pas de procédure d’inscription, de prérequis, de compte de démonstration, de jeu de données local, de vérification d’accès ou d’alternative hors ligne. Les preuves d’alignement qualifient le cours de zéro `cloudExercises`, zéro `runtimeExercises` et zéro `externalLab` pour les activités canoniques (`docs/datacamp_ai_for_data_analysts_alignment_2026-08-28.json`, lignes 12–25) : le bonus doit donc être compris comme ressource externe facultative, et non comme TP Neopolis reproductible.

3. **Guidage d’environnement trop générique pour une mise en pratique réelle.** Le seul bloc préparatoire demande de préparer « un chatbot IA autorisé par votre organisation » et interdit de partager données sensibles, mots de passe et clés API (`client/public/data/courses/ai_for_data_analysts__01.json`, lignes 56–63). Il ne précise ni outil compatible, ni procédure de connexion, ni jeu de données d’exercice, ni format de données, ni méthode de vérification des sorties. Cette insuffisance est une observation directe du JSON, pas une affirmation sur la source fournisseur.

4. **Les “TP” conservés sont principalement des simulations de décision.** Les quatre tris donnent des consignes de classement (`client/public/data/courses/ai_for_data_analysts__01.json`, lignes 928 et 1404, ainsi que les blocs `bucket_sort` des chapitres 2 et 3) ; les autres activités interactives sont des QCM à réponse déterministe, comme le montre l’alignement local (`docs/datacamp_ai_for_data_analysts_alignment_2026-08-28.json`, par exemple lignes 75–95, 283–326 et 652–695). Le cours ne propose donc pas, dans le JSON, de manipulation guidée d’un fichier de l’apprenant, d’exécution de requête, de notebook, de dashboard ou de remise rubricable. Les notes source confirment explicitement l’absence de TP Cloud, DataLab, IDE ou exercice libre rubricable (`docs/datacamp_ai_for_data_analysts_source_notes_2026-08-28.md`, lignes 16–22). C’est une limite de préparation pratique, non une non-conformité au périmètre local annoncé.

## Présentation, médias et téléchargements

Les médias des leçons Projector sont locaux : les notes source indiquent 11 leçons, 118 slides et 118 segments de transcription, sans dépendance fournisseur visible (`docs/datacamp_ai_for_data_analysts_source_notes_2026-08-28.md`, lignes 20–22). Le contrôle de production confirme 11 Projector et quatre téléchargements (`docs/datacamp_ai_for_data_analysts_production_2026-08-28.md`, lignes 10–19). Aucun défaut factuel de média externe, d’URL DataCamp ou de téléchargement cassé n’est soutenu par les preuves locales ; il ne faut donc pas le rapporter comme anomalie.

## Correctifs génériques réutilisables par blocs Neopolis

- **Bloc d’introduction d’environnement :** ajouter un encadré standard « outils acceptés / données autorisées / données interdites / résultat attendu / solution de repli locale », sans imposer un fournisseur.
- **Bloc de TP guidé :** transformer chaque activité de simulation en fiche réutilisable en cinq étapes : objectif, entrée fournie ou fichier local, action à réaliser dans l’outil choisi, contrôle de résultat, réflexion métier.
- **Bloc de vérification IA :** fournir une checklist standard (source ou ligne vérifiable, recalcul indépendant, hypothèse, limites, décision de conservation/rejet) et un exemple de réponse attendue, sans clé API.
- **Bloc de dépendance externe facultative :** afficher avant l’activité un badge « externe », les prérequis, le coût éventuel, l’inscription, les données à ne pas téléverser et une alternative locale équivalente ; ne jamais compter ce bloc comme TP exécutable Neopolis.
- **Bloc de métadonnées de progression :** séparer systématiquement `activités_source`, `activités_retirées` et `activités_publiées` dans les vues et manifestes afin d’éviter l’ambiguïté 39/37.

## Sources locales citées

- `client/public/data/courses/ai_for_data_analysts__01.json`
- `docs/datacamp_ai_for_data_analysts_alignment_2026-08-28.json`
- `docs/datacamp_ai_for_data_analysts_source_notes_2026-08-28.md`
- `docs/datacamp_ai_for_data_analysts_import_notes_2026-08-24.md`
- `docs/datacamp_ai_for_data_analysts_production_2026-08-28.md`
- `scripts/adapt-ai-for-data-analysts.mjs`
- `scripts/register-ai-for-data-analysts.mjs`

Aucun fichier de cours n’a été modifié.
