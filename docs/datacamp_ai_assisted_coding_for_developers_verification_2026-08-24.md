# Vérification en cours — « Coder avec l’aide de l’IA pour les développeurs »

**Auteur :** Achraf Khelil  
**Date :** 24 août 2026  
**Source canonique :** `COURSE_MANIFEST.json`, `LLM_OPTIMIZED_COURSE_CONTENT.md`, `COMPLETENESS_REPORT.md` et le prompt d’import individuel du paquet DataCamp.

## État de préparation

| Contrôle | Résultat |
| --- | --- |
| Intégrité du ZIP multi-parties | SHA-256 conforme ; archive testée sans erreur |
| Compteurs source | 3 chapitres, 28 activités, 10 leçons Projector, 337 ressources locales |
| Conversion Neopolis | 28 activités, 10 vidéos Projector, 18 exercices interactifs, progression séquentielle |
| Bibliothèque média | 337 ressources téléversées ; 118 références consommées dans le cours converti |

## Constat visuel desktop

Le lecteur charge le cours et affiche correctement le titre, les trois chapitres, l’état verrouillé des chapitres suivants et le premier écran « Avant de commencer ». La progression du premier chapitre est visible à `1/9`. Le bandeau de consentement aux cookies recouvre la partie basse de la page lors de la capture ; il ne traduit pas une anomalie du cours.

La capture mobile à 375 px conserve le titre, le compteur `0/3 leçons`, la carte du chapitre courant et l’écran pédagogique sans débordement horizontal. Le test d’accès direct au chapitre 3 est correctement empêché pour un parcours non complété : le menu confirme le verrouillage séquentiel et le contenu ne se charge pas hors séquence.

## Contrôle des médias locaux

L’audit HTTP local à débit contrôlé confirme que les **118 références média réellement consommées** par le JSON du cours répondent toutes `HTTP 200` via `/api/assets/`. Aucune URL DataCamp externe et aucun chemin `/manus-storage/` ne figurent dans les données publiées.

## Contrôle de production

Après publication, le même audit a interrogé `https://akademy.neodev.click/api/assets/` pour les **118 références** utilisées par le cours. Le résultat est de **118/118 réponses HTTP 200**, sans 404 et sans redirection vers un média DataCamp externe. Les tests dédiés du cours, du convertisseur et du catalogue ont été complétés par la suite complète : **83 fichiers de test et 312 tests réussis**.

Les contrôles mobile, médias HTTP, activités représentatives, recherche et production restent à exécuter avant publication.
