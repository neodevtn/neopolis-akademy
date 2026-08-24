# Notes d’import — Développement logiciel avec Windsurf

## Sources canoniques

| Élément | Référence |
|---|---|
| Cours | `software-development-with-windsurf` |
| Source partenaire | `https://campus.datacamp.com/fr/courses/software-development-with-windsurf` |
| Dossier Drive public | `https://drive.google.com/drive/folders/1n1xciP3uU7UG6_-ly6fLSLJqhIBorO16` |
| Archive | `datacamp_software-development-with-windsurf_complete_media_package_2026-08-24.zip` |
| Prompt | `PROMPT_MANUS_IMPORT_SOFTWARE_DEVELOPMENT_WITH_WINDSURF.md` |

## Comptage canonique

Le manifeste DataCamp déclare **3 chapitres**, **31 activités** et **11 leçons vidéo Projector**. La répartition d’activités est de 11 `VideoExercise`, 9 `VisualExercise`, 6 QCM et 5 tris interactifs. Le rapport de complétude et le prompt individuel restent les autorités prioritaires pour la conversion.

## Principes de conversion

Les vidéos doivent utiliser les médias locaux déclarés (`mp4_local`, sous-titres, transcripts, slides PDF et images Projector) via la bibliothèque média Neopolis. Les expériences visuelles, QCM et tris doivent passer par les blocs standards, avec correction masquée jusqu’à la tentative. Les chapitres et activités doivent respecter l’ordre et le verrouillage séquentiel du manifeste.

Le premier écran doit exposer une préparation de l’environnement Windsurf local. Les distracteurs et justifications pédagogiques peuvent être enrichis avec retenue, sans modifier l’objectif de l’activité ni sanctionner automatiquement un apprenant. Avant publication, le cours doit être contrôlé sur desktop et mobile, avec une leçon Projector du premier chapitre, une leçon du dernier, chaque grand format d’activité, la progression, la recherche et l’absence de 404 média.

## Contrôle visuel desktop

La première capture effectuée immédiatement après le redémarrage affichait le chargeur, ce qui est cohérent avec l’hydratation du catalogue et du JSON de cours. Après chargement, la seconde capture confirme le rendu stable : fil d’Ariane DataCamp, titre du cours, compteur `0 / 3 leçons`, trois chapitres dans la navigation latérale, activités verrouillées des chapitres suivants et activité `1/9 Les essentiels de Windsurf` active. La préparation Windsurf spécifique est visible avant l’activité. Le bandeau de consentement du preview masque seulement le bas de la page et n’affecte pas le contenu pédagogique.

## Contrôle visuel mobile

Au format 375 × 812, le fil d’Ariane, le titre, le compteur `0 / 3 leçons`, la carte du premier chapitre et l’activité `1/9 Les essentiels de Windsurf` restent lisibles. L’état `En cours` est visible ; la préparation Windsurf commence sous l’en-tête. Le bandeau de consentement du preview recouvre la partie basse de cette capture sans affecter le rendu ni le verrouillage des chapitres suivants.

## Audit local et contrôles automatisés

| Contrôle | Résultat |
|---|---:|
| Archive contrôlée | SHA-256 valide et `unzip -t` réussi |
| Ressources source téléchargées | 344 / 344 |
| Chapitres / activités | 3 / 31 |
| Leçons vidéo Projector | 11 |
| Exercices interactifs | 20 : 9 visuels, 6 QCM, 5 tris |
| Références médias consommées dans le JSON | 72 / 72 locales via `/api/assets/` |
| Médias invalides / erreurs structurelles | 0 / 0 |
| Tags de compétences | Présents pour les trois chapitres ; aucune évaluation non taggée |
| Préparation d’environnement | Aucune activité TP sous-préparée |

L’audit local automatisé a confirmé que le cours ne contient ni URL DataCamp externe ni chemin `/manus-storage/` dans son JSON public. Les tests TypeScript et de validation des cours sont réussis. La suite Vitest stabilisée est également réussie : **94 fichiers et 346 tests**. Le test e-mail lié à Resend a dépassé ponctuellement son délai par défaut lors d’une première exécution, puis a réussi avec un délai réseau de 30 secondes ; il ne signale pas une régression du cours.

## Correctif QA : accès administrateur

Le contrôle par lien profond d’une leçon Windsurf non encore complétée a révélé que le lecteur masquait encore son contenu pour un administrateur, malgré le bypass de cours déjà présent. La règle de verrouillage des leçons a été centralisée dans `shared/learningAccess.ts` : les apprenants restent bloqués au-delà de leur prochaine leçon autorisée, tandis qu’un administrateur peut ouvrir une leçon future depuis la barre latérale ou un lien profond. La nouvelle règle est couverte par un test dédié sans assouplir le parcours séquentiel apprenant.

La capture de contrôle après correctif ouvre effectivement `?lesson=2&chapter=0` : le chapitre 3, « Du prototype à la production en une journée », s’affiche en **Mode Révision**, avec l’activité `1/10 Générer l’ossature de l’application de news` et son bloc vidéo. Le contenu n’est plus masqué, tandis que le parcours standard reste séquentiel pour les apprenants.

## Vérification de production

Le premier appel public effectué immédiatement après le checkpoint a atteint une version encore en propagation et a renvoyé le fallback HTML. Après propagation, le JSON publié répond avec `Content-Type: application/json`, **250 911 octets**, et le cours est rendu sur le domaine public. La vérification navigateur avec cache-buster confirme le titre, les trois chapitres, la préparation visible, le lecteur Projector du chapitre 1, les 18 slides, le transcript, le PDF de slides et le sous-titre local via `/api/assets/`.

| Contrôle production | Résultat |
|---|---:|
| JSON de cours | HTTP 200, JSON servi |
| Médias consommés | 72 / 72 locaux et valides |
| Médias invalides / erreurs d’audit | 0 / 0 |
| Vidéos Projector | 11 / 11 déclarées avec slides et transcript |
| Verrouillage séquentiel apprenant | Actif |
| Bypass administrateur par lien profond | Vérifié après correctif |

L’audit automatisé de production n’a détecté ni URL DataCamp externe, ni chemin `/manus-storage/` dans le JSON, ni référence média invalide. Les contrôles de code, de données et de disponibilité sont donc clôturés pour cette version publiée.
