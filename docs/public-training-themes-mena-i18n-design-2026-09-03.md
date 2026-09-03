# Pages publiques multilingues — conception SEO MENA

## Objectif

Les pages publiques de découverte des formations doivent être accessibles intégralement en **français**, **anglais** et **arabe**, sans rendre l’espace d’apprentissage privé indexable. Le contenu reste fondé sur le catalogue Neopolis Akademy ; seules les formulations éditoriales et les libellés de présentation sont localisés.

## Structure d’URL retenue

| Langue | Index | Détail d’un thème | Langue SEO |
|---|---|---|---|
| Français | `/formations-ia` | `/formations-ia/:themeSlug` | `fr-FR` |
| Anglais | `/en/ai-training` | `/en/ai-training/:themeSlug` | `en` |
| Arabe | `/ar/ai-training` | `/ar/ai-training/:themeSlug` | `ar` |

Chaque URL possède une balise canonical vers elle-même et des balises `hreflang` pointant vers les deux alternatives et vers `x-default` en français. Le sitemap inclut explicitement toutes les variantes. Cette organisation évite qu’un paramètre client ou la langue stockée dans le navigateur soit la seule source de langue indexable.

## Contenus et localisation

Les titres, descriptions, niveaux et formats des formations affichées sont obtenus à partir de la même sélection de catalogue. Les contenus éditoriaux propres aux thèmes, les indicateurs, les appels à l’action, la navigation, les pages 404 et les données structurées sont localisés. Les éléments sans traduction native du catalogue sont traduits dans une ressource contrôlée et versionnée ; les identifiants, nombres, métriques et URLs de formation restent inchangés.

La variante arabe déclare `lang="ar"` et `dir="rtl"`. Les composants de distribution, de navigation, de barres de progression et de cartes utilisent des propriétés CSS logiques afin de conserver l’ordre de lecture et l’absence de débordement en RTL.

## Ciblage MENA prudent

Le référencement emploie les expressions de recherche adaptées aux trois langues — notamment « formations IA gratuites par métier », « free AI training by profession » et « تدريب مجاني في الذكاء الاصطناعي حسب المهنة » — sans déclarer une disponibilité, une accréditation ou une implantation pays par pays non vérifiée. Le contenu décrit une offre numérique Neopolis Akademy utilisable par des professionnels de la zone MENA selon les conditions d’accès de la plateforme, sans promesse d’emploi ou de résultat.

## Contrôles attendus

Les contrôles automatisés doivent couvrir les trois index, une page thématique dans chaque langue, la présence du contenu HTML, du `title`, de la description, du canonical, de `hreflang`, d’Open Graph, de JSON-LD, du sitemap et des 404 localisées. Ils devront aussi vérifier l’absence de débordement à 390 × 844 et 375 × 667, y compris pour l’arabe RTL.

## Revue visuelle locale

Les pages `/en/ai-training`, `/ar/ai-training` et `/ar/ai-training/finance-comptabilite-controle-gestion` ont été revues sur un viewport desktop. Les textes, cartes, indicateurs, navigation de langue et contenu de contexte sont rendus dans leur langue cible ; l’arabe utilise un ordre RTL et les cartes, barres d’activités, listes de compétences et appels à l’action restent alignés et lisibles. La sonde automatisée confirme en outre l’absence de débordement horizontal aux largeurs 390 et 375 pixels.

La revue visuelle mobile à 390 × 844 confirme également que la version arabe conserve une largeur de page stable, des indicateurs lisibles, des cartes empilées correctement, une navigation compacte et des appels à l’action accessibles. La page Finance conserve le sens de lecture RTL pour les répartitions, les compétences et les formations associées.
