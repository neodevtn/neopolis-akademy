# Backlog exhaustif des P1 ouverts — 18 octobre 2026

## Périmètre et statut

- **85 P1 ouverts**, issus de la contre-évaluation validée de 116 formations, 180 cours et 3 003 écrans actuels.
- Un P1 est un défaut substantiel qui dégrade clairement l’apprentissage, l’évaluation, la cohérence linguistique ou la fidélité d’un contenu, sans bloquer systématiquement tout le parcours.
- Les P0 restent traités séparément : ils empêchent la déclaration de conformité globale. Les P1 ci-dessous empêchent également de considérer une formation comme « finalisée » tant qu’ils ne sont pas corrigés ou explicitement écartés après vérification.
- Les références de fichiers pointent vers le JSON courant du cours et l’identifiant d’écran concerné. Elles ne s’appuient pas sur les dossiers de travail temporaires de la réévaluation.

## Répartition par famille de défaut

| Famille | P1 | Traitement rapide privilégié |
|---|---:|---|
| Localisation et accessibilité linguistique | 28 | Traduire les champs affichés et fournir une alternative textuelle FR ; si ce n’est pas disponible rapidement, retirer l’écran ou le média de la version FR. |
| Promesse d’activité, lab ou contenu non livré | 22 | Supprimer l’annonce ou l’écran sans livrable ; ne conserver une activité que si toutes ses ressources existent. |
| Contenu insuffisant ou non aligné avec le thème | 10 | Remplacer par contenu spécifique vérifié ou retirer l’écran répétitif. |
| Rendu ou accessibilité des médias | 7 | Utiliser le type de source vidéo adapté ou retirer la démonstration visuelle incomplète. |
| Contenu présent dans les données mais non rendu | 7 | Déplacer le contenu dans un bloc `content` standard rendu par le lecteur, ou retirer la promesse de contenu. |
| Exactitude technique des exemples | 6 | Corriger l’extrait avec une source vérifiée ; retirer l’exemple s’il ne peut pas être vérifié rapidement. |
| Évaluation incomplète ou non alignée | 5 | Ajuster questions/critères aux acquis réels ; supprimer l’activité si aucune correction fiable n’est disponible. |

## Répartition par formation

| Formation | P1 | Nature dominante |
|---|---:|---|
| Développement logiciel avec GitHub Copilot | 11 | Localisation et accessibilité linguistique |
| Innover avec Google Cloud AI | 11 | Promesse d’activité, lab ou contenu non livré |
| Automatisation comptable par l’IA | 10 | Contenu insuffisant ou non aligné avec le thème |
| Gemini dans Google Docs | 8 | Localisation et accessibilité linguistique |
| Coder en mode Vibe avec Replit | 7 | Rendu ou accessibilité des médias |
| Introduction aux Agent Skills | 6 | Localisation et accessibilité linguistique |
| Open-Source LLMs and Fine-Tuning Engineer | 5 | Contenu présent dans les données mais non rendu |
| Databricks avec le SDK Python | 3 | Exactitude technique des exemples |
| Déployer l’IA en production avec FastAPI | 3 | Exactitude technique des exemples |
| Full-Stack AI Application Developer | 3 | Promesse d’activité, lab ou contenu non livré |
| LLMOps and AI Observability Engineer | 3 | Contenu présent dans les données mais non rendu |
| Agence SEO autonome composée de plusieurs agents | 2 | Localisation et accessibilité linguistique |
| Claude Certified Developer – Fondations | 2 | Évaluation incomplète ou non alignée |
| Créer des workflows agentiques avec LlamaIndex | 2 | Promesse d’activité, lab ou contenu non livré |
| Utiliser l’API OpenAI Responses | 2 | Promesse d’activité, lab ou contenu non livré |
| AI Governance, Compliance and Responsible AI Leader | 1 | Promesse d’activité, lab ou contenu non livré |
| Agent RAG pour analyser les résultats financiers d'entreprises | 1 | Évaluation incomplète ou non alignée |
| Agent Zendesk RAG avec base documentaire et mémoire | 1 | Localisation et accessibilité linguistique |
| Concevoir un agent IA de support client | 1 | Évaluation incomplète ou non alignée |
| Construire un Data Analyst IA conversationnel | 1 | Évaluation incomplète ou non alignée |
| Créer des agents d’IA avec CrewAI | 1 | Promesse d’activité, lab ou contenu non livré |
| LLM Application Security and Red Teaming Specialist | 1 | Promesse d’activité, lab ou contenu non livré |

## Liste complète et preuves

Chaque ligne est un P1 distinct. Les écrans listés sont ceux de l’état actuel du catalogue.

### Développement logiciel avec GitHub Copilot — 11 P1

