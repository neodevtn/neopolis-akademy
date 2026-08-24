# Notes d’import — Créer des agents d’IA avec CrewAI

Le paquet Drive a été reconstitué depuis 2 fragments, validé SHA-256 (`420ee01b14f6a4638344182caca0eb3fc66d47bee6e3c0276882959e0103b713`) et contrôlé avec `unzip -t`. Le manifeste confirme 2 chapitres, 7 activités, 2 Projector et 31 téléchargements locaux valides.

La conversion Neopolis conserve 7 activités ordonnées, 2 leçons Projector, 5 TP guidés et 2 supports. L’audit structurel et le test ciblé confirment l’absence d’erreur, de média invalide ou d’URL DataCamp externe, ainsi que les tags de compétences et le verrouillage séquentiel.

Les captures desktop et mobile montrent le titre, les deux chapitres, la progression, la préparation et le lecteur Projector. Le bandeau de consentement de prévisualisation peut recouvrir la partie basse, sans empêcher la consultation du cours.

`pnpm check`, `pnpm validate-courses`, le test de parité CrewAI et le contrôle de catégories sont réussis. Le validateur ne remonte aucune erreur ; les 223 avertissements historiques de similarité de quiz concernent d’autres contenus et restent non bloquants.

## Vérification de production

L’audit sur `https://akademy.neodev.click` confirme 19 / 19 médias consommés et locaux valides, sans URL DataCamp externe, chemin `/manus-storage/`, média invalide ni erreur structurelle. Il confirme aussi les 2 chapitres, 7 activités, 2 Projector, 5 TP guidés, les tags de compétence de chaque chapitre et le verrouillage séquentiel.
