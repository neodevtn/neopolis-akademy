# Rapport d’intégration — Parcours Claude Science pour la recherche médicale (V2)

**Date :** 17 septembre 2026  
**Source de vérité :** package Drive V2, dont les trois fichiers COURSE.json ; aucun article externe n’a été recopié intégralement. Le contenu importé est un parcours pédagogique **français, non clinique**, limité aux données synthétiques fournies.

## Résultat d’intégration

Le parcours a été structuré comme **trois cours séquentiels** au sein de la catégorie **IA pour la recherche et la santé**. Chaque leçon reste une unité du lecteur : un seul écran est affiché, et les checkpoints côté serveur verrouillent la suite. Les cours 2 et 3 ne sont accessibles qu’après complétion du précédent parcours.

| Indicateur | Résultat |
|---|---:|
| Cours importés | 3 |
| Leçons source | 19 |
| Écrans source rapprochés | 98 |
| Chapitres Neopolis produits | 111 |
| Checkpoints serveur | 15 |
| TP évalués côté serveur | 4 |
| Questions de quiz finaux | 14 |
| Vidéos YouTube officielles/intégrées | 2 |
| Images documentaires attribuées | 5 |
| Ressources publiques de médiathèque | 16 |

| Cours | Leçons | Écrans source | Chapitres | Checkpoints | TP | Quiz final |
|---|---:|---:|---:|---:|---:|---:|
| Initiation a Claude et Claude Science pour la recherche | 6 | 32 | 36 | 6 | 0 | 6 |
| Claude Science : installation, utilisation et optimisation | 9 | 50 | 55 | 9 | 0 | 8 |
| Claude Science - Travaux pratiques de recherche medicale | 4 | 16 | 20 | 0 | 4 | 0 |

## Règles de sûreté et d’évaluation

Les réponses aux checkpoints, les clés des quiz finaux et les corrections TP sont séparées du JSON apprenant. Les quiz et checkpoints sont corrigés côté serveur. La correction d’un TP n’est rendue qu’après une soumission, et les clés historiques de correction, de sorties attendues et de scripts de solution sont explicitement refusées par le proxy d’assets.

L’évaluation libre des quatre TP appelle exclusivement **Claude Sonnet (claude-sonnet-4-6)**, avec une rubrique bornée, des données synthétiques, l’interdiction de toute conclusion clinique et l’exigence de contrôles reproductibles et humains. Les points attribués utilisent le système de **points de compétences** Neopolis.

## Matrice écran source → bloc Neopolis

