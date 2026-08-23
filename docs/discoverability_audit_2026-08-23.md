# Audit de découvrabilité des fonctionnalités

## Constats confirmés

| Fonctionnalité développée | État actuel | Point d’entrée insuffisant | Correction prévue |
|---|---|---|---|
| Feedback formations — administration | Tableau de statistiques, filtrage, réponse et résolution disponible dans `AdminTraining` | L’onglet `feedback` est rendu mais absent de la sidebar, et le mécanisme de synchronisation d’URL ne le conservait pas de manière exhaustive. | Ajouter l’entrée **Feedback formations** dans le groupe *Apprenants* de la navigation persistante et reconnaître l’onglet dans la navigation directe. |
| Feedback formations — apprenant | Formulaire complet de notation et suggestion disponible | Le formulaire apparaît seulement dans le bandeau de fin de cours, ce qui masque la possibilité de transmettre une suggestion en cours de formation. | Ajouter un accès contextuel discret **Donner un avis / une suggestion** dans le parcours de cours, sans contourner les règles de notation post-complétion. |
| Diagnostic d’orientation | Routes `/diagnostic` et `/diagnostic-avance` développées | Aucun lien global direct identifié. | Rattacher les diagnostics au point d’entrée *Mon orientation* et signaler les routes historiques comme accès avancés contextualisés. |
| Diagnostic avancé | Page spécialisée développée | Visible uniquement par URL directe. | Ajouter un lien contextualisé depuis la fin du diagnostic initial lorsque l’apprenant est éligible. |

## Fonctionnalités déjà correctement exposées

Les acquis, compétences, parcours recommandé, catalogue et communiqués disposent d’onglets apprenant. Les contenus, médias, erreurs client, apprenants, invitations, reporting, communications et journal d’activité ont déjà une entrée d’administration persistante. Les écrans automatiques — communications importantes, célébrations d’acquis et notification de nouvelle version — sont volontairement déclenchés par contexte plutôt que par menu.

## Validation de l’implémentation

Le lien `Feedback formations` est maintenant ajouté à la navigation administrateur persistante et ouvre directement `/admin/training?tab=feedback`. L’onglet est reconnu par la synchronisation d’URL, ce qui permet de partager et de rouvrir le tableau de traitement. Le parcours apprenant comporte désormais un bouton d’en-tête `Avis` qui ouvre le formulaire existant dans une fenêtre contextuelle, même avant la fin du cours.

Les tests de régression vérifient les deux points d’entrée. La vérification interactive du tableau admin requiert un compte administrateur ; la session de prévisualisation non authentifiée redirige correctement vers la connexion, ce qui confirme au moins que la protection d’accès reste active.
