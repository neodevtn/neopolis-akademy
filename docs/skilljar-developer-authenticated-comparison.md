# Relevé Skilljar authentifié — Developer Foundations

## Session du 16 septembre 2026

La session utilisateur authentifiée sur `https://anthropic-partners.skilljar.com/path/claude-certified-developer-foundations` est accessible. La page de parcours affiche la progression `0 of 5 completed` et confirme les trois premières entrées suivantes :

| Ordre | Cours officiel observé | Durée affichée |
|---:|---|---:|
| 1 | MSO Foundations | 57 minutes |
| 2 | Production-Grade Prompting, Agents & Tool Use | 209 minutes |
| 3 | Claude Code, MCP & Integration | 142 minutes |

Les durées déjà publiées dans Neopolis concordent avec ce premier relevé. Le présent journal servira uniquement à relever les écrans, activités et ressources explicitement accessibles pour les cours 3 à 5 ; aucun contenu ne sera déduit lorsqu’il n’est pas visible dans la source.

## Cours 3 — Claude Code, MCP & Integration

Le module SCORM authentifié est accessible à l’URL officielle et charge correctement. La première vue source indique **Developer · Module 3**, un total de **22 écrans** et une introduction de **2 minutes**. La navigation latérale confirme au minimum les sections suivantes :

| Ordre source visible | Section / type |
|---:|---|
| 01 | Module Introduction |
| 02 | Permission Modes & Human Gates, avec sous-écrans Teaching, Watch Out et Checkpoint |
| 03 | Durable Project Context |

Ce constat confirme que les checkpoints sont intégrés à la progression du module source. Les contenus détaillés, consignes de TP et éléments à rapprocher seront relevés individuellement avant toute modification Neopolis.

Le lecteur Skilljar expose le module via une iframe SCORM authentifiée (`/view/wp/scorm/22w2tt87k8ver/173ln01ww7hgd`). Cette route sera uniquement consultée pour relever les écrans et interactions visibles ; aucun parcours ne sera complété, remis à zéro ni soumis durant l’audit.

Le chargement direct de cette iframe, dans le navigateur automatisé, ne rend pas son contenu hors du parent Skilljar. En revanche, le parent officiel rend correctement le SCORM, son sommaire et l’écran actif. Les vérifications visuelles poursuivront donc via le lecteur parent ; les métadonnées HTML de l’iframe ne seront utilisées que pour identifier les routes et structures techniques, jamais comme remplacement d’un écran visuellement vérifié.

La page HTML de contenu du module est accessible dans la session et rend directement la première orientation. Elle confirme notamment six objectifs : boucle explore/plan/code et permission ; revue humaine ; contexte durable (`CLAUDE.md`, règles, hooks et sous-agents) ; packaging en Skills, commandes et plugin ; construction/transport/portée d’un serveur MCP ; connexion aux systèmes d’entreprise avec authentification et cadrage de modernisation. Le sommaire source initial visible confirme les trois premières sections de fond et une quatrième section **Packaging Workflows**, cette dernière contenant Teaching, Checkpoint et Watch Out. Ces observations justifient un rapprochement détaillé du TP et du checkpoint de packaging, mais pas encore l’ajout d’un TP exécutable qui n’est pas explicitement présent dans la vue source initiale.

La page de contenu source `https://anthropic-partners.skilljar.com/content/wp/4hdejjwplbrm/168108zug1cy3/Developer_M3_vF2.html` expose ensuite la structure complète suivante : 22 écrans, 8 checkpoints et neuf sections. Les sections **MCP Servers** (S12–S14), **Enterprise Integration** (S15–S17), **Cumulative Integration Task** (S18–S19), **Key Takeaways** (S20–S20B) et **Module Complete** sont explicitement présentes dans Skilljar mais les trois premiers thèmes ne disposent pas encore de chapitres dédiés dans le JSON Neopolis observé le 16 septembre 2026.

