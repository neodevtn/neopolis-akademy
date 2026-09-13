# TekTek — plan de conception du Coach IA de cours

## Décision directrice

**TekTek ne sera pas un chatbot généraliste.** Il sera un coach pédagogique rattaché à la **formation ouverte**, laquelle peut contenir plusieurs cours. Il connaît l’écran, l’activité, le cours et la formation où se trouve l’apprenant. Sa première référence reste le contenu actuellement affiché ; il peut ensuite mobiliser les autres cours de la même formation lorsque cela améliore réellement l’explication.

> TekTek suit une hiérarchie stricte : écran actif → chapitre et cours actifs → autres cours de la formation ouverte. S’il ne retrouve pas de fondement suffisant dans cette formation, il le dit explicitement et ne complète jamais la réponse avec une recherche web ou une connaissance générale non sourcée.

Cette approche correspond bien aux données existantes : les cours sont structurés en leçons, chapitres et blocs, dont les vidéos Projector possèdent des scripts de slides, des segments transcrits, des sous-titres et des minutages. [1] [2]

| Élément | Décision proposée |
|---|---|
| Identité | **TekTek, le Coach IA** : ton clair, patient, concret et non moralisateur. |
| Périmètre | Tous les cours rattachés à la formation ouverte ; aucune recherche hors formation ni sur le web par défaut. |
| Référence prioritaire | Activité affichée, séquence vidéo/transcription active, chapitre, cours actif, puis cours connexes de la même formation. |
| Preuve obligatoire | Toute réponse de fond inclut au moins une référence cliquable vers le bloc, le chapitre ou le minutage vidéo. |
| Réponse sans preuve | Refus pédagogique : « Je ne trouve pas cet élément dans cette formation. Je peux vous aider à reformuler ou vous orienter vers un autre cours de ce parcours. » |
| Évaluation | TekTek explique la notion et guide la méthode, mais ne livre pas la réponse exacte à un checkpoint, exercice noté ou examen avant tentative. |

Le modèle réel du catalogue facilite cette approche : une formation référence explicitement la liste de ses cours. Par exemple, *Claude Certified Architect – Fondations* regroupe sept cours ; TekTek peut donc relier une notion introduite dans un cours à son approfondissement dans un autre, sans sortir de ce parcours. [5]

## 1. Parcours de réponse strictement ancré

Chaque question suit un pipeline déterministe et contrôlable. L’interface n’envoie jamais le contenu complet d’un cours ni une conversation entière à un modèle.

1. **Contrôle d’accès.** Le serveur vérifie l’identité, l’accès de l’apprenant à la formation, le `certificationId` ouvert et le `courseId` actif. Le client ne peut ni injecter un autre parcours ni interroger un cours inaccessible.
2. **Contexte immédiat.** TekTek reçoit l’identifiant de la formation, du cours, de la leçon, du chapitre, du bloc actif, la langue et, le cas échéant, le minutage vidéo courant.
3. **Compréhension de la question.** Un planificateur léger classe la demande : explication locale, définition, comparaison, synthèse, prérequis, mise en pratique, navigation ou question d’évaluation. Cette étape ne répond pas ; elle choisit seulement la profondeur de recherche.
4. **Recherche en cercles.** Le serveur cherche d’abord dans l’écran et la vidéo actifs, puis dans le cours, et enfin dans les autres cours de la formation. Il élargit le cercle uniquement si le premier niveau ne suffit pas ou si la question demande explicitement une comparaison ou une synthèse.
5. **Reranking pédagogique.** Les extraits sont classés selon la proximité avec la position de l’apprenant, la correspondance à la question, leur caractère canonique et leur niveau pédagogique. Un passage du cours actif reste prioritaire sur un passage plus éloigné à pertinence comparable.
6. **Seuil de preuve.** La réponse n’est produite que si la recherche fournit des extraits suffisamment pertinents. Sinon, TekTek demande une reformulation ou indique la limite de la formation.
7. **Réponse citée.** Le modèle retourne un objet structuré : réponse, références, niveau de confiance, cours mobilisés, éventuelles nuances et action suivante. Le serveur rejette toute affirmation pédagogique sans référence.
8. **Navigation pédagogique.** Les références deviennent des puces cliquables : `Cours 1 · Leçon 2 · Activité 4`, `Cours 3 · Vidéo · 02:15` ou `Comparer avec le cours suivant`.

