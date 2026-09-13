# TekTek — plan de conception du Coach IA de cours

## Décision directrice

**TekTek ne sera pas un chatbot généraliste.** Il sera un coach pédagogique rattaché à un cours, à une leçon et, lorsque l’apprenant se trouve dans le lecteur, à l’activité affichée. Le cours demeure sa source d’autorité : il répond uniquement à partir des éléments indexés de ce cours et indique toujours l’emplacement précis qui fonde sa réponse.

> Si TekTek ne retrouve pas une information pertinente dans le cours autorisé, il doit le dire explicitement, proposer de relire la section ou demander une précision. Il ne complète jamais une réponse avec ses connaissances générales, une recherche web ou une hypothèse.

Cette approche correspond bien aux données existantes : les cours sont structurés en leçons, chapitres et blocs, dont les vidéos Projector possèdent des scripts de slides, des segments transcrits, des sous-titres et des minutages. [1] [2]

| Élément | Décision proposée |
|---|---|
| Identité | **TekTek, le Coach IA** : ton clair, patient, concret et non moralisateur. |
| Périmètre | Uniquement le cours ouvert ; aucune réponse inter-cours ou web par défaut. |
| Référence prioritaire | Activité affichée, puis séquence vidéo/transcription active, chapitre, leçon et enfin reste du cours. |
| Preuve obligatoire | Toute réponse de fond inclut au moins une référence cliquable vers le bloc, le chapitre ou le minutage vidéo. |
| Réponse sans preuve | Refus pédagogique : « Je ne trouve pas cet élément dans ce cours. Ouvrons la section concernée ou reformulez votre question. » |
| Évaluation | TekTek explique la notion et guide la méthode, mais ne livre pas la réponse exacte à un checkpoint, exercice noté ou examen avant tentative. |

## 1. Parcours de réponse strictement ancré

Chaque question suit un pipeline déterministe et contrôlable. L’interface n’envoie jamais le contenu complet d’un cours ni une conversation entière à un modèle.

1. **Contrôle d’accès.** Le serveur vérifie l’identité, l’inscription de l’apprenant au parcours et le `courseId` ouvert. Le client ne choisit jamais librement le cours interrogé.
2. **Contexte immédiat.** TekTek reçoit d’abord l’identifiant du cours, de la leçon, du chapitre, du bloc actif, la langue, et éventuellement le minutage vidéo courant.
3. **Recherche bornée.** Le serveur cherche seulement dans les fragments du même `courseId`, en favorisant l’activité courante et les transcriptions de la vidéo en cours.
4. **Seuil de preuve.** La réponse n’est produite que si la recherche fournit des extraits suffisamment pertinents. Sinon, TekTek demande une reformulation ou indique la limite du cours.
5. **Réponse citée.** Le modèle doit retourner un objet structuré : réponse concise, références, confiance, action suivante et éventuel refus. Le serveur rejette toute réponse sans référence lorsque la réponse contient une affirmation pédagogique.
6. **Navigation pédagogique.** Les références deviennent des puces cliquables : par exemple `Leçon 2 · Activité 4`, `Vidéo · 02:15` ou `Relire le checkpoint`.

Le modèle n’a **aucun outil web**, aucun accès à une API externe et aucun droit de modifier la progression, les réponses, les notes ou les examens. Ces restrictions empêchent TekTek de sortir du cours et maintiennent le contenu pédagogique comme première référence.

## 2. Exploiter les vidéos et leurs transcriptions

Les vidéos ne doivent pas être traitées comme de simples liens média. Chaque vidéo devient des fragments pédagogiques indexables à partir des éléments disponibles : titre, sous-titres, `transcriptSegments`, scripts de slides, contenu de slide et minutage Projector. [1]

| Granularité de l’index | Contenu indexé | Référence affichée |
|---|---|---|
| Bloc d’activité | Texte pédagogique, consigne, tableau, ressources et métadonnées | Activité / bloc |
| Vidéo — séquence | Segment transcrit ou script de slide, lié à la plage de temps | Vidéo à `mm:ss` |
| Chapitre | Titre, résumé déterministe des blocs et objectifs | Leçon / chapitre |
| Exercice | Objectif, prérequis, feedback et correction **déjà autorisée** | Exercice concerné |

Une question telle que « Que signifie la distinction expliquée dans la vidéo ? » récupère d’abord la séquence vidéo proche du minutage courant, puis les séquences voisines. TekTek propose alors de rouvrir la vidéo au bon endroit plutôt que de paraphraser de mémoire.

