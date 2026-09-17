# Revue de contenu — `microsoft_copilot_in_word__01`

## Conclusion

Le cours est **partiellement aligné** avec les preuves locales. La reprise conservée est cohérente sur les interactions validées et les médias locaux, mais elle ne reproduit pas les 29 activités du paquet source : 24 activités sont présentes et cinq TP cloud ont été retirés. Le principal risque pédagogique restant concerne les neuf TP conservés : ils demandent une action dans l’environnement personnel de l’apprenant, sans procédure guidée structurée (`instructions` et `steps` vides dans le JSON). La pratique est donc **à compléter par un guidage de l’environnement apprenant** avant de la considérer comme pleinement autonome.

## Constats factuels

### Structure et séquence

Le JSON contient trois unités et 24 chapitres d’activité. Son bloc d’import annonce pourtant `activities_expected_from_outline: 29` et `activities_extracted: 29` (`client/public/data/courses/microsoft_copilot_in_word__01.json`, lignes 9–23). La preuve d’alignement locale distingue bien 29 activités source, 24 activités Neopolis, zéro activité manquante et cinq suppressions intentionnelles (`docs/datacamp_microsoft_copilot_in_word_alignment_2026-08-28.json`, lignes 12–23). Les suppressions correspondent aux TP cloud 1.3, 2.5, 2.6, 2.8 et 3.3, jugés non reproductibles faute de rubrique source (`docs/datacamp_microsoft_copilot_in_word_alignment_2026-08-28.json`, lignes 71–88, 301–318, 320–337, 360–377 et 443–460 ; `docs/datacamp_word_source_notes_2026-08-28.md`, lignes 3–6). Il s’agit d’une différence de périmètre documentée, et non d’une activité manquante non expliquée.

Les neuf TP cloud conservés sont identifiés comme candidats à une rubrique locale dans l’alignement ; ils disposent chacun d’un bloc `cloud_exercise` et d’une rubrique de critères (`explicitRubric: true`) (`docs/datacamp_microsoft_copilot_in_word_alignment_2026-08-28.json`, lignes 111–129, 195–213, 238–277, 379–397, 422–440, 546–564 et 567–606). Les tris, QCM, vidéos et téléchargements sont conservés selon les types déclarés par la preuve locale. Le contrôle de production confirme 24 activités, 14 exercices interactifs, 10 vidéos et 3 téléchargements ; il confirme aussi les neuf rubriques et les interactions déterministes validées (`docs/datacamp_word_production_check_2026-08-28.md`, lignes 3–10).

### TP et guidage dans l’environnement de l’apprenant

Le défaut observable directement dans le JSON est structurel : pour chacun des neuf TP cloud conservés, le champ `instructions` est vide et le tableau `steps` est vide (`client/public/data/courses/microsoft_copilot_in_word__01.json`, blocs `dc_1_act_05_tp`, `dc_1_act_09_tp`, `dc_2_act_02_tp`, `dc_2_act_03_tp`, `dc_2_act_09_tp`, `dc_3_act_02_tp`, `dc_3_act_08_tp`, `dc_3_act_09_tp` et `dc_3_act_10_tp`). Le guidage est reporté dans `assignment`, `hint` et `environmentGuide`. L’environnement est décrit de façon générique : utiliser un assistant IA génératif auquel l’apprenant a accès et ne pas partager de clé API ni de donnée confidentielle. Aucun TP conservé ne fournit ainsi un parcours pas à pas standardisé dans le champ prévu à cet effet.

Les indices donnent parfois un emplacement ou une action précise, par exemple un fichier dans `Desktop/Resources`, l’ouverture de Word, la sélection d’un paragraphe ou l’emploi d’une invite. Cependant, le JSON ne formalise pas de séquence `steps`, de prérequis vérifiables, de solution de secours si Word/Copilot n’est pas disponible, ni de procédure d’installation. Cette insuffisance est une observation de contenu et ne constitue pas une preuve que l’application échoue techniquement.

Les critères d’évaluation sont présents pour les neuf TP, mais ils évaluent principalement des résultats ou actions déclarés dans l’environnement externe. Le contrôle local confirme que le TP 3.2 possède des critères, un champ de réponse, une correction masquée et un verrouillage de navigation avant évaluation ; il ne transforme pas pour autant le champ `instructions` vide en tutoriel d’exécution (`docs/datacamp_word_production_check_2026-08-28.md`, ligne 7).

### Dépendances, téléchargements et installation

La dépendance externe explicitement déclarée dans les TP est l’accès personnel à un assistant IA génératif. Le JSON interdit le partage de clés API et de données confidentielles, mais ne prescrit pas de fournisseur ni de procédure d’installation (`client/public/data/courses/microsoft_copilot_in_word__01.json`, champ `environmentGuide` des blocs `cloud_exercise`). Les ressources de TP pointent vers des PDF de diapositives locales ; la preuve de production confirme trois téléchargements et des médias Projector locaux (`docs/datacamp_word_production_check_2026-08-28.md`, lignes 3 et 7). Aucune preuve locale consultée ne soutient l’existence d’un téléchargement de données apprenant, d’une installation de Copilot ou d’une dépendance à un laboratoire fournisseur. Les cinq TP retirés sont précisément ceux pour lesquels les notes locales refusent d’inventer une réponse libre ou des critères (`docs/datacamp_word_source_notes_2026-08-28.md`, lignes 3–6).

## Correctifs génériques réutilisables

1. Ajouter à tout bloc standard `cloud_exercise` une courte séquence `Préparer → Ouvrir → Exécuter → Vérifier → Soumettre`, avec un prérequis explicite, un point de reprise et une alternative lorsque l’outil externe n’est pas accessible.
2. Remplacer l’avertissement générique sur l’assistant IA par un encart d’environnement standard : outil autorisé, version ou interface attendue, emplacement du fichier, format de sortie et règle de non-divulgation des données.
3. Transformer chaque `hint` en étapes numérotées courtes, sans imposer un fournisseur externe : ouverture du document, action Copilot, contrôle humain du résultat, puis preuve attendue.
4. Ajouter à la rubrique standard un critère observable de vérification finale, distinct de la simple utilisation de l’IA, et conserver le verrouillage de soumission/navigation déjà validé par la QA.
5. Harmoniser le compteur d’import avec le périmètre réellement publié : afficher séparément activités source, activités conservées et suppressions intentionnelles, afin d’éviter la coexistence de `29 extraites` dans le cours et `24 publiées` dans la preuve de production.

## Références

[1]: `client/public/data/courses/microsoft_copilot_in_word__01.json` "JSON exact du cours audité"

[2]: `docs/datacamp_microsoft_copilot_in_word_alignment_2026-08-28.json` "Preuve locale d’alignement DataCamp–Neopolis"

[3]: `docs/datacamp_word_source_notes_2026-08-28.md` "Notes locales de source du cours Word"

[4]: `docs/datacamp_word_production_check_2026-08-28.md` "Contrôle local de production du cours Word"

[1] [2] [3] [4]
