# Observations authentifiées DataCamp — 17 septembre 2026

La comparaison a été effectuée dans le navigateur Mac partagé, avec une session DataCamp authentifiée. Les constats ci-dessous servent uniquement à étayer des adaptations Neopolis ; ils ne justifient pas la reprise intégrale de contenus, médias ou réponses DataCamp.

## IA pour le marketing

- Catalogue source : `https://app.datacamp.com/learn/courses/ai-for-marketing`
- Parcours source : `https://campus.datacamp.com/fr/courses/ai-for-marketing/augmenting-campaign-planning-with-ai?ex=1&skip_variants_modal=true`
- Écran suivant consulté : `https://campus.datacamp.com/fr/courses/ai-for-marketing/augmenting-campaign-planning-with-ai?ex=2&skip_variants_modal=true`

La fiche publique DataCamp affiche un **cours interactif** de niveau débutant, mis à jour en juin 2026, avec **3 h, 10 vidéos et 29 exercices**. Elle affiche une condition préalable, « Introduction à ChatGPT », ainsi que trois chapitres progressifs : planification de campagne, exécution de campagne et assistants personnalisés.

Le plan de cours visible confirme l’alternance entre une activité vidéo et des exercices. Les titres du premier chapitre correspondent aux titres conservés dans le JSON Neopolis. La première activité source est rendue comme un écran vidéo avec commande de transcription, plan de cours et passage à l’activité suivante. L’écran de l’exercice 2 a été ouvert mais le navigateur a dépassé le délai de rendu ; aucune conclusion sur son contenu interne ou son correctionnement n’est tirée.

### Incidence pour Neopolis

Neopolis ne doit pas revendiquer une reproduction des exercices DataCamp qui ont été retirés ou non rendus. Les activités de remplacement doivent être clairement présentées comme **TP Neopolis**, accompagnées de prérequis, d’un environnement autonome, d’étapes, d’un résultat attendu et de critères explicites. Les structures, titres et objectifs confirmés sont préservables ; tout contenu ambigu reste en attente de comparaison d’écran ou de preuve locale.

## Limites observées

L’accès au premier écran source a réussi. La navigation directe vers le deuxième écran a chargé le titre mais son contenu n’a pas fini de s’afficher dans le délai du connecteur. Les comparaisons d’écrans suivantes doivent donc être effectuées une à une avec attente explicite et documentées dans ce fichier avant d’être utilisées pour modifier un cours.

## Références

[1]: https://app.datacamp.com/learn/courses/ai-for-marketing "IA pour le marketing — fiche de cours DataCamp"
[2]: https://campus.datacamp.com/fr/courses/ai-for-marketing/augmenting-campaign-planning-with-ai?ex=1&skip_variants_modal=true "Le tournant de l’IA dans le marketing — DataCamp"
[3]: https://campus.datacamp.com/fr/courses/ai-for-marketing/augmenting-campaign-planning-with-ai?ex=2&skip_variants_modal=true "De l’invite au résultat — DataCamp"

## Automatisation de workflows intermédiaire avec n8n

- Fiche : `https://app.datacamp.com/learn/courses/intermediate-workflow-automation-with-n8n`
- Chapitre 1 : `https://campus.datacamp.com/fr/courses/intermediate-workflow-automation-with-n8n/building-event-driven-and-scheduled-automations?ex=1&skip_variants_modal=true`
- TP webhook : même URL avec `ex=2`
- TP validation : même URL avec `ex=3`

La fiche source confirme un cours interactif de niveau intermédiaire, **4 h, 13 vidéos, 40 exercices** et un prérequis explicite : « Initiation à l’automatisation de workflows avec n8n ». Les objectifs rendent nécessaires les webhooks, les appels REST, les nœuds Code, les Data Tables, la gestion par lots, les sous-workflows, les contrôles de validation et l’observabilité.

La vidéo initiale distingue l’URL de test de l’URL de production d’un Webhook Trigger, l’attente « Listen for Test Event » et le réglage « Respond to Webhook ». Elle annonce une pratique qui reprend le motif webhook et le pousse vers les charges utiles imbriquées.

