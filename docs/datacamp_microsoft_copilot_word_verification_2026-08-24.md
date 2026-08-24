# Vérification — Microsoft Copilot dans Word

**Date :** 24 août 2026  
**Source canonique :** `COURSE_MANIFEST.json` et `COMPLETENESS_REPORT.md` du paquet DataCamp validé par SHA-256.

## Contrôle visuel initial

Le JSON pédagogique est accessible localement avec HTTP 200. La capture desktop prise pendant la phase d’hydratation affiche le loader de cours, tandis que le journal réseau confirme le chargement réussi du JSON `microsoft_copilot_in_word__01.json` (HTTP 200, 281 728 octets) sans erreur associée.

Au format mobile 375 × 812, le parcours rendu est lisible : fil d’Ariane `Formation / DataCamp · Microsoft Copilot dans Word`, titre complet, compteur `0 / 3 leçons`, barre de progression, chapitre `Découvrir Copilot` et première activité `1/9 Découvrez Copilot`. Le verrouillage séquentiel reste exposé par la structure de chapitre. Le bandeau de consentement du preview masque une partie basse de l’écran, sans masquer le titre, la progression ni l’activité courante.

Une seconde capture desktop, une fois les données hydratées, confirme le rendu complet : les trois chapitres sont visibles dans la sidebar, les chapitres 2 et 3 restent verrouillés, l’activité `1/9 Découvrez Copilot` est active et la préparation de l’environnement est affichée avant l’activité. Le bandeau de consentement recouvre la zone basse de la page de prévisualisation, sans affecter la structure pédagogique.

## Contrôles à terminer avant publication

L’audit canonique confirme **3 leçons**, **29 activités**, **10 Projector**, 14 TP `cloud_exercise`, 2 tris, 2 expériences visuelles et 1 QCM. Il relève 94 références média locales, aucune erreur de structure ni URL DataCamp publiée. Le contrôle local couvre les trois types d’activité interactifs et la progression séquentielle.

Le typage TypeScript, la validation de tous les JSON et la suite complète sont réussis : **92 fichiers de test et 339 tests**. Les tests dédiés couvrent les compteurs, les Projector, les 14 TP, les deux tris, les deux visuels, le QCM, la catégorie de productivité, la recherche et l’absence de média externe. Le contrôle média sur le domaine de production sera effectué après déploiement.

## Contrôle média de production

L’audit sur le domaine public a contrôlé les **67 références média uniques** réellement consommées par le cours. Les 67 répondent **HTTP 200**, sans 404, 429, URL DataCamp externe ni chemin de stockage direct. La couverture inclut les dix leçons Projector, leurs audios/MP4, sous-titres, PDF de slides et images locales synchronisées.
