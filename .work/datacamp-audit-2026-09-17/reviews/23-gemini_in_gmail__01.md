# Revue de contenu — `gemini_in_gmail__01`

**Périmètre.** Revue limitée à `client/public/data/courses/gemini_in_gmail__01.json` et aux preuves locales autorisées du dépôt. Aucun recours à DataCamp web et aucune modification du fichier de cours.

## Conclusion

Le paquet est **structurellement cohérent et publiable** selon les preuves locales : 1 chapitre, 7 activités, 4 vidéos et 1 téléchargement sont confirmés par le bilan d’import et les notes de validation ([`docs/datacamp_import_final_report_2026-08-21.md`](../../../docs/datacamp_import_final_report_2026-08-21.md), lignes 37–49 ; [`docs/datacamp_pilot_validation_notes.md`](../../../docs/datacamp_pilot_validation_notes.md), lignes 9–19). La revue de readiness classe le cours en « interactions déterministes uniquement » ([`docs/ai_evaluation_readiness_2026-08-26.md`](../../../docs/ai_evaluation_readiness_2026-08-26.md), ligne 97). En revanche, le JSON ne fournit pas un TP guidé dans l’environnement Gmail de l’apprenant : il décrit une démonstration vidéo et annonce une activité pratique, mais aucune consigne opératoire évaluée n’est matérialisée dans un bloc pratique.

**Statut d’évidence : partiel.** Les preuves locales disponibles confirment l’import et la cohérence de production, mais aucun fichier local autorisé de type `docs/datacamp_*alignment*.json`, `docs/datacamp_*source*.md` ou `docs/datacamp_*production*.md` spécifique à `gemini_in_gmail__01` n’a été trouvé ; il n’est donc pas possible d’affirmer une fidélité factuelle à une source DataCamp au-delà des contrôles d’import présents.

## Constats factuels

| Constat | Niveau | Preuve |
|---|---|---|
| La séquence contient 4 vidéos, puis une ressource PDF obligatoire, puis 2 QCM obligatoires ; toutes les activités ont `requiredBeforeAdvance: true`. | Conforme | JSON du cours, lignes 40–354 ; compteurs confirmés par [`docs/datacamp_import_final_report_2026-08-21.md`](../../../docs/datacamp_import_final_report_2026-08-21.md), lignes 41–43. |
| La couverture QA locale reconnaît bien `resource_review` pour `gemini_in_gmail__01` (L1/E5), et l’inventaire recense 0 bloc pratique, 2 checkpoints et 8 blocs. | Conforme mais limitatif | [`docs/block_qa_coverage_2026-08-25.md`](../../../docs/block_qa_coverage_2026-08-25.md), ligne 22 ; [`docs/datacamp-course-inventory-2026-09-17.json`](../../../docs/datacamp-course-inventory-2026-09-17.json), lignes 270–279. |
| Le JSON annonce « hands-on activity » dans le transcript de l’introduction et « Now it’s your turn », avec un scénario Cymbal Retail, mais l’activité suivante (`dc_ch01_act05`) est uniquement un `resource_review` ouvrant le PDF ; il n’y a ni `cloud_exercise`, ni `exercise`, ni champ de remise, ni critère de réussite pour rédiger l’e-mail dans Gmail. | **Insuffisance de guidage observable directement** | JSON, lignes 65, 181–185, 201–220 ; inventaire local, lignes 275–279. |
| Les prérequis d’environnement sont seulement évoqués dans la vidéo : disponibilité variable selon l’édition Google Workspace et les politiques administrateur, avec renvoi à l’administrateur. Le JSON ne propose pas de vérification préalable, solution de repli, ni procédure d’installation/activation. | **Insuffisance de guidage observable directement** | JSON, lignes 65 et 113–117. Aucun téléchargement ou script d’installation spécifique n’est déclaré ; le seul téléchargement est le PDF de slides (lignes 73–86, 215–219). |
| Les champs `fr` reprennent l’anglais pour les titres, descriptions, questions, options, explications et indices ; les descriptions de cours, chapitre et activités sont également répétées à l’identique et restent génériques. | **Présentation incohérente** | JSON, lignes 28–33, 43–50, 92–98, 126–132, 160–165, 192–199, 224–231, 239–350. |
| La validation locale confirme l’affichage de 1 cours, 7 activités, 4 vidéos, 1 téléchargement, le verrouillage séquentiel et l’accès aux médias `/api/assets/`. | Conforme | [`docs/datacamp_pilot_validation_notes.md`](../../../docs/datacamp_pilot_validation_notes.md), lignes 9–19. |

## Dépendances et utilisabilité pratique

Les dépendances externes sont **Gmail/Google Workspace avec Gemini**, un navigateur ou l’application Gmail, et l’activation effective de la fonctionnalité par l’édition et l’administrateur. Le cours ne demande aucun téléchargement de données, ne fournit aucun jeu de données, et ne contient aucun script d’installation. Le PDF local est un support de consultation, pas un environnement d’exercice ([JSON](../../../client/public/data/courses/gemini_in_gmail__01.json), lignes 61–85 et 109–147).

En conséquence, la préparation est **insuffisante pour une mise en pratique autonome** : l’apprenant sait qu’il doit générer et affiner un e-mail, mais ne reçoit pas, dans un bloc pratique, un objectif vérifiable, un contexte/prompt prêt à copier, des étapes numérotées, un livrable attendu, une grille de contrôle, ni une solution de repli si Gemini n’est pas activé. Cette conclusion est une observation du JSON, et non une affirmation sur le contenu original DataCamp.

## Correctifs génériques réutilisables Neopolis

1. Ajouter, avant tout TP dépendant d’un SaaS, un bloc standard **« Vérification d’environnement »** : compte requis, édition/fonctionnalité attendue, politique administrateur, test de disponibilité et procédure de repli sans accès.
2. Remplacer l’annonce vidéo d’un TP par un bloc standard **« TP guidé »** comportant objectif, contexte métier, données/prompt de départ, étapes numérotées, livrable, critères de réussite et bouton de validation.
3. Ajouter un bloc standard **« Contrôle qualité de sortie »** pour les productions génératives : destinataire, objectif, ton, longueur, exactitude, informations sensibles et relecture humaine avant envoi.
4. Appliquer le contrôle éditorial standard **« langue et métadonnées »** : traduire réellement les champs `fr`, éviter les descriptions copiées-collées et harmoniser titres, instructions et options.
5. Conserver le verrouillage séquentiel, mais ne déclarer une activité comme « pratique » que lorsqu’un bloc de remise ou une interaction de production est effectivement présent.

**Sévérité globale : moyenne.** Aucun défaut local de structure, média ou publication n’est démontré ; le risque porte principalement sur l’autonomie de l’apprenant et la cohérence linguistique.