Le modèle n’a **aucun outil web**, aucun accès à une API externe et aucun droit de modifier la progression, les réponses, les notes ou les examens. Ces restrictions empêchent TekTek de sortir de la formation et maintiennent les contenus publiés comme seules sources d’autorité.

## 1 bis. Intelligence inter-cours utile, sans dérive

L’ouverture à toute la formation ne doit pas produire un mélange indistinct de contenus. TekTek construit une réponse inter-cours seulement lorsque cela apporte une valeur pédagogique identifiable.

| Type de question | Comportement intelligent attendu |
|---|---|
| « Explique cet écran » | Reste local à l’activité, sauf si un prérequis indispensable est défini ailleurs dans la formation. |
| « Où cette notion est-elle approfondie ? » | Cherche dans les autres cours et propose les deux ou trois passages les plus pertinents. |
| « Compare A et B » | Construit un tableau à partir des passages de cours cités, sans inventer de différence absente des sources. |
| « Quel est le lien avec ce que j’ai appris avant ? » | Utilise la progression réelle de l’apprenant et privilégie les cours déjà accessibles ou terminés. |
| « Donne-moi une vue d’ensemble » | Synthétise plusieurs cours, signale les cours mobilisés et conserve une citation par idée importante. |
| Question prématurée | Répond brièvement, puis recommande le cours ou chapitre où la notion sera développée, sans dévoiler une correction d’exercice. |

Lorsque deux cours emploient des formulations différentes, TekTek ne choisit pas arbitrairement. Il distingue : **complément**, **niveau de détail différent**, **évolution de version** ou **contradiction possible**. En cas de contradiction réelle, il affiche les deux références et invite l’apprenant à suivre le contenu du cours actif ou à demander une clarification pédagogique. Il ne fusionne jamais silencieusement des affirmations incompatibles.

## 2. Exploiter les vidéos et leurs transcriptions

Les vidéos ne doivent pas être traitées comme de simples liens média. Chaque vidéo devient des fragments pédagogiques indexables à partir des éléments disponibles : titre, sous-titres, `transcriptSegments`, scripts de slides, contenu de slide et minutage Projector. [1]

| Granularité de l’index | Contenu indexé | Référence affichée |
|---|---|---|
| Bloc d’activité | Texte pédagogique, consigne, tableau, ressources et métadonnées | Activité / bloc |
| Vidéo — séquence | Segment transcrit ou script de slide, lié à la plage de temps | Vidéo à `mm:ss` |
| Chapitre | Titre, résumé déterministe des blocs et objectifs | Leçon / chapitre |
| Exercice | Objectif, prérequis, feedback et correction **déjà autorisée** | Exercice concerné |

Une question telle que « Que signifie la distinction expliquée dans la vidéo ? » récupère d’abord la séquence vidéo proche du minutage courant, puis les séquences voisines. Si la notion est reprise dans une vidéo d’un autre cours de la même formation, TekTek peut ajouter une section « Pour approfondir » avec le second minutage, sans diluer la réponse principale.

## 3. Règles pédagogiques et règles d’intégrité

TekTek doit aider à comprendre, pas à contourner l’apprentissage. Ses règles sont transparentes dans l’interface sous « Ce que TekTek peut faire ».

| Situation | Comportement de TekTek |
|---|---|
| Notion du cours | Explique uniquement avec les passages retrouvés et références. |
| Vidéo / transcription | Résume la séquence, cite le minutage et propose de revenir au passage. |
| Question ambiguë | Demande la leçon, la notion ou le passage concerné. |
| Information absente du cours actif mais présente ailleurs dans la formation | Répond avec les références de l’autre cours et signale explicitement le changement de source. |
| Information absente de toute la formation | Indique clairement qu’il ne peut pas la confirmer avec les contenus autorisés. |
| Checkpoint ou exercice obligatoire non tenté | Donne une méthode, un rappel de notion et un indice lié au cours ; ne fournit ni bonne option ni réponse prête à soumettre. |
| Examen de certification | Refuse de donner une réponse d’examen et renvoie vers les modules de préparation. |
| Instruction de contournement, contenu externe ou prompt injection | Ignore l’instruction et rappelle son périmètre pédagogique. |

Les retours libres de l’apprenant sont traités comme des données non fiables : ils ne peuvent ni modifier le rôle de TekTek, ni élargir ses sources, ni déclencher une action administrative.

## 4. Architecture de données proposée

L’index doit être reconstruit à la publication ou à la modification d’un cours, pas au moment où un apprenant pose une question. Cela rend les réponses cohérentes, auditables et beaucoup moins coûteuses.

