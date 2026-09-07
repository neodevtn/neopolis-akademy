# Durcissement post-audit — dépendances, administration et contenu

**Date :** 7 septembre 2026  
**Périmètre :** dépendances de production, performances des aperçus administratifs et contenus de cours ciblés.

## Résumé

Cette livraison traite les points post-audit qui restaient après les remédiations critiques déjà publiées. Elle conserve les mécanismes Neopolis de progression séquentielle, de calcul de compétences, de lecture des médias locaux et de contrôle des activités obligatoires.

| Axe | Mesure appliquée | Garantie vérifiée |
| --- | --- | --- |
| Dépendances | Mise à niveau de `mysql2` et de la famille Tiptap ; overrides ciblés pour la chaîne Express/body-parser vers `qs 6.16.0` | Audit pnpm des dépendances de production à zéro vulnérabilité connue |
| Navigation | Conservation du patch Wouter existant après déplacement de la configuration pnpm vers l’espace de travail | Patch effectivement appliqué dans l’arbre installé |
| Intégrité | Lecture groupée des événements, vidéos et résultats d’exercices pour toute la file administrative | Cinq lectures constantes, quel que soit le nombre d’apprenants affichés |
| Orientation | Chargement groupé des définitions, contributions et propositions ; indexation locale des contributions par compétence | Quatre lectures pour la projection administrative, sans appel par profil à `getUserCompetencies` |
| Cours | Normalisation de dix cours : environnement local au lieu de DataLab, suppression de deux visuels source, retrait des champs XP externes | Activités, médias locaux, structure des leçons et règles de compétences préservés |

## Administration : contrats préservés

La file d’intégrité calcule toujours les mêmes signaux pédagogiques à partir des événements d’apprentissage, des vidéos marquées vues et des résultats d’exercice. Les données sont maintenant regroupées par apprenant en mémoire après trois requêtes globales, plutôt que relues pour chaque apprenant.

L’aperçu d’orientation conserve les niveaux actuels, les cibles, les recommandations, la trajectoire et la proposition administrative en attente. Les contributions sont regroupées à la fois par apprenant et par compétence avant la projection. L’initialisation du référentiel de compétences reste idempotente et n’est exécutée qu’une fois par chargement de l’aperçu.

## Contenus normalisés

Sept cours qui comportaient encore une dépendance textuelle ou visuelle à DataLab indiquent désormais un **environnement de développement local**. Les textes anglais concernés ont été relus pour éliminer les formulations hybrides. Les deux visuels dont la seule fonction était d’illustrer l’environnement source ont été retirés sans créer de média de remplacement fictif.

Trois cours contenaient encore des libellés et champs XP issus de la source. Les labels visibles ont été remplacés par la terminologie Neopolis et les 47 champs `xp` importés mais non consommés par le rendu ont été retirés. Les attributions reposent donc uniquement sur les règles de points de compétences Neopolis au moment des activités validées.

Une barrière de non-régression, `server/courseContentHygiene.test.ts`, interdit désormais le retour de références DataLab et de champs ou labels XP externes dans les dix fichiers concernés.

## Validations locales avant publication

| Contrôle | Résultat |
| --- | --- |
| Vérification TypeScript | Réussie |
| Tests unitaires et d’intégration | 611 réussis, 2 ignorés |
| Contrats N+1 représentatifs | Réussis pour intégrité et orientation |
| Validation des cours | Aucune erreur bloquante ; avertissements de proximité de choix préexistants non bloquants |
| Audit de dépendances de production | 0 informationnelle, 0 faible, 0 modérée, 0 élevée, 0 critique |
| Vérification des diffs | Réussie (`git diff --check`) |
| Matrice de publication | 9 étapes sur 9 réussies |

## Vérification de production

La première construction a été refusée car l’image de build utilisait pnpm 10.4.1 alors que le lockfile avait été produit avec les overrides de pnpm 10.18.0. Le manifeste a été aligné sur pnpm 10.18.0, puis l’installation gelée et le build local ont été rejoués avec succès. La version `6be17752` a ensuite été déployée avec succès.

Après propagation, les dix fichiers de cours concernés répondent publiquement en JSON valide et ne contiennent ni référence `DataLab`, ni clé `DatalabExercise`, ni champ ou libellé XP externe. Le lecteur apprenant représentatif affiche l’instruction d’environnement de développement local et son média local. Une sonde administrateur authentifiée a également validé le catalogue, les compteurs de formation et la progression d’un parcours sur le domaine publié, sans écrire de donnée pédagogique.
