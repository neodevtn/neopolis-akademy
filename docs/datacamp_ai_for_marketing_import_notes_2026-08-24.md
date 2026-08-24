# Notes d’import — IA pour le marketing

Le paquet Drive a été reconstitué depuis 13 fragments, validé SHA-256 (`a6ce09e6024966f003005095eb5efa8cd493c925ee5a4e10fab599fe67260c28`) et contrôlé avec `unzip -t`. Le manifeste confirme 3 chapitres, 29 activités, 10 Projector, 14 TP Cloud, 3 QCM et 2 tris ; ses 400 téléchargements locaux sont déclarés valides.

La conversion Neopolis conserve les 29 activités dans l’ordre, 10 leçons Projector, 14 `cloud_exercise`, 3 QCM, 2 `bucket_sort`, 3 téléchargements et 107 références média locales, sans média invalide ni URL externe. Elle conserve les tags de compétence et le verrouillage séquentiel.

Les captures desktop et mobile du premier écran confirment le titre, les trois chapitres, la progression, le bloc de préparation et le lecteur Projector. Le bandeau de consentement de la prévisualisation peut recouvrir une partie basse de l’écran mais ne bloque pas le contenu.

`pnpm check`, `pnpm validate-courses` et la suite Vitest complète sont réussis : 98 fichiers et 354 tests. Le validateur ne remonte aucune erreur ; les avertissements historiques de similarité de quiz d’autres cours sont non bloquants.

## Vérification de production

L’audit sur `https://akademy.neodev.click` confirme 107 / 107 médias consommés et locaux valides, sans URL DataCamp externe, chemin `/manus-storage/`, média invalide ni erreur structurelle. Il confirme aussi les 3 chapitres, 29 activités, 10 Projector, 19 exercices interactifs, tags de compétence sur les trois chapitres et verrouillage séquentiel.
