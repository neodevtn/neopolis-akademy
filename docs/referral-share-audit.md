# Audit initial — lien de parrainage partagé

Le 29 août 2026, le lien de recommandation de cours fourni ouvre directement le formulaire de candidature à l’étape 1 sur 10. Le destinataire ne voit ni le nom du cours partagé, ni l’intérêt de la recommandation, ni une explication du programme avant de commencer à renseigner ses informations.

Le titre de la page est générique (« Candidature | Neopolis Akademy »). Le correctif doit donc créer une étape d’atterrissage publique claire, conserver `ref` et les paramètres UTM jusqu’au formulaire, et produire un aperçu Open Graph/Twitter contextualisé pour les robots de réseaux sociaux.

## Validation locale du correctif

L’ancien lien `/apply?...&ref=...` retourne désormais une redirection `302` vers `/refer` en conservant les paramètres d’attribution. Le navigateur affiche ensuite une page de recommandation présentant « L’IA pour la finance », une explication du programme, un accès au parcours et un bouton d’entrée vers la candidature. Les balises Open Graph et Twitter renvoient le titre, la description et l’image sociale Neopolis Akademy ; l’image répond HTTP 200 au format PNG. L’aperçu n’expose pas le code de parrainage dans ses textes, et les valeurs issues de l’URL sont échappées avant insertion dans les métadonnées.

## Contrôle de production

Après propagation du checkpoint, le domaine public renvoie bien la redirection `302` des anciens liens puis affiche la page de recommandation. Avec le lien de cours de test, le titre de document et les balises Open Graph/Twitter indiquent « L’IA pour la finance | Formation recommandée par votre réseau ». Le bouton « Commencer ma candidature » ouvre `/apply` en préservant le code de recommandation, les paramètres UTM, le cours, la certification et le marqueur technique `referral_continue=1`, qui évite une redirection en boucle.

La page de recommandation a également été contrôlée à 390 × 844. Le titre, les deux appels à l’action et le panneau d’information restent visibles, lisibles et actionnables dans la largeur de l’écran, sans défilement horizontal.
