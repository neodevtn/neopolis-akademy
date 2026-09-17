# Revue de contenu — `innovating_with_google_cloud_ai__01`

## Conclusion

Le paquet est **structurellement aligné** avec les preuves locales : 4 chapitres et 23 activités attendus sont présents, dans l’ordre, sans omission. Les 11 activités visuelles et les 12 QCM sont bien représentées par des blocs Neopolis. En revanche, la préparation à la pratique est **insuffisante pour un apprenant qui doit travailler dans son propre environnement**. Le JSON ne contient ni TP cloud ni activité d’exécution : l’audit local déclare `cloudExercises: 0`, `runtimeExercises: 0` et `externalLab: 0` [2]. Il s’agit donc d’un cours de découverte et d’évaluation, pas d’un parcours pratique Google Cloud exécutable.

## Constats étayés par les fichiers locaux

### Reprise pédagogique et séquence

La parité quantitative est bonne : la preuve d’alignement indique 23 activités source et 23 activités Neopolis, sans activité manquante ni suppression intentionnelle [2]. Les quatre parties sont couvertes par 11 exercices visuels et 12 QCM, conformément aux notes de source [3]. Le JSON conserve une progression allant des fondamentaux de l’IA et du machine learning vers les solutions Google Cloud, puis vers le résumé et le guide d’étude [1]. Aucune inexactitude de séquence ne peut être établie à partir des preuves locales disponibles.

Les activités visuelles sont importées comme ressources (`type: "resource"`) et les QCM comme quiz (`type: "quiz"`), avec des blocs `single_choice_exercise` pour les questions [1] [2]. Les QCM disposent d’une réponse correcte, d’une explication et d’indices ; leur modalité interactive est donc explicitement représentée. Les preuves locales ne fournissent toutefois pas de grille de correction détaillée ni de critère de réussite par compétence : l’alignement note `explicitRubric: false` pour chaque activité [2]. Ce point limite l’évaluation formative, mais ne prouve pas une erreur de contenu source.

### Présentation et cohérence

Le principal défaut observable est la présentation des activités visuelles. Pour la plupart, le corps affiché se réduit à **« Consultez le contenu avant de continuer. »** [1]. Le premier bloc ajoute la même consigne de préparation générale et demande seulement de préparer un chatbot autorisé, sans préciser un objectif, une procédure, une production attendue ou un critère de vérification [1]. Le guide final indique **« Consultez le PDF avant de continuer. »**, ce qui introduit une modalité différente sans préciser où trouver le PDF [1].

La cohérence des descriptions est également perfectible : dans le JSON, les activités du premier ensemble répètent la description générale du module, y compris pour les QCM, au lieu de décrire l’objectif propre de chaque activité [1]. Les titres alternent par ailleurs entre « AI », « intelligence artificielle » et « Artificial Intelligence » [1]. Ces observations sont des incohérences de présentation du JSON ; elles ne permettent pas, à elles seules, de conclure à une erreur factuelle sur Google Cloud.

### TP, environnement apprenant, dépendances et téléchargements

Aucun TP nécessitant un compte Google Cloud, un projet, une API, une commande, un jeu de données ou une installation n’est déclaré dans les preuves d’import. Les notes d’import précisent que le paquet ne contient aucune activité cloud ou DataLab et que les contenus Evolve ont été archivés localement ; les URLs fournisseur ne doivent pas être utilisées dans le cours publié [3] [4]. La preuve d’alignement confirme zéro URL externe, zéro média externe, zéro HTML brut et zéro exercice runtime [2].

La consigne de sécurité sur les données sensibles et les clés API est utile, mais elle ne constitue pas un guide d’environnement [1]. L’apprenant n’est pas guidé pour créer un projet de test, activer un service, choisir une région, contrôler les coûts, obtenir un résultat vérifiable ou nettoyer ses ressources. Comme aucun TP exécutable n’est présent, la pratique autonome est **non prête sans ajout d’un bloc de guidage**. Ce constat porte sur l’expérience apprenant observée directement dans le JSON ; il ne prétend pas qu’une installation manquante est requise par le paquet source.

## Correctifs génériques réutilisables par blocs Neopolis

1. Remplacer chaque consigne visuelle générique par un bloc standard « objectif–action–preuve » : objectif d’apprentissage, action attendue, résultat à observer et condition de passage.
2. Ajouter, avant tout TP optionnel, un bloc standard « préparation de l’environnement » avec prérequis, compte ou outil requis, emplacement de travail, données fictives autorisées, contrôle des coûts et consigne de nettoyage.
3. Pour les activités sans exécution cloud, ajouter un bloc standard « simulation guidée » : scénario, étapes dans un environnement autorisé, sortie attendue et solution expliquée. Ne pas ajouter d’URL fournisseur dans le JSON si la preuve locale impose des ressources internes.
4. Ajouter un bloc standard « vérification formative » après chaque séquence visuelle : une question de transfert, un cas métier et un feedback explicatif. Lorsque la progression dépend d’une production, définir un rubric minimal local plutôt que de laisser `explicitRubric` absent.
5. Harmoniser les métadonnées avec un gabarit de titre et de description par activité ; réserver la description de module au niveau du module et décrire séparément chaque ressource, QCM, résumé et guide d’étude.
6. Pour le guide final, utiliser le composant standard de ressource téléchargeable ou une instruction locale explicite indiquant le nom du fichier et son emplacement. Ne pas supposer que l’apprenant sait où trouver un PDF.

## Périmètre et limites

Cette revue s’appuie uniquement sur le JSON du cours et les preuves locales autorisées. Les fichiers de preuve établissent la parité d’import et les modalités déclarées ; ils ne constituent pas une validation indépendante de l’exactitude de chaque affirmation métier ou de chaque réponse de QCM. Aucun défaut factuel de ce type n’est donc retenu ici.

## Sources locales

[1]: `client/public/data/courses/innovating_with_google_cloud_ai__01.json` "JSON du cours audité"
[2]: `docs/datacamp_innovating_with_google_cloud_ai_alignment_2026-08-28.json` "Preuve locale d’alignement"
[3]: `docs/datacamp_innovating_with_google_cloud_ai_source_notes_2026-08-28.md` "Notes locales de source"
[4]: `docs/datacamp_google_cloud_ai_import_notes_2026-08-24.md` "Notes locales d’import"

> Aucun document de cours n’a été modifié.
