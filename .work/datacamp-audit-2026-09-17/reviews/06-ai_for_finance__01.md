# Revue autonome — `ai_for_finance__01`

**Périmètre.** Lecture du seul fichier de cours et comparaison avec les preuves locales autorisées du dépôt (alignement, notes source, scripts d’import/contrôle et manifestes). Aucune consultation DataCamp web et aucune modification du cours.

## Conclusion

L’alignement source est **partiel mais documenté** : le fichier de cours déclare 3 chapitres et 30 activités extraites, tandis que l’alignement local comptabilise 30 activités source, 28 conservées dans Neopolis et 2 retraits intentionnels (`1.8` et `1.11`). Les notes source expliquent ces retraits comme non reconstructibles localement (absence de rubrique explicite et de ressource locale). Il n’y a donc pas de défaut factuel de séquence ou d’activité manquante involontaire établi par les preuves locales.

Le principal risque concerne la **préparation à la pratique dans l’environnement de l’apprenant**. Les neuf TP CloudExercise rubricés sont bien identifiés par la preuve de contrôle, mais le JSON montre une guidance hétérogène et parfois trop générique pour des actions dépendantes de l’outil choisi.

## Constats étayés par les fichiers locaux

| Constat | Qualification | Preuve locale |
|---|---|---|
| La séquence est structurellement cohérente avec la décision d’import : 3 chapitres, contenus Projector, QCM, tris et TP CloudExercise ; les 2 activités retirées sont nommées et justifiées. | Alignement confirmé, pas un défaut | `client/public/data/courses/ai_for_finance__01.json` (métadonnées d’import) ; `docs/datacamp_ai_for_finance_alignment_2026-08-28.json` (totaux et décisions `1.8`/`1.11`) ; `docs/datacamp_ai_for_finance_source_notes_2026-08-28.md` (lignes 3–19). |
| Les neuf TP conservés disposent d’une rubrique locale, d’un score maximal/seuil et de la version `datacamp-source-2026-08-28`; le script de contrôle les considère valides et sans dépendance DataCamp interdite visible. | Alignement technique confirmé | `scripts/check-ai-for-finance-tps.mjs` (contrôles et note de décision) ; `docs/datacamp_ai_for_finance_alignment_2026-08-28.json` (`localRubricCandidates: 9`). |
| Une incohérence de présentation existe entre les manifestes : l’enregistrement du cours/certificat annonce 30 activités, alors que le manifeste visuel associé annonce 28 activités et 18 exercices, et que l’alignement décompte 28 activités Neopolis. | Défaut de présentation/compteurs, gravité faible | `scripts/register-ai-for-finance.mjs` (lignes 17–25, 38–45) ; `docs/training-visual-manifest.json` (lignes 132–148) ; `docs/datacamp_ai_for_finance_alignment_2026-08-28.json` (lignes 12–23). |
| Les notes source demandent de garder les tris dans `bucket_sort` avec dépôt souris, cibles cliquables, réponse/correction locales ; l’alignement confirme les six tris et leurs blocs `bucket_sort`. | Présentation/interactions alignées par preuve locale | `docs/datacamp_ai_for_finance_source_notes_2026-08-28.md` (lignes 11–13) ; `docs/datacamp_ai_for_finance_alignment_2026-08-28.json` (entrées 1.4, 2.2, 2.8, 3.2, 3.8, 3.9). |
| Les médias et téléchargements de chapitres utilisent des chemins `/api/assets/...` locaux ; les preuves indiquent 0 média externe et 0 dépendance Lab/VM/Campus/Workspace DataCamp. | Pas de défaut factuel établi | JSON du cours (blocs `video`/`download`) ; `docs/datacamp_ai_for_finance_alignment_2026-08-28.json` (totaux `externalMedia: 0`, `externalLab: 0`) ; `docs/datacamp_ai_for_finance_source_notes_2026-08-28.md` (ligne 13). |

## Insuffisances de guidage observables directement dans le JSON

Ces points sont des observations de conception apprenant, et **non des affirmations sur la source DataCamp**.

