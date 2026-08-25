# Import Novasavo — Automatisation comptable par l’IA

Le cours est généré depuis le manifeste autorisé Novasavo puis indexé sous **Finance & Comptabilité**. Il reprend les douze unités dans leur ordre et les transforme en écrans courts, avec navigation séquentielle plutôt qu’un long défilement.

| Contrôle | Résultat |
|---|---|
| Unités manifestées / importées | 12 / 12 |
| Écrans paginés | 83 écrans d’unité, plus 5 écrans d’examen final |
| Interactions inline obligatoires | 24 |
| Catégorie | Finance & Comptabilité |
| Contrôle navigateur apprenant desktop | Compte démo connecté : écran 1/17, écran 2/17 Mythe/Réalité, verrou avant réponse, feedback puis Suivant actif, écran 3/17 atteint |
| Contrôle navigateur mobile | 390×844 : navigation à une colonne, réponses et barre de navigation lisibles sur l’écran 2/17 ; la capture de prévisualisation est explicitement en mode révision |
| Contrôle de production antérieur | La route de production charge correctement le cours ; la publication de cette correction remplace l’ancienne unité 1 en 6 écrans |

L’unité 1 a été reconstruite en **17 écrans** courts, dans le déroulé autorisé : objectifs, Mythe/Réalité, explication, QCM, cycle comptable, diagramme, timeline, erreurs fréquentes, scénario PME, comparaison, synthèse, notes et passage à l’unité suivante. Les activités **Mythe ou réalité**, **QCM** et **Scénario** renvoient un feedback immédiatement, persistent dans l’unité et bloquent l’avancement avant réponse. Les points sont adressés aux événements de compétences de type `checkpoint_passed` **uniquement en cas de réponse correcte** ; aucun libellé XP n’est affiché. L’examen final est la treizième leçon et bénéficie donc du verrouillage séquentiel standard après les douze unités.

Les compteurs distinguent désormais explicitement les **12 unités** et l’**examen final** ; le lecteur affiche le compteur interne d’écran, par exemple `2/17`, sans mélanger ces notions. Le contrôle d’édition est conditionné au rôle administrateur et reste absent pour l’apprenant démo. La notification de mise à jour a été déplacée dans un toast discret et fermable par session afin de ne pas occulter l’activité.

## Correctif responsive mobile — contrôle du 25 août 2026

Le lecteur a reçu une contrainte de largeur commune aux pages de formation et aux blocs Novasavo : `width/max-width: 100%`, `min-width: 0`, `box-sizing: border-box` et absence de débordement horizontal. L’en-tête conserve seulement les icônes utiles sur mobile ; le libellé de déconnexion est masqué avant le breakpoint large. Les cartes, options QCM, assistant, notes et réponses longues coupent désormais leurs libellés au lieu d’élargir la page.

La navigation de bas d’écran passe sur une colonne mobile. L’instruction de passage et le bouton d’action occupent toute la largeur disponible et conservent un retour à la ligne lisible. Les contrôles ont été capturés aux deux formats demandés : **390×844** et **375×667**, sur l’écran Mythe/Réalité (2/17) et le QCM de l’écran 9/17. Les captures confirment que le header, les options, l’instruction et la navigation restent à l’intérieur du viewport. La prévisualisation identifie explicitement son contexte « Mode Révision » ; cette commande est absente de la session apprenant de contrôle.

Le paquet fourni contient le manifeste, la spécification de pagination et les éléments observés du lecteur. Les unités dépourvues d’export textuel complet ont été construites comme des écrans pédagogiques équivalents à partir de leurs intitulés et exigences de navigation ; elles ne doivent pas être présentées comme une transcription mot à mot de Novasavo.
