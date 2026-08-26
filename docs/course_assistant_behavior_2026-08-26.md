# Correctif de l’assistant pédagogique — 26 août 2026

## Comportement attendu

L’assistant pédagogique répond à la question effectivement écrite par l’apprenant. Le contexte du bloc est une référence de cours uniquement : il ne peut ni remplacer la question, ni être déroulé comme une réponse modèle. Une demande manifestement hors périmètre reçoit un refus bref et un recentrage vers le contenu de l’écran.

| Cas contrôlé | Résultat attendu | Résultat vérifié |
|---|---|---|
| Demande hors périmètre | Refus court, sans réponse préremplie | Validé |
| Question pédagogique réelle | Réponse contextualisée à la question saisie | Validé |
| Réponse longue | Aucun `max-height` ni défilement interne bloquant | Validé |
| Markdown de réponse | Paragraphes, listes et emphases lisibles ; aucune syntaxe `**` brute | Validé |
| Session apprenant | Aucun contrôle « Mode Révision » ou « Modifier cet écran » | Validé |
| Session administrateur | Contrôle d’édition visible | Validé |

La sonde `pnpm check:course-assistants` inventorie les 12 panneaux d’assistant du cours Novasavo, rejoue les deux cas de réponse sur mobile et contrôle la séparation apprenant/administrateur. La capture mobile associée montre une réponse intégrale, rendue en liste ordonnée lisible et sans troncature.
