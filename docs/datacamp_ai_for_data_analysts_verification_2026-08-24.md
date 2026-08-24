# Vérification — L’IA pour les data analysts

## Contrôle visuel desktop

La route de formation `datacamp_ai_for_data_analysts/ai_for_data_analysts__01` charge le cours après l’initialisation des données de catalogue et de progression. La capture stabilisée desktop confirme le titre français, la provenance DataCamp, les quatre leçons/chapitres dans la navigation, les trois chapitres verrouillés, le compteur de première activité `1/9`, l’état de progression initial à 0 % et le bloc standard de préparation affiché avant la première leçon Projector.

Le bandeau de consentement cookies du preview masque une partie basse du contenu dans cette capture, sans empêcher l’affichage des indicateurs pédagogiques ni du contenu. Les contrôles mobile, des activités représentatives, des médias et de la recherche restent à exécuter avant publication.

## Contrôle mobile et activités représentatives

Au format 375 × 812, le titre, le compteur `0 / 4 leçons`, l’activité `1/9`, le statut « En cours » et la progression restent lisibles. Le contenu de préparation débute correctement sous l’en-tête du chapitre ; le bandeau cookies du preview masque la partie basse sans impacter le rendu responsif.

Les activités représentatives identifiées sont : une expérience visuelle sur *The Daily Grind* (leçon 1, activité 2), un tri GCSE (leçon 1, activité 5) et le QCM *Exécutant ou conseiller ?* (leçon 2, activité 7). Une capture automatisée groupée de ces écrans profonds a échoué au niveau du service de capture, sans erreur de serveur ni de données de cours. Leur présence, leur typage et leur verrouillage séquentiel sont couverts par le JSON converti et le test de parité dédié.

## Audit local et validation complète

L’audit canonique confirme **4 leçons**, **39 activités** et **11 leçons Projector**. Il identifie 64 références média locales et aucun bloc non autorisé, média invalide, TP sous-préparé ou défaut de verrouillage séquentiel. Le contrôle HTTP local a vérifié les **52 références média uniques réellement consommées** : 52/52 sont accessibles via `/api/assets/` avec succès.

Le typage TypeScript, la validation de tous les JSON de cours et la suite complète sont réussis : **90 fichiers de test et 333 tests**. Le test dédié couvre la catégorie BI, les 21 expériences visuelles, les 4 tris, les 3 QCM, les 11 Projector (MP4 ou audio-only), les tags et l’absence d’URL DataCamp externe. Le contrôle final de production reste à exécuter après publication.

## Contrôle média de production

L’audit sur le domaine public a contrôlé les **52 références média uniques** réellement consommées par le cours. Les 52 répondent **HTTP 200**, sans 404, 429, URL DataCamp externe ni chemin de stockage direct. La couverture inclut les onze leçons Projector, leurs audios/MP4, sous-titres, PDF de slides et images locales.