| # | Cours / écran | Famille | Constat vérifié | Source |
|---:|---|---|---|---|
| 38 | `software_development_with_github_copilot__01` / `dc_ch01_act01` | Localisation et accessibilité linguistique | La théorie principale est rendue en anglais dans un parcours français ; la vidéo ne fournit ni sous-titre français ni alternative française intégrée. | `client/public/data/courses/software_development_with_github_copilot__01.json` — `dc_ch01_act01` |
| 39 | `software_development_with_github_copilot__01` / `dc_ch01_act03` | Localisation et accessibilité linguistique | La théorie principale est rendue en anglais dans un parcours français ; la vidéo ne fournit ni sous-titre français ni alternative française intégrée. | `client/public/data/courses/software_development_with_github_copilot__01.json` — `dc_ch01_act03` |
| 40 | `software_development_with_github_copilot__01` / `dc_ch01_act07` | Localisation et accessibilité linguistique | La théorie principale est rendue en anglais dans un parcours français ; la vidéo ne fournit ni sous-titre français ni alternative française intégrée. | `client/public/data/courses/software_development_with_github_copilot__01.json` — `dc_ch01_act07` |
| 41 | `software_development_with_github_copilot__01` / `dc_ch02_act01` | Localisation et accessibilité linguistique | La théorie principale est rendue en anglais dans un parcours français ; la vidéo ne fournit ni sous-titre français ni alternative française intégrée. | `client/public/data/courses/software_development_with_github_copilot__01.json` — `dc_ch02_act01` |
| 42 | `software_development_with_github_copilot__01` / `dc_ch02_act04` | Localisation et accessibilité linguistique | La théorie principale est rendue en anglais dans un parcours français ; la vidéo ne fournit ni sous-titre français ni alternative française intégrée. | `client/public/data/courses/software_development_with_github_copilot__01.json` — `dc_ch02_act04` |
| 43 | `software_development_with_github_copilot__01` / `dc_ch02_act07` | Localisation et accessibilité linguistique | La théorie principale est rendue en anglais dans un parcours français ; la vidéo ne fournit ni sous-titre français ni alternative française intégrée. | `client/public/data/courses/software_development_with_github_copilot__01.json` — `dc_ch02_act07` |
| 44 | `software_development_with_github_copilot__01` / `dc_ch03_act04` | Localisation et accessibilité linguistique | La théorie principale est rendue en anglais dans un parcours français ; la vidéo ne fournit ni sous-titre français ni alternative française intégrée. | `client/public/data/courses/software_development_with_github_copilot__01.json` — `dc_ch03_act04` |
| 45 | `software_development_with_github_copilot__01` / `dc_ch03_act08` | Localisation et accessibilité linguistique | La théorie principale est rendue en anglais dans un parcours français ; la vidéo ne fournit ni sous-titre français ni alternative française intégrée. | `client/public/data/courses/software_development_with_github_copilot__01.json` — `dc_ch03_act08` |
| 46 | `software_development_with_github_copilot__01` / `dc_ch04_act01` | Localisation et accessibilité linguistique | La théorie principale est rendue en anglais dans un parcours français ; la vidéo ne fournit ni sous-titre français ni alternative française intégrée. | `client/public/data/courses/software_development_with_github_copilot__01.json` — `dc_ch04_act01` |
| 47 | `software_development_with_github_copilot__01` / `dc_ch04_act05` | Localisation et accessibilité linguistique | La théorie principale est rendue en anglais dans un parcours français ; la vidéo ne fournit ni sous-titre français ni alternative française intégrée. | `client/public/data/courses/software_development_with_github_copilot__01.json` — `dc_ch04_act05` |
| 48 | `software_development_with_github_copilot__01` / `dc_ch04_act09` | Localisation et accessibilité linguistique | La théorie principale est rendue en anglais dans un parcours français ; la vidéo ne fournit ni sous-titre français ni alternative française intégrée. | `client/public/data/courses/software_development_with_github_copilot__01.json` — `dc_ch04_act09` |

### Innover avec Google Cloud AI — 11 P1

| # | Cours / écran | Famille | Constat vérifié | Source |
|---:|---|---|---|---|
| 21 | `innovating_with_google_cloud_ai__01` / `dc_ch01_act01` | Promesse d’activité, lab ou contenu non livré | Après le bloc de préparation de sécurité, le seul bloc relatif au thème est « Consultez le contenu avant de continuer. » avec optionalMediaUnavailable=true ; aucun média, lien ni explication de remplacement propre au sujet n’est rendu. Le constat porte sur le fallback actuel, non sur l’existence du support source. | `client/public/data/courses/innovating_with_google_cloud_ai__01.json` — `dc_ch01_act01` |
| 22 | `innovating_with_google_cloud_ai__01` / `dc_ch01_act02` | Promesse d’activité, lab ou contenu non livré | L’écran ne rend que « Consultez le contenu avant de continuer. » avec optionalMediaUnavailable=true, sans média, lien ni explication de remplacement propre au thème annoncé. Le constat porte sur le fallback actuel, non sur l’existence du support source. | `client/public/data/courses/innovating_with_google_cloud_ai__01.json` — `dc_ch01_act02` |
| 23 | `innovating_with_google_cloud_ai__01` / `dc_ch01_act03` | Promesse d’activité, lab ou contenu non livré | L’écran ne rend que « Consultez le contenu avant de continuer. » avec optionalMediaUnavailable=true, sans média, lien ni explication de remplacement propre au thème annoncé. Le constat porte sur le fallback actuel, non sur l’existence du support source. | `client/public/data/courses/innovating_with_google_cloud_ai__01.json` — `dc_ch01_act03` |
| 24 | `innovating_with_google_cloud_ai__01` / `dc_ch01_act04` | Promesse d’activité, lab ou contenu non livré | L’écran ne rend que « Consultez le contenu avant de continuer. » avec optionalMediaUnavailable=true, sans média, lien ni explication de remplacement propre au thème annoncé. Le constat porte sur le fallback actuel, non sur l’existence du support source. | `client/public/data/courses/innovating_with_google_cloud_ai__01.json` — `dc_ch01_act04` |
| 25 | `innovating_with_google_cloud_ai__01` / `dc_ch01_act05` | Promesse d’activité, lab ou contenu non livré | L’écran ne rend que « Consultez le contenu avant de continuer. » avec optionalMediaUnavailable=true, sans média, lien ni explication de remplacement propre au thème annoncé. Le constat porte sur le fallback actuel, non sur l’existence du support source. | `client/public/data/courses/innovating_with_google_cloud_ai__01.json` — `dc_ch01_act05` |
| 26 | `innovating_with_google_cloud_ai__01` / `dc_ch02_act01` | Promesse d’activité, lab ou contenu non livré | L’écran ne rend que « Consultez le contenu avant de continuer. » avec optionalMediaUnavailable=true, sans média, lien ni explication de remplacement propre au thème annoncé. Le constat porte sur le fallback actuel, non sur l’existence du support source. | `client/public/data/courses/innovating_with_google_cloud_ai__01.json` — `dc_ch02_act01` |
| 27 | `innovating_with_google_cloud_ai__01` / `dc_ch02_act02` | Promesse d’activité, lab ou contenu non livré | L’écran ne rend que « Consultez le contenu avant de continuer. » avec optionalMediaUnavailable=true, sans média, lien ni explication de remplacement propre au thème annoncé. Le constat porte sur le fallback actuel, non sur l’existence du support source. | `client/public/data/courses/innovating_with_google_cloud_ai__01.json` — `dc_ch02_act02` |
| 28 | `innovating_with_google_cloud_ai__01` / `dc_ch02_act03` | Promesse d’activité, lab ou contenu non livré | L’écran ne rend que « Consultez le contenu avant de continuer. » avec optionalMediaUnavailable=true, sans média, lien ni explication de remplacement propre au thème annoncé. Le constat porte sur le fallback actuel, non sur l’existence du support source. | `client/public/data/courses/innovating_with_google_cloud_ai__01.json` — `dc_ch02_act03` |
| 29 | `innovating_with_google_cloud_ai__01` / `dc_ch02_act04` | Promesse d’activité, lab ou contenu non livré | L’écran ne rend que « Consultez le contenu avant de continuer. » avec optionalMediaUnavailable=true, sans média, lien ni explication de remplacement propre au thème annoncé. Le constat porte sur le fallback actuel, non sur l’existence du support source. | `client/public/data/courses/innovating_with_google_cloud_ai__01.json` — `dc_ch02_act04` |
| 30 | `innovating_with_google_cloud_ai__01` / `dc_ch03_act01` | Promesse d’activité, lab ou contenu non livré | Le chapitre annonce un récapitulatif et des prochaines étapes, mais ne rend que « Consultez le contenu avant de continuer. » avec optionalMediaUnavailable=true, sans synthèse, média, lien ni contenu de remplacement. Le constat porte sur le fallback rendu, non sur l’existence du support source. | `client/public/data/courses/innovating_with_google_cloud_ai__01.json` — `dc_ch03_act01` |
| 31 | `innovating_with_google_cloud_ai__01` / `dc_ch04_act01` | Promesse d’activité, lab ou contenu non livré | Le chapitre annonce le téléchargement d’un guide d’étude, mais le rendu courant ne contient ni bloc download, ni resource_review, ni URL : seul le texte « Consultez le PDF avant de continuer. » est présent avec optionalMediaUnavailable=true. Le constat porte sur l’absence de moyen d’accès dans l’écran courant, non sur l’existence du PDF source. | `client/public/data/courses/innovating_with_google_cloud_ai__01.json` — `dc_ch04_act01` |

