# Notes d’import — Créer des agents d’IA avec Haystack

Le paquet Drive a été reconstitué depuis 7 fragments, validé SHA-256 (`efee28e81bdc79382b1a018c6362ed23e87576a3ecf264c20f200dfeab7d21ff`) et contrôlé avec `unzip -t`. Le manifeste canonique confirme 2 chapitres, 11 activités, 5 Projector et 82/82 ressources locales téléchargées.

La conversion Neopolis conserve les 11 activités ordonnées, 5 leçons Projector et 6 TP DataLab convertis en TP guidés autonomes. L’audit local confirme 59 médias consommés, tous locaux et valides, les tags de compétences RAG et orchestration IA, et le verrouillage séquentiel.

Les contrôles desktop et mobile affichent le titre, les deux chapitres, la progression, la préparation et la première leçon Projector. Le bandeau de consentement de prévisualisation peut recouvrir la zone basse, sans empêcher la consultation du cours.

`pnpm check`, `pnpm validate-courses`, le test de parité Haystack et le contrôle de catégories sont réussis. Le validateur ne remonte aucune erreur ; les 223 avertissements historiques de similarité de quiz concernent d’autres contenus et restent non bloquants.

## Vérification de production

L’audit sur `https://akademy.neodev.click` confirme 59 / 59 médias consommés et locaux valides, sans URL DataCamp externe, chemin `/manus-storage/`, média invalide ni erreur structurelle. Il confirme aussi les 2 chapitres, 11 activités, 5 Projector, 6 TP guidés, les tags de compétence de chaque chapitre et le verrouillage séquentiel.
