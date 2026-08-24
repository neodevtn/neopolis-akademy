# Vérification technique — Coder en mode Vibe avec Replit

## Constats de préparation

Le paquet est valide : somme SHA-256 reconstituée depuis les 50 parties, archive testée et 384 ressources locales recensées. Le manifeste confirme 4 chapitres, 33 activités et 14 leçons Projector.

Lors de la première vérification desktop, le lecteur a d’abord affiché son état de chargement, puis le catalogue, la navigation séquentielle et le premier écran ont été rendus. Cette seconde vérification a révélé que la consigne générique de préparation apparaissait encore à la place de la préparation spécifique Replit, car le titre bilingue du cours était traité comme une chaîne générique. La détection est corrigée avant régénération : le premier écran demandera explicitement à l’apprenant de préparer un compte Replit et de n’utiliser que des données de démonstration.

Après régénération et redémarrage, le contrôle desktop confirme que l’écran « Avant de commencer » affiche bien l’instruction spécifique de créer ou ouvrir un compte Replit, d’utiliser des données de démonstration et de ne jamais y placer de mots de passe, clés API ou données sensibles. La barre latérale montre les quatre leçons et le verrouillage séquentiel des trois suivantes.

Le contrôle mobile affiche correctement l’en-tête du cours, le premier chapitre, l’indicateur 1/10 et la consigne de préparation. Une tentative de capture automatisée de trois écrans profonds (QCM, tri et vidéo du chapitre 4) a échoué au niveau de la capture, sans erreur de serveur associée. Les structures de ces activités restent couvertes par le manifeste, l’audit et les tests unitaires ; une capture ciblée sera rejouée après la validation des logs de navigation.

## Contrôle de production

L’audit de production a contrôlé les **60 références média uniques** du cours en deux lots, à débit maîtrisé. Les 60 répondent correctement : 50 en HTTP 200 et 10 en HTTP 206 pour les réponses partielles de médias. Aucun 404, 429, média externe DataCamp ou chemin de stockage direct n’a été détecté.

Les contrôles TypeScript, la suite de tests et la validation de tous les JSON de cours ont réussi. Les 14 Projector, 6 QCM, 6 tris et 7 exercices visuels restent couverts par l’audit structurel et le test dédié.
