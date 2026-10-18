# Corrections éditoriales des P0/P1 — 18 octobre 2026

## Résultat et périmètre

Les **85 constats P1 et les deux P0** du dernier contre-audit ont reçu une correction ou un remplacement traçable. Le lot couvre **24 formations** et modifie **28 fichiers de cours**. Les rapports de rédaction ne déclarent aucun constat cible non résolu. Ce résultat décrit le lot corrigé ; il ne vaut pas attestation de publication ni parcours intégral de toutes les formations.

La règle appliquée est de conserver les éléments pédagogiques vérifiables et de remplacer ou retirer les activités non réalisables rapidement, **sans inventer fichier, jeu de données, workflow de départ ni résultat d’exécution**.

## Changements concrets

| Élément | Avant le lot | Après le lot |
|---|---:|---:|
| Blocs explicatifs | 1891 | 1946 |
| QCM à choix unique | 499 | 562 |
| TP évalués | 86 | 82 |
| Blocs vidéo | 643 | 639 |
| Écrans | 3003 | 3007 |
| Leçons | 783 | 783 |

**61 nouveaux identifiants de QCM** sont ajoutés. Deux anciens IDs de TP Developer sont réutilisés pour des QCM, d’où une augmentation nette de 63 blocs QCM. Les questions sont contextualisées, localisées FR/EN et corrigées côté serveur. Les clés et explications ne sont pas présentes dans la projection apprenant avant soumission.

Les sept démonstrations Replit concernées utilisent désormais leur vrai MP4, avec une piste vidéo H.264 et une piste audio AAC attestées par ffprobe. Les sources Projector/HLS concurrentes ont été retirées de ces sept blocs. Cette preuve technique ne constitue pas, à elle seule, un test image/son début-milieu-fin de chaque vidéo dans le navigateur.

Les fallbacks Google Cloud vides ont été remplacés par de vraies explications. Les chapitres Novasavo ont été réécrits selon leur sujet comptable. Les exemples Databricks/FastAPI ont été corrigés, les annonces de labs/capstones absents retirées, et les alternatives textuelles françaises des vidéos concernées complétées.

## Validation

- **Couverture des corrections :** 87 / 87 constats rattachés exactement à leur formation, cours et chapitre ; contrôle de consolidation sans erreur.
- **Contrôleur structurel :** 180 cours et 3007 écrans ; {'P0': 0, 'P1': 0, 'P2': 0, 'P3': 0}. Ce contrôleur ne remplace pas une revue qualitative exhaustive.
- **Langues et Markdown :** audits stricts FR/EN sans constat après correction du balisage final.
- **Compte et recherche :** métriques synchronisées pour 180 cours et 116 formations ; index de recherche régénéré avec 3 303 entrées.
- **Progression :** tests de verrouillage et d’IDs scopés, gates réels des QCM Developer et des quiz 4/4 conservés ; pas d’activité obligatoire réintroduite sans support.
- **Relecture éditoriale indépendante :** pass, 0 bloqueur dans l’échantillon ciblé. Les limites de cet avis sont consignées dans son rapport JSON.
- **Régression complète :** Test Files  313 passed (313) ; Tests  1162 passed | 2 skipped (1164)
- **Pipeline de contenu :** 0 erreur bloquante ; 220 avertissements heuristiques sur des options proches dans le catalogue. Ces avertissements ne sont pas assimilés automatiquement aux P1 du lot ni déclarés tous faux positifs par cette correction.

### Contrôles navigateur et limite de publication

Le compte QA conserve un rôle apprenant. Deux exécutions ont été distinguées :

1. **Progression réelle :** 12 vues desktop/mobile sur six écrans. Six vues étaient rendues et six étaient normalement bloquées par les prérequis séquentiels. Une soumission réelle du nouveau QCM GitHub Copilot a renvoyé HTTP 200, affiché « Correct ! » et présenté son explication seulement après soumission.
2. **Progression prérequise de test, injectée uniquement en mémoire :** les six écrans desktop ont été rendus ; quatre QCM (OpenAI, n8n, Novasavo, Copilot) ont été soumis à la véritable API protégée, avec feedback correct et explication cachée avant soumission. Aucun acquis simulé n’a été sauvegardé. Les six vues mobiles de cette seconde exécution ont ensuite rencontré la vérification de présence : **elles ne sont pas déclarées validées**. Le mécanisme d’intégrité n’a pas été contourné.

Les vues rendues ne présentent ni erreur JavaScript ni débordement horizontal détecté. Les captures sont disponibles dans `expert-p1-browser/` et `expert-p1-browser-fixture/` avec leurs JSON de résultats.

**Aucun déploiement en production n’est effectué par ce lot.** La validation complète du parcours apprenant et des médias obligatoires reste une condition de publication ; les vues bloquées par une vérification de présence ne sont pas transformées en PASS artificiel.

## Progression mesurée

**87 / 87 constats ciblés traités dans les fichiers et le code : 100 % du lot P0/P1.** Ce pourcentage n’est ni un nouveau score pédagogique /100 ni une déclaration que tous les P2/P3 sont clos. Le précédent score de l’audit ne peut être remplacé sans une nouvelle notation selon la même grille.

## Répartition par formation

| Formation | Constats traités |
|---|---:|
| AI Governance, Compliance and Responsible AI Leader | 1 |
| Agence SEO autonome composée de plusieurs agents | 2 |
| Agent RAG pour analyser les résultats financiers d'entreprises | 1 |
| Agent Zendesk RAG avec base documentaire et mémoire | 1 |
| Automatisation comptable par l’IA | 10 |
| Automatisation de workflows avancée | 1 |
| Claude Certified Developer – Fondations | 2 |
| Coder en mode Vibe avec Replit | 7 |
| Concevoir un agent IA de support client | 1 |
| Construire un Data Analyst IA conversationnel | 1 |
| Créer des agents d’IA avec CrewAI | 1 |
| Créer des workflows agentiques avec LlamaIndex | 2 |
| Databricks avec le SDK Python | 3 |
| Déployer l’IA en production avec FastAPI | 3 |
| Développement logiciel avec GitHub Copilot | 11 |
| Développer des systèmes d’IA avec l’API OpenAI | 1 |
| Full-Stack AI Application Developer | 3 |
| Gemini dans Google Docs | 8 |
| Innover avec Google Cloud AI | 11 |
| Introduction aux Agent Skills | 6 |
| LLM Application Security and Red Teaming Specialist | 1 |
| LLMOps and AI Observability Engineer | 3 |
| Open-Source LLMs and Fine-Tuning Engineer | 5 |
| Utiliser l’API OpenAI Responses | 2 |

## Liste exhaustive des corrections

### 01. P0 — Développer des systèmes d’IA avec l’API OpenAI

**Cours :** `developing_ai_systems_with_the_openai_api__01` — **Écran :** `dc_ch02_act15` — **Statut :** Corrigé / remplacé.

**Action :** Replaced the mandatory static pseudo-exercise that claimed preloaded objects with a self-contained bilingual lesson on validating, routing, and associating Chat Completions tool calls; added a server-validated contextual QCM.

**Preuve :** The chapter no longer claims that `response`, `json`, or `get_exchange_rate()` are preloaded. Its two standard blocks are visible `content` (`dc_2_act_15_content`) and `single_choice_exercise` (`dc_2_act_15_tool_call_linkage_qcm`); the QCM has four bilingual options, an existing correctAnswer, detailed bilingual feedback, and serverValidated=true.

### 02. P0 — Automatisation de workflows avancée

**Cours :** `intermediate_workflow_automation_with_n8n__01` — **Écran :** `dc_ch02_act07` — **Statut :** Corrigé / remplacé.

**Action :** Suppression du cloud_exercise dépendant d’un workflow Python Code et d’un nœud Is Valid? non fournis. Le chapitre conserve son ID et sa progression, mais devient une explication bilingue autonome suivie d’un QCM validé côté serveur, sans accès n8n, fichier ou workflow requis.

