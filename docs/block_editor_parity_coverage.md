# Parité entre rendu apprenant et édition de contenu

## Principe appliqué

L’éditeur ne limite plus ses formulaires aux seuls champs déclarés manuellement dans le registre. À l’ouverture d’un bloc, il hydrate les paramètres runtime réellement présents dans le JSON du cours et les rend éditables. Le mécanisme conserve les champs non reconnus plutôt que de les effacer.

| Famille de paramètres | Comportement dans l’éditeur |
|---|---|
| Vidéo YouTube | URL, identifiant vidéo, URL de consultation et URL intégrée sont visibles et modifiables. |
| Vidéo locale et streaming | MP4, HLS, audio de repli et URL de média sont visibles et sélectionnables depuis la bibliothèque. |
| Accessibilité et apprentissage | Transcription, segments, sous-titres français/anglais et supports PDF restent modifiables. |
| Projector | Slides, synchronisation et durée sont conservées sous forme structurée. |
| Blocs spécifiques | Les paramètres runtime non déclarés par le registre sont ajoutés au formulaire avec un type adapté : texte, nombre, booléen ou JSON. |
| Variantes bilingues | Les objets `en`/`fr` restent des champs multilingues, sans perte lors de l’ouverture ou de la sauvegarde. |

## Contrôles automatisés

Les tests parcourent tous les JSON de cours publiés et vérifient que chaque champ persistant non interne d’un bloc est exposé dans le formulaire d’édition. Un second jeu de tests vérifie spécifiquement un bloc vidéo comportant YouTube, MP4, audio, PDF, sous-titres et segments de transcription.

Les tests de parité et TypeScript sont passés après redémarrage du service. La vérification visuelle complète des modales administrateur reste accessible aux administrateurs connectés sur la page d’édition ; la session de test disponible dans l’environnement ne possède pas ce rôle.