| Cours | Module | Leçon | Écran source | Titre | Bloc(s) Neopolis | Statut |
|---|---|---|---|---|---|---|
| claude_science_01_initiation | IA generative et methode scientifique | L'IA generative dans la recherche scientifique | 1 · Objectives | Objectifs de la lecon | learning_objectives_panel | PASS |
| claude_science_01_initiation | IA generative et methode scientifique | L'IA generative dans la recherche scientifique | 2 · SourceGroundedText | Une assistance a chaque etape, jamais une preuve par elle-meme | content, source_references | PASS |
| claude_science_01_initiation | IA generative et methode scientifique | L'IA generative dans la recherche scientifique | 3 · GuidedAction | Construire une carte assistance-preuve | guided_action | PASS |
| claude_science_01_initiation | IA generative et methode scientifique | L'IA generative dans la recherche scientifique | 4 · CheckpointMCQ | Verifier la notion essentielle | single_choice_exercise | PASS |
| claude_science_01_initiation | IA generative et methode scientifique | L'IA generative dans la recherche scientifique | 5 · LessonSummary | A retenir | key_points_summary | PASS |
| claude_science_01_initiation | IA generative et methode scientifique | De la question de recherche a la preuve | 1 · Objectives | Objectifs de la lecon | learning_objectives_panel | PASS |
| claude_science_01_initiation | IA generative et methode scientifique | De la question de recherche a la preuve | 2 · SourceGroundedText | La chaine minimale d'un travail reproductible | content, source_references | PASS |
| claude_science_01_initiation | IA generative et methode scientifique | De la question de recherche a la preuve | 3 · GuidedAction | Tracer les portes de validation | guided_action | PASS |
| claude_science_01_initiation | IA generative et methode scientifique | De la question de recherche a la preuve | 4 · CheckpointMCQ | Verifier la notion essentielle | single_choice_exercise | PASS |
| claude_science_01_initiation | IA generative et methode scientifique | De la question de recherche a la preuve | 5 · LessonSummary | A retenir | key_points_summary | PASS |
| claude_science_01_initiation | De Claude au workbench Claude Science | Bien travailler avec Claude avant Claude Science | 1 · Objectives | Objectifs de la lecon | learning_objectives_panel | PASS |
| claude_science_01_initiation | De Claude au workbench Claude Science | Bien travailler avec Claude avant Claude Science | 2 · SourceGroundedText | Anatomie d'une demande scientifique utile | content, source_references | PASS |
| claude_science_01_initiation | De Claude au workbench Claude Science | Bien travailler avec Claude avant Claude Science | 3 · GuidedAction | Reecrire une demande trop vague | guided_action | PASS |
| claude_science_01_initiation | De Claude au workbench Claude Science | Bien travailler avec Claude avant Claude Science | 4 · CheckpointMCQ | Verifier la notion essentielle | single_choice_exercise | PASS |
| claude_science_01_initiation | De Claude au workbench Claude Science | Bien travailler avec Claude avant Claude Science | 5 · LessonSummary | A retenir | key_points_summary | PASS |
| claude_science_01_initiation | De Claude au workbench Claude Science | Comprendre ce qu'est Claude Science | 1 · Objectives | Objectifs de la lecon | learning_objectives_panel | PASS |
| claude_science_01_initiation | De Claude au workbench Claude Science | Comprendre ce qu'est Claude Science | 2 · SourceGroundedText | Un atelier scientifique, pas une autorite clinique | content, source_references | PASS |
| claude_science_01_initiation | De Claude au workbench Claude Science | Comprendre ce qu'est Claude Science | 3 · AnnotatedScreenshot | Se reperer dans le workbench et suivre la provenance | annotated_screenshot | PASS |
| claude_science_01_initiation | De Claude au workbench Claude Science | Comprendre ce qu'est Claude Science | 4 · VideoEmbed | Demonstration video | video | PASS |
| claude_science_01_initiation | De Claude au workbench Claude Science | Comprendre ce qu'est Claude Science | 5 · GuidedAction | Classer trois demandes | guided_action | PASS |
| claude_science_01_initiation | De Claude au workbench Claude Science | Comprendre ce qu'est Claude Science | 6 · CheckpointMCQ | Verifier la notion essentielle | single_choice_exercise | PASS |
| claude_science_01_initiation | De Claude au workbench Claude Science | Comprendre ce qu'est Claude Science | 7 · LessonSummary | A retenir | key_points_summary | PASS |
| claude_science_01_initiation | Conformite, donnees et autorisations | Proteger les donnees de recherche medicale | 1 · Objectives | Objectifs de la lecon | learning_objectives_panel | PASS |
| claude_science_01_initiation | Conformite, donnees et autorisations | Proteger les donnees de recherche medicale | 2 · SourceGroundedText | Le point critique : ce que Claude lit peut etre transmis | content, source_references | PASS |
| claude_science_01_initiation | Conformite, donnees et autorisations | Proteger les donnees de recherche medicale | 3 · GuidedAction | Evaluer un jeu de donnees avant import | guided_action | PASS |
| claude_science_01_initiation | Conformite, donnees et autorisations | Proteger les donnees de recherche medicale | 4 · CheckpointMCQ | Verifier la notion essentielle | single_choice_exercise | PASS |
| claude_science_01_initiation | Conformite, donnees et autorisations | Proteger les donnees de recherche medicale | 5 · LessonSummary | A retenir | key_points_summary | PASS |
| claude_science_01_initiation | Conformite, donnees et autorisations | Projets, sessions, permissions et sandbox | 1 · Objectives | Objectifs de la lecon | learning_objectives_panel | PASS |
| claude_science_01_initiation | Conformite, donnees et autorisations | Projets, sessions, permissions et sandbox | 2 · SourceGroundedText | Le modele de travail et de permissions | content, source_references | PASS |
| claude_science_01_initiation | Conformite, donnees et autorisations | Projets, sessions, permissions et sandbox | 3 · GuidedAction | Construire une matrice de permissions | guided_action | PASS |
| claude_science_01_initiation | Conformite, donnees et autorisations | Projets, sessions, permissions et sandbox | 4 · CheckpointMCQ | Verifier la notion essentielle | single_choice_exercise | PASS |
| claude_science_01_initiation | Conformite, donnees et autorisations | Projets, sessions, permissions et sandbox | 5 · LessonSummary | A retenir | key_points_summary | PASS |
| claude_science_02_pratique | Installation et premier lancement | Installer et reussir le premier lancement | 1 · Objectives | Objectifs de la lecon | learning_objectives_panel | PASS |
| claude_science_02_pratique | Installation et premier lancement | Installer et reussir le premier lancement | 2 · SourceGroundedText | Installation par systeme et controles de base | content, source_references | PASS |
| claude_science_02_pratique | Installation et premier lancement | Installer et reussir le premier lancement | 3 · GuidedAction | Realiser une fiche de recette d'installation | guided_action | PASS |
| claude_science_02_pratique | Installation et premier lancement | Installer et reussir le premier lancement | 4 · CheckpointMCQ | Verifier la notion essentielle | single_choice_exercise | PASS |
| claude_science_02_pratique | Installation et premier lancement | Installer et reussir le premier lancement | 5 · LessonSummary | A retenir | key_points_summary | PASS |
| claude_science_02_pratique | Projets, analyses et artefacts | Lancer une premiere analyse reproductible | 1 · Objectives | Objectifs de la lecon | learning_objectives_panel | PASS |
| claude_science_02_pratique | Projets, analyses et artefacts | Lancer une premiere analyse reproductible | 2 · SourceGroundedText | Du besoin scientifique a l'execution | content, source_references | PASS |
| claude_science_02_pratique | Projets, analyses et artefacts | Lancer une premiere analyse reproductible | 3 · GuidedAction | Executer l'analyse descriptive synthetique | guided_action | PASS |
| claude_science_02_pratique | Projets, analyses et artefacts | Lancer une premiere analyse reproductible | 4 · CheckpointMCQ | Verifier la notion essentielle | single_choice_exercise | PASS |
| claude_science_02_pratique | Projets, analyses et artefacts | Lancer une premiere analyse reproductible | 5 · LessonSummary | A retenir | key_points_summary | PASS |
| claude_science_02_pratique | Projets, analyses et artefacts | Lire et versionner les artefacts | 1 · Objectives | Objectifs de la lecon | learning_objectives_panel | PASS |
| claude_science_02_pratique | Projets, analyses et artefacts | Lire et versionner les artefacts | 2 · SourceGroundedText | Un resultat defendable conserve son histoire | content, source_references | PASS |
| claude_science_02_pratique | Projets, analyses et artefacts | Lire et versionner les artefacts | 3 · AnnotatedScreenshot | Lire un artefact single-cell sans le surinterpreter | annotated_screenshot | PASS |
| claude_science_02_pratique | Projets, analyses et artefacts | Lire et versionner les artefacts | 4 · GuidedAction | Auditer une figure avant reutilisation | guided_action | PASS |
| claude_science_02_pratique | Projets, analyses et artefacts | Lire et versionner les artefacts | 5 · CheckpointMCQ | Verifier la notion essentielle | single_choice_exercise | PASS |
| claude_science_02_pratique | Projets, analyses et artefacts | Lire et versionner les artefacts | 6 · LessonSummary | A retenir | key_points_summary | PASS |
| claude_science_02_pratique | Projets, analyses et artefacts | Commenter un resultat et utiliser le reviewer | 1 · Objectives | Objectifs de la lecon | learning_objectives_panel | PASS |
| claude_science_02_pratique | Projets, analyses et artefacts | Commenter un resultat et utiliser le reviewer | 2 · SourceGroundedText | Deux controles differents : commentaire et reviewer | content, source_references | PASS |
| claude_science_02_pratique | Projets, analyses et artefacts | Commenter un resultat et utiliser le reviewer | 3 · AnnotatedScreenshot | Commenter, inspecter et telecharger un artefact | annotated_screenshot | PASS |
| claude_science_02_pratique | Projets, analyses et artefacts | Commenter un resultat et utiliser le reviewer | 4 · GuidedAction | Traiter une alerte de reviewer | guided_action | PASS |
| claude_science_02_pratique | Projets, analyses et artefacts | Commenter un resultat et utiliser le reviewer | 5 · CheckpointMCQ | Verifier la notion essentielle | single_choice_exercise | PASS |
| claude_science_02_pratique | Projets, analyses et artefacts | Commenter un resultat et utiliser le reviewer | 6 · LessonSummary | A retenir | key_points_summary | PASS |
| claude_science_02_pratique | Environnement d'analyse, litterature et connecteurs | Choisir et documenter l'environnement d'analyse | 1 · Objectives | Objectifs de la lecon | learning_objectives_panel | PASS |
| claude_science_02_pratique | Environnement d'analyse, litterature et connecteurs | Choisir et documenter l'environnement d'analyse | 2 · SourceGroundedText | Le chercheur valide la methode ; Claude peut preparer le code | content, source_references | PASS |
| claude_science_02_pratique | Environnement d'analyse, litterature et connecteurs | Choisir et documenter l'environnement d'analyse | 3 · GuidedAction | Preparer une fiche d'analyse reproductible | guided_action | PASS |
| claude_science_02_pratique | Environnement d'analyse, litterature et connecteurs | Choisir et documenter l'environnement d'analyse | 4 · CheckpointMCQ | Verifier la notion essentielle | single_choice_exercise | PASS |
| claude_science_02_pratique | Environnement d'analyse, litterature et connecteurs | Choisir et documenter l'environnement d'analyse | 5 · LessonSummary | A retenir | key_points_summary | PASS |
| claude_science_02_pratique | Environnement d'analyse, litterature et connecteurs | Connecter les bases, la litterature et les skills | 1 · Objectives | Objectifs de la lecon | learning_objectives_panel | PASS |
| claude_science_02_pratique | Environnement d'analyse, litterature et connecteurs | Connecter les bases, la litterature et les skills | 2 · SourceGroundedText | Sources, outils et procedures reutilisables | content, source_references | PASS |
| claude_science_02_pratique | Environnement d'analyse, litterature et connecteurs | Connecter les bases, la litterature et les skills | 3 · GuidedAction | Tracer une recherche exploratoire | guided_action | PASS |
| claude_science_02_pratique | Environnement d'analyse, litterature et connecteurs | Connecter les bases, la litterature et les skills | 4 · CheckpointMCQ | Verifier la notion essentielle | single_choice_exercise | PASS |
| claude_science_02_pratique | Environnement d'analyse, litterature et connecteurs | Connecter les bases, la litterature et les skills | 5 · LessonSummary | A retenir | key_points_summary | PASS |
| claude_science_02_pratique | Interpretation, calcul encadre et optimisation | Analyser sans surinterpreter | 1 · Objectives | Objectifs de la lecon | learning_objectives_panel | PASS |
| claude_science_02_pratique | Interpretation, calcul encadre et optimisation | Analyser sans surinterpreter | 2 · SourceGroundedText | Une belle figure n'est pas une conclusion medicale | content, source_references | PASS |
| claude_science_02_pratique | Interpretation, calcul encadre et optimisation | Analyser sans surinterpreter | 3 · AnnotatedScreenshot | Distinguer visualisation, annotation et preuve biologique | annotated_screenshot | PASS |
| claude_science_02_pratique | Interpretation, calcul encadre et optimisation | Analyser sans surinterpreter | 4 · GuidedAction | Reviser un paragraphe de resultats | guided_action | PASS |
| claude_science_02_pratique | Interpretation, calcul encadre et optimisation | Analyser sans surinterpreter | 5 · CheckpointMCQ | Verifier la notion essentielle | single_choice_exercise | PASS |
| claude_science_02_pratique | Interpretation, calcul encadre et optimisation | Analyser sans surinterpreter | 6 · LessonSummary | A retenir | key_points_summary | PASS |
| claude_science_02_pratique | Interpretation, calcul encadre et optimisation | Savoir quand utiliser un calcul distant ou un stockage institutionnel | 1 · Objectives | Objectifs de la lecon | learning_objectives_panel | PASS |
| claude_science_02_pratique | Interpretation, calcul encadre et optimisation | Savoir quand utiliser un calcul distant ou un stockage institutionnel | 2 · SourceGroundedText | Le chercheur decide du cadre ; l'equipe technique execute dans l'infrastructure approuvee | content, source_references | PASS |
| claude_science_02_pratique | Interpretation, calcul encadre et optimisation | Savoir quand utiliser un calcul distant ou un stockage institutionnel | 3 · AnnotatedScreenshot | Suivre un calcul distant et son environnement vivant | annotated_screenshot | PASS |
| claude_science_02_pratique | Interpretation, calcul encadre et optimisation | Savoir quand utiliser un calcul distant ou un stockage institutionnel | 4 · GuidedAction | Preparer une demande de calcul encadree | guided_action | PASS |
| claude_science_02_pratique | Interpretation, calcul encadre et optimisation | Savoir quand utiliser un calcul distant ou un stockage institutionnel | 5 · CheckpointMCQ | Verifier la notion essentielle | single_choice_exercise | PASS |
| claude_science_02_pratique | Interpretation, calcul encadre et optimisation | Savoir quand utiliser un calcul distant ou un stockage institutionnel | 6 · LessonSummary | A retenir | key_points_summary | PASS |
| claude_science_02_pratique | Interpretation, calcul encadre et optimisation | Optimiser Claude Science sans perdre la rigueur | 1 · Objectives | Objectifs de la lecon | learning_objectives_panel | PASS |
| claude_science_02_pratique | Interpretation, calcul encadre et optimisation | Optimiser Claude Science sans perdre la rigueur | 2 · SourceGroundedText | Optimiser le workflow, pas seulement le temps de calcul | content, source_references | PASS |
| claude_science_02_pratique | Interpretation, calcul encadre et optimisation | Optimiser Claude Science sans perdre la rigueur | 3 · VideoEmbed | Demonstration video | video | PASS |
| claude_science_02_pratique | Interpretation, calcul encadre et optimisation | Optimiser Claude Science sans perdre la rigueur | 4 · GuidedAction | Optimiser un workflow existant | guided_action | PASS |
| claude_science_02_pratique | Interpretation, calcul encadre et optimisation | Optimiser Claude Science sans perdre la rigueur | 5 · CheckpointMCQ | Verifier la notion essentielle | single_choice_exercise | PASS |
| claude_science_02_pratique | Interpretation, calcul encadre et optimisation | Optimiser Claude Science sans perdre la rigueur | 6 · LessonSummary | A retenir | key_points_summary | PASS |
| claude_science_03_travaux_pratiques | TP 1 - Recette d'installation et matrice de permissions | Recette d'installation et matrice de permissions | 1 · Objectives | Objectifs de la lecon | learning_objectives_panel | PASS |
| claude_science_03_travaux_pratiques | TP 1 - Recette d'installation et matrice de permissions | Recette d'installation et matrice de permissions | 2 · EnvironmentPreparation | Preparer votre environnement local | callout, download, download | PASS |
| claude_science_03_travaux_pratiques | TP 1 - Recette d'installation et matrice de permissions | Recette d'installation et matrice de permissions | 3 · PracticalLab | Recette d'installation et matrice de permissions | cloud_exercise | PASS |
| claude_science_03_travaux_pratiques | TP 1 - Recette d'installation et matrice de permissions | Recette d'installation et matrice de permissions | 4 · Reflection | Retour critique | reflection | PASS |
| claude_science_03_travaux_pratiques | TP 2 - Analyse descriptive reproductible | Analyse descriptive reproductible | 1 · Objectives | Objectifs de la lecon | learning_objectives_panel | PASS |
| claude_science_03_travaux_pratiques | TP 2 - Analyse descriptive reproductible | Analyse descriptive reproductible | 2 · EnvironmentPreparation | Preparer votre environnement local | callout, download, download | PASS |
| claude_science_03_travaux_pratiques | TP 2 - Analyse descriptive reproductible | Analyse descriptive reproductible | 3 · PracticalLab | Analyse descriptive reproductible | cloud_exercise | PASS |
| claude_science_03_travaux_pratiques | TP 2 - Analyse descriptive reproductible | Analyse descriptive reproductible | 4 · Reflection | Retour critique | reflection | PASS |
| claude_science_03_travaux_pratiques | TP 3 - Recherche bibliographique exploratoire et piste de preuve | Recherche bibliographique exploratoire et piste de preuve | 1 · Objectives | Objectifs de la lecon | learning_objectives_panel | PASS |
| claude_science_03_travaux_pratiques | TP 3 - Recherche bibliographique exploratoire et piste de preuve | Recherche bibliographique exploratoire et piste de preuve | 2 · EnvironmentPreparation | Preparer votre environnement local | callout, download, download, download | PASS |
| claude_science_03_travaux_pratiques | TP 3 - Recherche bibliographique exploratoire et piste de preuve | Recherche bibliographique exploratoire et piste de preuve | 3 · PracticalLab | Recherche bibliographique exploratoire et piste de preuve | cloud_exercise | PASS |
| claude_science_03_travaux_pratiques | TP 3 - Recherche bibliographique exploratoire et piste de preuve | Recherche bibliographique exploratoire et piste de preuve | 4 · Reflection | Retour critique | reflection | PASS |
| claude_science_03_travaux_pratiques | TP 4 - Capstone : dossier d'expression genique reproductible | Capstone : dossier d'expression genique reproductible | 1 · Objectives | Objectifs de la lecon | learning_objectives_panel | PASS |
| claude_science_03_travaux_pratiques | TP 4 - Capstone : dossier d'expression genique reproductible | Capstone : dossier d'expression genique reproductible | 2 · EnvironmentPreparation | Preparer votre environnement local | callout, download, download, download | PASS |
| claude_science_03_travaux_pratiques | TP 4 - Capstone : dossier d'expression genique reproductible | Capstone : dossier d'expression genique reproductible | 3 · PracticalLab | Capstone : dossier d'expression genique reproductible | cloud_exercise | PASS |
| claude_science_03_travaux_pratiques | TP 4 - Capstone : dossier d'expression genique reproductible | Capstone : dossier d'expression genique reproductible | 4 · Reflection | Retour critique | reflection | PASS |

