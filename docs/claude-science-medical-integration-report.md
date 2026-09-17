# Rapport d’intégration — Claude Science pour la recherche médicale

**Auteur :** Manus AI  
**Version contrôlée :** checkpoint `1b070d47`  
**URL apprenant :** `https://akademy.neodev.click/training/claude_science_recherche_medicale/claude_science_recherche_medicale__01`  
**Catalogue public :** `https://akademy.neodev.click/formations-ia/catalogue/claude-science-pour-la-recherche-medicale`

## Conclusion

Le cours **« Prise en main de Claude Science pour la recherche médicale »** est intégré et publié dans Neopolis Akademy. L’import reprend la structure livrée par `COURSE.json` sans recopier les articles de référence. Il ajoute seulement les libellés, encadrements pédagogiques et alternatives textuelles nécessaires au lecteur standard Neopolis. Le parcours est accessible aux apprenants authentifiés, référencé dans la recherche interne et présent dans la catégorie **IA pour la recherche et la santé** ainsi que dans le thème public **Data, BI & Recherche**.

## Périmètre livré

Le cours comprend huit modules et trente-deux leçons. Chacune des trente-deux leçons contient un checkpoint à correction côté serveur. Chaque module se termine par un TP, puis un quiz de huit questions ; les huit quiz représentent donc soixante-quatre questions. Les identifiants de leçon, de chapitre et de checkpoint sont déterministes afin que toute évolution ultérieure du contenu puisse conserver la progression déjà enregistrée.

Les 228 écrans de `COURSE.json` sont convertis en blocs standards Neopolis. Seize écrans supplémentaires correspondent aux huit TPs et aux huit quiz de module, ce qui porte le lecteur à 244 écrans paginés. Une quatrième vidéo déclarée dans le manifeste mais non associée à un écran source est placée comme **ressource facultative non bloquante**. Elle ne modifie pas le séquencement du cours.

> **Limite clinique.** Le premier écran, chacun des huit TPs et le projet final affichent un avertissement explicite : le parcours repose uniquement sur les données synthétiques fournies et ne produit ni diagnostic, ni triage, ni conseil thérapeutique. [1] [2]

## Contrôles effectués

| Contrôle | Résultat | Preuve synthétique |
|---|---:|---|
| Structure de cours | PASS | 8 modules, 32 leçons, 32 checkpoints, 8 TPs, 8 quiz et 64 questions, vérifiés par contrat automatisé. |
| Verrouillage séquentiel | PASS | La leçon suivante exige le checkpoint de la leçon précédente. Le quiz serveur exige les quatre checkpoints du module et le TP validé. |
| Confidentialité des évaluations | PASS | La réponse publique `/api/trpc/course-data/claude_science_recherche_medicale__01` renvoie 200 et ne contient ni `correctAnswer`, ni correction ; les corrections ne sont renvoyées qu’après soumission du quiz. |
| Points de compétences | PASS | Chaque TP validé et chaque quiz réussi utilise les événements de compétences Neopolis ; aucune mention ni mécanique XP n’est introduite. |
| Ressources de médiathèque | PASS | Les 19 fichiers téléchargeables et les 5 captures référencées utilisent exclusivement des chemins stables `/api/assets/…`. Les 24 URL actives répondent toutes HTTP 200 sur le domaine public. |
| Captures documentaires | PASS | Les captures sont rendues par le bloc réutilisable `annotated_screenshot`, avec texte alternatif, légende et liens d’attribution. |
| Vidéos | PASS avec limite d’observation audio | Les quatre URL YouTube répondent 200 via oEmbed. Les quatre lecteurs `youtube-nocookie` ont été lancés dans le cours et conservés plus de 20 secondes avec le contrôle de réactivation audio proposé par YouTube. L’environnement headless ne fournit pas de mesure de niveau sonore, mais aucune erreur d’iframe ni de démarrage n’a été observée. |
| Recherche interne | PASS | L’index contient 245 entrées pour ce cours : 1 fiche cours et 244 écrans. L’index global contient 4 066 entrées. |
| Catalogue et SEO public | PASS | La fiche catalogue publique, le thème Data/BI/Recherche et ses métadonnées répondent 200. |
| Régression globale | PASS | `pnpm build` réussit. La suite compte 262 fichiers, 877 tests réussis et 2 ignorés. La matrice de publication est à 9/9. |

## Médias et traçabilité

Les vidéos restent intégrées via YouTube et ne sont pas téléchargées. Avant lecture, chaque écran vidéo indique la langue, la durée et un objectif. Après lecture, il présente des questions de réflexion et une alternative textuelle française originale. La vidéo Anthropic officielle est étiquetée comme telle ; les trois vidéos externes citées conservent une provenance explicite afin de ne pas les présenter comme du contenu Neopolis ou Anthropic officiel.

L’[inventaire des ressources](./claude-science-medical-asset-inventory.md) fournit pour chaque fichier de la médiathèque le chemin source, le type MIME, la taille, l’empreinte SHA-256 et l’URL stable. La [matrice écran source vers bloc Neopolis](./claude-science-medical-screen-block-matrix.md) assure la traçabilité de chaque écran pédagogique sans reproduire les textes des articles.

## Validation visuelle et accès

Les captures anonymes aux formats 1440×900, 768×1024 et 390×844 confirment que le contenu et les réponses restent derrière la passerelle d’authentification standard, sans débordement horizontal ni double barre de défilement. Une vérification dans la session apprenant a confirmé le rendu paginé, la navigation Précédent/Suivant, l’avertissement non clinique, la capture attribuée et les écrans vidéo enrichis. Le parcours est nouveau : il n’existait donc pas de page Neopolis antérieure pertinente pour une capture « avant ».

Les notifications de communication obligatoires existantes n’ont pas été validées pendant le contrôle, afin de ne pas modifier l’état de lecture du compte de test. Elles n’empêchent pas le contrôle des composants du cours, mais peuvent recouvrir temporairement une capture dans une session déjà connectée.

## Références

[1]: https://claude.com/product/claude-science "Claude Science (beta)"
[2]: https://claude.com/docs/claude-science/overview "Claude Science documentation overview"
[3]: https://www.youtube.com/watch?v=NG4MEDQz30A "Getting Started with Claude Science — Anthropic's AI for Research"
[4]: https://www.youtube.com/watch?v=i8g1pdzWJik "The Briefing: AI for Science"
[5]: https://www.youtube.com/watch?v=qNmgm4Bs4Dw "HISTORA demo"
[6]: https://www.youtube.com/watch?v=dumqHskJ-ZI "Claude Science première prise en main"
