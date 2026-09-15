# Developer Foundations — cours 1 : matrice de parité

| Écran Neopolis | Section Skilljar couverte | Bloc standard | Statut | Preuve attendue |
|---:|---|---|---|---|
| 1 | MSO Foundations — introduction | `content` | adapté | MSO défini, durée officielle 57 min |
| 2 | How LLMs Behave | `content` + `checkpoint` | adapté | tokens, contexte, échantillonnage, non-déterminisme |
| 3 | Models & Reasoning | `content` + `checkpoint` | adapté | choix modèle/raisonnement, coût, latence |
| 4 | Prompting Modes | `content` + `checkpoint` | adapté | zero-shot, one-shot, multi-shot |
| 5 | Technical Substrate | `content` + `checkpoint` | adapté | SDK, REST, streaming, AsyncAnthropic, Message Batches |
| 6 | Module quiz | cinq `single_choice_exercise` | présent | corrections associées au quiz |
| 7 | Predict the Behavior | `flip_cards` + `checkpoint` | adapté | scénario de prédiction, sans exercice concaténé |
| 8 | Recap | `content` | adapté | titres français localisés |
| 9 | Reference resources | `content` | exclu_justifié | tutoriels vidéos génériques non sourcés retirés |
| 10 | Module complete | `content` | présent | fin de module et navigation |

## Lot de correction Claude Sonnet

L’audit Claude Sonnet a établi : une durée d’introduction erronée, MSO non défini, deux chaînes tronquées, des reliquats de localisation, six fragments d’exercices racine et sept recommandations vidéo génériques sans provenance de cours. Les cinq checkpoints de remplacement sont générés par Claude Sonnet sur les notions déjà enseignées et rendus exclusivement par le bloc standard `ExerciseRenderer`. Le quiz de module intégré est conservé.

## Contrôles de clôture attendus

Avant clôture : test de contrat, validation complète unique, index de recherche régénéré, canal tRPC public `no-store`, revue navigateur des écrans 1, 2, 5, 6, 7, 9 et 10, puis console sans erreur. Le verrou chapitre doit être prouvé dans une session apprenant ; le mode de revue admin ne suffit pas à le démontrer.

## Prévisualisation avant publication

L’introduction rend la définition de **MSO** et la durée officielle de **57 minutes**. Le premier écran pédagogique rend le checkpoint `Gérer la capacité de contexte` dans `ExerciseRenderer`. La correction de structure supprime le sommaire de sous-titres doublé et le reliquat « The fenêtre de contexte » ; les cartes et le checkpoint restent inchangés.

## Contrôle public après checkpoint `fa5db915`

Le canal tRPC public répond HTTP 200 avec `Content-Type: application/json; charset=utf-8` et `Cache-Control: no-store, max-age=0`. La donnée fraîche contient dix écrans, la durée officielle de 57 minutes, les cinq checkpoints `single_choice` obligatoires et les ressources de référence sans repli vidéo générique. Dans le lecteur public, l’introduction affiche la définition complète de **MSO** et la durée officielle ; l’écran LLM affiche le contenu localisé sans sommaire de sous-titres dupliqué ni reliquat « The fenêtre de contexte ». Son checkpoint standard est présent avec quatre options et le bouton de navigation reste verrouillé avant réponse.

Le quiz de module contient ses cinq questions, avec l’option sur le tokenizer désormais complète ; la navigation affiche bien la consigne de validation tant qu’aucune réponse n’est soumise. L’écran **Prédire le comportement** ne contient plus la carte `Sources` générique : ses six cartes de révision sont présentes et le checkpoint de scénario est associé au chapitre correct. La navigation est verrouillée tant que les cartes obligatoires ne sont pas retournées.

Les écrans **Ressources de référence** et **Module terminé** affichent uniquement une orientation vers la documentation officielle et la suite du parcours : aucune recommandation vidéo générique n’est visible. La console de la revue publique est vide. Les écrans ont été ouverts en mode révision pour préserver la progression du compte ; les règles de verrouillage des checkpoints restent couvertes par le contrat `ExerciseRenderer` et le contrat de cours.
