# Audit Sentry — sept derniers jours

## Inventaire initial

La vue Sentry du projet Neopolis Akademy, filtrée sur sept jours, présente onze incidents non résolus prioritaires. Les signatures visibles se répartissent entre des erreurs de chargement de modules ou de contenu dans les parcours de formation, une erreur de module serveur d’un déploiement récent et un signal de requête N+1 de priorité basse.

Les signatures à qualifier en priorité sont les erreurs `TypeError` liées à la lecture d’une propriété `default` dans plusieurs parcours de formation, ainsi qu’une signature équivalente indiquant une valeur de module indéfinie. Elles sont signalées comme prioritaires et certaines ont été observées dans les dernières 24 heures. L’erreur fatale indiquant qu’un module serveur n’exportait pas un symbole attendu doit être corrélée au déploiement associé avant toute correction. Le signal N+1 est une optimisation de performance, non un blocage utilisateur à ce stade.

Les identifiants de comptes, adresses, traces complètes et contenus de feedback ne sont pas reproduits dans ce document.

## Détail de l’incident récent de parcours

L’incident prioritaire le plus récent est une erreur cliente de type `TypeError` lors du chargement d’un cours de certification. Il compte un seul événement pour un seul utilisateur, observé deux heures avant l’audit dans l’environnement de production. La signature indique une lecture de `default` sur une valeur indéfinie dans le bundle client, ce qui correspond à un échec de chargement ou de résolution d’un module différé. Il est classé **bloquant localement** pour la personne touchée, mais sa fréquence visible est ponctuelle ; sa cause reste à distinguer entre une incompatibilité de bundle après publication et une exportation de module réellement incorrecte.

Les métadonnées techniques de cet événement ne contiennent pas de version de release exploitable ni de source map. Elles montrent toutefois une séquence continue de lectures réussies du fichier de version de la plateforme avant l’erreur, suivie du chargement normal des données d’examen et de communications. Cet indice rend plus probable une incompatibilité de code différé après publication qu’une indisponibilité de l’API de formation. La correction devra donc renforcer la récupération des imports différés et l’annonce de mise à jour, sans conclure prématurément à un défaut de contenu.

## Retours utilisateurs non résolus

Trois retours utilisateurs non résolus sont visibles sur la période. Le plus récent décrit une erreur de validation de l’orientation lorsque plus de cinq objectifs sont sélectionnés : le serveur répond correctement par une erreur de requête, mais le parcours client laisse l’utilisateur atteindre cette erreur technique au lieu d’empêcher ou d’expliquer la limite. Il s’agit d’un défaut fonctionnel réel, localisé et corrigeable.

Le détail du retour confirme que la procédure concernée est `orientation.saveGoals` et que la règle serveur limite la sélection à cinq objectifs. Le parcours est donc validé côté serveur, mais l’interface doit empêcher le sixième choix et afficher la capacité restante avec un message compréhensible. La correction ne doit pas augmenter silencieusement la limite métier : elle doit aligner l’interface sur la règle existante.

Les deux autres retours, tous deux âgés de sept jours, concernent un accès à un cours et le démarrage du diagnostic. Ils seront recoupés avec leurs issues liées, leur contexte navigateur et les correctifs intervenus depuis afin de distinguer les incidents toujours actifs de ceux déjà résolus par les déploiements récents. Aucune identité ni contenu libre détaillé n’est conservé dans ce rapport.

## Répartition des incidents observés

L’API de Sentry retourne 67 incidents non résolus sur quatorze jours, dont **14** ont une dernière apparition dans les sept derniers jours. Leur répartition est la suivante :

