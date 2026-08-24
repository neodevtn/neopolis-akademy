# Notes d’import — Agents IA avec Hugging Face smolagents

Le paquet Drive a été reconstitué depuis 14 fragments, validé SHA-256 (`404abb370315456d59e14d8e62e5e26d4a47646537dacbba5926837b4bf00c32`) et contrôlé avec `unzip -t`. Le manifeste confirme 3 chapitres, 30 activités, 10 Projector, 14 exercices pratiques, 4 QCM, 1 tri et 1 exercice de processus ; ses 308 téléchargements locaux sont valides.

La conversion Neopolis conserve 30 activités ordonnées, 10 leçons Projector, 14 `cloud_exercise`, 4 QCM, un `bucket_sort`, un `code_repl`, 3 téléchargements et 70 médias locaux. L’audit structurel ne relève aucun bloc inattendu, média invalide ou URL DataCamp externe ; les tags de compétence et le verrouillage séquentiel sont présents.

Les captures desktop et mobile confirment le titre, les trois chapitres, la progression, la préparation et le lecteur Projector du premier écran. Le bandeau de consentement de prévisualisation peut recouvrir une partie basse de l’écran, sans bloquer le cours.

`pnpm check`, `pnpm validate-courses` et la suite Vitest complète sont réussis : 100 fichiers et 356 tests. Le validateur ne remonte aucune erreur ; les avertissements historiques de similarité de quiz d’autres cours restent non bloquants.

## Vérification de production

L’audit sur `https://akademy.neodev.click` confirme 70 / 70 médias consommés et locaux valides, sans URL DataCamp externe, chemin `/manus-storage/`, média invalide ni erreur structurelle. Il confirme aussi les 3 chapitres, 30 activités, 10 Projector, 20 exercices interactifs, les tags de compétence de chaque chapitre et le verrouillage séquentiel.
