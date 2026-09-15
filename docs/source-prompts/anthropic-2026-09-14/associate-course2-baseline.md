# Baseline — Claude Certified Associate Foundations cours 2

> Source de cadrage lue : `PROMPT_MANUS_ASSOCIATE_2026-09-14.md`, section « Prompting & Task Execution » ; audit PDF `AUDIT_ASSOCIATE_2026-09-14.pdf`, page 4.

## Périmètre confirmé

Le cours visé est `claude_certified_associate_foundations__02` avec une **durée officielle Skilljar de 53 minutes**, **9 chapitres** et **7 exercices interactifs**. Le prompt impose une correction **cours par cours**, sans toucher au cours suivant tant que le gate du cours courant n’est pas vert.

## Constats initiaux sur le JSON actuel

| Point contrôlé | Constat actuel | Impact attendu |
|---|---|---|
| Durée officielle | L’introduction affiche seulement `Estimated time: 15-25 minutes` | Ajouter `officialDurationMinutes: 53` et distinguer explicitement l’estimation Neopolis |
| Structure | 9 chapitres présents, avec progression séquentielle existante | Préserver la structure sans fusion inutile |
| Exemples de prompts | Les exemples faibles / forts et les boucles d’itération sont présents | Vérifier leur fidélité et leur lisibilité dans le rendu |
| Localisation | Plusieurs segments FR conservent des libellés anglais (`Weak prompt`, `Strong prompt`, prompt d’exemple en anglais, `Round 1 prompt`) ou des formulations peu naturelles (`Une build fonctionnelle`) | Nettoyage ciblé sans traduire les noms produits Anthropic |
| Checkpoint final | Le chapitre `Repair the Prompt` contient un bloc checkpoint, mais le texte FR expose aussi `Révéler la réponse du modèle` et `Ignorer pour l’instant` dans le corps | Vérifier si ces reliquats apparaissent dans l’UI et s’ils doivent être neutralisés |
| Quiz / synthèse | Le chapitre `Module 2` sert de quiz final, puis `Key Takeaways` et `Module Complete` ferment le cours | Vérifier l’ordre, le déverrouillage et la lisibilité finale |
| Exercices libres | Plusieurs corrections longues existent dans `exercises`, dont certaines semblent plus génériques que le cours | Vérifier qu’elles n’introduisent pas de dérive hors contexte ou de duplication visible |

## Constats issus de l’audit PDF

L’audit du 14 septembre 2026 ne signale pas une reconstruction structurelle du cours 2 ; il demande surtout de **vérifier la correspondance écran par écran, les exemples de prompts, les boucles d’itération et un checkpoint appliqué en fin de chapitre**. L’action prioritaire n’est donc pas de refondre le parcours, mais de corriger les écarts de durée, de terminologie, de lisibilité et de gate si nécessaire.

## Étapes d’audit suivantes

1. Contrôler le rendu navigateur du cours 2 en prévisualisation puis en public.
2. Vérifier le checkpoint `Repair the Prompt`, son verrouillage et les éventuels reliquats de libellés.
3. Relever précisément les segments de contenu/localisation à normaliser sans élargir le périmètre.
4. Ajouter les tests de non-régression adaptés avant publication.

## Contrôle de prévisualisation en cours

Le lecteur de prévisualisation affiche correctement le titre canonique, les deux durées et la nouvelle localisation du bloc **FlipCard** (`Carte`, `Retourner`) ; les cartes sont annoncées comme boutons. Après correction de la donnée française du comparatif, le fichier JSON contient bien le prompt faible traduit. Un premier rechargement a conservé l’ancienne chaîne en mémoire, mais une navigation documentaire vers le chapitre a confirmé le rendu du prompt français corrigé. L’activation `Entrée` d’une carte a été vérifiée : le focus est reçu et `aria-pressed` devient `true` après le cycle de rendu React, sans écriture de progression.

Le contrôle de la variante arabe confirme que le bloc standard affiche bien **`بطاقة`** et **`اقلب`** avec un rôle bouton et un libellé accessible localisé ; les contenus Associate eux-mêmes retombent volontairement sur l’anglais lorsqu’aucune traduction arabe n’existe, ce qui est distinct du correctif d’interface.

Le checkpoint `Repair the Prompt` a ensuite été contrôlé en prévisualisation : l’exercice manquant est désormais rendu comme un **Single Choice** avec quatre propositions, une réponse correcte unique et un état soumis. Une réponse incorrecte laisse l’exercice non validé ; son panneau de correction explique la réponse B ainsi que les insuffisances des trois distracteurs. Le compte apprenant de démonstration ne peut pas ouvrir le cours 2 tant que le cours 1 Associate n’est pas complété : le verrouillage entre cours est donc conservé. Le contrat automatisé vérifie que le checkpoint non enregistré bloque et que son identifiant enregistré débloque la navigation. Enfin, le repli arabe du badge est contrôlé : **Single Choice** est bien affiché à la place du faux libellé `Written Response`.

La règle de sélection est isolée dans un helper testé : une sélection de distracteur est refusée, une sélection correcte exacte est acceptée et une sélection partielle d’un choix multiple est refusée. Le callback de complétion du lecteur n’est donc appelé pour ce type de checkpoint que lorsque la configuration le demande et que la réponse est correcte.