| Signature | Incidents | Événements | Impact provisoire |
| --- | ---: | ---: | --- |
| Lecture de `default` sur une valeur indéfinie | 7 | 8 | Bloquant ponctuel mais actif ; à corriger en priorité. |
| Résolution d’un module différé indéfini | 1 | 1 | Bloquant ponctuel ; probablement associé au même mécanisme de chargement. |
| Source média non prise en charge | 1 | 1 | Bloquant localisé à une activité média ; à vérifier. |
| Export serveur manquant pendant démarrage | 1 | 4 | Incident de publication historique ; à confirmer comme résolu. |
| Requête N+1 | 1 | 6 | Optimisation serveur, sans blocage utilisateur constaté. |
| Retours utilisateurs | 3 | 3 | Une erreur d’orientation confirmée et deux signalements à recouper. |

Les erreurs de chargement client cumulent huit événements répartis sur huit personnes et restent observées après les déploiements du 1er et 2 septembre. Elles constituent le principal risque actif du lot.

## Qualification complémentaire

Le signalement ancien relatif à l’accès au cours pointe vers le premier cours de préparation à une certification. Il ne contient aucune exception technique associée ; le parcours public actuel atteint normalement son écran d’authentification, ce qui rend le signalement non reproductible sans session de l’apprenant. Il est donc conservé comme incident historique à surveiller, pas comme défaut actuellement confirmé.

Le signalement ancien relatif au diagnostic concerne son onglet d’orientation et ne contient pas d’exception associée. Le défaut de limite d’objectifs identifié dans le retour plus récent fournit une explication plausible, désormais corrigée côté interface ; la validation du diagnostic reste à vérifier avec un compte de test.

L’erreur média se rapporte à une activité d’un cours d’agents text-to-query. Elle est une promesse média rejetée (`NotSupportedError`) après le chargement correct du fichier de cours. Les traces réseau masquent l’URL de média exacte, de sorte qu’aucun média ne doit être modifié par supposition. La correction appropriée consiste à gérer proprement le rejet de lecture dans le bloc média et à proposer l’alternative disponible, plutôt qu’à laisser remonter une exception globale.

## Qualification et décision de traitement

| Famille | Impact | Décision |
| --- | --- | --- |
| Chargement de module différé `default` | Bloquant ponctuel dans les parcours et l’examen, actif après des publications | **À corriger.** La récupération client reconnaît maintenant ces deux signatures et dispose d’un marqueur distinct par type de panne, avec un rechargement au plus une fois par signature et par chemin. |
| Source média non prise en charge | Bloquant localement lors de la lecture d’une activité Projector | **À corriger.** Une source vidéo de cette activité retourne actuellement `500`, alors que la piste audio locale retourne `200`. Le lecteur utilise désormais l’audio en priorité, conserve les slides et capture tout rejet de lecture sans erreur globale. |
| Limite d’objectifs d’orientation | Empêchait la sauvegarde si une sixième compétence était choisie | **À corriger.** L’interface bloque le sixième choix, indique la capacité restante et conserve la limite serveur de cinq. |
| Export serveur manquant | Démarrage de développement ancien, sans utilisateur ni environnement de production | **Historique.** L’export est présent dans le serveur actuel ; aucune modification supplémentaire n’est justifiée. |
| Requête N+1 | Signal de performance à faible priorité sur une transaction répondue avec succès | **Optimisation reportée.** Aucun échec utilisateur ou délai bloquant n’est associé ; elle reste à traiter dans une optimisation dédiée, sans confondre ce travail avec une correction de panne. |
| Retours anciens d’accès au cours et de diagnostic | Signalements sans exception technique attachée | **Historique à surveiller.** L’accès public atteint correctement l’authentification et la correction d’orientation traite la cause fonctionnelle actuellement identifiée. |

La validation locale du cours affecté confirme le rendu des deux activités Projector du premier module, la présence d’une piste audio et le déclenchement de la lecture sans exception média non gérée. La sonde d’orientation, exécutée sans sauvegarde, confirme `5 / 5`, l’inactivation du sixième choix et le message de limite ; elle ne crée aucun changement de profil. Les tests ciblés de récupération, média et orientation comptent 15 réussites, puis la suite complète compte **515 tests réussis et 2 explicitement ignorés**. La validation publique des trois correctifs reste requise avant publication.