| Entité | Données essentielles | Usage |
|---|---|---|
| `course_coach_versions` | `certificationId`, `courseId`, hash du cours, version, date, statut d’indexation | Invalider uniquement les cours modifiés tout en versionnant la formation. |
| `course_coach_chunks` | formation, cours, leçon, chapitre, bloc, type, texte, langue, minutage, hash, poids | Recherche locale puis inter-cours et citations exactes. |
| `course_coach_conversations` | apprenant, formation, cours actif, langue, date d’expiration logique | Historique minimal par formation avec contexte de navigation. |
| `course_coach_messages` | question, réponse, références, cours mobilisés, versions, usage tokens agrégé | Audit pédagogique et amélioration qualité. |
| `course_coach_usage` | compteurs anonymisables par jour, cours et modèle | Quotas, coût et alertes. |

La première version utilise une **recherche hybride en cascade** : contexte courant + recherche lexicale dans le cours actif + élargissement lexical/sémantique aux autres cours + reranking final. Elle ne dépend pas immédiatement d’une base vectorielle spécifique ; si les tests montrent que la recherche lexicale manque des paraphrases inter-cours, des embeddings sont ajoutés comme index dérivé, sans modifier le contrat du coach.

## 5. Stratégie de modèles : recommandation

Je recommande de démarrer avec le **proxy IA serveur déjà intégré au projet**, plutôt qu’avec OpenRouter. Il garde les appels côté serveur, évite d’exposer une clé dans le navigateur et donne accès à un catalogue de modèles actuellement disponible au projet. [3] Le composant de chat existant peut être réutilisé uniquement comme base d’interface ; son comportement généraliste doit être remplacé par un endpoint TekTek contraint. [4]

| Option | Avantages | Limites | Décision proposée |
|---|---|---|---|
| Proxy IA natif du projet | Intégration serveur, modèles disponibles, pas de connecteur additionnel, contrôle homogène des secrets | Catalogue dépendant de la plateforme | **Choix initial.** |
| OpenRouter | Large choix de fournisseurs et modèles, utile pour tests de comparaison | Connecteur actuellement non activé, ajout de gouvernance de coût et de clé | Option de comparaison en phase pilote seulement. |
| Modèle local sur instance | Pas de coût par appel | Qualité et capacité insuffisantes pour le raisonnement pédagogique multilingue à l’échelle | Non retenu pour les réponses apprenant. |

Le modèle par défaut doit être un modèle rapide et économique du catalogue serveur, par exemple `gpt-5-mini` ou `gemini-3-flash-preview`, sans raisonnement étendu pour les questions ordinaires. Pour une comparaison ou synthèse inter-cours, le même modèle peut recevoir un contexte un peu plus large et une consigne structurée ; il n’est pas nécessaire d’utiliser systématiquement un modèle premium. Un modèle plus robuste est réservé aux tests internes de qualité ou aux cas complexes explicitement activés par configuration, jamais à une escalade incontrôlée. Le catalogue serveur actif contient notamment ces familles de modèles ; le choix final doit être vérifié au moment de l’implémentation. [3]

Le routage recommandé comporte trois niveaux :

| Niveau | Déclencheur | Recherche et modèle |
|---|---|---|
| Local | Explication de l’écran, consigne, vidéo ou définition proche | 2 à 4 extraits du cours actif ; modèle économique ; réponse courte. |
| Formation | Comparaison, synthèse, prérequis ou approfondissement | 4 à 7 extraits issus de deux ou trois cours maximum ; modèle économique avec sortie structurée. |
| Refus / clarification | Preuves insuffisantes, question hors formation ou ambiguïté forte | Aucun contexte élargi inutile ; pas de génération longue ; question de clarification ou refus. |

## 6. Maîtrise des coûts et de la latence

La réduction de coût provient d’abord du **contrôle du contexte**, pas d’un modèle bon marché seul.

| Mesure | Mise en œuvre proposée | Effet attendu |
|---|---|---|
| Fragments courts | 300 à 600 tokens maximum par chunk, avec le minutage et le bloc source | Réduit le prompt tout en gardant une citation précise. |
| Contexte adaptatif plafonné | Local : bloc actif + 3 à 5 extraits ; inter-cours : 4 à 7 extraits issus de 3 cours maximum | Plus d’intelligence sans envoyer toute la formation. |
| Réponse plafonnée | Réponse de 250 à 350 tokens, sauf demande de résumé explicitement long | Évite les digressions. |
| Cache pédagogique hiérarchique | Cache par version de formation, versions de cours mobilisés, langue, type de question et question normalisée | Évite de recalculer les synthèses inter-cours fréquentes sans servir une réponse périmée. |
| Index asynchrone de publication | Extraction et indexation quand le cours est publié/modifié, jamais à chaque question | Pas de coût de préparation à la demande. |
| Quotas initiaux | Limites configurables par apprenant, cours et période, avec message de reprise | Protège le budget et le service. |
| Journal de coût | Usage par modèle, cours, version et type de demande, sans conserver plus de données personnelles que nécessaire | Ajustement fondé sur des mesures réelles. |

