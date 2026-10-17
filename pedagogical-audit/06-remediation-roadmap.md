# Feuille de route de remédiation pédagogique

> Objectif : faire disparaître d’abord les **223 P0** puis les **926 P1**, sans altérer les progressions déjà enregistrées. Chaque lot doit être livré avec migration idempotente, test de parcours et contrôle de reprise.

| Lot | Actions | Priorité | Dépendances | Effort | Impact attendu |
|---|---|---|---|---|---|
| 1 — Parcours bloqués ou contournables | Réparer checkpoints invisibles, références `exerciseId` absentes, réponses erronées qui passent, clés de complétion média divergentes et activités obligatoires non rendues. | P0 | Inventaire des contrats de rendu et de progression | L | Le parcours ne bloque plus injustement et ne peut plus être contourné sans réaliser l’activité. |
| 2 — Évaluation réelle des TPs et du code | Remplacer les validations à un caractère / égalité textuelle par des rubriques, validations serveur, simulations ou modes preuve adaptés. | P0/P1 | Lot 1, décision par famille d’activité | XL | Les compétences évaluées deviennent mesurables ; le verrouillage retrouve une valeur pédagogique. |
| 3 — Ressources et environnement apprenant | Fournir les fichiers annoncés via la médiathèque, ajouter des alternatives, retirer/réécrire toute dépendance à un Desktop ou workspace source inaccessible. | P1 | Inventaire de médias/fichiers, gouvernance des droits | L | Les TPs deviennent réalisables de façon autonome dans Neopolis. |
| 4 — Feedback, consignes et progression | Rendre les feedbacks existants, compléter objectifs/action/résultat/critères, résoudre les consignes contradictoires et dédupliquer les séquences répétées. | P1/P2 | Lots 1–2 pour les activités concernées | L | Réduction des abandons et compréhension explicite de « quoi faire / comment réussir ». |
| 5 — Médias, langues et UX | Contextualiser les vidéos, compléter alternatives et localisation, corriger durées/libellés, améliorer la distinction théorie/pratique/validation. | P2/P3 | Politique de langues et accès aux assets | M | Accessibilité et cohérence d’expérience améliorées sans modifier les objectifs disciplinaires. |
| 6 — Recette apprenant et instrumentation | Exécuter un parcours E2E représentatif par famille de blocs, tester médias 20 s, téléchargements, reprise, desktop/tablette/mobile et mesurer les échecs. | Transversal | Lots 1–5 | L | Validation que les corrections observées dans les sources se traduisent en expérience réelle. |

## Ordre d’exécution recommandé

1. **Moteur transversal d’abord**, car une même correction de clé de complétion ou de renderer corrige de nombreuses formations.
2. **P0 par concentration de risque**, notamment les certifications Architect Foundations, les cours OpenAI/Claude Code, les cours de développement API et les formations comportant des checkpoints invisibles.
3. **Familles DataCamp/TP**, par mécanisme commun : ressources, code_repl, médias Projector, feedback de tri et validation de `cloud_exercise`.
4. **Revue éditoriale des propositions** avant réécriture : l’audit sépare explicitement les cas où une tâche fiable ne peut pas être inventée.
5. **Recette complète et ré-audit ciblé**, puis seulement publication.

## Règles de clôture par constat

- **P0** : le comportement bloquant/contournable est reproduit et corrigé dans un test ; l’activité est réalisable ou retirée explicitement.
- **P1** : la donnée ou l’UX manquante est corrigée, ou documentée comme exception vérifiée avec alternative apprenant.
- **P2/P3** : correction groupée par composant/locale quand possible, suivie d’un contrôle visuel et de non-régression.
