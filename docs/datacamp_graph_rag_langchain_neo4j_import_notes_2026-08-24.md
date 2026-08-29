# Notes d’import — Graph RAG avec LangChain et Neo4j

Le paquet Drive a été reconstitué depuis 14 fragments, validé SHA-256 (`3b8a170c0b2a1fb252f527456e7c0acc4b5bf5fba262d54e57928a5b46384747`) et contrôlé avec `unzip -t`. Le manifeste confirme 3 chapitres, 37 activités, 11 Projector et 368 téléchargements locaux valides.

La conversion Neopolis conserve 37 activités ordonnées, 11 leçons Projector, 10 TP guidés, 12 exercices de code, un QCM, 3 supports et 131 médias locaux. L’audit structurel et le test ciblé confirment l’absence d’erreur, de média invalide ou d’URL DataCamp externe, ainsi que les tags de compétences et le verrouillage séquentiel.

Les captures desktop et mobile montrent le titre, les trois chapitres, la progression, la préparation et le lecteur Projector. Le bandeau de consentement de prévisualisation peut recouvrir la partie basse, sans empêcher la consultation du cours.

`pnpm check`, `pnpm validate-courses`, le test de parité Graph RAG et le contrôle de catégories sont réussis. Le validateur ne remonte aucune erreur ; les 223 avertissements historiques de similarité de quiz concernent d’autres contenus et restent non bloquants.

## Retrait canonique après réaudit du 29 août 2026

L’exercice visuel source 2.2 « Éléments d’un graphe lexical » déclarait l’image `identifying-elements.png` uniquement via `https://assets.datacamp.com/production/repositories/6925/datasets/142ea3f43e13e9cf603158273589cacefdf494eb/identifying-elements.png`. Aucun fichier correspondant n’est présent dans le ZIP restauré, sous `downloads/`, ni dans `download_assets_manifest.json`. Sans image, la consigne ne serait pas reproductible. L’activité et cette référence externe sont donc retirées, sans substitut inventé. L’audit réexécuté indique 37 activités source, 36 conservées, une omission explicitement déclarée, zéro candidat de retrait résiduel et zéro média externe. Les compteurs sont resynchronisés à 36 activités, 22 exercices, 11 Projector et 3 téléchargements ; la QA complète en six étapes est réussie.

Le 29 août, le bloc standard Code REPL a aussi été rendu sûr : il ne lance plus du JavaScript arbitraire dans le navigateur. Une proposition est comparée, après normalisation limitée des fins de ligne et espaces terminaux, à la solution canonique déjà présente dans le manifeste. Le rejeu local de l’activité 1.4 confirme l’éditeur, la solution masquée, le feedback de validation et le déverrouillage de la suite après soumission de cette solution ; aucun code saisi n’a été exécuté.

## Vérification de production antérieure

L’audit sur `https://akademy.neodev.click` confirmait 131 / 131 médias consommés et locaux valides, sans URL DataCamp externe, chemin `/manus-storage/`, média invalide ni erreur structurelle. Il confirmait alors 3 chapitres, 37 activités, 11 Projector et 23 exercices interactifs. Ces compteurs sont historiques et seront recontrôlés en production après la publication de l’adaptation du 29 août.