| Écrans source | Élément source vérifié | Décision de rapprochement |
|---|---|---|
| S07 | Checkpoint sur les hooks : événement avant exécution, lecture de l’appel sur stdin et sortie `2` pour bloquer `.env.production` | Compatible avec le checkpoint standard ; à restaurer dans le chapitre Contexte de projet durable. |
| S12–S14 | MCP : outils/ressources/prompts, transport `stdio`/HTTP/SSE, portée, secret hors `.mcp.json`, puis checkpoint de correspondance transport-portée | Enseignement et checkpoint de correspondance source vérifiables ; à intégrer avec les blocs standards uniquement. |
| S15–S17 | Intégration d’entreprise : OAuth, clé de service injectée à l’exécution, séparation/rotation des secrets, puis diagnostic d’échec d’authentification | Enseignement et checkpoint à choix unique source vérifiables ; à intégrer avec les blocs standards uniquement. |
| S18–S19 | Tâche cumulative : identifier des défauts dans des fichiers puis produire les fichiers complets corrigés avant révélation et auto-évaluation | À laisser ouverte : cette interaction libre avec révélation n’est pas reproduisible fidèlement par les blocs standards autorisés. |
| S20 | Récapitulatif de sept acquis | À alimenter avec un bloc contenu source-faithful. |

L’audit Claude Sonnet structuré associé est archivé dans `docs/skilljar-developer3-source-audit.json`. Il classe S07, S13, S14, S16, S17 et S20 comme réconciliables avec les composants standards ; il maintient S18–S19 ouverts.

## Cours 4 — Production Engineering, Evals & Security

La session Skilljar authentifiée ouvre le cours officiel à l’URL `https://anthropic-partners.skilljar.com/path/claude-certified-developer-foundations/production-engineering-evals-security/486745/scorm/1twknqoor0w46`. La durée affichée est **211 minutes**, cohérente avec la durée déjà synchronisée dans Neopolis. Le premier écran visible présente la portée du module : évaluation de production, tests et traçage, gestion de défaillances à la montée en charge, budget de coût/orchestration et frontière de sécurité. Le relevé détaillé des écrans, interactions et activités sera effectué avant toute correction additionnelle.

La page parente référence l’enveloppe SCORM `/view/wp/scorm/1ons07v1te4co/1twknqoor0w46`. Comme pour Developer 3, son rendu autonome n’est pas exploitable dans le navigateur automatisé ; elle sera seulement utilisée pour identifier la page de contenu officielle, alors que la validation visuelle demeure effectuée dans le lecteur parent.

La page de contenu authentifiée rend le sommaire source et confirme les cinq premiers ensembles : **Evals & Judges** (3 écrans), **Testing & Tracing** (3), **Failure Handling & Model Selection** (5), **Cost & Orchestration** (3), auxquels s’ajoutent les sections visibles plus bas dans le document source. Cette hiérarchie est cohérente avec les thèmes déjà traités dans Neopolis ; l’analyse suivante ciblera donc les activités et éléments source restants plutôt que de dupliquer l’enseignement déjà présent.

## Cours 5 — Accelerators & IP Contribution

La session Skilljar authentifiée ouvre le cours officiel à l’URL `https://anthropic-partners.skilljar.com/path/claude-certified-developer-foundations/accelerators-ip-contribution/486746/scorm/1gpfepjydcsjm`. La durée affichée est **155 minutes**, cohérente avec la valeur déjà synchronisée dans Neopolis. Le premier écran définit la portée : rendre un code réutilisable, acceptable pour la maintenance, résilient aux évolutions de modèle, et défendable à une revue de sécurité ou de procurement. Le relevé des écrans, interactions et éventuelle étude de cas reste à réaliser directement depuis la source chargée.

La page parente référence l’enveloppe SCORM `/view/wp/scorm/1cvbnsl8f5mhb/1gpfepjydcsjm`. Son rendu isolé est, comme pour les deux autres modules, limité dans le navigateur automatisé. La page de contenu correspondante sera extraite depuis cette configuration tandis que toute validation visuelle sera menée depuis le lecteur parent.

