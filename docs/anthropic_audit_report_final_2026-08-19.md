# Rapport final — Audit des parcours préparatoires Anthropic

**Date de contrôle :** 19 août 2026  
**Périmètre :** Claude Certified Developer – Foundations, Claude Certified Architect – Foundations et Claude Certified Architect – Professional.  
**Auteur :** Achraf Khelil

## Conclusion

Les **17 cours** du périmètre ont été contrôlés — soit 5 cours Developer Foundations, 7 cours Architect Foundations et 5 cours Architect Professional. Les titres dégradés ont été normalisés, l’exercice AI Fluency a été reconstruit exclusivement avec les blocs standards existants, les ressources complémentaires Neopolis sont clairement séparées du contenu officiel, et les médias locaux sont désormais distribués via le proxy applicatif `/api/assets/`.

Les contrôles local et de production confirment **0 écart de titre attendu**, **0 bloc vidéo sans source exploitable**, **0 référence `/manus-storage/` restante**, et **285 références média sur 285 disponibles** avec un statut HTTP utilisable. Le verrouillage séquentiel existant est conservé : aucune règle de progression, de complétion ou de déverrouillage global n’a été assouplie.

## Sources de comparaison

Les intitulés et la structure des parcours ont été vérifiés par rapport au catalogue de préparation aux certifications Anthropic et aux pages Skilljar dédiées. [1] [2] [3] [4]

## Inventaire des cours et compteurs observés

| Parcours | Cours | Leçons | Chapitres | Blocs | Exercices | Checkpoints | Vidéos | Téléchargements |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Claude Certified Developer – Foundations | 5 | 5 | 51 | 153 | 62 | 10 | 37 | 0 |
| Claude Certified Architect – Foundations | 7 | 326 | 380 | 745 | 107 | 87 | 68 | 143 |
| Claude Certified Architect – Professional | 5 | 5 | 56 | 153 | 88 | 16 | 33 | 0 |
| **Total** | **17** | **336** | **487** | **1 051** | **257** | **113** | **138** | **143** |

> Le total est bien de **17 cours** : 5 + 7 + 5. Les décomptes ci-dessus sont produits à partir des JSON effectivement servis, et ne correspondent pas à des valeurs déclaratives du catalogue.

### Titres source contrôlés

| Parcours | Cours | Titre source validé |
| --- | --- | --- |
| Developer Foundations | 01 | MSO Foundations |
| Developer Foundations | 02 | Production-Grade Prompting, Agents & Tool Use |
| Developer Foundations | 03 | Claude Code, MCP & Integration |
| Developer Foundations | 04 | Production Engineering, Evals, and Security |
| Developer Foundations | 05 | Accelerators & IP Contribution |
| Architect Foundations | 01 | AI Fluency: Framework & Foundations |
| Architect Foundations | 02 | Building with the Claude API |
| Architect Foundations | 03 | Claude on Google Cloud |
| Architect Foundations | 04 | Claude Code in Action |
| Architect Foundations | 05 | Claude 101 |
| Architect Foundations | 06 | Claude with Amazon Bedrock |
| Architect Foundations | 07 | Introduction to Model Context Protocol |
| Architect Professional | 01 | Claude Platform & Solution Design |
| Architect Professional | 02 | Enterprise Integration & Production |
| Architect Professional | 03 | Responsible AI, Safety & Risk for Architects |
| Architect Professional | 04 | Stakeholder Engagement, Lifecycle & GTM |
| Architect Professional | 05 | Team Enablement & Operational Productivity |

## Corrections apportées

| Point audité | État avant correction | État final vérifié |
| --- | --- | --- |
| Titres du catalogue et métadonnées | Ponctuation, tirets, conjonctions et capitalisation dégradés sur les modules Developer et Architect Professional. | Titres normalisés dans `trainingIndex.json` et dans les `sourceCourseTitle` concernés, avec test de non-régression. |
| Chapitre AI Fluency « Exercise: Introduction to AI Fluency » | Consigne incohérente contenant les fragments `Option 3` / `Option 4`, Markdown brut et méta-instructions pédagogiques étrangères au cours. | Écran reconstruit avec un `callout` « Contenu officiel Anthropic », un bloc `content` de réflexion en trois questions, le `checkpoint` existant et le téléchargement. |
| Carte de téléchargement AI Fluency | L’image SVG de plume affichait du texte alternatif au lieu d’un visuel exploitable. | Le champ `image` de cette carte a été retiré ; le bouton de téléchargement reste présent et le PDF répond via `/api/assets/`. |
| Tutoriels du chapitre 3 | Les vidéos complémentaires pouvaient être confondues avec le contenu officiel Anthropic. | Un `callout` « Complément Neopolis » précède les vidéos et indique explicitement qu’elles ne sont pas officielles Anthropic. |
| Références média locales | Les JSON contenaient des chemins historiques `/manus-storage/`. | Les 285 références locales sont servies par `/api/assets/`; aucune référence historique ne subsiste dans les 17 JSON audités. |
| Répétition de la réflexion | Une première exécution répétée du correctif pouvait ajouter deux blocs de réflexion. | Le correctif est idempotent et reconstruit le chapitre avec un seul bloc de consigne ; le dernier contrôle visuel confirme l’absence de duplication. |

