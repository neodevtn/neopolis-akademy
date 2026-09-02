# Audit de la fiche apprenant 360°

## Constats et corrections

L’ancienne fiche utilisait le nombre de lignes `chapter_progress` comme nombre de chapitres validés. Une ligne représente pourtant le dernier état d’un suivi de chapitre, et non chaque écran réellement complété. Le KPI pouvait donc afficher un nombre de trackers au lieu du nombre d’écrans terminés. La nouvelle formule additionne, pour chaque suivi, `min(chapterIndex, totalChapters)` et conserve le plus haut état par cours/leçon.

Les leçons terminées sont dédoublonnées par cours et index de leçon. Pour les cours mono-leçon à plusieurs écrans, la leçon n’est comptée qu’une fois lorsque le dernier écran est atteint. Les cours multi-leçons ne sont déduits des chapitres que si le mapping écran/leçon est exact. Les vidéos sont dédoublonnées par cours et identifiant de vidéo.

Le temps actif ne somme que les événements `learning_time`, avec une borne de cinq minutes par événement historique. Cette borne empêche qu’un payload anormal ne gonfle les KPI et les graphiques, tout en restant compatible avec le heartbeat de soixante secondes du lecteur. La réussite au premier essai est désormais libellée **Réussite 1er examen** : elle mesure la part des premières tentatives finalisées et réussies, par formation. Aucun taux d’exercice n’est affiché lorsque les données de tentative d’exercice ne permettent pas ce calcul de façon fiable.

## Vue 360°

La fiche est organisée en sept onglets : **Synthèse**, **Profil**, **Parcours**, **Évaluations**, **Compétences**, **Activité** et **Intégrité**. Elle inclut les jalons horodatés, le profil de candidature visible uniquement aux administrateurs, les groupes d’accès, les badges, l’orientation, les formations, les examens, les évaluations de cours et l’historique recherché/paginé.

L’historique d’activité est une procédure distincte réservée au rôle administrateur. Il accepte une recherche limitée, est paginé à 20 éléments, ne dépasse jamais 50 éléments par page et ne révèle aucune donnée à un compte apprenant.

## Contrôle local

La QA authentifiée de la fiche de contrôle a vérifié les six KPI, les sept onglets, l’état vide de recherche dans l’historique et le profil mobile. La vue à 390 px conserve une largeur de document égale à la largeur du viewport et ne présente aucun débordement horizontal. Les captures de contrôle contenant des données de compte ne sont pas conservées dans le dépôt.

Après publication du checkpoint `f418a110`, la même QA a été exécutée sur `https://akademy.neodev.click`. Les six KPI, les sept onglets, l’état vide et la vue mobile sont confirmés. Le document mobile retourne `clientWidth = 390` et `scrollWidth = 390`. Le rapport machine ne contient aucun nom, adresse e-mail, score ni identifiant : seulement les critères validés et les mesures de largeur.