**Preuve :** Le bloc dc_2_act_07_tp et ses promesses de pack/workflow ont été retirés. Les blocs dc_2_act_07_content et dc_2_act_07_qcm expliquent la validation de type, le passage Code → If et le contrat Python n8n, puis évaluent cette notion dans Neopolis ; le JSON est analysable et la réponse correcte c référence une option existante.

### 03. P1 — AI Governance, Compliance and Responsible AI Leader

**Cours :** `ai_governance_compliance_responsible_ai_leader__01` — **Écran :** `lesson_04_chapter_06` — **Statut :** Corrigé / remplacé.

**Action :** Replaced the unavailable course-lab announcement with a self-contained completion summary and an integrated, no-access-required governance case question. The added question is bilingual, server-validated, and tests the foundations actually taught in the course.

**Preuve :** The chapter no longer contains 'course lab' or asks the learner to create a roles-and-responsibilities matrix. Its only activity is the embedded single_choice_exercise lesson_04_chapter_06_integrated_governance_check; all four course JSON files still declare exercises: [].

### 04. P1 — Claude Certified Developer – Fondations

**Cours :** `claude_certified_developer_foundations__04` — **Écran :** `chapter_skilljar_04_s17` — **Statut :** Corrigé / remplacé.

**Action :** Replaced the unvalidated free-response cloud exercise with a bilingual, contextual single-choice assessment under the preserved block ID chapter_cumulative_s17. The visible case-study content now teaches boundary, failure, and regression passes before the assessment; the answer key is server-validated, includes four distinct choices and detailed deferred feedback. Replaced the obsolete cloud-exercise completion requirement with requiredExercisesPassed.

**Preuve :** The preserved block ID is now type=single_choice_exercise with serverValidated=true, correctAnswer=b, bilingual question/options/explanation, and a 4-option answer set. Focused local JSON validation passed; server/sensitiveExerciseAnswerKeys.ts resolves exactly one active server-validated block and derives its answer key from the managed course JSON.

### 05. P1 — Claude Certified Developer – Fondations

**Cours :** `claude_certified_developer_foundations__04` — **Écran :** `chapter_skilljar_04_s18` — **Statut :** Corrigé / remplacé.

**Action :** Replaced the unvalidated free-response cloud exercise with a bilingual, contextual single-choice assessment under the preserved block ID chapter_cumulative_s18. The visible case-study content explains enforceable boundary, retry, and regression controls before the assessment; the answer key is server-validated, includes four distinct choices and detailed deferred feedback. Replaced the obsolete cloud-exercise completion requirement with requiredExercisesPassed.

**Preuve :** The preserved block ID is now type=single_choice_exercise with serverValidated=true, correctAnswer=b, bilingual question/options/explanation, and a 4-option answer set. Focused local JSON validation passed; server/sensitiveExerciseAnswerKeys.ts resolves exactly one active server-validated block and derives its answer key from the managed course JSON.

### 06. P1 — Créer des workflows agentiques avec LlamaIndex

**Cours :** `building_agentic_workflows_with_llamaindex__01` — **Écran :** `dc_ch01_act01` — **Statut :** Corrigé / remplacé.

**Action :** Remplacement de l’accueil contradictoire par une orientation bilingue fidèle au parcours effectivement livré (trois leçons audio-visuelles anglaises, synthèses FR/EN et deux supports, sans TP ni environnement intégré). La vidéo d’accueil qui promettait code, environnement local et exercices pratiques a été retirée ; un QCM autonome vérifie le périmètre réel.

**Preuve :** Le chapitre contient désormais le bloc content conservant l’ID neopolis_building_agentic_workflows_with_llamaindex__01_environment_preparation, le QCM neopolis_building_agentic_workflows_with_llamaindex__01_welcome_checkpoint et le support dc_ch01_slides ; dc_1_act_01_video n’est plus présent. Les annonces source « local development environment » et « hands-on exercises » ne subsistent pas dans le JSON.

### 07. P1 — Créer des workflows agentiques avec LlamaIndex

**Cours :** `building_agentic_workflows_with_llamaindex__01` — **Écran :** `dc_ch02_act08` — **Statut :** Corrigé / remplacé.

**Action :** Remplacement de la vidéo de récapitulatif qui attribuait des acquis non livrés par une synthèse bilingue des trois notions réellement couvertes : agent vs appel direct à un LLM, contexte/état, et orchestration multi-agents. Ajout d’une étude de cas recherche-rédaction-relecture et d’un QCM contextualisé.

**Preuve :** Le chapitre ne contient plus dc_2_act_08_video, mais neolopis_building_agentic_workflows_with_llamaindex__01_summary_learning_recap et neolopis_building_agentic_workflows_with_llamaindex__01_summary_checkpoint. Les formulations source sur human oversight, custom workflows outside the defaults et self-reflection loops sont absentes du JSON final.

### 08. P1 — Créer des agents d’IA avec CrewAI

**Cours :** `building_ai_agents_with_crewai__01` — **Écran :** `dc_ch01_act01` — **Statut :** Corrigé / remplacé.

**Action :** Restauration de la progression des cinq activités source manquantes sous forme de cinq chapitres pédagogiques autonomes, placés entre l’accueil et la conclusion. Chaque chapitre conserve son ID source, explique une notion CrewAI (agent, tâche/équipe, état, contexte entre spécialistes, routage Flow), contient une étude de cas sans accès externe et se termine par un QCM validé serveur. Les deux vidéos conservées disposent maintenant d’un bloc explicatif FR/EN visible et d’une alternative française complète ; la conclusion ne présente plus les apprentissages comme accomplis avant leur explication.

**Preuve :** Le JSON révisé contient désormais les activités ordonnées dc_ch01_act01, dc_ch01_act02, dc_ch01_act03, dc_ch02_act01, dc_ch02_act02, dc_ch02_act03 et dc_ch02_act04. Les cinq chapitres restaurés ne contiennent que des blocs content FR/EN et single_choice_exercise ; aucun cloud_exercise, code_repl, dataset, fichier requis ou accès externe n’a été réintroduit. activities_extracted et exerciseCount valent 7. La validation locale JSON a confirmé 17 IDs de blocs uniques, 7 QCM avec 3–4 options, correctAnswer existant et serverValidated=true, ainsi qu’au plus une vidéo par chapitre.

### 09. P1 — Databricks avec le SDK Python

**Cours :** `databricks_with_the_python_sdk__01` — **Écran :** `dc_ch01_act01` — **Statut :** Corrigé / remplacé.

**Action :** La slide 7 utilise désormais trois affectations `os.environ[...]` distinctes et syntaxiquement valides. Le script, le transcript et son segment qualifient correctement `os.environ` de mapping, non de fonction.

**Preuve :** Les champs `content` et `contentLeft` de la slide 7 contiennent `DATABRICKS_CLIENT_SECRET`, `DATABRICKS_CLIENT_ID` et `DATABRICKS_HOST` sur des lignes séparées. Le texte associé emploie « mapping » et ne contient plus `.environ()`.

### 10. P1 — Databricks avec le SDK Python

**Cours :** `databricks_with_the_python_sdk__01` — **Écran :** `dc_ch02_act08` — **Statut :** Corrigé / remplacé.

**Action :** La slide 12 conserve la question sur la durée et la distance du trajet le plus long, mais supprime la sortie non concordante sur la durée moyenne.

**Preuve :** Les champs `content` et `contentLeft` ne contiennent plus de bloc `out` ni de valeur chiffrée. Ils précisent que le résultat dépend des données et doit couvrir les deux dimensions demandées.

### 11. P1 — Databricks avec le SDK Python

**Cours :** `databricks_with_the_python_sdk__01` — **Écran :** `dc_ch03_act04` — **Statut :** Corrigé / remplacé.

