# Revue de contenu — `text_to_query_agents_with_mongodb_and_langgraph__01`

## Périmètre et sources locales

Audit limité au JSON du cours et aux preuves présentes dans le dépôt. Sources consultées : [`client/public/data/courses/text_to_query_agents_with_mongodb_and_langgraph__01.json`](../../../client/public/data/courses/text_to_query_agents_with_mongodb_and_langgraph__01.json), [`docs/datacamp_text_to_query_agents_with_mongodb_and_langgraph_alignment_2026-08-28.json`](../../../docs/datacamp_text_to_query_agents_with_mongodb_and_langgraph_alignment_2026-08-28.json), [`docs/datacamp_text_to_query_agents_with_mongodb_and_langgraph_production_2026-08-28.md`](../../../docs/datacamp_text_to_query_agents_with_mongodb_and_langgraph_production_2026-08-28.md), [`docs/datacamp_mongodb_langgraph_import_notes_2026-08-24.md`](../../../docs/datacamp_mongodb_langgraph_import_notes_2026-08-24.md), et [`scripts/import-datacamp-course.mjs`](../../../scripts/import-datacamp-course.mjs). Aucun contenu DataCamp web n’a été utilisé.

## Constat de structure et de séquence

Le JSON déclare trois leçons, cinq activités de type `VideoExercise` et huit `LocalEnvironmentExercise` attendues dans les métadonnées d’import (JSON, lignes 4–20). En revanche, la structure effectivement matérialisée contient cinq chapitres pédagogiques, tous de type `teaching`, avec des blocs `video`, trois blocs `download` et un bloc `content` d’environnement ; aucun bloc d’exercice local n’est présent. Le champ terminal `exerciseCount` vaut d’ailleurs 0 (JSON, ligne 1840). Cette observation directe est cohérente avec le contrôle de production, qui confirme **5 activités, 0 exercice interactif et 3 téléchargements** ([production, lignes 8–16](../../../docs/datacamp_text_to_query_agents_with_mongodb_and_langgraph_production_2026-08-28.md)).

La séquence vidéo est lisible et progressive : introduction/architecture et préparation, workflow text-to-query, architecture agentique LangGraph, mémoire/checkpointing, puis félicitations. Les diapositives et transcriptions suivent cette progression ; les chapitres sont verrouillés par `requiredBeforeAdvance: true`. Les preuves d’alignement indiquent toutefois que la source comportait 13 activités, dont huit TP DataLab retirés comme non reproductibles, tandis que cinq vidéos sont conservées (fichier d’alignement, `totals` et décisions `removed_non_reproducible`, lignes 12–24 et 26–287). Il ne faut donc pas qualifier les huit TP de « repris » dans le JSON : la preuve locale établit leur retrait, pas leur équivalence pédagogique.

## Défauts factuels soutenus par preuve locale

* **Écart entre métadonnées et contenu réellement livrable.** Le JSON annonce dans `datacampImport.expected` huit `LocalEnvironmentExercise`, alors que le cours ne contient aucun exercice local et que `exerciseCount` est nul. Les notes d’import affirment au contraire que les huit TP ont été « convertis en TP guidés autonomes » ([notes d’import, lignes 3–6](../../../docs/datacamp_mongodb_langgraph_import_notes_2026-08-24.md)). Cette contradiction documentaire doit être résolue : l’audit ne peut pas considérer les TP comme disponibles lorsque le JSON effectivement livré ne les expose pas.
* **Modalité pratique non alignée avec la promesse d’apprentissage.** Le bloc d’introduction dit que le cours se réalise avec des activités interactives et demande de préparer un chatbot IA autorisé ([JSON, lignes 58–62]), tandis que le contrôle de production confirme zéro exercice interactif. Il s’agit d’une incohérence de présentation et non d’une preuve que les vidéos sont incorrectes.
* **Dépendances et installation insuffisamment explicitées.** Le script/JSON décrit un cluster MongoDB Atlas gratuit et une base `movies` préconstruite dans la narration vidéo (par exemple JSON, lignes 144–161), mais le contenu de préparation ne fournit pas de procédure vérifiable pour créer le compte, le cluster, les droits réseau, la base, l’environnement Python/Notebook, les paquets ou la configuration des secrets. Le JSON mentionne seulement un environnement local et l’interdiction de partager des clés (lignes 58–61). Cette insuffisance est donc observée directement dans le JSON ; elle ne permet pas d’affirmer qu’une installation source était absente.
* **Téléchargements limités aux supports de chapitre.** Les seuls blocs `download` visibles sont les PDF de diapositives des chapitres 1 à 3 (par exemple JSON, lignes 338–350, 1314–1325 et 1619–1630). Aucun notebook, jeu de données, `requirements.txt`, fichier `.env.example` ou script de démarrage n’est proposé dans le cours. Les notes d’import et la production confirment toutefois que les médias consommés sont locaux et valides ; aucun défaut d’URL externe n’est soutenu ([notes, lignes 11–14](../../../docs/datacamp_mongodb_langgraph_import_notes_2026-08-24.md)).

## Guidage apprenant et préparation à la pratique

La préparation est **insuffisante pour un apprenant dans son propre environnement** : elle ne donne ni prérequis techniques, ni étapes numérotées, ni commande d’installation, ni méthode de connexion MongoDB Atlas, ni emplacement attendu des variables d’environnement, ni procédure de vérification, ni dépannage. Les vidéos se terminent par des invitations générales (« Passons à la pratique ! »), mais aucun TP exécutable, consigne, livrable ou critère de réussite n’est présent dans le JSON. Le risque principal est donc l’impossibilité de reproduire la pratique, plutôt qu’une erreur factuelle démontrée dans les explications vidéo.

## Correctifs génériques réutilisables Neopolis

1. Ajouter, avant le premier bloc vidéo, le bloc standard **Préparer son environnement** : prérequis, versions supportées, installation, variables d’environnement, secrets, droits minimaux et avertissement données sensibles.
2. Ajouter le bloc **TP guidé autonome** standard pour chaque activité retirée : objectif observable, fichiers de départ, étapes graduées, commandes, résultat attendu, vérification et solution de reprise ; ne pas promettre une activité interactive si elle n’existe pas.
3. Ajouter le bloc **Dépendances et téléchargements** standard : manifeste de fichiers, notebook ou squelette local, `requirements`/équivalent, `.env.example` sans secret, jeu de données ou procédure locale de chargement, et liens internes uniquement.
4. Ajouter le bloc **Validation finale** standard : test de connexion, requête de contrôle, scénario nominal, erreur fréquente et critère de réussite ; distinguer explicitement MongoDB Atlas, fournisseur LLM et environnement d’exécution.
5. Harmoniser automatiquement les compteurs d’import (`activities_extracted`, types d’exercices et `exerciseCount`) avec les blocs effectivement présents, puis faire échouer la validation en cas de contradiction.

**Verdict :** contenu vidéo et séquence générale exploitables, mais pratique non prête à l’emploi et documentation contradictoire sur les huit TP. Priorité **élevée** pour rétablir la vérité des métadonnées et fournir un guidage d’environnement apprenant ; aucune preuve locale ne justifie de déclarer les médias invalides ou externes.

---

*Revue autonome : aucun fichier de cours n’a été modifié.*
