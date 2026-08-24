# Vérification technique — Systèmes multi-agents avec LangGraph

## Périmètre source

Le paquet DataCamp a été obtenu depuis le dossier Drive public et validé par sa somme SHA-256. Le manifeste canonique déclare **2 chapitres**, **13 activités**, **4 leçons Projector** et **9 exercices DataLab**, avec **143 téléchargements locaux disponibles sur 143**.

## Contrôle desktop

Le premier écran du parcours a été vérifié dans le lecteur Neopolis. Le cours affiche le titre attendu, deux leçons dans la navigation latérale, le premier chapitre « Des agents sous forme de graphes », l’activité 1/6 et le verrouillage du second chapitre. Le contenu Projector est chargé via le composant vidéo standard, sans URL DataCamp affichée. Le bandeau cookies du preview masque une partie basse de la page mais ne recouvre pas le titre, la structure pédagogique ou la navigation.

## Conversion pédagogique

Les 9 `DatalabExercise` sont convertis en TP autonomes `cloud_exercise` avec guide d’environnement, consignes structurées, solution conservée mais masquée par le composant, et des étapes visibles même lorsque la source ne fournit pas de liste HTML. Les 4 vidéos restent des leçons Projector locales (audio, slides, transcript et PDF de slides).

## Contrôle mobile

Au format 375 × 812, le titre, le compteur 0/2 leçons, l’activité 1/6, le statut « En cours » et la hiérarchie du premier chapitre restent lisibles. La mise en page est responsive ; le bandeau cookies du preview cache le bas de la zone visible, sans empêcher la lecture du contenu affiché ni le contrôle du verrouillage séquentiel.

## Audit local et tests

L’audit canonique confirme **2 chapitres**, **13 activités**, **4 leçons Projector** et **9 TP autonomes** dérivés des `DatalabExercise`. Les **24 références média uniques** effectivement consommées ont été vérifiées localement : 24/24 répondent HTTP 200, sans média invalide ni URL DataCamp externe. La recherche contient le cours après régénération de l’index.

Le typage TypeScript est valide. Les tests ciblés du convertisseur, du cours LangGraph et des catégories sont réussis : 3 fichiers et 10 tests. La validation globale des contenus ne relève aucune erreur ; les avertissements de similarité de choix sont historiques et indépendants de ce cours.

Le contrôle final de production sera exécuté après la publication, avant de poursuivre le lot.

## Contrôle média de production

L’audit sur le domaine public a contrôlé les **24 références média uniques** réellement consommées par le cours. Les 24 répondent **HTTP 200**, sans 404, 429, URL DataCamp externe ni chemin de stockage direct. La couverture inclut les quatre audios Projector, les sous-titres, les PDF de slides et les images locales synchronisées.
