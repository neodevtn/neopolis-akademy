# Revue des feedbacks utilisateurs Sentry — sept derniers jours

> Ce document conserve uniquement les faits fonctionnels nécessaires au traitement. Les noms, adresses, identifiants de session et tout contenu personnel sont exclus.

## Inventaire initial

| Référence Sentry | Ancienneté observée | Route associée | Signalement fonctionnel | État d’investigation |
| --- | ---: | --- | --- | --- |
| `NEOPOLIS-AKADEMY-20` | 3 jours | `/training` | La soumission des objectifs d’orientation échoue lorsque plus de cinq compétences sont sélectionnées ; Sentry relève une validation serveur `orientation.saveGoals` sur la taille de la liste. | Défaut confirmé, déjà corrigé ; validation dédiée à finaliser dans cette revue. |
| `NEOPOLIS-AKADEMY-1S` | 7 jours | À déterminer depuis le détail Sentry | Signalement d’impossibilité d’accéder à un cours. | À qualifier : route, version, trace et reproductibilité. |
| `NEOPOLIS-AKADEMY-1R` | 7 jours | À déterminer depuis le détail Sentry | Signalement d’échec du diagnostic d’orientation. | À qualifier : route, version, trace et reproductibilité. |

Le tableau Sentry « Inbox » contient exactement ces trois feedbacks non résolus pour la période demandée. Aucun feedback n’a été modifié, commenté, résolu ou marqué comme indésirable pendant la collecte.

## Détails relevés dans Sentry

| Référence Sentry | Route observée | Élément vérifiable | Qualification initiale |
| --- | --- | --- | --- |
| `NEOPOLIS-AKADEMY-20` | `/training` | Erreur de validation `orientation.saveGoals` : la liste `goals` dépasse le maximum serveur de cinq éléments. | Défaut de cohérence client/serveur, **confirmé**. |
| `NEOPOLIS-AKADEMY-1S` | Parcours Claude Certified Associate Foundations, première formation | La capture indique que la formation est visible mais que l’accès n’est pas attribué au compte. | Refus d’accès par groupe, à comparer avec le comportement actuel de repli « full access ». |
| `NEOPOLIS-AKADEMY-1R` | `/training?tab=orientation` | Le feedback indique que le diagnostic ne fonctionne pas ; la capture montre le parcours d’orientation, sans exception applicative lisible dans le feedback. | À reproduire contre le flux actuel : la cause ne peut pas être déduite de la seule capture. |

Les détails de Sentry ont été consultés à partir des feedbacks eux-mêmes. Les informations permettant d’identifier les auteurs ne sont pas reprises dans cette analyse.

## Qualification et traitement

| Référence Sentry | Gravité | Reproductibilité au 2 septembre 2026 | Cause qualifiée | Décision de traitement |
| --- | --- | --- | --- | --- |
| `NEOPOLIS-AKADEMY-20` | Bloquante pour le diagnostic de l’auteur | Reproduite dans la logique : le client permettait une sixième compétence alors que le serveur limite la liste à cinq. | Incohérence de validation client/serveur. | **Corrigée** : compteur de capacité, sixième sélection désactivée, message explicite et tests de limite ; le parcours passe au diagnostic avec un choix valide. |
| `NEOPOLIS-AKADEMY-1S` | Bloquante au moment du signalement | Non reproduite avec le repli actuel : le parcours se charge et le compte concerné est aujourd’hui dans le groupe système Full access. | Refus d’accès par groupe au moment de la capture, et non erreur du lecteur de cours. La capture ne signale ni erreur JavaScript ni source média en échec. | **Historique couvert** par le repli Full access déjà déployé. Aucune modification de contenu ou permission ciblée n’est nécessaire. |
| `NEOPOLIS-AKADEMY-1R` | Bloquante au moment du signalement, détail insuffisant | Non reproduite : l’onglet d’orientation actuel charge, tous les onglets restent accessibles, le compteur de sélection et le diagnostic sont proposés. | Le feedback ne comporte pas de trace d’exception lisible. Il peut correspondre au même défaut de limite ou à une ancienne étape d’orientation, sans preuve d’une seconde cause. | **Couvert par la correction de limite**, mais conservé comme signal à surveiller : une nouvelle occurrence devra fournir le message et l’étape précise avant de conclure à un défaut différent. |

La vérification du feedback d’accès a été effectuée par un contrôle agrégé de droits : un compte correspondant est actuellement couvert par Full access ; aucune identité ni coordonnée ne figure dans le résultat conservé. Le parcours concerné a aussi été ouvert avec le compte de démonstration sans refus d’accès. La vérification de l’orientation a été menée sans sauvegarder le profil de contrôle.

La sonde publique d’orientation a ensuite été rejouée après stabilisation de son sélecteur accessible. Son résultat est sans ambiguïté : cinq choix sélectionnés, sixième choix désactivé, message « limite atteinte », aucune sauvegarde et aucune erreur de page. Cette validation correspond précisément au défaut décrit dans `NEOPOLIS-AKADEMY-20`.

## Conclusion de la revue des retours

Les **trois** feedbacks non résolus de la période ont été analysés individuellement. Un défaut réellement actif a été identifié puis corrigé. Les deux autres signalements sont historiques ou insuffisamment instrumentés et ne se reproduisent plus dans les parcours contrôlés. Aucun feedback n’a été modifié dans Sentry : le statut peut être mis à jour manuellement après revue de cette qualification.
