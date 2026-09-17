# Revue de contenu — `deploying_ai_into_production_with_fastapi__01`

## Périmètre et preuves locales

Lecture intégrale de `client/public/data/courses/deploying_ai_into_production_with_fastapi__01.json`. Les comparaisons sont limitées aux preuves présentes dans le dépôt, principalement `docs/datacamp_deploying_ai_fastapi_import_notes_2026-08-24.md`, `scripts/import-datacamp-course.mjs` et les manifestes/ressources référencés localement. Aucun accès DataCamp web n’a été utilisé.

## Synthèse

La reprise est **structurellement alignée** avec la note d’import locale : 4 chapitres, 46 activités, 14 leçons Projector, 22 TP `NormalExercise` convertis en `cloud_exercise`, 9 éditeurs `IDEExercise` convertis en `code_repl`, 1 tri interactif et 105 ressources téléchargées localement (`docs/datacamp_deploying_ai_fastapi_import_notes_2026-08-24.md`, lignes 16–29). La note indique également 90 médias consommés locaux et valides, zéro référence média invalide et zéro URL DataCamp externe dans l’audit de production (lignes 43–60). Aucun défaut factuel de séquence ou de parité ne peut donc être retenu sur la base des preuves locales.

En revanche, le JSON montre des insuffisances de **guidage pour l’exécution autonome**. Elles ne constituent pas une preuve d’une erreur de reprise DataCamp : ce sont des observations directes sur les écrans TP publiés.

## Constats

### 1. Préparation de l’environnement trop générique pour les TP

Les TP répètent un `environmentGuide` générique demandant d’installer Python et le SDK requis, de définir des identifiants dans des variables d’environnement et de remplacer un éventuel proxy/jeton de formation, sans fournir dans le JSON de commande d’installation, de version minimale, de nom de paquet complet, de commande de lancement ni de test de réussite. Cette formulation apparaît par exemple dans les TP `dc_ch04_act10` et `dc_ch04_act12` (`client/public/data/courses/deploying_ai_into_production_with_fastapi__01.json`, lignes 5588–5605 et 5690–5708). Elle est moins opérationnelle que la préparation annoncée dans la preuve d’import, qui mentionne explicitement Python 3.11+, environnement virtuel et FastAPI/Uvicorn/Pydantic/Joblib (`docs/datacamp_deploying_ai_fastapi_import_notes_2026-08-24.md`, ligne 29).

**Impact apprenant :** un apprenant hors environnement intégré doit déduire les paquets, créer son environnement et déterminer comment vérifier son API avant de pouvoir commencer.

### 2. Dépendance au modèle local insuffisamment guidée dans un TP

Le TP `dc_ch04_act10` demande de charger `penguin_classifier.pkl` et fournit ce nom dans le code de départ, mais ses ressources JSON listent seulement les slides du chapitre (lignes 5588–5607). Le JSON ne donne pas de procédure de téléchargement, de chemin attendu, de contrôle d’intégrité ou de solution de remplacement pour ce fichier dans ce TP. Le TP `dc_ch04_act12` référence, lui, explicitement `penguin_classifier.pkl` parmi ses ressources (lignes 5690–5710), ce qui rend l’incohérence observable entre deux TP voisins ayant la même dépendance.

**Impact apprenant :** le TP 10 peut être bloqué par `FileNotFoundError` dans un environnement autonome, alors que la consigne ne décrit pas comment obtenir ou placer le modèle.

### 3. Validation pratique non explicitée

Les TP indiquent des actions à réaliser et des blancs de code, par exemple « Consignez au niveau INFO le temps de traitement » (`dc_ch04_act10`) ou ajoutez un endpoint `/health` retournant `{"status": "OK"}` (`dc_ch04_act11`, lignes 5619–5680), mais le JSON ne fournit pas de commande `uvicorn`, de requête `curl`/client HTTP, de sortie attendue, ni de contrôle des logs permettant à l’apprenant de démontrer localement que le résultat fonctionne. La preuve locale confirme la présence d’un écran TP avec objectif, consignes, ressources et correction masquée, mais ne documente pas une procédure de validation autonome (`docs/datacamp_deploying_ai_fastapi_import_notes_2026-08-24.md`, lignes 37–41).

**Impact apprenant :** l’apprenant peut remplir les blancs sans savoir comment démarrer l’application, atteindre l’endpoint ou observer le log produit.

### 4. Présentation globalement cohérente, avec une incohérence de titre visible

La séquence en quatre leçons est cohérente avec la note de parité. Le titre de la quatrième leçon contient toutefois un espace initial : `" Versionnage d’API, monitoring et journalisation"` dans le JSON (structure `lessons[3]`). C’est une anomalie de présentation mineure directement observable, sans preuve locale qu’elle provienne de la source partenaire.

## Ce qui n’est pas retenu comme défaut

La note locale d’import affirme la parité des chapitres, activités, modalités et ressources, ainsi que la validité des médias et l’absence de références externes invalides. En conséquence, la revue ne qualifie pas la séquence, le nombre d’activités, la conversion `NormalExercise`/`IDEExercise`, les téléchargements locaux ou les médias de défauts factuels. Les éventuels écarts pédagogiques par rapport à DataCamp ne sont pas rapportés faute de fichier local d’alignement/source dédié à ce cours ; la note locale disponible confirme au contraire la parité annoncée.

## Correctifs génériques réutilisables Neopolis

1. Ajouter un bloc standard **Préparer l’environnement** au niveau du premier TP de chaque chapitre : version Python, création/activation d’un environnement virtuel, commande d’installation exacte, commande de lancement et test minimal.
2. Ajouter un bloc standard **Ressources et chemins** pour chaque dépendance de fichier : téléchargement local, nom exact, emplacement attendu, empreinte si disponible et commande de vérification.
3. Ajouter un bloc standard **Vérifier le résultat** aux TP API : commande `uvicorn`, requête HTTP reproductible, réponse attendue et emplacement/commande de lecture des logs.
4. Ajouter un bloc standard **Dépannage** couvrant fichier introuvable, port occupé, paquet manquant et incompatibilité de version, sans exposer de secret.
5. Uniformiser les métadonnées de présentation (notamment suppression des espaces initiaux dans les titres) avant publication.

## Conclusion

**Reprise source : alignée selon les preuves locales.** **Prêt pour la pratique autonome : nécessite un guidage de l’environnement apprenant**, avec un point bloquant concret pour le fichier `penguin_classifier.pkl` du TP `dc_ch04_act10`. Aucun fichier de cours n’a été modifié.

### Sources citées

- `client/public/data/courses/deploying_ai_into_production_with_fastapi__01.json`
- `docs/datacamp_deploying_ai_fastapi_import_notes_2026-08-24.md`
- `scripts/import-datacamp-course.mjs`