1. Les TP CloudExercise utilisent un `environmentGuide` identique et très général (« assistant IA génératif auquel vous avez personnellement accès », nouvelle conversation, aucune donnée sensible). Plusieurs TP ont pourtant des actions spécifiques à une interface : programmer une invite (`dc_ch02_act09`), modifier un assistant et ajouter un fichier de connaissances (`dc_ch03_act03`, `dc_ch03_act05`, `dc_ch03_act06`). Le JSON ne donne pas de procédure de remplacement lorsque l’outil choisi ne possède pas ces fonctions.
2. Plusieurs TP ont `steps: []` et/ou `instructions: ""`, alors que les seules indications opérationnelles sont reportées dans `hint` ou `solution`. Cela réduit la progression guidée, notamment pour l’apprenant qui ne connaît pas l’outil choisi.
3. Des consignes supposent des éléments non fournis par le cours : `dc_ch03_act05` renvoie à un fichier `finwise_brand_guidelines.pdf` « sur votre bureau » et dans un dossier `Resources`, sans ressource locale correspondante dans le bloc ; `dc_ch03_act03`/`dc_ch03_act05`/`dc_ch03_act06` demandent un assistant/agent et l’ajout d’un fichier, sans tutoriel d’installation ou de création propre à l’environnement apprenant. Le champ `resources` de ces TP ne contient que le PDF local des slides.
4. Les TP évaluent une production textuelle minimale (`minWords: 1` dans les blocs rubricés) et plusieurs rubriques portent sur des éléments simples. Le JSON ne présente pas de livrable structuré, de jeu de données public fourni, ni de critères explicites de vérification de la qualité des résultats ou de la reproductibilité dans l’outil choisi. C’est une limite de guidage/évaluation observable, pas une preuve d’inexactitude de la source.
5. La vidéo introductive affirme une pratique avec Microsoft Copilot « directement dans Neopolis Akademy, sans installation ni changement d’onglet », alors que les TP demandent ensuite d’ouvrir un assistant externe choisi par l’apprenant. Le cours fournit un garde-fou de confidentialité, mais l’articulation entre démonstration, outil substituable et parcours réel peut être perçue comme incohérente. Source : bloc vidéo et blocs CloudExercise du JSON.

## Gravité et préparation pratique

**Sévérité globale : moyenne.** Les preuves ne démontrent ni reprise pédagogique factuellement fausse, ni dépendance DataCamp résiduelle ; en revanche, la combinaison de compteurs contradictoires et de TP nécessitant des fonctionnalités variables selon l’outil peut bloquer ou désorienter un apprenant.

**Préparation pratique : needs-learner-environment-guidance.** Les TP sont techniquement rubricables et séquentiels, mais leur autonomie dépend trop fortement de l’assistant IA choisi et de fonctions qui ne sont pas garanties par le guide générique.

## Correctifs génériques réutilisables par blocs Neopolis

- **Bloc `cloud_exercise` :** remplacer le guide unique par un encart standard « prérequis / outil compatible / alternative sans cette fonction / données autorisées », sans imposer un fournisseur.
- **Guidage pas-à-pas :** renseigner `instructions` ou `steps` avec une séquence courte et numérotée ; conserver `hint` pour le déblocage et `solution` pour la correction, plutôt que de concentrer toute la procédure dans ces deux champs.
- **Ressources :** joindre chaque fichier réellement requis comme ressource locale du bloc, ou remplacer la référence à un fichier « sur le bureau » par un petit jeu de données/publication fourni dans Neopolis.
- **Fonctions variables :** pour la planification, l’édition d’agent et l’ajout de connaissances, prévoir un parcours principal et un parcours alternatif générique (simulation manuelle ou prompt équivalent) avec un résultat attendu identique.
- **Évaluation :** utiliser une rubrique standard distinguant objectif, contexte/données, consignes, format de sortie, vérification humaine et limites/risques ; demander un livrable minimal structuré plutôt qu’un simple texte d’un mot.
- **Compteurs/manifeste :** choisir une source de vérité pour les activités conservées (28) et aligner les compteurs de certification, cours et manifeste visuel ; conserver séparément, si nécessaire, les totaux source (30) et Neopolis (28).

**Sources examinées :** `client/public/data/courses/ai_for_finance__01.json`, `docs/datacamp_ai_for_finance_alignment_2026-08-28.json`, `docs/datacamp_ai_for_finance_source_notes_2026-08-28.md`, `scripts/adapt-ai-for-finance.mjs`, `scripts/check-ai-for-finance-tps.mjs`, `scripts/register-ai-for-finance.mjs`, `docs/training-visual-manifest.json`. Aucun autre corpus externe n’a été utilisé.
