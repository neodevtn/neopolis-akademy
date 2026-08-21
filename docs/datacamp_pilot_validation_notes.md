# Contrôle du lot pilote DataCamp

## Cours Claude — aperçu du 21 août 2026

La route d’apprentissage `/training/datacamp_introduction_to_claude_models/introduction_to_claude_models__01` a été ouverte dans l’aperçu. Après l’état initial de chargement, l’interface a affiché proprement le garde d’accès attendu : **« Authentification requise »** avec l’action **« Se connecter »**. Aucun crash du lecteur, message d’erreur JavaScript ou contenu tronqué n’a été affiché durant ce contrôle anonyme.

Le rendu détaillé des activités, des médias audio locaux et des QCM nécessite un compte apprenant authentifié. Cette vérification restera une étape de validation avant publication du lot pilote.

## Cours Gemini Gmail — aperçu du 21 août 2026

La fiche `/training/datacamp_gemini_in_gmail` a été contrôlée dans l’aperçu authentifié. Elle affiche désormais de façon cohérente **1 cours · 7 activités · 4 vidéos · 1 téléchargement**, avec le détail canonique **1 chapitre · 7 activités · 4 vidéos · 2 QCM · 1 ressource requise · 1 téléchargement**. La carte de cours affiche également **1 chapitre · 7 activités · 4 vidéos · 1 téléchargement**.

Le récapitulatif de progression emploie volontairement **0/7 activités**, conformément au verrouillage séquentiel par activité. La carte redondante qui affichait une seconde fois « 7 activités » a été retirée. Aucun débordement ni contenu tronqué n’a été observé sur la vue bureau contrôlée.

## Contrôle médias publiés — 21 août 2026

Les audits sur `https://akademy.neodev.click` confirment les références locales via `/api/assets/` des cours **Introduction to Claude Models**, **Introduction to Google Workspace with Gemini**, **Gemini in Gmail** et **Gemini in Google Meet**. Les réponses contrôlées renvoient les types attendus (`video/mp4`, `audio/mpeg`, `text/vtt; charset=utf-8` et `application/pdf`).

Une requête `HEAD` du proxy a retourné ponctuellement une erreur 500 pour la vidéo locale `ch01_ex02_generate_a_background_image_using_gemini_e631bc09.mp4`. Le fichier source MP4 et son chemin de stockage ont été vérifiés ; une seconde tentative a répondu **200 video/mp4**. L’audit a donc été rendu séquentiel et réessaie jusqu’à trois fois les erreurs 5xx transitoires. Le contrôle final du cours Gemini Meet est revenu sans erreur ; cette vidéo a réussi à la deuxième tentative, tous les autres médias à la première.
