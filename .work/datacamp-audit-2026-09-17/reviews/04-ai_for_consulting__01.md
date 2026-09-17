# Revue de contenu — `ai_for_consulting__01`

**Conclusion.** Le rapprochement local confirme la séquence pédagogique principale et la conversion des activités en blocs Neopolis, mais le cours n’est pas entièrement prêt pour une pratique autonome. La priorité est de rendre exécutables les TP qui mentionnent des fichiers, des jeux de données ou un dossier `Resources`, puis de réconcilier les compteurs d’import avec la structure effectivement publiée.

## Constat de conformité et incohérences

Le fichier du cours contient trois leçons et trente chapitres publiés. La séquence observée est cohérente avec l’alignement local pour les activités conservées : onze `VideoExercise`, seize `CloudExercise`, deux QCM et un tri. L’alignement indique toutefois 31 activités source, 30 activités Neopolis et une suppression intentionnelle : l’activité 3.9, « Vérifier l’analyse avec des données qualitatives », est déclarée non reproductible faute de rubrique, fichier ou ressource locale. Cette suppression est documentée et ne constitue donc pas une activité manquante involontaire. Sources : `docs/datacamp_ai_for_consulting_alignment_2026-08-28.json` (totaux et entrée 3.9), `docs/datacamp_ai_for_consulting_source_notes_2026-08-28.md` (lignes 26–32), `client/public/data/courses/ai_for_consulting__01.json` (structure `lessons`/`chapters`).

Une incohérence de présentation subsiste dans le JSON : `datacampImport.expected` annonce 31 activités extraites et 17 `CloudExercise`, alors que le document publié contient 30 chapitres, dont 16 blocs `cloud_exercise`. Le champ `exerciseCount` vaut 19, ce qui ne correspond pas non plus au nombre de TP cloud (16) ni au total des chapitres interactifs (19 si l’on compte les TP, QCM et tri, mais pas les vidéos). L’alignement local explicite la réalité 30/16 ; les notes d’import historiques annoncent encore 31/17. Ce défaut est factuel et localement vérifiable, mais il s’agit d’un problème de métadonnées, pas d’une reprise pédagogique démontrée comme inexacte. Sources : `client/public/data/courses/ai_for_consulting__01.json`, `docs/datacamp_ai_for_consulting_alignment_2026-08-28.json`, `docs/datacamp_ai_for_consulting_import_notes_2026-08-24.md`.

La conversion des TP est globalement alignée avec les preuves locales : les 16 exercices cloud dotés de critères explicites ont une rubrique, un score de passage égal au nombre de critères, un seuil `minWords` à 1 et un guide d’environnement générique. Le script d’adaptation confirme cette règle et la suppression de 3.9. Sources : `docs/datacamp_ai_for_consulting_source_notes_2026-08-28.md` (lignes 26–36), `scripts/adapt-ai-for-consulting.mjs` (lignes 65–105), `docs/datacamp_ai_for_consulting_alignment_2026-08-28.json`.

## Insuffisances de guidage observables dans le JSON

Le guide d’environnement de chaque TP cloud est identique dans son principe : utiliser un assistant IA auquel l’apprenant a accès, ouvrir une nouvelle conversation et ne pas envoyer de données sensibles. Il ne précise pas un outil compatible, la procédure de téléversement, le format attendu de la réponse, ni une solution de repli lorsque l’assistant choisi ne permet pas l’import de fichier. Cette limite est observable directement dans `environmentGuide`, tandis qu’aucune consigne d’installation n’est fournie. Il ne faut donc pas conclure à une dépendance d’installation non documentée ; le défaut est l’absence de guidage opérationnel.

Plusieurs énoncés demandent pourtant un support qui n’est pas fourni comme ressource du TP. Les activités `dc_ch01_act07`, `dc_ch02_act06`, `dc_ch02_act07` et `dc_ch03_act08` mentionnent respectivement un fichier Excel, un fichier de données ou le dossier `Resources`. Dans le JSON, la ressource attachée à ces TP est seulement le PDF de slides du chapitre. Pour `dc_ch03_act08`, l’énoncé mentionne trois sources de données, mais `resources` ne propose également que le PDF. Les autres TP ne déclarent aucun fichier d’exercice téléchargeable. Les consignes et les ressources sont donc insuffisantes pour reproduire ces mises en situation dans l’environnement propre de l’apprenant. Source : `client/public/data/courses/ai_for_consulting__01.json`, champs `assignment`, `resources`, `steps` et `environmentGuide` des blocs `cloud_exercise` concernés.

