# Revue de contenu — `databricks_with_the_python_sdk__01`

**Périmètre.** Lecture intégrale de `client/public/data/courses/databricks_with_the_python_sdk__01.json`. La comparaison de preuve est limitée aux fichiers locaux autorisés : `scripts/register-databricks-with-the-python-sdk.mjs` et `docs/training-visual-manifest.json` (manifeste associé). Aucun recours à DataCamp web ou au navigateur.

## Conclusion

Le cours est **structurellement cohérent** avec son enregistrement local : le script déclare 3 chapitres, 24 activités, 8 vidéos, 16 exercices interactifs, 15 TP guidés, 1 QCM et 3 téléchargements (`scripts/register-databricks-with-the-python-sdk.mjs`, lignes 3–4). Le JSON contient effectivement 8 blocs `video`, 15 `cloud_exercise`, 1 `single_choice_exercise` et 3 `download`, avec verrouillage séquentiel (`requiredBeforeAdvance: true`). Le manifeste associe bien le certificat Databricks au sujet et au groupe de formation (`docs/training-visual-manifest.json`, entrée `datacamp_databricks_with_the_python_sdk`, lignes 702–718).

Il n’existe toutefois pas, parmi les preuves locales autorisées retrouvées, de fichier `alignment`, `source` ou `production` propre à ce slug permettant de valider factuellement la fidélité à un plan DataCamp, à une séquence source ou à une production de référence. L’évidence est donc **partielle** : les constats ci-dessous distinguent les faits directement observables dans le JSON des limites de guidage apprenant.

## Constats factuels observables

| Niveau | Constat et source locale | Impact |
|---|---|---|
| Moyen | Les descriptions des activités de plusieurs chapitres reprennent la même formulation générale (« configurer… authentifier… clusters et jobs »), y compris pour des activités distinctes sur l’authentification, les clusters et les jobs (JSON, notamment lignes 33–34, 51–52, 394–395, 446–447 et descriptions du chapitre 3). | Présentation peu discriminante : l’objectif spécifique et la progression de chaque TP sont moins lisibles. |
| Élevé | Le bloc de préparation demande de préparer un « chatbot IA » (`neopolis_databricks_with_the_python_sdk__01_environment_preparation`, JSON, lignes 59–64), alors que les TP exigent Python, `databricks-sdk`, un workspace Databricks, des variables d’environnement et, selon les activités, un cluster ou un notebook. | Préparation incohérente avec la dépendance technique réelle ; risque de commencer sans environnement exploitable. |
| Moyen | L’installation apparaît dans une diapositive vidéo sous la forme unique `pip install databricks-sdk` (JSON, lignes 112–119), sans version, méthode d’isolement, vérification d’installation ni procédure d’échec. | Guidage insuffisant pour reproduire le cours dans un environnement personnel. |
| Élevé | Le premier TP utilise la variable préchargée `dbrx_host` et les exercices ultérieurs utilisent des variables de formation telles que `TRAINING_CLUSTER_ID`, ainsi que des notebooks/ressources supposés exister (JSON, par exemple lignes 408–433 et les blocs des activités `dc_3_act_02_tp` à `dc_3_act_07_tp`). Le seul `environmentGuide` reste générique : installer Python/SDK et remplacer « proxy ou jeton formation » par sa configuration personnelle. | Le passage de l’environnement importé à l’environnement autonome n’est pas opérationnalisé : correspondance des variables, création/récupération des ressources, valeurs de remplacement et critères de validation manquent. |
| Élevé | Plusieurs TP exécutent des opérations à effets de bord sur un workspace réel : démarrage de cluster, création/exécution/planification/suppression de jobs et suppression de ressources (activités du chapitre 3 ; solutions et instructions dans le JSON). | Sans avertissement de coût/permissions, convention de nommage et procédure de nettoyage/annulation, l’apprenant peut échouer ou laisser des ressources actives. Ce constat porte sur le guidage observé, pas sur un défaut de la plateforme. |
| Faible | Le code de démonstration d’authentification place des valeurs sensibles fictives directement dans `os.environ` et comporte une anomalie de présentation visible : `"Your-Databricks-Client-Id"\os.environ['DATABRICKS_HOST']` (JSON, lignes 142–149). | Exemple difficile à copier-coller et séparation insuffisamment nette entre secret, hôte et configuration sûre. |

## Séquence, interactions et téléchargements

La séquence est lisible et verrouillée : vidéo/diapositives, TP, vidéo/TP, puis récapitulatif, répartis en trois chapitres. Les TP sont interactifs de type `cloud_exercise` avec consignes, étapes, aide et solution ; le QCM est séparé. Les trois téléchargements pointent vers des chemins d’assets locaux `/api/assets/...pdf` dans le JSON, sans URL DataCamp externe observable. Le manifeste local confirme l’existence de l’entrée visuelle du certificat, mais ne constitue pas une preuve de fidélité pédagogique au contenu source.

## Évaluation de préparation à la pratique

**Statut : needs-learner-environment-guidance.** Les activités sont pédagogiquement orientées vers la pratique, mais elles ne sont pas suffisamment autonomes pour un apprenant qui ne dispose pas déjà d’un workspace Databricks configuré. Le cours ne fournit pas, dans les blocs observés, une procédure complète et réutilisable pour : installer/valider Python et le SDK ; choisir une méthode d’authentification non exposante ; créer ou identifier un workspace, cluster, notebook et job de test ; remplacer chaque variable préchargée ; vérifier les permissions ; puis nettoyer les ressources créées.

## Correctifs génériques réutilisables par blocs Neopolis

1. Ajouter un bloc standard **Pré-requis environnement** : version Python supportée, environnement virtuel, commande d’installation versionnée ou contrôlée, commande de vérification et diagnostic minimal.
2. Ajouter un bloc standard **Authentification sûre** : choix entre variables d’environnement et profil local, noms exacts des variables, test non secret, interdiction de coller ou journaliser les secrets.
3. Ajouter un bloc standard **Adaptation “formation → personnel”** : tableau variable préchargée / équivalent personnel / méthode de vérification, couvrant hôte, identifiant de cluster, chemin de notebook et expression cron.
4. Ajouter avant tout TP à effet de bord un bloc **Préparation et permissions** : ressources nécessaires, droits minimaux, convention de nommage et avertissement sur coûts/temps d’exécution.
5. Ajouter après les TP de création un bloc **Validation et nettoyage** : assertion de succès, lecture d’état, arrêt/suppression explicites et conduite à tenir en cas d’échec.
6. Remplacer les descriptions génériques répétées par un bloc standard **Objectif mesurable** propre à chaque activité, en conservant la séquence et les interactions existantes.
7. Corriger les exemples de code mal formés et fournir, pour chaque TP, un **starter autonome** cohérent avec les variables personnelles réellement demandées.

**Verdict :** pas de défaut de parité structurelle démontrable avec les preuves locales disponibles ; insuffisances importantes de guidage pour l’exécution dans l’environnement propre de l’apprenant.

## Sources locales citées

- `client/public/data/courses/databricks_with_the_python_sdk__01.json`
- `scripts/register-databricks-with-the-python-sdk.mjs`
- `docs/training-visual-manifest.json`

Aucun fichier local autorisé `docs/datacamp_*alignment*.json`, `docs/datacamp_*source*.md` ou `docs/datacamp_*production*.md` correspondant à ce cours n’a été retrouvé ; aucune affirmation de fidélité au contenu DataCamp source n’est donc portée.
