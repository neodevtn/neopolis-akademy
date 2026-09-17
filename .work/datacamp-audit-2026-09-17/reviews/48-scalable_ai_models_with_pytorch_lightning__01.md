# Revue de contenu — `scalable_ai_models_with_pytorch_lightning__01`

## Périmètre et preuves locales

L’audit porte exclusivement sur `client/public/data/courses/scalable_ai_models_with_pytorch_lightning__01.json`. Les preuves de dépôt consultées sont `docs/datacamp_pytorch_lightning_import_notes_2026-08-24.md`, `scripts/import-datacamp-course.mjs` et `scripts/datacamp-importer-core.mjs`. Aucun document local d’alignement, de source ou de production spécifique à ce slug n’a été trouvé au-delà des notes d’import ; aucune source DataCamp web n’a été utilisée.

## Verdict synthétique

La conversion est **partiellement étayée par les preuves locales** : les notes d’import confirment la volumétrie et les contrôles de production, mais elles ne constituent pas une preuve pédagogique de fidélité au contenu source. Le JSON contient bien 3 chapitres, 30 activités, 10 vidéos, 17 TP, 2 QCM et 1 tri, ce qui concorde avec `datacampImport.expected` (lignes 4–22) et avec les notes d’import (lignes 3–6 et 13–14). Les médias et téléchargements sont référencés par des chemins locaux `/api/assets/...`; les notes indiquent 38/38 ressources téléchargées et 54/54 médias locaux valides (`docs/datacamp_pytorch_lightning_import_notes_2026-08-24.md`, lignes 3, 5, 13).

**Sévérité : moyenne.** Aucun défaut d’intégrité technique local n’est démontré, mais la préparation à la pratique autonome est insuffisante et répétitive dans les TP.

## Constats factuels

### 1. Preuve de structure et de séquence, pas de fidélité pédagogique

Le JSON impose `requiredBeforeAdvance: true` sur les activités et conserve la séquence de 3 chapitres ; cela concorde avec la note d’import qui mentionne le verrouillage séquentiel et les 30 activités. Le script `scripts/import-datacamp-course.mjs` montre que la sortie est produite par conversion du manifeste vers le schéma Neopolis, tandis que `scripts/datacamp-importer-core.mjs` construit notamment les blocs vidéo et les blocs pratiques. En revanche, aucun fichier local `datacamp_*alignment*.json`, `datacamp_*source*.md` ou `datacamp_*production*.md` spécifique à ce cours n’a été trouvé : il n’est donc pas possible d’affirmer que la progression, les interactions ou les formulations sont fidèles au cours source.

### 2. Présentations incohérentes observables dans le JSON

La description française du chapitre 1 (présentation de `LightningModule` et `Trainer`) est recopiée dans les activités des chapitres suivants, y compris celles consacrées à la quantification, à l’élagage et à TorchScript. Cela donne à chaque activité un contexte pédagogique identique et inadapté à son objectif local (`client/public/data/courses/scalable_ai_models_with_pytorch_lightning__01.json`, par exemple lignes 494–500 et les descriptions des activités du chapitre 3).

Plusieurs activités de téléchargement et de ressources affichent `Chapter slides (PDF)` dans le champ français (`resources[].title.fr`), tandis que les titres de téléchargement du premier chapitre utilisent aussi `Chapter 1 slides` dans `title.fr` (`client/public/data/courses/scalable_ai_models_with_pytorch_lightning__01.json`, lignes 476–487 et 522–533). Cette présentation bilingue est incohérente avec le cours déclaré `fr-FR` (ligne 8).

Le bloc de préparation initial annonce un « chatbot IA » à préparer, alors que le cours porte sur PyTorch Lightning et utilise dans ses vidéos les jeux Afro-MNIST/MNIST (`client/public/data/courses/scalable_ai_models_with_pytorch_lightning__01.json`, lignes 58–63 et 174–186). Cette consigne est sans rapport observable avec les TP et peut désorienter l’apprenant.

### 3. Guidage insuffisant pour un environnement apprenant autonome