### Automatisation comptable par l’IA — 10 P1

| # | Cours / écran | Famille | Constat vérifié | Source |
|---:|---|---|---|---|
| 71 | `automatisation_comptable_ia__01` / `novasavo_u03_screen_03` | Contenu insuffisant ou non aligné avec le thème | L’unité est annoncée sur « saisie automatisée des données comptables », mais l’écran présente uniquement le même canevas général que les autres unités : collecte/vérification des données, règles documentées, exceptions, validation/journalisation et le flux Données → Règles → Revue humaine → Journal d’audit. Il ne développe ni notion opérationnelle ni règle ou exemple propre au thème. | `client/public/data/courses/automatisation_comptable_ia__01.json` — `novasavo_u03_screen_03` |
| 72 | `automatisation_comptable_ia__01` / `novasavo_u04_screen_03` | Contenu insuffisant ou non aligné avec le thème | L’unité est annoncée sur « catégorisation automatique des transactions », mais l’écran présente uniquement le même canevas général que les autres unités : collecte/vérification des données, règles documentées, exceptions, validation/journalisation et le flux Données → Règles → Revue humaine → Journal d’audit. Il ne développe ni notion opérationnelle ni règle ou exemple propre au thème. | `client/public/data/courses/automatisation_comptable_ia__01.json` — `novasavo_u04_screen_03` |
| 73 | `automatisation_comptable_ia__01` / `novasavo_u05_screen_03` | Contenu insuffisant ou non aligné avec le thème | L’unité est annoncée sur « rapprochement bancaire intelligent », mais l’écran présente uniquement le même canevas général que les autres unités : collecte/vérification des données, règles documentées, exceptions, validation/journalisation et le flux Données → Règles → Revue humaine → Journal d’audit. Il ne développe ni notion opérationnelle ni règle ou exemple propre au thème. | `client/public/data/courses/automatisation_comptable_ia__01.json` — `novasavo_u05_screen_03` |
| 74 | `automatisation_comptable_ia__01` / `novasavo_u06_screen_03` | Contenu insuffisant ou non aligné avec le thème | L’unité est annoncée sur « gestion automatisée des factures et des dépenses », mais l’écran présente uniquement le même canevas général que les autres unités : collecte/vérification des données, règles documentées, exceptions, validation/journalisation et le flux Données → Règles → Revue humaine → Journal d’audit. Il ne développe ni notion opérationnelle ni règle ou exemple propre au thème. | `client/public/data/courses/automatisation_comptable_ia__01.json` — `novasavo_u06_screen_03` |
| 75 | `automatisation_comptable_ia__01` / `novasavo_u07_screen_03` | Contenu insuffisant ou non aligné avec le thème | L’unité est annoncée sur « prévisions financières et analyses prédictives », mais l’écran présente uniquement le même canevas général que les autres unités : collecte/vérification des données, règles documentées, exceptions, validation/journalisation et le flux Données → Règles → Revue humaine → Journal d’audit. Il ne développe ni notion opérationnelle ni règle ou exemple propre au thème. | `client/public/data/courses/automatisation_comptable_ia__01.json` — `novasavo_u07_screen_03` |
| 76 | `automatisation_comptable_ia__01` / `novasavo_u08_screen_03` | Contenu insuffisant ou non aligné avec le thème | L’unité est annoncée sur « détection des anomalies et prévention de la fraude », mais l’écran présente uniquement le même canevas général que les autres unités : collecte/vérification des données, règles documentées, exceptions, validation/journalisation et le flux Données → Règles → Revue humaine → Journal d’audit. Il ne développe ni notion opérationnelle ni règle ou exemple propre au thème. | `client/public/data/courses/automatisation_comptable_ia__01.json` — `novasavo_u08_screen_03` |
| 77 | `automatisation_comptable_ia__01` / `novasavo_u09_screen_03` | Contenu insuffisant ou non aligné avec le thème | L’unité est annoncée sur « automatisation de la paie et des déclarations fiscales », mais l’écran présente uniquement le même canevas général que les autres unités : collecte/vérification des données, règles documentées, exceptions, validation/journalisation et le flux Données → Règles → Revue humaine → Journal d’audit. Il ne développe ni notion opérationnelle ni règle ou exemple propre au thème. | `client/public/data/courses/automatisation_comptable_ia__01.json` — `novasavo_u09_screen_03` |
| 78 | `automatisation_comptable_ia__01` / `novasavo_u10_screen_03` | Contenu insuffisant ou non aligné avec le thème | L’unité est annoncée sur « intégration des outils d’IA dans les systèmes comptables », mais l’écran présente uniquement le même canevas général que les autres unités : collecte/vérification des données, règles documentées, exceptions, validation/journalisation et le flux Données → Règles → Revue humaine → Journal d’audit. Il ne développe ni notion opérationnelle ni règle ou exemple propre au thème. | `client/public/data/courses/automatisation_comptable_ia__01.json` — `novasavo_u10_screen_03` |
| 79 | `automatisation_comptable_ia__01` / `novasavo_u11_screen_03` | Contenu insuffisant ou non aligné avec le thème | L’unité est annoncée sur « gouvernance, conformité et éthique de l’IA en comptabilité », mais l’écran présente uniquement le même canevas général que les autres unités : collecte/vérification des données, règles documentées, exceptions, validation/journalisation et le flux Données → Règles → Revue humaine → Journal d’audit. Il ne développe ni notion opérationnelle ni règle ou exemple propre au thème. | `client/public/data/courses/automatisation_comptable_ia__01.json` — `novasavo_u11_screen_03` |
| 80 | `automatisation_comptable_ia__01` / `novasavo_u12_screen_03` | Contenu insuffisant ou non aligné avec le thème | L’unité est annoncée sur « avenir de la profession comptable à l’ère de l’IA », mais l’écran présente uniquement le même canevas général que les autres unités : collecte/vérification des données, règles documentées, exceptions, validation/journalisation et le flux Données → Règles → Revue humaine → Journal d’audit. Il ne développe ni notion opérationnelle ni règle ou exemple propre au thème. | `client/public/data/courses/automatisation_comptable_ia__01.json` — `novasavo_u12_screen_03` |

