# Notes d’import — Databricks avec le SDK Python

Le paquet Drive a été reconstitué depuis deux fragments, validé SHA-256 (`03f720e3d1d373a828fea8725b7c1294cdedfa1e69cadbe8559b94aa35b5dd92`) et contrôlé avec `unzip -t`. Le manifeste confirme 3 chapitres, 24 activités, 8 Projector et 260 téléchargements locaux valides.

La conversion Neopolis conserve 24 activités ordonnées, 8 leçons Projector, 15 TP guidés, un QCM, 3 supports et 52 médias locaux. L’audit structurel et le test ciblé confirment l’absence d’erreur, de média invalide ou d’URL DataCamp externe, ainsi que les tags de compétences et le verrouillage séquentiel.

Les captures desktop et mobile montrent le titre, les trois chapitres, la progression, la préparation et le lecteur Projector. Le bandeau de consentement de prévisualisation peut recouvrir la partie basse, sans empêcher la consultation du cours.

`pnpm check`, `pnpm validate-courses`, le test de parité Databricks et le contrôle de catégories sont réussis. Le validateur ne remonte aucune erreur ; les 223 avertissements historiques de similarité de quiz concernent d’autres contenus et restent non bloquants.
