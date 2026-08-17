# Validation — édition contextuelle depuis le parcours apprenant

Un administrateur authentifié voit désormais le bouton **Modifier cet écran** dans l’en-tête du chapitre qu’il consulte. L’action est absente pour les autres rôles et ouvre l’éditeur de contenu dans un nouvel onglet.

La destination transmet le cours, la leçon et le chapitre affichés, selon le format `courseId`, `lesson` et `chapter`. La vérification visuelle a confirmé la présence du bouton dans le lecteur classique et l’ouverture de l’éditeur directement sur *Introduction du module*, pour la leçon et le chapitre ciblés.

La construction du lien est couverte par deux tests unitaires, notamment pour l’encodage de l’identifiant du cours et la normalisation des index. La compilation TypeScript et la suite locale comportant **98 tests** réussissent ; le contrôle réseau Resend est volontairement exclu, car il dépend d’un appel externe et n’est pas lié à cette évolution.