### Gemini dans Google Docs — 8 P1

| # | Cours / écran | Famille | Constat vérifié | Source |
|---:|---|---|---|---|
| 13 | `gemini_in_google_docs__01` / `dc_ch01_act01` | Localisation et accessibilité linguistique | Pour un cours déclaré sourceLanguage fr-FR, le titre français du chapitre et de la vidéo est anglais, la transcription est anglaise et seul subtitleUrlEn est fourni. L’introduction n’offre donc pas une version française cohérente de son contenu pédagogique. | `client/public/data/courses/gemini_in_google_docs__01.json` — `dc_ch01_act01` |
| 14 | `gemini_in_google_docs__01` / `dc_ch01_act02` | Localisation et accessibilité linguistique | La démonstration Create Content with Gemini présente en anglais son titre français, sa transcription et son seul sous-titrage, malgré le paramétrage fr-FR du cours. | `client/public/data/courses/gemini_in_google_docs__01.json` — `dc_ch01_act02` |
| 15 | `gemini_in_google_docs__01` / `dc_ch01_act03` | Localisation et accessibilité linguistique | La démonstration de modification d’invites et de raffinement conserve en anglais le titre destiné au français, la transcription et le seul sous-titrage disponible. | `client/public/data/courses/gemini_in_google_docs__01.json` — `dc_ch01_act03` |
| 16 | `gemini_in_google_docs__01` / `dc_ch01_act04` | Localisation et accessibilité linguistique | L’écran Proofread Documents ne fournit pas de contenu pédagogique français : le titre, la transcription et le sous-titrage fourni sont anglais dans le parcours fr-FR. | `client/public/data/courses/gemini_in_google_docs__01.json` — `dc_ch01_act04` |
| 17 | `gemini_in_google_docs__01` / `dc_ch01_act05` | Localisation et accessibilité linguistique | La séquence préparatoire au scénario Cymbal Retail reste en anglais dans le titre français, la transcription et le seul sous-titrage renseigné. | `client/public/data/courses/gemini_in_google_docs__01.json` — `dc_ch01_act05` |
| 18 | `gemini_in_google_docs__01` / `dc_ch01_act07` | Localisation et accessibilité linguistique | Dans le QCM du parcours fr-FR, le titre est anglais et les valeurs françaises des options a, c et d reproduisent les libellés anglais, alors que la question, l’indice et l’explication sont français. | `client/public/data/courses/gemini_in_google_docs__01.json` — `dc_ch01_act07` |
| 19 | `gemini_in_google_docs__01` / `dc_ch01_act08` | Localisation et accessibilité linguistique | Le QCM est majoritairement anglais dans la version fr-FR : titre, question, quatre réponses et explication française reprennent les textes anglais ; seul l’indice est français. | `client/public/data/courses/gemini_in_google_docs__01.json` — `dc_ch01_act08` |
| 20 | `gemini_in_google_docs__01` / `dc_ch01_act09` | Localisation et accessibilité linguistique | Le dernier QCM combine une question et un indice français avec un titre, les quatre choix et une explication post-réponse en anglais, ce qui rompt la cohérence linguistique de l’évaluation fr-FR. | `client/public/data/courses/gemini_in_google_docs__01.json` — `dc_ch01_act09` |

### Coder en mode Vibe avec Replit — 7 P1

