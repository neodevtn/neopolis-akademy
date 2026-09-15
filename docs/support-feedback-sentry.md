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

Un signalement de contrôle explicitement étiqueté a été soumis depuis la prévisualisation via le nouveau transport serveur. Le formulaire s’est fermé sans erreur console, et le journal interne Neopolis a été conservé. La liste **User Feedback** Sentry n’affichait pas encore cette entrée au premier rafraîchissement : la réception externe reste donc à confirmer avant de déclarer le canal opérationnel.

Le transport serveur a ensuite renvoyé une confirmation d’acceptation `201` de l’API User Feedback Sentry. La liste de l’interface peut être différée par l’indexation ou ses filtres ; le succès fonctionnel est fondé sur cette réponse API authentifiée, sans conserver dans ce document l’identifiant de feedback, le texte de test ou le jeton.

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
