# Contrôles d’interface — messagerie privée

## Prévisualisation locale — 12 septembre 2026

| Surface | Résultat constaté | Remarque |
|---|---|---|
| `/training?tab=messages` | Chargement réussi après correction du launcher | L’onglet affiche l’historique privé, les appels à l’action « Signaler un problème » et « Nouvelle conversation », une liste vide propre et un panneau de détail. Les Communiqués restent un onglet séparé. |
| `/admin?tab=messages` | Chargement réussi | L’inbox dédiée affiche recherche, filtre d’état, état vide, création de fil et message de séparation d’avec les Communications. |
| `/admin/training?tab=learners&learner=…` | Chargement réussi après les données de suivi | L’onglet « Messages » est présent parmi les huit onglets du dossier 360°. Il affiche uniquement l’inbox contextualisée à l’apprenant ouvert, la recherche par sujet et une action de création préremplie sur cet apprenant. |

Le contrôle a été fait avec une session administrative de prévisualisation. Aucun message de test, aucune conversation d’intégrité et aucun e-mail n’ont été créés ou envoyés. Un crash transitoire du launcher avant chargement de l’inbox (`reduce` sur une liste indéfinie) a été corrigé avant les contrôles ci-dessus.

## Revue d’intégrité

La revue d’un apprenant présentant un signal permet désormais d’ouvrir le brouillon « Vérification de votre parcours ». Ce brouillon décrit une demande de clarification neutre, rappelle explicitement l’absence de conclusion et de sanction, et ne peut ni créer une conversation ni déclencher une notification. L’administrateur doit encore ouvrir le pavé Messages et décider explicitement de créer un fil ; aucune action collective sur des apprenants existants n’a été exécutée.

Le 12 septembre 2026, le brouillon a été ouvert visuellement dans le dossier apprenant : son texte est désormais affiché avec des paragraphes lisibles, sans caractères d’échappement techniques. Seuls les boutons « Fermer » et « Ouvrir les messages de l’apprenant » sont proposés ; aucun bouton d’envoi, de création de fil ou de modification de statut n’y est présent.