| # | Cours / écran | Famille | Constat vérifié | Source |
|---:|---|---|---|---|
| 49 | `vibe_coding_with_replit__01` / `dc_ch01_act04` | Rendu ou accessibilité des médias | La démonstration de manipulation est réduite aux deux slides de cadrage et à la piste sonore ; les gestes et écrans décrits dans le transcript ne sont pas visibles pour l’apprenant. | `client/public/data/courses/vibe_coding_with_replit__01.json` — `dc_ch01_act04` |
| 50 | `vibe_coding_with_replit__01` / `dc_ch01_act06` | Rendu ou accessibilité des médias | La démonstration de manipulation est réduite aux deux slides de cadrage et à la piste sonore ; les gestes et écrans décrits dans le transcript ne sont pas visibles pour l’apprenant. | `client/public/data/courses/vibe_coding_with_replit__01.json` — `dc_ch01_act06` |
| 51 | `vibe_coding_with_replit__01` / `dc_ch02_act04` | Rendu ou accessibilité des médias | La démonstration de manipulation est réduite aux deux slides de cadrage et à la piste sonore ; les gestes et écrans décrits dans le transcript ne sont pas visibles pour l’apprenant. | `client/public/data/courses/vibe_coding_with_replit__01.json` — `dc_ch02_act04` |
| 52 | `vibe_coding_with_replit__01` / `dc_ch03_act04` | Rendu ou accessibilité des médias | La démonstration de manipulation est réduite aux deux slides de cadrage et à la piste sonore ; les gestes et écrans décrits dans le transcript ne sont pas visibles pour l’apprenant. | `client/public/data/courses/vibe_coding_with_replit__01.json` — `dc_ch03_act04` |
| 53 | `vibe_coding_with_replit__01` / `dc_ch03_act06` | Rendu ou accessibilité des médias | La démonstration de manipulation est réduite aux deux slides de cadrage et à la piste sonore ; les gestes et écrans décrits dans le transcript ne sont pas visibles pour l’apprenant. | `client/public/data/courses/vibe_coding_with_replit__01.json` — `dc_ch03_act06` |
| 54 | `vibe_coding_with_replit__01` / `dc_ch03_act08` | Rendu ou accessibilité des médias | La démonstration de manipulation est réduite aux deux slides de cadrage et à la piste sonore ; les gestes et écrans décrits dans le transcript ne sont pas visibles pour l’apprenant. | `client/public/data/courses/vibe_coding_with_replit__01.json` — `dc_ch03_act08` |
| 55 | `vibe_coding_with_replit__01` / `dc_ch04_act03` | Rendu ou accessibilité des médias | La démonstration de manipulation est réduite aux deux slides de cadrage et à la piste sonore ; les gestes et écrans décrits dans le transcript ne sont pas visibles pour l’apprenant. | `client/public/data/courses/vibe_coding_with_replit__01.json` — `dc_ch04_act03` |

### Introduction aux Agent Skills — 6 P1

| # | Cours / écran | Famille | Constat vérifié | Source |
|---:|---|---|---|---|
| 32 | `introduction_to_agent_skills__01` / `dc_ch01_act01` | Localisation et accessibilité linguistique | Dans ce parcours déclaré fr-FR, la vidéo conserve un titre français anglais, une transcription anglaise et uniquement subtitleUrlEn ; aucune piste française n’est déclarée. | `client/public/data/courses/introduction_to_agent_skills__01.json` — `dc_ch01_act01` |
| 33 | `introduction_to_agent_skills__01` / `dc_ch01_act04` | Localisation et accessibilité linguistique | La vidéo du parcours fr-FR fournit une transcription et des sous-titres anglais seulement ; son titre français est également anglais et subtitleUrlFr est absent. | `client/public/data/courses/introduction_to_agent_skills__01.json` — `dc_ch01_act04` |
| 34 | `introduction_to_agent_skills__01` / `dc_ch02_act01` | Localisation et accessibilité linguistique | La vidéo de configuration est proposée avec titre français anglais, transcription anglaise et seule piste subtitleUrlEn, sans alternative française déclarée. | `client/public/data/courses/introduction_to_agent_skills__01.json` — `dc_ch02_act01` |
| 35 | `introduction_to_agent_skills__01` / `dc_ch02_act04` | Localisation et accessibilité linguistique | Le média comparant les fonctionnalités Claude Code est anglais dans son titre fr, sa transcription et sa seule piste de sous-titres déclarée ; aucune subtitleUrlFr n’est fournie. | `client/public/data/courses/introduction_to_agent_skills__01.json` — `dc_ch02_act04` |
| 36 | `introduction_to_agent_skills__01` / `dc_ch03_act01` | Localisation et accessibilité linguistique | La vidéo de partage reste anglaise dans son titre fr, sa transcription et sa seule piste de sous-titres ; aucune alternative française n’est déclarée. | `client/public/data/courses/introduction_to_agent_skills__01.json` — `dc_ch03_act01` |
| 37 | `introduction_to_agent_skills__01` / `dc_ch03_act04` | Localisation et accessibilité linguistique | La vidéo de dépannage est déclarée dans un parcours fr-FR mais son titre fr, sa transcription et son seul sous-titrage sont anglais ; aucune subtitleUrlFr n’est présente. | `client/public/data/courses/introduction_to_agent_skills__01.json` — `dc_ch03_act04` |

### Open-Source LLMs and Fine-Tuning Engineer — 5 P1

| # | Cours / écran | Famille | Constat vérifié | Source |
|---:|---|---|---|---|
| 81 | `open_source_llms_fine_tuning_engineer__01` / `lesson_01_chapter_01` | Contenu présent dans les données mais non rendu | Les quatre objectifs disponibles dans chapter.body ne sont pas affichés : le chapitre rend uniquement une vidéo, tandis que sa consigne préalable renvoie au titre générique « What You Will Learn ». L’intention pédagogique concrète de l’écran n’est donc pas donnée avant le média. | `client/public/data/courses/open_source_llms_fine_tuning_engineer__01.json` — `lesson_01_chapter_01` |
| 82 | `open_source_llms_fine_tuning_engineer__01` / `lesson_02_chapter_02` | Contenu présent dans les données mais non rendu | La théorie annoncée par le titre (Hub, model cards et datasets) est stockée dans chapter.body mais l’écran rendu ne contient qu’une vidéo sur Mistral 7B. Aucun contenu affiché ne couvre l’explication centrale annoncée. | `client/public/data/courses/open_source_llms_fine_tuning_engineer__01.json` — `lesson_02_chapter_02` |
| 83 | `open_source_llms_fine_tuning_engineer__04` / `lesson_01_chapter_01` | Contenu présent dans les données mais non rendu | Les objectifs présents dans chapter.body ne sont pas affichés : le flux courant rend uniquement une vidéo, dont la consigne préalable renvoie au titre générique plutôt qu’aux acquis visés. | `client/public/data/courses/open_source_llms_fine_tuning_engineer__04.json` — `lesson_01_chapter_01` |
| 84 | `open_source_llms_fine_tuning_engineer__04` / `lesson_02_chapter_02` | Contenu présent dans les données mais non rendu | La théorie annoncée sur les model cards et dataset cards est présente dans chapter.body mais n’est pas rendue. L’écran actuel se limite à une vidéo sur les familles de LLM, qui ne traite pas le sujet du titre. | `client/public/data/courses/open_source_llms_fine_tuning_engineer__04.json` — `lesson_02_chapter_02` |
| 85 | `open_source_llms_fine_tuning_engineer__04` / `lesson_04_chapter_06` | Promesse d’activité, lab ou contenu non livré | La clôture finale renvoie l’apprenant vers un hands-on lab pour publier les résultats de benchmark et une model card, mais aucun écran de lab ni bloc d’activité correspondant n’est présent dans les quatre cours actuels de cette formation. | `client/public/data/courses/open_source_llms_fine_tuning_engineer__04.json` — `lesson_04_chapter_06` |

