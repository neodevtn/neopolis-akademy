# Diagnostic de réception GA4 — 5 septembre 2026

La propriété Analytics et le flux Web correspondant au domaine public ont été ouverts dans une session administrateur. L’interface confirme que le flux sélectionné cible bien le domaine Neopolis Akademy, mais affiche qu’aucune donnée n’a été reçue au cours des 48 dernières heures.

La première sonde de navigateur a confirmé que le script gtag est chargé après consentement, que le runtime Google est disponible et que les commandes sont présentes dans `dataLayer`. Elle n’a toutefois observé aucune requête de collecte dans ce navigateur automatisé. L’implémentation a alors été corrigée pour adopter le format `Arguments` du snippet gtag documenté par Google, plutôt que des tableaux ordinaires ; ce correctif a été publié et couvert par test.

Les diagnostics ci-dessous doivent différencier les limites du navigateur automatisé, qui peut être traité comme environnement non mesurable, d’une visite utilisateur consentie. Ils ne consignent ni URL de collecte, ni identifiant utilisateur, ni contenu d’événement.

## Contrôles de propriété

Le flux Web ouvert dans Analytics cible bien le domaine Neopolis Akademy et porte l’identifiant de mesure configuré dans l’application. Son écran d’état signalait toutefois encore l’absence de données reçues. Après une visite manuelle consentie demandée au propriétaire, l’écran Temps réel n’affichait pas encore d’utilisateur actif au moment du contrôle.

Le seul filtre de données présent est un filtre de trafic interne au statut **Test**. Il ne constitue donc pas une exclusion active du reporting et n’explique pas l’absence totale de données. La correction publiée reste à valider contre une visite interactive non automatisée, car les navigateurs de contrôle observés ne reçoivent pas le runtime de collecte alors que le script, le consentement et la file gtag sont présents.
