# Programme de parrainage Neopolis Akademy

## Finalité

Le programme permet à chaque apprenant connecté de partager un **lien personnel** depuis son parcours, une formation ouverte ou la section de ses réussites. Le lien conserve son code de parrainage ainsi que les marqueurs d’origine du partage. Lorsqu’une personne soumet ensuite une candidature avec ce lien, la candidature et la conversion sont rattachées au parrain dans l’administration.

> Les mentions de **tokens gratuits** et de **cadeaux Neopolis** sont des promesses configurables. Elles ne constituent pas une attribution automatique : chaque récompense doit être validée explicitement dans l’administration.

## Données et traçabilité

| Élément | Usage | Protection contre les incohérences |
|---|---|---|
| `referral_campaigns` | Règles, message, promesses et activation du programme | Le nom de campagne est unique ; une campagne suspendue ne génère pas de nouveaux liens. |
| `referral_codes` | Un code personnel par apprenant et campagne | Unicité du code et de la paire apprenant/campagne. |
| `referral_conversions` | Lien entre parrain, candidature et état de récompense | Une candidature ne peut générer qu’une conversion. |
| `applications.referralCode` | Copie de l’attribution visible avec la candidature | Le code est normalisé et résolu côté serveur. |

Les liens utilisent `ref`, `utm_source=referral`, `utm_medium`, `utm_campaign=neopolis-referral` et `utm_content`. Les plateformes prises en charge sont WhatsApp, LinkedIn, Facebook, X et la copie directe du lien.

## Parcours opérationnel

Un apprenant copie ou partage son lien depuis le tableau de bord, une réussite ou une formation. Le destinataire arrive sur `/apply` avec les paramètres de suivi. Le formulaire retient ces paramètres de façon stable pendant la candidature puis les transmet à la procédure publique de soumission. Le serveur vérifie l’existence d’un code actif et évite l’auto-parrainage par adresse e-mail identique avant d’enregistrer une conversion au statut **À examiner**.

L’administrateur ouvre **Administration → Recrutement → Parrainage** (`/admin?tab=referrals`). Il peut modifier le message, les libellés de récompense, les conditions, activer ou suspendre le programme, consulter l’origine des candidatures et faire passer chaque conversion par les états `À examiner`, `Éligible`, `Récompensé` ou `Non retenu`. Une note de justification ou de référence de remise peut être enregistrée pour chaque décision.

## Contrôles effectués

| Contrôle | Résultat |
|---|---|
| Migration des tables et champs de parrainage | Appliquée sans opération destructive sur les données existantes. |
| Contrainte de campagne unique | Vérifiée après consolidation : 1 campagne, 1 nom distinct, 1 code actif de contrôle, 0 conversion initiale. |
| Tests des URL et codes | 3 tests Vitest réussis : normalisation, paramètres UTM et URLs de partage. |
| Vérification TypeScript | Réussie après les interfaces apprenant et administration. |
| Vérification visuelle | Réussie sur le parcours apprenant, les réussites et l’administration des parrainages. |

## Limites volontairement conservées

Le programme ne déclenche ni transfert de valeur ni envoi automatisé de tokens ou cadeaux. Cette séparation évite de présenter une récompense comme acquise avant l’examen des conditions, de la candidature attribuée et des règles commerciales applicables. Les administrateurs gardent donc la maîtrise de l’éligibilité et de la remise effective.
