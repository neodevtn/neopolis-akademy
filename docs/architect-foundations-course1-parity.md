# Matrice de parité — AI Fluency: Framework & Foundations

**Périmètre.** Ce document couvre exclusivement le premier cours du parcours **Claude Certified Architect – Foundations** : `claude_certified_architect_foundations__01`. Il sert de spécification de conservation avant toute correction. Les intitulés anglais de la première colonne sont les identifiants canoniques publiés par Anthropic ; les libellés français restent localisés dans Neopolis.

## Sources de contrôle

Le **14 septembre 2026**, un nouveau dossier de livraison prioritaire a remplacé les références de travail précédentes pour ce lot. La page du parcours Architect Foundations confirme que le cours fait partie du parcours officiel et le décrit comme une formation à la collaboration avec les systèmes d’IA de manière efficace, efficiente, éthique et sûre. La page de cours accessible publiquement énumère quinze leçons effectives, ainsi que des intitulés de section qui ne sont pas eux-mêmes des leçons. Les détails SCORM protégés ne sont pas utilisés pour combler un contenu absent.

| Source | Usage autorisé dans ce lot | Limite |
|---|---|---|
| [Parcours officiel Architect Foundations](https://anthropic-partners.skilljar.com/page/claude-certified-architect-foundations-prep-courses) | Titre canonique et rattachement du cours | Ne détaille pas les sous-écrans |
| [Index public AI Fluency](https://anthropic-partners.skilljar.com/ai-fluency-framework-foundations/291863) | Liste des 15 leçons officielles | Les intitulés de section et les écrans SCORM détaillés restent protégés |
| Rapport d’audit prioritaire `AUDIT_ARCHITECT_FOUNDATIONS_CLEAN_2026-09-14.pdf` | Écart 15 leçons / 14 leçons locales, 33 chapitres affichés, 11 vidéos officielles, 14 ressources, mock à 4 scénarios parmi 6 | Rapport de contrôle ; ne constitue pas une source de contenu additionnel |
| Prompt prioritaire `PROMPT_MANUS_ARCHITECT_FOUNDATIONS_CLEAN_2026-09-14.md` | Règles de blocs, médias, progression, parité et évaluation | Ne permet pas de reconstituer un média ou écran absent par spéculation |
| [Page officielle CCAR-F — Anthropic Academy](https://anthropic.skilljar.com/claude-certified-architect-foundations-access-request) | Cadrage public : conception de solutions Claude, choix modèle/plateforme, architectures agentiques ou ponctuelles, évaluation, coût et déploiement responsable | Ne divulgue pas de questions ni de blueprint détaillé ; aucun item n’est repris |
| [Programme de certification Anthropic — Pearson VUE](https://www.pearsonvue.com/us/en/anthropic.html) | Confirmation publique du positionnement CCAR-F dans le programme de certification | Informations d’inscription uniquement ; aucune question ni réponse n’est utilisée |

## Priorité documentaire et empreintes de travail

Les deux documents suivants sont désormais la référence prioritaire de ce lot, téléchargés localement depuis le dossier Drive `1RiIVPJY7gV_fbGjJf3itnxZJ1CcRhxto` :

| Document | ID Drive | SHA-256 local | Rôle dans le lot |
|---|---|---|---|
| `PROMPT_MANUS_ARCHITECT_FOUNDATIONS_CLEAN_2026-09-14.md` | `16xdslzqq-2x4e24iEjXAyRnUIrKtDoed` | `2a8b52308bbb53ae957565c7a5d9ef7610ff0d25424757d13b4d12c5d01ea500` | Référence d’exécution prioritaire |
| `AUDIT_ARCHITECT_FOUNDATIONS_CLEAN_2026-09-14.pdf` | `14a8PZE2dA6NVPNTA2tlqA59deSaokVkQ` | `a61e00b3be8e032665c924e526f96eba7fe77464b62c15eaf8d339bf85c83e43` | Référence d’audit prioritaire |

## Exigences confirmées par le dossier prioritaire

Le nouveau prompt et le rapport convergent sur les points suivants, désormais traités comme critères d’acceptation obligatoires pour le cours 1 : la hiérarchie doit afficher **15 leçons officielles** avec une navigation courte et séquentielle ; l’ambiguïté **« 10–15 minutes »** ne doit pas être présentée comme la durée du cours complet ; les **11 vidéos officielles** et les **14 téléchargements** doivent être réconciliés et testés ; chaque média doit afficher une provenance **officielle** ou **complément Neopolis** ; le mock **CCAR-F** doit rester à **60 questions**, **120 minutes**, **720/1000**, avec pondération **27/18/20/20/15** et **4 scénarios tirés parmi 6** ; enfin, chaque distracteur doit recevoir une explication spécifique après soumission, côté serveur.

## Règle de conception du mock CCAR-F

Les questions, options et explications ajoutées sont **originales**. Elles sont orientées par les compétences publiquement décrites par Anthropic : sélectionner un modèle et une plateforme de déploiement, distinguer une architecture agentique d’un flux ponctuel, et prendre en compte évaluation, coût et déploiement responsable dès la conception [1]. Aucune banque tierce, question d’examen, réponse, explication ou formulation de type *dump* n’est importée. Le programme Pearson VUE confirme le rattachement de CCAR-F au parcours de certification Anthropic, sans servir de source rédactionnelle [2].

[1]: https://anthropic.skilljar.com/claude-certified-architect-foundations-access-request
[2]: https://www.pearsonvue.com/us/en/anthropic.html

## Matrice source vers Neopolis avant correction

| # | Leçon officielle Skilljar | Écran(s) Neopolis actuel(s) | Statut | Décision de lot 1 |
|---:|---|---|---|---|
| 1 | Introduction to AI Fluency | `lesson_10` / Introduction + exercice | Présent | Conserver le contenu officiel, le transcript, le téléchargement et le checkpoint obligatoire. |
| 2 | Why do we need AI Fluency? | `lesson_14` / 4 sous-écrans | Présent | Conserver les quatre sous-écrans courts et l’activité associée. |
| 3 | The 4D Framework | `lesson_01` / 2 sous-écrans | Présent | Conserver la vidéo, les trois ressources et le checkpoint. |
| 4 | Generative AI fundamentals | `lesson_15` / 2 sous-écrans | Présent | Conserver la vidéo, la ressource et l’activité. |
| 5 | Capabilities & limitations | `lesson_11` / 2 sous-écrans | Présent | Conserver la vidéo et l’activité. |
| 6 | A closer look at Delegation | `lesson_04` / 4 sous-écrans | Présent | Conserver l’introduction de module, la vidéo, le checkpoint et les ressources. |
| 7 | Project planning and Delegation | `lesson_09` / 2 sous-écrans | Présent | Conserver le contenu et l’exercice. |
| 8 | A closer look at Description | `lesson_12` / 2 sous-écrans | Présent | Conserver la vidéo, les deux ressources et l’exercice. |
| 9 | Effective prompting techniques | `lesson_03` / 2 sous-écrans | Présent | Conserver la vidéo, la ressource et l’exercice. |
| 10 | A closer look at Discernment | `lesson_06` / 2 sous-écrans | Présent | Conserver la vidéo, les deux ressources et le checkpoint. |
| 11 | The Description-Discernment loop | `lesson_13` / 2 sous-écrans | Présent | Conserver le contenu et l’exercice. |
| 12 | A closer look at Diligence | `lesson_08` / 2 sous-écrans | Présent | Conserver la vidéo, les deux ressources et l’exercice. |
| 13 | Conclusion | `lesson_07` / 2 sous-écrans | Présent | Conserver la vidéo et le checkpoint ; corriger uniquement les structures incomplètes étayées localement. |
| 14 | Certificate of completion | Aucun | **Manquant** | Ajouter une leçon courte avec contenu et encadré standards. Elle explique que Neopolis enregistre la complétion du cours sans présenter une preuve Neopolis comme un certificat Anthropic. |
| 15 | Additional activities | `lesson_05` / 2 sous-écrans | Présent | Conserver les activités optionnelles et leur exercice déjà défini. |

Les termes **Delegation**, **Description**, **Discernment**, **Diligence**, **Automation**, **Augmentation**, **Agency**, **Claude**, **Claude Code** et **MCP** sont des intitulés disciplinaires ou produits : ils ne seront pas renommés dans le cadre de ce lot.

## Écrans Neopolis complémentaires

Le cours actuel contient 33 sous-écrans pour 14 leçons et **17 blocs vidéo**. Onze blocs vidéo sont associés à une transcription et correspondent au corpus officiel recensé. Les six autres blocs vidéo sont regroupés sous **Practical Tutorials** avec un encadré standard « Complément Neopolis » ; ils restent identifiables comme compléments, ne remplacent aucune ressource Anthropic et ne conditionnent pas la progression.

Après l’ajout de la leçon 14, la hiérarchie cible est donc **15 leçons / 34 sous-écrans**, sans fusionner les leçons officielles ni convertir les activités en texte long. La navigation demeure fondée sur les boutons standards Précédent / Suivant et les règles `contentViewed` ou `requiredExercisesPassed` déjà interprétées par le lecteur.

## Règle de durée

Le texte « 10–15 minutes » s’applique à la première unité d’introduction, non à la totalité du cours. La correction cible doit l’afficher comme **« Durée indicative de cet écran : 10–15 minutes »**, sans lui attribuer le statut de durée officielle du cours entier. Toute estimation de parcours produite par Neopolis doit porter explicitement l’étiquette **« Estimation Neopolis »**.

## État avant correction et contrôles d’assets

Le 14 septembre 2026, le lecteur Neopolis a été observé sur le premier écran du cours à **1440 × 1000** et **390 × 844**. Les deux rendus chargent le contenu, la vidéo et la navigation standards sans dépassement horizontal. Le défaut relevé est sémantique : l’en-tête indique « Temps estimé pour ce module : 10–15 minutes » alors que le sous-écran est présenté comme une portion d’un cours plus large. Le compteur de cours affiche en outre **14 leçons** et **17 vidéos**, ce qui rend l’écart avec les quinze leçons et onze vidéos officielles difficile à interpréter.

Le script `scripts/verify-architect-foundations-course1-assets.mjs` a ensuite vérifié les références actuellement servies par le proxy local : **14/14 téléchargements** sont retournés en HTTP 200, non vides et au format PDF ; leurs tailles et empreintes SHA-256 sont consignées dans `docs/architect-foundations-course1-assets.json`. Les **11 vidéos accompagnées d’une transcription** sont classées comme officielles dans l’inventaire ; les **6 vidéos sans transcript**, toutes regroupées sous le complément Neopolis, sont classées comme complémentaires. Pour chaque vidéo, l’inventaire conserve un identifiant canonique, une URL source, une empreinte de référence et le contrôle de miniature, sans prétendre calculer l’empreinte binaire d’un flux YouTube non hébergé par Neopolis.

Le premier passage du test navigateur des onze lecteurs n’a pas atteint les iframes : une communication modale et l’absence de session de test empêchaient le rendu exploitable dans la fenêtre automatisée. Aucune vidéo, transcription ou ressource n’a été modifiée sur la base de ce résultat. Le contrôleur consigne désormais l’URL et le texte de la page pour chaque échec et acquitte seulement cette communication non pédagogique lorsqu’elle est visible ; la lecture image + son reste à rejouer après ce correctif de contrôle.

Le test suivant a atteint les lecteurs mais a constaté une erreur **YouTube 153 — Video player configuration error** lors d’une navigation de test directe au milieu d’une vidéo. Cette erreur indique qu’un embed ne reçoit pas une identité de page suffisante. Le composant standard `YouTubePlayer` reçoit désormais une politique de référent explicite et le contrôleur direct fournit le référent de la page de cours ; le résultat de lecture reste à valider après cette correction. Aucune vidéo source n’est déclarée valide tant que les signaux image et audio ne sont pas observés.

Une vérification dans le navigateur a confirmé que l’URL d’embed ouverte **directement** pour `JpGtOfSgR-c` affiche l’erreur 153 et redirige vers l’aide YouTube sur le référent HTTP : [Error 153 — fournir un référent HTTP](https://support.google.com/youtube/answer/171780#zippy=%2Cprovide-a-http-referer-header-to-enable-video-playback). Ce contrôle confirme l’exigence du fournisseur ; il ne suffit toutefois pas à démontrer le comportement de l’iframe dans la page Neopolis. Le prochain contrôle capture donc l’iframe après son lancement dans la page de cours authentifiée, sans navigation d’embed de niveau supérieur.

Le contrôle dans une session apprenant authentifiée atteint la miniature puis l’iframe de la page Neopolis, mais la capture de démarrage de `JpGtOfSgR-c` reste noire et les compteurs HTML de décodage sont nuls dans Chromium headless. Une interrogation de métadonnées côté ligne de commande est elle aussi refusée par YouTube avec une demande de connexion de vérification anti-robot. Ces signaux sont documentés comme une **limite d’environnement de test** et non comme une validation de lecture. Aucun cookie navigateur réel n’est exporté et aucune protection fournisseur n’est contournée. Une lecture ne sera déclarée validée qu’après une preuve obtenue dans un navigateur utilisateur normal ou via une source média autorisée.

Le contrôle navigateur du **domaine public**, effectué avant cette publication, charge correctement le cours et ses contrôles apprenant mais sert encore la révision antérieure : compteur de **14 leçons / 17 vidéos** et libellé « Estimated time for this module: 10-15 minutes ». Ce constat constitue la capture **avant** et confirme qu’aucune propagation du cours 1 reconstruit ne doit être annoncée avant checkpoint et vérification publique après déploiement.

Le 14 septembre 2026, le test interactif de la première vidéo officielle (`JpGtOfSgR-c`) dans le navigateur public a confirmé le chargement de la miniature dans le lecteur Neopolis puis la création du lecteur YouTube après activation. Dans cette session d’automatisation, l’iframe reste noire et ne permet pas d’attester le flux audio ; le lecteur standard propose néanmoins le lien officiel de secours. Cette observation n’est pas comptabilisée comme un contrôle **image et audio début/milieu/fin** réussi. Le nouveau mécanisme de récupération rendra l’échec du fournisseur explicite après publication, sans enregistrer la vidéo comme vue.

Le contrôle automatisé des onze vidéos a été ralenti et doté de reprises bornées. Il a néanmoins rencontré deux limites distinctes : un refus de démarrage fournisseur sur un lecteur et une limitation de débit lors de plusieurs chargements de pages protégées. Les miniatures, les références YouTube, les transcriptions et les quatorze téléchargements restent inventoriés séparément ; aucun résultat de ce test ne permet d’affirmer que l’image et le son ont été lus au début, au milieu et à la fin. Les cas non attestés resteront explicitement signalés dans le rapport de livraison pour validation dans un navigateur apprenant normal après publication.

Le contrôle public lancé immédiatement après le checkpoint `daad03c5` a fini par rendre le lecteur, mais il servait toujours l’ancienne révision : **14 leçons / 17 vidéos** et le libellé « Estimated time for this module: 10-15 minutes ». Cette observation est conservée comme capture **avant propagation** ; elle ne constitue ni une validation ni une invalidation de la version `daad03c5`. Une nouvelle vérification du même URL sera faite après propagation effective et comparée aux compteurs cibles de 15 leçons et 11 vidéos officielles, complétés par 6 médias Neopolis identifiés.

Une requête directe sans cache sur [`/data/courses/claude_certified_architect_foundations__01.json`](https://akademy.neodev.click/data/courses/claude_certified_architect_foundations__01.json) a confirmé le même état transitoire : le flux retournait encore les valeurs antérieures « 10-15 minutes », quatorze leçons et dix-sept vidéos. Cette réponse n’a été utilisée que comme preuve de délai de propagation ; elle ne remplace ni le JSON local validé ni le contrôle à effectuer après disponibilité de la nouvelle version.

## Contrôle public après propagation

Après le checkpoint de propagation `c827f2f9`, l’empreinte et la taille de la réponse publique ont changé : le JSON servi pèse désormais **588 910 octets**, ce qui correspond à la révision reconstruite. La sonde `scripts/capture-architect-foundations-course1-published.mjs` ouvre une session apprenant de démonstration et a validé le cours publié aux deux viewports : **desktop 1440 × 1000** et **mobile 390 × 844**. Pour chacun, le titre, le compteur **15 leçons**, le jalon **Certificate of completion / Attestation de fin de cours**, la durée d’écran explicite, la provenance officielle et l’absence de débordement horizontal sont contrôlés ; `scrollWidth` est égal à `clientWidth` aux deux tailles. Les captures sont générées sous `.work/anthropic-architect-lot1/published-captures/` et le rapport structuré est `docs/architect-foundations-course1-published-ui.json`.

L’examen visuel des deux captures confirme que le layout mobile tient sur **390 px** avec menu compact, en-tête lisible et carte de parcours dans la largeur disponible ; la carte affiche `0 / 15 leçons` et `1 / 17 vidéos`. La capture desktop confirme une hiérarchie latérale séquentielle et le libellé `Durée indicative de cet écran : 10–15 minutes` au niveau du sous-écran. La bannière de confidentialité observée dans les captures est une couche transversale indépendante du cours ; elle n’altère ni le flux de navigation, ni la largeur de la page.

Le contrôle de lecture fournisseur reste explicitement distinct : les miniatures, transcriptions et liens de secours sont inspectables dans le lecteur, mais YouTube refuse les mesures de décodage image/audio au début, au milieu et à la fin dans Chromium automatisé. Cette limite ne masque pas un état de complétion : le lecteur standard ne marque pas la vidéo comme vue lorsque la lecture ne démarre pas. Une attestation manuelle dans un navigateur apprenant normal reste nécessaire pour qualifier l’audio/vidéo des onze ressources officielles.

Lors d’une activation directe de la première miniature publiée (`JpGtOfSgR-c`), le fournisseur a affiché explicitement **« Sign in to confirm you’re not a bot »**. L’écran est joint au journal de contrôle navigateur et le lecteur conserve le lien « Watch on YouTube » ainsi que la transcription. Ce refus émane du fournisseur dans le navigateur automatisé ; il ne déclenche pas une complétion vidéo côté Neopolis. Le libellé « Watched » visible dans cette observation correspond à la progression préexistante de la session navigateur et ne constitue pas une preuve de lecture pour un nouveau compte.

La revalidation du 14 septembre 2026 contre le domaine publié confirme que les **14/14 téléchargements** retournent HTTP `200`, un type MIME `application/pdf` et une taille strictement positive. Le vérificateur conserve pour chaque ressource son nom, sa taille et son checksum SHA-256 dans `docs/architect-foundations-course1-assets.json` ; les références vidéo sont inventoriées séparément, sans traiter une miniature ou un transcript comme une preuve de lecture audio.

## Contrôles à exécuter avant publication

| Contrôle | Critère vérifiable |
|---|---|
| Hiérarchie | 15 leçons, 34 sous-écrans, 14 checkpoints/exercices conservés et une leçon de jalon de complétion clairement adaptée. |
| Vidéos | 11 vidéos officielles avec transcription ; 6 vidéos complémentaires identifiées et facultatives ; lecture image + son au début, milieu et fin sur un échantillon de chaque type. |
| Ressources | 14 téléchargements avec URL, type MIME, taille et checksum calculés depuis le média réellement servi. |
| Progression | Un compte vierge est bloqué avant les activités requises ; un compte en reprise retrouve sa position ; les compléments facultatifs ne bloquent pas le chemin. |
| Langues | EN et FR cohérentes ; aucun Markdown brut ou libellé coupé ; noms de produits préservés. |
| Examen blanc | Configuration CCAR-F inchangée : 60 questions, 120 minutes, seuil 720/1000 et pondérations 27/18/20/20/15. Toute question ajoutée est originale et conserve la correction côté serveur. |
