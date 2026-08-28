# Notes source — DataCamp « L’IA pour la finance »

La source canonique est le manifeste restauré dans `/home/ubuntu/datacamp_packages/ai-for-finance/package/ai-for-finance/COURSE_MANIFEST.json`. Il décrit trois chapitres, trente activités, dix contenus Projector, onze activités CloudExercise, trois QCM et six tris interactifs.

| Activités CloudExercise | Décision initiale issue du manifeste |
|---|---|
| 1.2, 1.6, 1.7, 2.3, 2.6, 2.9, 3.3, 3.5, 3.6 | Conserver comme TP local, sous réserve de conserver la rubrique explicite associée. |
| 1.8 — Analyses IA à partir de fichiers CSV | Retrait candidat : ni rubrique explicite ni fichier/ressource locale déclarée. |
| 1.11 — Essayez un modèle de prompt | Retrait candidat : ni rubrique explicite ni fichier/ressource locale déclarée. |

Les activités 1.4 « Augmentation ou automation ? », 2.2, 2.8, 3.2, 3.8 et 3.9 sont des tris interactifs. Elles doivent rester dans le bloc standard `bucket_sort`, avec dépôt souris et cibles cliquables accessibles, réponse et correction locales.

Les contenus Projector disposent de chemins de médias locaux dans `downloads/`. Les textes source citant Copilot ou DataCamp comme environnement opérationnel doivent être reformulés ou retirés lorsqu’ils décrivent une action que Neopolis ne fournit pas ; aucune URL externe ne doit rester dans l’expérience apprenant.

## Décision finale et contrôle d’alignement

Les neuf TP ayant une rubrique explicite ont été convertis en activités locales rubricées. Les activités **1.8** et **1.11** sont retirées de manière assumée : l’une comme l’autre ne fournit ni critères d’évaluation, ni ressource locale permettant de reconstruire honnêtement une activité autonome. La navigation et les compteurs Neopolis sont recalculés sur les **28 activités conservées**.

L’audit d’alignement final conclut à **0 activité manquante involontairement**, **2 activités retirées explicitement**, **0 XP visible**, **0 référence à un Lab/VM/Campus/Workspace DataCamp**, **0 balise HTML brute** et **0 média externe**. Le tri 1.4 a été rejoué par clic carte/catégorie : la soumission reste verrouillée jusqu’au placement complet et correct, puis le feedback et la navigation sont déverrouillés.
