# Rapport de vérification — Introduction à l’IA pour le travail

**Date de contrôle :** 24 août 2026  
**Cours publié :** [Neopolis Akademy](https://akademy.neodev.click/training/datacamp_introduction_to_ai_for_work/introduction_to_ai_for_work__01)  
**Source canonique :** paquet DataCamp Drive « Introduction à l’IA pour le travail » (cours 44410) [1] [2]

## Synthèse

Le cours a été converti à partir du manifeste canonique et publié avec les blocs standards Neopolis. Il conserve les **quatre chapitres**, **trente-trois activités** et **onze leçons Projector audio** annoncés par le paquet. Les MP3 locaux, slides synchronisées, transcriptions, sous-titres français/anglais et PDF de chapitre sont servis via `/api/assets/`, sans URL DataCamp ni lien direct `/manus-storage/` dans le JSON publié.

| Contrôle | Attendu | Constat | Statut |
|---|---:|---:|---|
| Intégrité ZIP SHA-256 | Valeur fournie | `db3bc8c49411ce476594a5cb823f841e56edb23baee68218fa3f3f8abe32d451` | Conforme |
| Chapitres | 4 | 4 leçons/cadres de progression | Conforme |
| Activités | 33 | 33 écrans séquentiels | Conforme |
| Leçons Projector | 11 | 11 MP3 + slides synchronisées | Conforme |
| Ressources du paquet | 497 | 497 téléversées dans la bibliothèque média | Conforme |
| Références média du JSON | Locales | 225/225 via `/api/assets/` | Conforme |
| Verrouillage | Séquentiel | Activité suivante verrouillée jusqu’à complétion | Conforme |

## Médias et contrôles HTTP de production

L’audit automatisé de production a parcouru les **225 références** utilisées par le JSON publié. Les 225 ont renvoyé un statut HTTP de succès, sans 404 ni 5xx.

| Type média | Références HTTP valides |
|---|---:|
| PDF | 15 |
| Audio MPEG/MP3 | 11 |
| Images GIF | 4 |
| Images JPEG | 138 |
| Images PNG | 35 |
| Sous-titres VTT | 22 |
| **Total** | **225** |

Le lecteur Projector Neopolis accepte désormais les leçons **audio-only**. Il utilise le MP3 comme horloge de lecture et convertit les timings Projector fractionnaires du paquet DataCamp en secondes afin de synchroniser les 197 slides locales. Cette évolution reste compatible avec les Projector MP4 existants.

## Exercices et parcours contrôlés

| Cas contrôlé | Activité représentative | Contrôle réalisé | Résultat |
|---|---|---|---|
| Vidéo Projector chapitre 1 | « Qu’est-ce que l’intelligence artificielle ? » | MP3, VTT, transcript, slides et timings présents ; HTTP validé | Conforme |
| Vidéo Projector chapitre 4 | « Limites et contraintes de l’IA » | MP3, VTT, transcript, slides et timings présents ; HTTP validé | Conforme |
| QCM | `dc_1_act_02_qcm` | Bloc `single_choice_exercise`, réponse/correction masquée avant tentative | Conforme |
| Tri interactif | « Repérez l’IA ! » | Bloc `bucket_sort`, neuf tris présents dans le cours | Conforme |
| Exercice visuel | « Explorer des segments clients » | Bloc interactif de choix multiple issu du scénario visuel DataCamp ; progression contrôlée | Conforme |
| Ressource | « L’IA pour l’éducation » | PDF local contrôlé par le bloc `resource_review` | Conforme |

Les tests automatisés ciblés couvrent le convertisseur DataCamp, les données propres au cours, les compteurs de catalogue, le verrouillage séquentiel et le calcul de synchronisation Projector. La validation JSON générale ne signale aucune erreur ; ses avertissements de similarité concernent des cours historiques distincts.

## Vérification du rendu

Les captures de prévisualisation confirment l’affichage du cours sur **desktop (1280 × 720)** et **mobile (375 × 812)**. Elles montrent le titre localisé, les quatre leçons, la progression à zéro, le verrouillage de la suite et l’écran introductif. Le consentement aux cookies du site recouvre une partie basse de la capture, sans affecter le chargement du cours.

## Écarts restants

Aucun écart fonctionnel ou média bloquant n’a été trouvé. Les applications embarquées DataCamp des exercices visuels ne sont pas portables en tant qu’applications externes : leurs scénarios canoniques sont donc rendus avec les composants interactifs Neopolis plutôt qu’avec une iframe ou du HTML libre.

## Références

[1]: https://drive.google.com/drive/folders/1sWPpLslErctW6hBkUhFoWtEArccjfHsy "Dossier Drive du paquet DataCamp"
[2]: https://drive.google.com/file/d/1ZT6OOLZtgrv8xE6Ca7W7zh595twZ2XeP/view?usp=drivesdk "Prompt d’import détaillé"
