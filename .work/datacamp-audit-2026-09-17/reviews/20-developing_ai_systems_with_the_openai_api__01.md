# Revue de contenu — `developing_ai_systems_with_the_openai_api__01`

## Conclusion

La revue est **à preuves locales partielles**. Le dépôt ne contient pas de manifeste, d’alignement ou de notes de source portant exactement sur `developing_ai_systems_with_the_openai_api__01`. Il est donc impossible d’établir factuellement une reprise pédagogique inexacte, une activité manquante ou une divergence de séquence par rapport à la source DataCamp. Les constats ci-dessous sont soit observables directement dans le JSON du cours, soit explicitement limités par cette absence de preuve.

Le cours est **praticable seulement après ajout d’un guidage de configuration et de validation dans l’environnement de l’apprenant**. Le risque principal n’est pas une incohérence de structure démontrée par preuve source, mais le fait que les TP supposent un accès OpenAI opérationnel sans expliquer assez clairement comment préparer, sécuriser et vérifier cet environnement.

## Constats étayés

Le JSON déclare trois chapitres, trente-six activités et onze vidéos, avec dix-sept blocs `code_repl`, cinq activités de quiz, deux activités de tri et trois téléchargements de diapositives. Les trente-six activités sont toutes marquées `requiredBeforeAdvance: true`. Cette structure est cohérente en elle-même, mais sa parité avec la source ne peut pas être confirmée localement pour ce cours. [1]

Les dix-sept TP Python utilisent un client OpenAI et le jeton littéral `<OPENAI_API_TOKEN>` dans le code de départ. Le JSON ne fournit pas, dans ces blocs, de procédure d’installation du paquet Python, de création ou de chargement d’une variable d’environnement, de vérification préalable de la clé, de contrôle des coûts ou de comportement attendu lorsque l’appel réseau échoue. Ce sont des insuffisances de guidage directement observables, et non des divergences imputées à DataCamp. [1]

Les champs `expectedOutput` des dix-sept blocs `code_repl` sont vides. Les consignes et les indices existent, mais le JSON n’expose pas de résultat attendu concret permettant à l’apprenant de distinguer une réponse valide d’une sortie simplement plausible. Cette limite est particulièrement sensible pour les TP de format JSON, de génération de contenu, de modération, de protections et d’identification utilisateur. [1]

Au moins huit starters de TP référencent `messages` sans le définir dans le code de départ (`dc_1_act_09_code`, `dc_2_act_05_code`, `dc_2_act_06_code`, `dc_2_act_07_code`, `dc_2_act_09_code`, `dc_2_act_11_code`, `dc_2_act_13_code` et `dc_3_act_03_code`). Pour un apprenant exécutant ces blocs dans son propre environnement, cette dépendance implicite peut provoquer une erreur avant l’apprentissage visé, sauf si le moteur fournit un contexte non visible dans le JSON. [1]

Les téléchargements sont des PDF locaux `/api/assets/...`, et les vidéos disposent d’audio, de sous-titres et de diapositives locales. Aucune dépendance externe n’est démontrée par les URLs d’actifs du JSON. En revanche, l’appel à l’API OpenAI est une dépendance réseau et de compte déduite directement des starters ; le JSON ne documente pas ses prérequis. [1]

Les notes locales autorisées concernent le cours différent `working_with_the_openai_api__01`. Elles indiquent, pour ce cours seulement, vingt-neuf activités, vingt activités interactives, neuf vidéos et des URLs présentes dans les transcriptions source, notamment DataLab, tokenizer OpenAI et pricing. Elles ne constituent pas une preuve de la structure ou des dépendances du cours audité et ne doivent pas être utilisées pour déclarer une non-conformité de celui-ci. [2] [3]

## Incohérences ou reprises inexactes

Aucune reprise pédagogique inexacte, activité manquante, activité ajoutée, divergence de titre ou divergence de séquence n’est retenue comme défaut factuel : la preuve locale exacte requise n’est pas disponible. Le script d’import confirme seulement le mécanisme générique de conversion d’un manifeste local vers un JSON Neopolis ; il ne fournit pas le manifeste source de ce cours. [4]

## Correctifs génériques réutilisables

1. Ajouter un bloc standard **Préparer l’environnement** avant le premier TP : version Python, installation du SDK, configuration de la clé via variable d’environnement, interdiction de l’inscrire en clair et commande de test non destructive.
2. Ajouter un bloc standard **Vérifier avant d’exécuter** : import du SDK, présence de la variable, modèle configurable, connexion et message d’erreur lisible en cas d’échec.
3. Remplacer les dépendances implicites par un starter autonome : définir toutes les variables utilisées, notamment `messages`, ou fournir un bloc de contexte explicitement documenté.
4. Ajouter à chaque TP un **critère de réussite observable** : exemple de forme de sortie, invariants vérifiables, résultat JSON minimal ou assertion locale. Ne pas imposer une sortie textuelle exacte lorsque l’API est non déterministe.
5. Ajouter un encadré standard **Coût, confidentialité et limites** pour les appels réseau : volume réduit, données fictives, absence de secrets dans les prompts et rappel que les réponses peuvent varier.
6. Prévoir un chemin **sans appel réseau** pour les activités qui évaluent uniquement la construction de messages ou le décodage d’une réponse, au moyen d’une réponse JSON d’exemple fournie localement.

## Sources locales

[1]: `/home/ubuntu/neopolis-akademy/client/public/data/courses/developing_ai_systems_with_the_openai_api__01.json` "JSON du cours audité"

[2]: `/home/ubuntu/neopolis-akademy/docs/datacamp_working_with_openai_api_source_notes_2026-08-28.md` "Notes de source locales d’un cours OpenAI différent"

[3]: `/home/ubuntu/neopolis-akademy/docs/datacamp_working_with_the_openai_api_alignment_2026-08-28.json` "Alignement local d’un cours OpenAI différent"

[4]: `/home/ubuntu/neopolis-akademy/scripts/import-datacamp-course.mjs` "Script générique d’import DataCamp local"

> Aucun fichier de cours n’a été modifié.
