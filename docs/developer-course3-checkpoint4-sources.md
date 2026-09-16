# Sources officielles — checkpoint 4 Developer 3

Le checkpoint 4 tronqué du cours Developer 3 décrit une Skill de déploiement empaquetée en plugin qui échoue sur la machine d’un collègue. La documentation publique officielle permet de confirmer le principe de portabilité sans prétendre reconstituer le texte Skilljar.

| Source | Élément retenu pour la correction |
|---|---|
| [Skills Claude Code](https://code.claude.com/docs/en/skills) | Une Skill est un dossier contenant un fichier `SKILL.md` et peut être distribuée dans un plugin. |
| [Plugins Claude Code](https://code.claude.com/docs/en/plugins) | Un plugin peut regrouper des Skills et des fichiers associés ; l’exécution doit être testée dans le contexte où le plugin est installé. |
| [Hooks Claude Code](https://code.claude.com/docs/en/hooks) | `${CLAUDE_PROJECT_DIR}` désigne la racine du projet ; `${CLAUDE_PLUGIN_ROOT}` désigne les fichiers inclus dans le plugin. Ces variables évitent une référence à un chemin absolu spécifique à la machine de l’auteur. |

La proposition générée par Claude Sonnet s’appuie uniquement sur ces faits et le bloc déjà présent dans le cours. Elle reste non appliquée tant que le bloc standard de choix unique n’a pas la validation serveur générique requise.

Le contrôle du lecteur standard du 16 septembre 2026 confirme que `chapter=4` correspond à l’écran « Points clés à retenir » : le checkpoint de portabilité appartient donc à `chapter=3` dans l’URL du lecteur, bien que son identifiant de contenu soit `chapter_05`.

Le même contrôle sur `chapter=3` confirme le rendu du bloc standard de choix unique : les quatre options, l’indice et le bouton « Vérifier la réponse » sont présents sous le scénario de portabilité. Avant soumission, le lecteur ne met aucune option en évidence comme correcte.

Après soumission volontaire de la réponse erronée, le lecteur affiche uniquement l’option choisie en erreur et une explication renvoyée par le serveur ; les trois autres choix restent neutres et aucune bonne réponse n’est révélée visuellement. Le bloc peut ensuite être réinitialisé et mélange de nouveau les options.

Après réinitialisation, l’option portable fondée sur `${CLAUDE_PLUGIN_ROOT}` demeure disponible malgré le mélange des choix ; elle a été sélectionnée pour le contrôle de validation positive et de déverrouillage.

La soumission de cette réponse affiche « Correct ! », met en évidence uniquement le choix sélectionné et restitue l’explication pédagogique serveur. Le comportement de la réponse erronée et celui de la bonne réponse ont donc été vérifiés dans le lecteur standard, sans création d’interface spécifique au cours.

Après validation positive, le bouton « Suivant » du lecteur est actif. La suite de tests complète compte 831 tests réussis ; son unique échec concerne un checkpoint dupliqué préexistant dans `claude_certified_architect_foundations__04`, parcours expressément hors périmètre de ce lot Developer et non modifié.

Après propagation du checkpoint `0961376d`, les deux domaines publics servent le bloc `checkpoint4_fix_plugin_definition` avec `serverValidated: true`, sans clé `correctAnswer` ni `explanation` dans la réponse tRPC `course-data` non mise en cache. Le manifeste public sert la version `7812a3e8d4302922` au moment du contrôle.
