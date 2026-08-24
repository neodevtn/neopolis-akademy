# Notes d’import — Introduction à l’IA générative dans Snowflake

Le paquet Drive a été reconstitué depuis trois fragments, validé SHA-256 (`6c2449b62e4cd311a41b1af7644164fbff2f6efdd4953072f7c5f8030357e7ba`) et contrôlé par `unzip -t`. Le manifeste confirme 2 chapitres, 20 activités, 7 Projector et 13 TP Cloud ; ses 140 téléchargements locaux sont valides.

La conversion Neopolis conserve 20 activités ordonnées, 7 leçons Projector, 13 `cloud_exercise`, 2 supports, 47 médias locaux, les tags de compétences et le verrouillage séquentiel. Le test ciblé et l’audit structurel confirment l’absence d’erreur, de bloc non standard, de média invalide ou d’URL DataCamp externe.

Les captures desktop et mobile montrent l’introduction, les deux chapitres, le compteur de leçons, la progression et le lecteur Projector. Le bandeau de consentement de prévisualisation couvre partiellement la zone basse sur mobile, sans bloquer le contenu.

`pnpm check`, `pnpm validate-courses` et la suite Vitest complète sont réussis : 99 fichiers et 355 tests. Le validateur ne remonte aucune erreur ; les avertissements historiques de similarité de quiz d’autres cours restent non bloquants.

## Vérification de production

L’audit sur `https://akademy.neodev.click` confirme 47 / 47 médias consommés et locaux valides, sans URL DataCamp externe, chemin `/manus-storage/`, média invalide ni erreur structurelle. Il confirme aussi les 2 chapitres, 20 activités, 7 Projector, 13 TP, les tags des deux chapitres et le verrouillage séquentiel.
