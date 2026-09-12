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

## Production — 12 septembre 2026

Après propagation du checkpoint, `https://akademy.neodev.click/training?tab=messages` a été chargé avec une session apprenant. L’onglet Messages, l’historique privé, les actions « Signaler un problème » et « Nouvelle conversation », ainsi que le launcher « Échanger avec Neopolis » sont visibles. Aucun fil, aucune notification e-mail ni aucune communication d’intégrité n’a été créé pendant cette vérification.

Le handshake WebSocket a été rejoué depuis cette session authentifiée sur le canal same-origin `/api/realtime/private-messaging`. Le serveur a répondu par l’événement attendu `private-messaging.ready`. La correction conserve le contrôle d’origine : derrière le proxy de production, l’origine est comparée aux hôtes publics explicitement transmis par le proxy ; une origine tierce reste refusée. Aucun message n’a été envoyé sur le socket, qui demeure notificationnel.

Après confirmation explicite de l’administrateur, la file d’intégrité a créé huit conversations privées de revue. La création a conservé la source `integrity_review`, le journal d’audit, les préférences de notification et l’absence de toute mesure de blocage automatique. Le contrôle d’inbox a confirmé huit nouveaux fils, sans doublon au moment de l’exécution.
