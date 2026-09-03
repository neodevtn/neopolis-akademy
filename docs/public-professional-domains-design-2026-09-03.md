# Pages publiques par grands domaines métier

## Source et principe de classement

La taxonomie publique repose sur le registre canonique `client/src/data/trainingIndex.json`, révision `2026-08-29-ia-appliquee-metiers-tp`. L’inventaire contrôlé par `scripts/audit-professional-domains.mjs` a identifié **115 formations** et **177 cours**. Les grands domaines ne dupliquent pas le catalogue : ils appliquent des règles de rattachement par catégorie, sous-catégorie ou identifiant de formation canonique.

Chaque formation peut appartenir à plusieurs domaines lorsqu’elle traite réellement de plusieurs contextes professionnels. Deux exemples explicites sont prévus : la formation d’IA pour la finance apparaît dans **Finance & Comptabilité** et dans **Data, BI & Recherche** ; le parcours de gouvernance de l’IA apparaît dans **Stratégie & Transformation** et dans **Juridique & Conformité**. Les agrégats sont calculés séparément par domaine et ne doivent jamais être additionnés comme un total global.

| Domaine public | Rattachements canoniques | Cas d’usage dérivés du catalogue |
|---|---|---|
| Comptabilité & Finance | `finance_accounting`, `finance_accounting_control`, formation IA pour la finance | tenue comptable, traitement de factures, relances et reporting financier |
| Informatique & Développement | ingénierie IA, API générative, agents IA, préparation aux certifications | RAG, systèmes IA, agents et développement assisté |
| Data, BI & Recherche | data/BI, sous-catégorie data et recherche, formation IA pour la finance | analyse conversationnelle, requêtes contrôlées, recherche sourcée et RAG documentaire |
| Administratif & RH | productivité au travail, transformation de processus, sous-catégories RH et opérations | traitement de CV, assistants e-mail, tâches et coordination |
| Marketing, Ventes & Relation client | sous-catégories ventes/CRM, marketing/contenu et support/e-commerce | prospection, contenus, CRM, support et e-commerce |
| Juridique & Conformité | sous-catégorie juridique, formation de gouvernance IA | revue contractuelle, analyse de risques, classification documentaire et gouvernance |
| Stratégie & Transformation | fondamentaux et gouvernance IA, transformation de processus | cartographie, documentation, évaluation et portefeuille de cas d’usage |

## Contenu et référencement

Chaque page détail contient un paragraphe qui explicite les activités professionnelles abordées, une section **Cas d’usage dans les formations associées** et la liste des formations réellement rattachées. Les cartes de cas d’usage utilisent les titres et compétences du catalogue, sans promesse de productivité, de conformité ou de résultat métier.

Chaque URL publique dispose de valeurs SEO localisées pour le français, l’anglais et l’arabe : un titre, une description et quatre à six mots-clés. Les variantes conservent les liens `hreflang`, le canonical auto-référent, les métadonnées sociales, les données structurées `CollectionPage`/`Course` et le sitemap multilingue. Les anciens slugs thématiques sont redirigés de manière permanente vers le grand domaine le plus pertinent afin de préserver les liens déjà publiés.

## Contrôles locaux

Les pages **Comptabilité & Finance**, **Informatique & Développement** et **Administratif & RH** ont été vérifiées en bureau à 1280 × 720. Les paragraphes de domaine, les indicateurs dérivés du catalogue, la répartition des activités, les cas d’usage et les formations associées sont présents. Les contrôles mobiles à 390 × 844 ont couvert la page Finance en français, Commerce/Marketing/Relation client en anglais, ainsi qu’Administratif/RH en arabe RTL. Les grilles se replient correctement en une colonne et aucun débordement horizontal n’a été constaté.

## Validation publiée

Après propagation du checkpoint `9a08b922`, la sonde multilingue a été rejouée sur `https://akademy.neodev.click`. Les index et pages Finance en français, anglais et arabe ont tous répondu HTTP 200 à 1280 × 720, 390 × 844 et 375 × 667. Les contrôles confirment pour chaque page le titre attendu, la description, cinq mots-clés, le canonical, les alternatives `hreflang`, Open Graph, JSON-LD et l’absence de débordement horizontal. Les routes inconnues restent en HTTP 404 avec `noindex`; les anciens slugs de thème Finance redirigent en HTTP 301 vers le grand domaine correspondant. La page Finance publiée a aussi été inspectée dans le navigateur : son paragraphe métier, sept formations associées, indicateurs catalogue et quatre cas d’usage sont affichés.
