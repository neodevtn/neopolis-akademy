# Audit en reprise — Claude with Amazon Bedrock

Le cours local comporte **80 écrans**, **12 exercices** tous rendus par un checkpoint et **45 ressources de téléchargement**. La description publique Anthropic couvre bien l’API AWS Bedrock avec `boto3`, conversations, streaming, extraction structurée, outils, RAG, MCP, Claude Code, Computer Use et optimisation. [1]

Le 16 septembre 2026, les 45 téléchargements ont été testés contre le serveur local. Ils retournent tous **HTTP 200** et un contenu non vide, sans URL répétée. Il n’existe donc pas, à ce stade, de panne technique à corriger dans les ressources déjà affichées.

L’inventaire de travail précédent signalait 48 ressources source contre 45 affichées. Ce déficit de trois éléments reste **non réconcilié**, faute d’une liste source suffisamment granulaire dans les données présentes. La mesure suivante doit consister à comparer un inventaire source autorisé ou à documenter des exclusions. Aucune ressource locale valide ne sera supprimée, ni aucun laboratoire cloud inventé pour combler ce manque.

## Anomalie de séquencement à réconcilier

Le fichier de cours contient une déclaration locale de huit sections et 67 intitulés pédagogiques. Dans la liste effectivement présentée aux apprenants, l’écran `Module Introduction` apparaît seulement en 64e position, suivi d’une concentration d’exercices, de deux écrans `Module Complete` et d’un écran `Key Takeaways`. La déclaration de sections couvre le socle de thèmes API, évaluations, prompting, tool use, RAG, fonctionnalités Claude, MCP et Claude Code/Computer Use, mais elle ne décrit ni la position des exercices ni le rôle respectif des deux écrans de complétion.

La comparaison déterministe identifie cinq écarts de libellé ou de couverture entre la déclaration et la liste : `Overview of Claude Models`, `PDF Support`, `Citations`, `Claude Code Setup` et la variante de casse `Implementing the Rag Flow` / `Implementing the RAG Flow`. Ces constats rendent justifiée une correction orthographique isolée, mais **pas** le déplacement automatique des composants de module : l’ordre pédagogique des exercices et des complétions doit être confirmé par l’inventaire source avant toute réorganisation.

## Référence

[1] [Claude with Amazon Bedrock — Anthropic Courses](https://anthropic.skilljar.com/claude-in-amazon-bedrock)
