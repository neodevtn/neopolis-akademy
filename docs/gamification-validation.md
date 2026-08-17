# Validation — gamification, rangs et objectifs hebdomadaires

## Rangs administrables

Les rangs sont désormais stockés dans la base et administrables depuis **Administration → Contenu des cours → Gérer le catalogue**. Le référentiel initial contient cinq seuils : **À démarrer** à 0, **Émergent** à 5, **Bronze** à 10, **Argent** à 35 et **Or** à 70 points. Chaque rang peut être renommé, activé, réordonné, recoloré ou associé à une icône depuis l’administration ; les profils et le classement utilisent ces valeurs configurées.

## Objectif hebdomadaire

L’objectif initial est de 5 points internes par semaine. Il est calculé à partir des contributions de compétence vérifiées effectuées depuis le début de la semaine locale : aucune session, lecture ou tentative non validée n’ajoute de point. Le profil apprenant montre les points acquis, le reste à atteindre, une barre de progression animée et un signal visuel discret lorsque l’objectif est atteint. L’animation respecte `prefers-reduced-motion`.

## Communication transparente

Le libellé et le message affichés sont administrables. Le message par défaut précise que les points valorisent la progression interne dans Neopolis Akademy, mais ne constituent pas des crédits, tokens ni avantages Anthropic et ne sont pas convertibles. Cette formulation évite toute promesse de conversion non autorisée.

## Contrôles

La configuration de production contient les cinq rangs et l’objectif de 5 points. La compilation TypeScript est valide ; la suite locale comprend **131 tests** réussis et le validateur de cours retourne 0 erreur. Les 223 avertissements historiques de QCM proches restent non bloquants.
