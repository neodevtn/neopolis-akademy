# Gestion des visuels de formation — contrôle administratif

Le 11 septembre 2026, le parcours administrateur local a été contrôlé sur `/admin/content?mode=catalog` avec une session disposant des droits requis.

| Étape | Résultat |
| --- | --- |
| Point d’entrée catalogue | Une carte **Images de formation** est visible en tête de catalogue, avec l’action **Gérer les visuels**. |
| Accès contextuel | Chaque carte de formation propose aussi **Gérer les visuels**, ouvrant la formation concernée. |
| Éditeur | Le dialogue est intitulé **Gérer les formations et leurs visuels**, s’ouvre à une largeur exploitable et présente les attributs de formation. |
| Champs | Les deux champs **Carte catalogue et en-tête (4:3)** et **Image de partage (1200 × 630)** présentent chacun un aperçu du visuel effectivement résolu, leur statut et des actions explicites. |
| Bibliothèque | L’ouverture depuis le champ Carte a été confirmée. À l’ouverture depuis les visuels, la bibliothèque est maintenant initialisée sur l’onglet **Images** et conserve la recherche libre. La propriété d’accessibilité de l’onglet actif a été contrôlée : `Images` est l’unique onglet sélectionné. |

La remise par défaut supprime la configuration d’override et laisse le resolver utiliser le visuel Neopolis spécifique enregistré, ou le fallback de marque si nécessaire.

## Contrôle sans mutation de catalogue

Un contrôle a été mené avec le catalogue local : le navigateur a ouvert le sélecteur depuis le champ Carte, confirmé le filtre **Images**, puis fermé le sélecteur sans choix. Aucun clic sur **Sauvegarder le catalogue** n’a été effectué. Un libellé éditable touché par erreur a été immédiatement rétabli dans le brouillon avant toute persistance.
