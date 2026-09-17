# Revue de contenu — `intermediate_workflow_automation_with_n8n__01`

## Conclusion

Le cours est **structurellement complet selon ses propres métadonnées** : quatre leçons, quarante activités et treize vidéos, conformément aux valeurs `datacampImport.expected` du JSON. En revanche, sa préparation à la pratique autonome est **insuffisante**. Le défaut principal est observable directement dans le fichier de cours : les 27 TP sont des blocs `cloud_exercise` dont `instructions`, `steps`, `resources`, `hint`, `solution` et `successMessage` sont vides. Le champ `assignment` contient parfois une ébauche de consigne, mais il ne remplace pas un guidage exécutable ni une preuve de réussite.

L’état d’alignement avec une source DataCamp spécifique est **partiellement démontrable seulement**. Les preuves locales n8n disponibles concernent principalement le cours d’initiation `initiation_automatisation_workflows_n8n`, et non ce cours intermédiaire. Elles permettent de contrôler les règles locales de production des TP, mais pas de confirmer factuellement la fidélité de la séquence intermédiaire à une source DataCamp complète.

## Constats factuels

### 1. Structure et séquence

Le JSON contient quatre leçons de dix activités chacune. Les activités alternent des activités `teaching` avec vidéo et des activités `exercise` avec TP cloud. Les métadonnées annoncent 40 activités et 13 vidéos, et le contenu contient effectivement ces nombres. Ce point est cohérent avec les attentes déclarées dans le même fichier : `client/public/data/courses/intermediate_workflow_automation_with_n8n__01.json`.

Les champs `description.en` et `description.fr` des 40 activités sont vides. Les titres français restent très souvent en anglais, par exemple « Building Event-Driven and Scheduled Automations », « Fetch weather data from an API » et « Process only new records ». Il s’agit d’une incohérence de présentation observable dans le JSON, sans preuve locale permettant d’attribuer ces formulations à la source DataCamp.

Les vidéos ont un `transcript` vide et un tableau `transcriptSegments` vide. Le fichier ne fournit donc pas de transcription ou de support textuel associé à ces 13 activités vidéo. Ce constat porte sur le contenu livré, non sur la qualité ou la fidélité des fichiers MP4.

### 2. Guidage des TP dans l’environnement de l’apprenant

Les 27 blocs `cloud_exercise` ont simultanément `instructions: ""`, `steps: []`, `resources: []`, `hint: ""`, `solution: ""` et `successMessage: ""`. Le JSON n’expose donc ni procédure détaillée, ni ressources attachées, ni critère de succès, ni aide, ni correction structurée.

Certains `assignment` contiennent des consignes plus riches, notamment pour les TP de workflows producteur-consommateur, de planification, d’API météo, de Data Tables et de gestion d’erreurs. Toutefois, plusieurs assignments ne contiennent qu’un chemin d’interface générique suivi de « FR », et se terminent par « Chargement de votre environnement... ». L’apprenant ne reçoit alors pas de tâche reconstructible dans son propre n8n.

Le champ `environmentGuide` demande d’installer Python et le SDK requis, puis de configurer des identifiants personnels. Dans le JSON audité, il ne précise ni installation de n8n, ni choix n8n Cloud/Docker, ni version, ni procédure de connexion, ni vérification de disponibilité des nœuds. Pour un cours centré sur n8n, ce guidage est incomplet et générique. Cette conclusion est directement fondée sur le contenu du champ et renforcée par la règle locale qui exige une préparation n8n Cloud ou Docker : `docs/n8n_datacamp_integration_rules_2026-08-20.md`.

### 3. Téléchargements, dépendances et services externes

Plusieurs TP renvoient l’apprenant vers des fichiers tels que `1.2.1_starter_consumer-workflow.json`, `2.2.2_starter_python-code-validate.json` ou `4.2.1_starter_multi-step-workflow.json` dans « Desktop > Resources ». Ces noms apparaissent dans `assignment`, mais les tableaux `resources` sont vides. Le JSON ne fournit donc pas de téléchargement ou de chemin local exploitable pour ces dépendances. Il ne permet pas non plus de prouver que ces fichiers sont distribués ailleurs.

Trois TP appellent explicitement des services publics : `https://wttr.in/Stockholm?format=j1`, `https://wttr.in/Berlin?format=j1` et `https://wttr.in/London?format=j1`. Un autre utilise `https://httpstat.us/500`. Le cours ne contient pas, dans les champs observés, de stratégie de repli hors ligne, d’avertissement sur la disponibilité de ces services, ni de consigne sur les différences de résultat. Cela rend la reproductibilité dépendante de services externes.

