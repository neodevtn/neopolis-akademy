# Talent CRM Neopolis — modèle métier et architecture

## Objectif

Le module transforme le suivi actuel en dossier membre longitudinal sans remplacer les sources existantes. La candidature reste la source du profil candidat, la plateforme pédagogique reste la source des acquis, les groupes restent la source des droits de formation et le journal administratif reste la source d’audit.

Le terme « réseau » désigne ici une communauté professionnelle gérée par statuts, affectations et opportunités. Aucun calcul de commission en cascade, rang rémunéré par recrutement ou mécanisme pyramidal n’est introduit.

## Processus cible

| Niveau | Processus | Résultat durable |
| --- | --- | --- |
| 0 | Gestion des talents et membres | Vue consolidée du portefeuille Neopolis |
| 1 | Acquisition et sélection | Candidature liée au compte et qualification initiale |
| 1 | Développement | Formation, compétences, examens et certifications |
| 1 | Évaluation | Entretiens, évaluations et décisions historisés |
| 1 | Mobilisation | Groupes de travail, missions et opportunités |
| 1 | Engagement réseau | Recrutement, ambassadeur, partenaire ou alumni |
| 1 | Pilotage | Tâches, échéances, indicateurs et journal d’audit |

## Sources réutilisées

| Besoin | Source existante |
| --- | --- |
| Identité et rôle applicatif | `users` |
| Profil candidat, CV et scoring | `applications` et `user_invitations.applicationId` |
| Accès pédagogiques | `learner_groups`, memberships et affectations de cours |
| Progression, activité et examens | tables pédagogiques et dossier apprenant 360° |
| Certifications internes | `learner_achievements` |
| Notes et segmentation | `admin_notes`, `admin_tags`, `user_tags` |
| Communication | `communications`, reçus et livraison e-mail |
| Audit | `admin_activity_log` |

## Nouvelles entités

| Entité | Responsabilité |
| --- | --- |
| Étape du parcours | Référentiel administrable et ordonné : candidature, onboarding, formation, évaluation, vivier, engagement, alumni |
| Profil talent | Étape courante, priorité, responsable, disponibilité et synthèse de suivi |
| Historique d’étape | Motif, auteur et date de chaque transition |
| Événement talent | Entretien visio/présentiel, évaluation, test externe, revue de certification ou autre convocation |
| Évaluation talent | Grille, score, décision et commentaires privés/publics |
| Affectation | Groupe de travail, mission, opportunité, recrutement, ambassadeur ou partenariat |
| Tâche RH | Action de suivi, propriétaire, échéance et état |

## Règles structurantes

1. Les rôles techniques `user`, `admin`, `admin_learner` et `manager` ne décrivent pas le statut RH. Un apprenant peut être simultanément ambassadeur et membre d’un groupe de travail sans recevoir de privilèges administratifs.
2. Les transitions de parcours, décisions, affectations et changements d’état sont transactionnels et journalisés.
3. Les commentaires internes ne sont jamais exposés à l’apprenant. Les consignes, lieux, liens de réunion, résultats publics et actions attendues utilisent des champs explicitement visibles.
4. Une convocation peut être demandée, confirmée, refusée, replanifiée, terminée ou annulée. La réponse de l’apprenant est conservée.
5. Les certifications externes sont des demandes et preuves documentées ; elles ne créent jamais automatiquement un diplôme Neopolis.
6. Les listes de motifs et étapes sont administrables et conçues pour supporter des libellés multilingues.
7. Aucun rappel en mémoire du serveur n’est utilisé. Les rappels automatiques éventuels devront utiliser les tâches périodiques persistantes de la plateforme.

## Accès

| Profil | Portefeuille | Dossier détaillé | Écriture | Données privées |
| --- | --- | --- | --- | --- |
| Super admin | Oui | Oui | Oui | Oui |
| Admin-apprenant | Oui | Oui | Oui | Oui |
| Manager Logs | Non | Non | Non | Journal autorisé uniquement |
| Apprenant | Son parcours uniquement | Éléments explicitement visibles | Réponse aux convocations | Non |

## Première livraison

La première livraison comprend le portefeuille, le dossier membre, les étapes, événements, affectations, tâches, évaluations, réponses apprenant, notifications immédiates et la réutilisation du dossier 360°. Les automatisations de rappel seront ajoutées seulement lorsqu’un SLA et une politique de fréquence auront été validés.
