# Règles d’intégration DataCamp — cours n8n

**Auteur :** Achraf Khelil  
**Statut :** critères obligatoires d’audit et d’évolution

Le cours « Initiation à l’automatisation de workflows avec n8n » doit rester fidèle au contenu DataCamp importé tout en étant exécutable hors de l’environnement DataCamp. Les activités s’appuient exclusivement sur les blocs standard Neopolis Akademy ; toute évolution passe par l’enrichissement rétrocompatible de la bibliothèque, jamais par du HTML ou une interface ad hoc injectée dans les données de cours.

| Critère | Exigence de conformité |
| --- | --- |
| Bibliothèque standard | Chaque activité utilise un type de bloc du registre central et reste éditable depuis l’administration. |
| Compétences | Les leçons portent des tags de compétences ; seuls les exercices, QCM, checkpoints, badges et certifications alimentent les points. |
| Médias | Les vidéos, audios, diapositives, PDF et illustrations sont servis localement via `/api/assets/` et contrôlés en production. |
| TP autonomes | Chaque TP rappelle le prérequis n8n, propose n8n Cloud et Docker local, expose les étapes et une zone de preuve, puis masque correction et feedback avant soumission. |
| Ressources DataCamp VM | Lorsqu’un fichier VM ne peut pas être téléchargé légalement, le cours le signale, indique son nom et explique comment le reconstruire depuis l’énoncé, les étapes, les indices et la correction. |

Ces règles sont applicables aux futurs imports DataCamp et aux enrichissements du cours n8n existant.

## Résultat du contrôle n8n

Le contrôle du 20 août confirme que les 33 blocs du cours n8n appartiennent à la bibliothèque standard Neopolis Akademy, sans type non pris en charge. Les trois leçons portent des tags de compétences qui couvrent notamment `ai_orchestration`, `ai_development`, `ai_solution_design`, `prompt_engineering`, `rag_knowledge`, `ai_business` et `ai_devops`. Les règles actives attribuent des points uniquement après réussite d’un exercice, d’un quiz ou d’un checkpoint, conformément au modèle de compétences graduées.

Les 17 TP partagent maintenant un composant standard enrichi : préparation n8n Cloud ou Docker, étapes détaillées, zone de preuve, correction verrouillée, support PDF local du chapitre et rappel des fichiers de VM DataCamp à reconstruire lorsque leur téléchargement n’est pas possible. Les 49 références média distinctes ont été validées en production.
