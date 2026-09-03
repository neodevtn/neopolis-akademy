# Lancement de l’onglet Parrainage

## Périmètre publié

L’espace apprenant contient désormais un onglet **Parrainage**, au même niveau que le catalogue et les compétences. L’ancien paramètre d’URL `tab=parainnage` est conservé et ouvre le même onglet, afin de ne pas rompre les liens déjà diffusés.

La page utilise uniquement les données actives du programme : lien personnel suivi, récompense annoncée, cadeau annoncé et étapes de suivi. Elle explique trois moyens de diffusion : copier le lien, l’envoyer par WhatsApp ou Messenger, ou préparer un e-mail. Les liens suivent l’origine de la candidature sans préremplir ni transmettre la liste de contacts d’un apprenant.

## Contrôles réalisés

| Contrôle | Résultat |
| --- | --- |
| Navigation | L’onglet et l’alias historique sont ouverts correctement. |
| Partage | Les canaux WhatsApp, Messenger et e-mail sont présents ; leurs URL sont testées sans publication sur un réseau externe. |
| Réactivité | La vue de contrôle à 390 px conserve `scrollWidth = clientWidth = 390`. |
| Données de programme | Les cartes affichent la récompense et le cadeau réellement administrés, sans promesse de gain automatique. |
| Domaine public | Le lien tracé et les explications de partage ont été contrôlés sur `akademy.neodev.click`. |

## Communication envoyée après confirmation

Après confirmation explicite, le communiqué **« Partagez Neopolis Akademy et découvrez le parrainage »** a été expédié une seule fois. Il cible le segment des apprenants inscrits, exclut les administrateurs, contient le lien direct vers l’onglet Parrainage et n’est pas marqué important. Le contrôle agrégé de livraison confirme le statut `sent`, un horodatage d’envoi présent et **107** destinataires. Aucune adresse, aucun nom ni identifiant de message n’est consigné dans ce document.
