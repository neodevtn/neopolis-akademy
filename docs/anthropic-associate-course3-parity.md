# Claude Certified Associate Foundations — Cours 3 : matrice de parité

> **Cours ciblé :** `claude_certified_associate_foundations__03` — **Evaluating & Validating Claude's Output**. Le périmètre du jalon conserve la séquence de onze écrans et les blocs Neopolis standards ; il corrige les métadonnées, la terminologie française et les validations de triage.

## Matrice écran → bloc Neopolis

| # | Écran de référence | Bloc Neopolis rendu | État contrôlé |
|---:|---|---|---|
| 1 | Module Introduction | Contenu structuré et métadonnées | Titre FR aligné ; durée officielle de **74 min** distincte de l’estimation Neopolis |
| 2 | Discernment | Contenu structuré | Terminologie **Discernement** conservée |
| 3 | Failure Patterns | Contenu structuré | Séquence et contenu de diagnostic conservés |
| 4 | Fact-Checking & Grounding | Contenu, cartes et exemples de prompt | Exemples de vérification, citation et ancrage préservés |
| 5 | Diligence | Contenu structuré | Terme officiel **Diligence** rétabli en français |
| 6 | Editing for Audience | Contenu structuré | Étape de revue éditoriale conservée |
| 7 | Output Formats | Contenu structuré | Étape de formatage conservée |
| 8 | Triage the Output Set | Deux `bucket_sort` standards | Les deux triages sont obligatoires avant la navigation suivante |
| 9 | Module 3 | Cartes de révision et quiz standard | Cartes localisées ; questions scénarisées conservées |
| 10 | Key Takeaways | Synthèse standard | Étape de synthèse conservée |
| 11 | Module Complete | Écran de complétion standard | Fin de module conservée |

## Correctifs validés

La carte de catalogue et le lecteur partagent désormais **Évaluer et valider les résultats de Claude** en français. La durée officielle de 74 minutes est présente dans le catalogue et dans l’introduction du lecteur. L’index de recherche a été régénéré à partir du catalogue ; le titre public mis à jour est de nouveau trouvable.

Les résidus de localisation visibles dans les cartes du quiz ont été corrigés : l’invite utilise désormais « Je ne sais pas » et « Choisissez le format en fonction de la fiabilité ». Le premier triage a également perdu ses repères anglais `Safe` et `Verify` dans l’instruction française, au profit des catégories localisées effectivement affichées.

Les deux exercices standards de triage ont été contrôlés en prévisualisation française. Le premier renvoie **4/4 · Parfait !** après la distinction entre sortie non fiable, citation à vérifier et cas exigeant une revue humaine. Le second renvoie **6/6 · Parfait !** après le classement des erreurs de précision, d’exhaustivité, d’hallucination et de biais. Le bouton Suivant ne devient actif qu’après les deux validations, puis ouvre le chapitre Module 3.

Le composant standard de triage affiche désormais la correction fournie après **toute** soumission, y compris lorsque tous les classements sont justes. Les deux activités Associate 3 présentent ainsi une correction détaillée sous leur score, respectivement sur les décisions de risque puis sur les dimensions de qualité.

Le bloc standard **FlipCard** recalcule la hauteur maximale de ses deux faces selon le contenu, ajoute une marge de lecture, garde un défilement vertical pour le verso et passe à une colonne sur écran étroit. Son contrat exclut les utilitaires de troncature. Le contrôle desktop des sept cartes et la QA mobile standard n’ont montré aucun débordement de lecteur ; la capture mobile isolée a seulement été masquée par un communiqué obligatoire avant son accusé de réception.

La preuve mobile ciblée est désormais disponible à **390 × 844** : la face avant et la face arrière retournée de la première carte sont visibles dans les captures versionnées, sans texte tronqué ni dépassement. Les métriques du viewport confirment `scrollWidth = 390`, des cartes de 322 px et des dimensions de défilement égales aux dimensions rendues pour les deux faces des sept cartes.

Les contrôles distincts **375 × 667** et **1280 × 720** complètent la preuve : les captures avant/arrière montrent la carte retournée, et les métriques confirment respectivement `scrollWidth = 375` et `scrollWidth = 1274` — inférieur au viewport desktop de 1280 px. Aucun texte de carte ni face arrière n’est tronqué.

## Gate de validation

| Contrôle | Résultat |
|---|---|
| TypeScript | Validé |
| Validation des données de cours | Validée |
| Contrat Associate 3 | Validé : durée, 11 écrans, deux triages, terminologie Diligence et localisations ciblées |
| Recherche publique interne | Contrat validé après régénération de l’index |
| Suite complète | **238 fichiers, 776 tests réussis, 2 ignorés** |
| QA de publication | **9 contrôles sur 9 réussis** |
| Triage de sorties | **4/4** validé en prévisualisation |
| Triage de qualité | **6/6** validé en prévisualisation |
| Navigation après activités | Passage confirmé du chapitre 8 au chapitre 9 |

Le contrôle du domaine public reste requis après le checkpoint de ce jalon. Aucun autre cours Associate n’est modifié par cette publication.
