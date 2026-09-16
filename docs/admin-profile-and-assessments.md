# Administration des profils et évaluations

## Correction silencieuse de profil

La fiche `learner_profiles` est liée de façon unique au compte apprenant. Depuis **Administration → Suivi des apprenants → Profil**, un administrateur peut corriger le prénom, le nom et le téléphone au format international E.164. La mise à jour synchronise le nom affiché du compte et, lorsqu’un dossier candidat correspondant existe, ses champs de contact.

La procédure `admin.updateLearnerProfile` exige un rôle administratif, valide chaque champ, écrit la fiche dans une transaction et conserve seulement la liste des champs modifiés dans les journaux d’activité. Elle ne déclenche aucune notification, aucun e-mail et aucune invalidation de session.

## Gestion pédagogique distincte

Le menu **Pédagogie** sépare désormais les responsabilités suivantes :

| Entrée | Usage | Données transférées dans la liste |
|---|---|---|
| Banques de questions | Consulter les volumes par certification, les domaines et ouvrir l’éditeur de questions | Compteurs uniquement ; aucun énoncé, choix, clé ou rationale |
| Examens de certification | Régler durée, seuil, volume tiré, publication et pondérations | Configurations et compteurs par certification |
| Quiz & checkpoints | Repérer les banques par cours et ouvrir l’éditeur correspondant | Compteurs par cours ; les checkpoints restent édités dans le cours |

Les deux résumés serveur dédiés, `getMockExamQuestionSummary` et `getQuizBankSummary`, évitent de transférer les banques complètes pour l’affichage de ces tableaux. Les clés de réponse et explications restent cantonnées aux procédures d’édition autorisées.
