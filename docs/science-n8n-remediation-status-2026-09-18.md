# État de remédiation — Claude Science et parcours n8n

**Date :** 18 septembre 2026  
**Périmètre :** parcours « Claude Science pour la recherche médicale » et les trois programmes n8n identifiés dans le catalogue.  
**Règle appliquée :** les contenus, fichiers de démarrage et capacités non établis par une source autorisée ne sont pas inventés ni présentés comme disponibles.

## Synthèse exécutive

Le parcours **Claude Science** a été réimporté depuis le package canonique V2 et le lecteur a été corrigé pour conserver les leçons comme unités pédagogiques, plutôt que de transformer les écrans internes en chapitres autonomes. Les objectifs et résumés sont maintenant rendus en listes accessibles, les actions guidées demandent une note et une attestation explicites avant d’être enregistrées, les checkpoints sont retrouvés par les identifiants serveur canoniques, et les deux vidéos sont présentées dans le lecteur standard avec alternative française et questions de consolidation. Les données de correction, réponses exactes et solutions pratiques restent hors du JSON apprenant.

Les trois parcours n8n ont été examinés séparément. Le cours d’initiation a déjà reçu des ressources n8n téléchargeables et une préparation d’environnement centrée sur l’espace personnel de l’apprenant. Cependant, l’audit a identifié des écarts P0 entre cinq workflows de départ et les activités qui les décrivent. Les cours n8n intermédiaire et marketing comportent également des TP qui annoncent des workflows ou packs non livrés, ou dont les fichiers publiés ne contiennent pas l’état initial annoncé. Ces écarts ne doivent pas être « comblés » par des fichiers imaginés : ils exigent soit les exports n8n sources autorisés, soit une réécriture complète et explicitement synthétique des TP. **Les travaux n8n sont désormais en pause et exclus de cette publication Claude Science, dans l’attente des instructions précises annoncées.**

## Correctifs appliqués à Claude Science

| Élément | État | Contrôle associé |
| --- | --- | --- |
| Collection séquentielle | Trois cours, **19 unités pédagogiques** : 6 leçons, 9 leçons et 4 TP | Contrat de collection et catalogue |
| Écrans techniques | Les écrans restent des étapes de rythme interne, sans écran d’introduction de module artificiel | Aucun identifiant `module_start` dans les cours générés |
| Progression | Une leçon est seulement complétée après ses écrans requis et son checkpoint ; les cours suivants restent protégés par la complétion du précédent et son quiz final | Garde de navigation et accès séquentiel |
| Checkpoints | **15/15** clés canoniques résolues par le registre serveur ; réponses exactes non envoyées au navigateur | `getSensitiveExerciseAnswerKey` et contrat de confidentialité |
| Évaluations | **14 questions** réparties sur les deux cours théoriques ; validation serveur. Aucun quiz générique supplémentaire n’est injecté entre les écrans Claude Science. | Service d’évaluation Claude Science et contrat du lecteur |
| Actions guidées | Consigne, preuve attendue, note de réalisation, attestation et sauvegarde serveur | Bloc standard `GuidedActionBlock` |
| Vidéos | **2** lecteurs YouTube intégrés, objectif, langue, durée, deux questions et alternative française | Contrat vidéo et aperçu navigateur |
| Visuels guidés | **5** captures avec image servie depuis la médiathèque, légende et repères textuels sourcés. Aucun marqueur visuel n’est superposé sans coordonnées canoniques. | Contrat de bloc `annotated_screenshot` |
| TP | **4** TP avec correction serveur Claude Sonnet et données synthétiques uniquement. Les contrôles de sortie attendus des TP 2 et 4 sont révélés après soumission, jamais avant. | Service d’évaluation et route apprenant assainie |
| Téléchargements | **10 fichiers apprenant** issus du manifeste canonique ; quatre fichiers `expected`/`solution` restent privés et les consignes orientent désormais vers le retour de correction serveur. | Contrat URL de médiathèque et exclusion des corrections |
| Recherche | Les trois cours et leurs écrans sont régénérés dans l’index de recherche | Audit d’index : 180 cours, 3 628 écrans, 3 924 entrées |

> Le manifeste canonique comporte quatorze fichiers de téléchargement. Deux fichiers `expected` et deux scripts de solution sont des corrections privées ; les dix ressources restantes sont les seules mises à disposition de l’apprenant. Aucun onzième fichier n’a été inventé.

## Résultats de l’audit n8n