### Databricks avec le SDK Python — 3 P1

| # | Cours / écran | Famille | Constat vérifié | Source |
|---:|---|---|---|---|
| 7 | `databricks_with_the_python_sdk__01` / `dc_ch01_act01` | Exactitude technique des exemples | La slide d’authentification par défaut concatène deux affectations os.environ avec un antislash au lieu d’un saut de ligne; l’extrait est donc syntaxiquement invalide s’il est copié. Le texte associé appelle en outre os.environ une « fonction .environ() », alors que le même écran l’emploie comme mapping de variables d’environnement. | `client/public/data/courses/databricks_with_the_python_sdk__01.json` — `dc_ch01_act01` |
| 8 | `databricks_with_the_python_sdk__01` / `dc_ch02_act08` | Exactitude technique des exemples | L’exemple de création d’agent pose la question « What's the time and distance of the longest trip? », mais la sortie affichée répond seulement « The average trip takes approximately 15 minutes. ». La réponse ne traite ni le trajet le plus long ni la distance demandée. | `client/public/data/courses/databricks_with_the_python_sdk__01.json` — `dc_ch02_act08` |
| 9 | `databricks_with_the_python_sdk__01` / `dc_ch03_act04` | Exactitude technique des exemples | L’exemple présenté pour créer et exécuter un job appelle `jobs.Task` et `jobs.NotebookTask`, mais le seul import affiché est `from databricks.sdk import WorkspaceClient`; aucun import ou définition de `jobs` n’est fourni dans l’extrait. Le code de démonstration n’est donc pas autonome tel qu’affiché. | `client/public/data/courses/databricks_with_the_python_sdk__01.json` — `dc_ch03_act04` |

### Déployer l’IA en production avec FastAPI — 3 P1

| # | Cours / écran | Famille | Constat vérifié | Source |
|---:|---|---|---|---|
| 10 | `deploying_ai_into_production_with_fastapi__01` / `dc_ch02_act01` | Exactitude technique des exemples | Dans l’exemple d’analyse textuelle, `comment` est typé `CommentText` avec le champ `content`, mais le code appelle `comment.lower()`. La liste `forbidden` omet aussi la virgule entre `"free"` et `"fake"`, ce qui concatène ces deux valeurs ; le code ne peut donc pas produire la sortie annoncée. | `client/public/data/courses/deploying_ai_into_production_with_fastapi__01.json` — `dc_ch02_act01` |
| 11 | `deploying_ai_into_production_with_fastapi__01` / `dc_ch03_act04` | Exactitude technique des exemples | Le constructeur est déclaré avec `requests_per_min` mais instancié avec `requests_per_minute`, ce qui déclenche une erreur d’argument. De plus, `is_rate_limited()` est annoncé comme retournant `tuple[bool, int]` mais retourne `False` seul, alors que l’exemple suivant le déstructure en deux valeurs. | `client/public/data/courses/deploying_ai_into_production_with_fastapi__01.json` — `dc_ch03_act04` |
| 12 | `deploying_ai_into_production_with_fastapi__01` / `dc_ch03_act07` | Exactitude technique des exemples | L’exemple de gestion du délai passe directement l’inférence synchrone `sentiment_model(comment.text)` à `asyncio.wait_for`, qui attend un awaitable. L’appel illustré ne peut donc pas appliquer le timeout annoncé à cette inférence telle qu’elle est définie à l’écran précédent. | `client/public/data/courses/deploying_ai_into_production_with_fastapi__01.json` — `dc_ch03_act07` |

### Full-Stack AI Application Developer — 3 P1

| # | Cours / écran | Famille | Constat vérifié | Source |
|---:|---|---|---|---|
| 58 | `full_stack_ai_application_developer__01` / `lesson_04_chapter_06` | Promesse d’activité, lab ou contenu non livré | La clôture annonce un « capstone lab » et la soumission d’une architecture de référence, sans fournir de lien, identifiant de ressource, consigne de démarrage ni critère de livrable dans le cours courant. | `client/public/data/courses/full_stack_ai_application_developer__01.json` — `lesson_04_chapter_06` |
| 59 | `full_stack_ai_application_developer__02` / `lesson_04__chapter_06` | Promesse d’activité, lab ou contenu non livré | La clôture annonce un hands-on lab d’implémentation, sans fournir de lien, identifiant de ressource, consigne de démarrage ni critère de livrable dans le cours courant. | `client/public/data/courses/full_stack_ai_application_developer__02.json` — `lesson_04__chapter_06` |
| 60 | `full_stack_ai_application_developer__04` / `lesson_04_chapter_06` | Promesse d’activité, lab ou contenu non livré | La clôture annonce un capstone lab et la soumission d’un runbook, sans fournir de lien, identifiant de ressource, consigne de démarrage ni critère de livrable dans le cours courant. | `client/public/data/courses/full_stack_ai_application_developer__04.json` — `lesson_04_chapter_06` |

### LLMOps and AI Observability Engineer — 3 P1

