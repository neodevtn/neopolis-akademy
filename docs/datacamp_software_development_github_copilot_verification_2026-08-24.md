# Vérification technique — Développement logiciel avec GitHub Copilot

**Auteur : Achraf Khelil**  
**Date : 24 août 2026**

## Paquet source vérifié

Le paquet Drive découpé a été reconstitué depuis ses 20 parties. Chaque partie a passé sa vérification SHA-256, puis l’archive de 311 238 320 octets a été validée par sa somme SHA-256 canonique `eccf9810362ed71abb53fd06877b846e42a18a352acaf7664e6869a1a975f0b1` et par `unzip -t`.

| Contrôle | Résultat |
|---|---:|
| Chapitres | 4 / 4 |
| Activités | 40 / 40 |
| Leçons Projector | 13 / 13 |
| QCM source | 8 / 8 |
| Tris interactifs | 13 / 13 |
| Exercices visuels | 6 / 6 |
| Ressources locales du paquet | 251 / 251 |
| Supports visuels locaux complémentaires | 6 / 6 |

## Contrôles de rendu et d’interactivité

Le cours est classé dans **Ingénierie IA full-stack** et les quatre chapitres sont visibles dans la navigation latérale, avec un verrouillage des chapitres suivants. La capture desktop complète sur l’activité 4/9 du premier chapitre confirme le rendu du QCM visuel « Surlignez, demandez, c’est fait » : l’image locale de code annoté est affichée au-dessus des options, l’indice est replié, le bouton « Vérifier » est présent et la navigation suivante demeure désactivée tant que l’activité n’a pas été validée.

Les six images associées aux `VisualExercise` sont désormais téléchargées depuis les références canoniques DataCamp, conservées localement, téléversées dans la bibliothèque média et attachées au bloc `multi_choice_exercise` via une URL `/api/assets/`. Le composant QCM standard affiche cette image de contexte avant la question ; aucune URL DataCamp externe n’est publiée.

La capture mobile à 375 px confirme que l’en-tête, le compteur de leçons, le titre, l’image de contexte, les options, l’indice, le bouton de validation et le verrouillage de navigation restent lisibles sans débordement horizontal. Le QCM visuel conserve la même hiérarchie que sur desktop.

| Type source | Rendu Neopolis | Contrôle |
|---|---|---|
| `VideoExercise` | Projector MP4, slides, transcript, PDF | 13 blocs ; timings et transcript présents |
| `PureMultipleChoiceExercise` | QCM interactif | feedback et correction après tentative |
| `DragAndDropExercise` | `bucket_sort` | 13 tris interactifs |
| `VisualExercise` | QCM visuel standard | 6 images locales attachées |

## Validation technique en cours

Le typage TypeScript est valide. La suite complète exécute **84 fichiers de test et 315 tests réussis**. L’index de recherche contient l’entrée de la certification GitHub Copilot.

Après publication, l’audit HTTP de production a contrôlé les **195 références média uniques** en sept lots à débit maîtrisé. Les 195 références répondent **HTTP 200**, sans 404, 429 ni URL DataCamp externe publiée.
