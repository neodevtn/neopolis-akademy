# Rôle admin-apprenant

## Finalité

Le rôle `admin_learner` permet à une même personne de gérer la plateforme et de suivre les formations comme apprenant. Il évite qu’un passage temporaire au rôle administrateur historique fasse disparaître la lecture de la progression personnelle dans les surfaces apprenantes ou les rapports.

## Matrice d’accès

| Capacité | Administrateur historique | Admin-apprenant | Apprenant |
|---|---:|---:|---:|
| Administration (contenus, examens, groupes, invitations, reporting) | Oui | Oui | Non |
| Tableau de bord Formation et statistiques personnelles | Non concerné | Oui | Oui |
| Contribution aux KPI d’apprentissage | Non | Oui | Oui |
| Verrouillage séquentiel des cours | Contourné pour revue | Respecté | Respecté |
| Édition contextuelle des cours | Oui | Oui | Non |

## Principes techniques

La permission administrative est centralisée par `isAdministrativeRole`, qui reconnaît `admin` et `admin_learner`. Le contournement du séquencement reste volontairement limité à `admin` via `canBypassLearningSequence`.

Les sélections de population apprenante incluent `user` et `admin_learner` pour les statistiques, l’intégrité, les relances d’inactivité, les segments de communication et les historiques de réussite. Les administrateurs historiques restent exclus de ces populations pédagogiques.

## Gestion

Depuis **Administration → Suivi des apprenants**, les actions de rôle proposent explicitement : **Apprenant**, **Admin-apprenant** et **Administrateur**. Une connexion en `admin_learner` arrive sur **Formation**, avec un raccourci vers l’administration.
