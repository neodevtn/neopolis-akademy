# Claude Certified Associate Foundations — Cours 4 : matrice de parité

> **Cours ciblé :** `claude_certified_associate_foundations__04` — **Workflow Integration & Solution Design**. Le jalon préserve les dix écrans et leurs activités Neopolis intégrées, retire les exercices libres hors contexte et normalise les métadonnées et la langue française.

## Matrice écran → bloc Neopolis

| # | Écran de référence | Bloc Neopolis rendu | État contrôlé |
|---:|---|---|---|
| 1 | Module Introduction | Contenu structuré et métadonnées | Durée officielle **63 min** et estimation Neopolis distincte |
| 2 | Requirements Analysis | Contenu structuré | Exigences explicites et implicites, texte français normalisé |
| 3 | Research & Planning | Contenu structuré | Étape de planification conservée |
| 4 | Solution Design & Iteration | Cartes de révision et contenu structuré | Cartes de cycle et escalade localisées |
| 5 | Delegation Mapping | Cartes + `bucket_sort` standard | Six décisions de délégation et feedback détaillé |
| 6 | Communicating Value | Cartes et contenu structuré | Limites, contrôle humain et formulations exactes conservés |
| 7 | Redesign a Workflow | `bucket_sort` standard requis | Cinq décisions de workflow et feedback détaillé |
| 8 | Module 4 | Cartes et quiz standard | Consolidation préservée |
| 9 | Key Takeaways | Synthèse standard | Étape de synthèse conservée |
| 10 | Module Complete | Écran final standard | Clôture de module conservée |

## Corrections apportées

La carte de catalogue et le lecteur utilisent désormais le titre français **Intégration des flux de travail et conception de solutions** et la durée officielle **63 min**. Le fichier `training-search-index.json` a été régénéré depuis le catalogue : le nouveau titre est de nouveau recherché correctement.

Neuf exercices libres importés, optionnels et sans rattachement pédagogique cohérent ont été retirés. Les activités du cours sont désormais les sept interactions intégrées à leurs écrans : deux triages et les cinq questions du quiz de module. Aucun formulaire de texte libre non évalué ne subsiste dans ce cours.

La cartographie de délégation ne présente plus de cartes tronquées ni de niveaux anglais résiduels dans son instruction, ses tables ou ses corrections. Les catégories demeurent **Adaptée à l’IA**, **Collaboration IA–humain**, **Revue humaine requise** et **Réservée à l’humain**. Les cartes et la règle de complétion restent celles de la bibliothèque Neopolis standard.

## Gate de validation local

| Contrôle | Résultat |
|---|---|
| TypeScript et validation des cours | Validés |
| Contrats ciblés | Durée, titre, 10 écrans, absence d’exercices libres, deux triages et recherche validés |
| Suite complète | **239 fichiers, 780 tests réussis, 2 ignorés** |
| QA de publication | **9 contrôles sur 9 réussis** |
| Triage de délégation | **6/6 · Parfait !**, correction détaillée visible |
| Redesign de workflow | **5/5 · Parfait !**, correction détaillée visible et bouton Suivant actif |

## Contrôle public après publication

Le checkpoint correctif `34f32ef8` a été publié puis contrôlé sur `https://akademy.neodev.click/training/claude_certified_associate_foundations/claude_certified_associate_foundations__04?lesson=0&chapter=6`. La donnée de cours publique contient la correction française attendue. Après rechargement complet du lecteur, la soumission enregistrée à **5/5 · Parfait !** affiche également cette correction sous le scénario, et le bouton suivant reste actif. La console navigateur ne signale aucune erreur.

La revue publique des dix écrans demeure à réaliser avant la clôture définitive du cours 4.

### Revue écran par écran

| Écrans contrôlés | Résultat public |
|---|---|
| 1 — Introduction du module | Rendu structuré, titres français, durée officielle **63 min** et estimation Neopolis distincte visibles ; navigation disponible en mode révision. |
| 2 — Analyse des exigences | Contenu structuré visible sans erreur de rendu, exemple RFP, consignes de configuration et rattachement au module présentés dans la séquence prévue. |

