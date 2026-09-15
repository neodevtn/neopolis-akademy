# Signalement technique et User Feedback Sentry

## Référence officielle

La documentation Sentry JavaScript indique qu’un formulaire personnalisé peut envoyer un **User Feedback** avec `Sentry.captureFeedback` ou `Sentry.sendFeedback`, associé éventuellement à un événement Sentry. L’intégration `Sentry.feedbackIntegration` peut être configurée avec `autoInject: false` pour préserver une interface Neopolis personnalisée plutôt que d’ajouter un widget Sentry externe.[^sentry-feedback]

Le SDK installé a été mis à jour de `10.69.0` à `10.74.0`, version dont les déclarations exposent `captureFeedback`, `sendFeedback` et `feedbackIntegration` par `@sentry/react`.

[^sentry-feedback]: [Sentry — Set Up User Feedback](https://docs.sentry.io/platforms/javascript/user-feedback/) ; [Sentry JavaScript APIs](https://docs.sentry.io/platforms/javascript/configuration/apis/), consultées le 14 septembre 2026.

## Diagnostic initial

Le formulaire du centre d’assistance ouvrait correctement mais appelait uniquement `system.reportError`. Cette procédure journalise un incident applicatif interne, sans créer de **User Feedback Sentry**. De plus, une réponse `{ accepted: false }` pouvait être traitée comme un succès par le formulaire. La correction doit conserver le journal technique et ajouter un envoi Sentry explicite, avec retour d’échec clair pour l’apprenant.

TekTek répond dans le parcours testé, mais l’analyse est poursuivie pour vérifier les échecs de transformation tRPC et les réponses de secours excessivement prudentes. Les corrections préserveront l’accès autorisé, les citations et les garde-fous d’évaluation.

## Constat de configuration on-premise — 14 septembre 2026

Le Sentry interne fourni par l’utilisateur est accessible via `http://sentry.neopolis-dev.com/`, qui redirige vers `https://sentry.neopolis-dev.com/`. La clé active du projet `neopolis-akademy` utilise déjà un DSN HTTPS pointant vers le projet `102` : le protocole DSN n’est donc pas la cause du refus constaté.

La session administrateur Sentry confirme l’existence de la page **Project settings → User Feedback** pour ce projet, avec les contrôles de modal de crash, notifications de feedback et détection de spam. Le test de prévisualisation a échoué lors de l’envoi de l’enveloppe `sendFeedback`, après que le journal technique interne a reçu le signalement. La piste active est la restriction d’origine associée à la clé Sentry ; elle doit être lue via l’API configurée du projet ou dans les paramètres de clé, puis limitée aux seules origines Neopolis nécessaires.

### Intégration interne Sentry on-premise

La page de création d’intégration interne permet de limiter les autorisations par domaine et de déclarer des **origines JavaScript autorisées**. Le réglage minimal retenu pour le signalement Neopolis est : aucune URL webhook, aucune permission hors `Project: Write`, et l’origine exacte `https://akademy.neodev.click`. L’interface Sentry précise que cette permission couvre les projets, les tags, les fichiers de debug et les feedbacks.

Le jeton qui sera affiché par Sentry restera exclusivement côté serveur : il ne sera ni ajouté au client, ni enregistré dans ce document, ni inscrit dans les journaux.

## Test du transport serveur

Les premières tentatives associaient le User Feedback à un identifiant produit par le SDK navigateur. L’instance Sentry on-premise refusant l’ingestion DSN correspondante, l’API pouvait retourner `201` pour le feedback tout en laissant l’inbox sans événement réellement ingéré. Ce statut HTTP seul n’est donc pas retenu comme preuve de disponibilité.

Le transport corrigé génère désormais l’événement technique côté serveur via l’endpoint Store du projet, puis envoie le User Feedback authentifié avec le même identifiant. Si l’ingestion échoue, aucun feedback n’est envoyé et l’interface Neopolis indique que le journal interne reste disponible mais que la copie Sentry n’est pas confirmée. Le secret d’intégration demeure exclusivement serveur ; aucune valeur, identifiant d’événement ou contenu de test n’est conservé dans ce document.

La prévisualisation confirme par ailleurs que TekTek répond de nouveau à une question contextuelle sur la délégation avec une explication sourcée provenant de la formation autorisée. Le rendu du panneau est corrigé pour afficher les listes et emphases Claude sans interpréter de HTML ni exposer de marqueur de citation interne.

Lors du contrôle visuel, certains messages historiques affichaient encore des caractères de contrôle de citation du fournisseur. Un nettoyage défensif côté panneau est ajouté : il masque ces séquences persistées et conserve les citations dans les boutons de sources navigables déjà rendus séparément.

## Contrôle des rôles et disponibilité

Le 15 septembre 2026, le centre d’assistance a été contrôlé partiellement dans deux contextes. Une session disposant des actions administratives a validé l’ouverture de TekTek et du formulaire de signalement. Une session apprenant de démonstration a confirmé que le même centre rend les quatre canaux attendus — signalement technique, nouvelle conversation Neopolis, conversations ouvertes et TekTek — sans action d’administration ni accès à l’éditeur de contenu. Le dépôt de signalement n’est pas restreint par rôle : la procédure tRPC est publique mais conserve une limite de débit par IP, tandis que le transport final Sentry reste exclusivement serveur. Un contrôle complet, après publication, de chacun des deux rôles reste requis avant de conclure.

### Contrôle publié en cours

Après propagation du checkpoint `8a2e7522`, une session apprenant de démonstration authentifiée a chargé le cours Architect Foundations 1 sur `https://akademy.neodev.click`. Le lecteur affiche les contrôles apprenant — sans option d’édition administrative — et le launcher d’assistance est présent. Les actions TekTek et signalement technique sont contrôlées séparément dans les étapes suivantes.

Le signalement technique a été ouvert et soumis depuis cette session apprenant avec un texte de contrôle explicitement marqué « À IGNORER ». Le formulaire s’est refermé sans retour d’erreur bloquant, et le journal de production a reçu la capture technique associée. La page Sentry User Feedback a ensuite affiché son écran de chargement persistant propre à l’instance on-premise (« Awaiting solution to the halting problem »), empêchant une vérification visuelle additionnelle dans cette session ; cette limitation d’interface ne modifie pas le résultat de transport côté serveur déjà contrôlé en HTTP 201.

Le contrôle a également révélé que le centre d’assistance envoyait correctement l’action globale `open-tektek`, mais que le panneau n’était pas monté lorsque l’URL du cours ne comportait pas de paramètre `lesson`. Le lecteur utilise désormais la leçon effectivement affichée comme contexte par défaut, ce qui maintient TekTek disponible dès l’ouverture canonique d’un cours.

Le panneau est désormais bien accessible depuis cette URL canonique. Le contrôle a toutefois identifié un problème distinct de récupération : une demande explicite sur le Framework 4D peut encore recevoir un refus prudent alors que des sources de ce même cours décrivent les quatre dimensions. Ce point reste ouvert et doit être corrigé au niveau de la sélection de contexte, sans assouplir les citations ni les garde-fous d’évaluation.

La cause identifiée est la normalisation de recherche : elle écartait les identifiants courts alphanumériques tels que `4D`. La recherche conserve maintenant ces termes structurants et leur test de contrat vérifie que la question française sur le Framework 4D récupère les passages décrivant delegation, description, discernment et diligence.

Le contrôle de prévisualisation confirme ensuite le comportement : depuis l’URL canonique sans paramètre `lesson`, le centre d’assistance ouvre TekTek, et la demande « Explique le framework 4D présenté dans ce cours » produit une réponse Claude Sonnet citée sur delegation, description, discernment, diligence ainsi que les usages automation, augmentation et agency. Les anciens marqueurs de citation du fournisseur ne sont plus affichés.

### Vérification bout en bout du 15 septembre 2026

Un unique signalement de contrôle, explicitement marqué comme test à ignorer, a été soumis depuis la prévisualisation authentifiée du cours 1. Le centre d’assistance a confirmé sa transmission, tout en conservant le journal interne Neopolis indépendamment du transport externe. La consultation authentifiée de l’API User Feedback on-premise confirme la présence du feedback et d’une référence d’événement ; cette référence résout ensuite vers un événement du projet avec HTTP `200`. Cette double vérification confirme que l’événement est ingéré avant le feedback et que l’association est lisible par Sentry, même si l’interface Inbox peut afficher un état de chargement propre à l’instance.

La publication et le contrôle du domaine public des deux rôles restent requis. Après stabilisation publiée, le jeton d’intégration utilisé pour les contrôles doit être tourné, car sa valeur a été exposée antérieurement dans l’historique de conversation.
