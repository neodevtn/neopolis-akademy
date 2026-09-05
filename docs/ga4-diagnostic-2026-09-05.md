# Diagnostic de réception GA4 — 5 septembre 2026

La propriété Analytics et le flux Web correspondant au domaine public ont été ouverts dans une session administrateur. L’interface confirme que le flux sélectionné cible bien le domaine Neopolis Akademy, mais affiche qu’aucune donnée n’a été reçue au cours des 48 dernières heures.

La première sonde de navigateur a confirmé que le script gtag est chargé après consentement, que le runtime Google est disponible et que les commandes sont présentes dans `dataLayer`. Elle n’a toutefois observé aucune requête de collecte dans ce navigateur automatisé. L’implémentation a alors été corrigée pour adopter le format `Arguments` du snippet gtag documenté par Google, plutôt que des tableaux ordinaires ; ce correctif a été publié et couvert par test.

Les diagnostics ci-dessous doivent différencier les limites du navigateur automatisé, qui peut être traité comme environnement non mesurable, d’une visite utilisateur consentie. Ils ne consignent ni URL de collecte, ni identifiant utilisateur, ni contenu d’événement.

## Contrôles de propriété

Le flux Web ouvert dans Analytics cible bien le domaine Neopolis Akademy et porte l’identifiant de mesure configuré dans l’application. Son écran d’état signalait toutefois encore l’absence de données reçues. Après une visite manuelle consentie demandée au propriétaire, l’écran Temps réel n’affichait pas encore d’utilisateur actif au moment du contrôle.

Le seul filtre de données présent est un filtre de trafic interne au statut **Test**. Il ne constitue donc pas une exclusion active du reporting et n’explique pas l’absence totale de données. La correction publiée reste à valider contre une visite interactive non automatisée, car les navigateurs de contrôle observés ne reçoivent pas le runtime de collecte alors que le script, le consentement et la file gtag sont présents.

## Correctifs et validation en cours

Deux défauts d’initialisation ont été corrigés et publiés : la file gtag utilise maintenant le format `Arguments` et résout la file active à chaque commande ; la configuration et la transition de consentement ne sont émises qu’après le chargement du script. La politique CSP autorise explicitement le chargeur Google et les hôtes de collecte nécessaires, sans règle générique.

Après une première puis une seconde visite manuelle consentie demandées au propriétaire, le rapport Temps réel continuait néanmoins à afficher zéro utilisateur au moment de sa consultation. Le navigateur automatisé charge le script sans violation CSP mais ne produit pas de transport Analytics observable ; il n’est donc pas utilisé comme preuve négative. Une validation dans un navigateur interactif non automatisé et, si nécessaire, avec une inspection réseau locale est encore requise.

L’en-tête CSP du domaine publié a été relu : le chargeur Google et les hôtes de collecte Google Analytics sont listés explicitement dans les directives adaptées, sans joker dans `connect-src`. Les deux visites manuelles demandées après consentement n’ont pas encore été reflétées dans le rapport Temps réel observé ; cette absence ne doit donc pas être présentée comme résolue tant qu’un transport effectif vers le service n’est pas visible.

## Analyse du HAR et stratégie retenue

Le HAR fourni contient 63 entrées. L’analyse a volontairement exclu les URL complètes, cookies, en-têtes et paramètres. Elle confirme une requête gtag unique, réussie et dirigée vers le flux configuré, sans signal DNT/GPC, mais aucune requête de collecte Analytics. Le défaut principal se situait dans le chemin d’acceptation : lorsque `window.gtag` existait déjà, l’initialisation retournait immédiatement et la transition `analytics_storage: granted` pouvait ne pas être envoyée. Ce chemin est désormais synchronisé explicitement et couvert par test.

À la demande du propriétaire, l’implémentation utilise maintenant le **Consent Mode avancé** plutôt qu’une suppression du choix utilisateur. La balise se charge avec le stockage Analytics refusé par défaut et peut émettre une page vue minimale sans stockage ; les événements pédagogiques détaillés restent conditionnés à l’acceptation. Le stockage publicitaire, les données publicitaires et la personnalisation publicitaire restent refusés. Le bandeau apparaît rapidement dans une session vierge et précède désormais les communiqués importants.

La sonde publiée confirme la présence du script, le défaut `denied`, la transition `granted` après choix, la file standard et l’absence d’erreur CSP. La réception effective dans les rapports GA4 reste le dernier critère de clôture.
