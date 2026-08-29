# Contrôles visuels — IA appliquée aux métiers - TP

## Échantillon TP 01

Les captures exécutées le 29 août 2026 montrent que le lecteur affiche le titre canonique, le contexte métier, les compétences acquises et les étapes du TP dans les blocs standards de la plateforme. En vue desktop, la navigation latérale présente les six écrans du parcours. En vue mobile 390×844, le header est compact, la carte de TP tient dans le viewport et aucun débordement horizontal n’est observé par la sonde.

Les captures ont été effectuées avec le compte administrateur de QA pour rendre vérifiables les huit sous-catégories sans dépendre du déverrouillage entre cours. Les contrôles d’interactions ont ensuite été rejoués avec le compte apprenant de QA ; celui-ci étant déjà en mode révision pour le TP pilote, le rapport distingue explicitement cet état autorisé de la vérification unitaire des verrous séquentiels.

## Contrôle de production

Le checkpoint `9a6d91ae` a été confirmé sur `https://akademy.neodev.click`. Les huit TP représentatifs 01, 07, 11, 17, 22, 27, 32 et 37 se rendent sans débordement horizontal en desktop et à 390×844. La sonde de production a confirmé le lien source en nouvel onglet, le checkpoint avec feedback après réponse, la zone de preuve du mini-projet avec correction post-soumission et le quiz final avec quatre QCM et un tri. La fiche et la carte de la rubrique affichent les métriques agrégées calculées : 240 activités et 280 exercices interactifs.