| # | Cours / écran | Famille | Constat vérifié | Source |
|---:|---|---|---|---|
| 68 | `llmops_ai_observability_engineer__02` / `lesson_01_chapter_01` | Contenu présent dans les données mais non rendu | Les objectifs de la leçon sont stockés dans chapter.body mais le tableau blocks ne contient qu’une vidéo. L’écran rendu ne fournit donc pas les objectifs pédagogiques annoncés avant le visionnage. | `client/public/data/courses/llmops_ai_observability_engineer__02.json` — `lesson_01_chapter_01` |
| 69 | `llmops_ai_observability_engineer__02` / `lesson_02_chapter_02` | Contenu présent dans les données mais non rendu | L’explication centrale sur le traçage de la récupération et du reranking est stockée dans chapter.body mais le tableau blocks ne contient qu’une vidéo. L’écran rendu n’expose pas cette explication. | `client/public/data/courses/llmops_ai_observability_engineer__02.json` — `lesson_02_chapter_02` |
| 70 | `llmops_ai_observability_engineer__02` / `lesson_03_chapter_06` | Contenu présent dans les données mais non rendu | Le message de clôture et la transition vers la leçon suivante sont stockés dans chapter.body mais le tableau blocks ne contient qu’une vidéo. L’écran rendu ne fournit pas la clôture déclarée. | `client/public/data/courses/llmops_ai_observability_engineer__02.json` — `lesson_03_chapter_06` |

### Agence SEO autonome composée de plusieurs agents — 2 P1

| # | Cours / écran | Famille | Constat vérifié | Source |
|---:|---|---|---|---|
| 61 | `ia_appliquee_metiers_tp__10` / `ia_appliquee_metiers_tp__10-screen-01` | Localisation et accessibilité linguistique | Dans la variante anglaise, le bloc d'objectifs conserve en français le métier cible, le niveau, la durée et les quatre compétences. L'apprenant anglophone ne reçoit donc pas ces informations dans la langue sélectionnée. | `client/public/data/courses/ia_appliquee_metiers_tp__10.json` — `ia_appliquee_metiers_tp__10-screen-01` |
| 62 | `ia_appliquee_metiers_tp__10` / `ia_appliquee_metiers_tp__10-screen-03` | Localisation et accessibilité linguistique | La variante anglaise de la démarche et du panneau de vérifications contient encore des libellés et contenus français, y compris l'étape de contrôle et les deux colonnes du panneau. Cela empêche un rendu linguistiquement cohérent de l'écran en anglais. | `client/public/data/courses/ia_appliquee_metiers_tp__10.json` — `ia_appliquee_metiers_tp__10-screen-03` |

### Claude Certified Developer – Fondations — 2 P1

| # | Cours / écran | Famille | Constat vérifié | Source |
|---:|---|---|---|---|
| 2 | `claude_certified_developer_foundations__04` / `chapter_skilljar_04_s17` | Évaluation incomplète ou non alignée | La tâche obligatoire accepte une réponse libre de 40 caractères et révèle la solution, mais aucun critère de réponse, résultat de validation, feedback différencié ni mécanisme de nouvelle tentative n’est déclaré. La compétence demandée n’est donc pas vérifiée par la complétion observable. | `client/public/data/courses/claude_certified_developer_foundations__04.json` — `chapter_skilljar_04_s17` |
| 3 | `claude_certified_developer_foundations__04` / `chapter_skilljar_04_s18` | Évaluation incomplète ou non alignée | La tâche obligatoire accepte une réponse libre de 40 caractères et révèle la solution, mais aucun critère de réponse, résultat de validation, feedback différencié ni mécanisme de nouvelle tentative n’est déclaré. La compétence demandée n’est donc pas vérifiée par la complétion observable. | `client/public/data/courses/claude_certified_developer_foundations__04.json` — `chapter_skilljar_04_s18` |

### Créer des workflows agentiques avec LlamaIndex — 2 P1

| # | Cours / écran | Famille | Constat vérifié | Source |
|---:|---|---|---|---|
| 4 | `building_agentic_workflows_with_llamaindex__01` / `dc_ch01_act01` | Promesse d’activité, lab ou contenu non livré | Le même écran décrit la version livrée comme un parcours vidéo sans TP exécutable ni environnement de code intégré, mais la vidéo annonce la construction pas à pas avec de nombreux exemples de code, des exercices pratiques et l’usage d’un environnement local. L’attendu de l’apprenant est donc contradictoire dans l’état actuel. | `client/public/data/courses/building_agentic_workflows_with_llamaindex__01.json` — `dc_ch01_act01` |
| 5 | `building_agentic_workflows_with_llamaindex__01` / `dc_ch02_act08` | Promesse d’activité, lab ou contenu non livré | Le récapitulatif affirme que le cours a couvert la supervision humaine, les workflows personnalisés hors des réglages par défaut et des boucles d’auto-réflexion, alors que ces notions ne figurent pas dans les cinq écrans actuels. Cela fausse le bilan des acquis ; le retrait documenté des activités n’est pas, en lui-même, pénalisé. | `client/public/data/courses/building_agentic_workflows_with_llamaindex__01.json` — `dc_ch02_act08` |

### Utiliser l’API OpenAI Responses — 2 P1

| # | Cours / écran | Famille | Constat vérifié | Source |
|---:|---|---|---|---|
| 56 | `working_with_the_openai_responses_api__01` / `dc_ch01_act06` | Promesse d’activité, lab ou contenu non livré | Le chapitre demande une expérimentation — saisir des invites et régler l’effort de raisonnement — mais l’écran réellement présent n’offre qu’un bloc de contenu. Aucune saisie, exécution ni activité affichée ne permet de réaliser l’action annoncée. | `client/public/data/courses/working_with_the_openai_responses_api__01.json` — `dc_ch01_act06` |
| 57 | `working_with_the_openai_responses_api__01` / `dc_ch03_act03` | Promesse d’activité, lab ou contenu non livré | L’écran intitulé « Imbriquer des classes Pydantic » se limite à présenter SimilarMovie et DetailedMovieRecommendation comme classes distinctes. Il n’explique ni ne montre leur imbrication ou leur relation, et n’affiche aucune activité permettant de pratiquer ou vérifier le savoir-faire annoncé. | `client/public/data/courses/working_with_the_openai_responses_api__01.json` — `dc_ch03_act03` |

### AI Governance, Compliance and Responsible AI Leader — 1 P1

