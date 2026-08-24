# Vérification — L’IA pour le conseil

## Contrôle visuel desktop

La route locale `/training/datacamp_ai_for_consulting/ai_for_consulting__01` charge le JSON de cours en HTTP 200. Après le chargement initial, l’écran affiche correctement la certification **DataCamp · L’IA pour le conseil**, les trois leçons, le chapitre 1 « Augmenter la recherche et la synthèse avec l’IA », l’activité 1/7, le badge Projector audio, l’introduction et la préparation d’environnement Neopolis.

Le navigateur indique également les deux chapitres suivants comme verrouillés. L’administration affiche le raccourci « Modifier cet écran » conformément au rôle connecté. Le bandeau de consentement du preview couvre le bas de la zone de contenu mais pas la navigation, le titre, la progression ni le lecteur Projector.

## Contrôle mobile et activités représentatives

Au format 375 × 812, la certification, le compteur 0/3 leçons, l’activité 1/7, le chapitre actif et son statut restent lisibles. Le premier chapitre est accessible tandis que les deux suivants restent verrouillés, conformément à la progression séquentielle.

Les activités représentatives ciblées sont le QCM « Petits pas, grands insights », le tri « Du So What? au Now What? étape par étape » et une vidéo Projector du dernier chapitre. La capture automatisée de ces écrans profonds a échoué au niveau du service de capture, sans erreur de serveur ni de JSON. Elles restent couvertes par les blocs standards convertis, l’audit structurel et les tests dédiés.

## Vérifications restantes

La validation complète et l’indexation de recherche sont terminées. Le contrôle des médias de production reste à effectuer après publication.

## Audit local et validation complète

L’audit canonique confirme **3 leçons**, **31 activités** et **11 leçons Projector**. Il identifie 82 références média locales, sans erreur de structure, média invalide, URL DataCamp publiée ou défaut de verrouillage séquentiel. Les activités sont converties avec 17 TP `cloud_exercise`, 2 QCM et 1 tri standard ; les corrections restent associées aux blocs interactifs.

Le typage TypeScript, la validation de tous les JSON et la suite complète sont réussis : **91 fichiers de test et 336 tests**. Le test dédié contrôle les compteurs, la catégorie IA de productivité & collaboration, les 11 Projector audio, les 17 TP, le tri, les QCM et l’absence d’URL externe.

## Contrôle média de production

L’audit sur le domaine public a contrôlé les **54 références média uniques** réellement consommées par le cours. Les 54 répondent **HTTP 200**, sans 404, 429, URL DataCamp externe ni chemin de stockage direct. La couverture inclut les onze audios Projector, les sous-titres, les PDF de slides et les images locales synchronisées.
