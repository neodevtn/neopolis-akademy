# Audit initial — Gestion des examens de certification

## Constat du 1er septembre 2026

L’interface administrative présente actuellement deux sources de configuration distinctes. Le lecteur apprenant `MockExam` s’appuie sur `trainingIndex.examConfig`, tandis que l’administration lit et écrit un fichier séparé `examConfigurations.json`. Ce second fichier est vide lors de l’audit et ne contient que la sélection de banque ; il ne porte ni durée, ni code d’examen, ni score sur l’échelle 100–1000, ni domaines. Les modifications administratives ne sont donc pas utilisées par le passage apprenant.

La banque publiée `client/public/data/mockExamQuestions.json` contient 1 165 questions réparties entre les quatre formations actuellement configurées. Elle utilise bien le champ `certificationId`, identique aux identifiants de formation. Le problème d’affichage est principalement aggravé par la navigation catalogue : le clic affecte l’état local de certification puis construit immédiatement l’URL avec l’ancienne valeur, souvent vide. L’éditeur filtre alors correctement la banque sur un identifiant vide et affiche zéro question.

Le point d’entrée « Gérer l’examen de certification » n’est rendu que lorsqu’une configuration existe déjà, empêchant la création d’une épreuve pour toute autre formation. La procédure de soumission côté serveur accepte actuellement le score et l’état de réussite transmis par le navigateur sans contrôler la session d’examen, son expiration, les questions sélectionnées ou la durée configurée. Une réussite peut donc théoriquement conduire à l’attribution d’un certificat après expiration.

## Contrôle navigateur

Le contrôle public de la route administrative a confirmé que la session de contrôle n’est pas administratrice, ce qui empêche toute action d’édition non autorisée. Aucun contenu d’examen ni donnée d’apprenant n’a été affiché ou modifié pendant ce contrôle.

## Modèle de correction retenu

La table `certification_exams` devient la source durable dès la première création ou modification administrative d’une épreuve. Elle conserve une configuration complète et la banque de questions de la formation concernée. Les fichiers historiques restent disponibles en lecture seulement pour les épreuves existantes qui n’ont pas encore été modifiées ; ce repli évite toute disparition de question pendant la migration progressive. Une configuration d’examen contient le code, le nombre de questions par tentative, la durée en minutes, le seuil sur l’échelle 100–1000, les règles de mélange, l’état de publication et les domaines pondérés.

Le client ne choisit plus les questions, la durée, le score ou la réussite. Il demande au serveur d’ouvrir une session : le serveur sélectionne et enregistre les questions ainsi que les horodatages de début et d’expiration. La soumission est ensuite recalculée à partir de cette session scellée. À l’expiration, la tentative est mémorisée comme non réussie et aucune attribution de certificat n’est possible. Le serveur exige aussi la complétion de tous les cours de la formation avant de créer une session d’examen.

## Résultat de la QA locale

La sonde `scripts/check-exam-visibility-browser.mjs` a validé huit contrôles le 1er septembre 2026 : visibilité des quatre examens existants, absence de débordement mobile à 390 px, métadonnées et CTA après complétion, hiérarchie du catalogue administrateur, accès de création pour 111 formations sans examen, conservation de l’identifiant de formation dans l’URL, chargement des 300 questions et édition de la durée/seuil de l’examen Claude de contrôle.

Le même scénario a créé sur une formation sans épreuve une question temporaire, enregistré et publié une configuration, vérifié sa visibilité à un apprenant ayant terminé la formation, démarré une session protégée par le serveur, puis dépublié et supprimé la configuration temporaire. La dépublication et la suppression ont été déclenchées depuis les boutons de l’interface d’administration. La sonde a ensuite rechargé le catalogue administrateur et a confirmé le retour visuel à « Aucun examen blanc configuré » / « Créer un examen de certification » ; elle a aussi ouvert l’URL apprenant et confirmé l’état « Examen blanc non disponible ». Les captures `admin-exam-deleted-state.png` et `learner-exam-deleted-state-mobile.png` archivent ces deux preuves. Aucune donnée d’examen de contrôle ne demeure. Les tests déterministes confirment également qu’un score parfait produit après expiration reste **non réussi** et n’ouvre donc aucun droit à certificat.

## Contrôle publié

Après publication de la version `79cc6448`, le scénario a été rejoué sur `https://akademy.neodev.click`. Les huit contrôles sont tous positifs : les quatre examens existants restent visibles, les 111 points d’entrée de création restent disponibles, la banque et les réglages de l’examen de contrôle se chargent, puis le cycle création → publication → session protégée → dépublication → suppression est validé. Le rechargement post-suppression est également positif côté administration comme côté apprenant. La donnée temporaire de QA a été supprimée à la fin du scénario.

