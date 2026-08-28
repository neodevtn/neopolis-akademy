# Relance des invitations expirées — 26 août 2026

## Périmètre et sécurité

La relance a été précédée d’un contrôle des invitations expirées, des comptes déjà inscrits, des invitations actives et des statuts de délivrabilité. Les destinataires déjà enregistrés, ainsi que les adresses signalées comme rebondies, en plainte ou supprimées, ont été exclus. Les doublons d’invitations expirées sont regroupés par adresse e-mail avant envoi.

| Mesure | Résultat |
|---|---:|
| Invitations expirées analysées | 92 |
| Destinataires déjà inscrits, exclus | 6 |
| Enregistrements expirés en double | 1 |
| Destinataires uniques relancés | 85 |
| Envois créés et suivis | 85 |
| Échecs d’envoi | 0 |
| Anciens liens expirés invalidés | 86 |

Chaque relance contient un nouveau lien individuel, valable sept jours. L’ancienne invitation était déjà expirée ; elle reste explicitement marquée comme telle. Aucun groupe spécifique n’étant associé aux invitations historiques relancées, les comptes qui accepteront leur invitation recevront le groupe système Full access selon la politique publiée.

## Contrôle après envoi

Les 85 invitations nouvellement créées sont à l’état `pending`, possèdent toutes un lien encore actif et un identifiant de suivi de délivrabilité. Le script de relance est idempotent : un second lancement exclut toute adresse disposant déjà d’une invitation `pending` non expirée.
