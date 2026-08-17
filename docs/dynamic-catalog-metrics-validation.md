# Validation — compteurs dynamiques de certifications

## Source canonique

Les attributs auparavant saisis manuellement dans les certifications ne sont plus des paramètres éditables. Un calcul unique parcourt les fichiers JSON de cours réels et remonte les leçons, chapitres, interactions rendues, blocs vidéo et blocs de téléchargement. Les exercices historiques ne sont comptés que lorsqu’un écran les référence explicitement ; les éléments non rendus ne gonflent donc plus les statistiques.

Les valeurs de certification sont la somme des cours effectivement rattachés à cette certification. Les champs de l’éditeur sont à présent en lecture seule avec une indication claire de leur calcul automatique. Les mêmes métriques sont synchronisées dans `trainingIndex.json`, ce qui actualise aussi les fiches publiques du catalogue.

## Synchronisation

La commande `pnpm sync-catalog-metrics` recalcule les 80 cours et 18 certifications. Elle est également exécutée après chaque enregistrement de cours, de brouillon ou de blocs dans le gestionnaire de contenu. Une modification éditoriale ne peut donc plus laisser les compteurs déclaratifs obsolètes.

## Contrôles

Les tests unitaires couvrent le comptage des ressources de cours et l’agrégation des certifications. La suite complète compte **133 tests** réussis. Le validateur de cours retourne 0 erreur ; les 223 avertissements historiques de QCM proches restent non bloquants.