## 3. Règles pédagogiques et règles d’intégrité

TekTek doit aider à comprendre, pas à contourner l’apprentissage. Ses règles sont transparentes dans l’interface sous « Ce que TekTek peut faire ».

| Situation | Comportement de TekTek |
|---|---|
| Notion du cours | Explique uniquement avec les passages retrouvés et références. |
| Vidéo / transcription | Résume la séquence, cite le minutage et propose de revenir au passage. |
| Question ambiguë | Demande la leçon, la notion ou le passage concerné. |
| Information absente du cours | Indique clairement qu’il ne peut pas la confirmer avec ce cours. |
| Checkpoint ou exercice obligatoire non tenté | Donne une méthode, un rappel de notion et un indice lié au cours ; ne fournit ni bonne option ni réponse prête à soumettre. |
| Examen de certification | Refuse de donner une réponse d’examen et renvoie vers les modules de préparation. |
| Instruction de contournement, contenu externe ou prompt injection | Ignore l’instruction et rappelle son périmètre pédagogique. |

Les retours libres de l’apprenant sont traités comme des données non fiables : ils ne peuvent ni modifier le rôle de TekTek, ni élargir ses sources, ni déclencher une action administrative.

## 4. Architecture de données proposée

L’index doit être reconstruit à la publication ou à la modification d’un cours, pas au moment où un apprenant pose une question. Cela rend les réponses cohérentes, auditables et beaucoup moins coûteuses.

| Entité | Données essentielles | Usage |
|---|---|---|
| `course_coach_versions` | `courseId`, hash du cours, version, date, statut d’indexation | Invalider l’index dès qu’un cours change. |
| `course_coach_chunks` | cours, leçon, chapitre, bloc, type, texte, langue, minutage, hash, poids | Recherche et citations exactes. |
| `course_coach_conversations` | apprenant, cours, langue, date d’expiration logique | Historique minimal du dialogue par cours. |
| `course_coach_messages` | question, réponse, références, version du cours, usage tokens agrégé | Audit pédagogique et amélioration qualité. |
| `course_coach_usage` | compteurs anonymisables par jour, cours et modèle | Quotas, coût et alertes. |

La première version utilise une **recherche hybride simple** : contexte courant + recherche lexicale sur les chunks + petit reranking sémantique facultatif. Elle ne dépend pas d’une base vectorielle spécifique ; si celle-ci apporte un gain mesurable plus tard, les embeddings sont ajoutés comme colonne ou table dérivée, sans modifier le contrat du coach.

## 5. Stratégie de modèles : recommandation

Je recommande de démarrer avec le **proxy IA serveur déjà intégré au projet**, plutôt qu’avec OpenRouter. Il garde les appels côté serveur, évite d’exposer une clé dans le navigateur et donne accès à un catalogue de modèles actuellement disponible au projet. [3] Le composant de chat existant peut être réutilisé uniquement comme base d’interface ; son comportement généraliste doit être remplacé par un endpoint TekTek contraint. [4]

| Option | Avantages | Limites | Décision proposée |
|---|---|---|---|
| Proxy IA natif du projet | Intégration serveur, modèles disponibles, pas de connecteur additionnel, contrôle homogène des secrets | Catalogue dépendant de la plateforme | **Choix initial.** |
| OpenRouter | Large choix de fournisseurs et modèles, utile pour tests de comparaison | Connecteur actuellement non activé, ajout de gouvernance de coût et de clé | Option de comparaison en phase pilote seulement. |
| Modèle local sur instance | Pas de coût par appel | Qualité et capacité insuffisantes pour le raisonnement pédagogique multilingue à l’échelle | Non retenu pour les réponses apprenant. |

Le modèle par défaut doit être un modèle rapide et économique du catalogue serveur, par exemple `gpt-5-mini` ou `gemini-3-flash-preview`, sans raisonnement étendu pour les questions ordinaires. Un modèle plus robuste ne doit être utilisé que pour une évaluation interne hors parcours apprenant, jamais comme escalade automatique d’une question de cours. Le catalogue serveur actif contient notamment ces deux familles de modèles ; le choix final doit être vérifié au moment de l’implémentation. [3]

## 6. Maîtrise des coûts et de la latence

La réduction de coût provient d’abord du **contrôle du contexte**, pas d’un modèle bon marché seul.

