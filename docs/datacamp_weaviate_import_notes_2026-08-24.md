# Notes d’import — RAG de bout en bout avec Weaviate

Le paquet Drive a été reconstitué depuis 10 fragments, validé SHA-256 (`7e21ce3983e2cc6cb4db7ca95c145f1b0ba9538a51cf865ca059f250af17c321`) et contrôlé avec `unzip -t`. Le manifeste canonique confirme 3 chapitres, 14 activités, 4 Projector et 137/137 ressources locales téléchargées.

La conversion Neopolis conserve les 14 activités ordonnées, 4 leçons Projector et 10 TP DataLab convertis en TP guidés autonomes. L’audit local confirme 43 médias consommés, tous locaux et valides, ainsi que les tags de compétences RAG, orchestration, DevOps, développement et business, et le verrouillage séquentiel.

Les contrôles desktop et mobile affichent le titre, les trois chapitres, la progression, la préparation et la première leçon Projector. Le bandeau de consentement de prévisualisation peut recouvrir la zone basse, sans empêcher la consultation du cours.

`pnpm check`, `pnpm validate-courses`, le test de parité Weaviate et le contrôle de catégories sont réussis. Le validateur ne remonte aucune erreur ; les 223 avertissements historiques de similarité de quiz concernent d’autres contenus et restent non bloquants.
