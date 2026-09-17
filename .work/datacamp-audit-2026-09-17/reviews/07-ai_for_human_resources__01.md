# Revue de contenu — `ai_for_human_resources__01`

## Conclusion

Le cours est **globalement aligné sur la conversion locale documentée**, mais ses TP ne sont pas suffisamment guidés pour une pratique autonome dans l’environnement de l’apprenant. La structure locale conserve les 25 activités attendues par la décision d’import : 11 vidéos, 9 TP cloud rubricés et 5 tris. Les sept activités source retirées sont explicitement justifiées par l’absence de rubrique ou de ressource exploitable dans les preuves locales [1] [2]. Aucun défaut factuel de dépendance externe ou de média non local n’est établi par les contrôles disponibles [2] [3].

## Constats d’alignement et de séquence

Le JSON déclare à la racine 3 chapitres et 32 activités extraites, avec les types source `VideoExercise` (11), `CloudExercise` (16) et `DragAndDropExercise` (5). La structure effectivement publiée dans `lessons[].chapters[]` contient 25 activités. L’audit d’alignement local confirme 25 activités conservées, 7 retraits intentionnels, 16 TP cloud source, 9 candidats à une rubrique locale et 5 tris [1]. Les retraits sont cohérents avec les notes de source : `1.8`, `2.2`, `2.5`, `2.11`, `3.3`, `3.5` et `3.9` sont retirés, et non remplacés par des simulations inventées [2].

La séquence conservée est verrouillée activité par activité (`requiredBeforeAdvance: true`). Les preuves locales confirment le verrouillage, le feedback et le déverrouillage après réussite pour le tri 1.3, ainsi que le rendu Projector audio/slides [3] [4]. La présentation du cours est toutefois incohérente sur le choix de l’outil : le transcript du premier Projector annonce un travail avec « l’assistant IA choisi de Microsoft », tandis que le bloc de préparation et les TP demandent un assistant génératif auquel l’apprenant a personnellement accès. Le JSON ne fournit pas de règle permettant de résoudre explicitement cette contradiction [5].

## TP : insuffisances de guidage observables

Les neuf blocs `cloud_exercise` conservés possèdent bien un `assignment`, une aide (`hint`), une évaluation, une solution et des critères de rubrique dans le JSON. En revanche, leur champ `instructions` est vide et leur tableau `steps` est vide. Leur `environmentGuide` est identique et générique : ouvrir une nouvelle conversation avec un assistant personnel et ne transmettre ni clé API, ni donnée confidentielle ou personnelle. Chaque TP renvoie en outre au PDF de slides du chapitre comme ressource, sans fournir dans le bloc de TP une procédure opératoire détaillée [5].

Cette combinaison laisse à l’apprenant des décisions essentielles non guidées : choix et accès à l’outil autorisé, création et paramétrage de la conversation, formulation initiale de la demande, progression d’itération, format de la réponse à remettre et vérification avant soumission. Le constat est une **insuffisance de guidage**, directement observable dans le JSON ; il ne signifie pas que les TP sont techniquement impossibles. Les notes de source indiquent d’ailleurs que la cible d’import prévoyait une préparation d’environnement, des consignes structurées, une aide progressive, des critères apprenant et une correction masquée [2].

La préparation est également formulée comme un bloc global avant la première activité (« préparez un chatbot IA autorisé par votre organisation »), alors que les TP couvrent des tâches différentes : offres d’emploi, analyse RH, agents destinés aux employés et contrôles opérationnels. Le JSON ne décline pas cette préparation par TP. Il ne donne pas non plus de scénario de repli si l’apprenant ne dispose d’aucun assistant autorisé. Pour un cours destiné à une pratique dans son propre environnement, ces omissions rendent l’entrée en activité moins autonome, malgré la présence d’un énoncé métier et d’une évaluation.

## Dépendances, téléchargements et installation

Les preuves locales rapportent zéro laboratoire externe, zéro média externe et 47 références média accessibles via `/api/assets/`; le contrôle de production rapporte des réponses HTTP 200 et aucune URL DataCamp externe [1] [2] [3]. Le JSON utilise des chemins locaux `/api/assets/` pour l’audio, les sous-titres, les images et les PDF. Aucun défaut factuel de téléchargement cassé ou de consigne d’installation manquante ne peut donc être retenu. En revanche, le cours demande implicitement un assistant IA tiers/personnel pour les TP sans préciser une procédure d’installation ou d’accès par fournisseur ; il s’agit d’un **manque de cadrage apprenant**, non d’une dépendance externe techniquement défaillante démontrée par les preuves.

La langue de présentation est aussi partiellement incohérente : dans un cours `fr-FR`, les ressources des TP affichent `Chapter slides (PDF)` et une description anglaise dans les champs français. C’est un défaut éditorial observable dans le JSON, sans impact démontré sur la disponibilité du fichier [5].

## Correctifs génériques réutilisables

1. Ajouter au bloc standard de préparation de TP un encadré court « Accès et sécurité » : outil accepté, mode d’accès, données fictives autorisées, interdiction des secrets et solution de repli sans compte.
2. Remplacer l’instruction vide par une séquence standard en 4 à 6 étapes : ouvrir l’outil, coller le contexte fourni, exécuter le prompt de départ, itérer selon un critère, contrôler le résultat, puis soumettre une réponse structurée.
3. Ajouter une aide progressive réutilisable en trois niveaux : rappel de l’objectif, exemple de formulation, puis question de contrôle avant soumission.
4. Ajouter un bloc standard « Livrable attendu » précisant le format, la longueur indicative, les éléments obligatoires et une checklist d’auto-vérification.
5. Rendre le choix d’outil cohérent partout : soit outil imposé et accès documenté, soit formulation agnostique maintenue dans les transcripts, la préparation et les TP.
6. Localiser les libellés et descriptions de ressources dans la langue du cours, sans changer les chemins de téléchargement.

## Références

[1]: `docs/datacamp_ai_for_human_resources_alignment_2026-08-28.json` "Audit local d’alignement DataCamp / Neopolis"
[2]: `docs/datacamp_ai_for_human_resources_source_notes_2026-08-28.md` "Notes source — DataCamp AI for Human Resources"
[3]: `docs/datacamp_ai_for_human_resources_import_notes_2026-08-24.md` "Notes d’import — L’IA pour les ressources humaines"
[4]: `docs/ai_for_human_resources__01_card_sort_qa_2026-08-28.json` "QA locale du tri interactif 1.3"
[5]: `client/public/data/courses/ai_for_human_resources__01.json` "Cours Neopolis importé — fichier audité"
[6]: `docs/ai_for_human_resources_production_check_2026-08-28.md` "Contrôle de production — AI for Human Resources"

> Revue autonome réalisée sans consultation de DataCamp web et sans modification du fichier de cours.

**Gravité proposée : moyenne.** Le parcours et les interactions conservées sont fonctionnels selon les preuves locales, mais le manque de guidage détaillé touche les neuf TP pratiques et limite leur autonomie.