La donnée JSON publique associée à l’écran 3 a également été vérifiée après le checkpoint `eb5049ca` : la carte **Recherche et synthèse** contient « recherche web dans le chat » et ne contient plus le reliquat anglais relevé. Le lecteur qui était déjà ouvert avant la propagation conserve sa copie mémoire jusqu’à un rechargement documentaire ; ce comportement de session ne modifie pas la donnée actuellement servie.

Après rechargement documentaire, le rendu de l’écran 3 affiche bien la carte française corrigée avec le texte localisé, sans modifier les noms de fonctionnalités Anthropic ni le verrou de cartes. Le contrôle a été effectué sur le domaine public.

Le contrôle de l’écran 6 effectué après le checkpoint `60a58048` a montré que le lecteur pouvait encore servir les anciennes valeurs tronquées des cartes de communication malgré le délai de propagation. Cette observation est traitée comme un décalage de cache/livraison à recontrôler, et non comme une validation : les cartes ne seront considérées corrigées qu’après vérification du contenu complet effectivement rendu depuis la donnée publique actualisée.

La prévisualisation du correctif de chargeur versionné confirme ensuite deux invariants : la requête vers le JSON du cours comporte le paramètre `course-version`, et les trois cartes réparées affichent leurs phrases de clôture complètes. Ce contrôle ne remplace pas la vérification post-publication, qui reste nécessaire pour confirmer le comportement à travers le CDN.

Après le checkpoint `f9b68d2f`, l’écran public **Communiquer la valeur** charge et affiche les cinq cartes complètes. Les cartes « Adaptez-vous au public », « Surestimé vs. Précis » et « Phrases qui exagèrent subtilement » ne sont plus tronquées, leurs phrases ne sont plus fusionnées et les guillemets sont cohérents. La navigation reste disponible en mode révision et aucune erreur de rendu n’est apparue lors de ce contrôle.

Après la propagation du même checkpoint, la console publique confirme que les requêtes de données de cours comportent bien `course-version`. Un rechargement a brièvement présenté l’état de chargement pendant que les nouvelles requêtes étaient émises ; la résolution de cet état est contrôlée séparément avant de clôturer le correctif de cache.

Le rechargement public final quitte correctement cet état transitoire. La console confirme simultanément que le lecteur est prêt, que le JSON Associate 4 est demandé avec `course-version` et que les trois fragments de cartes réparées sont visibles. La récupération versionnée est donc validée sur le domaine public.

L’écran public **Conception et itération de la solution** a ensuite été rejoué après la publication du chargeur versionné. Les termes non nominaux précédemment signalés sont traduits : « partenaire de conception », « construction » et « rédiger et itérer sur des prompts ». Les rôles de parcours **Associate**, **Developer** et **Architect** demeurent inchangés, conformément à la terminologie Anthropic.

Le scénario public **Reconcevoir un workflow** a été contrôlé avec ses cinq associations déjà validées. Le résultat affiche `5/5 · Parfait !`, suivi de la correction pédagogique complète couvrant les décisions Automatiser, Humain et Collaboratif. Les boutons de navigation restent disponibles après l’activité, conformément au mode révision.

L’écran public **Module 4** a été vérifié : cinq questions de scénario, quatre choix par question et un contrôle de réponse sont rendus. La copie française est complète à l’exception du terme non nominal « workflow » relevé dans le titre du quiz, qui doit être harmonisé avec « flux de travail » avant la clôture du cours.

Après le checkpoint `bcda8680`, l’écran public du quiz conserve encore l’ancien titre malgré le contrôle local réussi. Ce décalage indique que le cache-buster s’appuie encore sur une version de manifeste périmée dans certains parcours de navigation. Le titre et les scénarios ne sont donc pas clôturés à ce stade ; le mécanisme de version doit être renforcé avant une nouvelle vérification publique.

Le contrôle direct du JSON public a ensuite montré que le chapitre `chapter_11` porte seulement le libellé « Module 4 ». Le titre visible du quiz est porté par son bloc interne ; la normalisation précédente a donc ciblé le mauvais champ de données. Le cache-buster charge bien le JSON frais : la correction doit désormais être appliquée à la propriété de bloc réellement rendue.

### Livraison de données — correctif en cours

