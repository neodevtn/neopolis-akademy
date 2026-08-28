# Sources canoniques — DataCamp « L’IA pour le conseil »

## Paquet source analysé

Le paquet autorisé `datacamp_ai-for-consulting_complete_media_package_2026-08-24` a été récupéré depuis le dossier Drive `ai-for-consulting` et vérifié avant extraction. Sa source canonique est `COURSE_MANIFEST.json`, dont l’URL d’origine est `https://campus.datacamp.com/fr/courses/ai-for-consulting`.

| Élément | Valeur source |
|---|---:|
| Chapitres attendus / extraits | 3 / 3 |
| Activités attendues / extraites | 31 / 31 |
| Leçons Projector | 11 |
| Exercices cloud | 17 |
| QCM | 2 |
| Tri de cartes | 1 |
| Médias locaux validés | 450 / 450 |

## Premier contrôle d’adaptabilité

Les deux premiers exercices cloud du chapitre 1 demandent une conversation dans Microsoft Copilot. Ils ne dépendent pas de fichiers joints ou d’un jeu de données local : leur logique DataCamp s’appuie sur la fenêtre Copilot intégrée et sur un contrôle de réponse de type `AiSctQuestion`.

| Activité source | Éléments exploitables | Décision provisoire |
|---|---|---|
| 1.2 — « Votre première conversation avec Copilot » | Objectif et critères structurés présents dans le manifeste ; aucun environnement propriétaire indispensable | Convertie en TP local, sans référence à Copilot dans l’interface apprenant. |
| 1.3 — « GSCE : la formule d’invite qui fonctionne » | Énoncé, critères explicites Goal/Style/Context, solution et exemple de prompt ; aucun environnement requis | Candidate à une activité locale de réponse libre rubricée, sous réserve de contrôle complet du bloc et de l’intégrité des critères. |

## Décisions finales après rapprochement exhaustif

L’audit activité par activité confirme que les **16 exercices cloud dotés de critères explicites** sont conservables comme TP locaux, avec une réponse libre évaluée sur la rubrique source persistée. Le composant n’affiche aucune valeur XP et ne valide plus le passage sur une simple saisie : le seuil de réussite de la rubrique doit être atteint.

L’activité **3.9 — « Vérifier l’analyse avec des données qualitatives »** est la seule retirée. Le manifeste ne fournit ni rubrique explicite, ni fichier, ni ressource locale permettant une exécution autonome ; il serait trompeur de simuler son environnement ou d’en conserver une référence.

Le contenu Projector **3.10** a été conservé avec ses médias locaux, mais les recommandations et liens DataCamp externes ont été retirés. L’audit régénéré conclut à 30 activités Neopolis, une activité retirée explicitement, zéro activité manquante involontairement, zéro XP visible, zéro balise HTML brute et zéro média externe.

## Contrôles du parcours

Un TP local rubricé a été rejoué en session apprenant aux formats mobile et desktop : soumission, feedback, Markdown rendu, réponse non tronquée et invisibilité des contrôles d’édition sont validés. Le score brut binaire de la rubrique est normalisé à **100/100** avant l’événement `exercise_passed`, de sorte que les règles de points de compétences Neopolis reçoivent toujours un pourcentage cohérent. La suite complète de tests et le pipeline `qa:publish` ont réussi avant publication.

La vérification du tableau de bord apprenant confirme également l’affichage de la contribution : le panneau **Prompt engineering** présente désormais l’événement « exercise passed » à **+1,0 point**, parmi les contributions visibles. Aucun libellé XP n’est affiché dans le TP ou dans ce panneau.

La fiche administrateur du même apprenant présente également le panneau **Prompt engineering** à **4/100**, avec la contribution « exercise passed » à **+1,0**. La sonde de vérification confirme simultanément la contribution, le delta, le total et l’absence de toute mention XP.
