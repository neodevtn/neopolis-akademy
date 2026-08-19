# Vérification de navigation — orientation incomplète

## Constat de reproduction

Le compte de démonstration a été ouvert avec une orientation non finalisée : le bandeau « Votre orientation personnalisée est à finaliser » est visible, ainsi que l’action « Finaliser mon orientation ».

La route directe `/training?tab=catalog` a affiché le catalogue sans redirection vers l’accueil. Un clic sur « Mes acquis » a ensuite remplacé l’URL par `/training?tab=achievements` et a affiché les badges et diplômes. La navigation est donc maintenue lorsque l’orientation est incomplète.

## Raison du renforcement

La logique de navigation est désormais isolée dans `learnerDashboardNavigation.ts`. La politique déclarée ne dépend pas de `user.createdAt` et garantit explicitement `canUseAllTabs: true`, tout en affichant le rappel d’orientation requis.

## Contrôle après correction

Avec le bandeau d’orientation toujours visible, l’URL directe `/training?tab=skills` a ouvert l’onglet **Mes compétences**. Un clic sur **Catalogue** a changé l’URL en `/training?tab=catalog` puis le contenu en catalogue. Les deux actions se sont effectuées sans redirection vers la page d’accueil ni remise forcée sur l’orientation.

## Production

Après publication de la version `852438f2`, l’URL `https://akademy.neodev.click/training?tab=skills&build=852438f2` a ouvert **Mes compétences** pour un compte dont l’orientation est encore à finaliser. Le bandeau de production indique explicitement que tous les onglets restent disponibles et ne renvoie pas le compte vers l’accueil.

Le clic sur **Catalogue** a ensuite remplacé l’URL de production par `https://akademy.neodev.click/training?tab=catalog` et affiché les catégories et cartes du catalogue. L’orientation est restée visible comme priorité, sans bloquer ni annuler la navigation.
