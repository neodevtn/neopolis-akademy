# Contrôle du centre d’assistance unifié

## 13 septembre 2026 — lecteur de cours

Le contrôle visuel du lecteur a identifié deux appels à l’action flottants concurrents : le bouton historique de TekTek et le nouveau bouton global « Besoin d’aide ? ». Cette coexistence ne respecte pas l’objectif d’un point d’entrée unique. Le bouton flottant TekTek et son rappel automatique ont donc été supprimés. Le panneau TekTek reste disponible exclusivement via « Besoin d’aide ? » > « Demander à TekTek » ; il conserve son contexte de cours, les citations et les garde-fous pédagogiques.

Le centre global reste visible dans le lecteur, sans masquer le bouton Suivant ni les contrôles de contenu. Il constitue désormais l’accès unique aux conversations, au signalement technique et au coach de cours.

La prévisualisation du lecteur confirme qu’un seul bouton flottant « Need help? » est rendu, en bas à droite. Le bouton flottant TekTek a disparu. Le CTA ne chevauche pas la navigation de leçon, tandis que TekTek reste ouvrable depuis le nouveau centre.

Le centre ouvert présente distinctement quatre actions : signalement technique, nouvelle conversation avec Neopolis, conversations ouvertes et TekTek. Chaque action possède une description qui explique son périmètre, tandis que le centre de notifications reste accessible dans son en-tête. Les libellés anglais ont été contrôlés dans la session de prévisualisation.

L’action « Ask TekTek » a ouvert le coach contextuel dans le lecteur et a affiché son historique, ses citations et son champ de question. Le relais de l’action « New conversation with Neopolis » a également été déclenché localement sans soumettre de message ; l’ouverture de son composeur est vérifiée séparément avant publication.

Le contrôle confirme que l’action TekTek du centre ouvre bien le panneau contextuel. Le test d’événement direct de nouvelle conversation n’ouvre pas un composeur lorsque la session active porte un rôle administratif : ce cas est volontairement redirigé par le centre vers l’inbox admin avec le paramètre de création. Le parcours réel de la carte du centre est donc contrôlé côté administration séparément, sans créer de conversation.

Après fermeture de TekTek, seul « Need help? » reste visible dans le lecteur. Aucun CTA flottant supplémentaire n’est présent ; la zone de navigation pédagogique conserve son accès normal.

## 13 septembre 2026 — administration

Le centre d’assistance reste accessible en bas à droite de l’inbox administrative et présente les quatre mêmes choix. En contexte administrateur, la carte « Nouvelle conversation avec Neopolis » doit rediriger vers le composeur de l’inbox, les conversations ouvertes vers cette inbox, et TekTek précise que le coach est disponible depuis une leçon. Le signalement technique conserve un canal distinct du contenu privé des conversations.

Un défaut de réactivité du paramètre `compose=1` a été identifié lorsque l’inbox était déjà montée, puis corrigé : l’inbox observe désormais les changements de recherche d’URL et ouvre le composeur une seule fois. Le parcours réel depuis le centre a été rejoué : l’URL cible est atteinte, le paramètre est nettoyé, et le dialogue « Nouvelle conversation » s’ouvre avec destinataire, sujet, premier message et pièce jointe, sans créer de fil pendant le contrôle.

Le dialogue de création se ferme proprement sans mutation, puis le centre d’assistance peut être rouvert immédiatement dans l’inbox. Les quatre actions restent visibles et les formulaires non liés à la messagerie ne s’affichent qu’après le choix explicite de leur parcours.

Un contrôle mobile 390 × 844 du lecteur confirme que le point d’entrée « Besoin d’aide ? » reste entièrement visible et atteignable dans l’angle inférieur droit. Une communication importante peut temporairement occuper le lecteur, mais le centre reste accessible sans recouvrir le bouton de confirmation de cette communication.
