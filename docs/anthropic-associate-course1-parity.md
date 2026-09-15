# Claude Certified Associate — Cours 1 : matrice de parité et contrôle

> **Cours traité :** `claude_certified_associate_foundations__01` — **Claude Platform & Model Foundations**. La correction est limitée au premier cours Associate, conformément à la séquence imposée par le prompt du 14 septembre 2026.

## Objet de la correction

Le cours disposait déjà de dix écrans, de l’activité de tri et des onglets **Skills**, **Code Execution** et **Memory**. L’écart réellement constaté était l’absence de la durée officielle Skilljar et un titre catalogue amputé de son esperluette. La durée officielle est maintenant stockée dans la métadonnée générique `officialDurationMinutes`, affichée dans le lecteur et les cartes de parcours, distinctement de l’**estimation Neopolis**.

| Référence de consigne | État avant | Correction / vérification | État après |
|---|---|---|---|
| Titre canonique anglais | `Claude Platform Model Foundations` dans la carte | Normalisation en `Claude Platform & Model Foundations` | Conforme |
| Durée officielle | Estimation de lecture uniquement | `59 min` renseignées dans la métadonnée standard, le lecteur et la carte | Conforme |
| Écrans | 10 écrans | Aucune suppression ni fusion | 10 conservés |
| Onglets de capacités | Présents | **Skills**, **Code Execution**, **Memory** contrôlés | Conforme |
| Activité de tri | Présente mais non rejouée pour ce lot | Cinq associations soumises avec résultat **5/5 · Perfect!** | Conforme |
| Verrouillage | Suite bloquée avant soumission | Bouton suivant réactivé après correction parfaite | Conforme |
| Mobile | Non contrôlé dans ce jalon | Rendu 390 × 844 : durée, estimation, contenu et navigation visibles sans débordement | Conforme |

## Contrôles techniques

La règle de durée est couverte par `TrainingCourse.officialDuration.contract.test.ts`. Le test confirme la présence de la donnée officielle, la conservation des dix écrans, des trois onglets et de l’activité de tri. La vérification TypeScript et le test ciblé passent avant la validation complète.

## Contrôle public après publication

Le checkpoint `43dc3352` a été publié, puis rechargé depuis le domaine public après le signal de mise à jour. La carte de parcours publique affiche bien le titre canonique et **59 min**. Le lecteur public affiche simultanément **Official duration 59 min** et **Neopolis estimate 15–25 min** sur l’écran 4/10, avec les trois onglets de capacité et l’activité de tri toujours présente. Aucun cours Associate ultérieur n’a été modifié par ce jalon.

## Décision de périmètre

La différence entre **59 minutes officielles** et **15–25 minutes d’estimation Neopolis** reste explicitement visible ; elle n’est pas masquée ni substituée. Les interactions, la progression et le verrouillage existants sont préservés. Le cours Associate suivant n’est pas modifié dans ce jalon.
