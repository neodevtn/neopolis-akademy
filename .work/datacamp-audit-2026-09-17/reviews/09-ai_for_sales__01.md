# Revue de contenu — `ai_for_sales__01`

## Conclusion

Le cours est **structurellement aligné** avec les preuves locales disponibles : trois chapitres, 26 activités dans la source, 22 activités conservées après quatre retraits documentés, neuf vidéos, treize TP de type `CloudExercise`, deux QCM et deux tris. Les contrôles locaux indiquent une conversion valide, des médias locaux valides et aucun téléchargement ou laboratoire externe déclaré [1] [2] [3].

Le défaut principal est toutefois pédagogique : les neuf TP conservés ont un champ `instructions` vide, aucune étape (`steps: []`) et aucune ressource (`resources: []`) dans le JSON du cours. Ils reposent donc presque entièrement sur un énoncé, un indice et une rubrique d’évaluation. Cela ne constitue pas une reprise inexacte de la séquence, mais laisse l’apprenant sans procédure suffisamment opératoire pour travailler dans son propre assistant IA.

## Constats étayés par les fichiers locaux

### 1. Séquence et périmètre : alignement global, retraits explicitement justifiés

Le manifeste d’alignement recense 26 activités source et 22 activités Neopolis, avec quatre activités retirées : `dc_ch01_act03`, `dc_ch01_act06`, `dc_ch02_act05` et `dc_ch02_act06`. Ces retraits sont classés `removed_non_reproducible`. Les notes de source précisent que les activités 1.3, 1.6, 2.5 et 2.6 ne disposent pas de rubrique explicite ; elles indiquent en outre que 2.5 et 2.6 dépendent de documents externes non déclarés dans les ressources locales [2] [3]. Rien ne permet donc de qualifier ces retraits d’erreur factuelle.

Le JSON livré confirme trois chapitres et 22 activités conservées, dans l’ordre attendu. La matrice d’alignement ne signale aucune activité manquante parmi celles destinées à être conservées, aucun laboratoire externe et aucun média externe [1].

### 2. Présentation et interactions : contrôles positifs, avec réserve de guidage

Les preuves locales confirment la présence des écrans de titre, de progression, de préparation, du lecteur Projector et du verrouillage séquentiel. Les contrôles de production indiquent 44 médias consommés et locaux valides, sans URL DataCamp externe, chemin `/manus-storage/`, média invalide ou erreur structurelle. Le manifeste associé déclare zéro téléchargement [2].

Le contrôle ciblé d’un TP confirme que la rubrique et le champ de réponse sont visibles, que la soumission est bloquée avant réponse, que la solution est masquée avant réponse et que l’activité suivante reste verrouillée avant évaluation [4]. La présentation interactive est donc cohérente sur le plan fonctionnel. Le bandeau de consentement de prévisualisation peut néanmoins couvrir la partie basse d’un écran mobile ; les notes locales le présentent comme une limite de prévisualisation, non comme un défaut du cours [2].

### 3. TP : insuffisance directement observable du guidage apprenant

Dans le JSON, chacun des neuf TP à rubrique explicite possède `instructions: ""`, `steps: []` et `resources: []`. Leur `environmentGuide` se limite à recommander un assistant IA auquel l’apprenant a accès et à interdire les clés API ou données confidentielles. Les rubriques sont présentes et bloquent correctement la progression, mais elles évaluent le contenu de la réponse ; elles ne remplacent pas une procédure de réalisation.

Cette insuffisance est particulièrement sensible pour les tâches qui demandent de produire deux invites, d’examiner des prospects ou des comptes, d’utiliser des recherches LinkedIn, de résumer un site concurrent, d’analyser des appels, de créer un agent ou de configurer un balisage de métadonnées. Le JSON donne un contexte et un indice, mais ne fournit pas de données d’exercice locales, de format de saisie, de séquence « préparer → exécuter → vérifier », ni de méthode de validation avant soumission. L’apprenant doit donc choisir lui-même son environnement, ses données fictives et sa méthode de contrôle.

Le script d’adaptation explique ce choix : il remplace les mentions de Microsoft Copilot par « un assistant IA génératif de votre choix », injecte le même avertissement de confidentialité dans chaque TP et génère les rubriques depuis les éléments requis du manifeste source [5]. Cette transformation réduit les dépendances à un produit particulier, mais elle ne crée pas de parcours opératoire. Le manifeste d’enregistrement déclare d’ailleurs zéro téléchargement [6].

## Niveau de risque et aptitude à la pratique

**Sévérité : moyenne.** Aucun défaut local ne démontre une rupture de séquence, une ressource externe cassée ou une dépendance d’installation non satisfaite. En revanche, le guidage actuel est insuffisant pour garantir une pratique autonome et reproductible, surtout pour les TP d’agent, de recherche et d’analyse de transcription.

**Aptitude à la pratique : nécessite un guidage de l’environnement apprenant.** Le cours est utilisable si l’apprenant sait déjà choisir un assistant IA, fabriquer des données non sensibles, obtenir les sorties attendues et les comparer à une rubrique. Cette autonomie préalable n’est pas fournie par le JSON.

## Correctifs génériques réutilisables par blocs Neopolis

1. Ajouter au bloc standard `cloud_exercise` un mini-parcours en trois étapes : **préparer** un jeu de données fictif ou anonymisé, **exécuter** l’invite dans un assistant autorisé, puis **vérifier** la sortie contre une checklist avant soumission.
2. Ajouter un bloc standard « Environnement apprenant » avec variantes **assistant conversationnel**, **agent**, **recherche web** et **analyse de transcription**, sans imposer un fournisseur ; préciser les prérequis, les limites de confidentialité et l’absence de clé API.
3. Ajouter un bloc standard « Données de départ » proposant un scénario neutre, un exemple de saisie et un format de sortie attendu lorsque le TP dépend d’un prospect, d’un site, d’un appel ou d’une persona.
4. Ajouter un bloc standard « Exemple minimal puis défi » : une démonstration courte, suivie d’une tâche analogue avec données fictives et critères de réussite visibles.
5. Compléter l’indice existant par un gabarit de prompt réutilisable : **objectif**, **contexte**, **contraintes**, **format de sortie**, **règle de vérification**. Conserver la rubrique comme contrôle final, et non comme unique mode de guidage.

## Références locales

[1]: `/home/ubuntu/neopolis-akademy/docs/datacamp_ai_for_sales_alignment_2026-08-28.json` "Matrice locale d’alignement DataCamp — L’IA pour les ventes"
[2]: `/home/ubuntu/neopolis-akademy/docs/datacamp_ai_for_sales_import_notes_2026-08-24.md` "Notes locales d’import et de vérification de production"
[3]: `/home/ubuntu/neopolis-akademy/docs/datacamp_ai_for_sales_source_notes_2026-08-28.md` "Notes locales de source et de reproductibilité"
[4]: `/home/ubuntu/neopolis-akademy/docs/ai_for_sales__01_cloud_exercise_qa_2026-08-28.json` "Contrôle local d’un bloc CloudExercise"
[5]: `/home/ubuntu/neopolis-akademy/scripts/adapt-ai-for-sales.mjs` "Script local d’adaptation du cours sales"
[6]: `/home/ubuntu/neopolis-akademy/scripts/register-ai-for-sales.mjs` "Manifeste local d’enregistrement et de comptage"
[7]: `/home/ubuntu/neopolis-akademy/client/public/data/courses/ai_for_sales__01.json` "JSON local du cours audité"

*Audit autonome sur preuves locales uniquement ; aucune consultation DataCamp web et aucune modification du fichier de cours.*
