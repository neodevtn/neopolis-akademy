# Notes d’import — L’IA pour les ventes

Le paquet Drive a été reconstitué à partir de quatre fragments, vérifié par SHA-256 (`e53fe92ee9ce4687644ca0f3371bded59b32dd80028f553cc55486671ab07bc0`) et contrôlé avec `unzip -t`. Le manifeste confirme 3 chapitres, 26 activités, 9 leçons Projector, 13 TP Cloud, 2 QCM et 2 tris. Les 309 ressources locales déclarées ont été téléversées.

La conversion locale fournit les 26 activités dans l’ordre, 9 Projector, 13 `cloud_exercise`, 2 QCM, 2 `bucket_sort`, 44 références média locales valides, progression séquentielle et tags de compétences. Les captures de contrôle montrent le premier écran sur desktop et mobile : titre, trois chapitres, progression, préparation, lecteur Projector et verrouillage sont présents. Le bandeau de consentement de prévisualisation couvre une partie basse de l’écran mobile mais pas le cours.

Le test ciblé de parité, le contrôle TypeScript et `pnpm validate-courses` sont réussis. Le validateur ne remonte aucune erreur ; les avertissements de similarité de quiz existants dans d’autres cours restent non bloquants.

Les contrôles par lien profond administrateur affichent le QCM « Trouver un événement déclencheur pour un compte cible » ainsi que le tri « Adapter le langage selon les acheteurs ». Les deux écrans portent leur type d’activité et le tri expose les consignes d’interaction ; le bandeau de consentement de preview peut couvrir la zone basse mais ne masque ni titre ni activité.

## Vérification de production

L’audit sur `https://akademy.neodev.click` confirme 44 / 44 médias consommés et locaux valides, sans URL DataCamp externe, chemin `/manus-storage/`, média invalide ou erreur structurelle. Il confirme également les 3 chapitres, 26 activités, 9 Projector, 17 exercices interactifs, les tags sur les trois chapitres et le verrouillage séquentiel.