| # | Cours / écran | Famille | Constat vérifié | Source |
|---:|---|---|---|---|
| 1 | `ai_governance_compliance_responsible_ai_leader__01` / `lesson_04_chapter_06` | Promesse d’activité, lab ou contenu non livré | Le texte de clôture du cours annonce un « course lab » dans lequel concevoir une matrice de rôles et responsabilités, mais aucun écran ni activité de lab/exercise/cloud_exercise n’est présent dans le périmètre actuel des quatre cours. La suite annoncée ne peut donc pas être réalisée depuis cette formation. | `client/public/data/courses/ai_governance_compliance_responsible_ai_leader__01.json` — `lesson_04_chapter_06` |

### Agent RAG pour analyser les résultats financiers d'entreprises — 1 P1

| # | Cours / écran | Famille | Constat vérifié | Source |
|---:|---|---|---|---|
| 66 | `ia_appliquee_metiers_tp__35` / `ia_appliquee_metiers_tp__35-final-quiz` | Évaluation incomplète ou non alignée | Le quiz final à verrouillage actif n’établit pas les quatre acquis annoncés par la formation : ingestion/chunking, embeddings et recherche vectorielle, réponse documentée, et rapport Google Docs. Les quatre QCM portent principalement sur les données fictives, le contrôle humain et les secrets ; le tri porte sur une démarche générale. La réussite finale peut donc ne démontrer que le cadre de prudence. | `client/public/data/courses/ia_appliquee_metiers_tp__35.json` — `ia_appliquee_metiers_tp__35-final-quiz` |

### Agent Zendesk RAG avec base documentaire et mémoire — 1 P1

| # | Cours / écran | Famille | Constat vérifié | Source |
|---:|---|---|---|---|
| 64 | `ia_appliquee_metiers_tp__14` / `ia_appliquee_metiers_tp__14-screen-01` | Localisation et accessibilité linguistique | Le cadrage d’ouverture est majoritairement affiché en français lorsque la langue anglaise est sélectionnée : le titre, le corps décrivant le profil/niveau/durée et les quatre objectifs ont des valeurs .en françaises. Un apprenant anglophone ne reçoit donc pas le cadrage central dans la langue choisie. | `client/public/data/courses/ia_appliquee_metiers_tp__14.json` — `ia_appliquee_metiers_tp__14-screen-01` |

### Concevoir un agent IA de support client — 1 P1

| # | Cours / écran | Famille | Constat vérifié | Source |
|---:|---|---|---|---|
| 63 | `ia_appliquee_metiers_tp__12` / `ia_appliquee_metiers_tp__12-mini-project` | Évaluation incomplète ou non alignée | La preuve du mini-projet demande quatre éléments identifiables, mais le bloc courant ne configure ni minimumAnswerLength, ni rubricCriteria, ni learnerCriteria, ni évaluation associée. L’activité centrale manque ainsi de critères observables permettant d’apprécier la preuve demandée. | `client/public/data/courses/ia_appliquee_metiers_tp__12.json` — `ia_appliquee_metiers_tp__12-mini-project` |

### Construire un Data Analyst IA conversationnel — 1 P1

| # | Cours / écran | Famille | Constat vérifié | Source |
|---:|---|---|---|---|
| 65 | `ia_appliquee_metiers_tp__32` / `ia_appliquee_metiers_tp__32-final-quiz` | Évaluation incomplète ou non alignée | Le quiz final évalue la preuve de test, la validation humaine, le contrôle et la protection des secrets, mais pas explicitement la séparation récupération/calculs, l’usage de Calculator ni la formulation d’une réponse en langage métier, alors que ces trois compétences figurent parmi les objectifs annoncés. | `client/public/data/courses/ia_appliquee_metiers_tp__32.json` — `ia_appliquee_metiers_tp__32-final-quiz` |

### Créer des agents d’IA avec CrewAI — 1 P1

| # | Cours / écran | Famille | Constat vérifié | Source |
|---:|---|---|---|---|
| 6 | `building_ai_agents_with_crewai__01` / `dc_ch01_act01` | Promesse d’activité, lab ou contenu non livré | Le parcours apprenant courant ne contient que l’accueil puis la conclusion. L’accueil annonce la création d’un agent, l’attribution de tâches, la constitution d’équipes et les flux, alors que la conclusion les présente comme déjà réalisés. Cinq activités pratiques de type LocalEnvironmentExercise sont déclarées comme extraites, mais aucun chapitre ou bloc apprenant correspondant n’est présent et exerciseCount vaut 0. Aucune suppression documentée ne permet de traiter cette absence comme une activité retirée non pénalisable. | `client/public/data/courses/building_ai_agents_with_crewai__01.json` — `dc_ch01_act01` |

### LLM Application Security and Red Teaming Specialist — 1 P1

| # | Cours / écran | Famille | Constat vérifié | Source |
|---:|---|---|---|---|
| 67 | `llm_application_security_red_teaming_specialist__04` / `lesson_04_chapter_06` | Promesse d’activité, lab ou contenu non livré | La conclusion demande de « Proceed to the Final Lab » pour produire un rapport, mais aucun Final Lab, lien, identifiant d’activité ou ressource correspondante n’est présent dans les quatre cours actuels. | `client/public/data/courses/llm_application_security_red_teaming_specialist__04.json` — `lesson_04_chapter_06` |

## Ordre de traitement recommandé

1. **P1 qui contiennent une fausse activité, un lab annoncé mais absent ou une ressource inaccessible** : supprimer l’activité ou l’annonce si aucune ressource complète ne peut être fournie immédiatement.
2. **P1 de rendu** : déplacer `chapter.body` vers des blocs standards visibles et corriger les types de source des médias, car ces correctifs sont transversaux.
3. **P1 de localisation** : corriger les séries d’écrans d’une même formation en lot, avec une vérification FR/EN après chaque lot.
4. **P1 d’exactitude de code ou d’alignement pédagogique** : ne conserver que les exemples et évaluations dont la correction est vérifiable ; retirer ceux qui ne le sont pas rapidement.

## Source de vérité

- Rapport consolidé : `pedagogical-audit/13-pedagogical-rescore-2026-10-18.json`.
- Le total est contrôlé par assertion : 85 lignes P1 dans ce document et 85 P1 dans le rapport consolidé.
