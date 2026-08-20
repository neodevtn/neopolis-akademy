# Audit du cours n8n Neopolis — 20 août 2026

**Auteur :** Manus AI  
**Statut :** contrôle apprenant en cours

## Compteurs structurels

L’audit local du JSON `initiation_automatisation_workflows_n8n__01.json` confirme la structure attendue : **3 leçons/chapitres, 32 activités, 10 vidéos, 17 TP cloud_exercise, 3 bucket-sort, 2 QCM et 0 bloc download**. Les 58 références média locales du JSON utilisent toutes `/api/assets/`.

| Élément | Attendu depuis l’import DataCamp | Constat JSON Neopolis |
| --- | ---: | ---: |
| Chapitres | 3 | 3 |
| Activités | 32 | 32 |
| Vidéos | 10 | 10 |
| TP/labs | 17 | 17 |
| Tris interactifs | 3 | 3 |
| QCM | 2 | 2 |

## Premier contrôle de production

Sur le chapitre 1, activité 9/9, le lecteur affiche les consignes détaillées du TP « Capturer les inscriptions à un événement et leurs horodatages », les étapes et la zone de preuve. La progression affiche bien 1/3 leçons et 9/9 écrans pour cette leçon.

Un écart visuel est relevé : le panneau « Ce que votre travail doit montrer » rend encore des délimiteurs Markdown bruts (`**…**`) au lieu d’un texte enrichi. Cet écart est candidat à correction, car il nuit à la lisibilité du TP.

## Comparaison de l’activité 2

Le TP Neopolis « Explorez votre premier workflow n8n ! » porte les mêmes objectifs, la même progression en quatre étapes et la même valeur de 100 XP que l’exercice DataCamp authentifié. Il offre une alternative autonome documentée à la VM source : environnement n8n Cloud ou Docker, zone de preuve et correction verrouillée jusqu’à validation. La différence d’environnement est donc explicitée plutôt que masquée.

## Tri interactif

Le contrôle du tri « If vs. Switch » en production confirme un rendu propre des cartes et des catégories : les anciens encodages HTML et délimiteurs Markdown ne sont pas exposés. La session utilisée était déjà en mode révision avec une tentative historique partielle (4/6) et le bouton « Réessayer » disponible ; ce statut est propre à la session, pas au contenu du cours.

## Correctif appliqué

Le seul écart de rendu confirmé dans les TP était l’exposition de délimiteurs Markdown de gras dans certaines rubriques « Ce que votre travail doit montrer ». Les critères utilisent désormais le même rendu inline que le contenu pédagogique : gras, code et liens sont convertis en éléments accessibles. Le comportement est couvert par le test `CloudExerciseBlock.test.ts` et la suite complète passe avec 57 fichiers et 197 tests.
