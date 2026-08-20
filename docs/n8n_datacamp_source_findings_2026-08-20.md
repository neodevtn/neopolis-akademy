# Référence DataCamp — Introduction to Workflow Automation with n8n

**Auteur :** Manus AI  
**Statut :** collecte en cours

La page publique DataCamp confirme que le cours source s’intitule **Introduction to Workflow Automation with n8n** et propose des exercices pratiques interactifs.

Un exercice public de la section « Intelligent Automation with LLMs » est intitulé **Build your first Agent workflow**. Il demande de créer un workflow à partir d’exemples de retours clients dans un nœud *Edit Fields*, puis d’utiliser un nœud *Agent* avec un sous-nœud *OpenAI Chat Model* pour produire une synthèse en une phrase. Cet élément fournit une ancre de contrôle utile : le cours Neopolis doit conserver une activité pratique distincte, des consignes exploitables dans un environnement n8n et une séparation claire entre consigne, réponse et correction.

La collecte détaillée de la structure complète se poursuit à partir des éléments DataCamp publiquement accessibles et du manifeste d’import Neopolis.

## Aperçu public du cours

Source : [DataCamp — Introduction to Workflow Automation with n8n](https://www.datacamp.com/courses/introduction-to-workflow-automation-with-n8n), consultée le 20 août 2026.

Le cours public est indiqué comme niveau **Basic**, durée estimée **3 h**, mis à jour **06/2026**, avec une note affichée de **4,7/5** pour 746 avis. Il comporte **3 chapitres** :

| Chapitre | Intitulé source | Promesse pédagogique vérifiable |
| --- | --- | --- |
| 1 | Getting Started with Workflow Automation | Canvas n8n, déclencheurs, nœuds, connexions, formulaires, API et Edit Fields. |
| 2 | Logic, Conditions, and Data Transformation | If, Switch, expressions, JSON aplati et Merge. |
| 3 | Intelligent Automation with LLMs | Agent OpenAI, prompts, classification, routage et capstone d’onboarding. |

Les neuf activités du premier chapitre visibles publiquement sont : *The Art of Automation and n8n* ; *Exploring Your First n8n Workflow!* ; *Triggering n8n Workflows* ; *The first domino in the chain!* ; *Capturing event signups with Form Triggers* ; *Building Your First n8n Workflow!* ; *From partner contacts to n8n fields* ; *Filtering out the noise with Edit Fields* ; *Capturing event signups and timestamps*.

Le cours source annonce explicitement des activités vidéo et pratiques, un environnement visuel de construction de workflow, et un projet final d’onboarding alimenté par LLM. Ces éléments seront confrontés au manifeste Neopolis et au lecteur publié.

## Objectifs et modalités annoncés

La page source indique également : aucun prérequis, collaboration officielle DataCamp/n8n, progression par activités et *Statement of Accomplishment* après complétion. Les cinq objectifs affichés sont de construire des workflows visuels, router avec If/Switch, écrire des expressions sur les données dynamiques, fusionner des jeux de données et connecter des Agents OpenAI pour classifier, résumer et personnaliser.

Pour la comparaison Neopolis, les critères de fidélité sont donc : trois chapitres, progression de la vidéo vers la pratique, laboratoires réellement réalisables hors VM DataCamp, activités de logique et de transformation, section LLM avec Agent, et capstone d’onboarding.

## Comparaison authentifiée — exercice 2

La session DataCamp authentifiée confirme que l’exercice 2 est un TP de **100 XP** sur un canvas n8n intégré. L’interface source sépare clairement, à gauche, le contexte de l’exercice, la vérification intelligente et les quatre étapes numérotées, et, à droite, un environnement n8n connecté. Les consignes du premier pas correspondent au manifeste et au JSON Neopolis : création de workflow, import de `currency_exchange.json`, puis inspection de Form Trigger, HTTP Request et Edit Fields.

Neopolis respecte cette structure pédagogique en la rendant autonome : même objectif, mêmes quatre étapes et même XP, avec préparation Cloud/Docker et zone de preuve. La différence assumée est l’absence de VM DataCamp et de fichiers préchargés ; elle est explicitement compensée par des instructions de reconstruction. Le contrôle visuel doit en revanche couvrir le rendu des rubriques d’évaluation, car certains TP affichent encore des marqueurs Markdown bruts.