## Inventaire des assets de médiathèque

Les vidéos restent des intégrations YouTube (aucun téléchargement vidéo). Les ressources listées ci-dessous sont servies depuis la médiathèque Neopolis par des URL /api/assets/ versionnées.

| Fichier source | Type | Octets | SHA-256 | URL Neopolis |
|---|---|---:|---|---|
| courses/01_initiation_claude_et_claude_science/media/official/science-pillars-artifacts.webp | image | 151822 | `cb9698ce8c4603a0cb9a65da594a7fd7369c7a5920a36b3af42d1061856293a2` | /api/assets/claude-science-v2/01_initiation_claude_et_claude_science/media/official/science-pillars-artifacts_f1f9db30.webp |
| courses/02_claude_science_installation_utilisation_optimisation/media/official/protein-structure.webp | image | 49188 | `f6f6fdc00fbd33ffed79373e7576ec2c5b749d921797f328e765d5bc97b1ebf0` | /api/assets/claude-science-v2/02_claude_science_installation_utilisation_optimisation/media/official/protein-structure_ee2c97da.webp |
| courses/02_claude_science_installation_utilisation_optimisation/media/official/science-pillars-compute.webp | image | 150132 | `0ba82441ab8ca630443512dbba4089a372ecb7352cc6e943fea94532a52d8e4d` | /api/assets/claude-science-v2/02_claude_science_installation_utilisation_optimisation/media/official/science-pillars-compute_72092ff7.webp |
| courses/02_claude_science_installation_utilisation_optimisation/media/official/science-pillars-domain.webp | image | 147276 | `370ad557ec8c66a08c2f9ddbd76d07d3d92e604711bb8afb25f1ad8429d009fe` | /api/assets/claude-science-v2/02_claude_science_installation_utilisation_optimisation/media/official/science-pillars-domain_9f5ab1b5.webp |
| courses/02_claude_science_installation_utilisation_optimisation/media/official/single-cell-rna-seq.webp | image | 151290 | `0ec576f5c0c7dde76813ad2a8134edd75a80a9d7a8bb8650461ad2416ced8e42` | /api/assets/claude-science-v2/02_claude_science_installation_utilisation_optimisation/media/official/single-cell-rna-seq_b61d7698.webp |
| courses/03_claude_science_travaux_pratiques/downloads/data/clinical_study_synthetic.csv | download | 10658 | `8fbb9a67d62e214749e953366244d4440828ab6b38fdb3219d8f76c2311ae90e` | /api/assets/claude-science-v2/03_claude_science_travaux_pratiques/downloads/data/clinical_study_synthetic_939bd1d9.csv |
| courses/03_claude_science_travaux_pratiques/downloads/data/gene_expression_synthetic.csv | download | 4027 | `3d3098b611c77d00261f090c3ac8df185b15cb71848a0950bbfb75cc43b08149` | /api/assets/claude-science-v2/03_claude_science_travaux_pratiques/downloads/data/gene_expression_synthetic_09f6b9ea.csv |
| courses/03_claude_science_travaux_pratiques/downloads/data/literature_screening_synthetic.csv | download | 2809 | `7508ccf268fa6bb3d05c0f4597a0860f0f38e948d378b5a8ee01177af7491905` | /api/assets/claude-science-v2/03_claude_science_travaux_pratiques/downloads/data/literature_screening_synthetic_f73774a0.csv |
| courses/03_claude_science_travaux_pratiques/downloads/downloads_manifest.json | download | 2576 | `31acc3ee4bf9b4217c031a5463560732216107c27b752296eab8f90ed84e5543` | /api/assets/claude-science-v2/03_claude_science_travaux_pratiques/downloads/downloads_manifest_19c67b5a.json |
| courses/03_claude_science_travaux_pratiques/downloads/scripts/starter_descriptive_analysis.py | download | 170 | `300cb3eb2303de1976f84cbdaa33587c18bd0755b9686742e8e5e06ad37f473b` | /api/assets/claude-science-v2/03_claude_science_travaux_pratiques/downloads/scripts/starter_descriptive_analysis_1b63f25b.py |
| courses/03_claude_science_travaux_pratiques/downloads/scripts/starter_gene_expression.py | download | 189 | `775b02ef1f5f0d860d6b47411c469fd96a479fe7c3e3246ffe8f09c8aa3a614d` | /api/assets/claude-science-v2/03_claude_science_travaux_pratiques/downloads/scripts/starter_gene_expression_237b99be.py |
| courses/03_claude_science_travaux_pratiques/downloads/templates/capstone_submission_template.md | download | 274 | `1b6edd5e89643f07ed2cecb17d922fbcf7d562c7c3e332b78800ea7c18e11987` | /api/assets/claude-science-v2/03_claude_science_travaux_pratiques/downloads/templates/capstone_submission_template_1d1c44ef.md |
| courses/03_claude_science_travaux_pratiques/downloads/templates/fiche_recette_installation.md | download | 211 | `2f870d03d51990834bff541c8c00df308185d4bc30e53b80464626ab174fbd12` | /api/assets/claude-science-v2/03_claude_science_travaux_pratiques/downloads/templates/fiche_recette_installation_e99133c6.md |
| courses/03_claude_science_travaux_pratiques/downloads/templates/matrice_permissions.csv | download | 65 | `6172196ff35db37d4a9d4d363164588ef60480a7ebed6c1e8894c7d753c43451` | /api/assets/claude-science-v2/03_claude_science_travaux_pratiques/downloads/templates/matrice_permissions_a3bbacf1.csv |
| courses/03_claude_science_travaux_pratiques/downloads/templates/matrice_sources_affirmations.csv | download | 78 | `67e270935c49a0650eb8a8f30c4fd12caca8f6e538e22d2e4ccd1e4c0314023b` | /api/assets/claude-science-v2/03_claude_science_travaux_pratiques/downloads/templates/matrice_sources_affirmations_212430e3.csv |
| courses/03_claude_science_travaux_pratiques/downloads/templates/protocole_recherche_exploratoire.md | download | 787 | `46adda004876c15a348d7b681c9f361f4cb82420e21603ca91dccb847d619672` | /api/assets/claude-science-v2/03_claude_science_travaux_pratiques/downloads/templates/protocole_recherche_exploratoire_28bfba08.md |

