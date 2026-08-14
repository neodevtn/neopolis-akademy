# Référence visuelle — pilote éditeur n8n

Date de référence : 13 août 2026.

## Captures avant modification

Les captures initiales ont été réalisées sur une fenêtre desktop de 1440 × 900 pour les parcours suivants :

| Écran | Route | Constat de référence |
|---|---|---|
| Fiche du cours | `/training/initiation_automatisation_workflows_n8n` | Chargement initial observé ; état à recontrôler après stabilisation du client. |
| Parcours apprenant | `/training/initiation_automatisation_workflows_n8n/initiation_automatisation_workflows_n8n__01` | Leçon 1, chapitre 1/9, lecteur vidéo Projector visible, navigation latérale de trois leçons. |
| Gestion de contenu | `/admin/content` | Vue catalogue de certifications et accès aux actions de consultation, simulation et édition. |

## Éléments à préserver dans le pilote

- Les 3 leçons, les 32 activités, les 10 vidéos et les 3 téléchargements du cours n8n.
- Les vidéos Projector avec slides synchronisées, les vidéos/audio locaux et les transcriptions.
- Les TP `cloud_exercise`, les QCM, les tris interactifs et les règles de progression existantes.
- Les liens médias en `/api/assets/` et le rendu responsive du parcours apprenant.
- Les contenus existants doivent rester éditables avec le fallback de source structurée.

## Audit initial de l’éditeur

| Élément | État actuel | Écart traité dans le pilote |
|---|---|---|
| Bibliothèque de blocs | Registre de 25 types avec palette et formulaires de champs | Conserver et enrichir l’expérience visuelle ; ne pas supprimer les types historiques. |
| Édition de texte | Champs `Textarea` avec support Markdown déclaré | Ajouter un WYSIWYG limité et assaini, tout en conservant une source Markdown structurée. |
| Sauvegarde | Modification de blocs envoyée directement au serveur via `onChange` | Introduire un brouillon local, validation, aperçu et sauvegarde explicite. |
| Mode avancé | JSON uniquement pour les types inconnus | Rendre le mode source disponible pour tous les blocs, avec validation et comparaison avant sauvegarde. |
| Médias | Champs URL manuels dans certains blocs | Créer une bibliothèque médias avec sélection réutilisable, type MIME et aperçu. |
| Slides Projector | Déclarées anciennes et non éditables | Les préserver comme données existantes en lecture ; proposer une inspection et une liaison média non destructive. |
| Checkpoints/examens | Éditeurs séparés mais génériques | Créer une interface dédiée : type de question, réponses, correction, règles de tirage et validation des identifiants. |

## Structure observée dans le cours pilote

Le pilote contient des vidéos locales `mp4Url`, des PDF de slides `slidesPdf`, des transcripts complets, des segments de transcript, des slides Projector et leurs images locales `/api/assets/`. Cette diversité impose une bibliothèque médias qui **référence** les fichiers et ne les déplace pas.

La persistance actuelle réécrit directement les JSON de cours. Le pilote doit donc ajouter une couche de brouillon et de validation côté interface, puis n’utiliser les procédures de sauvegarde qu’après confirmation explicite de l’administrateur.

## Contrôle visuel intermédiaire

Le mode édition du cours pilote s’ouvre directement avec la navigation leçon/chapitre, la palette de blocs, les actions Médias, Mode avancé, Annuler et Sauvegarder. La vue de banque de questions doit faire l’objet d’une nouvelle capture ciblée après le redémarrage de l’interface, la capture pleine page initiale n’ayant pas abouti.

## Contrôle après modification

Les captures desktop confirment que le parcours apprenant n8n conserve son lecteur Projector et la progression `1/9`, sans modification de ses médias ni de ses données. La vue d’édition affiche désormais les actions de brouillon, Bibliothèque médias et Mode avancé.

La première capture mobile a révélé un débordement horizontal de l’éditeur. Le conteneur a été converti en mise en page verticale sur mobile, avec la liste de chapitres au-dessus de l’éditeur. La seconde capture mobile confirme l’absence de colonne latérale débordante. Un incident ponctuel de chargement dynamique après HMR a été résolu par redémarrage, sans erreur TypeScript.

## Critères de comparaison après modification

1. La page apprenant affiche les mêmes contenus, médias, interactions et compteurs qu’avant la migration de l’éditeur.
2. L’admin peut ajouter, sélectionner et prévisualiser un bloc ou un média sans modifier le JSON brut par défaut.
3. Le mode avancé valide la source et refuse les données incompatibles avant sauvegarde.
4. Les captures desktop et mobile après modification doivent être prises sur ces mêmes routes.
