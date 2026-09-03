# Navigation des candidatures et badge admin-apprenant

## Vue Kanban retirée

La vue **Kanban — Candidatures** a été supprimée de la navigation administrative, de la liste des onglets admis et du rendu du tableau de bord de recrutement. L’ancienne URL `/admin?tab=kanban` est désormais normalisée vers la vue **Candidatures**. Les données, actions d’acceptation/refus, listes et analyses de candidature ne sont pas modifiées.

## Badge admin-apprenant

Les personnes ayant le rôle `admin_learner` disposent du badge violet **Admin-apprenant** dans la liste des apprenants et dans l’en-tête de leur fiche 360°. Le rôle ciblé explicitement par l’administrateur a été appliqué sans toucher aux données de progression, d’examen, de compétences ou d’activité.

## Vérifications

La QA authentifiée confirme le badge, les six KPI de la fiche 360°, les sept onglets, l’absence de débordement mobile à 390 px et la redirection de l’ancienne URL Kanban. Les tests TypeScript et la suite de régression sont réussis : 529 tests, 2 ignorés.
