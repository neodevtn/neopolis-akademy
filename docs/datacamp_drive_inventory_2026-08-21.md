# Inventaire Drive — exports DataCamp

Source racine : <https://drive.google.com/drive/folders/10MF3EYrJnIjE-VzLsY3sZymclT4r2mbh>

Le dossier d’export actif est `Neopolis_Akademy_DataCamp_Exports_2026-08-21` (ID `11_a7CKhDh760XQ-qaF3EgMlMuAaO4sXl`). Son manifeste d’upload indique que chaque archive complète contient un `COURSE_MANIFEST.json`, les JSON canoniques de chapitres, les contenus Markdown, les PDF, vidéos, sous-titres, transcripts et ressources lorsqu’ils sont disponibles.

| Catalogue | Dossier Drive | ZIP complets inventoriés | Volume indicatif |
| --- | --- | ---: | ---: |
| Claude / Anthropic | `1FqAncy9BNtg2ZN8N3qOa12_28A4Y3xzj` | 8 | ~9,9 Go pour le lot manifesté Claude + n8n |
| OpenAI | `1ZMYAgHkA_EWNZTK9WQvMfup3a5D2C-iF` | 6 | ~589 Mo |
| Gemini | `1Ho-95OPJ56MboSMqt8NjcKzINqNJHhEk` | 8 | ~1,3 Go |
| n8n | `1J_oly_nhQjCEX24hy54VUiPivN4Ta4bk` | 3 | ~402 Mo |

## Paquet pilote validé pour l’analyse de format

`datacamp_introduction_to_claude_models_complete_media_package_2026-08-20.zip` — ID Drive `175sE9sPa6Ly8fROFyauBVNH3N0exm6kc`, 35 482 524 octets.

Son listing confirme une structure locale contenant le répertoire de cours `introduction-to-claude-models`, des données `preloaded/` associées aux activités et des ressources locales. Les archives volumineuses ne seront téléchargées qu’après lecture de leur manifeste et sélection de leur lot d’import.

## Décision provisoire sur les médias

La diffusion directe depuis Drive n’est pas retenue par défaut : les lecteurs web exigent un accès public stable, des en-têtes MIME/range et une politique CORS compatible pour chaque apprenant. Les manifestes détermineront quels médias peuvent être servis de manière fiable ; les médias effectivement intégrés devront disposer d’une URL de production stable, contrôlée et lisible par le lecteur Neopolis.
