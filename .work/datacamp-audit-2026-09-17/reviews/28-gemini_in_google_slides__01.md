# Revue de contenu — `gemini_in_google_slides__01`

## Conclusion

Le paquet est **structurellement aligné avec les preuves locales disponibles**, mais il n’est pas prêt pour une pratique autonome. Le JSON contient bien 8 activités, 4 vidéos et 4 éléments interactifs, conformément à l’audit d’import local [1] et au manifeste de catalogue [2]. En revanche, aucun bloc ne permet à l’apprenant de réaliser puis de faire vérifier une tâche dans son propre environnement Google Slides : l’activité annoncée comme pratique est une vidéo, suivie d’une consultation de PDF et de trois QCM.

## Constats étayés

### Structure et séquence

La séquence est verrouillée activité par activité (`requiredBeforeAdvance: true`) et suit quatre vidéos d’enseignement, une vidéo « Activity Explained », un `resource_review` et trois `single_choice_exercise`. Cette composition correspond aux comptes rendus locaux : 8 activités, 4 vidéos et 4 exercices interactifs [1]. Le manifeste associé annonce également 8 activités, 4 exercices et 4 vidéos [2]. Aucun écart structurel factuel n’est donc retenu.

La preuve locale ne documente pas de reprise pédagogique détaillée permettant de contrôler la fidélité de chaque étape au support DataCamp. Il n’est donc pas possible d’affirmer une inexactitude de séquence ou de contenu source au-delà des observations directes du JSON.

### Présentation et localisation

Le cours déclare `sourceLanguage: "fr-FR"`, mais les titres, descriptions, instructions, questions, options, explications et indices sont très largement en anglais dans les champs `fr`. Par exemple, les activités portent encore les titres « Generate an Image », « Choose a Style for Your Images » et « Quiz Question 1 », tandis que la description répétée est « Learn about the key features of Gemini in Google Slides. » [3]. Il s’agit d’une incohérence de présentation et de localisation observable directement dans le fichier, et non d’une inférence sur la source externe.

Les quatre vidéos disposent de médias locaux déclarés (`mp4Url`, audio, HLS et sous-titres lorsqu’ils existent) et l’audit local signale 23 médias locaux valides, sans erreur média [1]. Le PDF est également référencé par un chemin local d’API dans le bloc de téléchargement et dans le bloc `resource_review` [3]. Aucun défaut de téléchargement ou de média n’est retenu.

### TP, environnement et dépendances

Le transcript de l’activité 4 annonce « Now it's your turn » et une présentation de démonstration pour Cymbal Retail, mais l’activité suivante ne fournit qu’un `resource_review` demandant « View the PDF before continuing » [3]. Il n’y a dans le JSON ni `cloud_exercise`, ni champ de tâche à réaliser, ni zone de réponse, ni critères de réussite, ni correction ou évaluation. Les trois activités restantes sont des QCM. Le manque de guidage pratique est donc directement observable, même si le rapport d’import classe ces blocs comme quatre exercices interactifs [1].

Les vidéos demandent d’ouvrir `slides.google.com` et signalent que certaines fonctionnalités peuvent dépendre de l’édition Google Workspace ou de politiques administratives [3]. Le cours ne fournit toutefois pas de prérequis opératoires : vérification de l’accès à Google Slides et à Gemini, procédure de création ou d’ouverture d’une présentation de travail, solution de repli si Gemini est indisponible, consignes de confidentialité, ni résultat attendu à remettre. La dépendance à un compte et à une édition/politique Workspace est donc explicitement présente dans le contenu, tandis que le guidage pour la gérer est absent du JSON.

## Niveau de gravité et readiness

**Gravité : moyenne.** Le cours est consultable et ses médias sont localement disponibles, mais son objectif pratique annoncé n’est pas réellement exécutable ni vérifiable par un apprenant dans son propre environnement.

**Readiness pratique : needs-learner-environment-guidance.** Le cours peut servir de démonstration et de contrôle déclaratif, mais il ne constitue pas encore un TP autonome.

## Correctifs génériques réutilisables

1. Remplacer ou compléter tout bloc « activité expliquée » par le bloc standard de TP autonome : objectif, contexte, prérequis, étapes numérotées, livrable attendu, critères de réussite et feedback.
2. Ajouter un bloc standard « préparer son environnement » pour les outils externes : accès requis, vérification avant démarrage, limites de compte/édition, solution de repli et rappel de ne jamais transmettre de données confidentielles.
3. Ajouter un bloc standard de preuve de réalisation, avec une réponse textuelle ou un artefact à décrire, puis une auto-évaluation guidée par critères ; ne pas compter un PDF consulté ou un QCM comme équivalent à une pratique outillée.
4. Appliquer une passe standard de localisation sur tous les champs `fr`, avec contrôle des titres, descriptions, consignes, options, explications et indices avant publication.

## Références locales

[1]: file:///home/ubuntu/neopolis-akademy/docs/gemini_slides_import_audit.json "Audit local d’import Gemini dans Google Slides"
[2]: file:///home/ubuntu/neopolis-akademy/docs/training-visual-manifest.json "Manifeste visuel de formation — entrée Gemini dans Google Slides"
[3]: file:///home/ubuntu/neopolis-akademy/client/public/data/courses/gemini_in_google_slides__01.json "JSON du cours Gemini in Google Slides"

Rapport produit sans consultation de DataCamp sur le web et sans modification du fichier de cours.
