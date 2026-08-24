# Notes d’import — L’IA pour les ressources humaines

**Source canonique :** `/home/ubuntu/datacamp_imports/ai-for-human-resources/package/ai-for-human-resources/COURSE_MANIFEST.json`  
**Prompt prioritaire :** `/home/ubuntu/datacamp_imports/ai-for-human-resources/PROMPT_MANUS_IMPORT_AI_FOR_HUMAN_RESOURCES.md`  
**Dossier Drive :** `https://drive.google.com/drive/folders/1YrK2DYdrtZJXtB5MV95Ehxir8etqdBWl`

Le ZIP a été reconstitué à partir des fragments publics du dossier Drive et vérifié par SHA-256 avant extraction. Le manifeste DataCamp déclare **3 chapitres**, **32 activités** et **11 leçons vidéo Projector**. Les formats d’activité canoniques sont : 11 `VideoExercise`, 16 `CloudExercise` et 5 `DragAndDropExercise`.

La conversion doit conserver l’ordre exact chapitre → activité, les médias locaux du paquet, les transcript/sous-titres Projector, le verrouillage séquentiel et les corrections masquées. Les 16 `CloudExercise` doivent être rendus comme TP autonomes Neopolis avec préparation d’environnement, consignes structurées, aide progressive, critères d’évaluation apprenant et correction masquée. Le contenu RH implique des tags de compétences explicables relatifs à l’usage responsable de l’IA, au métier, à la gouvernance et au design de solution.

## Contrôle visuel desktop initial

Après hydratation du JSON local, la route du cours affiche le fil d’Ariane DataCamp, le titre, les trois chapitres dans la sidebar, l’état verrouillé des chapitres 2 et 3, le compteur de progression initial et l’activité 1/9 du premier chapitre. La consigne de préparation est visible avant le contenu de l’activité. Le bandeau de consentement du preview masque la partie basse sans masquer les éléments pédagogiques et ne constitue pas une erreur de rendu.

Au format mobile 375 × 812, le fil d’Ariane, le titre, le compteur 0/3 leçons, le premier chapitre et l’activité 1/9 restent lisibles. Le texte de préparation est accessible et le verrouillage séquentiel se conserve. Le bandeau de consentement du preview masque seulement la zone basse de la capture.

## Audit local et validation

L’audit canonique confirme 3 leçons, 32 activités, 11 Projector, 16 TP autonomes et 5 tris. Il ne détecte aucun bloc non autorisé, média non local, activité évaluée non taguée ou TP dépourvu de préparation. Le contrôle HTTP local confirme **47/47 références média uniques** accessibles via `/api/assets/`.

Le typage TypeScript, la validation de tous les JSON et la suite complète sont réussis : **93 fichiers de test et 342 tests**. Le test dédié couvre les compteurs, les 11 Projector, les 16 TP, les 5 tris, le catalogue, la progression séquentielle et l’absence d’URL DataCamp externe. Le contrôle média de production reste à exécuter après publication.
