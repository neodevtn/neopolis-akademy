# Refonte des métiers, recommandations et compétences

**Date :** 19 septembre 2026  
**Auteur :** Manus AI

## Résultat général

La taxonomie des métiers comporte désormais **12 familles distinctes**. Elle couvre les domaines déjà présents et ajoute notamment **Santé, médecine & recherche clinique**, **Éducation, formation & transmission**, **Juridique, conformité & risques**, ainsi que **Industrie, ingénierie métier & logistique**. Les intitulés détaillés de métier restent indexables, mais le filtre apprenant n’affiche plus une longue liste redondante.

Le moteur d’orientation ne repose plus sur une correspondance unique entre une compétence et une formation. Il croise désormais les compétences ciblées, le niveau réellement vérifié, les familles métier choisies, l’objectif professionnel rédigé librement, les informations déjà fournies dans la candidature, les certifications officielles demandées et le catalogue actuellement disponible. Les anciens profils d’orientation ont été recalculés avec cette logique.

## Parcours recommandés

Chaque formation du catalogue possède maintenant un profil explicite limité à **trois compétences pondérées au maximum**. Les 180 cours actuellement indexés sont couverts. Une activité ne peut donc plus créditer indistinctement toutes les compétences présentes dans ses métadonnées historiques.

Le parcours recommandé est construit dans cet ordre : une fondation lorsque le niveau est insuffisant, plusieurs formations complémentaires liées aux compétences prioritaires, puis les formations associées aux familles métier. Une certification officielle explicitement demandée reste prioritaire. Les recommandations qui ne correspondent plus à une certification existante sont automatiquement exclues.

Dans l’interface d’orientation, le candidat peut choisir jusqu’à quatre familles métier et décrire librement ce qu’il veut atteindre. Les informations déjà saisies lors de sa candidature alimentent aussi le classement, sans remplacer son choix explicite.

## Acquisition des compétences

Les points ont été réduits et répartis entre les compétences réellement couvertes par la formation.

| Preuve validée | Points maximum par activité | Score minimum |
|---|---:|---:|
| Checkpoint | 0,75 | 70 % |
| Exercice ou TP | 2,00 | 70 % |
| Quiz | 2,00 | 75 % |
| Badge | 3,00 | Non applicable |
| Certification | 10,00 | Géré par l’examen |

Un total de points ne suffit plus à acquérir un rang. La diversité et la solidité des preuves sont également obligatoires.

| Rang | Points | Preuves | Sources distinctes | Types de preuve | Exigence complémentaire |
|---|---:|---:|---:|---:|---|
| Émergent | 5 | 3 | 1 | 1 | Aucune |
| Bronze | 20 | 8 | 2 | 2 | Aucune |
| Argent | 50 | 18 | 4 | 2 | Badge ou certification |
| Or | 80 | 35 | 7 | 3 | Certification obligatoire |

L’interface apprenant explique ces exigences. Elle distingue désormais une compétence simplement commencée d’une compétence réellement validée.

## Migration des données existantes

La migration a été exécutée de manière réversible après création d’une sauvegarde privée hors publication. Les **6 093 contributions historiques** ont été recalculées sans supprimer les événements ni l’historique d’apprentissage. Le total passe de **9 211 points** à **1 100,3 points pondérés**.

Après application des seuils de preuve, la base contient 310 couples apprenant-compétence au niveau initial, 67 au niveau émergent et 7 au niveau Bronze. Aucun niveau Argent ou Or n’est conservé sans répondre aux nouvelles exigences. Les **19 anciens profils d’orientation** ont été recalculés et contiennent désormais **119 recommandations valides**. Aucune recommandation ne pointe vers une formation absente du catalogue.

Deux colonnes non destructives ont été ajoutées aux profils d’orientation : `careerFamilyIds` pour les familles choisies et `aspiration` pour l’objectif libre. La migration peut être rejouée sans modifier une seconde fois les points déjà recalculés.

## Contrôles

Les contrats automatisés couvrent la taxonomie métier, l’inférence Santé, les parcours multi-formations, la pondération des compétences, les seuils de preuve, la couverture des 180 cours, les scores minimums et la cohérence des anciennes recommandations. La suite complète valide **280 fichiers et 967 tests**, avec deux tests volontairement ignorés. La matrice de publication est entièrement verte sur ses neuf contrôles, notamment TypeScript, SEO, sitemap, desktop et mobile. Le build de production réussit.

Le parcours a aussi été contrôlé dans un navigateur apprenant authentifié. Les 12 familles, le champ d’objectif libre, le nouvel objectif hebdomadaire et le texte d’exigence des compétences sont rendus correctement. Le filtre catalogue n’affiche plus les anciennes catégories ni les identifiants internes : il présente uniquement les 12 libellés contrôlés, dont **Santé, médecine & recherche clinique**.

## References

[1]: https://akademy.neodev.click/training "Neopolis Akademy — Espace de formation"