| Mesure | Mise en œuvre proposée | Effet attendu |
|---|---|---|
| Fragments courts | 300 à 600 tokens maximum par chunk, avec le minutage et le bloc source | Réduit le prompt tout en gardant une citation précise. |
| Contexte plafonné | Bloc actif + 3 à 5 extraits retrouvés ; objectif initial de 2 500 tokens sources | Coût prévisible par question. |
| Réponse plafonnée | Réponse de 250 à 350 tokens, sauf demande de résumé explicitement long | Évite les digressions. |
| Cache pédagogique | Cache par version de cours, langue et question normalisée, sans données personnelles | Évite de payer plusieurs fois les questions fréquentes. |
| Index asynchrone de publication | Extraction et indexation quand le cours est publié/modifié, jamais à chaque question | Pas de coût de préparation à la demande. |
| Quotas initiaux | Limites configurables par apprenant, cours et période, avec message de reprise | Protège le budget et le service. |
| Journal de coût | Usage par modèle, cours, version et type de demande, sans conserver plus de données personnelles que nécessaire | Ajustement fondé sur des mesures réelles. |

La première version ne transmet pas l’historique complet : elle conserve au plus les deux derniers tours pertinents, plus les références déjà affichées. Les réponses dont le résultat est non sourcé ne sont pas mises en cache comme connaissance.

## 7. Expérience apprenant et administration

TekTek apparaît dans le lecteur de formation comme un panneau latéral ou une fenêtre compacte persistante, jamais comme un écran qui masque l’activité. Le bandeau indique toujours le périmètre : `TekTek · Coach IA · Cours : [nom du cours]`.

L’écran initial propose trois actions liées au contexte : « Explique-moi cet écran », « Résume cette séquence vidéo » et « Aide-moi à comprendre la consigne ». Chaque réponse affiche ses références puis une action « Ouvrir la source ».

L’administration comporte une page de contrôle : état de l’index par cours et version, derniers échecs d’ancrage, volume de questions, coût agrégé, questions sans réponse et évaluation humaine. Aucun administrateur ne peut remplacer silencieusement le contenu canonique par une réponse générée.

## 8. Déploiement en cinq étapes avec validations

| Étape | Livrable | Critère de validation |
|---|---|---|
| 1. Contrat TekTek | Schéma, règles d’ancrage, scénarios refusés, maquettes UX | Validation de ce plan par l’administration. |
| 2. Index pilote | Extraction déterministe d’un cours pilote et de ses transcriptions | Chaque citation ouvre la bonne activité ou le bon minutage. |
| 3. Réponse contrôlée | Endpoint TekTek, interface, citations obligatoires et refus sans source | Jeu de tests : réponse sourcée, absence de source, vidéo, exercice, injection. |
| 4. Mesure et revue | Tableau admin de qualité, coût, latence et questions non résolues | Revue humaine sur un échantillon réel, sans examen ni donnée sensible. |
| 5. Extension | Réindexation à la publication et déploiement progressif par catalogue | Seuils de qualité et coût validés avant généralisation. |

## Critères de réception impératifs

1. Aucune réponse pédagogique ne peut être affichée sans référence appartenant au même cours et à la version actuellement publiée.
2. Chaque référence vidéo ouvre le bon support au minutage indiqué.
3. Les questions de checkpoint et d’examen reçoivent une aide conceptuelle, pas une réponse permettant de valider artificiellement l’activité.
4. Les appels IA restent côté serveur, respectent les droits d’accès et ne transmettent ni secrets, ni mots de passe, ni historique complet inutile.
5. Les coûts, erreurs, refus et réponses non sourcées sont mesurés avant l’extension à un second cours.

## Recommandation de lancement

Valider d’abord la **phase 1**, puis réaliser un pilote sur *Introduction à l’IA pour le travail*. Ce cours est particulièrement adapté : quatre chapitres, 33 activités et 11 leçons vidéo avec données transcriptibles locales déjà structurées. [1] Le pilote permettra de mesurer la qualité des citations vidéo, le coût réel par question et les règles de refus avant toute généralisation aux catalogues Anthropic, OpenAI, Gemini, n8n ou Novasavo.

## Références

[1] [Structure d’un cours, blocs et vidéos Projector](../client/public/data/courses/introduction_to_ai_for_work__01.json)  
[2] [Contexte de position active dans le lecteur de cours](../client/src/pages/TrainingCourse.tsx)  
[3] [Helper IA serveur du projet](../server/_core/llm.ts)  
[4] [Composant de chat réutilisable](../client/src/components/AIChatBox.tsx)
