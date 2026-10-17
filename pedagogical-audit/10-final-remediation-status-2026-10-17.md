# État final de remédiation pédagogique — 17 octobre 2026

## Décision de publication

**Aucun déploiement n’a été effectué dans cette séquence.**

L’état technique et structurel est valide. En revanche, ce document distingue volontairement cet état du **backlog qualitatif** issu de la contre-revue : les constats qualitatifs ouverts qui ne sont pas démontrables automatiquement ne doivent pas être considérés comme clos sans correction ou revue pédagogique explicite. Une publication globale ne doit donc pas être annoncée comme « qualité pédagogique intégralement clôturée » sur la seule base des tests automatisés.

## Périmètre livré

### Règle : une vidéo au plus par écran

- Les 180 fichiers de cours ont été contrôlés.
- Les six écrans multi-vidéos détectés ont été scindés en écrans séquentiels.
- La règle est désormais imposée par le validateur de contenu et le pipeline de validation.
- Les identifiants d’écran, l’index de recherche et les métriques de catalogue ont été resynchronisés.

### Progression et verrouillage

- Les clés de complétion vidéo, audio, MP4, HLS et YouTube sont maintenant alignées avec les règles de passage.
- Les activités numériques participent à la même porte de progression scopée que les autres activités obligatoires.
- Les règles de complétion qui ne pointaient plus vers une activité affichée ont été supprimées : aucun verrou fantôme n’est conservé.
- Les checkpoints `free_text` sans correction machine-vérifiable ont été supprimés avec leur porte de progression, tout en préservant le contenu explicatif du cours.
- Les définitions libres devenues inaccessibles ont aussi été supprimées afin d’éviter une banque de questions morte ou une réapparition accidentelle.

### Remédiations conservatrices de contenu

La politique appliquée est documentée dans le manifeste de remédiation : lorsqu’un TP, un exercice ou un checkpoint ne peut pas être réalisé ou corrigé avec les ressources effectivement disponibles, l’activité est retirée au lieu d’inventer des fichiers, des jeux de données, une réponse modèle ou une correction.

Résultats traçables :

| Action | Total |
|---|---:|
| Checkpoints libres non vérifiables retirés | 23 |
| Définitions `free_text` orphelines purgées | 128 |
| Blocs historiques `text/content` normalisés en `content/body` | 5 |
| Règles de complétion fantômes retirées | 14 |

### Formations prioritaires

| Formation | Résultat de la contre-revue après correction |
|---|---|
| Claude Certified Architect Foundations | 0 constat ouvert (P0–P3) |
| L’IA pour les ventes / AI for Sales | 0 constat ouvert (P0–P3) |
| Analyse de données et Reporting BI | 0 P0, 0 P1 ; 24 P2 documentés restent à arbitrer qualitativement |

Corrections spécifiques incluses :

- **Architect Foundations** : conservation des 11 vidéos officielles jouables, suppression des tutoriels ou checkpoints libres non vérifiables, maintien du checkpoint de certification corrigé automatiquement, pas de verrou résiduel.
- **Reporting BI** : déduplication et nettoyage des écrans confirmés, progression des exercices numériques fiabilisée. Les P2 restants relèvent du niveau de détail pédagogique et n’ont pas été artificiellement réécrits.
- **AI for Sales** : retrait du TP Copilot Studio non réalisable faute de pack/données fournis, préservation des explications, critères apprenant rendus lisibles et correction de la chaîne anglaise qui restait en français.

## Contrôles exécutés

| Contrôle | Résultat |
|---|---|
| Contrôleur structurel étendu sur 180 cours | **0 P0 · 0 P1 · 0 P2 · 0 P3** |
| Écrans contenant plus d’une vidéo | **0** |
| Checkpoints orphelins / portes fantômes | **0** |
| Audit bilingue strict | **0 anomalie** |
| Validation de contenu (`pnpm validate-courses`) | **PASS** — avertissements de similarité de choix existants, sans erreur bloquante |
| TypeScript (`pnpm check`) | **PASS** |
| Build de production (`pnpm build`) | **PASS** |
| Régression complète (`pnpm test`) | **312 fichiers PASS ; 1 116 tests PASS ; 2 ignorés** |
| Intégrité Git (`git diff --check`) | **PASS** |
| Index de recherche régénéré | **3 686 entrées** |

## Résultat de la contre-revue qualitative

Les 116 formations prévues ont chacune un rapport de contre-revue valide ; aucun rapport n’est manquant ou invalide. Cette contre-revue a toutefois identifié des problèmes de nature pédagogique ou éditoriale qui ne se laissent pas tous déduire par une règle structurelle.

Le dernier consolidé relève encore :

- **67 P0**, **675 P1**, **481 P2**, **74 P3** normalisés ;
- **361 constats historiques** dont la sévérité ne peut pas être reconstruite honnêtement à partir de leur formulation.

Ces chiffres ne contredisent pas le résultat nul du contrôleur structurel : ils correspondent à deux périmètres différents. Le contrôleur structurel valide la faisabilité, la navigation, les ressources, les interactions et les invariants de données. La contre-revue qualitative contient aussi des critiques de profondeur, d’exactitude contextuelle, de formulation ou de design pédagogique qui exigent une correction éditoriale au cas par cas.

## Suites recommandées avant publication globale

1. Traiter en priorité les P0/P1 qualitatifs listés par le consolidé, en commençant par : API OpenAI, sécurité/red teaming LLM, FastAPI production et LLMOps.
2. Décider formellement pour les 24 P2 Reporting BI s’ils sont corrigés ou acceptés comme compromis pédagogique documenté.
3. Rejouer la contre-revue qualitative sur les formations modifiées puis régénérer la consolidation ; ne marquer un constat fermé qu’avec preuve dans le cours.
4. Après clôture du backlog qualitatif, effectuer une QA navigateur apprenant sur desktop, tablette et mobile avant publication.

## Livrables associés

- `09-qualitative-recheck-final.md` : consolidation complète de la contre-revue des 116 formations et ordre de priorité.
- `static-audit-data.json` : résultat du contrôleur structurel final.
- `static-p0-p1-remediation-manifest.json` : traçabilité des suppressions et adaptations de progression.
- `p0-p2-remediation-manifest.json` : traçabilité de la première vague de retrait des activités sans ressources.
- `training-search-index.json` : index de recherche régénéré.