**Vérification d’accès :** les 16 URL d’assets restants répondent HTTP 200 localement ; les 0 artefacts d’évaluation restent absents de l’inventaire public. Les anciennes URL de correction/sortie attendue sont renvoyées en HTTP 404 par politique applicative.

## Contrôles exécutés

| Contrôle | Résultat |
|---|---|
| TypeScript (pnpm check) | PASS |
| Contrats V2, données cours et proxy d’assets | PASS |
| Contrat de verrouillage TP, quiz final et réflexion | PASS |
| Index de recherche | PASS — 180 cours, 3 639 chapitres, 3 935 entrées |
| Ressources de médiathèque V2 | PASS — 16/16 URL publiques 200 |
| Captures/lecteur desktop et tablette | PASS avec communication globale obstruante documentée |
| Lecteur vidéo 1 et 2 | PASS — iframes officielles visibles après 22 secondes ; audio géré par le contrôle YouTube |
| Prévisualisation mobile automatisée | À rejouer — le limiteur global a renvoyé HTTP 429 après les captures répétées |
| Parcours intégral avec compte dédié | À rejouer après publication avec un compte apprenant isolé ; aucune progression réelle n’a été modifiée pendant l’intégration |

## Observations de prévisualisation

# Observations de QA visuelle — V2

