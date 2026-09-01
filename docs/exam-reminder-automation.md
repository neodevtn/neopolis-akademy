# Relance automatique des examens blancs

## Finalité et fréquence

Le traitement quotidien cible uniquement les formations présentes dans la clé canonique `trainingIndex.examConfig`. Il s’exécute à **09:00 UTC** et adresse au maximum **une relance par apprenant et par formation certifiante**. Il ne crée pas d’examen et ne déduit aucune information pédagogique hors du catalogue déclaré.

## Conditions cumulatives d’éligibilité

| Condition | Règle appliquée |
| --- | --- |
| Formation concernée | Une configuration d’examen blanc existe réellement dans le catalogue. |
| Compte destinataire | Compte non bloqué et adresse e-mail non vide. Un administrateur qui apprend reste éligible selon sa propre progression. |
| Parcours terminé | Chaque cours rattaché à la formation est terminé selon la sémantique de l’interface apprenant. Pour un cours mono-leçon composé de plusieurs écrans, le dernier écran doit être atteint ; une ancienne progression ambiguë ne suffit jamais. |
| Délai de stabilité | La dernière complétion nécessaire est datée d’au moins 24 heures. |
| Tentative | Toute ligne `exam_attempts`, réussite ou échec, bloque définitivement la relance. Une session d’examen active ne compte pas comme une tentative. |
| Historique de relance | Toute ligne `exam_reminders`, quel que soit son statut, bloque définitivement une seconde relance. |

## Garantie anti-doublon

Avant tout appel au fournisseur e-mail, le traitement insère de façon atomique une ligne `exam_reminders` avec la contrainte unique `(userId, certificationId)`. Une reprise automatique du callback, une exécution concurrente ou une réponse tardive ne peut donc pas réclamer une seconde fois la même paire.

> En cas de panne ambiguë du fournisseur après le claim, le statut est conservé comme trace d’échec et le traitement ne réessaie pas automatiquement. Ce choix privilégie explicitement l’absence de spam plutôt qu’un deuxième envoi potentiellement reçu par l’apprenant.

Quand le fournisseur confirme l’acceptation, le message est marqué `sent`, son identifiant fournisseur est conservé et un événement pédagogique `exam_reminder_sent` est enregistré. Les réponses HTTP et les journaux opérationnels ne retournent ni adresse e-mail, ni contenu de message, ni secret.

## Contenu du message

Le courriel provient de **Neopolis Akademy `<info@neopolis-dev.com>`**. Il est disponible en français et en anglais ; le français est le repli actuel lorsque le profil ne porte pas de préférence de langue. Le message contient le titre de la formation et, lorsqu’elles sont déclarées, les métadonnées canoniques de l’examen : nombre de questions, durée et seuil. Son appel à l’action pointe vers :

`https://akademy.neodev.click/mock-exam/<certificationId>`

## Exploitation du job

Le callback HTTP est `POST /api/scheduled/exam-reminder`. Il accepte uniquement une identité de tâche planifiée authentifiée, dont l’identifiant est enregistré dans `scheduled_job_registry` sous la clé stable `exam_reminder_daily`. Après déploiement, le job projet doit être créé avec l’expression UTC à six champs :

```text
0 0 9 * * *
```

La tâche est ensuite vérifiable et administrable depuis l’outil de planification du projet. Toute modification du callback exige un nouveau déploiement avant reprise du job.
