# LLM Course — Hugging Face Learn

## Sources et intégrité

| Élément | Valeur |
|---|---|
| Fournisseur | Hugging Face Learn |
| Paquet | `llm-course` |
| Licence source | Apache-2.0 |
| Pages canoniques | 103 |
| Pages checkpoint/lab | 82 |
| Vidéos déclarées par le manifeste | 98 |
| Ressources complémentaires | 11 |
| Fichiers source manquants | 0 |

## Conversion Neopolis

Les 103 pages ont été réparties, dans l’ordre canonique, en 14 unités. Les pages de checkpoint et de laboratoire sont converties en TP standards `cloud_exercise` répondables et bloquants. Le contenu MDX est conservé dans des blocs de contenu ; les URLs externes qui ne sont pas des vidéos ne sont pas publiées dans le JSON. Les 11 fichiers complémentaires du paquet sont exposés exclusivement par `/api/assets/`.

## Contrôles visuels initiaux

Le contrôle desktop affiche le cours dans le lecteur standard, avec l’en-tête « Hugging Face Learn · Cours LLM », les 14 leçons et la première unité active. Le contrôle mobile préserve la lisibilité de cet en-tête et le panneau de progression. Les écrans de leçons ultérieures sont affichés comme verrouillés pour un apprenant ; le mode révision administrateur reste visible sur la capture de QA. Le bandeau de consentement peut recouvrir le bas du premier écran mais ne bloque pas le lecteur.

## Écarts source documentés

Les 98 vidéos déclarées sont des références YouTube du manifeste ; le paquet ne les fournit pas sous forme de médias locaux téléchargeables. Elles restent donc déclarées comme vidéos source dans le catalogue, sans être remplacées par une URL média externe dans les blocs de contenu. Les illustrations distantes non incluses dans le paquet sont signalées dans le texte, sans hotlink.

## Correction de lisibilité

La première conversion répétait le contenu de la page dans le TP et affichait certaines balises de mise en page MDX. Le convertisseur conserve maintenant le contenu une seule fois, place un objectif court dans le TP et retire les balises MDX de présentation. La nouvelle capture desktop confirme une lecture propre du contenu initial et une zone de TP distincte plus bas dans le parcours.

## Audit local complémentaire

Les 11 ressources complémentaires sont testées à HTTP 200 via `/api/assets/`. La validation TypeScript, la validation de cours et la suite Vitest sont réussies : 113 fichiers et 372 tests. L’index de recherche est régénéré avec les entrées LLM Course ; les 14 unités possèdent les tags de compétence du manifeste.
