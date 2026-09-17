# Revue de contenu — `introduction_to_generative_ai_in_snowflake__01`

## Conclusion

Le périmètre publié est **cohérent avec les preuves locales d’adaptation**, mais il n’est pas prêt pour une mise en pratique autonome. Le cours conserve sept vidéos et aucun exercice interactif ; les treize `CloudExercise` du paquet source ont été retirés parce qu’ils n’étaient pas reproductibles dans l’évaluation libre de Neopolis. Cette décision est documentée localement, mais elle laisse l’apprenant sans TP guidé dans son propre environnement Snowflake. [1] [2] [3]

**Sévérité proposée : élevée** pour la pratique, sans conclure à une erreur de couverture source. **État de preuve : source-aligned** : les métriques et les suppressions sont explicitement tracées dans les documents locaux.

## Constats factuels

### 1. Les activités interactives et les TP sont absents du parcours publié

Le JSON contient deux leçons et sept chapitres conservés, tous de type vidéo (`VideoExercise` côté source et `teaching` côté Neopolis). Il ne contient aucun bloc d’exercice interactif. La production confirme donc **0 exercice interactif, 7 leçons vidéo et 2 téléchargements**. [1] [2]

Le bloc d’introduction affirme pourtant que le cours « se réalise directement dans Neopolis avec des activités interactives ». Cette présentation est contredite par la structure observable du même JSON : le parcours publié ne propose que des vidéos et deux PDF de diapositives. [1]

L’alignement local établit que les 13 `CloudExercise` source ont été intentionnellement retirés (`removed_non_reproducible`) et que les 13 exercices runtime correspondants n’ont pas été remplacés par un mécanisme local d’évaluation ou par un guidage de TP. [2] Les notes source précisent également qu’aucun exercice libre ne devait être inventé. [3]

### 2. Le guidage vers l’environnement apprenant est insuffisant

Le seul bloc préparatoire demande de préparer « un chatbot IA autorisé par [l’]organisation » et de ne pas transmettre de données sensibles. Il ne donne pas de procédure pour disposer d’un compte Snowflake, créer ou ouvrir un notebook, sélectionner une base, un schéma et un entrepôt, charger les données d’avis, vérifier les droits Cortex, ni diagnostiquer un échec de configuration. [1]

Cette insuffisance est directement observable dans le JSON. Elle est particulièrement importante puisque les vidéos décrivent des opérations concrètes dans Snowflake, dont la création d’un notebook, l’interrogation d’une table d’avis et l’usage de Python et SQL, alors que les activités pratiques source ont été retirées. [1] [2]

Les consignes de pratique restent génériques : plusieurs vidéos se terminent par « À vous de pratiquer » ou une formulation équivalente, sans objectif mesurable, données d’entrée, étapes à exécuter, résultat attendu, critère de réussite ou solution de secours. La vidéo finale recommande seulement de mettre en pratique les acquis dans son environnement Snowflake. [1]

### 3. Une instruction de configuration et un exemple de code sont présentés de façon incohérente

Dans la vidéo d’introduction, l’instruction demande de saisir `snowlfake-ml-python` dans le panneau **Packages**, alors que le reste du contenu utilise le module `snowflake.cortex`. Le JSON documente bien ces deux chaînes ; il ne fournit aucune note expliquant cette différence. Cette consigne doit donc être vérifiée avant réutilisation. [1]

La diapositive « Générer une réponse » expose un extrait qui s’arrête à `response = complete(prompt=prompt,` sans appel complet ni fermeture visible. Le bloc suivant présente une autre variante également interrompue après `model='llama3.1-8b',`. Il s’agit d’un défaut de présentation directement observable, susceptible d’empêcher la copie ou la compréhension du code. [1]

### 4. Présentation française incohérente des téléchargements

Les deux blocs de téléchargement sont localisés avec un titre et une description en anglais : `Chapter 1 slides` et `Official course slides provided for this course`, puis `Chapter 2 slides` avec la même description. Le reste des métadonnées et des vidéos est majoritairement en français. Cette incohérence n’empêche pas l’accès aux PDF, mais dégrade la présentation du parcours francophone. [1]

### 5. Dépendances externes et téléchargements

Les preuves locales indiquent **aucun média externe visible**, aucune application embarquée fournisseur, aucun laboratoire externe et aucune URL externe restante dans les métriques d’alignement. [2] Les seules ressources téléchargeables dans le JSON sont les deux PDF servis par des chemins locaux `/api/assets/...`. [1] Les notes source signalent qu’une URL externe présente dans une slide de récapitulatif devait être supprimée lors de l’adaptation ; elles ne justifient pas de signaler une dépendance externe encore active dans le JSON publié. [3]

## Correctifs génériques réutilisables

1. Remplacer le bloc d’introduction standard par une **fiche de préparation d’environnement** : prérequis de compte et droits, création du notebook, choix base/schéma/entrepôt, données de départ, vérification Cortex et procédure de dépannage.
2. Pour chaque TP retiré, utiliser le bloc Neopolis standard **Pratique guidée** avec objectif, contexte, données ou texte d’entrée, étapes numérotées, emplacement d’exécution, résultat attendu, critère de réussite et indice progressif. Si l’exécution Snowflake n’est pas disponible, fournir une variante locale explicitement bornée et une activité de vérification non trompeuse.
3. Ajouter un **contrôle de fin de vidéo** qui transforme chaque « À vous de pratiquer » en tâche observable : livrable, test minimal et correction ou exemple de référence.
4. Utiliser le bloc standard **Code vérifié** pour éviter les extraits tronqués et contrôler les noms de paquets, fonctions, paramètres, délimiteurs et sorties avant publication.
5. Utiliser le bloc standard de **localisation des téléchargements** afin que titres, descriptions et noms de fichiers suivent la langue du cours, sans modifier les chemins d’assets.
6. Conserver une **fiche de sécurité et de gouvernance** pour les clés, données sensibles, coûts et droits, mais la compléter par les prérequis opérationnels propres à Snowflake ; le rappel sécurité seul ne constitue pas un guidage de TP.

## Sources locales

[1]: /home/ubuntu/neopolis-akademy/client/public/data/courses/introduction_to_generative_ai_in_snowflake__01.json "JSON du cours publié"
[2]: /home/ubuntu/neopolis-akademy/docs/datacamp_introduction_to_generative_ai_in_snowflake_alignment_2026-08-28.json "Preuve locale d’alignement DataCamp–Neopolis"
[3]: /home/ubuntu/neopolis-akademy/docs/datacamp_snowflake_source_notes_2026-08-28.md "Notes locales de source Snowflake"
[4]: /home/ubuntu/neopolis-akademy/docs/datacamp_introduction_to_generative_ai_in_snowflake_production_2026-08-28.md "Contrôle local de production Snowflake"

> Aucun document de cours n’a été modifié. La revue s’appuie exclusivement sur les fichiers locaux autorisés.