La même QA publique a démarré une session temporaire de durée **une minute**, a attendu son expiration réelle, puis a soumis la seule réponse correcte. La réponse du serveur confirme simultanément `timedOut: true`, `passed: false` et `achievement: null`. Cette preuve est distincte des tests unitaires : le domaine publié ne peut donc attribuer aucun certificat après la durée configurée.

## Prévisualisation et aide de configuration

L’éditeur propose désormais huit aides contextuelles : code d’examen, questions par tentative, durée, score minimal, mélange des questions, mélange des choix, publication et domaines/pondérations. Les aides sont disponibles au survol et à la focalisation clavier, et expliquent les effets réels côté apprenant et serveur, notamment l’absence de certificat après expiration.

Le bouton **Prévisualiser côté apprenant** ouvre une fenêtre non destructive fondée sur le brouillon courant. Elle ne crée ni session, ni tentative, ni sauvegarde. Elle restitue le statut disponible/brouillon/sans question, les informations d’examen, les conditions de passage et les domaines. La QA locale vérifie le reflet d’une durée non sauvegardée (119 minutes), les huit aides et le rendu sans débordement à 390 px. Les 502 tests de la suite complète ont réussi, avec deux tests explicitement ignorés.

Après publication de la version `6465c19f`, la même QA a été rejouée sur `https://akademy.neodev.click`. Elle confirme les huit aides contextuelles, l’affichage de la durée du brouillon non sauvegardé, l’absence de création de session et un dialogue mobile contenu à 356 px (`scrollWidth: 356`, sans descendant débordant). Les captures desktop et mobile sont archivées sous `docs/exam-visibility-screenshots/`.

## Suivi administratif des examens

L’onglet **Apprenants → Suivi des examens** liste chaque tentative sous forme de tableau paginé. Il associe l’apprenant, la formation, l’instant de soumission, le temps écoulé, le nombre de réponses justes, le score sur 1 000, son pourcentage et le résultat. La ligne comme l’action dédiée ouvrent la fiche de l’apprenant correspondant.

Les indicateurs sont calculés sur le filtre actif : nombre de tentatives et d’apprenants concernés, taux et volume de réussite, score moyen, durée moyenne et nombre de délais expirés. La recherche porte sur l’apprenant et l’identifiant de formation ; les filtres de formation et de résultat, le tri par date/score/durée et la pagination sont exécutés côté serveur. Cette procédure reste réservée aux administrateurs.

Les nouvelles tentatives conservent désormais la durée configurée et l’état d’expiration décidés par le serveur au moment de la soumission. Elles peuvent donc être filtrées de façon fiable comme « Temps expiré ». Les tentatives historiques restent visibles avec leur durée mesurée, mais ne peuvent pas être rétroactivement qualifiées comme expirées si cet état n’avait pas été enregistré.

La QA locale a vérifié les indicateurs, la table, les actions, la navigation active malgré des paramètres supplémentaires, le filtre « Temps expiré », la recherche associée, un passage réel en page 2 puis retour à la page 1 et l’état vide après une recherche sans résultat. Les calculs et l’autorisation sont couverts par quatre tests dédiés ; la suite de régression compte 506 tests réussis et deux tests explicitement ignorés.

Après publication de la version `7b461517`, le même scénario a été rejoué sur `https://akademy.neodev.click`. Tous les contrôles sont positifs : navigation active, indicateurs, table, action de fiche apprenant, filtres de résultat et de recherche, pagination effective et état vide. La tentative expirée de contrôle porte bien son état d’expiration persistant et est retournée par le filtre approprié. La configuration d’examen temporaire associée a été supprimée ; aucun examen artificiel ne reste publié.

## Hygiène des données de statistiques

Le 2 septembre 2026, les données pédagogiques de quatre comptes de contrôle — les comptes administrateurs et le compte apprenant de démonstration — ont été purgées à la demande du propriétaire. Cette opération a supprimé les progressions de formation, chapitres et vidéos, événements et journaux pédagogiques, évaluations IA, tentatives et sessions d’examen, relances, badges et certifications, contributions de compétences ainsi que les retours vidéo concernés.

Les comptes eux-mêmes, leurs droits, leurs groupes, les contenus de formation, les configurations d’examen, les journaux administratifs et les données des autres apprenants ont été conservés. La vérification post-purge confirme zéro activité pédagogique ou tentative d’examen restante sur les comptes ciblés, tandis que des données apprenantes non ciblées subsistent pour alimenter les indicateurs.
