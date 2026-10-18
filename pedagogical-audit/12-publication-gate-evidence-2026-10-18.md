# Grille de publication — preuves de conformité pédagogique

**Date de contrôle :** 18 octobre 2026  
**Périmètre :** 180 fichiers de cours, 116 formations/certifications, après les remédiations P0/P1 et la normalisation des ressources internes.

## Décision

**État local : prêt pour publication.** Aucune publication n’a été déclenchée par ce contrôle.

## Critères de blocage

| Critère | Résultat | Preuve |
|---|---:|---|
| P0 structurel | PASS — 0 | Contrôleur `audit-pedagogical-static.mjs` |
| P1 structurel | PASS — 0 | Contrôleur `audit-pedagogical-static.mjs` |
| P2 structurel | PASS — 0 | Contrôleur `audit-pedagogical-static.mjs` |
| P3 structurel | PASS — 0 | Contrôleur `audit-pedagogical-static.mjs` |
| Écran contenant plus d’une vidéo | PASS — 0 | Validateur de contenu et invariant catalogue |
| Chemin `/manus-storage/` dans les cours | PASS — 0 | Recherche exhaustive après migration |
| Ressources internes réellement accessibles | PASS — 2 883 / 2 883 | Requêtes HTTP `Range: bytes=0-0` sur le proxy `/api/assets/` |
| Références d’assets de cours couvertes | PASS — 3 719 | Rapport HTTP des assets internes |
| Parité linguistique FR/EN | PASS — 0 écart | `audit-bilingual-language-integrity.mjs --strict` |
| Parité de structure Markdown FR/EN | PASS — 0 écart | `audit-bilingual-markdown-structure.mjs --strict` |
| Validation des JSON de cours | PASS — 0 erreur | `pnpm validate-courses` |
| Typage TypeScript | PASS | `pnpm check` |
| Build de production | PASS | `pnpm build` |
| Régression applicative | PASS — 312 fichiers, 1 147 tests, 2 ignorés | `pnpm test --reporter=dot` |

## Corrections de cette passe finale

1. Les quatre incohérences Markdown restantes du cours **Scalable AI Models with PyTorch Lightning** ont été corrigées : les identifiants `model`, `__init__`, `LightningModule`, `setup`, `dataset` et `train_dataloader` utilisent désormais les mêmes délimiteurs de code dans les versions anglaise et française.
2. Les 73 occurrences de liens directs `/manus-storage/` réparties dans 9 cours ont été remplacées par leurs chemins équivalents sous `/api/assets/`. Les fichiers n’ont pas été recréés, modifiés ou inventés : le proxy serveur existant les délivre depuis le stockage de la plateforme, y compris avec support `Range` pour la lecture média et la reprise de téléchargement.
3. Les compteurs de catalogue et l’index de recherche ont été régénérés après les corrections : 180 cours, 3 003 écrans, 643 vidéos, 1 370 écrans verrouillés par une activité réellement affichée, 3 299 entrées de recherche.
4. Deux garde-fous ont été ajoutés : le studio de contenu et le pipeline `validate-courses` refusent désormais tout nouveau chemin `/manus-storage/` dans un cours. Un test de contrat couvre explicitement ce rejet.

## Note sur les avertissements non bloquants

Le validateur de quiz conserve **220 avertissements `near_duplicate_choice`**. Il s’agit de son heuristique Levenshtein appliquée notamment à des valeurs numériques, unités et identifiants techniques volontairement proches (par exemple `message_start` / `message_stop` ou différentes valeurs de tokens). Aucun doublon strict ni clé de réponse invalide n’est signalé ; la commande se termine avec **0 erreur**. Ces avertissements ne constituent pas des P1 du contrôleur pédagogique et ne bloquent donc pas la grille ci-dessus.

## Artefacts associés

- `pedagogical-audit/static-audit-data.json` — résultat du contrôleur structurel.
- `pedagogical-audit/internal-asset-url-migration.json` — trace des 73 liens normalisés.
- `pedagogical-audit/internal-asset-http-verification.json` — contrôle HTTP complet des assets de cours.
- `pedagogical-audit/11-recontrol-progress-2026-10-17.md` — progression comparée à l’audit initial.