Les blocs cloud possèdent des `steps` vides. Les instructions sont principalement portées par un long `assignment`, un `hint` et une `solution` masquée. Pour un TP local, cette structure ne guide pas explicitement l’apprenant à travers une préparation, une action dans son outil, une vérification intermédiaire et une soumission. La rubrique évalue la réponse finale, mais le JSON ne fournit pas toujours une procédure reproductible pour produire cette réponse. Ce constat porte sur l’utilisabilité pédagogique et ne prétend pas établir une divergence avec le contenu source DataCamp. Source : `client/public/data/courses/ai_for_consulting__01.json`, blocs `cloud_exercise` et leurs champs `steps`.

Les téléchargements de slides sont présents pour les trois chapitres, avec des chemins locaux `/api/assets/...pdf`. Les preuves locales ne montrent ni URL DataCamp publiée ni média externe ; elles indiquent au contraire zéro média externe et des médias locaux validés. Ce point est conforme et ne doit pas être traité comme un défaut. Sources : `docs/datacamp_ai_for_consulting_alignment_2026-08-28.json`, `docs/datacamp_ai_for_consulting_verification_2026-08-24.md`, `client/public/data/courses/ai_for_consulting__01.json`.

## Correctifs réutilisables par blocs Neopolis

1. **Bloc de préparation d’environnement standard.** Ajouter une fiche courte indiquant les capacités minimales de l’outil autorisé : nouvelle conversation, saisie d’un prompt, import de fichier si requis, lecture de tableaux et export ou copie de la réponse. Ajouter une variante sans téléversement lorsque le fichier ne peut pas être importé.

2. **Bloc de ressources d’exercice.** Pour chaque TP qui cite un fichier ou `Resources`, joindre les fichiers effectivement nécessaires dans `resources`, avec nom, format, taille indicative, contenu non sensible et objectif de chaque fichier. Ne pas remplacer une ressource manquante par une simple mention dans l’énoncé.

3. **Bloc d’étapes guidées.** Découper l’activité en quatre étapes réutilisables : préparer l’outil et les données ; exécuter le premier prompt ; contrôler un résultat intermédiaire ; produire puis soumettre la réponse finale. Conserver la solution masquée et la rubrique existante.

4. **Bloc de vérification et de repli.** Donner un exemple de résultat attendu sans imposer une réponse unique, une checklist de contrôle et une procédure de repli par copier-coller d’un petit extrait anonymisé lorsque l’import de fichier est indisponible. Rappeler à chaque étape l’interdiction des données confidentielles, personnelles, mots de passe et clés API.

5. **Bloc de métadonnées d’import.** Régénérer les compteurs à partir des chapitres effectivement publiés, ou signaler explicitement dans un champ dédié l’activité source supprimée. Les valeurs attendues, extraites, le nombre de TP cloud et `exerciseCount` doivent être cohérents entre le JSON, l’alignement et les notes de production.

## Verdict

**Statut de preuve :** partiellement étayé. La structure et la suppression de 3.9 sont documentées par des preuves locales ; les insuffisances de guidage sont observées directement dans le JSON. **Gravité : moyenne**, car la progression et les interactions standards sont présentes, mais certains TP ne sont pas autonomes lorsque leur énoncé exige des fichiers absents. **Préparation pratique : nécessite un guidage de l’environnement apprenant.**

## Références

[1]: `client/public/data/courses/ai_for_consulting__01.json` "Cours publié ai_for_consulting__01"
[2]: `docs/datacamp_ai_for_consulting_alignment_2026-08-28.json` "Alignement local du cours AI for Consulting"
[3]: `docs/datacamp_ai_for_consulting_source_notes_2026-08-28.md` "Notes de source et décisions d’adaptation"
[4]: `docs/datacamp_ai_for_consulting_import_notes_2026-08-24.md` "Notes d’import locales"
[5]: `scripts/adapt-ai-for-consulting.mjs` "Script local d’adaptation du cours"
[6]: `docs/datacamp_ai_for_consulting_verification_2026-08-24.md` "Vérification locale de publication"

Sources citées : [1] [2] [3] [4] [5] [6]