| Programme | Résultat | P0 confirmés | Décision sûre |
| --- | --- | ---: | --- |
| **Initiation à l’automatisation de workflows avec n8n** | L’environnement personnel, les liens de téléchargement et l’absence de VM/identifiants préconfigurés sont corrigés. | 5 workflows de départ incohérents avec les consignes ; validation de TP trop nominale | Ne pas qualifier ces cinq TP d’autonomes avant régénération source des starters et contrôle de graphe n8n |
| **Automatisation de workflows avancée** | Les 27 TP utilisent une évaluation serveur et les 11 ressources déclarées répondent HTTP 200. | Packs annoncés absents, données présentées comme workflows, mauvais pack Berlin, URL HTTP tronquée | Fournir les exports/schémas sources ou convertir explicitement les TP en reconstructions intégrales synthétiques |
| **Concevoir des workflows marketing automatisés** | Structure JSON et ressources PDF existantes vérifiées, mais fidélité détaillée aux chapitres 2–3 non établie. | 15 fichiers `Desktop → Resources` non livrés, trois instructions tronquées, solutions présentes dans les données apprenant | Corriger uniquement avec les exports et consignes autorisés ; à défaut, retirer les dépendances et ne pas présenter le cours comme un parcours de TP autonome |

### Écarts n8n à traiter avant une nouvelle publication pédagogique

Les correctifs suivants demandent une source complémentaire, car ils déterminent précisément la topologie des workflows, les credentials à sélectionner, les prompts et les paramètres :

1. Les cinq starters P0 du cours d’initiation doivent être régénérés pour contenir exactement les nœuds, connexions, formulaires et sorties demandés, sans pré-réaliser l’exercice.
2. Le cours intermédiaire doit recevoir les six packs promis et les neuf workflows/schémas que ses consignes demandent d’ouvrir ou de modifier ; les jeux de données JSON actuellement fournis ne sont pas des exports n8n.
3. Le cours marketing doit recevoir les quinze exports annoncés ou être réécrit, TP par TP, avec des étapes complètes de reconstruction et des données synthétiques de remplacement. Les instructions tronquées ne doivent pas être complétées par conjecture.
4. Tous les TP n8n doivent disposer d’un contrat automatisé vérifiant l’adéquation entre les ressources, les étapes et l’état initial attendu. Un téléchargement de type `n8n_starter_workflow` doit être un export n8n importable, et non un simple fichier de données.

## Revue pédagogique indépendante et validation locale

Une revue indépendante a confirmé l’absence de défaut P0 et la préservation de la structure canonique : 19 leçons, 15 checkpoints, 2 évaluations finales, 4 TP, 5 visuels et 2 vidéos. Elle a d’abord relevé deux P1 : l’injection indue d’un quiz générique entre les écrans et l’absence apparente des contrôles annoncés des TP 2 et 4. Les deux sont corrigés : le lecteur respecte désormais exclusivement le blueprint d’évaluation Claude Science et les points de contrôle sont fournis seulement dans la correction serveur post-soumission.

Les contrôles ciblés suivants ont réussi après cette remédiation : **14 tests** de collection, confidentialité, structure, contrôles de TP, vidéos et blocage séquentiel ; ainsi que TypeScript sans erreur. La régénération de recherche est complète : 180 cours, 3 628 écrans et 3 924 entrées, sans manque, doublon, fichier orphelin ni lien invalide. Les objectifs, une action guidée et le lecteur vidéo ont également été ouverts dans la prévisualisation navigateur.

La version dédiée publique n’a pas été mise à jour durant cette étape : le déploiement reste bloqué par la configuration externe Railway `healthcheckPath` rejetée par la plateforme. Aucune URL publique ne doit donc être déclarée comme représentant ces nouveaux correctifs tant que ce blocage d’infrastructure n’est pas résolu et qu’une vérification post-publication n’a pas été effectuée.

## Prochaine action recommandée

La suite la plus sûre consiste à récupérer les fichiers n8n originaux autorisés ou à décider explicitement que les TP concernés deviendront des exercices Neopolis entièrement synthétiques, avec leurs propres exports, étapes et critères. Une fois ce choix de contenu établi, les trois parcours pourront être corrigés sans compromettre la fidélité des sources ni donner à l’apprenant un fichier incomplet.

## Références internes

Les éléments de travail n8n ont été retirés de l’espace de publication actif afin de respecter cette pause. Les audits source de Claude Science se trouvent dans `.work/claude-science-correction-2026-09-18/` et dans le package V2 canonique restauré sous `.work/claude-science-medical-v2-2026-09-17/`.
