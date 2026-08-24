# Vérification d’import — DataCamp « L’IA pour la finance »

## Source et intégrité

Le paquet Drive `ai-for-finance` a été reconstitué depuis ses dix parties, puis vérifié avec la somme SHA-256 officielle. Son manifeste canonique déclare trois chapitres, trente activités et dix leçons Projector. Les types d’activité sont : dix vidéos, onze TP CloudExercise, trois QCM et six tris interactifs.

Le rapport de complétude source indique 346 ressources locales valides sur 347. Le seul écart est l’illustration décorative Projector `Perplexity_AI_logo.svg`, dont le fichier reçu est une réponse `HTTP Error 404: Not Found` de 25 octets. Elle est exclue de la bibliothèque média et de la sortie Neopolis ; aucune URL DataCamp n’est conservée pour la remplacer.

## Conversion et activité pratique

Les onze `CloudExercise` sont convertis en blocs standards `cloud_exercise`. Ils conservent objectif, préparation autonome, étapes, indice, zone de preuve et correction masquée. Les balises internes de grading DataCamp et ses URL de source sont retirées du contenu apprenant. Les prompts demandant Microsoft Copilot sont adaptés à un outil IA autorisé par l’organisation, sans prétendre fournir un environnement DataCamp.

## Contrôles visuels locaux

| Vue | Résultat observé |
|---|---|
| Desktop (1280 × 720) | Le catalogue résout le cours, la progression affiche 0/3 leçons, le premier chapitre et l’activité 1/11 s’affichent avec le lecteur Projector et le bouton d’édition administrateur. |
| Mobile (375 × 812) | L’en-tête, le compteur 0/3, le chapitre actif, l’activité 1/11 et le contenu s’adaptent à la largeur mobile sans débordement structurel. |

Le bandeau de consentement aux cookies du preview masque une partie basse de ces captures, sans interférer avec les éléments pédagogiques ni le chargement du cours.

## Audit structurel et validation

L’audit canonique confirme : 3 leçons, 30 activités, 10 vidéos, 20 exercices interactifs, 11 TP `cloud_exercise`, 6 tris, 3 QCM et 3 supports PDF de chapitre. Les 73 références média effectivement consommées sont locales via `/api/assets/`, sans média invalide ; la progression est séquentielle et aucun TP ne manque de préparation autonome. Les tags de compétences couvrent notamment prompt engineering, orchestration, gouvernance, BI et usages métier.

La suite complète a validé **86 fichiers et 321 tests**. La validation JSON est sans erreur ; les 223 alertes de similarité de choix concernent des cours historiques et ne sont pas des erreurs de structure du cours finance.

## Écart et risque restant

La capture automatisée de quatre écrans profonds a échoué au niveau du service de capture, sans erreur client ou serveur associée. Les activités concernées ont été contrôlées structurellement dans le JSON et les composants QCM, tri et TP sont couverts par la suite de tests. Le contrôle média de production reste à exécuter après publication.
