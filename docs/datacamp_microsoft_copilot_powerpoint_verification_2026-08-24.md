# Vérification technique — Microsoft Copilot dans PowerPoint

## Sources et intégrité

Le paquet DataCamp a été acquis depuis le dossier Drive public, reconstitué à partir de quatre fragments et vérifié avec la somme SHA-256 fournie. Le manifeste canonique confirme trois chapitres, vingt activités, sept leçons Projector, deux QCM et onze activités pratiques CloudExercise. Les 297 ressources locales déclarées ont été transférées vers la bibliothèque média du projet.

## Contrôle visuel desktop

Après la phase de chargement initiale, le lecteur affiche correctement le fil d’Ariane DataCamp, le titre **Microsoft Copilot dans PowerPoint**, le compteur 0/3 leçons, les trois chapitres dans la navigation de gauche et le verrouillage des chapitres ultérieurs. Le premier écran montre la préparation Neopolis et la première leçon **Projector Audio**. Le bandeau de cookies du preview recouvre une partie basse de l’écran, sans altérer la navigation ni le contenu pédagogique.

La vérification mobile, l’audit des médias locaux et le contrôle de production seront ajoutés avant le passage au cours suivant.

## Contrôle mobile et interactions représentatives

Au format 375 × 812, le titre du cours, le compteur 0/3 leçons, l’activité 1/7, le statut **En cours** et le début de la préparation restent lisibles. La navigation mobile est présente et la structure séquentielle est conservée.

Les captures directes des routes profondes QCM, TP et vidéo finale ont échoué au niveau du service de capture, sans erreur de serveur ni de typage. Ces écrans sont néanmoins couverts structurellement : les activités 0/1 et 0/4 sont des QCM interactifs à feedback, les onze `CloudExercise` sont convertis en TP autonomes avec préparation et corrections masquées, et la vidéo finale 2/6 est une leçon Projector locale avec audio, slides, transcript et PDF. La validation automatisée et l’audit média complètent ce contrôle avant publication.

## Validation automatisée

La validation de tous les JSON de cours est réussie. La suite complète compte **89 fichiers de test et 330 tests réussis** ; elle couvre notamment le convertisseur DataCamp, les composants de TP, les médias Projector, l’index de recherche, la catégorie de productivité et le nouveau cours PowerPoint. L’audit structurel ne relève aucune erreur : 20/20 activités et 7/7 vidéos Projector sont conservées, avec 57 références média locales valides. Le contrôle média sur le domaine de production sera effectué après publication.
