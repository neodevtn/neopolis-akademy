# Revue de contenu — `software_development_with_github_copilot__01`

## Conclusion

Le cours est **structurellement aligné** avec les preuves locales : 4 chapitres et 40 activités sont présents, sans activité manquante ni TP cloud attendu par la source. Les modalités importées sont cohérentes avec le manifeste local : vidéos Projector, QCM, exercices visuels et tris interactifs. Le principal défaut observable n’est donc pas une reprise inexacte, mais un **guidage insuffisant pour pratiquer dans l’environnement propre de l’apprenant**.

## Constats étayés

### Reprise et séquence

Le JSON annonce 4 chapitres, 40 activités et la ventilation 13 vidéos, 8 QCM, 6 exercices visuels et 13 tris [1]. L’alignement local confirme 40 activités source et 40 activités Neopolis, aucune activité manquante, aucune suppression volontaire et aucun `CloudExercise` [2]. Les notes de source confirment le même manifeste : 40 activités, dont 13 vidéos Projector, 13 tris, 6 exercices visuels et 8 QCM, sans `CloudExercise` ni réponse libre à adapter [3]. Aucun écart factuel de structure ou de séquence n’est donc démontré par les preuves disponibles.

La correspondance des types est cohérente dans l’alignement : les vidéos sont des blocs `video`, les QCM des blocs de choix et les activités de tri des `bucket_sort` [2]. Le contrôle de production confirme 40 activités, 27 exercices interactifs, 13 vidéos et 4 téléchargements [4]. Les trois Projector contrôlés ont rendu audio et commandes de slides depuis les actifs locaux [4] ; la matrice QA confirme également leur rendu et l’absence de référence fournisseur visible dans les trois cas testés [5].

### Dépendances, téléchargements et installation

Les quatre téléchargements du JSON sont les PDF de slides des chapitres 1 à 4, servis par des chemins `/api/assets/` locaux [1]. Le bloc « Avant de commencer » demande seulement de préparer un chatbot IA autorisé et de ne pas partager de données sensibles, mots de passe ou clés API [1]. Il ne fournit pas de procédure pour installer ou configurer Visual Studio Code, activer GitHub Copilot, ouvrir un dépôt, vérifier l’accès à GitHub, configurer le mode Agent ou installer/configurer le serveur MCP GitHub, alors que les activités mentionnent directement ces usages dans leurs scénarios [1]. Cette absence est un défaut de guidage observable dans le JSON, non une preuve que l’import source serait incorrect.

Les notes locales signalent deux URL textuelles (`https://example.com` et `https://api.example.com/docs`) dans des exemples pédagogiques et des propositions de QCM. Elles précisent qu’il ne s’agit ni de médias chargés ni d’une dépendance de laboratoire [3]. Il ne faut donc pas les rapporter comme dépendances externes opérationnelles. Les preuves locales indiquent aussi qu’aucun lien ou appel fournisseur opérationnel n’a été détecté dans les rendus contrôlés [4].

### Présentation et guidage

La présentation est globalement cohérente avec le format importé : activités séquentielles et médias Projector locaux [4]. En revanche, le contenu d’environnement est réduit à un avertissement général [1]. Les interactions sont principalement des QCM, choix multiples et tris ; elles demandent de reconnaître, classer ou ordonner des approches, sans fournir dans le JSON un espace de travail, un dépôt de départ, une commande de vérification, un résultat attendu dans l’environnement de l’apprenant ou une procédure de retour arrière [1]. Cette limite est particulièrement visible pour les thèmes qui supposent une pratique locale — VS Code, tests, sécurité, performance et MCP — mais elle ne doit pas être requalifiée en TP manquant : la preuve source dit explicitement qu’il n’existe aucun `CloudExercise` à adapter [3].

## Correctifs génériques réutilisables

1. Ajouter un bloc standard **Préparation de l’environnement** indiquant les prérequis, les comptes autorisés, l’éditeur attendu, l’accès au dépôt de démonstration et une commande ou action de vérification, sans imposer de fournisseur lorsque le bloc n’en dépend pas.
2. Ajouter un bloc standard **Mise en pratique guidée** avec objectif, contexte de départ, étapes numérotées, exemple de commande ou d’invite, résultat attendu et critères de réussite. Pour les scénarios Copilot, prévoir une variante « environnement personnel » et une variante « environnement institutionnel ».
3. Ajouter un bloc standard **Sécurité et données** rappelant les données interdites, la gestion des secrets, la validation humaine des suggestions et la conduite à tenir en cas d’accès absent ou de résultat inattendu.
4. Pour chaque activité qui présuppose un outil externe, afficher un encart standard **Dépendance facultative / alternative sans installation**. Il doit préciser ce qui peut être observé dans l’activité interactive et ce qui nécessite réellement VS Code, GitHub ou MCP.
5. Ajouter un bloc standard **Vérification et clôture** : test ou observation à effectuer, preuve à conserver, nettoyage des fichiers/secrets et retour à un état sûr. Ces blocs peuvent être réutilisés sans transformer les exercices déterministes importés en TP cloud.

## Références

[1]: /home/ubuntu/neopolis-akademy/client/public/data/courses/software_development_with_github_copilot__01.json "Cours Neopolis importé — Développement logiciel avec GitHub Copilot"
[2]: /home/ubuntu/neopolis-akademy/docs/datacamp_software_development_with_github_copilot_alignment_2026-08-28.json "Alignement local du cours GitHub Copilot"
[3]: /home/ubuntu/neopolis-akademy/docs/datacamp_github_copilot_source_notes_2026-08-28.md "Notes de source locales — Développement logiciel avec GitHub Copilot"
[4]: /home/ubuntu/neopolis-akademy/docs/datacamp_github_copilot_production_check_2026-08-28.md "Contrôle de production local — Développement logiciel avec GitHub Copilot"
[5]: /home/ubuntu/neopolis-akademy/docs/software_development_with_github_copilot__01_projector_matrix_qa_2026-08-28.json "Matrice QA locale des Projector — cours GitHub Copilot"

*Revue autonome fondée exclusivement sur les fichiers locaux cités ; aucune source DataCamp web ni navigateur n’a été utilisée.*