La page de contenu source confirme les sections suivantes : **Packaging for Reuse** (3 écrans), **Contributing Back** (3), **Requirements & Lifecycle** (4), **Deployment & Versioning** (3), suivies d’autres sections visibles dans le HTML source. Les objectifs source couvrent l’accélérateur réutilisable, la contribution documentée, le choix de plateforme, le versionnage et les frontières de confiance. Le relevé détaillé permettra désormais de distinguer les écrans reconstructibles des activités de cas pratique qui exigent un bloc standard compatible.

La source révèle deux tâches cumulatives, S17 et S18, qui constituent l’étude de cas restée ouverte. S17 demande d’identifier trois défauts dans un accélérateur déployé : chemin de dépôt codé en dur, alias de modèle non épinglé et contenu récupéré transmis comme instruction. S18 demande d’expliquer les corrections, puis révèle une version corrigée avec paramétrage, ID de modèle Bedrock complet épinglé avec version de repli, traitement explicite du contenu récupéré comme donnée et passage par une évaluation avant promotion. Ces deux écrans reposent sur une réponse libre suivie d’une révélation de correction ; le bloc standard `CloudExerciseBlock` dispose précisément d’une zone de réponse libre, d’un déverrouillage séquentiel et d’une correction visible après validation. Leur intégration peut donc être étudiée sans créer d’interface spécifique ni simuler un laboratoire externe.

La même source identifie deux checkpoints antérieurs dans **Requirements & Lifecycle**. S07B est un quiz obligatoire de deux questions à choix unique sur une banque européenne régulée : la première distingue l’exigence fonctionnelle « résumé approuvé par un humain avant stockage » ; la seconde distingue l’exigence d’infrastructure « données de transcription traitées dans l’UE ». S07D est une activité obligatoire d’association de cinq actions aux phases requirements, design, test, deploy et operate. Le tri Neopolis existant sous le titre de S07B ne correspond pas à ce format source ; les deux checkpoints doivent donc être réconciliés avec les blocs standards `single_choice_exercise` et `matching`, sans maintenir un tri non sourcé.

Le 16 septembre 2026, la route tRPC locale a confirmé la présence des trois blocs S07 (`skilljar_s07b_q1`, `skilljar_s07b_q2`, `skilljar_s07d`) sans champ `correctAnswer` ni `explanation` dans la donnée servie à l’apprenant. Une capture automatisée sans session Neopolis a affiché l’état de chargement du lecteur, qui reste attendu dans ce contexte non authentifié ; elle ne constitue donc pas une preuve visuelle de l’activité. Le contrôle de rendu authentifié sera repris après publication, tandis que les contrats ciblés couvrent déjà le schéma, le verrouillage et la non-divulgation.

Le contrôle de rendu local des quatre nouvelles routes a été lancé après les validations de données. Les captures parallèles ont rencontré la limitation de débit locale du lecteur (un écran est resté en chargement et un autre a retourné `Too many requests`), sans erreur TypeScript ni rupture du contrat de données. Une vérification visuelle séquentielle sera effectuée après le retour à un débit normal ; la validation tRPC locale confirme déjà les quatre blocs, leurs seuils et leurs règles de déverrouillage.

Le lot est couvert par 16 tests ciblés : structure des deux tâches du cours 4, structure des deux tâches du cours 5, bloc de réponse libre bilingue avec seuil configurable, et verrouillage générique du bloc d’association. La vérification TypeScript est valide. La QA de publication valide 8 contrôles sur 9 (types, validation des cours, SEO, sitemap, audit des interactions et QA desktop/mobile) ; son unique échec est le doublon de marqueur de checkpoint déjà identifié dans `Architect Foundations 4`, qui demeure hors périmètre et n’a pas été modifié.

## Developer 3 — checkpoints source explicitement spécifiés