**Action :** La slide 4 importe explicitement le module `jobs` avant d’utiliser `jobs.Task` et `jobs.NotebookTask`; le script et le transcript citent aussi la classe `jobs.Task` avec la bonne casse.

**Preuve :** Le code commence par `from databricks.sdk.service import jobs`, et les références à `jobs.Task` et `jobs.NotebookTask` sont résolues par cet import affiché.

### 12. P1 — Déployer l’IA en production avec FastAPI

**Cours :** `deploying_ai_into_production_with_fastapi__01` — **Écran :** `dc_ch02_act01` — **Statut :** Corrigé / remplacé.

**Action :** Corrected the Pydantic-field access to `comment.content.lower()` and separated `"free"`/`"fake"` with a comma; added bilingual visible remediation and an aligned quiz.

**Preuve :** The projected code, visible content block, French alternative text, and updated transcript now use `comment.content.lower()` and a five-item keyword list with distinct `"free"` and `"fake"` entries.

### 13. P1 — Déployer l’IA en production avec FastAPI

**Cours :** `deploying_ai_into_production_with_fastapi__01` — **Écran :** `dc_ch03_act04` — **Statut :** Corrigé / remplacé.

**Action :** Replaced the inconsistent limiter API with `check_and_record()` returning a tuple on every path; aligned the constructor keyword and passed the one-call remaining count through the dependency.

**Preuve :** Projected code now instantiates `RateLimiter(requests_per_min=10)`, returns `(True, 0)` or `(False, remaining)`, and no longer calls the limiter a second time in `/predict`.

### 14. P1 — Déployer l’IA en production avec FastAPI

**Cours :** `deploying_ai_into_production_with_fastapi__01` — **Écran :** `dc_ch03_act07` — **Statut :** Corrigé / remplacé.

**Action :** Wrapped the synchronous model call with `asyncio.to_thread()` before passing it to `asyncio.wait_for()`; clarified timeout and BackgroundTasks boundaries.

**Preuve :** The revised projected code and bilingual content use `await asyncio.wait_for(asyncio.to_thread(sentiment_model, comment.text), timeout=5.0)`; the transcript mirrors the corrected contract.

### 15. P1 — Gemini dans Google Docs

**Cours :** `gemini_in_google_docs__01` — **Écran :** `dc_ch01_act01` — **Statut :** Corrigé / remplacé.

**Action :** Titre FR corrigé ; alternative textuelle française complète et bloc content FR/EN fidèle à la transcription ajoutés avant la vidéo anglaise ; validation contextualisée ajoutée.

**Preuve :** dc_1_act_01_video.alternativeTextFr, dc_1_act_01_content_fr_en et dc_1_act_01_knowledge_check ; la piste anglaise et subtitleUrlEn sont conservées comme médias source.

### 16. P1 — Gemini dans Google Docs

**Cours :** `gemini_in_google_docs__01` — **Écran :** `dc_ch01_act02` — **Statut :** Corrigé / remplacé.

**Action :** Titre FR corrigé ; explication bilingue fidèle du parcours Help me write, alternative française complète et validation ajoutées sans exiger d’accès à Google Docs.

**Preuve :** dc_1_act_02_video.alternativeTextFr, dc_1_act_02_content_fr_en et dc_1_act_02_knowledge_check.

### 17. P1 — Gemini dans Google Docs

**Cours :** `gemini_in_google_docs__01` — **Écran :** `dc_ch01_act03` — **Statut :** Corrigé / remplacé.

**Action :** Titre FR corrigé ; explication bilingue fidèle de la précision des invites et des options de raffinement, alternative française complète et validation ajoutées.

**Preuve :** dc_1_act_03_video.alternativeTextFr, dc_1_act_03_content_fr_en et dc_1_act_03_knowledge_check.

### 18. P1 — Gemini dans Google Docs

**Cours :** `gemini_in_google_docs__01` — **Écran :** `dc_ch01_act04` — **Statut :** Corrigé / remplacé.

**Action :** Titre FR corrigé ; explication bilingue fidèle de Proofread, alternative française complète et validation ajoutées.

**Preuve :** dc_1_act_04_video.alternativeTextFr, dc_1_act_04_content_fr_en et dc_1_act_04_knowledge_check.

### 19. P1 — Gemini dans Google Docs

**Cours :** `gemini_in_google_docs__01` — **Écran :** `dc_ch01_act05` — **Statut :** Corrigé / remplacé.

**Action :** Titre FR corrigé ; scénario Cymbal Retail réagencé comme étude de cas bilingue avec alternative française complète. Le renvoi de la vidéo à une activité ultérieure absente est explicitement neutralisé ; aucun TP ou accès externe n’est requis.

**Preuve :** dc_1_act_05_video.alternativeTextFr, dc_1_act_05_content_fr_en et dc_1_act_05_knowledge_check indiquent que l’activité source n’est pas incluse et concluent sur les acquis réels.

### 20. P1 — Gemini dans Google Docs

**Cours :** `gemini_in_google_docs__01` — **Écran :** `dc_ch01_act07` — **Statut :** Corrigé / remplacé.

**Action :** Titre du chapitre et les trois propositions françaises restées en anglais ont été localisés ; le QCM est marqué serverValidated.

**Preuve :** dc_ch01_act07.title.fr ; dc_1_act_07_qcm.options[a,c,d].text.fr ; dc_1_act_07_qcm.serverValidated=true.

### 21. P1 — Gemini dans Google Docs

**Cours :** `gemini_in_google_docs__01` — **Écran :** `dc_ch01_act08` — **Statut :** Corrigé / remplacé.

**Action :** Titre, question, quatre réponses et explication ont été localisés en français ; le QCM est marqué serverValidated.

**Preuve :** dc_ch01_act08.title.fr ; dc_1_act_08_qcm.question.fr, options[*].text.fr, explanation.fr et serverValidated=true.

### 22. P1 — Gemini dans Google Docs

**Cours :** `gemini_in_google_docs__01` — **Écran :** `dc_ch01_act09` — **Statut :** Corrigé / remplacé.

**Action :** Titre, quatre choix et explication ont été localisés en français ; le QCM est marqué serverValidated.

**Preuve :** dc_ch01_act09.title.fr ; dc_1_act_09_qcm.options[*].text.fr, explanation.fr et serverValidated=true.

### 23. P1 — Innover avec Google Cloud AI

**Cours :** `innovating_with_google_cloud_ai__01` — **Écran :** `dc_ch01_act01` — **Statut :** Corrigé / remplacé.

**Action :** Remplacement du fallback par une séquence bilingue sur IA, ML, IA générative, systèmes agentiques et couches de solution Google Cloud.

**Preuve :** dc_1_act_01_visual_content contient désormais un bloc content bilingue autoportant, sans optionalMediaUnavailable ni dépendance à un média, fichier, lien ou accès externe.

### 24. P1 — Innover avec Google Cloud AI

**Cours :** `innovating_with_google_cloud_ai__01` — **Écran :** `dc_ch01_act02` — **Statut :** Corrigé / remplacé.

**Action :** Remplacement du fallback par une comparaison bilingue analytique/ML prédictif/IA générative/systèmes agentiques et des types de données.

**Preuve :** dc_1_act_02_visual_content contient désormais un bloc content bilingue autoportant, sans optionalMediaUnavailable ni dépendance à un média, fichier, lien ou accès externe.

### 25. P1 — Innover avec Google Cloud AI

**Cours :** `innovating_with_google_cloud_ai__01` — **Écran :** `dc_ch01_act03` — **Statut :** Corrigé / remplacé.

**Action :** Remplacement du fallback par une explication bilingue de la boucle agentique, des outils autorisés et des contrôles.

**Preuve :** dc_1_act_03_visual_content contient désormais un bloc content bilingue autoportant, sans optionalMediaUnavailable ni dépendance à un média, fichier, lien ou accès externe.

### 26. P1 — Innover avec Google Cloud AI

