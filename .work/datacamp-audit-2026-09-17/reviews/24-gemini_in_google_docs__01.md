# Revue de contenu — `gemini_in_google_docs__01`

**Conclusion.** La comparaison avec une source pédagogique locale est **incomplète** : aucun fichier autorisé `docs/datacamp_*alignment*.json`, `docs/datacamp_*source*.md` ou `docs/datacamp_*production*.md` ne correspond à *Gemini in Google Docs*. Le dépôt contient toutefois l’inventaire du catalogue et le manifeste d’import embarqué dans le cours. Ils permettent de contrôler la structure importée et de relever un risque documentaire, mais pas de confirmer la fidélité pédagogique de chaque reprise.

## Constats étayés

1. **Structure importée cohérente avec le manifeste embarqué.** Le fichier de cours annonce un schéma `neopolis.datacamp_course.v1`, un slug source `gemini-in-google-docs`, un chapitre attendu et extrait, neuf activités attendues et extraites, cinq vidéos, un exercice visuel et trois QCM. Le JSON contient effectivement une leçon avec neuf chapitres/activités : cinq activités `teaching` à bloc vidéo, une activité `resource` à bloc `resource_review`, puis trois quiz à choix unique. Cette correspondance est observable dans `client/public/data/courses/gemini_in_google_docs__01.json` (métadonnées `datacampImport` et tableau `lessons[0].chapters`). Elle ne constitue pas une preuve d’alignement au contenu original, faute de fichier source local correspondant.

2. **Aucune preuve locale complète de la source ou de la production n’est disponible pour ce cours.** L’inventaire du catalogue identifie *Gemini in Google Docs* comme un cours débutant de 30 minutes et comme contenu partenaire Google Cloud. Il précise que les contenus Google Cloud nécessitent une vérification d’autorisation distincte, et qu’aucun manifeste, paquet de médias ou export correspondant aux huit cours Gemini n’est présent dans l’espace projet (`docs/datacamp_catalog_inventory_2026-08-20.md`, lignes 49–68). Le fichier d’inventaire Drive confirme seulement le nom d’une archive `datacamp_gemini_in_google_docs_complete_media_package_2026-08-21.zip` ; il ne fournit pas ici son contenu pédagogique ni une preuve d’alignement (`docs/datacamp_drive_zip_inventory_latest.json`, lignes 21–27). Il est donc impossible de déclarer factuellement une reprise inexacte de séquence ou d’interaction à partir des seules preuves autorisées.

3. **Le TP ne guide pas suffisamment l’apprenant dans son propre environnement.** Ce défaut est directement visible dans le JSON, indépendamment de la source DataCamp. L’activité `dc_ch01_act05` annonce seulement que l’apprenant doit écrire un billet de blog pour Cymbal Retail et s’exercer à générer puis affiner le texte. L’activité suivante, `dc_ch01_act06`, demande uniquement : « View the PDF before continuing » / « View the PDF before continuing » et expose le fichier local `/api/assets/chapter_01_slides_6a295357.pdf`. Aucun de ces blocs ne précise un environnement de travail à choisir, un compte ou une édition Google Workspace compatible, un document à créer, des données fictives à préparer, une procédure pas à pas, un prompt de départ complet, un résultat attendu vérifiable, une preuve à remettre, ni une solution de repli lorsque Gemini n’est pas disponible. Les cinq vidéos décrivent des démonstrations, mais aucun bloc d’exercice guidé ne transforme cette démonstration en pratique reproductible dans l’environnement de l’apprenant (`client/public/data/courses/gemini_in_google_docs__01.json`, chapitres `dc_ch01_act01` à `dc_ch01_act06`).

4. **Présentation partiellement incohérente pour une interface française.** Les champs `fr` des titres, descriptions, consignes de ressource et questions sont fréquemment identiques à l’anglais : par exemple les titres « Introduction to Gemini in Google Docs », « Generate a Blog Post » et la consigne « View the PDF before continuing ». Les transcriptions et explications de quiz contiennent également de l’anglais dans les valeurs `fr`. Ce constat est directement vérifiable dans le JSON ; il s’agit d’une incohérence de localisation, sans prétendre qu’elle contredit la source originale.

5. **Dépendances et téléchargements.** Le seul téléchargement explicitement présent dans le cours est le bloc `download` `dc_ch01_slides` de l’activité d’introduction ; le seul accès de ressource explicite est le PDF local référencé ci-dessus. Le JSON ne contient pas de consigne d’installation ni de clé/API à fournir. En revanche, la pratique suppose implicitement l’accès à Google Docs et à Gemini sans indiquer les conditions de disponibilité, les restrictions d’administration ou une alternative locale. Cette omission rend le TP fragile, même si elle ne permet pas d’affirmer une dépendance externe non documentée par la source.

## Correctifs génériques réutilisables

- Ajouter au début de tout TP un bloc standard **Préparation d’environnement** : environnement recommandé, accès requis, version/édition compatible, solution de repli, données fictives et interdiction des secrets ou données personnelles réelles.
- Remplacer la simple consultation d’un support par un bloc **Mission guidée** comprenant le contexte, le document à créer, les étapes numérotées, le prompt initial, un exemple de raffinement et les critères de réussite.
- Ajouter un bloc **Livrable et preuve** : format attendu, emplacement de sauvegarde, capture ou texte à remettre, et contrôle observable avant passage à l’étape suivante.
- Ajouter un bloc **Validation et dépannage** couvrant l’indisponibilité de Gemini, les droits Google Workspace, les résultats insatisfaisants et la réinitialisation avec des données de démonstration.
- Utiliser un contrôle de localisation standard vérifiant que les champs `fr` sont réellement en français, y compris titres, consignes, questions, explications, indices et libellés de ressources.
- Pour chaque import partenaire, conserver avant publication un manifeste local d’alignement, de provenance, de production média et d’autorisation ; sans ces pièces, marquer l’audit comme partiellement étayé plutôt que conclure à la fidélité pédagogique.

## Sources locales

- `client/public/data/courses/gemini_in_google_docs__01.json`
- `docs/datacamp_catalog_inventory_2026-08-20.md`
- `docs/datacamp_drive_zip_inventory_latest.json`
- `scripts/datacamp-importer-core.mjs` (schéma et conversion `neopolis.datacamp_course.v1`)
- `scripts/audit-datacamp-course-alignment.mjs` et `scripts/audit-datacamp-course.mjs` (contrôles structurels disponibles)

**Statut de preuve :** partiel. **Gravité :** moyenne, principalement en raison de la non-préparation du TP pour un environnement apprenant autonome et de la localisation française incomplète.

**Note de périmètre :** aucun fichier de cours n’a été modifié ; aucune source DataCamp web ou navigation externe n’a été utilisée.

## Références

[1]: `client/public/data/courses/gemini_in_google_docs__01.json` "Cours audité et manifeste d’import embarqué"
[2]: `docs/datacamp_catalog_inventory_2026-08-20.md` "Inventaire local du catalogue DataCamp"
[3]: `docs/datacamp_drive_zip_inventory_latest.json` "Inventaire local des archives Drive DataCamp"
[4]: `scripts/datacamp-importer-core.mjs` "Convertisseur local du schéma DataCamp v1"
[5]: `scripts/audit-datacamp-course-alignment.mjs` "Contrôles locaux d’alignement de cours"
[6]: `scripts/audit-datacamp-course.mjs` "Contrôles locaux de cours DataCamp"

[1] [2] [3] [4] [5] [6]

---

**Auteur :** Manus AI  
**Date de revue :** 17 septembre 2026
