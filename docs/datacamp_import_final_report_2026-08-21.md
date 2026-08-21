# Bilan d’intégration DataCamp — 21 août 2026

## Périmètre et méthode de contrôle

Ce bilan couvre les **25 cours DataCamp conventionnels publiés** dans Neopolis Akademy : huit cours Claude / Anthropic, six cours OpenAI, huit cours Gemini et trois cours n8n. Chaque conversion conserve l’ordre `cours → chapitres → activités` du manifeste, utilise exclusivement des blocs inscrits au registre Neopolis, conserve le verrouillage séquentiel apprenant et référence les médias locaux par `/api/assets/`.

Les sources d’autorité sont `COURSE_MANIFEST.json`, puis, lorsqu’ils sont présents dans le paquet, `COMPLETENESS_REPORT.md`, `download_assets_manifest.json` et `MEDIA_VALIDATION_REPORT.json`. Les dossiers `raw_pages`, `raw_pages_full` et les états de débogage ne sont pas utilisés pour décider de l’import ou de sa conformité. L’inventaire Drive de référence est conservé dans le projet et pointe vers le dossier d’exports partenaire.[1]

> Les « exercices » ci-dessous désignent les **activités non vidéo** (`activités − vidéos`). Les compteurs principaux affichés dans le catalogue restent les **activités totales**, conformément à la règle de présentation DataCamp.

## Catalogue Claude / Anthropic — 8/8

| Cours publié | Chapitres | Activités | Exercices | Vidéos | Supports | Statut QA |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Introduction aux modèles Claude | 3 | 29 | 19 | 10 | 3 | Conforme |
| Software Development with Claude Code | 4 | 43 | 28 | 15 | 4 | Conforme |
| Claude 101 | 4 | 20 | 18 | 2 | 2 | Conforme |
| Claude Code in Action | 4 | 31 | 22 | 9 | 0 | Conforme |
| Introduction to Agent Skills | 3 | 18 | 12 | 6 | 0 | Conforme |
| Model Context Protocol: Advanced Topics | 2 | 32 | 22 | 10 | 2 | Conforme |
| Introduction to Subagents | 2 | 12 | 8 | 4 | 2 | Conforme |
| Claude Code 101 | 4 | 37 | 25 | 12 | 0 | Conforme |
| **Total Claude / Anthropic** | **26** | **222** | **154** | **68** | **13** | **8/8** |

## Catalogue OpenAI — 6/6

| Cours publié | Chapitres | Activités | Exercices | Vidéos | Supports | Statut QA |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Systèmes multimodaux avec l’API OpenAI | 2 | 24 | 17 | 7 | 2 | Conforme |
| Introduction aux embeddings avec l’API OpenAI | 3 | 37 | 26 | 11 | 3 | Conforme |
| Concevoir des systèmes d’IA avec l’API OpenAI | 3 | 36 | 25 | 11 | 3 | Conforme |
| Travailler avec l’API OpenAI Responses | 3 | 34 | 23 | 11 | 3 | Conforme |
| Travailler avec l’API OpenAI | 3 | 29 | 20 | 9 | 3 | Conforme |
| Ingénierie des prompts avec l’API OpenAI | 4 | 55 | 40 | 15 | 4 | Conforme |
| **Total OpenAI** | **18** | **215** | **151** | **64** | **18** | **6/6** |

## Catalogue Gemini — 8/8

| Cours publié | Chapitres | Activités | Exercices | Vidéos | Supports | Statut QA |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Introduction to Google Workspace with Gemini | 1 | 7 | 4 | 3 | 1 | Conforme |
| Gemini in Gmail | 1 | 7 | 3 | 4 | 1 | Conforme |
| Gemini in Google Meet | 1 | 10 | 5 | 5 | 1 | Conforme |
| Gemini in Google Sheets | 1 | 7 | 3 | 4 | 1 | Conforme |
| Gemini in Google Docs | 1 | 9 | 4 | 5 | 1 | Conforme |
| Gemini in Google Drive | 2 | 15 | 8 | 7 | 1 | Conforme |
| Gemini in Google Slides | 1 | 8 | 4 | 4 | 1 | Conforme |
| IA pratique avec Google Gemini et NotebookLM | 4 | 48 | 33 | 15 | 4 | Conforme |
| **Total Gemini** | **12** | **111** | **64** | **47** | **11** | **8/8** |

## Catalogue n8n — 3/3

| Cours publié | Chapitres | Activités | Exercices | Vidéos | Supports | Statut QA |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Initiation à l’automatisation de workflows avec n8n | 3 | 32 | 22 | 10 | 3 | Conforme |
| Créer des workflows marketing avec n8n | 3 | 23 | 15 | 8 | 3 | Conforme |
| Automatisation de workflows intermédiaires avec n8n | 4 | 40 | 27 | 13 | 0 | Conforme |
| **Total n8n** | **10** | **95** | **64** | **31** | **6** | **3/3** |

## Résultat consolidé

| Indicateur | Valeur |
| --- | ---: |
| Cours publiés | 25 |
| Chapitres | 66 |
| Activités totales | 643 |
| Activités non vidéo | 433 |
| Vidéos locales | 210 |
| Supports téléchargeables déclarés | 48 |
| Audits canoniques sans erreur | 25/25 |
| Paquets conventionnels importés | 25/25 |

Les 24 cours dont le paquet est conservé dans l’espace d’import local ont été repassés par le script d’audit canonique, sans erreur. Le paquet n8n initial a été téléchargé de nouveau depuis Drive le 21 août puis audité avec son manifeste, son rapport de complétude et son manifeste d’assets : **32 activités, 10 vidéos, 22 exercices non vidéo et 0 erreur**.

Les contrôles de lecture de production par requêtes `Range` ont confirmé l’accès réel à **159 références locales** sur les parcours récemment critiques : 55 médias MCP Advanced Topics, 18 médias Introduction to Subagents, 36 médias Claude Code 101 et 50 médias n8n initial. Le proxy `/api/assets/` relaie désormais le `GET Range` sans dépendre d’un `HEAD` amont et reprend les échecs temporaires du stockage avant de répondre au navigateur.[2]

La validation globale des JSON ne remonte **aucune erreur**. Les 223 avertissements existants signalent des choix de réponses textuellement proches dans des quiz historiques ; ils ne bloquent ni la structure, ni les réponses correctes, ni la publication de ce lot.

## Exclusion autorisée

`Building Claude Cowork Plugins` est la **seule exclusion**. Le dossier Drive Claude de l’inventaire ne contient que les huit ZIP complets ci-dessus et ne contient aucun ZIP conventionnel correspondant à ce cours. Aucun autre paquet conventionnel n’est bloqué ou écarté.[1]

## Références

[1]: https://drive.google.com/drive/folders/10MF3EYrJnIjE-VzLsY3sZymclT4r2mbh "Dossier Drive des exports DataCamp"
[2]: https://akademy.neodev.click "Neopolis Akademy — domaine de production"
