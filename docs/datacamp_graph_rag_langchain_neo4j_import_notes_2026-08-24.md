# Notes d’import — Graph RAG avec LangChain et Neo4j

Le paquet Drive a été reconstitué depuis 14 fragments, validé SHA-256 (`3b8a170c0b2a1fb252f527456e7c0acc4b5bf5fba262d54e57928a5b46384747`) et contrôlé avec `unzip -t`. Le manifeste confirme 3 chapitres, 37 activités, 11 Projector et 368 téléchargements locaux valides.

La conversion Neopolis conserve 37 activités ordonnées, 11 leçons Projector, 10 TP guidés, 12 exercices de code, un QCM, 3 supports et 131 médias locaux. L’audit structurel et le test ciblé confirment l’absence d’erreur, de média invalide ou d’URL DataCamp externe, ainsi que les tags de compétences et le verrouillage séquentiel.

Les captures desktop et mobile montrent le titre, les trois chapitres, la progression, la préparation et le lecteur Projector. Le bandeau de consentement de prévisualisation peut recouvrir la partie basse, sans empêcher la consultation du cours.

`pnpm check`, `pnpm validate-courses`, le test de parité Graph RAG et le contrôle de catégories sont réussis. Le validateur ne remonte aucune erreur ; les 223 avertissements historiques de similarité de quiz concernent d’autres contenus et restent non bloquants.
