# Notes d’import — Modèles d’IA évolutifs avec PyTorch Lightning

Le paquet Drive a été reconstitué depuis 5 fragments, validé SHA-256 (`16dc10db2628264a8e21980b617acc59fb961b915eeae4aec5a7edf3ab5c11cf`) et contrôlé avec `unzip -t`. Le manifeste canonique confirme 3 chapitres, 30 activités, 10 vidéos Projector et 38/38 ressources locales téléchargées.

La conversion Neopolis conserve les 30 activités ordonnées, 10 leçons Projector, 17 TP guidés, 2 QCM et un tri interactif. L’audit local confirme 54 médias consommés, tous locaux et valides, les tags de compétences et le verrouillage séquentiel.

Les contrôles desktop et mobile affichent le titre, les trois chapitres, la progression, la préparation et la leçon Projector initiale. Le bandeau de consentement de la prévisualisation peut recouvrir la zone basse, sans empêcher la consultation du cours.

`pnpm check`, `pnpm validate-courses`, le test de parité PyTorch Lightning et le contrôle de catégories sont réussis. Le validateur ne remonte aucune erreur ; les 223 avertissements historiques de similarité de quiz concernent d’autres contenus et restent non bloquants.

## Vérification de production

L’audit sur `https://akademy.neodev.click` confirme 54 / 54 médias consommés et locaux valides, sans URL DataCamp externe, chemin `/manus-storage/`, média invalide ni erreur structurelle. Il confirme aussi les 3 chapitres, 30 activités, 10 Projector, 20 exercices interactifs, les tags de compétence de chaque chapitre et le verrouillage séquentiel.