La session Skilljar authentifiée rend également vérifiables trois checkpoints du module **Claude Code, MCP & Integration**. S07 demande d’associer `PreToolUse` au hook qui doit bloquer une lecture avant l’exécution, et une commande qui lit l’appel depuis `stdin`, vérifie le chemin puis se termine avec le code 2 pour `.env.production`. S14 associe quatre scénarios de déploiement aux décisions transport/portée : SQLite local → `stdio + Local` ; recherche de code d’équipe → `HTTP + Project (.mcp.json)` ; scraper expérimental non partagé → `stdio or HTTP + Local` ; scanner de sécurité déployé par l’IT → `HTTP + Enterprise (managed settings)`. S17 fournit une trace de `401 Unauthorized` avec une clé lue dans un fichier CI et impose la correction B : rotation de la clé, retrait du fichier, injection par variable d’environnement dans le runner CI, puis référence de la variable dans la configuration MCP.

Les écrans cumulatifs S18/S19 Developer 3 restent reportés : ils demandent respectivement une identification libre de bugs avec explication d’exécution, puis la rédaction complète de trois fichiers avant révélation et auto-évaluation. Aucun bloc standard actuellement permis ne reproduit ces deux séquences sans les transformer.

Le contrôle visuel groupé du lecteur local a été temporairement limité par la route de données (`429 Too many requests`) après plusieurs captures rapprochées. Les contrôles de structure tRPC locaux et les 22 contrats ciblés restent valides ; la vérification visuelle sera rejouée séquentiellement après dissipation du délai, sans modifier les contenus déjà contrôlés.

Après expiration de la fenêtre de débit, le lecteur standard a rendu séquentiellement les chapitres **Serveurs MCP** et **Intégration enterprise** sans texte tronqué, avec les cartes standard et les blocs de checkpoint attendus. La trace `401 Unauthorized` est visible comme contexte du checkpoint S17 ; les trois options apparaissent sans marqueur de bonne réponse avant soumission. Les contrôles ne révèlent pas la clé `b`, qui reste dans le registre serveur privé.

La QA de publication du lot Developer 3 valide TypeScript, la validation des données de cours, les contrôles SEO/sitemap, l’audit des interactions et les matrices de blocs desktop/mobile. La suite complète échoue seulement sur le marqueur de checkpoint dupliqué déjà présent dans `Architect Foundations 4` ; ce fichier et ce parcours restent hors périmètre et inchangés.

Les écrans cumulatives Skilljar Developer 3 **S18 — Bug ID** et **S19 — Assembly** sont maintenant suffisamment spécifiés pour être restaurés. Ils demandent une réponse libre d’au moins 10 caractères, révèlent ensuite une correction modèle, puis demandent une auto-évaluation à quatre choix. Pour chaque écran, seul le choix « all/correct » déverrouille la suite ; les trois autres conservent la correction visible et demandent une révision de la réponse. Le nouveau comportement générique de `CloudExerciseBlock` reproduit cette séquence sans UI spécifique. Le jeton d’exemple montré dans le fichier source est remplacé par un marqueur non exploitable dans la donnée Neopolis.

Le contrôle du lecteur local via le navigateur partagé confirme que cette URL demande une session Neopolis distincte de la session Skilljar : après le chargement initial, l’écran affiche « Authentification requise ». Il ne s’agit pas d’une erreur de contenu ni d’une fuite de correction. La session Skilljar authentifiée a été rétablie sur le parcours Developer Foundations après ce contrôle.

Le compte apprenant de démonstration a ensuite ouvert une session locale séparée. Le tableau de bord affiche bien la session apprenant (progression initiale de 0 %) ; il peut donc servir au contrôle fonctionnel des tâches cumulatives sans utiliser ni modifier la progression Skilljar.

Le lien direct vers S18, la première tâche cumulative restaurée, affiche correctement l’état « Cours verrouillé » pour ce compte à progression initiale. La plateforme exige d’abord la fin du cours précédent ; ce comportement confirme que l’ajout des tâches n’a pas ouvert de contournement de la progression séquentielle. Aucun état de progression n’a été forcé pour contourner cette règle lors du contrôle.

Après propagation publique, la route tRPC du domaine principal confirme la présence des deux écrans sources `S18_context` et `S19_context`, de deux blocs `cloud_exercise`, de la tâche d’intégration cumulative et de la correction d’assemblage. Le script `scripts/verify-developer3-cumulative-public.mjs` vérifie ces marqueurs source et reste compatible avec les libellés français.