Les TP qui utilisent des workflows appelés, des URL de production, des Data Tables ou des fichiers starter supposent également un état préalable de l’environnement. Les assignments mentionnent parfois l’activation d’un workflow ou la création d’une table, mais les champs structurés de préparation, étapes et ressources restent vides. La dépendance est donc documentée de façon dispersée et non standardisée.

## Comparaison aux preuves locales autorisées

Les règles locales n8n exigent pour chaque TP : prérequis n8n, parcours n8n Cloud et Docker local, étapes détaillées, zone de preuve, correction masquée avant soumission et traitement explicite des fichiers de VM non téléchargeables (`docs/n8n_datacamp_integration_rules_2026-08-20.md`, notamment les lignes 13–15). L’audit local du cours d’initiation indique, pour ses 17 TP, la présence de préparation, configuration Cloud/Docker, étapes guidées, réponse apprenant et ressource téléchargeable (`docs/n8n_datacamp_compliance_audit_2026-08-20.json`, lignes 48–242). Le cours intermédiaire audité ne présente pas ces éléments dans ses champs structurés : il a 27 TP, mais chacun a `steps` et `resources` vides.

La note de source locale confirme que les activités DataCamp n8n doivent rester pratiques, séparées entre consigne, réponse et correction, et exécutables hors VM DataCamp (`docs/n8n_datacamp_source_findings_2026-08-20.md`, lignes 34–39). Cette preuve porte sur le cours d’initiation et ne suffit pas à déclarer une reprise inexacte du cours intermédiaire. Aucun document local `datacamp_*alignment*.json`, `datacamp_*source*.md` ou `datacamp_*production*.md` correspondant explicitement à `intermediate_workflow_automation_with_n8n__01` n’a été retenu comme preuve de source dans le périmètre demandé.

## Niveau de risque pédagogique

**Sévérité : élevée pour la pratique autonome.** Un apprenant peut comprendre certains objectifs à partir des assignments détaillés, mais il ne dispose pas de manière homogène des prérequis n8n, fichiers, étapes, contrôles attendus et messages de réussite. Les TP qui ne contiennent qu’un écran de chargement ou une référence à Desktop > Resources sont particulièrement peu actionnables.

**Prêt pour la pratique : nécessite un guidage de l’environnement apprenant.** Le JSON ne permet pas de conclure à une application inutilisable dans tous les cas, car certains assignments décrivent une partie de la manipulation. En revanche, il ne satisfait pas de façon observable le standard local de TP autonome.

## Correctifs génériques réutilisables

1. Appliquer à chaque TP le bloc standard de préparation n8n : prérequis, n8n Cloud ou Docker, version cible, connexion, test de démarrage et consigne de sécurité des secrets.
2. Remplacer chaque `Desktop > Resources` par une ressource standard attachée ou, si le fichier ne peut pas être distribué, par une procédure de reconstruction complète avec état initial, données d’exemple et résultat attendu.
3. Décomposer chaque assignment en étapes numérotées : créer/importer, configurer, exécuter, inspecter, puis produire une preuve.
4. Ajouter un critère de réussite observable et une zone de réponse standard, avec indice et correction masqués avant soumission.
5. Encapsuler les appels à `wttr.in` et `httpstat.us` dans un bloc standard de dépendance externe : objectif, test de disponibilité, résultat de repli local et avertissement sur la variabilité des réponses.
6. Utiliser un contrôle de localisation standard pour renseigner les descriptions et les titres français, et prévoir une transcription ou un résumé textuel local pour chaque vidéo lorsque le bloc le permet.

## Références locales

- `client/public/data/courses/intermediate_workflow_automation_with_n8n__01.json`
- `docs/n8n_datacamp_integration_rules_2026-08-20.md`
- `docs/n8n_datacamp_compliance_audit_2026-08-20.json`
- `docs/n8n_datacamp_source_findings_2026-08-20.md`
- `docs/n8n_course_audit_local_2026-08-20.json`
- `scripts/import-datacamp-course.mjs`

> Aucun fichier de cours n’a été modifié.
> 
> Les documents DataCamp web et le navigateur n’ont pas été utilisés.
> 
> Les écarts de fidélité à une source intermédiaire ne sont pas affirmés sans preuve locale correspondante.

[1]: client/public/data/courses/intermediate_workflow_automation_with_n8n__01.json "JSON du cours audité"
[2]: docs/n8n_datacamp_integration_rules_2026-08-20.md "Règles locales d’intégration DataCamp n8n"
[3]: docs/n8n_datacamp_compliance_audit_2026-08-20.json "Audit local de conformité n8n"
[4]: docs/n8n_datacamp_source_findings_2026-08-20.md "Constats locaux de source n8n"
[5]: docs/n8n_course_audit_local_2026-08-20.json "Audit local de structure du cours n8n"
[6]: scripts/import-datacamp-course.mjs "Script local d’import DataCamp"

