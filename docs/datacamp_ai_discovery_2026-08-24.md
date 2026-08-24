# Relevé initial — recherche DataCamp « intelligence artificielle »

**Date :** 24 août 2026  
**Source de consultation attendue :** Chrome local authentifié de l’utilisateur  
**Règle de collecte :** aucun navigateur sandbox ne doit être utilisé.

## Requête observée

`https://app.datacamp.com/search?q=intelligence+artificielle+&type=course&launched=Past+year`

La capture fournie depuis le Mac de l’utilisateur affiche **52 résultats** pour « intelligence artificielle ». Les premiers cours visibles sont :

| Position visible | Titre DataCamp | Statut Neopolis provisoire |
| --- | --- | --- |
| 1 | Introduction à l’IA pour le travail | Absent comme cours DataCamp ; un simple lien vers une vidéo externe de thème voisin existe dans `ia_pour_les_nuls`, ce qui ne constitue pas un doublon |
| 2 | Claude Code 101 | Déjà intégré (`datacamp_claude_code_101`) |
| 3 | Claude 101 | Déjà intégré (`datacamp_claude_101`) |

Les facettes visibles indiquent notamment Python (11), Gemini (8), Microsoft Copilot (7), Theory (7) et Claude (6). Ces valeurs servent uniquement de point de départ : l’inventaire final devra être relevé depuis la session Chrome locale, avec les liens de cours et les métadonnées de chaque résultat.

## Catalogue Neopolis déjà importé

Le catalogue local contient actuellement 25 cours DataCamp conventionnels issus des précédents paquets partenaires : 8 Claude/Anthropic, 6 OpenAI, 8 Gemini et 3 n8n. La comparaison doit détecter les cours absents sur titre, URL DataCamp et contenu ; une similarité de thème ne suffit pas à conclure à un doublon.

## Conditions d’import

Chaque formation retenue devra être acquise depuis la source partenaire autorisée, puis intégrée avec un manifeste canonique, les médias locaux servis via `/api/assets/`, les blocs Neopolis, le verrouillage séquentiel, les tags de compétences, les règles de points, les TP autonomes, les ressources téléchargeables et une vérification de parité du rendu.

## Paquet sélectionné — Introduction à l’IA pour le travail

Le paquet source du cours a été récupéré depuis le dossier Drive `1sWPpLslErctW6hBkUhFoWtEArccjfHsy`. Son ZIP, `datacamp_introduction-to-ai-for-work_complete_media_package_2026-08-24.zip`, a une somme SHA-256 vérifiée :

```text
db3bc8c49411ce476594a5cb823f841e56edb23baee68218fa3f3f8abe32d451
```

Le manifeste canonique déclare quatre chapitres, trente-trois activités et onze leçons vidéo Projector. Les activités comprennent onze `VideoExercise`, cinq QCM, neuf tris interactifs et huit exercices visuels. Le rapport de complétude déclare 497 téléchargements locaux valides, sans échec, pour 87 375 748 octets.

Les onze Projector sont tous audio-only dans les données source : ils nécessitent donc la lecture MP3 synchronisée avec les slides locales, les transcriptions, les sous-titres et les PDF de chapitre. Les données Projector locales fournissent 197 slides au total ; par exemple, les trois leçons Projector du chapitre 1 comptent respectivement 28, 19 et 21 slides. Aucune URL DataCamp temporaire ne sera conservée dans la publication Neopolis.

## Vérification de rendu avant publication

Le 24 août 2026, le JSON du nouveau cours répondait bien sur le serveur de développement (`200`, 518 778 octets), mais la route apprenant affichait **« Cours introuvable »** après stabilisation du chargement. La publication est donc suspendue : il faut corriger la source de catalogue effectivement consommée par le lecteur, puis rejouer les contrôles desktop et mobile avant tout checkpoint.

Cette observation provenait d’un identifiant de certification incomplet dans l’URL de test. Avec l’URL canonique `/training/datacamp_introduction_to_ai_for_work/introduction_to_ai_for_work__01`, le cours charge correctement. Les captures de vérification confirment l’affichage desktop et mobile du titre, des quatre leçons, du verrouillage séquentiel, du premier écran et de la consigne de préparation. La fenêtre de consentement aux cookies masque une partie basse de l’écran dans ces captures, sans empêcher le rendu de la page.