**Cours :** `innovating_with_google_cloud_ai__01` — **Écran :** `dc_ch01_act04` — **Statut :** Corrigé / remplacé.

**Action :** Remplacement du fallback par une explication bilingue de la valeur métier mesurable, avec exemple et limites.

**Preuve :** dc_1_act_04_visual_content contient désormais un bloc content bilingue autoportant, sans optionalMediaUnavailable ni dépendance à un média, fichier, lien ou accès externe.

### 27. P1 — Innover avec Google Cloud AI

**Cours :** `innovating_with_google_cloud_ai__01` — **Écran :** `dc_ch01_act05` — **Statut :** Corrigé / remplacé.

**Action :** Remplacement du fallback par une séquence bilingue sur formulation du problème, qualité des données, évaluation, dérive et explicabilité.

**Preuve :** dc_1_act_05_visual_content contient désormais un bloc content bilingue autoportant, sans optionalMediaUnavailable ni dépendance à un média, fichier, lien ou accès externe.

### 28. P1 — Innover avec Google Cloud AI

**Cours :** `innovating_with_google_cloud_ai__01` — **Écran :** `dc_ch02_act01` — **Statut :** Corrigé / remplacé.

**Action :** Remplacement du fallback par une cartographie bilingue des solutions Google Cloud : API, AutoML, BigQuery ML, plateformes gérées et AI Hypercomputer.

**Preuve :** dc_2_act_01_visual_content contient désormais un bloc content bilingue autoportant, sans optionalMediaUnavailable ni dépendance à un média, fichier, lien ou accès externe.

### 29. P1 — Innover avec Google Cloud AI

**Cours :** `innovating_with_google_cloud_ai__01` — **Écran :** `dc_ch02_act02` — **Statut :** Corrigé / remplacé.

**Action :** Remplacement du fallback par une comparaison bilingue des quatre approches : API préentraînée, AutoML, BigQuery ML et modèle personnalisé.

**Preuve :** dc_2_act_02_visual_content contient désormais un bloc content bilingue autoportant, sans optionalMediaUnavailable ni dépendance à un média, fichier, lien ou accès externe.

### 30. P1 — Innover avec Google Cloud AI

**Cours :** `innovating_with_google_cloud_ai__01` — **Écran :** `dc_ch02_act03` — **Statut :** Corrigé / remplacé.

**Action :** Remplacement du fallback par une explication bilingue de Google Cloud AI Hypercomputer, incluant accélérateurs, réseau, stockage et logiciel.

**Preuve :** dc_2_act_03_visual_content contient désormais un bloc content bilingue autoportant, sans optionalMediaUnavailable ni dépendance à un média, fichier, lien ou accès externe.

### 31. P1 — Innover avec Google Cloud AI

**Cours :** `innovating_with_google_cloud_ai__01` — **Écran :** `dc_ch02_act04` — **Statut :** Corrigé / remplacé.

**Action :** Remplacement du fallback par une grille bilingue de choix selon besoin, données, personnalisation, exploitation et coût.

**Preuve :** dc_2_act_04_visual_content contient désormais un bloc content bilingue autoportant, sans optionalMediaUnavailable ni dépendance à un média, fichier, lien ou accès externe.

### 32. P1 — Innover avec Google Cloud AI

**Cours :** `innovating_with_google_cloud_ai__01` — **Écran :** `dc_ch03_act01` — **Statut :** Corrigé / remplacé.

**Action :** Remplacement du fallback par une synthèse bilingue et ajout d'un QCM de transfert auto-validé.

**Preuve :** dc_3_act_01_visual_content contient désormais un bloc content bilingue autoportant, sans optionalMediaUnavailable ni dépendance à un média, fichier, lien ou accès externe. Le bloc neopolis_innovating_with_google_cloud_ai__01_summary_decision_quiz fournit 4 options, une réponse valide, une explication bilingue et serverValidated=true.

### 33. P1 — Innover avec Google Cloud AI

**Cours :** `innovating_with_google_cloud_ai__01` — **Écran :** `dc_ch04_act01` — **Statut :** Corrigé / remplacé.

**Action :** Suppression de la promesse de PDF non fourni ; remplacement par un guide d'étude bilingue intégré et un QCM de transfert auto-validé.

**Preuve :** dc_4_act_01_visual_content contient désormais un bloc content bilingue autoportant, sans optionalMediaUnavailable ni dépendance à un média, fichier, lien ou accès externe. Le bloc neopolis_innovating_with_google_cloud_ai__01_study_guide_decision_quiz fournit 4 options, une réponse valide, une explication bilingue et serverValidated=true.

### 34. P1 — Introduction aux Agent Skills

**Cours :** `introduction_to_agent_skills__01` — **Écran :** `dc_ch01_act01` — **Statut :** Corrigé / remplacé.

**Action :** Titre français corrigé ; média déclaré en anglais ; alternative textuelle complète FR et bloc content bilingue insérés avant la vidéo.

**Preuve :** Le bloc dc_1_act_01_video conserve le MP4 et la piste anglaise réels, avec videoLanguage=en, objectiveBefore bilingue et alternativeTextFr ; le bloc neopolis_dc_1_act_01_bilingual_text_alternative est placé immédiatement avant.

### 35. P1 — Introduction aux Agent Skills

**Cours :** `introduction_to_agent_skills__01` — **Écran :** `dc_ch01_act04` — **Statut :** Corrigé / remplacé.

**Action :** Titre français corrigé ; média déclaré en anglais ; alternative textuelle complète FR et bloc content bilingue insérés avant la vidéo.

**Preuve :** Le bloc dc_1_act_04_video conserve le MP4 et la piste anglaise réels, avec videoLanguage=en, objectiveBefore bilingue et alternativeTextFr ; le bloc neopolis_dc_1_act_04_bilingual_text_alternative est placé immédiatement avant.

### 36. P1 — Introduction aux Agent Skills

**Cours :** `introduction_to_agent_skills__01` — **Écran :** `dc_ch02_act01` — **Statut :** Corrigé / remplacé.

**Action :** Titre français corrigé ; média déclaré en anglais ; alternative textuelle complète FR et bloc content bilingue insérés avant la vidéo.

**Preuve :** Le bloc dc_2_act_01_video conserve le MP4 et la piste anglaise réels, avec videoLanguage=en, objectiveBefore bilingue et alternativeTextFr ; le bloc neopolis_dc_2_act_01_bilingual_text_alternative est placé immédiatement avant.

### 37. P1 — Introduction aux Agent Skills

**Cours :** `introduction_to_agent_skills__01` — **Écran :** `dc_ch02_act04` — **Statut :** Corrigé / remplacé.

**Action :** Titre français corrigé ; média déclaré en anglais ; alternative textuelle complète FR et bloc content bilingue insérés avant la vidéo.

**Preuve :** Le bloc dc_2_act_04_video conserve le MP4 et la piste anglaise réels, avec videoLanguage=en, objectiveBefore bilingue et alternativeTextFr ; le bloc neopolis_dc_2_act_04_bilingual_text_alternative est placé immédiatement avant.

### 38. P1 — Introduction aux Agent Skills

**Cours :** `introduction_to_agent_skills__01` — **Écran :** `dc_ch03_act01` — **Statut :** Corrigé / remplacé.

**Action :** Titre français corrigé ; média déclaré en anglais ; alternative textuelle complète FR et bloc content bilingue insérés avant la vidéo.

**Preuve :** Le bloc dc_3_act_01_video conserve le MP4 et la piste anglaise réels, avec videoLanguage=en, objectiveBefore bilingue et alternativeTextFr ; le bloc neopolis_dc_3_act_01_bilingual_text_alternative est placé immédiatement avant.

### 39. P1 — Introduction aux Agent Skills

**Cours :** `introduction_to_agent_skills__01` — **Écran :** `dc_ch03_act04` — **Statut :** Corrigé / remplacé.

**Action :** Titre français corrigé ; média déclaré en anglais ; alternative textuelle complète FR et bloc content bilingue insérés avant la vidéo.