Le premier TP source (« Receive a webhook and respond ») est un exercice guidé en trois étapes. Il demande, en substance, de créer un workflow avec Webhook Trigger (POST et réponse déléguée à Respond to Webhook), de connecter Respond to Webhook avec une réponse JSON et un code 200, puis d’épingler une charge utile de test contenant un e-mail, d’exécuter et de sauvegarder. Les instructions incluent un résultat concret à vérifier : les deux nœuds doivent réussir.

Le second TP source (« Add validation to a webhook workflow ») est un exercice guidé en quatre étapes. Le scénario concerne des commandes sans e-mail. La première étape permet de reprendre le workflow précédent ou d’importer un fichier VM `1.1.2_starter_webhook-validation.json`. Les étapes suivantes demandent de créer une branche If sur l’existence de l’e-mail, des sorties succès/erreur avec des codes 200/400, puis de tester une charge valide et une charge sans e-mail. Le fichier VM n’existe pas dans le dépôt Neopolis : il ne doit donc pas être proposé comme téléchargement. La version Neopolis devra proposer une création guidée depuis zéro ou une ressource de remplacement produite et validée par Neopolis.

### Incidence pour Neopolis

Deux TP d’ouverture peuvent être rétablis de façon fidèle sans reprendre les textes : conserver les objectifs, fournir les étapes reformulées, un environnement personnel n8n clairement identifié, des charges utiles synthétiques, une preuve de réussite, et une correction Neopolis cachée avant soumission. Le premier TP ne requiert aucun fichier. Le second doit préférer une construction guidée à un lien vers le fichier VM absent.


## 18 septembre 2026 — accès DataCamp complet, n8n intermédiaire

Les écrans authentifiés de `Intermediate Workflow Automation with n8n` confirment une durée de quatre heures, 13 vidéos, 40 exercices et quatre modules. Le contenu local Neopolis a été rapproché avec les écrans suivants, sans reprise littérale :

- `reliability-and-production-readiness?ex=2` : deux portes `If` avant `Process Order` pour bloquer `order_id` absent et `amount` nul ; les erreurs vont vers `Stop and Error`.
- `...?ex=3` : workflow distinct `Error Monitor` avec `Error Trigger`, `Edit Fields` et insertion `Data Table` dans `error_log`, déclaré comme Error Workflow du flux fragile.
- `...?ex=4` : `HTTP Request` vers `https://httpstat.us/500`, option `Continue Using Error Output`, branche rouge vers `Edit Fields` afin de journaliser sans interrompre l’exécution.
- `...?ex=6` : table `execution_log`, insertions latérales depuis `HTTP Request`, `Transform Data` et `Format Output`, puis `Get row(s)` pour contrôler trois lignes de checkpoint.
- `...?ex=7` : `Code` nommé Evaluate Output, `If` sur pass, `Edit Fields` de synthèse dans chaque branche, à partir du flux de journalisation.
- `...?ex=9` : capstone depuis zéro : `Schedule Trigger` chaque heure, `HTTP Request` GET `https://wttr.in/London?format=j1` en réponse JSON, nœuds `Code` pour transformation/déduplication, `Loop Over Items` pour les lots et `If` pour séparer succès/échec.

Les workflows de départ et machines virtuelles DataCamp n’ont pas été reproduits. Les TP Neopolis utilisent des jeux synthétiques clairement étiquetés ou les endpoints publics explicitement fournis par l’écran source, dans l’instance personnelle n8n de l’apprenant.

## 18 septembre 2026 — accès DataCamp complet, IA pour le marketing

La page authentifiée `https://app.datacamp.com/learn/courses/ai-for-marketing` confirme le niveau débutant, trois heures, dix vidéos, 29 exercices et trois modules : planification augmentée, exécution des campagnes et assistants personnalisés. Le premier écran pratique authentifié `https://campus.datacamp.com/fr/courses/ai-for-marketing/augmenting-campaign-planning-with-ai?ex=2` demande d’identifier dix cas d’usage de l’IA générative en marketing mais dépend d’un compte Microsoft Copilot préconnecté. Neopolis ne doit pas reproduire cette préconnexion ni imposer Copilot : les adaptations doivent rester exécutables dans un assistant IA personnel, avec données synthétiques et sans secrets. Les autres TP sont conservés uniquement quand l’énoncé et les éléments locaux permettent une adaptation générique, sans mentionner les agents, VM, comptes ni ressources DataCamp inaccessibles.
