# Contrôle de personnalisation de l’accueil

## État visiteur

L’accueil conserve les appels à l’action d’acquisition avant le chargement différé de la session : « Déposer ma candidature », « Découvrir le programme » et « Postuler ». Les liens de connexion et de candidature restent accessibles aux visiteurs.

## État authentifié

Avec une session apprenante active, l’accueil affiche un message de retour individualisé, l’accès « Accéder à mes formations », l’accès au tableau de bord et le bouton d’en-tête « Mon espace », à la place des invitations à candidater. Le widget de reprise de lecture existant reste disponible lorsqu’une progression est enregistrée.

Le héros connecté affiche aussi un indicateur réel : « Parcours actif · 42 % de l’étape en cours » pour la session de contrôle ayant une progression enregistrée. L’appel à l’action principal devient alors « Reprendre ma formation ».

## Contrôle de production

Le premier chargement du domaine public après le checkpoint affichait encore le bundle précédent : session reconnue et widget de reprise présent, mais CTA de candidature inchangés. Ce constat est conservé comme contrôle de propagation ; le contrôle final doit être rejoué dès que la nouvelle version est servie, afin de confirmer le héros authentifié et le bouton « Mon espace » en production.

Une inspection du module différé chargé avant la confirmation finale de déploiement ne contenait pas encore les nouveaux libellés « Mon espace », « Parcours actif » et « Reprendre ma formation ». La compilation locale complète a été interrompue par la limite mémoire pendant la transformation Vite ; les contrôles TypeScript, unitaires et la matrice QA restent toutefois réussis. Une nouvelle vérification est donc réalisée après la notification de déploiement de la plateforme, sans relancer la compilation locale coûteuse.

Après propagation, la session apprenante de démonstration affiche publiquement « Bonjour Apprenant », « Parcours actif · 83 % de l’étape en cours », « Reprendre ma formation », « Voir mon tableau de bord » et « Mon espace ». Après déconnexion, le même accueil revient aux CTA visiteurs : « Se connecter », « Postuler », « Déposer ma candidature » et « Découvrir le programme ».

À 390 × 844, l’action « Mon espace » devient une icône nommée, avec un libellé accessible. L’en-tête conserve le logo, la langue, la déconnexion et le menu sans débordement horizontal. Le bandeau de communication obligatoire reste volontairement au premier plan ; il n’empêche pas l’affichage correct du héros en arrière-plan.
