# Parité Associate Foundations — cours 7 : Troubleshooting & Optimization

## Cadre de correction

La source de travail est le prompt Associate du 14 septembre 2026, qui fixe une durée officielle de **30 minutes**, sept écrans et des diagnostics contrastés entre prompt, contexte, modèle, outil, format, vérification et coût ou latence. Le cours est corrigé uniquement par des blocs Neopolis existants : contenu, FlipCard et choix unique avec correction.

| Écran Neopolis | Sujet | Bloc standard | Statut | Preuve attendue |
|---:|---|---|---|---|
| 1/7 | Introduction | Contenu | Adapté | Durée officielle 30 min |
| 2/7 | Diagnostic de la sous-performance | Contenu + FlipCard | Adapté | Causes et cartes complètes |
| 3/7 | Ajustement à partir des retours | Contenu + FlipCard | Adapté | Boucle de correction pérenne |
| 4/7 | Optimiser les flux de travail | Contenu + FlipCard | Adapté | Friction, mesures et noms produits |
| 5/7 | Quiz du module 7 | Contenu + choix unique | Adapté | 5 questions, verrou après activité |
| 6/7 | Points clés | Contenu | Présent | Synthèse courte |
| 7/7 | Module terminé | Contenu | Présent | Fin de module et suite du parcours |

## Lot Claude Sonnet

L’audit Claude Sonnet a identifié six revers de cartes tronqués, les objectifs anglais mal numérotés, des reliquats génériques anglais dans les variantes françaises, un registre de vouvoiement à normaliser et une option du troisième scénario à réconcilier avec l’enseignement du cours. Le correctif réexécutable applique seulement ces substitutions et préserve les noms produits Anthropic. Les quatorze exercices racine hérités sont exclus parce qu’ils ne sont pas reliés aux chapitres ; les cinq questions intégrées restent les seules activités obligatoires du parcours.

## Contrôles à archiver avant clôture

La clôture requiert un test de contrat, la validation complète unique du cours, le canal public tRPC avec `no-store`, et une revue publique ciblée de l’introduction, des trois écrans de diagnostic, du quiz et de la fin de module. Toute ressource vidéo générique hors provenance doit rester désactivée, sans supprimer de média source.

## Contrôle de clôture — checkpoint `8dcdd753`

La validation unique du lot a réussi : TypeScript, **245 fichiers de test**, **800 tests réussis** et **2 ignorés**, puis matrice de publication **9/9**. Après propagation, le canal tRPC public a répondu HTTP 200 avec `Content-Type: application/json; charset=utf-8` et `Cache-Control: no-store, max-age=0`. Il retourne bien sept écrans, aucun exercice racine et la liste normalisée des trois signaux.

La revue publique ciblée confirme sur l’écran **Optimiser les flux de travail** la liste de signaux sans dièses littéraux, des FlipCards complètes et les noms produits `Projects` et `Skills` préservés. Le quiz public présente cinq questions de scénario ; avant sélection, ses cinq boutons « Vérifier la réponse » et le bouton de navigation restent désactivés. La console de cette session ne contient pas d’erreur applicative.
