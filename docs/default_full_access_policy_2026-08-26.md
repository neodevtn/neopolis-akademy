# Politique de groupe par défaut — Full access

## Règle

Tout compte actif sans appartenance à un groupe est rattaché au groupe système **Full access**. Cette règle ne remplace jamais une affectation existante : un apprenant déjà rattaché à un groupe restreint conserve exactement ce groupe et ses droits actuels.

| Flux | Comportement | Trace durable |
|---|---|---|
| Invitation sans groupe sélectionné | Lors de l’acceptation, le compte reçoit Full access | `learner_group_full_access_assigned`, source `invitation_fallback` |
| Création ou reconnexion de compte | Après l’enregistrement du compte, un contrôle ajoute Full access si nécessaire | `learner_group_full_access_assigned`, source `account_upsert` |
| Première ouverture d’un cours | Le contrôle d’accès ajoute Full access seulement si le compte n’a aucun groupe | `learner_group_full_access_assigned`, source `access_fallback` |
| Modification manuelle du groupe système | Seules les nouvelles affectations sont journalisées avec l’administrateur responsable | `learner_group_full_access_manually_assigned` |

## Réconciliation et contrôle

Wafa Nawech a été rattachée au groupe système Full access et son ouverture du cours Novasavo a été vérifiée dans une session navigateur dédiée, sans message d’accès refusé. La réconciliation a également ajouté Full access à tous les comptes actifs qui ne le possédaient pas déjà, sans retirer leurs autres groupes. Le journal apprenant contient un événement durable de réconciliation pour le compte concerné.

La même session Wafa a ensuite ouvert le cours Novasavo sur le domaine de production `akademy.neodev.click` après publication. La route s’est chargée et le message « accès non attribué » n’était pas présent.
