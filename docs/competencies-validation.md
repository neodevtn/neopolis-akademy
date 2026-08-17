# Validation — compétences graduées et contributions administrables

## Référentiel initial

Le référentiel actif comporte neuf compétences graduées sur une échelle de 0 à 100 : Prompt engineering, Conception de solutions IA, Développement IA, RAG et bases de connaissances, Orchestration IA, DevOps et fiabilité IA, BI et analyse de données par IA, Gouvernance et sécurité IA, et Stratégie et adoption IA.

Chaque compétence dispose d’un titre bilingue, d’une catégorie, d’une description, d’une couleur et d’un maximum de 100 points. Les règles sont administrables depuis **Administration → Contenu des cours → Gérer le catalogue**, sous les métadonnées du catalogue. Une règle associe une source, un identifiant facultatif de contenu, un score minimal et une contribution positive, y compris des valeurs fractionnaires comme 0,5 ou 1,5 point.

## Sources et traçabilité

Les contributions sont créées uniquement après une réussite persistée : leçon terminée, exercice réussi, QCM de leçon, QCM de chapitre/checkpoint, cours complété, badge obtenu ou certification obtenue. Chaque contribution conserve sa règle, sa source, son événement unique, son score éventuel, son nombre de points et ses éléments de preuve. L’unicité `(apprenant, règle, événement)` empêche le double comptage.

Les avancées historiques ont été reprises sans génération de données fictives. Le contrôle de base relève 224 contributions pour 18 apprenants. Les niveaux actifs restent plafonnés à 100 par compétence même si la somme des contributions est supérieure.

## Résultat des contrôles

Le tableau de bord apprenant contient l’onglet **Mes compétences** avec niveaux, barres de progression et détail dépliable des gains. La fiche détaillée côté administration affiche la même synthèse par apprenant. La compilation TypeScript est valide ; la suite locale compte **127 tests** réussis et le validateur de cours retourne 0 erreur. Les 223 avertissements historiques de QCM proches restent non bloquants.
