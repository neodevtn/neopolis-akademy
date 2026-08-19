# Constats d’audit Anthropic — 19 août 2026

## Contrôle visuel effectué en prévisualisation

Le contrôle a été effectué avec le compte de démonstration sur la leçon **AI Fluency: Framework & Foundations**, à l’URL de cours incluant `lesson=0`.

| Écran | Résultat observé | Statut |
| --- | --- | --- |
| Exercice, chapitre 2 sur 3 | Le rendu présente le titre « Exercice : mettre les choses en pratique », l’encadré « Contenu officiel Anthropic », l’objectif, les trois questions de réflexion et le bouton de téléchargement sans image de plume ni alt text parasite. | Conforme |
| Tutoriels, chapitre 3 sur 3 | Le rendu présente l’encadré « Complément Neopolis » avant les vidéos et explicite que ces ressources ne sont pas du contenu officiel Anthropic. | Conforme |
| Navigation | L’URL paramétrée `?lesson=0&chapter=1` affiche le chapitre exercice ; `?lesson=0&chapter=2` affiche les tutoriels. La séquence 2/3 puis 3/3 est préservée. | Conforme |

## Contrôles de données

L’audit automatisé local a recensé **17 cours** : 5 Developer Foundations, 7 Architect Foundations et 5 Architect Professional. Il a confirmé 0 titre attendu en écart, 0 bloc vidéo sans source exploitable, 0 référence `/manus-storage/` et 285 références média locales disponibles via `/api/assets/`.

## Correctif complémentaire de rendu

Une première passe de prévisualisation a révélé que l’exécution répétée du script de correction ajoutait deux blocs de réflexion identiques. Le script est maintenant idempotent : il reconstruit explicitement le chapitre avec un seul encadré officiel, une seule consigne de réflexion, le checkpoint existant et le téléchargement. Le contrôle final de ce rendu est effectué avant publication.

Le contrôle final du chapitre exercice confirme qu’une seule consigne de réflexion est affichée, sans les artefacts « Option 3 » / « Option 4 », sans alt text de plume et sans répétition. La navigation reste sur l’écran **2 sur 3**, donc le verrouillage et la structure séquentielle existants n’ont pas été modifiés.

## Sources officielles consultées

Les intitulés de parcours et les cinq modules Architect Professional ont été vérifiés sur le catalogue Anthropic et les pages de parcours Skilljar :

- https://anthropic-partners.skilljar.com/page/claude-certification-exam-prep-courses
- https://anthropic-partners.skilljar.com/path/claude-certified-developer-foundations
- https://anthropic-partners.skilljar.com/page/claude-certified-architect-foundations-prep-courses
- https://anthropic-partners.skilljar.com/path/claude-certified-architect-professional