**Preuve :** Le bloc dc_3_act_04_video conserve le MP4 et la piste anglaise réels, avec videoLanguage=en, objectiveBefore bilingue et alternativeTextFr ; le bloc neopolis_dc_3_act_04_bilingual_text_alternative est placé immédiatement avant.

### 40. P1 — Développement logiciel avec GitHub Copilot

**Cours :** `software_development_with_github_copilot__01` — **Écran :** `dc_ch01_act01` — **Statut :** Corrigé / remplacé.

**Action :** Added a complete French alternative text to the video and a visible bilingual transcript block before the retained video; normalized displayed French/English titles and added an end-of-screen contextual single-choice validation.

**Preuve :** Video dc_1_act_01_video now has alternativeTextFr and alternativeTextEn; block dc_1_act_01_video_accessible_text precedes it with complete fr/en transcript bodies; dc_1_act_01_video_accessibility_check is serverValidated with three or more bilingual options and a valid correctAnswer.

### 41. P1 — Développement logiciel avec GitHub Copilot

**Cours :** `software_development_with_github_copilot__01` — **Écran :** `dc_ch01_act03` — **Statut :** Corrigé / remplacé.

**Action :** Added a complete French alternative text to the video and a visible bilingual transcript block before the retained video; normalized displayed French/English titles and added an end-of-screen contextual single-choice validation.

**Preuve :** Video dc_1_act_03_video now has alternativeTextFr and alternativeTextEn; block dc_1_act_03_video_accessible_text precedes it with complete fr/en transcript bodies; dc_1_act_03_video_accessibility_check is serverValidated with three or more bilingual options and a valid correctAnswer.

### 42. P1 — Développement logiciel avec GitHub Copilot

**Cours :** `software_development_with_github_copilot__01` — **Écran :** `dc_ch01_act07` — **Statut :** Corrigé / remplacé.

**Action :** Added a complete French alternative text to the video and a visible bilingual transcript block before the retained video; normalized displayed French/English titles and added an end-of-screen contextual single-choice validation.

**Preuve :** Video dc_1_act_07_video now has alternativeTextFr and alternativeTextEn; block dc_1_act_07_video_accessible_text precedes it with complete fr/en transcript bodies; dc_1_act_07_video_accessibility_check is serverValidated with three or more bilingual options and a valid correctAnswer.

### 43. P1 — Développement logiciel avec GitHub Copilot

**Cours :** `software_development_with_github_copilot__01` — **Écran :** `dc_ch02_act01` — **Statut :** Corrigé / remplacé.

**Action :** Added a complete French alternative text to the video and a visible bilingual transcript block before the retained video; normalized displayed French/English titles and added an end-of-screen contextual single-choice validation.

**Preuve :** Video dc_2_act_01_video now has alternativeTextFr and alternativeTextEn; block dc_2_act_01_video_accessible_text precedes it with complete fr/en transcript bodies; dc_2_act_01_video_accessibility_check is serverValidated with three or more bilingual options and a valid correctAnswer.

### 44. P1 — Développement logiciel avec GitHub Copilot

**Cours :** `software_development_with_github_copilot__01` — **Écran :** `dc_ch02_act04` — **Statut :** Corrigé / remplacé.

**Action :** Added a complete French alternative text to the video and a visible bilingual transcript block before the retained video; normalized displayed French/English titles and added an end-of-screen contextual single-choice validation.

**Preuve :** Video dc_2_act_04_video now has alternativeTextFr and alternativeTextEn; block dc_2_act_04_video_accessible_text precedes it with complete fr/en transcript bodies; dc_2_act_04_video_accessibility_check is serverValidated with three or more bilingual options and a valid correctAnswer.

### 45. P1 — Développement logiciel avec GitHub Copilot

**Cours :** `software_development_with_github_copilot__01` — **Écran :** `dc_ch02_act07` — **Statut :** Corrigé / remplacé.

**Action :** Added a complete French alternative text to the video and a visible bilingual transcript block before the retained video; normalized displayed French/English titles and added an end-of-screen contextual single-choice validation.

**Preuve :** Video dc_2_act_07_video now has alternativeTextFr and alternativeTextEn; block dc_2_act_07_video_accessible_text precedes it with complete fr/en transcript bodies; dc_2_act_07_video_accessibility_check is serverValidated with three or more bilingual options and a valid correctAnswer.

### 46. P1 — Développement logiciel avec GitHub Copilot

**Cours :** `software_development_with_github_copilot__01` — **Écran :** `dc_ch03_act04` — **Statut :** Corrigé / remplacé.

**Action :** Added a complete French alternative text to the video and a visible bilingual transcript block before the retained video; normalized displayed French/English titles and added an end-of-screen contextual single-choice validation.

**Preuve :** Video dc_3_act_04_video now has alternativeTextFr and alternativeTextEn; block dc_3_act_04_video_accessible_text precedes it with complete fr/en transcript bodies; dc_3_act_04_video_accessibility_check is serverValidated with three or more bilingual options and a valid correctAnswer.

### 47. P1 — Développement logiciel avec GitHub Copilot

**Cours :** `software_development_with_github_copilot__01` — **Écran :** `dc_ch03_act08` — **Statut :** Corrigé / remplacé.

**Action :** Added a complete French alternative text to the video and a visible bilingual transcript block before the retained video; normalized displayed French/English titles and added an end-of-screen contextual single-choice validation.

**Preuve :** Video dc_3_act_08_video now has alternativeTextFr and alternativeTextEn; block dc_3_act_08_video_accessible_text precedes it with complete fr/en transcript bodies; dc_3_act_08_video_accessibility_check is serverValidated with three or more bilingual options and a valid correctAnswer.

### 48. P1 — Développement logiciel avec GitHub Copilot

**Cours :** `software_development_with_github_copilot__01` — **Écran :** `dc_ch04_act01` — **Statut :** Corrigé / remplacé.

**Action :** Added a complete French alternative text to the video and a visible bilingual transcript block before the retained video; normalized displayed French/English titles and added an end-of-screen contextual single-choice validation.

**Preuve :** Video dc_4_act_01_video now has alternativeTextFr and alternativeTextEn; block dc_4_act_01_video_accessible_text precedes it with complete fr/en transcript bodies; dc_4_act_01_video_accessibility_check is serverValidated with three or more bilingual options and a valid correctAnswer.

### 49. P1 — Développement logiciel avec GitHub Copilot

**Cours :** `software_development_with_github_copilot__01` — **Écran :** `dc_ch04_act05` — **Statut :** Corrigé / remplacé.

**Action :** Added a complete French alternative text to the video and a visible bilingual transcript block before the retained video; normalized displayed French/English titles and added an end-of-screen contextual single-choice validation.

**Preuve :** Video dc_4_act_05_video now has alternativeTextFr and alternativeTextEn; block dc_4_act_05_video_accessible_text precedes it with complete fr/en transcript bodies; dc_4_act_05_video_accessibility_check is serverValidated with three or more bilingual options and a valid correctAnswer.

### 50. P1 — Développement logiciel avec GitHub Copilot

**Cours :** `software_development_with_github_copilot__01` — **Écran :** `dc_ch04_act09` — **Statut :** Corrigé / remplacé.

**Action :** Added a complete French alternative text to the video and a visible bilingual transcript block before the retained video; normalized displayed French/English titles and added an end-of-screen contextual single-choice validation.

**Preuve :** Video dc_4_act_09_video now has alternativeTextFr and alternativeTextEn; block dc_4_act_09_video_accessible_text precedes it with complete fr/en transcript bodies; dc_4_act_09_video_accessibility_check is serverValidated with three or more bilingual options and a valid correctAnswer.

### 51. P1 — Coder en mode Vibe avec Replit

**Cours :** `vibe_coding_with_replit__01` — **Écran :** `dc_ch01_act04` — **Statut :** Corrigé / remplacé.

