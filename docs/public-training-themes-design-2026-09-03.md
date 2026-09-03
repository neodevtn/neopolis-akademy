# Conception des pages publiques « Formations IA gratuites par métier »

Les pages publiques ne sont pas une copie du tableau de bord authentifié. Elles constituent une couche éditoriale dérivée du registre canonique `trainingIndex.json`, sans données de progression ni information personnelle. Chaque page présente des formations, cours, activités, exercices et vidéos réellement déclarés dans le catalogue.

| Route publique | Source canonique | Angle éditorial |
|---|---|---|
| `/formations-ia` | Toutes les catégories et sous-catégories sélectionnées | Vue d’ensemble de l’offre de formations IA gratuites et orientation par métier. |
| `/formations-ia/ia-au-travail-productivite` | `business_ai_literacy`, `workplace_ai_productivity` | Fondamentaux, gouvernance et usages professionnels. |
| `/formations-ia/ingenierie-ia-rag-mlops` | `fullstack_ai_engineering`, `generative_ai_api_development`, `claude_ai_agents` | Conception, déploiement et exploitation de systèmes IA. |
| `/formations-ia/data-bi-analytique` | `bi_data_analytics`, sous-catégorie `data_bi_research` | Analyse, reporting et décision appuyée par l’IA. |
| `/formations-ia/ventes-crm-prospection` | Sous-catégorie `sales_crm_prospecting` | Prospection, CRM et opérations commerciales. |
| `/formations-ia/marketing-contenu` | Sous-catégorie `marketing_content` | Contenu, acquisition et automatisation marketing. |
| `/formations-ia/support-client-ecommerce` | Sous-catégorie `support_ecommerce` | Support, expérience client et opérations e-commerce. |
| `/formations-ia/finance-comptabilite-controle-gestion` | `finance_accounting`, sous-catégorie `finance_accounting_control` | Comptabilité, facturation, contrôle et automatisation financière. |
| `/formations-ia/ressources-humaines-recrutement` | Sous-catégorie `hr_recruitment` | Recrutement, RH et opérations talent. |
| `/formations-ia/productivite-secretariat-operations` | Sous-catégorie `productivity_operations` | Administration, documentation et opérations. |
| `/formations-ia/juridique-contrats-conformite` | Sous-catégorie `legal_contracts_compliance` | Contrats, conformité et opérations juridiques. |

Chaque page intégrera une introduction contextualisée, une grille de formations, des indicateurs calculés à partir du catalogue, une représentation accessible des volumes, les métiers cibles, une invitation vers le catalogue authentifié et des liens vers les autres thèmes. L’index citera l’OCDE comme contexte de transformation des compétences, sans en tirer de promesse commerciale. Les métadonnées comprendront un titre, une description, canonical, Open Graph, Twitter et JSON-LD `CollectionPage` / `ItemList`.

## Contrôle local initial

Le 3 septembre 2026, le rendu HTML direct de l’index `/formations-ia` et de la page Finance `/formations-ia/finance-comptabilite-controle-gestion` a été vérifié dans un navigateur. Les titres, les indicateurs, les cartes de thème, le graphique d’activités, les liens vers le catalogue et les données réelles du catalogue étaient visibles sans dépendre de JavaScript. La page Finance affichait six parcours, six cours, 107 activités et 35 exercices, valeurs agrégées du registre au moment du contrôle.

La sonde `scripts/check-public-training-themes-browser.mjs` a confirmé localement les réponses HTTP 200, les titres, canonical, Open Graph, JSON-LD et le contenu attendu sur les deux pages à 1280 × 720, 390 × 844 et 375 × 667. Chaque mesure a retourné `scrollWidth = clientWidth`, donc aucun débordement horizontal. La route d’un thème inconnu retourne HTTP 404 avec `noindex, follow`; `sitemap.xml` contient l’index et la route Finance. Une vérification équivalente sur le domaine public reste prévue après le checkpoint.
