# Visibilité des examens et hiérarchie catalogue — contrôle de publication

Cette note archive le contrôle final de la refonte qui rend les examens blancs de certification visibles et actionnables dans les parcours apprenants, tout en clarifiant la structure du catalogue côté administration.

## Changements vérifiés

| Surface | Résultat contrôlé |
|---|---|
| Catalogue apprenant | Filtre **Avec examen blanc** disponible et fonctionnel |
| Cartes de formation | Badge d’examen visible avec nombre de questions, durée et seuil lorsqu’ils sont réellement configurés |
| Fiche de formation | Panneau d’examen blanc affichant les informations configurées, sans créer d’examen fictif |
| Fin de parcours | Appel à passer l’examen lorsque la formation certifiante devient éligible |
| Administration | Console clarifiée autour de la hiérarchie **Catégorie de formation → Formation / certification → Cours et activités** |
| Responsive | Fiche certifiante mobile corrigée : les accomplissements ne provoquent plus de débordement horizontal |

## Contrôles exécutés

| Contrôle | Résultat |
|---|---|
| Validation TypeScript | Réussie |
| Validation structurale des cours | Réussie |
| Suite de tests | 156 fichiers, 484 tests réussis, 2 ignorés |
| Matrice QA publication | 6/6 réussie |
| Sonde navigateur locale apprenant/admin | Réussie |
| Sonde navigateur publique apprenant/admin | Réussie après propagation du checkpoint `fad4ae01` |
| Sonde post-complétion certifiante | Réussie localement après préparation QA contrôlée de la progression |

## Résultat public de la sonde

| Point vérifié | Résultat |
|---|---|
| Base contrôlée | `https://akademy.neodev.click` |
| Filtre catalogue | `with_exam` |
| Cartes certifiantes visibles | 4 |
| Badge examen visible | Oui |
| Questions et durée visibles | Oui |
| Panneau d’examen sur fiche | Oui |
| Détails d’épreuve sur fiche | Oui |
| Message d’éligibilité ou de verrouillage | Oui |
| Hiérarchie admin visible | Oui |
| Gestion d’examen admin visible | Oui |
| Mobile 390 px | `clientWidth = 390`, `scrollWidth = 390`, aucun débordement |

Les captures et la sortie machine sont conservées dans `docs/exam-visibility-screenshots/` et `docs/exam-visibility-browser-qa.json`.

## Contrôle post-complétion ajouté

Le contrôle complémentaire couvre explicitement le cas qui expliquait le faible passage aux examens blancs : lorsque l’apprenant termine le dernier cours requis d’une formation certifiante, l’écran de cours doit afficher une invitation immédiate à passer l’épreuve. La sonde prépare un état QA contrôlé pour la formation `claude_certified_associate_foundations`, ouvre le dernier cours `claude_certified_associate_foundations__08` et vérifie l’apparition du message de fin de parcours, du résumé **60 questions · 120 min · seuil 720/1000** et du lien `/mock-exam/claude_certified_associate_foundations`.

| Point post-complétion | Résultat local avant publication |
|---|---|
| Certification contrôlée | `claude_certified_associate_foundations` |
| Dernier cours contrôlé | `claude_certified_associate_foundations__08` |
| Message « dernier cours requis terminé » | Oui |
| Détails questions/durée/seuil | Oui |
| CTA vers l’examen blanc | Oui |

Le correctif associé précise le calcul de complétion des cours stockés comme **une leçon contenant plusieurs écrans** : lorsque le nombre d’écrans sert de total affiché, la progression chapitre complète prévaut sur la simple entrée de leçon, ce qui permet à l’appel d’examen de refléter l’état réel du parcours sans créer de nouvelle épreuve.
