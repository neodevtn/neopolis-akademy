# Sources externes pour les pages publiques thématiques

Ces sources servent exclusivement à contextualiser l’offre de formation. Les chiffres cités dans les pages publiques devront conserver leur attribution et ne seront pas présentés comme des résultats propres à Neopolis Akademy.

| Source | Constat utilisable | URL |
|---|---|---|
| OECD, *Generative AI and the SME Workforce* | Enquête 2024 auprès de plus de 5 000 PME ; 31 % des PME interrogées utilisent l’IA générative et 65 % des utilisatrices déclarent une amélioration de la performance des salariés. | https://www.oecd.org/en/publications/generative-ai-and-the-sme-workforce_2d08b99d-en.html |
| OECD, *Generative AI and the SME Workforce* | Parmi les PME utilisatrices confrontées à un déficit de compétences, 39 % déclarent que l’IA générative a contribué à le compenser ; les compétences d’analyse/interprétation des données et de créativité gagnent en importance. | https://www.oecd.org/en/publications/generative-ai-and-the-sme-workforce_2d08b99d-en.html |
| World Economic Forum, *Future of Jobs Report 2025* | Publié le 7 janvier 2025, le rapport réunit la perspective de plus de 1 000 employeurs mondiaux, représentant plus de 14 millions de travailleurs dans 55 économies, pour examiner l’effet des transformations technologiques sur les emplois et les compétences d’ici 2030. | https://www.weforum.org/publications/the-future-of-jobs-report-2025/ |
| LinkedIn Economic Graph, *Work Change Report* | La publication décrit l’évolution rapide du travail, des métiers et des compétences à partir de données LinkedIn. | https://economicgraph.linkedin.com/research/work-change-report |

Les graphiques principaux des pages thématiques seront fondés sur le **catalogue Neopolis Akademy** (nombre de formations, cours, activités et compétences par thème), afin d’éviter toute extrapolation d’indicateurs externes.

Les données externes seront introduites comme un contexte sectoriel, avec un lien direct vers la publication d’origine. Elles ne seront jamais présentées comme une promesse de résultat ou comme un indicateur de performance de Neopolis Akademy.

## Décision de rendu et référencement

Les nouvelles routes publiques seront rendues en HTML par le serveur Express avant le repli SPA : `/formations-ia` pour l’index et `/formations-ia/:theme` pour chaque thème. Cette approche ciblée fournit aux robots le texte, les graphiques sous forme de données accessibles, les liens internes, les métadonnées Open Graph/Twitter, les données structurées et les statuts HTTP corrects, sans rendre les espaces authentifiés (`/training`, `/admin`, examens) indexables ni intégrer de données personnelles au HTML.

Les thèmes seront dérivés du registre canonique `trainingIndex.json` : les catégories existantes et les sous-catégories métier des TP. Les indicateurs de chaque page agrègeront seulement les formations, cours, activités, exercices et vidéos réellement déclarés dans ce registre. Un sitemap et la directive `Sitemap:` de `robots.txt` compléteront les signaux d’exploration.