## Contrôle visuel apprenant

La prévisualisation authentifiée avec le compte de démonstration a confirmé les deux écrans ciblés. Le chapitre 2/3 affiche une seule consigne « Exercice : mettre les choses en pratique », l’encadré officiel Anthropic, les trois questions de réflexion, le bouton de téléchargement et aucun texte parasite de type `Option 3`. Le chapitre 3/3 affiche l’encadré « Complément Neopolis » avant les tutoriels.

Cette vérification a aussi confirmé que le chapitre demeure en position **2/3** et que les boutons de navigation restent soumis aux règles d’activité du cours. Le comportement de verrouillage séquentiel Neopolis a donc été préservé.

## Validation média

| Contrôle | Résultat |
| --- | ---: |
| Références média locales analysées | 285 |
| Réponses HTTP utilisables (`200` ou `206`) | 285 |
| Échecs HTTP | 0 |
| Références `/manus-storage/` restantes | 0 |
| Blocs vidéo sans `videoId`, `mp4Url` ou `audioUrl` | 0 |

Les résultats ci-dessus ont été reproduits sur **https://akademy.neodev.click** après publication. La première requête vers le PDF AI Fluency a dépassé le délai court de l’audit en raison d’un démarrage lent, puis le contrôle individuel a confirmé `HTTP 200` avec `content-type: application/pdf`; la seconde passe complète de l’audit de production a ensuite validé les **285/285** références. Les vidéos YouTube sont contrôlées structurellement par la présence d’un identifiant ou d’une source de lecture valide. Les fichiers locaux — PDF, images, archives et notebooks — sont contrôlés en HTTP via le proxy applicatif.

## Validation technique

| Contrôle | Résultat |
| --- | --- |
| `node scripts/audit-anthropic-certifications.mjs` | 17 cours, 0 écart de titre, 285/285 médias disponibles, 0 référence historique, 0 vidéo sans source |
| Audit sur `https://akademy.neodev.click` | 17 cours, 285/285 médias disponibles, 0 référence `/manus-storage/`, 0 vidéo sans source |
| `node scripts/validate-courses.mjs` | 0 erreur ; avertissements existants de similarité de choix de quiz conservés hors du périmètre de cette correction |
| `pnpm test -- --exclude server/email.test.ts` | 48 fichiers de tests réussis, 176 assertions réussies |
| `pnpm check` | TypeScript valide, sans erreur |
| Test dédié `server/anthropicAuditCorrections.test.ts` | 5 assertions de non-régression réussies |

## Artefacts livrés

| Fichier | Rôle |
| --- | --- |
| `scripts/apply-anthropic-audit-corrections.mjs` | Correctif idempotent des titres, de la leçon AI Fluency et des chemins média. |
| `scripts/audit-anthropic-certifications.mjs` | Audit reproductible des compteurs, titres, sources vidéo et disponibilités média. |
| `server/anthropicAuditCorrections.test.ts` | Tests de non-régression des titres, médias et deux chapitres AI Fluency. |
| `docs/anthropic_audit_media_validation_local_2026-08-19.json` | Résultat exhaustif du contrôle HTTP local des 285 références. |
| `docs/anthropic_audit_media_validation_production_2026-08-19.json` | Résultat exhaustif du contrôle HTTP de production des 285 références. |
| `docs/anthropic_audit_findings_2026-08-19.md` | Journal des constats et contrôles visuels. |

## Références

[1]: https://anthropic-partners.skilljar.com/page/claude-certification-exam-prep-courses "Anthropic — Claude Certification Exam Prep Courses"
[2]: https://anthropic-partners.skilljar.com/path/claude-certified-developer-foundations "Anthropic — Claude Certified Developer Foundations Prep Course"
[3]: https://anthropic-partners.skilljar.com/page/claude-certified-architect-foundations-prep-courses "Anthropic — Claude Certified Architect Foundations Prep Courses"
[4]: https://anthropic-partners.skilljar.com/path/claude-certified-architect-professional "Anthropic — Claude Certified Architect Professional Prep Course"
