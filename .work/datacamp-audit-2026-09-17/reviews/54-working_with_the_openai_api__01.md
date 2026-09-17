# Revue de contenu — `working_with_the_openai_api__01`

## Conclusion

Le cours est **structurellement aligné** avec la preuve locale : les 29 activités source sont présentes dans Neopolis, dans le même ordre apparent et avec les mêmes titres. La preuve d’alignement ne signale aucune activité manquante, aucune suppression intentionnelle, aucun lab externe, aucun média externe et aucun exercice d’exécution runtime ([`docs/datacamp_working_with_the_openai_api_alignment_2026-08-28.json`](../../../docs/datacamp_working_with_the_openai_api_alignment_2026-08-28.json)).

La faiblesse principale est **pédagogique et directement observable dans le JSON** : les TP de code demandent à l’apprenant d’utiliser l’API OpenAI, mais le format de bloc ne fournit pas de guide d’environnement autonome ni de critère de réussite observable. Le cours est donc exploitable comme séquence importée, mais il ne guide pas suffisamment une pratique dans l’environnement personnel de l’apprenant.

## Constats étayés

### 1. Structure et séquence

Le JSON contient 29 chapitres : 9 activités `teaching` avec un bloc vidéo et 20 activités `exercise`. Les activités sont découpées en trois chapitres et leurs identifiants `dc_chXX_actYY` suivent la séquence 1.1 à 3.11. La preuve locale confirme exactement 29 activités source et 29 activités Neopolis, avec zéro activité manquante ([`docs/datacamp_working_with_the_openai_api_alignment_2026-08-28.json`](../../../docs/datacamp_working_with_the_openai_api_alignment_2026-08-28.json), champs `totals` et `findings`). Aucun défaut factuel de reprise ou d’ordre n’est donc retenu.

### 2. Présentation des interactions

La présentation suit une conversion cohérente par type : les vidéos sont des blocs `video`, les exercices de processus sont des blocs `code_repl`, et les activités interactives non linéaires apparaissent en `cloud_exercise`. Cette conversion est visible dans le cours et correspond aux types source consignés dans la preuve d’alignement. En revanche, chaque entrée d’alignement porte `explicitRubric: false`. Cela ne prouve pas une perte de correction source, mais cela signifie qu’aucun barème explicite n’est exposé par la couche d’alignement locale.

### 3. Guidage des TP dans l’environnement de l’apprenant

Les 20 activités d’exercice fournissent une consigne et généralement un indice, mais elles n’exposent pas de champ `environmentGuide`, `setup` ou procédure d’installation dans leurs blocs. Les blocs `code_repl` contiennent fréquemment un `starterCode` ou une `solutionCode` faisant intervenir `OpenAI(api_key=...)`, alors que `expectedOutput` est vide. Plusieurs exercices ont aussi un `starterCode` vide et ne donnent que la consigne et la solution. Ces faits sont observables directement dans `client/public/data/courses/working_with_the_openai_api__01.json` ; ils rendent difficile la vérification autonome de l’exécution et ne définissent pas de résultat attendu vérifiable.

Le script d’import contient bien un texte générique destiné à certains blocs `cloud_exercise`, demandant d’installer Python et le SDK, de configurer les identifiants par variables d’environnement et de ne jamais publier une clé ([`scripts/datacamp-importer-core.mjs`](../../../scripts/datacamp-importer-core.mjs), fonction de construction du bloc pratique). Ce texte n’est pas présent comme guide équivalent dans les blocs `code_repl` de ce cours ; il ne corrige donc pas la lacune observée pour les TP de code.

### 4. Dépendances externes, téléchargements et installation

Les notes source locales indiquent que le paquet contient 29 activités, 9 vidéos et 20 activités hors vidéo, ainsi que des PDF, MP4, VTT et transcriptions. Elles recensent dans les transcriptions les URL DataLab, Tokenizer et Pricing, et distinguent ces URL des actifs locaux `/api/assets` ([`docs/datacamp_working_with_openai_api_source_notes_2026-08-28.md`](../../../docs/datacamp_working_with_openai_api_source_notes_2026-08-28.md)). La preuve d’alignement indique toutefois zéro `externalLab`, zéro `externalMedia` et zéro `rawHtml` ([`docs/datacamp_working_with_the_openai_api_alignment_2026-08-28.json`](../../../docs/datacamp_working_with_the_openai_api_alignment_2026-08-28.json)). Il faut donc distinguer les liens mentionnés dans les transcriptions, qui constituent des dépendances documentaires potentielles, des dépendances d’exécution effectivement introduites par l’import. Aucune installation manquante ne peut être affirmée comme défaut factuel de reprise ; seule l’insuffisance de guidage observable dans les blocs de TP est retenue.

## Correctifs génériques réutilisables

1. Ajouter au bloc standard de TP de code un encadré **Préparer son environnement** : version Python, installation du SDK, emplacement de lancement et configuration par variable d’environnement, sans jamais demander de coller une clé.
2. Ajouter un bloc standard **Données et ressources** qui distingue les fichiers `/api/assets` téléchargeables des URL externes facultatives, avec une solution de repli lorsque le service externe n’est pas accessible.
3. Ajouter à chaque TP une section **Étapes attendues** numérotée : créer le client, exécuter la requête, inspecter la réponse, puis modifier le paramètre demandé.
4. Ajouter un **critère de réussite observable** générique : forme minimale de la sortie, type de valeur attendue ou assertion locale. Lorsque la sortie d’un modèle est variable, vérifier une propriété stable plutôt qu’une chaîne exacte.
5. Ajouter un bloc standard **Sécurité des secrets** rappelant l’usage des variables d’environnement, l’absence de clé dans le code soumis et la procédure de révocation en cas d’exposition.

## Périmètre et limites

Cette revue utilise uniquement le JSON du cours et les preuves locales demandées. Elle ne vérifie pas le contenu DataCamp en ligne et ne conclut pas à une erreur pédagogique de la source lorsque celle-ci n’est pas démontrée par un fichier local.

## Sources locales

- `client/public/data/courses/working_with_the_openai_api__01.json`
- `docs/datacamp_working_with_the_openai_api_alignment_2026-08-28.json`
- `docs/datacamp_working_with_openai_api_source_notes_2026-08-28.md`
- `scripts/datacamp-importer-core.mjs`

## Verdict

**Evidence status :** `source-aligned` pour la structure et la séquence ; couverture partielle pour les conditions pratiques d’exécution.

**Sévérité :** `medium`.

**Practice readiness :** `needs-learner-environment-guidance`.

Aucun fichier de cours n’a été modifié.