Les contrôles ultérieurs ont infirmé l’hypothèse selon laquelle le seul paramètre `course-version` suffisait : le CDN a continué à délivrer une copie statique antérieure du JSON dans certaines requêtes. Une première route REST dédiée est tombée dans le fallback SPA public. La route est désormais placée sous le préfixe tRPC déjà relayé, avec lecture JSON validée et `Cache-Control: no-store`.

Le premier contrôle de cette route publique a confirmé son acheminement (réponse JSON et non document SPA), mais a retourné `404` car le bundle serveur ne résolvait pas son répertoire de build de façon suffisamment robuste. Le correctif local essaie maintenant explicitement le répertoire de build `dist/public/data/courses` et les chemins compatibles de repli. TypeScript, les tests ciblés et le contrôle HTTP local sont réussis ; la validation publique finale est requise avant de considérer le problème de cache comme clos.

Après le checkpoint `d7fd6ba5`, la route publique `api/trpc/course-data/...` retourne `200`, `application/json; charset=utf-8` et `Cache-Control: no-store, max-age=0` pour Associate 4. Le contrôle direct confirme le titre français actualisé et l’absence de l’ancien libellé. Le lecteur public a ensuite chargé le quiz avec le titre **« Intégration des flux de travail et conception de solutions »**, confirmant que les données ne sont plus masquées par la copie statique périmée.

Le contrat du chargeur valide aussi que, après une première réponse fraîche, les préchargements suivants du même cours réutilisent le cache mémoire de session et ne relancent aucune requête supplémentaire. La fraîcheur de livraison est donc assurée par la route tRPC `no-store`, tandis que la fluidité de navigation intra-session reste assurée par `courseCache`. Le manifeste de version n’est désormais qu’un paramètre de diagnostic et ne conditionne plus la fraîcheur du contenu.

Dans une même session publique, le quiz Associate 4 (chapitre 8/10) a été chargé depuis la route tRPC, puis la navigation interne a ouvert **Points clés à retenir** (9/10) et est revenue au quiz. Les deux transitions ont rendu immédiatement les contenus attendus, sans écran de chargement ni perte de la progression du lecteur. Le compteur de requêtes de données initial est archivé comme point de comparaison avant sa vérification finale.

Après le retour au quiz, la session reste prête avec le titre français corrigé et le compteur de requêtes tRPC de données du cours demeure inchangé à **1**. La route `no-store` garantit donc une première lecture fraîche après publication, tandis que `courseCache` conserve effectivement la donnée lors de la navigation interne entre chapitres.

Les écrans 9 et 10 ont été rejoués sur le domaine public. **Points clés à retenir** restitue les cinq thèmes du module, ses étapes de révision et la navigation standard. **Module terminé** restitue l’état de complétion, le texte de synthèse et trois médias recommandés dont les titres originaux sont conservés comme intitulés de ressources externes ; aucune de ces références n’est présentée comme un contenu Neopolis ou comme un prérequis caché. Les dix écrans sont désormais observés publiquement ; la vérification consolidée de la copie française et des interactions reste le dernier préalable à la clôture.

### Contrôle consolidé de clôture

La revue publique couvre les dix écrans : introduction, analyse des exigences, recherche et planification, conception et itération, cartographie des délégations, communication de la valeur, scénario de refonte, quiz, points clés et complétion. Les deux triages ont été soumis avec leurs associations attendues et restituent leurs corrections détaillées. Le contrat Associate 4 parcourt toutes les chaînes françaises du JSON, y compris titres, cartes et corrections, et confirme l’absence de reliquat `workflow`. La console est restée vide lors de la reprise des derniers écrans. Le jalon Associate 4 est donc prêt à être archivé ; les intitulés externes de vidéos sont volontairement conservés dans leur langue d’origine.

### Revue continue après route tRPC — en cours

Les écrans 1 et 2 ont été rejoués après `d7fd6ba5`. L’introduction affiche les durées officielle et Neopolis, les cinq thèmes et la navigation standard. L’analyse des exigences restitue le cas RFP, les éléments de configuration Projects/Skills et la mise à l’épreuve. Un prompt d’exemple reste cependant en anglais dans cette variante française ; il est relevé comme reliquat éditorial à localiser, sans modifier son objectif pédagogique ni les noms produits Anthropic.
