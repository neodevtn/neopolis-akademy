# Revue de contenu — `introduction_to_ai_for_work__01`

## Conclusion

Le cours est **structurellement aligné** avec la preuve locale disponible : 4 chapitres et 33 activités attendues sont présents, sans activité manquante ni retrait documenté. La séquence importée alterne vidéos, QCM, tris par catégories et une revue de ressource, conformément au relevé d’alignement local [2].

La principale limite concerne la **mise en pratique dans l’environnement de l’apprenant**. Le JSON ne contient aucun TP exécutable ou évalué dans l’environnement de l’apprenant : la preuve locale indique `cloudExercises: 0`, `runtimeExercises: 0`, `externalLab: 0` et `localRubricCandidates: 0` [2]. Les activités dites `exercise` sont des tris (`bucket_sort`) et les activités dites `quiz` sont des choix simple ou multiple ; elles ne demandent pas de produire un résultat avec un chatbot réel.

## Constats étayés par les fichiers locaux

| Domaine | Constat | Preuve |
|---|---|---|
| Structure et séquence | Les 33 activités source sont présentes dans Neopolis, avec 0 activité manquante et 0 activité intentionnellement retirée. La couverture est répartie sur 4 leçons/chapitres. | `docs/datacamp_introduction_to_ai_for_work_alignment_2026-08-28.json`, champs `totals` et `findings` [2] |
| Interactions | Les types importés sont des vidéos, QCM, tris par catégories et revue de ressource. Aucun `cloud_exercise`, `code_repl` ou `ai_evaluation` n’est produit pour ce cours. | `client/public/data/courses/introduction_to_ai_for_work__01.json` [1] ; [2] |
| Dépendances externes | La preuve locale déclare 0 laboratoire externe, 0 média externe et 0 contenu HTML brut. Les médias du JSON utilisent des chemins locaux `/api/assets/...`. | [1] ; [2] |
| Téléchargements | Les téléchargements observés correspondent aux supports PDF locaux de chapitres ; ils ne constituent pas un environnement de TP ni un jeu de données à installer. | `client/public/data/courses/introduction_to_ai_for_work__01.json` [1] ; `scripts/datacamp-importer-core.mjs` (construction des ressources de pratique) [3] |
| Rubrique d’évaluation | Aucun candidat de rubrique locale explicite n’est signalé ; les activités sont importées avec corrections, explications ou indices selon leur type, mais sans évaluation d’une production personnelle. | [2] ; [1] |

## Insuffisances de guidage observables dans le JSON

Le bloc d’introduction de `dc_ch01_act01` demande de préparer « un chatbot IA autorisé par votre organisation » et interdit de partager données sensibles, mots de passe ou clés API [1]. Cependant, les 33 activités suivantes ne fournissent pas de scénario opératoire qui réutilise ce chatbot : aucun objectif de production, aucune étape de connexion ou de configuration, aucun prompt à exécuter dans l’outil de l’apprenant, aucun résultat attendu à copier ou comparer, et aucun critère de réussite portant sur une production personnelle n’est présent dans le cours [1]. Il s’agit d’une **insuffisance de guidage apprenant observée directement**, et non d’une reprise pédagogique déclarée inexacte.

Les consignes des tris et QCM guident correctement l’interaction simulée dans Neopolis, avec des indices et des explications, mais elles ne font pas le passage vers le contexte professionnel propre à l’apprenant. La dépendance annoncée à un chatbot reste donc préparatoire et non utilisée pédagogiquement dans un TP [1].

Aucune divergence factuelle de structure, de séquence ou de dépendance externe ne peut être affirmée au-delà de ces constats : la preuve locale disponible conclut à la présence des 33 activités et ne documente pas de défaut source précis. Les mentions `explicitRubric: false` sont en revanche homogènes dans le relevé d’alignement [2].

## Correctifs génériques réutilisables

1. Ajouter, avant le premier bloc pratique standard, une fiche **Environnement apprenant** : outil autorisé, accès requis, données interdites, solution de repli sans compte et durée indicative.
2. Remplacer ou compléter un exercice fermé par un bloc **TP guidé** standard comprenant : objectif professionnel, contexte fictif ou données anonymisées, étapes numérotées, prompt de départ, consigne d’itération, livrable attendu et exemple de résultat.
3. Ajouter une **checklist de vérification** réutilisable : exactitude, actualité, biais, confidentialité et validation humaine, avec un message de réussite explicite.
4. Prévoir un **mode sans outil externe** : simulation dans Neopolis ou réponses textuelles guidées, afin que l’apprenant puisse terminer le TP si son organisation interdit l’outil proposé.

## Références locales

[1]: `client/public/data/courses/introduction_to_ai_for_work__01.json` "Cours Neopolis importé"
[2]: `docs/datacamp_introduction_to_ai_for_work_alignment_2026-08-28.json` "Preuve locale d’alignement DataCamp–Neopolis"
[3]: `scripts/datacamp-importer-core.mjs` "Règles locales de conversion des activités DataCamp"
[4]: `scripts/import-datacamp-course.mjs` "Script local d’import DataCamp"

> Aucun document DataCamp en ligne ni navigateur n’a été utilisé. Aucun fichier de cours n’a été modifié.
## Verdict

**Prêt pour la progression interactive, mais pas prêt pour une mise en pratique autonome avec l’environnement professionnel de l’apprenant.**

- **Statut de preuve :** source alignée pour la structure ; preuve partielle pour l’expérience pratique.
- **Sévérité :** moyenne.
- **Préparation pratique :** nécessite un guidage de l’environnement apprenant.
