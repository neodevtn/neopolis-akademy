# Rapport de remédiation — Claude Certified Architect Foundations

**Date :** 18 septembre 2026  
**Périmètre :** uniquement les sept cours du parcours **Claude Certified Architect – Fondations**.

## Objet de l’intervention

Le paquet d’audit a été appliqué sans reprendre le contenu des autres parcours. L’intervention a supprimé les leçons identifiées comme vides, retiré leurs entrées de navigation associées et resynchronisé les compteurs du catalogue avec les activités réellement publiées. La correction est déterministe : elle peut être rejouée sans réintroduire les écrans supprimés ni modifier les autres cours.

Une anomalie de sécurité a également été corrigée pendant la revue finale. Des corrections, grilles d’évaluation et clés de réponses pouvaient encore se trouver dans les fichiers JSON de cours servis au navigateur. Elles sont maintenant conservées dans un registre serveur, et le JSON apprenant ne contient que la consigne, les choix et l’indicateur `serverCorrectionRequired`.

## Résultats fonctionnels

| Indicateur contrôlé | Résultat |
|---|---:|
| Cours Architect Foundations couverts | 7 |
| Activités/écrans publiés | 377 |
| Vidéos répertoriées | 30 |
| Téléchargements répertoriés | 143 |
| Blocs de checkpoint rattachés | 89 |
| Définitions de corrections protégées côté serveur | 108 |
| Checkpoints dupliqués | 0 |
| Checkpoints sans exercice rattaché | 0 |
| Exercices requis non rendus | 0 |
| Ressources sans métadonnées requises | 0 |

Les corrections ne sont renvoyées qu’après une soumission authentifiée et effectivement enregistrée. Les exercices textuels sont validés comme remises serveur ; les exercices à choix sont corrigés par rapport à la clé serveur. Une réponse non valide reste visible pour révision avec son retour pédagogique, mais ne déverrouille pas l’étape suivante. L’état de soumission et l’accès autorisé à la correction sont relus depuis le serveur lors d’une reprise de parcours, ce qui évite de dépendre du navigateur local.

## Vérifications réalisées

La validation locale a confirmé que les sept routes de cours répondent HTTP 200 et que les 143 ressources cataloguées répondent HTTP 200. Le vérificateur de confidentialité a contrôlé les deux voies accessibles au navigateur — API de données de cours et fichiers statiques — sur les sept cours : **14 contrôles réussis**, **108 checkpoints marqués protégés** et **zéro champ de correction, grille, réponse modèle ou clé de choix exposé**.

La revue visuelle a confirmé l’affichage d’un écran d’exercice standard Neopolis sans correction avant soumission. La navigation séquentielle est conservée : aucune nouvelle exception de progression n’a été ajoutée.

| Suite de validation | Résultat |
|---|---|
| TypeScript (`pnpm check`) | Réussi |
| Contrats ciblés de protection et de remédiation | 41 tests réussis |
| Régression complète (`pnpm test`) | 931 tests réussis, 2 ignorés |
| QA de publication (`pnpm qa:publish`) | 9 contrôles sur 9 réussis |
| Vérification des assets Architect | 143/143 disponibles |

> Les avertissements de qualité non bloquants relevés par le validateur global de quiz concernent d’autres banques de questions. Ils n’empêchent pas la validation de ce périmètre et aucune modification hors Architect Foundations n’a été effectuée.

## Traçabilité

Le script `scripts/remediate_architect_foundations_empty_lessons.mjs` applique la suppression structurée et la synchronisation des compteurs. Le script `scripts/protect_architect_foundations_corrections.mjs` produit le registre de corrections côté serveur à partir des données de cours vérifiées. Le contrôle `scripts/verify_architect_foundations_learner_confidentiality.mjs` vérifie ensuite l’absence de tout champ sensible dans les payloads apprenants.

La publication publique demeure dépendante de la plateforme de déploiement. Ce rapport établit uniquement la conformité locale, le build et les contrôles automatisés ; il ne conclut pas qu’une version est publique avant contrôle effectif du domaine canonique.
