# Validation — catalogue pédagogique administrable

## Couverture des contenus

L’audit a analysé **80 cours**. Les 13 types de blocs rencontrés sont tous couverts par les **25 types** enregistrés dans la bibliothèque : aucun type de bloc inconnu n’est présent dans le catalogue. Une normalisation sûre a enrichi **18 cours** avec **564 blocs standardisés** issus de leurs champs hérités (`block`, `body` et questions de checkpoint), sans supprimer les données historiques ; le lecteur existant conserve donc son comportement.

## Gestion des leçons et du catalogue

L’éditeur de cours présente désormais un panneau **Gérer les leçons de ce cours**. Il permet de créer une leçon comportant un bloc standard de contenu, modifier son titre, la déplacer, la dupliquer et la supprimer avec protection contre la suppression de la dernière leçon. Les banques de QCM associées aux leçons sont remappées lors de la sauvegarde après déplacement ou suppression.

L’espace **Gérer le catalogue** permet d’administrer les titres et descriptions FR/EN, niveau, icône, certification, catégorie, ordre, tags et libellé d’exercice. Les catégories disposent elles-mêmes d’un identifiant, titre, description et ordre ; leurs libellés sont utilisés par le catalogue apprenant.

## Contrôles

La compilation TypeScript est valide. La suite locale contient **116 tests** réussis, incluant les tests de normalisation, de gestion des leçons et de cohérence du catalogue. Le validateur de cours retourne **0 erreur** ; les 223 avertissements préexistants de réponses de QCM proches restent non bloquants.
