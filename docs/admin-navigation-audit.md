# Audit de navigation administrative

## Constat initial

Le menu administratif horizontal présentait cinq accès de même niveau. Il mêlait recrutement, suivi des apprenants, gestion pédagogique et contrôle opérationnel. Les onglets internes du suivi apprenants répétaient également les mêmes destinations, ce qui rendait la hiérarchie ambiguë.

## Architecture appliquée

La navigation est désormais persistante sur desktop et organisée par flux de travail : **Recrutement**, **Apprenants**, **Pédagogie** et **Contrôle**. Les sous-sections du suivi apprenants sont atteignables directement par URL, avec le bon onglet actif. Sur mobile, le même regroupement est disponible dans un menu compact.

| Groupe | Destinations | Intention du parcours |
|---|---|---|
| Recrutement | Candidatures, Candidats sélectionnés | Évaluer une candidature puis activer et relancer les personnes retenues. |
| Apprenants | Suivi, Invitations directes, Reporting | Accompagner les comptes actifs, gérer les invitations hors candidature puis analyser les résultats. |
| Pédagogie | Contenu des cours, Bibliothèque médias | Concevoir les formations et administrer les ressources qu’elles utilisent. |
| Contrôle | Erreurs client | Détecter, qualifier et traiter les incidents de production. |

## Vérifications visuelles

Les vues de l’éditeur de contenu et du reporting d’apprentissage ont été contrôlées. La barre latérale reste visible, l’élément actif est identifiable et le reporting n’affiche plus les onglets internes redondants ni l’action d’invitation hors contexte.

Les parcours **Suivi des apprenants** et **Invitations directes** ont aussi été contrôlés au format mobile. Le menu compact remplace la barre latérale et les onglets dupliqués ont été retirés. Les actions sont contextualisées : export pour le suivi des apprenants, invitation pour les invitations directes.
