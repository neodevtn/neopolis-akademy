# Notes d’import — Modèles multimodaux avec Hugging Face

Le paquet Drive a été reconstitué depuis 35 fragments, validé SHA-256 (`a9513f518d1307ad9d2b27fc6aa9158519ee6ce48afaf9c12865d145c71dc9aa`) et contrôlé avec `unzip -t`. Le manifeste confirme 4 chapitres, 45 activités, 14 Projector et 373 téléchargements locaux valides.

La conversion Neopolis conserve 45 activités ordonnées, 14 leçons Projector, 3 TP guidés, 27 exercices de code, 4 supports et 92 médias locaux. Une image Depositphotos externe non présente parmi les ressources canoniques est volontairement omise : elle n’est jamais publiée comme URL externe. L’audit structurel et le test ciblé confirment l’absence d’erreur, de média invalide ou d’URL DataCamp externe, ainsi que les tags de compétences et le verrouillage séquentiel.

Les captures desktop et mobile montrent le titre, les quatre chapitres, la progression, la préparation et le lecteur Projector. Le bandeau de consentement de prévisualisation peut recouvrir la partie basse, sans empêcher la consultation du cours.

`pnpm check`, `pnpm validate-courses`, le test de parité multimodal et le contrôle de catégories sont réussis. Le validateur ne remonte aucune erreur ; les 223 avertissements historiques de similarité de quiz concernent d’autres contenus et restent non bloquants.

## Vérification de production

L’audit sur `https://akademy.neodev.click` confirme 92 / 92 médias consommés et locaux valides, sans URL DataCamp externe, chemin `/manus-storage/`, média invalide ni erreur structurelle. Il confirme aussi les 4 chapitres, 45 activités, 14 Projector, 30 exercices interactifs, les tags de compétence de chaque chapitre et le verrouillage séquentiel.
