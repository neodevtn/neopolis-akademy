# Vérification de référence Anthropic — 14 septembre 2026

## Sources consultées

| Référence | Constat exploitable |
|---|---|
| `https://anthropic-partners.skilljar.com/page/claude-certification-exam-prep-courses` | Le catalogue officiel présente notamment les parcours Claude Certified Developer Foundations, Claude Certified Architect Foundations et Claude Certified Architect Professional. |
| `https://anthropic-partners.skilljar.com/path/claude-certified-associate-foundations` | Le parcours officiel Associate Foundations décrit les objectifs : choisir le point d’entrée et les fonctionnalités Claude, différencier les modèles, gérer le contexte et appliquer les jugements de gouvernance. |
| `https://anthropic-partners.skilljar.com/path/claude-certified-associate-foundations/claude-platform-model-foundations/486586/scorm/150nrjj19ybs6` | Le navigateur de contrôle reçoit une réponse CloudFront 403 avant tout écran d’authentification ; le détail visuel du scénario ne peut donc pas être vérifié directement par ce canal, y compris lors de la tentative de session autorisée du 14 septembre 2026. |

## Vérification de publication — 14 septembre 2026

Après le checkpoint `285ab319`, l’URL de production `https://akademy.neodev.click/training/claude_certified_associate_foundations/claude_certified_associate_foundations__01?lesson=0&chapter=3` restituait encore l’ancienne version du scénario, y compris le texte `(Illustrative Scenario)`. Le parcours et son tri obligatoire restaient accessibles, mais la propagation des données corrigées n’était pas encore observable dans ce contrôle. Ne pas déclarer ce jalon publiquement vérifié tant qu’une nouvelle observation n’affiche pas le scénario restructuré sans ce placeholder.

Un second contrôle de la même route, ainsi qu’une requête directe non mise en cache vers `/data/courses/claude_certified_associate_foundations__01.json`, confirmaient encore l’ancienne donnée. Il s’agit donc d’une propagation de déploiement ou de cache en attente, et non d’un simple cache de l’interface du navigateur.

Après la confirmation de déploiement, un nouveau contrôle sur cette même route a affiché la version corrigée : modèle à quatre couches en tableau Markdown, scénario restructuré avec contexte, étapes et tableau de questions, et absence du placeholder `(Illustrative Scenario)`. Le tri « Sort Components into Capability Layers » et son verrou de passage étaient toujours présents. La propagation publique du jalon `285ab319` est donc désormais validée pour ce cas représentatif.

Le contrôle direct, sans cache, de `https://akademy.neodev.click/data/courses/claude_101__01.json` après le checkpoint `4f8277a7` confirme que les titres, questions, options, explications et prompts de Claude 101 sont désormais livrés en français. Les blocs d’activité, le nombre d’activités attendu et les règles `requiredBeforeAdvance` restent présents dans la donnée publique ; les commandes et identifiants techniques restent littéraux.

## Règle de correction

Les corrections reposent sur les données locales canoniques et sur les objectifs confirmés ci-dessus. Lorsqu’un détail de rendu du SCORM source n’est pas consultable, ne pas inventer de graphique : convertir uniquement les informations présentes (titres, étapes, comparaisons et tableaux) en composants standards Neopolis lisibles.