**Action :** Le MP4 source a été déclaré comme vidéo hébergée (sourceType=video, sourceUrl=mp4Url), avec durée renseignée ; les données Projector et HLS concurrentes ont été retirées.

**Preuve :** ffprobe du MP4 géré confirme h264 3840x2160 + aac, durée 428.000 s ; le contrôle JSON confirme une seule vidéo et aucune clé Projector/HLS active.

### 52. P1 — Coder en mode Vibe avec Replit

**Cours :** `vibe_coding_with_replit__01` — **Écran :** `dc_ch01_act06` — **Statut :** Corrigé / remplacé.

**Action :** Le MP4 source a été déclaré comme vidéo hébergée (sourceType=video, sourceUrl=mp4Url), avec durée renseignée ; les données Projector et HLS concurrentes ont été retirées.

**Preuve :** ffprobe du MP4 géré confirme h264 3840x2160 + aac, durée 180.500 s ; le contrôle JSON confirme une seule vidéo et aucune clé Projector/HLS active.

### 53. P1 — Coder en mode Vibe avec Replit

**Cours :** `vibe_coding_with_replit__01` — **Écran :** `dc_ch02_act04` — **Statut :** Corrigé / remplacé.

**Action :** Le MP4 source a été déclaré comme vidéo hébergée (sourceType=video, sourceUrl=mp4Url), avec durée renseignée ; les données Projector et HLS concurrentes ont été retirées.

**Preuve :** ffprobe du MP4 géré confirme h264 3840x2160 + aac, durée 351.600 s ; le contrôle JSON confirme une seule vidéo et aucune clé Projector/HLS active.

### 54. P1 — Coder en mode Vibe avec Replit

**Cours :** `vibe_coding_with_replit__01` — **Écran :** `dc_ch03_act04` — **Statut :** Corrigé / remplacé.

**Action :** Le MP4 source a été déclaré comme vidéo hébergée (sourceType=video, sourceUrl=mp4Url), avec durée renseignée ; les données Projector et HLS concurrentes ont été retirées.

**Preuve :** ffprobe du MP4 géré confirme h264 3840x2160 + aac, durée 462.800 s ; le contrôle JSON confirme une seule vidéo et aucune clé Projector/HLS active.

### 55. P1 — Coder en mode Vibe avec Replit

**Cours :** `vibe_coding_with_replit__01` — **Écran :** `dc_ch03_act06` — **Statut :** Corrigé / remplacé.

**Action :** Le MP4 source a été déclaré comme vidéo hébergée (sourceType=video, sourceUrl=mp4Url), avec durée renseignée ; les données Projector et HLS concurrentes ont été retirées.

**Preuve :** ffprobe du MP4 géré confirme h264 3840x2160 + aac, durée 334.517 s ; le contrôle JSON confirme une seule vidéo et aucune clé Projector/HLS active.

### 56. P1 — Coder en mode Vibe avec Replit

**Cours :** `vibe_coding_with_replit__01` — **Écran :** `dc_ch03_act08` — **Statut :** Corrigé / remplacé.

**Action :** Le MP4 source a été déclaré comme vidéo hébergée (sourceType=video, sourceUrl=mp4Url), avec durée renseignée ; les données Projector et HLS concurrentes ont été retirées.

**Preuve :** ffprobe du MP4 géré confirme h264 3840x2160 + aac, durée 252.767 s ; le contrôle JSON confirme une seule vidéo et aucune clé Projector/HLS active.

### 57. P1 — Coder en mode Vibe avec Replit

**Cours :** `vibe_coding_with_replit__01` — **Écran :** `dc_ch04_act03` — **Statut :** Corrigé / remplacé.

**Action :** Le MP4 source a été déclaré comme vidéo hébergée (sourceType=video, sourceUrl=mp4Url), avec durée renseignée ; les données Projector et HLS concurrentes ont été retirées.

**Preuve :** ffprobe du MP4 géré confirme h264 3840x2160 + aac, durée 367.150 s ; le contrôle JSON confirme une seule vidéo et aucune clé Projector/HLS active.

### 58. P1 — Utiliser l’API OpenAI Responses

**Cours :** `working_with_the_openai_responses_api__01` — **Écran :** `dc_ch01_act06` — **Statut :** Corrigé / remplacé.

**Action :** Remplacé la promesse d’expérimentation non rendue par une leçon bilingue autonome sur le choix conjoint du modèle, de `reasoning.effort` et de `max_output_tokens`; ajouté le QCM contextualisé `dc_1_act_06_model_configuration_quiz` validé côté serveur.

**Preuve :** Le chapitre ne contient désormais qu’un bloc `content` expliquant explicitement l’absence d’interface de saisie/exécution, suivi d’un QCM à quatre options FR/EN. La documentation OpenAI confirme que `reasoning.effort` est dépendant du modèle, que les faibles efforts privilégient vitesse et consommation de jetons, et que `max_output_tokens` couvre aussi les jetons de raisonnement.

### 59. P1 — Utiliser l’API OpenAI Responses

**Cours :** `working_with_the_openai_responses_api__01` — **Écran :** `dc_ch03_act03` — **Statut :** Corrigé / remplacé.

**Action :** Développé une explication bilingue de l’imbrication Pydantic avec le schéma `SimilarMovie` dans `DetailedMovieRecommendation`, un contraste avec les listes parallèles et un exemple `client.responses.parse`; ajouté le QCM contextualisé `dc_3_act_03_nested_pydantic_quiz` validé côté serveur.

**Preuve :** Le contenu montre que `similar_movies: list[SimilarMovie]` est le champ imbriqué de l’objet englobant et indique que l’écran n’exécute aucune requête ni ne prétend produire une recommandation. La documentation OpenAI officielle décrit l’usage de `pydantic.BaseModel` et de `client.responses.parse(..., text_format=...)` avec `response.output_parsed`.

### 60. P1 — Full-Stack AI Application Developer

**Cours :** `full_stack_ai_application_developer__01` — **Écran :** `lesson_04_chapter_06` — **Statut :** Corrigé / remplacé.

**Action :** Removed the unsupported course-lab/architecture-submission transition; replaced it with a bilingual, self-contained module synthesis and case-based server-validated quiz.

**Preuve :** The sole displayed content block now expressly states that no lab, repository, or submission is required and contains no resource reference, URL, exercise ID, or deliverable request.

### 61. P1 — Full-Stack AI Application Developer

**Cours :** `full_stack_ai_application_developer__02` — **Écran :** `lesson_04__chapter_06` — **Statut :** Corrigé / remplacé.

**Action :** Removed the unsupported hands-on implementation-lab transition; replaced it with a bilingual, self-contained backend lifecycle synthesis and case-based server-validated quiz.

**Preuve :** The sole displayed content block now expressly states that no hands-on lab, external access, or deliverable is required and contains no resource reference, URL, exercise ID, or build instruction.

### 62. P1 — Full-Stack AI Application Developer

**Cours :** `full_stack_ai_application_developer__04` — **Écran :** `lesson_04_chapter_06` — **Statut :** Corrigé / remplacé.

**Action :** Removed the unsupported capstone/runbook-submission transition; replaced it with a bilingual, self-contained release-readiness synthesis and case-based server-validated quiz.

**Preuve :** The sole displayed content block now expressly states that no capstone lab or runbook submission is required and contains no resource reference, URL, exercise ID, or deployment requirement.

### 63. P1 — Agence SEO autonome composée de plusieurs agents

**Cours :** `ia_appliquee_metiers_tp__10` — **Écran :** `ia_appliquee_metiers_tp__10-screen-01` — **Statut :** Corrigé / remplacé.

**Action :** Translated the target-role, level, duration, and four competency values in the English objective hero.

**Preuve :** blocks[0].body.en and blocks[0].items[0..3].en now contain English-only learner-facing text.

### 64. P1 — Agence SEO autonome composée de plusieurs agents

