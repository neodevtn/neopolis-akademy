# Developer Foundations — Cours 5 : restauration complémentaire

**Périmètre.** Ce lot couvre uniquement `claude_certified_developer_foundations__05`. Il répare des tableaux concaténés et des cartes visiblement tronquées, sans créer d’étude de cas, de TP, d’activité racine ou de média qui ne serait pas sourcé.

| Chapitre | Élément restauré | Vérification locale |
| --- | --- | --- |
| `chapter_01` — Emballage réutilisable | Deux tableaux d’emballage et trois cartes de postmortem | Le lecteur standard affiche les deux tableaux avec en-têtes et cellules Markdown, le 16 septembre 2026. |
| `chapter_03` — Contribution | Tableau de contribution et deux cartes | Contrat de structure et de non-troncature ajouté. |
| `chapter_09` — Déploiement et versionnage | Tableau plateforme/versionnage | Contrat de structure ajouté. |
| `chapter_13` — Frontières de confiance | Deux cartes tronquées | Contrat de non-troncature ajouté. |

Le correctif `scripts/repair-developer-course5-checkpoints.mjs` applique les remplacements uniquement lorsque le segment source apparaît une fois, puis ne modifie plus la donnée lors d’un second passage. Les formulations françaises hybrides qui restent dans certains tableaux font l’objet d’un lot séparé et ne sont pas considérées comme corrigées par cette restauration structurelle.

## Localisation complémentaire limitée

Une analyse structurée, exécutée exclusivement avec **Claude Sonnet**, a ensuite appliqué dix-huit localisations exactes dans les chapitres Emballage réutilisable et Déploiement et versionnage. Elles couvrent les verbes, libellés de tableaux et termes génériques restés en anglais, tout en préservant les noms d’offres, fournisseurs, chemins d’API, modèles, identifiants et termes techniques ambigus. Trois éléments — `First-party Claude API`, `Claude Platform on AWS` et `rollback` — sont explicitement laissés inchangés, car ils peuvent représenter un nom de produit ou un terme technique à conserver.
