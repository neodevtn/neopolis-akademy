# Notes source — DataCamp : L’IA pour les data analysts

## Provenance et intégrité

Le paquet officiel a été restauré depuis le dossier Drive `ai-for-data-analysts`. Les six fragments de 15 Mo ont été téléchargés, vérifiés individuellement et assemblés. L’archive assemblée `datacamp_ai-for-data-analysts_complete_media_package_2026-08-24.zip` a passé sa vérification SHA-256 avec l’empreinte canonique `879eea7babd31b54164315ebbaf7767c2f391d9f95993e7a5d16676577f1f73e`, puis le test d’intégrité ZIP.

## Sources canoniques consultées

| Source | Constat vérifié |
|---|---|
| `COURSE_MANIFEST.json` | 4 chapitres, 39 activités, 11 leçons Projector, avec 21 exercices visuels, 4 tris et 3 QCM. |
| `COMPLETENESS_REPORT.md` | 4/4 chapitres, 39/39 activités, 11/11 vidéos et 424/424 téléchargements locaux réussis. |
| `download_assets_manifest.json` | Inventaire local disponible dans le paquet restauré. |
| `PACKAGE_VALIDATION.json` | Rapport de validation inclus dans le paquet. |

## Décision pédagogique

Le manifeste ne contient aucun TP Cloud, DataLab, IDE ou exercice libre rubricable. Deux activités visuelles sans réponse déterministe ni actif local se reposaient toutefois sur une application DataCamp intégrée non livrée dans le paquet : `1.2 — Faites connaissance avec The Daily Grind` et `4.2 — Faites connaissance avec Board and Beyond`. Elles sont donc retirées du parcours, avec leurs références opérationnelles, plutôt que simulées ou converties en texte.

Les 37 activités restantes sont reproductibles avec les blocs standards Neopolis : 11 leçons Projector locales, 19 exercices visuels à réponse déterministe, 4 tris accessibles et 3 QCM. L’audit final consigne ainsi 39 activités source, 37 activités Neopolis et 2 omissions intentionnelles ; il ne relève ni XP visible, ni HTML brut, ni média externe ni candidat au retrait restant.

Les quatre exercices de classement sont conservés dans `bucket_sort`, déjà couvert par le composant standard accessible avec placement par clic, clavier et glisser-déposer. La sonde Projector a contrôlé les 11 médias : audio/vidéo local, PDF de slides local, 118 slides et 118 segments de transcription au total, sans dépendance fournisseur visible. La QA de publication séquentielle a réussi dans ses six étapes : TypeScript, validation JSON, tests, audit d’interactions, matrice desktop et matrice mobile.