**Cours :** `ia_appliquee_metiers_tp__10` — **Écran :** `ia_appliquee_metiers_tp__10-screen-03` — **Statut :** Corrigé / remplacé.

**Action :** Translated the visible English implementation flow, including its heading, four steps, review step, checks panel, column labels, and checklist items.

**Preuve :** The English fields in both screen blocks now use coherent English terms such as “Define the scope”, “Review”, “Do”, and “Avoid”.

### 65. P1 — Concevoir un agent IA de support client

**Cours :** `ia_appliquee_metiers_tp__12` — **Écran :** `ia_appliquee_metiers_tp__12-mini-project` — **Statut :** Retiré.

**Action :** Le cloud_exercise de mini-projet a été retiré car son support fictif référencé est absent du dépôt. Le chapitre est désormais une étude de cas autonome expliquant les routes FAQ, brouillon sourcé, escalade et proposition d’article ; elle se conclut par un QCM contextualisé à correction serveur. Les renvois à la ressource externe et au support absent ont aussi été retirés afin qu’aucune activité ne dépende d’un accès ou d’un fichier non fourni.

**Preuve :** La recherche locale de 12-12-agent-ia-complet-pour-zendesk-gorgias-ou-freshdesk-avec-n8n-support-fictif_4c37e0da.md retourne 0 fichier. Le bloc ia_appliquee_metiers_tp__12-mini-project-proof a été remplacé par ia_appliquee_metiers_tp__12-case-study et ia_appliquee_metiers_tp__12-case-study-quiz ; ce dernier comporte quatre options, une réponse correcte existante, FR/EN, explication FR/EN et serverValidated:true. La validation locale JSON/IDs/QCM/vidéos/chapitres a réussi.

### 66. P1 — Agent Zendesk RAG avec base documentaire et mémoire

**Cours :** `ia_appliquee_metiers_tp__14` — **Écran :** `ia_appliquee_metiers_tp__14-screen-01` — **Statut :** Corrigé / remplacé.

**Action :** Translated every learner-visible English field in the opening framing: chapter title, hero title, target-role/level/duration body, four learning objectives, and the opening callout title. Also aligned the course and lesson English titles and descriptions with this framing.

**Preuve :** Local JSON validation confirmed the requested English values at screen-01, valid JSON, unique retained IDs, and valid single-choice question/option/correct-answer references.

### 67. P1 — Construire un Data Analyst IA conversationnel

**Cours :** `ia_appliquee_metiers_tp__32` — **Écran :** `ia_appliquee_metiers_tp__32-final-quiz` — **Statut :** Corrigé / remplacé.

**Action :** Réécriture des quatre QCM existants et du tri séquentiel pour évaluer explicitement la séparation récupération/calcul, le rôle déterministe de Calculator et la réponse en langage métier ; ajout des explications FR/EN et de serverValidated:true. Le contenu technique auto-suffisant précédant l’évaluation explique ces trois responsabilités sans exiger d’exécution.

**Preuve :** Le chapitre final conserve les IDs ia_appliquee_metiers_tp__32-quiz-01 à -04 et comporte désormais un QCM sur l’architecture séparée, Calculator, la formulation métier et le contrat de récupération, chacun avec 4 options bilingues, correctAnswer valide et serverValidated:true.

### 68. P1 — Agent RAG pour analyser les résultats financiers d'entreprises

**Cours :** `ia_appliquee_metiers_tp__35` — **Écran :** `ia_appliquee_metiers_tp__35-final-quiz` — **Statut :** Corrigé / remplacé.

**Action :** Le quiz final conserve ses quatre IDs de QCM et son seuil de 4, mais chaque item évalue désormais un acquis RAG distinct : provenance et chunking, embeddings et recherche vectorielle, réponse bornée par les passages retrouvés, puis structure vérifiable d’un rapport Google Docs. Le tri généraliste a été supprimé. Les quatre explications sont spécifiques, bilingues et les QCM sont serverValidated.

**Preuve :** Le chapitre final contient exactement ia_appliquee_metiers_tp__35-quiz-01 à -04, tous de type single_choice_exercise, avec 4 options FR/EN distinctes, correctAnswer appartenant aux options, serverValidated=true et passThreshold=4. Le bloc ia_appliquee_metiers_tp__35-quiz-order a été retiré. Le contenu visible de l’écran de construction explicite la chaîne corpus/chunks/provenance → embeddings et recherche Pinecone → réponse sourcée → rapport Google Docs, sans exiger de compte ni d’exécution externe.

### 69. P1 — LLM Application Security and Red Teaming Specialist

**Cours :** `llm_application_security_red_teaming_specialist__04` — **Écran :** `lesson_04_chapter_06` — **Statut :** Corrigé / remplacé.

**Action :** Removed the unavailable “Final Lab” progression instruction and replaced it with a self-contained bilingual module synthesis, a reasoning-only case study, and an aligned server-validated quiz.

**Preuve :** The only completion block now states that no external access or additional hands-on activity is required; it contains no “Final Lab” reference. Its second block is lesson_04_module_complete_q0, which tests authorization scope against a retrieved-instruction scenario.

### 70. P1 — LLMOps and AI Observability Engineer

**Cours :** `llmops_ai_observability_engineer__02` — **Écran :** `lesson_01_chapter_01` — **Statut :** Corrigé / remplacé.

**Action :** Transfert des objectifs depuis chapter.body vers un bloc content bilingue placé avant la vidéo, tout en conservant le champ legacy.

**Preuve :** Le chapitre contient désormais [content(fr,en), video] ; les quatre objectifs sont visibles avant le visionnage.

### 71. P1 — LLMOps and AI Observability Engineer

**Cours :** `llmops_ai_observability_engineer__02` — **Écran :** `lesson_02_chapter_02` — **Statut :** Corrigé / remplacé.

**Action :** Transfert de l’explication RAG dans un bloc content bilingue avant la vidéo ; clarification de la propagation W3C Trace Context, du rôle de Baggage et des span links. Correction associée de l’explication du checkpoint sur Trace Context.

**Preuve :** Le chapitre contient désormais [content(fr,en), video]. Le checkpoint existant de la leçon reste aligné et précise que traceparent/tracestate sont définis par W3C Trace Context, sans référence erronée à RFC 7239.

### 72. P1 — LLMOps and AI Observability Engineer

**Cours :** `llmops_ai_observability_engineer__02` — **Écran :** `lesson_03_chapter_06` — **Statut :** Corrigé / remplacé.

**Action :** Transfert du message de clôture et de la transition vers la leçon sur le masquage des données dans un bloc content bilingue placé avant le tutoriel.

**Preuve :** Le chapitre contient désormais [content(fr,en), video] ; la clôture et la transition sont rendues avant le visionnage.

### 73. P1 — Automatisation comptable par l’IA

**Cours :** `automatisation_comptable_ia__01` — **Écran :** `novasavo_u03_screen_03` — **Statut :** Corrigé / remplacé.

**Action :** Remplacement du canevas générique par une explication bilingue de la saisie automatisée (pièce conservée, extraction, contrôles et revue), deux séquences propres au sujet et un QCM contextualisé.

**Preuve :** Blocs content novasavo_u03_screen_03_concept, timeline/flow conservés et spécifiés, et QCM novasavo_u03_screen_03_quiz validé localement.

### 74. P1 — Automatisation comptable par l’IA

**Cours :** `automatisation_comptable_ia__01` — **Écran :** `novasavo_u04_screen_03` — **Statut :** Corrigé / remplacé.

**Action :** Réécriture sur l'imputation au plan de comptes, les règles explicites, les indices et la revue des cas ambigus, avec exemple de fournisseur à contexte variable et QCM.

**Preuve :** Blocs content novasavo_u04_screen_03_concept, timeline/flow thématiques et QCM novasavo_u04_screen_03_quiz validés localement.

### 75. P1 — Automatisation comptable par l’IA