Les TP sont des blocs `cloud_exercise`, mais chacun reçoit un `environmentGuide` générique demandant d’installer « Python et le SDK requis », de configurer des identifiants et de remplacer un proxy ou jeton (`client/public/data/courses/scalable_ai_models_with_pytorch_lightning__01.json`, lignes 501–536, puis blocs pratiques suivants). Le JSON ne fournit pas de version Python, de commande d’installation, de version PyTorch/Lightning, de vérification d’installation, de consigne CPU/GPU, ni de procédure reproductible pour obtenir les données et objets préchargés. La formulation est particulièrement peu adaptée à ce cours : les TP indiquent que des objets tels que `model`, `X_test`, `y_test`, `DataLoader` ou des modules sont « préchargés », sans expliquer comment les recréer hors du bac d’exercice.

Les ressources des TP pointent essentiellement vers le PDF local du chapitre (`/api/assets/chapter_01_slides...`, `chapter_02_slides...`, `chapter_03_slides...`). Elles ne remplacent pas un notebook ou un jeu de données reproductible. Les instructions demandent des actions concrètes — par exemple entraîner avec `Trainer`, mesurer les temps, appliquer la quantification/élagage ou sauvegarder TorchScript — mais ne donnent pas de critères de sortie, d’exemple d’exécution attendue, de diagnostic d’erreur ou de vérification finale. Les champs `steps`, `hint` et `solution` existent, mais le guidage reste centré sur les trous à remplir et non sur la mise en place de l’environnement personnel.

La note locale d’import confirme les ressources locales, les contrôles et l’absence d’URL DataCamp externe (`docs/datacamp_pytorch_lightning_import_notes_2026-08-24.md`, lignes 3–14), mais ne prouve pas que les préchargements du cloud sont disponibles ou documentés dans l’environnement autonome. Il s’agit donc d’une insuffisance de guidage directement observée, non d’une défaillance d’import démontrée.

## Correctifs réutilisables par blocs Neopolis

1. Remplacer le guide d’environnement générique par un bloc standard **Préparer l’environnement** : versions supportées, commande d’installation, vérification (`python --version`, import et versions), mode CPU par défaut et option GPU explicitement documentée.
2. Ajouter un bloc standard **Données et objets de départ** : provenance locale, téléchargement ou génération, arborescence, variables créées, dimensions attendues et commande de test minimale ; ne jamais laisser « préchargé » sans équivalent autonome.
3. Ajouter à chaque TP un bloc **Objectif vérifiable** : commande de lancement, sortie attendue (forme, métrique ou fichier), critère de réussite et contrôle final.
4. Ajouter un bloc **Dépannage** réutilisable pour imports, incompatibilités de versions, absence de GPU, chemins de fichiers et erreurs de forme tensorielle ; inclure une procédure de reprise sans clé/API.
5. Utiliser un bloc **Ressource localisée** avec titres et descriptions cohérents en français, et séparer clairement support de cours, code de départ et données.
6. Générer la description d’activité à partir de l’objectif de l’activité, au lieu de recopier la description du chapitre ; ajouter un bloc standard de transition reliant chaque TP à la notion immédiatement enseignée.
7. Pour les TP de déploiement, ajouter une vérification reproductible : chargement du modèle, prédiction sur un petit échantillon, comparaison avant/après et emplacement explicite du fichier produit.

## Conclusion

Le cours est techniquement bien importé selon les preuves locales disponibles, mais son usage autonome est **à compléter avant recommandation pratique**. Les défauts les plus sûrs sont la consigne initiale hors sujet, les descriptions répétées, les libellés bilingues incohérents et le guide d’environnement trop générique pour des TP dépendant de préchargements cloud. Aucune inexactitude par rapport à DataCamp ne doit être affirmée sans preuve locale de source ou d’alignement.

### Sources

- [`client/public/data/courses/scalable_ai_models_with_pytorch_lightning__01.json`](../../../../client/public/data/courses/scalable_ai_models_with_pytorch_lightning__01.json)
- [`docs/datacamp_pytorch_lightning_import_notes_2026-08-24.md`](../../../../docs/datacamp_pytorch_lightning_import_notes_2026-08-24.md)
- [`scripts/import-datacamp-course.mjs`](../../../../scripts/import-datacamp-course.mjs)
- [`scripts/datacamp-importer-core.mjs`](../../../../scripts/datacamp-importer-core.mjs)