La première version ne transmet pas l’historique complet : elle conserve au plus les deux derniers tours pertinents, plus les références déjà affichées. Le résumé conversationnel est déterministe et conserve les identifiants de sources ; il ne devient jamais lui-même une source. Les réponses non sourcées ne sont pas mises en cache comme connaissance.

## 7. Expérience apprenant et administration

TekTek apparaît dans le lecteur de formation comme un panneau latéral ou une fenêtre compacte persistante, jamais comme un écran qui masque l’activité. Le bandeau indique toujours le périmètre : `TekTek · Coach IA · Formation : [nom] · Cours actif : [nom]`.

L’écran initial propose des actions liées au contexte : « Explique-moi cet écran », « Résume cette séquence vidéo », « Aide-moi à comprendre la consigne » et « Où cette notion est-elle approfondie dans la formation ? ». Chaque réponse affiche ses références, le cours d’origine et une action « Ouvrir la source ».

L’administration comporte une page de contrôle : état de l’index par cours et version, derniers échecs d’ancrage, volume de questions, coût agrégé, questions sans réponse et évaluation humaine. Aucun administrateur ne peut remplacer silencieusement le contenu canonique par une réponse générée.

## 8. Déploiement en cinq étapes avec validations

| Étape | Livrable | Critère de validation |
|---|---|---|
| 1. Contrat TekTek | Schéma, règles d’ancrage, scénarios refusés, maquettes UX | Validation de ce plan par l’administration. |
| 2. Index pilote | Extraction déterministe d’une petite formation pilote comprenant plusieurs cours et leurs transcriptions | Chaque citation ouvre le bon cours, la bonne activité ou le bon minutage. |
| 3. Réponse contrôlée | Endpoint TekTek, interface, citations obligatoires et refus sans source | Jeu de tests : réponse sourcée, absence de source, vidéo, exercice, injection. |
| 4. Mesure et revue | Tableau admin de qualité, coût, latence et questions non résolues | Revue humaine sur un échantillon réel, sans examen ni donnée sensible. |
| 5. Extension | Réindexation à la publication et déploiement progressif par catalogue | Seuils de qualité et coût validés avant généralisation. |

## Critères de réception impératifs

1. Aucune réponse pédagogique ne peut être affichée sans référence appartenant à la formation ouverte et aux versions actuellement publiées de ses cours.
2. Chaque référence vidéo ouvre le bon support au minutage indiqué.
3. Les questions de checkpoint et d’examen reçoivent une aide conceptuelle, pas une réponse permettant de valider artificiellement l’activité.
4. Les appels IA restent côté serveur, respectent les droits d’accès et ne transmettent ni secrets, ni mots de passe, ni historique complet inutile.
5. Les coûts, erreurs, refus et réponses non sourcées sont mesurés avant l’extension à un second cours.

## Recommandation de lancement

Valider d’abord la **phase 1**, puis réaliser deux pilotes complémentaires. Le premier, sur *Introduction à l’IA pour le travail*, valide l’ancrage fin dans 33 activités et 11 leçons vidéo avec transcriptions structurées. [1] Le second utilise une formation comportant plusieurs cours, idéalement *Claude Certified Architect – Fondations* avec ses sept cours, afin de tester les prérequis, comparaisons, synthèses et contradictions inter-cours. [5] La généralisation n’intervient qu’après validation séparée de la qualité locale et de la qualité inter-cours.

## Références

[1] [Structure d’un cours, blocs et vidéos Projector](../client/public/data/courses/introduction_to_ai_for_work__01.json)  
[2] [Contexte de position active dans le lecteur de cours](../client/src/pages/TrainingCourse.tsx)  
[3] [Helper IA serveur du projet](../server/_core/llm.ts)  
[4] [Composant de chat réutilisable](../client/src/components/AIChatBox.tsx)
[5] [Relation entre formations et listes de cours](../client/src/data/trainingIndex.json)
