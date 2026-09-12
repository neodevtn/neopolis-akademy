# Architecture validable — Messagerie privée « Échanger avec Neopolis »

## 1. Périmètre et séparation métier

La messagerie privée est un domaine indépendant des **Communications**. Les communications restent des diffusions administratives segmentées avec accusés de réception. La messagerie introduit des fils individuels, bidirectionnels et historisés entre un apprenant et l’équipe Neopolis.

Une conversation n’expose jamais les messages d’un autre apprenant. Tous les administrateurs autorisés représentent une seule contrepartie visible sous le libellé **Équipe Neopolis** ; l’identité de l’administrateur auteur est conservée uniquement dans l’audit interne.

## 2. Modèle de données proposé

| Entité | Rôle | Champs principaux |
|---|---|---|
| `private_conversations` | Fil entre un apprenant et l’équipe | `id`, `learnerId`, `subject`, `status`, `createdBy`, `openedAt`, `closedAt`, `closedBy`, `lastMessageAt`, `lastMessagePreview` |
| `private_messages` | Message durable du fil | `id`, `conversationId`, `authorUserId`, `authorRole`, `body`, `createdAt`, `readByLearnerAt`, `readByAdminAt` |
| `private_message_events` | Audit non modifiable du cycle de vie | ouverture, fermeture, réouverture, envoi, lecture, notification demandée, notification livrée/échouée |
| `private_message_notification_state` | Anti-spam et suivi canal | conversation, destinataire, canal web/e-mail, dernier envoi, état et éventuelle erreur technique |

Les textes sont limités, normalisés et échappés à l’affichage. La première version ne prend pas en charge les fichiers joints, afin de limiter l’exposition de données et de privilégier une livraison sûre.

## 3. Droits et cycle de vie

| Action | Apprenant | Équipe Neopolis |
|---|---|---|
| Créer une conversation | Oui, sujet obligatoire | Oui, pour un apprenant ciblé |
| Lire un fil | Seulement ses propres fils | Tous les fils, si rôle administratif autorisé |
| Envoyer un message | Seulement dans un fil ouvert | Dans tout fil ouvert |
| Fermer / rouvrir | Fermer son propre fil ; réouverture par nouveau message | Fermer ou rouvrir tout fil |
| Voir l’identité interne de l’auteur admin | Non | Oui, dans l’audit seulement |

Chaque envoi est vérifié côté serveur contre le propriétaire du fil. Les messages sont persistés avant toute diffusion live. Une fermeture reste réversible et l’historique est conservé en lecture seule.

## 4. WebSocket et notifications

Le serveur WebSocket sera attaché au serveur HTTP persistant. La connexion utilisera le cookie de session existant, contrôlé au moment du handshake. Les apprenants ne rejoignent que leur propre canal ; les administrateurs rejoignent les canaux administratifs et les fils consultés.

Les événements minimaux sont `conversation.created`, `message.created`, `message.read` et `conversation.status.changed`. Les notifications en page utilisent un badge et une fenêtre flottante par sujet. Les e-mails sont envoyés pour un nouveau message non consulté, avec limitation par conversation afin d’éviter les envois répétitifs ; ils ne révèlent pas le contenu complet du message.

## 5. Hébergement persistant validé

Le WebSocket requiert le basculement vers l’hébergement **Reserved** : processus unique 24/7, 1 vCPU et 512 Mo de RAM. Le plafond à plein usage est d’environ 37,50 USD/mois, diminué du crédit mensuel de 10 USD, puis du trafic réel non inclus. Il ne s’agit pas d’un forfait fixe.

## 6. Intégrité et communication responsable

Les signaux d’intégrité existants restent des signaux de revue humaine. Une détection déclenche une alerte interne et peut préparer un brouillon de conversation, mais ne crée pas d’accusation automatique à destination de l’apprenant. L’ouverture d’un fil d’avertissement, son contenu et son envoi nécessitent une validation administrative explicite.

Pour les dossiers historiques, une liste de brouillons sera proposée aux administrateurs après revue. Le sujet demandé « Attention détection de Fraude » pourra être disponible comme modèle, mais l’interface recommandera un libellé factuel et non accusatoire, par exemple « Point d’attention sur votre activité d’apprentissage ».

## 7. Écrans prévus à l’étape suivante

L’apprenant disposera d’une entrée **Échanger avec Neopolis**, d’un historique et de fenêtres flottantes indépendantes par sujet. L’administration recevra une page dédiée, une conversation dans le suivi de chaque apprenant et une vue de file non lue. Le signalement de problème rejoindra cette messagerie sous forme de sujet prérempli, au lieu d’un bouton flottant isolé.
