# Triage du crash `insertBefore` — IA pour les nuls

## Première reproduction

La route de production signalée a été ouverte avec un paramètre de contrôle. Le lecteur a chargé le cours `ia_pour_les_nuls__01`, puis a navigué vers la leçon 1, écran 4, sans afficher l’ErrorBoundary ni produire immédiatement l’erreur `NotFoundError: insertBefore`.

La page rendait un exercice à choix unique après le bloc de contenu. Le crash est donc intermittent ou dépendant d’une transition précise entre blocs ou écrans. La suite du triage doit cibler le rendu du contenu riche, les composants qui utilisent des portails et les changements de chapitre susceptibles de modifier le DOM entre deux passes React.

## Hypothèse de transition

Le lecteur entoure le chapitre courant par `AnimatePresence` avec `mode="wait"`. La documentation Motion précise que ce composant conserve temporairement les enfants sortants et impose que ses enfants directs disposent de clés uniques et stables. Un problème connu avec les changements rapides pendant une animation de sortie peut laisser des enfants bloqués dans le DOM, y compris sous React 19. La navigation de chapitre est donc le candidat prioritaire : la correction doit supprimer cette fenêtre de réconciliation fragile sans modifier les règles pédagogiques. Sources : [Motion AnimatePresence](https://motion.dev/docs/react-animate-presence) ; [Motion issue #3541](https://github.com/motiondivision/motion/issues/3541).

## Contrôle après correctif

La prévisualisation du cours atteint l’écran des cartes de la première leçon sans déclencher l’ErrorBoundary. Le rendu du contenu et des quatre cartes est présent ; les règles de passage restent inchangées et le bouton suivant demeure correctement verrouillé tant que les cartes ne sont pas retournées.

Un chargement direct de l’écran suivant de la même leçon (`chapter=2`) rend ensuite l’historique de l’IA sans erreur. Cette transition monte un nouvel écran de leçon sans conserver un enfant sortant de l’écran précédent, conformément au correctif.

## Validation de production

Après propagation du checkpoint `25a3a945`, la route de production s’ouvre sur l’écran de checkpoint, puis sur l’écran suivant de la même leçon. Les deux vues affichent leur contenu attendu, sans ErrorBoundary ni `NotFoundError`. Les logs internes ne remontent aucune nouvelle erreur pour ce contrôle.
