# Sources AI News — sélection vérifiée

La rubrique AI News suivra le principe proposé par l’article Readless : associer **annonces officielles**, **analyse éditoriale** et **recherche primaire**, sans réécrire ni republier les contenus sources.[^1]

| Source | Flux RSS validé | Rôle dans AI News |
|---|---|---|
| OpenAI News | `https://openai.com/news/rss.xml` | Annonces officielles de produits, modèles et politiques |
| Hugging Face Blog | `https://huggingface.co/blog/feed.xml` | Modèles, outillage et retours pratiques open source |
| Google AI Blog | `https://blog.google/technology/ai/rss/` | Annonces modèles et plateformes Google |
| MIT Technology Review — AI | `https://www.technologyreview.com/topic/artificial-intelligence/feed/` | Analyse éditoriale et contexte industriel |
| MarkTechPost | `https://www.marktechpost.com/feed/` | Veille de publications et lancements à cadence soutenue |
| arXiv cs.AI | `https://rss.arxiv.org/rss/cs.AI` | Recherche primaire, à lire comme prépublication |

Les six flux ont été interrogés le 29 août 2026. Les flux OpenAI, Hugging Face, Google, MarkTechPost et arXiv ont retourné des RSS XML actifs ; le flux MIT Technology Review a retourné des publications de sa rubrique IA. Le flux `https://www.anthropic.com/news/rss.xml`, cité par l’article comme source d’actualité, n’a pas été retenu car il ne répond pas avec un flux RSS exploitable. Les flux seront lus à la demande par le serveur et mis en cache temporairement, sans tâche planifiée ni copie du contenu complet des éditeurs.

[^1]: [Readless — *Best RSS Feeds for AI News in 2026: 10 Verified Sources*](https://www.readless.app/blog/best-ai-news-rss-feeds-2026)