**Cours :** `automatisation_comptable_ia__01` — **Écran :** `novasavo_u05_screen_03` — **Statut :** Corrigé / remplacé.

**Action :** Réécriture sur le rapprochement relevé bancaire/grand livre, la normalisation des attributs, les statuts de correspondance et le traitement documenté des écarts, avec QCM.

**Preuve :** Blocs content novasavo_u05_screen_03_concept, timeline/flow thématiques et QCM novasavo_u05_screen_03_quiz validés localement.

### 76. P1 — Automatisation comptable par l’IA

**Cours :** `automatisation_comptable_ia__01` — **Écran :** `novasavo_u06_screen_03` — **Statut :** Corrigé / remplacé.

**Action :** Réécriture sur la capture, la vérification, les doublons potentiels et l'approbation distincte des factures et dépenses, avec contraste et QCM.

**Preuve :** Blocs content novasavo_u06_screen_03_concept, timeline/flow thématiques et QCM novasavo_u06_screen_03_quiz validés localement.

### 77. P1 — Automatisation comptable par l’IA

**Cours :** `automatisation_comptable_ia__01` — **Écran :** `novasavo_u07_screen_03` — **Statut :** Corrigé / remplacé.

**Action :** Réécriture distinguant données historiques, hypothèses, scénarios et décisions, avec contrôle par comparaison aux observations et QCM.

**Preuve :** Blocs content novasavo_u07_screen_03_concept, timeline/flow thématiques et QCM novasavo_u07_screen_03_quiz validés localement.

### 78. P1 — Automatisation comptable par l’IA

**Cours :** `automatisation_comptable_ia__01` — **Écran :** `novasavo_u08_screen_03` — **Statut :** Corrigé / remplacé.

**Action :** Réécriture distinguant signal d'anomalie et preuve de fraude, avec priorisation explicable, revue indépendante et conclusion documentée, plus QCM.

**Preuve :** Blocs content novasavo_u08_screen_03_concept, timeline/flow thématiques et QCM novasavo_u08_screen_03_quiz validés localement.

### 79. P1 — Automatisation comptable par l’IA

**Cours :** `automatisation_comptable_ia__01` — **Écran :** `novasavo_u09_screen_03` — **Statut :** Corrigé / remplacé.

**Action :** Réécriture sur les données autorisées, le versionnage et la date d'effet des paramètres, les contrôles et la validation avant finalisation de paie ou déclaration, plus QCM.

**Preuve :** Blocs content novasavo_u09_screen_03_concept, timeline/flow thématiques et QCM novasavo_u09_screen_03_quiz validés localement.

### 80. P1 — Automatisation comptable par l’IA

**Cours :** `automatisation_comptable_ia__01` — **Écran :** `novasavo_u10_screen_03` — **Statut :** Corrigé / remplacé.

**Action :** Réécriture sur le système d'enregistrement, les contrats de données, le moindre privilège, les validations et les reprises idempotentes, avec QCM.

**Preuve :** Blocs content novasavo_u10_screen_03_concept, timeline/flow thématiques et QCM novasavo_u10_screen_03_quiz validés localement.

### 81. P1 — Automatisation comptable par l’IA

**Cours :** `automatisation_comptable_ia__01` — **Écran :** `novasavo_u11_screen_03` — **Statut :** Corrigé / remplacé.

**Action :** Réécriture sur la gouvernance d'un cas d'usage : finalité, limites, responsabilités, données, revue humaine et traçabilité de la décision, avec QCM.

**Preuve :** Blocs content novasavo_u11_screen_03_concept, timeline/flow thématiques et QCM novasavo_u11_screen_03_quiz validés localement.

### 82. P1 — Automatisation comptable par l’IA

**Cours :** `automatisation_comptable_ia__01` — **Écran :** `novasavo_u12_screen_03` — **Statut :** Corrigé / remplacé.

**Action :** Réécriture sur l'évolution du rôle comptable vers la qualification des preuves, le jugement, l'explication et l'amélioration des contrôles, avec QCM.

**Preuve :** Blocs content novasavo_u12_screen_03_concept, timeline/flow thématiques et QCM novasavo_u12_screen_03_quiz validés localement.

### 83. P1 — Open-Source LLMs and Fine-Tuning Engineer

**Cours :** `open_source_llms_fine_tuning_engineer__01` — **Écran :** `lesson_01_chapter_01` — **Statut :** Corrigé / remplacé.

**Action :** Le contenu d’objectifs jusque-là invisible a été transféré dans un bloc content bilingue placé avant la vidéo. Le titre, la consigne préalable et les libellés vidéo sont bilingues ; un QCM contextualisé clôt l’écran.

**Preuve :** Le premier bloc est désormais open_source_llms_01_ch01_objectives_content (body.fr/body.en), suivi de la vidéo puis de open_source_llms_01_ch01_selection_framework_q1, dont les options, explications et serverValidated sont présents.

### 84. P1 — Open-Source LLMs and Fine-Tuning Engineer

**Cours :** `open_source_llms_fine_tuning_engineer__01` — **Écran :** `lesson_02_chapter_02` — **Statut :** Corrigé / remplacé.

**Action :** La vidéo Mistral 7B hors sujet a été retirée. Elle est remplacée par une explication bilingue rendue sur le Hub, les model cards, les dataset cards, le streaming et les limites d’un IterableDataset, suivie d’un QCM.

**Preuve :** Le chapitre commence par open_source_llms_01_ch02_hub_cards_content et se termine par open_source_llms_01_ch02_cards_streaming_q1 ; il ne contient plus de bloc vidéo. Le contenu s’appuie sur les documentations officielles Hugging Face des cards et du streaming.

### 85. P1 — Open-Source LLMs and Fine-Tuning Engineer

**Cours :** `open_source_llms_fine_tuning_engineer__04` — **Écran :** `lesson_01_chapter_01` — **Statut :** Corrigé / remplacé.

**Action :** Les objectifs cachés ont été rendus avant la vidéo par une explication bilingue sur le choix entre adaptateur PEFT séparé et modèle fusionné, avec le comportement réel de merge_and_unload(). La vidéo conservée comporte aussi une alternative française et une consigne bilingue spécifique.

**Preuve :** Le premier bloc est open_source_llms_04_ch01_adapter_merging_content ; la vidéo qui suit possède title.fr, label.fr, objectiveBefore.fr/en et alternativeTextFr ; open_source_llms_04_ch01_adapter_merge_q1 valide la distinction expliquée.

### 86. P1 — Open-Source LLMs and Fine-Tuning Engineer

**Cours :** `open_source_llms_fine_tuning_engineer__04` — **Écran :** `lesson_02_chapter_02` — **Statut :** Corrigé / remplacé.

**Action :** La vidéo sur les familles de LLM, non alignée sur la documentation, a été retirée. Un bloc bilingue explique désormais les rôles complémentaires des model cards et dataset cards, leurs métadonnées et le rattachement d’un fine-tune au base_model ; un QCM ciblé conclut l’écran.

**Preuve :** Le chapitre débute par open_source_llms_04_ch02_documentation_content et contient open_source_llms_04_ch02_cards_scope_q1 ; aucun bloc vidéo ne reste dans ce chapitre.

### 87. P1 — Open-Source LLMs and Fine-Tuning Engineer

**Cours :** `open_source_llms_fine_tuning_engineer__04` — **Écran :** `lesson_04_chapter_06` — **Statut :** Corrigé / remplacé.

**Action :** Le renvoi vers le hands-on lab, la publication de benchmark/model card et la certification non fournis a été supprimé. La clôture est remplacée par un cas autonome de revue de promotion et un QCM sur le dossier de traçabilité requis.

**Preuve :** lesson_04_chapter_06 ne contient plus l’instruction Proceed to the hands-on lab ; son bloc content bilingue précise qu’aucun lab, upload ou étape de certification n’est inclus, puis open_source_llms_04_ch04_lifecycle_release_q1 teste le cas présenté.

