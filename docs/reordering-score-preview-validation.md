# Validation — réorganisation et aperçu de score

Les gestionnaires de questions et d’écrans présentent une poignée de glisser-déposer, en complément des commandes de déplacement accessibles au clavier. Le déplacement réutilise la même opération de réorganisation sûre que les contrôles existants ; les indices actifs sont actualisés après le changement d’ordre.

Le panneau de banque QCM inclut un aperçu avant publication. Il présente le score requis, son pourcentage, le nombre de questions tirées, la taille de la banque et l’état du mélange des réponses. Les règles sont normalisées avant sauvegarde : le seuil est toujours compris entre une bonne réponse et le nombre de questions affichées.

Le contrôle visuel du cours `claude_certified_associate_foundations__01` confirme le retour de sa banque réelle de 11 QCM après correction de la source du brouillon. La compilation TypeScript est valide, et **120 tests** locaux réussissent. Le validateur de cours retourne 0 erreur ; les avertissements existants de QCM proches restent non bloquants.
