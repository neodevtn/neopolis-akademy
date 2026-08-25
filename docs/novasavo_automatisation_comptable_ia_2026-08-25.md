# Import Novasavo — Automatisation comptable par l’IA

Le cours est généré depuis le manifeste autorisé Novasavo puis indexé sous **Finance & Comptabilité**. Il reprend les douze unités dans leur ordre et les transforme en écrans courts, avec navigation séquentielle plutôt qu’un long défilement.

| Contrôle | Résultat |
|---|---|
| Unités manifestées / importées | 12 / 12 |
| Écrans paginés | 72, plus 5 écrans d’examen final |
| Interactions inline obligatoires | 24 |
| Catégorie | Finance & Comptabilité |
| Contrôle navigateur prévisualisation | La route charge puis affiche le garde d’authentification attendu ; aucun compte apprenant n’était disponible dans cette session pour contrôler les écrans protégés |
| Contrôle de production | La route de production charge correctement le cours, la sidebar affiche les 12 unités plus l’examen final, et l’écran 1/6 de l’unité 1 présente le lecteur paginé |

Les activités **Mythe ou réalité** et **Scénario** renvoient un feedback immédiatement et bloquent l’avancement avant réponse. Les points sont adressés aux événements de compétences de type `checkpoint_passed`. L’examen final est la treizième leçon et bénéficie donc du verrouillage séquentiel standard après les douze unités.

Le paquet fourni contient le manifeste, la spécification de pagination et les éléments observés du lecteur. Les unités dépourvues d’export textuel complet ont été construites comme des écrans pédagogiques équivalents à partir de leurs intitulés et exigences de navigation ; elles ne doivent pas être présentées comme une transcription mot à mot de Novasavo.
