# Notes d’import — Entraîner efficacement des modèles d’IA avec PyTorch

Le paquet Drive a été reconstitué depuis 4 fragments, validé SHA-256 (`7fce44d980937f6828c47da85a411676590eacaa28b70ae51d5c356a4afe6264`) et contrôlé avec `unzip -t`. Le manifeste confirme 4 chapitres, 45 activités et 13 Projector. Les 26 sous-titres externes non accessibles sont explicitement documentés par le manifeste ; ils ne sont ni publiés ni remplacés par une URL externe.

La conversion Neopolis conserve 45 activités ordonnées, 13 leçons Projector, 25 TP guidés, 6 exercices de code, un tri interactif et les supports disponibles. L’audit structurel et le test ciblé confirment l’absence d’erreur, de média invalide ou d’URL DataCamp externe, ainsi que les tags de compétences et le verrouillage séquentiel.

Les captures desktop et mobile montrent le titre, les quatre chapitres, la progression, la préparation et le lecteur Projector. Le bandeau de consentement de prévisualisation peut recouvrir la partie basse, sans empêcher la consultation du cours.

`pnpm check`, `pnpm validate-courses`, le test de parité PyTorch et le contrôle de catégories sont réussis. Le validateur ne remonte aucune erreur ; les 223 avertissements historiques de similarité de quiz concernent d’autres contenus et restent non bloquants.

## Vérification de production

L’audit sur `https://akademy.neodev.click` confirme 150 / 150 médias consommés et locaux valides, sans URL DataCamp externe, chemin `/manus-storage/`, média invalide ni erreur structurelle. Il confirme aussi les 4 chapitres, 45 activités, 13 Projector, 32 exercices interactifs, les tags de compétence de chaque chapitre et le verrouillage séquentiel.