- **Prévisualisation apprenant, cours 1, première leçon :** le lecteur charge le parcours avec six leçons séparées dans la barre latérale, un écran pédagogique unique, la navigation Précédent/Suivant et une progression à zéro. Le sélecteur de langue n’est pas affiché pour ce contenu français uniquement.
- **Avertissement médical :** l’avertissement non clinique est visible dès l’entrée du premier module, avant la matière pédagogique, et rappelle l’interdiction des données de santé protégées ainsi que la validation humaine.
- **Mise en page 1440/1280 :** pas de débordement horizontal, pas de texte JSON/Markdown brut, barre latérale et zone de lecture contenues. Le titre du module et le titre du premier écran ont une proximité visuelle attendue mais restent des niveaux de contexte distincts.
- **Capture annotée, cours 1 :** la capture officielle rendue depuis la médiathèque affiche les cinq repères A–E, le texte alternatif, la légende, les actions de vérification, l’avertissement d’interprétation et le lien d’attribution. Les contrôles zoom et plein écran sont présents et la page reste contenue sans débordement.
- **Navigation de vérification vidéo :** l’écran vidéo du cours 1 a été ouvert dans le lecteur apprenant ; un cycle de chargement normal est constaté avant l’inspection du lecteur intégré.
- **Vidéo intégrée 1 :** le lecteur standard affiche l’objectif, la langue, la durée, les questions après lecture et l’alternative française. Après lancement, l’API YouTube a produit un iframe visible vers l’intégration officielle et celui-ci était toujours actif après 22 secondes ; la lecture embarquée n’a pas basculé vers son mode de récupération. Le navigateur d’automatisation ne fournit pas de sonomètre exportable ; l’iframe s’appuie donc sur la piste audio officielle de YouTube, contrôlable par l’apprenant.
- **Vidéo intégrée 2 :** l’écran de ressource longue se charge avec sa durée, son statut de complément et son alternative française. Le lecteur YouTube officiel a créé son nœud `movie_player` après activation ; il est explicitement signalé « Tap to unmute », ce qui confirme que la piste audio existe mais suit le comportement d’autoplay muet du navigateur.
- **Lecture prolongée vidéo 2 :** après activation audio et 22 secondes supplémentaires, l’iframe officielle YouTube restait présente et visible dans le lecteur Neopolis ; aucun écran de récupération fournisseur n’a été rendu. Les deux vidéos référencées sont donc disponibles via leurs intégrations officielles, sans téléchargement local.
- **Captures 1440×900 et 768×1024 :** le lecteur reste responsive, mais une communication globale déjà présente dans la session de test est affichée au premier plan. La fenêtre est contenue au format tablette et n’est pas une anomalie du cours ; elle empêche simplement une capture non obstruée par le robot de prévisualisation sans accuser réception au nom de l’utilisateur.
- **Prévisualisation mobile 390×844 :** le premier rendu de l’outil était vide, puis le second a reçu `429 Too many requests`. Cela provient du limiteur global après les captures automatisées répétées, et non du routeur de cours ; aucune conclusion sur un écran mobile vide n’est retenue. La validation visuelle mobile doit être rejouée après expiration de la fenêtre de limitation ou avec une session apprenante dédiée.

## Limites de validation restantes

Le contrôle fonctionnel complet avec un compte apprenant distinct est volontairement reporté au post-déploiement afin de ne pas modifier la progression d’un compte réel. La capture mobile automatique a été interrompue par la limite globale de requêtes, après les captures précédentes ; c’est un résultat d’infrastructure de QA, non un écran blanc attribué au cours. La publication ne doit être considérée définitive qu’après cette relecture post-publication sur une session apprenante dédiée.
