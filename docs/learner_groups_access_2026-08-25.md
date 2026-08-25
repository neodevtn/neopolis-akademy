# Groupes d’apprenants — contrôle initial

## Migration

La migration crée le groupe système **Full access** et rattache les utilisateurs existants. Le contrôle SQL du 25 août 2026 confirme **94 membres** dans ce groupe, qui autorise toutes les formations afin de préserver les accès historiques.

## Contrôles visuels

Les captures desktop du panneau `admin/training?tab=groups` confirment l’affichage du groupe système, de son compteur de membres et du formulaire de création d’un groupe. La page des invitations directes reste accessible et conserve recherche, tri et pagination ; le formulaire d’invitation propose désormais la sélection des groupes avant envoi.

La vérification du panneau **Candidats sélectionnés** confirme également un sélecteur « Groupes à affecter à la prochaine invitation », affiché avant les actions d’invitation. Le groupe `Full access` y est disponible, et son choix est désormais transmis à l’invitation suivie puis appliqué au compte lors de son acceptation.

## Sécurité d’accès

L’ouverture d’une formation est vérifiée côté serveur via les groupes de l’apprenant. Une formation non affectée reste visible dans le catalogue, mais l’ouverture affiche une explication et renvoie vers le catalogue. Les administrateurs conservent leur bypass de contrôle.

## Éléments à finaliser

La prochaine itération doit compléter l’édition détaillée des membres et des formations pour chaque groupe non-système, ainsi que la sélection de groupes directement dans le flux de candidat sélectionné.
