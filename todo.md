# Project TODO — Neopolis Akademy

## Relance automatique des examens blancs
- [x] Auditer les données de complétion de formation, tentatives d’examen, envois e-mail et mécanismes planifiés disponibles afin de cibler uniquement les apprenants éligibles sans doublons — `training_progress`, `chapter_progress`, `exam_attempts` et `exam_sessions` sont distingués ; les quatre examens réels proviennent de `trainingIndex.examConfig`
- [x] Définir et documenter les règles de relance : délai après complétion, limite de fréquence, arrêt après tentative d’examen et contenu d’e-mail avec lien direct vers l’examen — délai de 24 h, une relance définitive par paire, arrêt à la première tentative et modèle officiel bilingue documentés dans `docs/exam-reminder-automation.md`
- [x] Implémenter un traitement planifié idempotent, les garde-fous anti-doublon, les journaux d’envoi et les tests de régression serveur — tables `exam_reminders` et `scheduled_job_registry`, claim unique atomique, callback cron-only, journal pédagogique et neuf tests dédiés ajoutés
- [x] Vérifier en environnement contrôlé la sélection des destinataires, l’absence de double relance et la sécurité d’accès au traitement planifié — tests ciblés 9/9, suite complète 495 réussis / 2 ignorés, validation catalogue sans erreur et callback local non authentifié refusé en 403 ; aucun e-mail réel n’a été expédié
- [x] Déployer la relance automatique des examens blancs via un checkpoint, puis vérifier que le service, le callback, les migrations et la documentation sont actifs sur `akademy.neodev.click` — checkpoint auto-publié `70503b09` ; callback déployé contrôlé sur le domaine public avec refus 403 hors cron
- [x] Créer le job Heartbeat projet, enregistrer durablement son `taskUid` dans `scheduled_job_registry`, puis vérifier le callback cron réel et ses journaux sans divulgation de donnée personnelle — tâche quotidienne active et UID persisté ; un cron temporaire non enregistré a validé l’authentification réelle trois fois en HTTP 200 / `unregistered-task`, puis a été supprimé avant toute sélection ou tout e-mail
- [x] Archiver les preuves de contrôle et livrer la relance automatique des examens blancs — règles, contrôles, publication et protocole d’exploitation consignés dans `docs/exam-reminder-automation.md`

## Correction de la gestion des examens de certification
- [x] Auditer l’interface « Gérer l’examen de certification », les configurations catalogue, les banques de questions, les procédures d’administration et le flux apprenant afin d’identifier pourquoi les questions ne sont pas visibles — cause confirmée : identifiant de formation perdu dans la navigation et double source de configuration ; constats archivés dans `docs/exam-certification-audit.md`
- [x] Finaliser la création, l’édition et la suppression d’un examen blanc entièrement administrables au niveau de chaque formation, sans créer de valeurs statiques ni d’épreuve fictive — entrée de création présente pour les 111 formations sans examen, configuration et banque persistées dans `certification_exams`, dépublication conservant la banque et suppression confirmée par QA transactionnelle avec nettoyage
- [x] Corriger le chargement et l’édition de la bibliothèque de questions, y compris les règles de sélection aléatoire et les métadonnées déclaratives de durée, seuil et nombre de questions — URL de formation conservée, 300 questions chargées dans la banque de contrôle, code, durée, seuil, nombre, mélange et domaines/pondérations éditables
- [x] Faire respecter côté serveur la durée configurée pendant le passage de l’examen et interdire toute attribution de certificat après expiration — session, questions, horodatages, score et réussite contrôlés serveur ; expiration force une tentative non réussie et bloque le certificat
- [x] Ajouter un contrôle de dépublication explicite dans l’éditeur, le relier à `disableExamConfiguration` et le couvrir par une sonde administrateur sans modifier les épreuves publiées — bouton explicite, confirmation, conservation de la banque et réponse protégée contrôlés dans la sonde navigateur
- [x] Vérifier de bout en bout sur une formation QA sans examen la création d’une question, la sauvegarde, la publication, la visibilité apprenant et le démarrage d’une session, puis nettoyer la donnée QA de contrôle — scénario QA validé et configuration temporaire supprimée ; aucune épreuve fictive de contrôle ne demeure
- [x] Vérifier explicitement le bouton UI « Supprimer l’examen » : créer une épreuve QA, la supprimer depuis l’éditeur et confirmer sa disparition de la source de données — scénario QA administrateur validé : bouton de dépublication puis bouton de suppression utilisés, configuration devenue indisponible et donnée temporaire nettoyée
- [x] Étendre la QA visuelle post-suppression : recharger l’éditeur administrateur et confirmer le retour à l’état « Créer un examen de certification », ouvrir le parcours apprenant et confirmer l’état d’indisponibilité, puis archiver les deux captures — catalogue administrateur et URL apprenant recontrôlés après suppression ; captures `admin-exam-deleted-state.png` et `learner-exam-deleted-state-mobile.png` archivées
- [x] Finaliser la preuve publique de passage : version auto-publiée `79cc6448` et QA publique de création, banque, session, dépublication et suppression réussies ; scénario contrôlé d’expiration rejoué sur le domaine public et absence de certificat confirmée
- [x] Ajouter à la sonde publique une tentative volontairement expirée qui vérifie la réponse non réussie et l’absence de certificat, puis archiver la preuve associée — session d’une minute, réponse correcte après expiration, `timedOut: true`, `passed: false` et `achievement: null` confirmés dans le rapport QA public

## Prévisualisation et aide de l’éditeur d’examen
- [x] Auditer les composants de l’éditeur d’examen, les primitives d’infobulle disponibles et le rendu apprenant afin de définir une prévisualisation fidèle sans ouvrir de session ni modifier de données — réemploi de la primitive Tooltip et de l’introduction apprenant ; aucune session ni persistence n’est appelée par le brouillon
- [x] Ajouter des aides contextuelles accessibles expliquant le code, la banque, le nombre de questions, la durée, le seuil, le mélange, la publication et les domaines/pondérations — huit boutons d’aide clavier/souris associés aux contrôles exacts de l’éditeur
- [x] Ajouter une prévisualisation apprenant alimentée par la configuration en cours d’édition, avec états absence de questions, épreuve non publiée et résumé de passage — dialogue non interactif qui affiche le brouillon sans sauvegarde ; aperçu de l’état, métadonnées, conditions de durée et domaines
- [x] Publier puis vérifier sur le domaine public les aides clavier/souris, le reflet d’un brouillon non sauvegardé et la prévisualisation desktop/mobile sans débordement, avec preuves — version `6465c19f` contrôlée sur `akademy.neodev.click` : huit aides, durée de brouillon à 119 min, absence de session et dialogue mobile `356/356` sans élément débordant

## Suivi administratif des examens
- [x] Auditer `exam_attempts`, les sessions et les écrans admin afin de déterminer les données réellement mesurables : formation, apprenant, début, soumission, durée effective, score, pourcentage, réussite et expiration — les tentatives finalisées sont la source de reporting ; durée mesurée par horodatages et expiration désormais persistée par tentative
- [x] Définir une procédure réservée aux administrateurs fournissant des indicateurs agrégés fiables, une liste paginée et recherchable de passages, sans exposer plus de données personnelles que nécessaire — procédure `admin.getExamMonitoring`, recherche limitée au nom/e-mail administrateur et identifiant de formation, réponse paginée et agrégats filtrés
- [x] Ajouter une rubrique « Suivi des examens » au menu d’administration avec filtres par formation et statut, tableau cliquable et détails de tentative cohérents — menu Apprenants, statistiques, recherche, filtres, tri, pagination et action vers la fiche apprenant ajoutés
- [x] Finaliser la couverture de la pagination et des états sans données du suivi administratif — calculs, autorisation, rendu, filtres et actions sont validés ; page 2 puis retour page 1 et filtre sans résultat confirmés par QA
- [x] Corriger le fil d’Ariane et l’état actif du menu administratif afin que les URL de suivi d’examens avec paramètres supplémentaires restent rattachées à « Suivi des examens » — paramètres d’onglet résolus indépendamment des paramètres supplémentaires et état actif contrôlé par QA
- [x] Vérifier et corriger la persistence de `timedOut` lors de la soumission afin que les expirations récentes puissent être distinguées dans le suivi administratif — `timeLimitMinutes` et `timedOut` persistés par le serveur, migration `0039` appliquée et filtre « Temps expiré » validé par QA
- [x] Ajouter une QA explicite de pagination du suivi des examens avec passage page suivante/précédente sur des données de contrôle, puis archiver la preuve — page 2 et retour page 1 contrôlés dans la sonde navigateur
- [x] Ajouter une QA ou un test explicite d’état vide en appliquant des filtres sans résultat et en vérifiant le message affiché — recherche impossible contrôlée et message « Aucune tentative ne correspond aux filtres appliqués » affiché
- [x] Publier le suivi des examens puis rejouer la QA sur le domaine public avec les filtres, les indicateurs, la navigation et la persistence d’expiration — version `7b461517` contrôlée sur `akademy.neodev.click` : navigation, statistiques, table, action profil, filtres, pagination, état vide et tentative expirée persistée tous validés ; configuration QA supprimée

## Purge des données d’activité de démonstration et d’administration
- [x] Identifier de façon agrégée les comptes administrateurs et le compte de démonstration, puis inventorier leurs données d’apprentissage et d’examen sans exposer leurs coordonnées — quatre comptes ciblés et volumes par table vérifiés sans afficher de coordonnées
- [x] Vérifier les dépendances et préparer une purge transactionnelle limitée aux activités, progressions, sessions et tentatives concernées, sans supprimer les comptes ni les configurations pédagogiques — comptes, groupes, contenus, configurations et journaux administratifs exclus ; seules les traces pédagogiques et leurs dérivés sont visés
- [x] Exécuter la purge autorisée, vérifier l’absence de données ciblées et contrôler que les statistiques ne comptent plus ces comptes — transaction effectuée sur progressions, événements, activités, évaluations, examens, relances, succès, compétences et retours associés ; toutes les catégories ciblées sont à zéro après contrôle
- [x] Archiver la méthode et les compteurs de purge non identifiants, puis publier les preuves de vérification — méthode et résultats agrégés consignés dans `docs/exam-certification-audit.md`

## Audit Sentry et retours utilisateurs — 7 derniers jours
- [x] Collecter les exceptions et feedback des sept derniers jours dans Sentry, ainsi que les journaux de déploiement et erreurs internes corrélables, sans divulguer de données personnelles — 14 signatures à dernière apparition récente et 3 feedbacks qualifiés, inventaire non identifiant archivé
- [x] Qualifier chaque incident par impact, fréquence, statut, signature, lien avec une publication et état de correction historique — erreurs de bundle et média actives distinguées de l’export développement historique, des retours non reproductibles et de l’optimisation N+1 reportée
- [x] Reproduire et corriger les bugs confirmés comme actifs ou bloquants, puis ajouter les tests de régression nécessaires — orientation, récupération de bundles et lecteur Projector corrigés ; 15 tests ciblés, QA média/orientation et 517 tests complets réussis
- [x] Finaliser la validation publique des correctifs Sentry — checkpoint `95ee7a56` publié ; orientation 5/5, limite du sixième, lecture audio + slides de deux activités Projector et absence d’erreur média non gérée validées ; récupération de bundle exécutée par test navigateur simulé et chargement nominal public sain
- [x] Vérifier de façon reproductible la récupération de bundle sans déclencheur artificiel public — 12 tests exécutent le rechargement, le préservent des paramètres, imposent une seule reprise par signature et autorisent seulement la signature distincte suivante ; une injection ou un bundle périmé public est volontairement exclu et documenté
- [x] Exécuter une QA navigateur isolée sur la prévisualisation de développement : déclencher `retryStaleClientBundle` réel, vérifier deux rechargements de signatures distinctes et le refus de doublon, puis archiver la preuve sans publier de route de test — premier rechargement, refus du doublon, second rechargement de signature distincte, paramètres conservés et 0 erreur de page confirmés ; rapport archivé
- [x] Empêcher la sélection d’un sixième objectif dans l’orientation, afficher la capacité restante et couvrir l’alignement avec la limite serveur de cinq objectifs — interface et helper pur alignés ; sonde locale non destructive confirme 5/5, désactivation du sixième et message de limite
- [x] Ajouter une récupération unique et contrôlée des imports différés incompatibles après publication afin d’éviter qu’un apprenant reste bloqué sur une erreur de module `default` ou de chunk obsolète — signatures `default` ajoutées au mécanisme existant, sans boucle
- [x] Permettre une récupération contrôlée distincte après un premier rechargement si une seconde signature de bundle obsolète apparaît, sans boucle de rafraîchissement — marqueurs indépendants `stale-chunk`, `lazy-default` et `react-tree`, un seul rechargement par type et par chemin
- [x] Empêcher la remontée d’un rejet non géré quand une activité Projector ne dispose d’aucune source média lisible, conserver les slides et afficher une alternative compréhensible — promesse `play()` interceptée et message non bloquant dans le lecteur
- [x] Transmettre la piste audio déclarée aux deux rendus Projector du lecteur de cours afin que les cours à MP4 indisponible utilisent leur audio local valide — repli audio validé sur deux activités, slides conservées et aucune erreur non gérée

## Revue exhaustive des feedbacks utilisateurs Sentry — 7 derniers jours
- [x] Recenser séparément chaque feedback utilisateur récent, son texte utile, sa date, sa route et les éléments techniques disponibles, sans archiver de donnée personnelle — trois feedbacks de la période documentés individuellement dans `docs/sentry-user-feedback-7day-audit-2026-09-02.md`
- [x] Qualifier chaque feedback : bloquant, dégradant, historique, non reproductible ou lié à un déploiement, avec une décision de traitement explicite — un défaut actif confirmé ; accès historique et retour orientation sans trace ne se reproduisent plus, avec décision de suivi explicite
- [x] Reproduire et corriger les défauts fonctionnels confirmés, avec des tests et des contrôles navigateur dédiés aux retours concernés — limite de cinq objectifs alignée client/serveur et contrôlée ; cours concerné actuellement accessible avec Full access
- [x] Stabiliser la sonde publique d’orientation afin qu’elle cible le statut de capacité réellement rendu après cinq sélections, sans dépendre d’un parent DOM instable — sonde corrigée et publique : cinq sélections, sixième désactivée, message de limite, aucune sauvegarde et aucune erreur
- [x] Publier la revue de feedback et vérifier sur le domaine public l’orientation corrigée, l’accès au parcours concerné et l’absence de régression avant de livrer le rapport détaillé — rapport publié au checkpoint `e5a5e67a` ; contrôle public 5/5 sans sauvegarde ni erreur et parcours concerné accessible avec Full access

## Fiche apprenant 360° et fiabilité des KPI
- [x] Auditer les formules et sources des KPI de suivi apprenant : leçons, chapitres, vidéos, examens, temps actif et réussite à la première tentative — le nombre brut de trackers de chapitre et le KPI d’exercices sans source de tentative fiable ont été identifiés comme divergents
- [x] Vérifier les KPI sur la fiche demandée à partir de données persistées agrégées et identifier chaque écart entre affichage et source — les écrans validés sont calculés par état réel ; le temps est borné par heartbeat ; la réussite mesure le premier examen par formation
- [x] Définir une fiche 360° par onglets : synthèse, profil candidat, parcours et progression, examens, compétences, activité chronologique et graphiques — sept onglets : Synthèse, Profil, Parcours, Évaluations, Compétences, Activité et Intégrité
- [x] Ajouter des procédures administrateur protégées et minimisées pour les données de profil, jalons, graphiques et KPI corrigés — enrichissement de détail et journal d’activité paginé, filtrable, réservé au rôle admin
- [x] Implémenter l’interface responsive avec tableaux paginés, actions de navigation et états vides explicites sans concentrer les informations sur une seule vue — profil candidature, groupes, jalons, graphiques, progression, examens et journal sont répartis par onglet
- [x] Couvrir les calculs, permissions, onglets, graphiques et navigation profil par tests et contrôles navigateur desktop/mobile — 522 tests réussis, QA authentifiée des 7 onglets, état vide et rendu 390 px sans débordement
- [x] Publier la fiche 360° et vérifier la cohérence des KPI sur le domaine public avant livraison — checkpoint `f418a110` déployé ; QA authentifiée publique : six KPI, sept onglets, état vide du journal et mobile `390/390` validés sans donnée de compte archivée

## Mise en valeur du programme de parrainage
- [x] Auditer l’onglet, la page, les récompenses, le suivi de parrainage et les segments de communication existants afin de réutiliser uniquement les mécanismes administrables déjà présents — campagne active, lien tracé, récompense/cadeau administrés et audience `registered_invitees` réutilisés sans valeur fictive
- [x] Ajouter un onglet apprenant « Parrainage » cohérent avec Catalogue et Compétences, avec un visuel, les récompenses réelles et des explications de partage par lien, e-mail, WhatsApp et Messenger — onglet `parrainage`, alias historique `parainnage`, visuel composé, cartes cadeaux, suivi et étapes de partage ajoutés ; cartes existantes réutilisées
- [x] Préparer un communiqué court ciblant les apprenants inscrits, avec un lien direct vers l’onglet Parrainage et sans envoi avant confirmation explicite — brouillon non important « Partagez Neopolis Akademy et découvrez le parrainage », filtre `registered_invitees` + rôle apprenant, 107 destinataires agrégés, aucun envoi déclenché
- [x] Publier puis vérifier sur le domaine public le rendu desktop/mobile, les liens de partage, la navigation et le brouillon de 107 apprenants ; demander ensuite confirmation explicite pour l’envoi — onglet publié au checkpoint `eec0185d`, lien tracé et canaux vérifiés publiquement, mobile `390/390`; après confirmation, le brouillon a été envoyé une seule fois avec statut `sent`, horodatage présent et 107 destinataires agrégés
- [x] Corriger le débordement horizontal mobile détecté dans l’onglet Parrainage et couvrir le viewport 390 px avant publication — navigation responsive contenue et QA `390/390` réussie

## Contrôle de bout en bout des invitations de démonstration
- [x] Auditer les invitations de démonstration existantes, les actions d’acceptation et les groupes associés sans exposer de jeton, d’adresse ou d’identifiant personnel — compte de démonstration existant, invité temporaire à créer et groupe Full access identifiés ; aucune invitation pendante réutilisée
- [x] Exécuter les scénarios contrôlés d’acceptation pour le compte démo et l’invité `invite_demo`, puis vérifier activation, groupe Full access, session et accès au catalogue — les deux branches réelles réussissent : invitation acceptée, session créée, Full access présent, arrivée à `/training` et zéro erreur de page
- [x] Nettoyer les invitations, comptes et relations temporaires créés uniquement pour la QA, préserver les comptes et données préexistants, puis archiver des résultats agrégés — mot de passe démo restauré ; compte/invitations/appartenances temporaires supprimés et compteur final à zéro
- [x] Diagnostiquer la validation de la page d’acceptation lorsque la sonde ne rend pas le formulaire attendu, sans exposer de jeton ni de coordonnées — API valide et formulaire réel rendu ; seul le sélecteur de test attendait à tort un titre sémantique
- [x] Vérifier et corriger le rendu du formulaire après une validation d’invitation réussie si le parcours réel reste bloqué sur un état de chargement ou une erreur client — aucun défaut applicatif constaté : formulaire, confirmation et redirection vérifiés dans les deux branches

## Restauration ciblée du compte apprenant
- [x] Inventorier de façon agrégée les données de progression, examens, compétences et activités de Mohamed Rayene Khelil avant toute modification de rôle — données persistées confirmées : progressions, vidéos, examen, compétences, succès, événements et journal d’activité
- [x] Sauvegarder l’état actuel du compte, restaurer le rôle apprenant et corriger la visibilité des données sans toucher aux autres utilisateurs — rôle déjà `user`, restauration idempotente exécutée sans modifier les données pédagogiques
- [x] Vérifier les statistiques et l’accès à l’espace apprenant après restauration, puis archiver un bilan non identifiant — compte actif et non bloqué ; total de compétences non nul et procédure de progression personnelle indépendante du rôle admin

## Rôle admin-apprenant
- [x] Auditer les contrôles de rôle et définir `admin_learner` comme administrateur autorisé et apprenant comptabilisé — permission administrative centralisée ; le séquencement reste explicitement préservé
- [x] Étendre le schéma, les procédures d’administration, les menus et les libellés pour administrer le rôle admin-apprenant — migration `0040_lean_hellfire_club.sql` appliquée, sélection explicite dans le suivi apprenants et raccourci Administration depuis Formation
- [x] Vérifier que le rôle admin-apprenant conserve les permissions admin, les accès aux formations et les statistiques/progressions personnelles — populations pédagogiques, communication, intégrité, relances et réussite historique incluses ; 527 tests réussis, 2 ignorés

## Rationalisation des candidatures et visibilité admin-apprenant
- [x] Retirer la vue Kanban — Candidatures, ses liens et tout raccourci orphelin sans supprimer les données de candidature — ancienne URL normalisée vers Candidatures, avec test de non-régression
- [x] Appliquer de façon ciblée le rôle admin-apprenant à Mohamed Rayene Khelil sans modifier ses données d’apprentissage — rôle confirmé après mise à jour ciblée, sans écriture pédagogique
- [x] Afficher un badge Admin-apprenant dans les profils et listes administratives concernés, puis vérifier le rendu et les accès — badge de fiche 360° et liste vérifié par QA authentifiée, sans overflow mobile

## Pages publiques thématiques et SEO des formations
- [x] Retirer les mentions visibles de partenaires et de sources d’origine des titres, cartes, fiches et résultats de recherche sans modifier les identifiants techniques internes — 17 titres de catalogue et 8 titres rendus dans les cours normalisés ; identifiants et métadonnées techniques préservés ; index de recherche régénéré
- [x] Créer des pages publiques indexables par thème et métier, accessibles depuis le catalogue et décrivant l’offre réelle de formations IA gratuites — index `/formations-ia` et 10 pages thématiques rendus en HTML serveur, reliés depuis l’accueil et le catalogue
- [x] Ajouter des métadonnées SEO, données structurées, graphiques fondés sur le catalogue et une navigation publique entre thèmes et formations — title, description, canonical, Open Graph, Twitter, JSON-LD, sitemap et robots ajoutés ; indicateurs exclusivement dérivés du catalogue
- [x] Vérifier les pages publiques, les titres, les liens, le rendu mobile et les éléments SEO avant publication — QA locale et publique 1280, 390 et 375 px réussie ; HTTP 200, 404/noindex, canonical, Open Graph, JSON-LD, sitemap et absence d’overflow validés après checkpoint `8c650dda`

## Pages publiques multilingues et SEO MENA
- [x] Auditer la sélection de langue, les routes et les métadonnées existantes afin de définir des URL stables en français, anglais et arabe — routes indexables retenues : `/formations-ia`, `/en/ai-training` et `/ar/ai-training`, avec le même slug de thème
- [x] Localiser intégralement l’index et les pages thématiques publiques en français, anglais et arabe, avec support RTL accessible — contenu éditorial, cartes, métiers, compétences, formations, CTA, navigation et pages introuvables localisés ; 609 chaînes catalogue traduites et versionnées pour EN/AR
- [x] Ajouter les balises `hreflang`, données structurées, canonical et sitemap pour les trois langues avec un ciblage éditorial MENA prudent — canonical auto-référent, alternatives FR/EN/AR/x-default, Open Graph, JSON-LD localisé et sitemap enrichi sans promesse pays par pays
- [x] Vérifier les versions FR/EN/AR sur desktop et mobile, y compris le rendu RTL, les liens et le HTML exploitable par les robots — 543 tests réussis (2 ignorés), matrice QA de publication réussie ; sonde 18 routes × 3 formats, 404/noindex et sitemap valides ; revue visuelle desktop et mobile RTL sans débordement

## Audit comparatif avancé — DataCamp et Neopolis
- [x] Auditer les formations certifiantes, les examens blancs, les invitations de fin de cours et les métadonnées de durée/questions réellement disponibles — 4 formations certifiantes configurées, chacune avec code examen, nombre de questions, durée, seuil et domaines issus de `trainingIndex.examConfig`
- [x] Rendre les examens visibles dans les cartes, filtres et fiches de formation avec un appel à l’action post-complétion lorsque l’épreuve est éligible — filtre « Avec examen blanc », badges catalogue, résumé questions/durée/seuil et CTA d’examen ajoutés sans créer d’examen fictif
- [x] Clarifier l’administration autour de la hiérarchie Catégorie de formation → Formation → Cours → Activités et séparer les surfaces catalogue et contenu — console catalogue renommée selon la structure apprenant, niveaux hiérarchiques affichés et bouton de gestion d’examen relié aux formations certifiantes
- [x] Tester les règles d’éligibilité, métadonnées, droits administrateur et interfaces desktop/mobile avant publication — typage, validation cours, 486 tests, sonde navigateur apprenant/admin et matrice QA 6/6 réussis localement
- [x] Publier la refonte de visibilité des examens et de hiérarchie catalogue via checkpoint, puis vérifier sur `akademy.neodev.click` le filtre « Avec examen blanc », les badges questions/durée/seuil, l’invitation d’examen et la vue admin hiérarchisée — checkpoint `fad4ae01` publié ; sonde publique apprenant/admin réussie après propagation, avec 4 cartes certifiantes, détails d’examen visibles, hiérarchie admin contrôlée et mobile 390 px sans overflow
- [x] Rejouer sur `akademy.neodev.click` un parcours certifiant éligible jusqu’à la fin du dernier cours et vérifier explicitement l’apparition de l’invitation d’examen post-complétion avec ses métadonnées exactes — sonde publique réussie après checkpoint `2f4acc7c` : dernier cours `claude_certified_associate_foundations__08`, message de fin de parcours, `60 questions`, `120 min`, `720/1000` et CTA `/mock-exam/claude_certified_associate_foundations` validés
- [x] Étendre `scripts/check-exam-visibility-browser.mjs` pour couvrir le scénario de fin de cours certifiant avec CTA d’examen visible après complétion réelle ou état QA contrôlé, puis archiver la preuve publique — sonde enrichie avec préparation QA contrôlée des leçons et chapitres, contrôle local puis public réussis, rapport `docs/exam-visibility-browser-qa.json` mis à jour
- [x] Auditer les données de consultation, démarrage, progression et complétion disponibles afin de calculer des KPI de popularité, engagement et abandon par cours — 12 948 événements avec cours, 238 progressions de chapitre, 417 complétions et 9 870 événements de temps disponibles
- [x] Définir des KPI réels, leurs formules, périodes et états de données insuffisantes, sans données estimées ou profils identifiables — démarrages distincts, actifs/minutes sur 30 jours et abandons non terminés inactifs depuis 14 jours ; état explicite si aucune donnée
- [x] Ajouter l’agrégation sécurisée réservée aux administrateurs et l’affichage compact des KPI dans le catalogue — agrégation sans identité individuelle ajoutée à `adminContent.listCourses` et colonne KPI uniquement dans le tableau administrateur ; appel sans session vérifié HTTP 403
- [x] Tester explicitement l’état vide « Pas encore de données » sur un cours sans activité dans le catalogue administrateur et archiver la preuve — sonde QA administrateur et capture mobile dédiées confirment le libellé affiché sur plusieurs cours sans activité
- [x] Étendre la sonde mobile des KPI pour cibler une ligne renseignée et vérifier explicitement la lisibilité de démarrages, actifs/minutes et abandons — ligne KPI renseignée détectée et contenue dans le viewport avec ses trois métriques
- [x] Archiver une preuve mobile dédiée des KPI renseignés, puis compléter la consignation finale des contrôles de droits, calculs, état vide et mobile — capture dédiée montre KPI renseignés et état vide ; documentation et sortie machine mises à jour
- [x] Auditer les métiers des 40 TP, les options du filtre et la taxonomie de formation actuelle afin d’identifier les ajouts nécessaires — les métiers sont portés par `targetJob` au niveau des cours TP et aucune taxonomie de format n’était déclarée dans le catalogue
- [x] Ajouter les sous-catégories de formation « Préparation aux certifications », « Formation » et « Tutoriel / TP » au modèle catalogue et aux filtres — taxonomie déclarative `trainingFormats`, filtre dédié et badge de carte ajoutés
- [x] Ajouter au filtre de recherche les métiers couverts par les TP et classer leurs 40 formations autonomes en « Tutoriel / TP » — les métiers `targetJob` remontent dynamiquement, l’intersection Business developer + Tutoriel / TP retourne le TP 01 et les 40 TP portent ce format
- [x] Rejouer en production le filtre métier Business developer, son intersection avec Tutoriel / TP et la recherche catalogue après la mise à jour de taxonomie — sonde publique : un TP retourné dans les deux cas ; recherche « prospection Google Maps » retrouve la formation et son checkpoint
- [x] Contrôler explicitement à 390 × 844 le catalogue public avec les nouveaux filtres de taxonomie et l’absence de débordement — `clientWidth = 390`, `scrollWidth = 390`, overflow absent
- [x] Archiver les preuves fonctionnelles et mobiles de ces filtres puis clôturer la publication de taxonomie — rapport `training-catalog-taxonomy-public-qa.json` et capture mobile enregistrés dans `docs/`
- [x] Auditer la rubrique IA appliquée aux métiers - TP, ses 40 TP, les liens actuels et les dépendances d’indexation afin de préparer leur séparation en formations autonomes — cause confirmée : une certification regroupait les 40 cours, alors que le catalogue présente les certifications comme formations principales
- [x] Réintégrer les huit lots de cinq TP après l’ajout du format mono-cours, puis vérifier que les 40 formations autonomes portent leurs métadonnées, contenus et supports — huit lots réintégrés et contrôlés ; les 40 certifications portent `isStandaloneTP: true`
- [x] Étendre les tests de structure pour exiger pour chacun des 40 TP une formation mono-cours, son indicateur autonome et sa sous-catégorie métier — test dédié renforcé sur les 40 certifications, leur unique cours rattaché et leur sous-catégorie
- [x] Vérifier au navigateur des formations représentatives de chacune des huit sous-catégories, y compris les anciens liens profonds, avant de clôturer la correction — TP 01, 07, 11, 17, 22, 27, 32 et 37 contrôlés desktop/mobile ; redirection d’une ancienne URL conservant `lesson` et `chapter` validée
- [x] Ajouter un contrôle automatisé de redirection des 40 anciens liens TP vers leur formation autonome, avec conservation de `lesson` et `chapter` — sonde Playwright 40/40 réussie
- [x] Archiver un rapport consolidé des 40 formations autonomes : indicateur mono-cours, cours unique, support présent et mapping de lien profond — rapport détaillé relu dans `docs/ia-appliquee-metiers-standalone-structure.md` et sortie machine 40/40 enregistrée
- [x] Publier la correction de structure et vérifier l’ancienne URL du TP 01 sur le domaine public — checkpoint `cf45b228` publié ; TP 01 autonome rendu et ancienne URL redirigée avec conservation de la position
- [x] Vérifier sur le domaine public la vue catalogue IA appliquée aux métiers - TP et archiver une preuve des 40 cartes autonomes et des huit sous-catégories métier — contrôle DOM public : 40 liens de formations autonomes et les huit libellés métier présents
- [x] Exécuter un contrôle navigateur public desktop et mobile de la rubrique restructurée, incluant le catalogue et une formation autonome publiée — catalogue et TP 01 vérifiés sur desktop ; 12 contrôles publiés réussis à 390 × 844, sans overflow
- [x] Archiver un rapport public consolidé de la structure publiée : 40 formations visibles, huit sous-catégories et redirection d’un ancien lien conservant `lesson` et `chapter` — rapport complété puis relu dans `docs/ia-appliquee-metiers-standalone-structure.md`
- [x] Archiver une preuve reproductible de l’audit initial des titres, descriptions, blocs pédagogiques et index avant nettoyage — rapport `visible-datacamp-mentions-before-cleanup.json` créé depuis `HEAD` : 220 mentions catalogue et 911 mentions de cours sur 48 cours
- [x] Rejouer après le dernier nettoyage les contrôles locaux sur finance, ventes, n8n et Claude, avec une preuve exploitable du fil d’Ariane et des éléments médias réellement rendus — sonde navigateur archivée : 4/4 sans marque visible et fil d’Ariane présent ; ressources ou transcriptions confirmées pour finance, ventes et n8n ; aucun média n’est déclaré sur le premier écran Claude contrôlé
- [x] Archiver explicitement les preuves par parcours du contrôle local final avant de clôturer le nettoyage de marque visible — rapport `visible-datacamp-mentions-browser-qa.json` et quatre captures dédiées enregistrés
- [x] Corriger les formulations de remplacement dégradées encore présentes dans le parcours ventes, puis revérifier son fil d’Ariane, ses transcriptions et ses ressources — comparaison « Microsoft Copilot et Microsoft Copilot Studio » et textes de narration corrigés, avec contrôle navigateur local
- [x] Publier le nettoyage et vérifier l’absence de mention dans le catalogue et les parcours publics, tout en préservant les identifiants et métadonnées techniques internes — sonde authentifiée publique 4/4 : finance, ventes, n8n et Claude sans marque affichée ; identifiants et routes historiques conservés
- [x] Régénérer l’index, contrôler l’absence de mention dans le parcours public, exécuter la QA et publier le nettoyage — index régénéré, audit final 0/0, QA publication 6/6 et checkpoint `9a1f3e72` publiés
- [x] Comparer exhaustivement le catalogue de cours, les fichiers de cours et l’index de recherche afin d’identifier toute absence ou entrée obsolète — 177 cours catalogue, 177 fichiers de cours, 177 entrées cours et 3 519 chapitres comparés sans absence, doublon ni orphelin
- [x] Corriger les écarts d’indexation vérifiés, couvrir les invariants catalogue/recherche par test et régénérer l’index — aucun écart de données ; index régénéré à 3 772 entrées et test de couverture par titre public ajouté
- [x] Vérifier la recherche publique sur des cours représentatifs, publier et archiver le rapport d’audit d’indexation — cours et chapitres du TP « Agent de prospection Google Maps avec scoring automatique » retrouvés dans l’interface publique ; rapport JSON archivé
- [x] Publier le script, le test, l’index régénéré et le rapport d’audit, puis rejouer la recherche sur le domaine public après le déploiement — checkpoint `00cbcadf` publié ; recherche « prospection Google Maps » rejouée sur `akademy.neodev.click`
- [x] Consigner dans le suivi le checkpoint et la preuve de recherche publique correspondante — résultat cours et six chapitres du TP de contrôle visibles, avec liens profonds valides
- [x] Vérifier les sources RSS recommandées pour AI News et définir une lecture publique à la demande sans tâche planifiée — six flux actifs contrôlés ; OpenAI, Hugging Face, Google AI, MIT Technology Review, MarkTechPost et arXiv cs.AI retenus ; cache serveur de huit minutes
- [x] Créer la rubrique publique AI News avec agrégation sûre, filtres de sources et recherche rapide dans les titres, extraits et catégories — route publique `/ai-news`, cartes limitées aux titres/extraits/liens, recherche rapide, filtres et états d’indisponibilité partielle ajoutés
- [x] Tester les sources, les erreurs partielles, la recherche, le rendu public desktop/mobile et publier la rubrique AI News — 50 articles issus de six sources affichés, recherche « Cursor » ramenée à un résultat et filtre OpenAI confirmé ; vue mobile 390 × 844 contrôlée en prévisualisation, QA publication 6/6, route publique et chargement RSS confirmés sur `akademy.neodev.click`
- [x] Rejouer une indisponibilité partielle contrôlée d’un flux AI News et vérifier que les autres articles restent accessibles sans erreur de page — alerte visible et article de la source restante lisible dans la sonde navigateur
- [x] Contrôler la page AI News publiée à 390 × 844, avec recherche et filtre, puis vérifier l’absence de débordement horizontal — recherche « Cursor » et filtre OpenAI validés ; `scrollWidth = 390`, `clientWidth = 390`, aucun overflow
- [x] Auditer l’affichage actuel des communiqués apprenants, les données de lecture et les règles d’accusé de réception obligatoire — la page rendait tous les corps HTML à la suite ; les reçus et accusés importants serveur ont été identifiés comme invariants
- [x] Reconcevoir les communiqués en boîte de réception compacte avec recherche, filtres, liste de messages et volet de lecture responsive — pagination côté serveur, recherche débouncée, filtre non lus/priorité, aperçus bornés, liste sélectionnable et volet de lecture ajoutés
- [x] Republier puis vérifier la boîte de réception après le correctif mobile de l’en-tête — recherche « orientation » validée (2 à 1 communiqué), lecture persistante confirmée par l’API, état important non accusé couvert par test, sonde mobile publique 390 × 844 sans débordement et QA 6/6 réussie
- [x] Vérifier que la sélection d’un communiqué non lu déclenche réellement la mutation de lecture depuis l’interface, actualise la liste et met à jour le compteur sans appel manuel — sonde publiée : sélection utilisateur, transition lu confirmée et compteur passé de 1 à 0
- [x] Auditer l’accueil et les données de session disponibles afin d’identifier les actions utiles aux visiteurs et aux utilisateurs authentifiés — navigation, session différée et widget de reprise existant analysés
- [x] Adapter l’accueil avec un message, des indicateurs et des appels à l’action distincts pour un apprenant connecté, sans modifier le parcours visiteur — salutation individualisée, accès aux formations/tableau de bord et bouton « Mon espace » ajoutés ; les CTA visiteurs restent inchangés
- [x] Tester les deux états d’authentification sur desktop et mobile, puis publier le correctif de personnalisation — accueil public rejoué connecté et après déconnexion ; héros authentifié avec progression 83 %, reprise, tableau de bord et Mon espace, puis CTA visiteurs restaurés ; prévisualisation mobile 390 × 844 sans débordement, QA 6/6 et checkpoint `e1cd4715` publiés
- [x] Auditer les liens de parrainage, la route de candidature et les métadonnées sociales afin d’identifier pourquoi les partages ne sont ni prévisualisés ni contextualisés — les partages visaient directement `/apply`, le formulaire commençait immédiatement à l’étape 1/10 et les balises renvoyaient le titre générique « Candidature »
- [x] Créer une page publique de recommandation contextualisée avant le formulaire et fournir des métadonnées Open Graph/Twitter sûres aux robots sociaux — nouvelle route `/refer`, redirection rétrocompatible des anciens liens, titre canonique du cours, image sociale Neopolis et texte HTML échappé
- [x] Ajouter des tests de métadonnées et de conservation des paramètres de parrainage, puis vérifier le lien public partagé et publier le correctif — 10 tests SEO/parrainage et 460 tests complets réussis ; QA publication 6/6 ; redirection 302, balises sociales, image et affichage public desktop/mobile confirmés
- [x] Valider le bundle « IA appliquée aux métiers - TP » et traiter son JSON comme source canonique pour les 40 modules — intégrité, identifiants, ordre et répartitions métier contrôlés ; URL sources vérifiées par lots de cinq
- [x] Ajouter la rubrique, ses huit sous-catégories métier et les 40 TP composés exclusivement à partir de blocs Neopolis standards — générateur canonique, index métier et regroupement apprenant ajoutés
- [x] Ajouter préparation d’environnement sûre, ressources sources, mini-projets, checkpoints, quiz avec corrections, supports fictifs et indexation recherche — 40 supports téléversés dans la médiathèque, liens source visibles en nouvel onglet, index de 3 772 entrées régénéré
- [x] Contrôler chaque lot de cinq TP, exécuter la QA de publication et vérifier les parcours publiés sur desktop et mobile — huit contrôles de lot réussis, tests dédiés, QA complète 6/6, huit catégories rendues sans overflow desktop/mobile et interactions du TP pilote rejouées
- [x] Publier réellement la rubrique « IA appliquée aux métiers - TP » puis vérifier sur le domaine public au moins un TP représentatif par sous-catégorie en desktop et mobile — checkpoint `9a6d91ae` déployé ; huit TP représentatifs testés sur `akademy.neodev.click`, sans overflow desktop ni mobile 390×844
- [x] Exécuter un contrôle de production des cartes, fiches et parcours de la nouvelle rubrique, puis archiver les preuves avant la clôture — carte et fiche agrégées confirmées à 240 activités et 280 exercices interactifs ; ressource source, checkpoint, mini-projet, correction post-réponse et quiz/tri du TP 01 rejoués
- [x] Contrôle global transversal DataCamp reporté sur instruction utilisateur du 29 août 2026 ; ne pas l’exécuter dans la présente clôture rapide — report confirmé, hors périmètre de la livraison examens
- [x] Empêcher la bannière de consentement aux cookies de recouvrir l’accusé de réception d’une communication importante, sans masquer aucun des deux parcours obligatoires — bannière sous le dialogue (`z-40` contre `z-50`), actions cookies visibles mais volontairement bloquées sous la communication obligatoire, CTA d’accusé visible et au premier plan desktop/mobile
- [x] Créer un contrôle E2E authentifié qui force simultanément un communiqué important en attente et l’absence de consentement, puis vérifie sur desktop et mobile la case et le bouton de confirmation — les deux vues confirment dialogue, consentement, accusé et CTA visibles, en viewport et au premier plan
- [x] Vérifier le contrôle flottant externe de signalement lorsque la communication importante est ouverte et documenter son impact ou son absence d’impact sur les actions obligatoires — E2E authentifié : déclencheur Sentry rendu desktop/mobile, sans recouvrement de la case ni du CTA obligatoire
- [x] Étendre le contrôle E2E à la position et au recouvrement du widget tiers de signalement, puis archiver un rapport et une capture mobile nommée avec le dialogue important ouvert — rapport JSON et captures desktop/mobile actualisés à 01:37 UTC
- [x] Si le widget tiers peut recouvrir une action obligatoire à un viewport donné, appliquer un masquage ou une pile compatible tant que la communication importante est ouverte — aucune intersection mesurée dans les deux viewports ; aucun masquage supplémentaire requis
- [x] Étendre le contrôle E2E aux boutons Accepter et Refuser de la bannière cookies pendant l’affichage de la communication importante, en documentant explicitement leur blocage volontaire ou leur action utilisable — boutons présents mais volontairement recouverts par la couche du dialogue dans les deux viewports
- [x] Documenter dans le composant et les preuves la priorité attendue : communication importante à confirmer d’abord, puis consentement cookies sans recouvrement
- [x] Exécuter la QA complète du correctif d’overlay — six étapes réussies : TypeScript, validation cours, tests, audit d’interactions, matrice desktop et matrice mobile
- [x] Publier le correctif d’overlay et confirmer sur le domaine public le dialogue prioritaire, l’accusé et la bannière cookies — E2E authentifié sur `akademy.neodev.click` à 01:48 UTC, desktop 1280 × 720 et mobile 390 × 844 tous critères validés
- [x] Rendre la sonde de consentement indépendante des libellés de langue du compte QA, en ciblant structurellement les actions de la bannière avant de rejouer le contrôle public — sonde structurée réussie sur production, sans dépendre de « Accepter » ou d’un autre libellé localisé
- [x] Éliminer l’avertissement Radix sur l’absence de `DialogDescription` du dialogue de communication importante et couvrir sa présence accessible — E2E authentifié de production à 02:09 UTC : dialogue décrit par `radix-_r_9_`, description présente et 0 avertissement console desktop/mobile
- [x] Instrumenter le scénario public afin d’identifier chaque `role="dialog"`, son intitulé et son attribut `aria-describedby` lorsque l’avertissement Radix est émis — diagnostic JSON archivé pour desktop et mobile
- [x] Identifier puis éliminer l’avertissement de conteneur statique observé pendant l’ouverture du dialogue, sans modifier le comportement de scroll ou les contrôles fixes — parallaxe converti au défilement global ; scénario public incluant navigation et scroll, 0 avertissement Framer Motion
- [x] Horodater un nouveau contrôle authentifié du dialogue important, puis confirmer dans une console fraîche l’absence de l’avertissement Radix `Missing Description` — 02:09 UTC, aucune occurrence
- [x] Rejouer une navigation et un scroll automatisés de l’accueil après le correctif parallaxe, puis confirmer dans une console fraîche l’absence de l’avertissement Framer Motion de conteneur statique — 02:09 UTC, aucune occurrence
- [x] Qualifier le délai de connexion local Drizzle observé à 02:01 UTC et vérifier qu’il n’affecte pas la disponibilité publiée ni les contrôles QA publics — connexion locale perdue pendant l’arrêt du watcher ; après redémarrage, domaine public et E2E QA fonctionnels sans erreur
- [x] Pendant l’absence de l’utilisateur, vérifier les publications récentes, l’intégrité des checkpoints et les erreurs techniques exploitables sans relancer l’audit transversal reporté — dépôt propre hors suivi, trois derniers checkpoints présents, aucune erreur récente détectée dans les journaux serveur/navigateur, domaine public HTTP 200, suite de régression à 143 fichiers / 447 tests réussis et validation de cours à 0 erreur ; les 223 alertes de quasi-doublons sont historiques et non bloquantes
- [x] Exécuter une dernière vérification autonome de disponibilité et des erreurs récentes avant la fin de la fenêtre de cinq heures, sans relancer l’audit transversal reporté — planification différée indisponible après deux tentatives, mais vérification de repli exécutée : domaines public/local HTTP 200, dépôt propre et les cinq lignes contenant « Error » sont des initialisations `INFO` du moniteur, sans erreur active
- [x] Vérifier, après le test utilisateur, que la session Chrome locale Mighty-Shadow et non un navigateur distant porte les sessions apprenant DataCamp et Neopolis pour la comparaison côte à côte — audit côte à côte explicitement reporté ; aucun accès fournisseur relancé dans cette livraison
- [x] Confirmer que la session utilisée n’est plus identifiée comme « Browser: Sandbox » avant de consulter ou répondre aux activités DataCamp — contrôle reporté avec l’audit côte à côte ; hors périmètre de la livraison examens
- [x] Inventorier tous les cours DataCamp présents dans Neopolis et les regrouper en vagues d’audit traçables — action reportée avec le contrôle transversal DataCamp ; hors périmètre de la livraison examens
- [x] Comparer, en apprenant avancé, les structures, médias, consignes, interactions, corrections et conditions de passage avec les sources DataCamp accessibles — action reportée ; aucune comparaison fournisseur relancée
- [x] Corriger les divergences reproductibles avec les blocs standards Neopolis et supprimer les activités non reproductibles avec leurs références associées — action reportée ; aucun correctif DataCamp transverse inclus
- [x] Rejouer les parcours corrigés, exécuter la QA de publication et consigner pour chaque cours les écarts assumés — action reportée ; non incluse dans la livraison examens

## Correctifs DataCamp selon le paquet d’audit du 28 août
- [x] Traiter d’abord `ai-for-consulting` : comparer source/Neopolis, convertir en TP local les dépendances reproductibles et retirer entièrement les éléments impossibles
- [x] Raccorder les 16 TP ai-for-consulting disposant de critères source explicites à une évaluation réellement rubricée, persistée et non validée par simple texte saisi
- [x] Retirer l’activité 3.9 sans critères ni ressources locales exploitables, puis recalculer navigation et compteurs sans référence résiduelle
- [x] Retirer les recommandations externes DataCamp du contenu Projector tout en conservant les médias locaux du cours
- [x] Vérifier après un TP cloud que les points de compétences associés sont effectivement visibles et actualisés côté apprenant, sans affichage XP — contribution `exercise passed` visible à +1,0 point dans Prompt engineering
- [x] Vérifier dans le profil administrateur du même apprenant la contribution `exercise passed` ainsi que la valeur actualisée des points après le TP DataCamp, sans mention XP — total 4/100 et delta +1,0 visibles
- [x] Normaliser le score de chaque TP cloud évalué sur une échelle 0–100 avant l’événement de compétence, y compris lorsque la rubrique source a un score maximal de 1 — score binaire validé à 100/100
- [x] Appliquer les contrôles globaux DataCamp : aucune mention XP, aucun HTML/Markdown brut, aucun lien externe DataCamp, et libellé honnête « Audio + diapositives » pour Projector — contrôle transversal reporté et non relancé conformément à l’instruction utilisateur
- [x] Ne passer à chaque cours prioritaire suivant qu’après contrôle apprenant, QA, publication et rapport de correction du cours courant — règle maintenue pour la reprise ultérieure, sans exécution dans la livraison examens

## Lot DataCamp suivant — AI for Finance
- [x] Récupérer et comparer le manifeste canonique `ai-for-finance` avec le cours Neopolis, écran et activité par activité
- [x] Vérifier les 9 TP AI for Finance conservés, fondés sur une rubrique source explicite sans assets locaux déclarés, et documenter leur autonomie réelle avant publication
- [x] Synchroniser les indicateurs AI for Finance après retrait des activités 1.8 et 1.11, puis contrôler les compteurs rendus dans la fiche et le catalogue — 28 activités, 10 vidéos, 18 exercices interactifs et 3 téléchargements
- [x] Corriger le tri « Augmentation ou automation ? », les références DataCamp et les fragments de contenu brut
- [x] Supprimer le breakdown manuel périmé du cours AI for Finance et protéger la synchronisation de son identifiant catalogue — adaptateur rejoué ; test confirme 28 activités, 18 exercices, 10 vidéos, 3 téléchargements et l’absence de `breakdown`/`exerciseLabel` manuel
- [x] Fiabiliser la sonde de métriques afin qu’elle attende le rendu de la fiche de formation plutôt que le seul texte du bandeau de cookies — contrôle de la carte et de la fiche publié confirmé après attente explicite des métriques
- [x] Publier AI for Finance après les contrôles apprenant, les neuf TP, le tri interactif et la QA complète déjà validés, puis vérifier la production — production confirmée : 28 activités, 18 exercices interactifs, 10 vidéos, 3 téléchargements ; TP rubricé et tri mobile vérifiés

## Lot DataCamp suivant — AI for Human Resources
- [x] Restaurer le paquet officiel Drive et vérifier l’archive complète — SHA-256 validé, 3 chapitres, 32 activités, 11 vidéos et 385 téléchargements source disponibles
- [x] Établir l’audit activité-par-activité avec le manifeste officiel — 32/32 activités présentes ; 9 TP avec rubrique explicite et 7 candidats au retrait sans rubrique/asset source
- [x] Examiner individuellement les 16 TP cloud, convertir uniquement ceux disposant d’une rubrique source explicite et retirer les autres avec justification canonique — 9 TP rubricés, 7 retraits justifiés (1.8, 2.2, 2.5, 2.11, 3.3, 3.5, 3.9)
- [x] Scanner explicitement les vidéos, transcripts, slides et textes apprenant AI for Human Resources pour toute référence DataCamp/Copilot résiduelle, puis corriger les occurrences visibles — les seules occurrences restantes sont métadonnées, identifiants ou noms de fichiers non affichés
- [x] Ajouter et exécuter une QA dédiée AI for Human Resources rejouant au moins un écran Projector et un tri conservé côté apprenant, en complément du TP rubricé — Projector 1.1 et tri 1.3 vérifiés au viewport mobile ; TP rubricé déjà rejoué
- [x] Confirmer par preuve automatisée le nettoyage fournisseur, les métriques dérivées et le rejeu des interactions conservées avant publication — audits, test métier, QA complète six étapes et sondes ciblées réussis
- [x] Stabiliser la matrice QA mobile en isolant chaque navigation de bloc afin d’éviter les crashs de renderer cumulés — `qa:publish` retrouve 6/6 étapes réussies
- [x] Archiver le checkpoint de preuve de production AI for Human Resources après vérification finale de `git status --short` — checkpoint de preuve `085cf7fb` créé après les contrôles Projector, tri et TP en production

## Lot DataCamp suivant — AI for Marketing
- [x] Restaurer et vérifier le paquet officiel Drive — archive de 13 parties validée SHA-256 ; 3 chapitres, 29 activités et 400 téléchargements locaux
- [x] Établir l’audit initial activité par activité — 29/29 présentes, 12 TP avec rubrique explicite et 2 candidats sans rubrique à examiner
- [x] Examiner les activités 2.8 et 2.13 sans rubrique explicite, puis adapter seulement les 12 TP admissibles ou justifier les retraits canoniques — « As du chiffre » et « Mesurer et itérer » sont deux `CloudExercise` sans rubrique ni actif local déclaré ; elles sont retirées sans substitut, audit 29 source / 27 conservées / 2 omissions
- [x] Nettoyer les dépendances fournisseur visibles, synchroniser les métriques et rejouer le tri et le TP avant publication — preuve publiée : 27 activités, 17 exercices, 10 vidéos et 3 téléchargements ; tri 1.6 et un TP rubricé rejoués avec verrou, feedback, déverrouillage, accessibilité et contribution de compétence
- [x] Rejouer et documenter les Projector Marketing côté apprenant : préparation séquentielle QA de deux unités, puis matrice 10/10 confirmant rendu, flux vidéo local, slides, commande de lecture et 0 référence fournisseur visible

## Lot DataCamp suivant — AI for Sales
- [x] Restaurer et vérifier le paquet officiel Drive — archive de quatre parties validée SHA-256 ; 3 chapitres, 26 activités et 309 téléchargements locaux
- [x] Établir l’audit initial activité par activité — 26/26 activités présentes, 9 TP avec rubriques explicites et 4 candidats au retrait sans rubrique
- [x] Examiner les activités 1.3, 1.6, 2.5 et 2.6 sans rubrique explicite, puis retirer seulement les dépendances non reproductibles avec justification canonique — les quatre `CloudExercise` sont sans rubrique ; 2.5 et 2.6 requièrent en plus des documents externes non livrés ; elles sont retirées sans substitut, audit 26 source / 22 conservées / 4 omissions
- [x] Convertir les 9 TP rubricés et vérifier les métriques, interactions et médias locaux avant publication — 9/9 rubriques, seuils et verrous valides ; tri, QCM et TP de l’unité active rejoués ; matrice apprenant Projector 9/9 avec audio, slides et absence de référence fournisseur visible
- [x] Corriger la sonde de métriques pour les cours sans téléchargement affichable et confirmer le contrôle de production AI for Sales — carte et fiche confirment 22 activités, 13 exercices et 9 vidéos ; le compteur nul de téléchargement est volontairement masqué

## Lot DataCamp suivant — Introduction à l’IA générative dans Snowflake
- [x] Restaurer et vérifier le paquet officiel Drive — archive de trois parties validée SHA-256 ; 2 chapitres, 20 activités et 7 vidéos source
- [x] Établir l’audit initial activité par activité — 20/20 activités présentes ; 13 TP cloud sans rubrique explicite et un média externe à nettoyer
- [x] Vérifier dans le JSON et l’audit l’absence effective des 13 TP cloud non rubricés et de leurs références associées, sans exercice libre ajouté — audit 20 source / 7 conservées / 13 omissions déclarées, 0 candidat restant
- [x] Scanner les médias et textes visibles Snowflake pour confirmer le nettoyage du média externe, puis rejouer la synchronisation des métriques avant clôture définitive — audit source corrigé à 0 média externe, synchronisation et tests ciblés réussis
- [x] Reprendre le contrôle public de la carte et de la fiche : 7 activités, 0 exercice interactif, 7 vidéos et 2 téléchargements confirmés sur le domaine public

## Lot DataCamp suivant — Priorité à identifier
- [x] Identifier le prochain cours DataCamp à forte dépendance cloud dans le rapport d’audit, restaurer son paquet officiel et valider son empreinte avant toute adaptation — Snowflake a été sélectionné, restauré et clôturé

## Lot DataCamp suivant — Microsoft Copilot dans PowerPoint
- [x] Restaurer le paquet officiel Drive et vérifier son archive — quatre parties validées SHA-256 ; 3 chapitres, 20 activités et 7 Projector source
- [x] Établir l’audit initial activité par activité — 20/20 activités présentes ; 11 TP disposant de rubriques explicites et un média externe à nettoyer
- [x] Nettoyer le média externe résiduel, confirmer les 11 TP rubricés et rejouer les interactions avant toute publication — audit à 0 média externe ; 11/11 rubriques, seuils et verrous valides ; TP 3.2 rejoué avec champ de réponse, correction masquée et Suivant verrouillé avant évaluation

## Lot DataCamp suivant — Microsoft Copilot dans Word
- [x] Restaurer et vérifier le paquet officiel Drive — archive de treize parties validée SHA-256 ; 3 chapitres, 29 activités et 10 vidéos source
- [x] Établir l’audit initial activité par activité — 29/29 activités présentes ; 9 TP avec rubriques explicites et 5 candidats sans rubrique
- [x] Examiner les cinq TP sans rubrique, convertir uniquement les neuf TP admissibles et retirer les dépendances non reproductibles avec justification canonique — activités 1.3, 2.5, 2.6, 2.8 et 3.3 retirées sans substitut, audit 29 source / 24 conservées / 5 omissions, 0 média externe
- [x] Contrôler les TP, QCM et Projector Word conservés — 9/9 TP rubricés et sans dépendance externe ; QCM 3.5 et TP 3.2 rejoués avec correction masquée, feedback ou verrou attendu ; 10 Projector avec audio/slides locaux et 105 slides/transcriptions, 0 référence fournisseur visible
- [x] Resynchroniser les métriques Word et relancer la QA complète après le nettoyage final de la recommandation fournisseur — 137 cours et 75 certifications synchronisés, QA complète à six étapes réussie
- [x] Contrôler de nouveau la carte et la fiche Word après la synchronisation : 24 activités, 14 exercices, 10 vidéos et 3 téléchargements attendus — valeurs confirmées par sonde authentifiée
- [x] Réinitialiser uniquement la progression QA du cours Word avec l’autorisation explicite reçue, puis rejouer le tri dans son état apprenant initial — seules les tables de progression, chapitre et vidéo du cours Word ont été nettoyées pour le compte QA
- [x] Rejouer un tri Word en unité active afin de vérifier à nouveau son verrou de soumission — tri 1.2 validé : placement au clic, cible clavier, soumission verrouillée jusqu’au placement complet, feedback et Suivant débloqué après réponse correcte

## Lot DataCamp suivant — Développement logiciel avec GitHub Copilot
- [x] Restaurer et vérifier le paquet officiel Drive — archive de vingt parties validée SHA-256 ; 4 chapitres, 40 activités et 13 vidéos source
- [x] Établir l’audit initial activité par activité — 40/40 activités présentes ; aucun TP cloud ou exercice libre à adapter
- [x] Vérifier les deux URL détectées comme exemples pédagogiques non chargés — `example.com` et `api.example.com/docs` restent des exemples canoniques non chargés et ne sont ni média, ni laboratoire, ni dépendance DataCamp
- [x] Resynchroniser explicitement les métriques GitHub Copilot et en archiver la trace avant clôture — synchronisation globale réussie puis carte et fiche confirmées à 40 activités, 27 exercices, 13 vidéos et 4 téléchargements
- [x] Rejouer en session apprenant QA un tri et une leçon Projector GitHub Copilot, avec preuve du verrou, du feedback et de l’absence de dépendance fournisseur visible — tri 1.6 validé avec verrou et feedback ; 3 Projector de l’unité 1 rendus avec audio/slides locaux et 0 dépendance opérationnelle visible

## Lot DataCamp suivant — Building Agentic Workflows with LlamaIndex
- [x] Restaurer le paquet officiel Drive, valider son empreinte et auditer ses exercices DataLab avant toute adaptation — SHA-256 validé ; 5 Projector et 10 activités DataLab sources
- [x] Étendre l’audit d’alignement aux `DatalabExercise`, puis retirer les dix activités LlamaIndex sans rubrique ou critère source explicite — audit 15/15, 10 retraits assumés, aucune omission involontaire ni média externe
- [x] Ajouter un test de régression pour les cinq Projector LlamaIndex conservés et l’absence de TP libre sans rubrique — deux tests ciblés et QA complète à six étapes réussis

## Lot DataCamp suivant — End-to-End RAG avec Weaviate
- [x] Télécharger et comparer l’empreinte SHA-256 officielle Weaviate à l’archive assemblée, puis consigner la preuve de restauration — `sha256sum -c official.sha256` retourne `OK`
- [x] Rejouer au moins un écran Projector Weaviate avec la session apprenant, documenter audio/slides et confirmer le contrôle avant publication — rendu, audio, slides et absence de référence fournisseur confirmés

## Lot DataCamp suivant — Systèmes multi-agents avec LangGraph
- [x] Restaurer le paquet officiel Drive, valider l’empreinte et auditer les neuf exercices DataLab avant toute adaptation — archive de deux parties validée SHA-256 ; manifeste de 13 activités, dont 9 DataLab sans rubrique
- [x] Retirer les neuf activités DataLab LangGraph sans rubrique source et nettoyer le lien externe résiduel — audit 13/13, 9 retraits assumés et 0 média externe
- [x] Rejouer et documenter un écran Projector LangGraph avec une session apprenant — rendu, audio, slides et absence de référence fournisseur validés ; les écrans ultérieurs restent verrouillés séquentiellement
- [x] Exécuter et archiver un contrôle statistique des quatre Projector LangGraph, incluant audio, slides, sous-titres/transcriptions, médias locaux et chaînes fournisseur visibles — 4/4 Projector : audio/slides locaux, 44 slides, 44 segments de transcription, 0 référence fournisseur visible
- [x] Reprendre le contrôle public complet de la carte catalogue et de la fiche : sonde réexécutée avec chargement DOM, carte et fiche confirment 4 activités, 0 exercice interactif, 4 vidéos et 2 téléchargements

## Lot DataCamp suivant — Priorité après LangGraph
- [x] Identifier le prochain cours DataCamp à forte dépendance DataLab dans l’audit, restaurer son paquet officiel et vérifier son empreinte avant toute adaptation — MongoDB/LangGraph a été sélectionné, restauré et clôturé

## Lot DataCamp suivant — Agents text-to-query avec MongoDB et LangGraph
- [x] Restaurer le paquet officiel Drive et vérifier son empreinte — archive de douze parties validée SHA-256 ; 13 activités source dont 8 DataLab
- [x] Établir l’audit initial activité par activité — 13/13 activités présentes ; 8 DataLab sans rubrique explicite et un lien externe à nettoyer
- [x] Retirer les huit activités DataLab sans rubrique et nettoyer le lien externe résiduel — audit 13/13 sans omission et 0 média externe
- [x] Exécuter un contrôle statistique dédié des cinq Projector MongoDB LangGraph : audio, slides, transcription, médias locaux et absence de référence fournisseur visible — 5/5 audio/slides locaux, 64 slides, 64 segments de transcription et 0 référence fournisseur visible
- [x] Reprendre le contrôle public de la carte et de la fiche : 5 activités, 0 exercice interactif, 5 vidéos et 3 téléchargements confirmés par sonde authentifiée

## Lot DataCamp suivant — Graph RAG avec LangChain et Neo4j
- [x] Restaurer le paquet officiel Drive, valider son empreinte et auditer les exercices DataLab avant toute adaptation — archive de 14 fragments, SHA-256 `3b8a170c…46384747`, `unzip -t` et manifeste à 37 activités / 11 Projector documentés
- [x] Qualifier l’exercice visuel 2.2 « Éléments d’un graphe lexical » sans actif local mappé et, s’il est réellement absent, le retirer avec sa référence associée — actif `identifying-elements.png` déclaré uniquement sur `assets.datacamp.com`, absent du paquet et de l’index local ; retrait 2.2 déclaré, audit 37 source / 36 conservées / 1 omission, 0 média externe
- [x] Resynchroniser les métriques dérivées et exécuter la QA complète après le retrait Graph RAG — 36 activités, 22 exercices, 11 Projector et 3 téléchargements ; six étapes QA réussies
- [x] Rejouer un exercice Code REPL Graph RAG en session apprenant et vérifier saisie, solution masquée, feedback et verrouillage séquentiel sans exécuter de code arbitraire — activité 1.4 contrôlée localement : éditeur, solution masquée, feedback canonique et Suivant déverrouillé après validation déterministe
- [x] Publier Graph RAG adapté puis confirmer la carte et la fiche de production avant tout autre lot — contrôle différé réussi sur les deux vues : 36 activités, 22 exercices interactifs, 11 Projector et 3 téléchargements

## Correctif de sécurité — Code REPL
- [x] Retirer l’exécution JavaScript arbitraire par `new Function` du bloc standard Code REPL, définir un comportement sûr pour les langages sans runtime sandboxé et couvrir la non-exécution par des tests — validation déterministe par solution canonique normalisée, libellé explicite et test statique sans `new Function` ni `eval`, TypeScript validé

## Lot DataCamp suivant — Building AI Agents with Haystack
- [x] Restaurer le paquet officiel Drive, valider l’empreinte et auditer les six exercices DataLab avant toute adaptation — paquet officiel SHA-256 validé ; 11 activités source dont 6 DataLab et 5 Projector
- [x] Retirer les six activités DataLab Haystack sans rubrique source, nettoyer le lien externe résiduel et valider les cinq Projector conservés avant publication — audit sans média externe, 5/5 Projector contrôlés, 49 slides et 49 segments de transcription, QA complète réussie
- [x] Reprendre le contrôle public de la carte et de la fiche : 5 activités, 0 exercice interactif, 5 vidéos et 2 téléchargements confirmés par sonde authentifiée

## Lot DataCamp suivant — Agents IA avec Hugging Face smolagents
- [x] Restaurer le paquet officiel Drive, valider l’empreinte et auditer les exercices runtime avant toute adaptation — archive de quatorze parties validée SHA-256 ; 30/30 activités déterministes conservées, 0 TP cloud/DataLab, 0 média externe
- [x] Ajouter un test de régression des 30 activités smolagents déterministes, puis exécuter la QA avant publication — test existant confirmé et QA complète à six étapes réussie

## Lot DataCamp suivant — Building AI Agents with CrewAI
- [x] Restaurer le paquet officiel Drive, valider l’empreinte et auditer les cinq exercices DataLab avant toute adaptation — archive de deux parties validée SHA-256 ; 7 activités source dont 5 DataLab
- [x] Retirer les cinq activités DataLab CrewAI sans rubrique source et nettoyer les deux références externes — audit 7/7, 5 retraits assumés et 0 média externe
- [x] Exécuter un contrôle statistique dédié des deux Projector CrewAI : audio, slides, transcription, médias locaux et absence de référence fournisseur visible — 2/2 vidéos MP4/HLS ou audio locaux, 31 slides, 31 segments de transcription et 0 référence fournisseur visible

## Lot DataCamp suivant — Priorité après CrewAI
- [x] Identifier le prochain paquet officiel DataCamp dans la liste des cours non encore audités, restaurer sa source et établir un audit activité par activité — « Introduction à l’IA pour le travail » a été sélectionné et clôturé

## Lot DataCamp suivant — Utiliser l’API OpenAI
- [x] Restaurer le paquet officiel Drive, vérifier son empreinte et auditer les activités avant toute adaptation — archive Drive officielle téléchargée, MD5 Drive `93466809d5cdb3c6eda0aba2026a24b9` concordant et `unzip -t` réussi ; aucune somme SHA-256 n’est fournie par ce paquet
- [x] Nettoyer les neuf références XP et trois liens externes du cours OpenAI, puis valider les 29 activités déterministes avant publication — audit 29/29, XP, lien externe, DataLab et HTML brut à 0
- [x] Retirer les mentions de gamification et la recommandation DataLab indisponible des transcriptions ; conserver ou reformuler les deux références documentaires OpenAI uniquement si elles restent clairement non nécessaires au passage — liens externes retirés des textes apprenant, actifs locaux préservés
- [x] Ajouter une régression pour les 29 activités OpenAI conservées et l’absence de références XP/DataLab visibles avant la QA complète — test ciblé et QA complète à six étapes réussis
- [x] Aligner la sonde de métriques OpenAI sur les 20 activités interactives dérivées du catalogue avant de conclure le contrôle de production — `code_repl` inclus ; production confirmée à 29 activités, 20 exercices, 9 vidéos et 3 téléchargements

## Lot DataCamp suivant — Computer Vision
- [x] Exclure le paquet Hugging Face « Computer Vision » du périmètre DataCamp selon l’instruction utilisateur ; aucune restauration ni adaptation ne doit être engagée

## Lot DataCamp suivant — Introduction à l’IA pour le travail
- [x] Restaurer le paquet officiel Drive, vérifier son empreinte et auditer les 33 activités avant toute adaptation — archive validée SHA-256 ; audit 33/33 sans omission ni dépendance runtime
- [x] Retirer les deux fragments HTML bruts détectés, puis valider les 33 interactions déterministes et les 11 Projector locaux — HTML brut à 0, test ciblé réussi et QA complète à six étapes réussie
- [x] Aligner la sonde de métriques sur les 22 exercices interactifs source, dont les huit exercices visuels, avant de conclure le contrôle public — le contrat inclut `resource_review`; production confirmée à 33 activités, 22 exercices, 11 vidéos et 4 téléchargements

## Lot DataCamp suivant — Priorité après smolagents
- [x] Identifier le prochain paquet DataCamp selon le rapport comparatif, restaurer sa source officielle et auditer son potentiel de reproductibilité avant toute adaptation — Google Cloud AI puis L’IA pour les data analysts ont été sélectionnés et clôturés

## Lot DataCamp suivant — Innovating with Google Cloud AI
- [x] Restaurer le paquet officiel Drive, vérifier son empreinte et auditer les activités avant toute adaptation — archive en trois parties validée SHA-256 ; 23/23 activités conservées, 11 visual exercises HTML5 locaux, 12 QCM, 0 dépendance externe et QA complète à six étapes réussie
- [x] Corriger la sonde de métriques pour les cours sans compteur vidéo affichable et confirmer le contrôle public Google Cloud AI — production confirmée à 23 activités, 12 exercices, 0 vidéo et 0 téléchargement

## Lot DataCamp suivant — Priorité moyenne
- [x] Sélectionner et restaurer le paquet officiel « L’IA pour les data analysts » : six fragments validés, SHA-256 et ZIP contrôlés, audit initial 39/39 activités sans dépendance Cloud/DataLab ni écart structurel
- [x] Retirer les activités 1.2 et 4.2, seules activités `EmbeddedApp` sans réponse déterministe ni actif local, avec leurs dépendances opérationnelles ; conserver 37 activités reproductibles et resynchroniser les métriques à 37 activités, 26 exercices, 11 Projector et 4 téléchargements
- [x] Rejouer l’audit, les 11 Projector locaux et la QA complète de « L’IA pour les data analysts » : 118 slides/transcriptions, aucun média ou libellé fournisseur visible, six étapes QA réussies
- [x] Publier « L’IA pour les data analysts » puis contrôler la carte et la fiche de production : 37 activités, 26 exercices interactifs, 11 vidéos et 4 téléchargements confirmés sur le domaine public

## Lot DataCamp suivant — Construire des systèmes agentiques évolutifs
- [x] Restaurer le ZIP officiel Drive, vérifier sa somme SHA-256 et contrôler le manifeste canonique : archive validée, 3 chapitres, 29 activités, 10 Projector et 399/399 téléchargements locaux
- [x] Auditer les 29 activités : 3 exercices visuels retirés car leurs images canoniques déclarées ne sont pas fournies localement ; 26 activités déterministes et le scénario conversationnel sont conservés, les recommandations externes DataCamp sont retirées
- [x] Adapter et tester le cours : 6 tris, un QCM et le scénario de chat rejoués avec verrou, feedback et déverrouillage ; 10 Projector locaux contrôlés ; QA complète à six étapes réussie
- [x] Publier le cours et contrôler la carte et la fiche de production : 26 activités, 16 exercices interactifs, 10 Projector et 3 téléchargements confirmés sur le domaine public

## Hygiène du checkpoint — AI for Finance
- [x] Passer une vérification automatisée exhaustive sur tous les rapports et captures QA du lot AI for Finance, lister les preuves conservées et consigner tout artefact obsolète avant publication — `pnpm audit:ai-for-finance-artifacts` valide 57/57 artefacts (8 rapports, 3 captures dédiées, 46 captures de matrice), 0 invalide, 0 candidat obsolète et `deletedObsoleteArtifacts: []`
- [x] Valider le rapport automatisé d’artefacts QA AI for Finance puis refaire `git status --short` pour confirmer l’état final après nettoyage — `git diff --check` réussi et état Git limité aux sources, tests, données et preuves attendus ; validations TypeScript, JSON et 426 tests vertes

## Pagination du journal opérationnel
- [x] Auditer la requête et le composant du journal opérationnel de la page Administration → Erreurs client
- [x] Ajouter une pagination serveur et une recherche au journal tout en conservant l’ordre des événements
- [x] Afficher total, plage courante et contrôles précédente/suivante accessibles dans l’interface — 10 345 événements sur 414 pages contrôlés
- [x] Publier le correctif de pagination du journal opérationnel et vérifier sur le domaine public la recherche et le passage de page — 10 352 événements sur 415 pages, navigation 1→2 et recherche `learning time` validées

## Relance des invitations expirées
- [x] Identifier les invitations expirées, les destinataires déjà inscrits et les statuts d’envoi afin de définir le périmètre éligible — 92 invitations contrôlées, 85 destinataires uniques éligibles
- [x] Préparer une relance qui conserve le groupe affecté et invalide proprement l’ancien lien
- [x] Obtenir la validation du nombre de destinataires avant tout envoi d’e-mail — confirmation explicite reçue pour 85 relances
- [x] Envoyer les relances approuvées, vérifier les journaux et consigner le résultat — 85 envoyées et suivies, 0 échec, 86 anciens liens expirés invalidés

## Diagnostic d’accès apprenant — Wefa Naouch
- [x] Identifier le compte Wefa Naouch, ses groupes d’apprenants et la formation qui retourne « accès non attribué » — compte actif sans aucun groupe
- [x] Corriger uniquement l’appartenance ou l’affectation de formation nécessaire, avec une trace d’administration — rattachement au groupe système Full access
- [x] Vérifier la route concernée en vue apprenant et publier le correctif si du code est requis — règle serveur `userCanAccessCourse` confirmée pour le cours Novasavo

## Groupe par défaut — Full access
- [x] Rattacher Wafa Nawech au groupe système Full access et vérifier son accès aux formations
- [x] Ajouter une règle de secours durable : tout utilisateur sans groupe est affecté à Full access lors de l’invitation, de l’inscription ou de la première résolution d’accès
- [x] Ajouter Full access à tous les comptes actifs existants qui ne l’ont pas encore, sans retirer ni écraser leurs groupes restreints existants — zéro compte actif sans Full access après réconciliation
- [x] Ajouter des tests d’intégration réels des flux invitation, création de compte et première ouverture sans groupe — invitation sans groupe, upsert, premier accès et nettoyage réversible validés
- [x] Ajouter une trace d’administration aux affectations automatiques et à la réconciliation Full access — événement durable consultable pour Wafa Nawech
- [x] Rejouer une affectation manuelle Full access et vérifier l’événement durable avec `assignedBy` — événement durable validé avec l’identifiant administrateur responsable
- [x] Vérifier en navigateur avec une session apprenant que la route auparavant bloquée s’ouvre après Full access — Novasavo s’ouvre sans message d’accès refusé
- [x] Publier/checkpointer les changements Full access et vérifier en production qu’un compte sans groupe reçoit l’accès attendu — Wafa ouvre Novasavo sur le domaine publié sans message d’accès non attribué

## Fiabilité des listes, communications et indicateurs
- [x] Auditer la limite actuelle de la liste d’invitations et la remplacer par une table paginée, recherchable et triable côté serveur — 183 invitations directes contrôlées sur 8 pages
- [x] Diagnostiquer l’état de lecture des communiqués côté apprenant et assurer une persistance distincte par utilisateur et par communiqué
- [x] Inventorier tous les indicateurs de certification, cours, leçon et activité afin d’identifier les attributs déclaratifs et les valeurs injectées dans les textes
- [x] Définir une source de vérité et des fonctions de calcul uniques pour les indicateurs des catalogues, formations et cours, puis supprimer les compteurs incohérents ou codés en dur
- [x] Auditer et migrer les rendus restants d’indicateurs de leçon/activité vers les métriques synchronisées ou la progression réelle, puis documenter la couverture complète
- [x] Créer le checkpoint, publier les corrections, puis vérifier en production les invitations, l’historique apprenant et les compteurs de formation/cours — domaine publié contrôlé : 183 invitations sur 8 pages, deux communiqués visibles côté apprenant et états lecture/accusé distincts
- [x] Vérifier en production les compteurs du catalogue, de la fiche de certification et de la progression Novasavo, puis consigner les valeurs observées — n8n : 32 activités, 10 vidéos, 22 exercices interactifs, 3 téléchargements ; Novasavo : 1/12 unités avec examen final distinct
- [x] Vérifier séparément le compteur rendu dans le catalogue apprenant publié, puis consigner cette troisième preuve de production — la carte n8n affiche 32 activités, 10 vidéos, 22 exercices interactifs et 3 téléchargements, identiques à la fiche de certification

## Extension transversale — Assistants Anthropic et DataCamp
- [x] Inventorier les panneaux d’assistant, points d’entrée, réponses préremplies, rendus Markdown et contraintes visuelles des cours Anthropic et DataCamp — aucun panneau assistant ou bloc d’évaluation IA dans Anthropic ; 13 évaluations IA source dans trois cours DataCamp et aucun panneau assistant générique actif
- [x] Appliquer aux composants concernés le contrat d’assistant contextuel, le refus hors périmètre, le rendu Markdown sûr et la réponse non tronquée — renderer Markdown standardisé pour les assistants et les évaluations DataCamp ; seuil de passage du bloc aligné sur `passingScore`
- [x] Vérifier que les contrôles de révision/édition restent invisibles aux apprenants et visibles aux administrateurs — confirmé par le lecteur commun ; aucun contrôle d’édition n’est rendu dans les évaluations DataCamp côté apprenant
- [x] Rejouer des assistants représentatifs Anthropic et DataCamp sur desktop et mobile, puis exécuter la QA de publication et publier le correctif — Anthropic ne contient aucun bloc concerné ; une évaluation DataCamp a été rejouée desktop/mobile, puis la QA complète a réussi

## Correctif global — Assistant pédagogique contextuel
- [x] Auditer tous les rendus, points d’entrée et réponses d’assistant pédagogique afin d’identifier toute réponse simulée, préremplie ou déconnectée de la requête saisie — 12 panneaux actuellement présents, tous dans Novasavo
- [x] Faire répondre l’assistant à la requête réellement envoyée, avec refus court et recentrage pédagogique pour les demandes hors périmètre
- [x] Empêcher qu’une question suggérée soit traitée comme une requête apprenant tant qu’elle n’a pas été explicitement sélectionnée
- [x] Vérifier la visibilité des contrôles de révision/édition entre apprenant et administrateur — contrôles cachés côté apprenant et visibles côté administrateur
- [x] Supprimer toute hauteur ou contrainte de débordement qui tronque la réponse d’un assistant, avec une lecture complète et accessible sur mobile comme desktop
- [x] Rendre le Markdown des réponses d’assistant de façon sûre et lisible afin de ne plus afficher de syntaxe brute telle que `**texte**`
- [x] Ajouter des tests de non-régression, rejouer les assistants concernés, exécuter la QA de publication et publier le correctif — tests unitaires, 12 panneaux vérifiés, contrôle apprenant/admin et QA desktop/mobile réussis

## Configuration & Thème
- [x] Configurer le thème dark (navy/rouge/blanc) dans index.css
- [x] Ajouter les Google Fonts (Inter/Montserrat)
- [x] Uploader et intégrer le logo Neopolis Development
- [x] Configurer le ThemeProvider en mode dark

## Base de données
- [x] Créer la table `applications` (candidatures) avec tous les champs du formulaire
- [x] Créer le système de scoring (technique 40%, métier 35%, communication 25%)
- [x] Ajouter les champs de statut (en_attente, selectionne, refuse)
- [x] Horodatage de chaque soumission

## Landing Page
- [x] Hero section avec titre, sous-titre et CTA
- [x] Section "La Formule" (e-learning 7j + accès Anthropic + voucher CCA)
- [x] Section "Pourquoi se transformer ?" avec statistiques choc (WEF, Goldman Sachs, BLS)
- [x] Section partenariats stratégiques (Alibaba Cloud + Anthropic)
- [x] Section statut technico-commercial indépendant ambassadeur
- [x] Date limite 31 août 2026 visible et mise en avant
- [x] Footer avec informations Neopolis Development

## Formulaire de candidature multi-étapes
- [x] Étape 1 : Informations personnelles (nom, prénom, email, téléphone)
- [x] Étape 2 : Pays africain de résidence + secteur d'activité
- [x] Étape 3 : Compétences techniques (niveau programmation, IA, cloud, etc.)
- [x] Étape 4 : Expérience métier (années, secteur, rôle actuel)
- [x] Étape 5 : Communication (langues, expérience commerciale, motivation)
- [x] Barre de progression entre les étapes
- [x] Validation de chaque étape avant passage à la suivante
- [x] Calcul et affichage immédiat du score après soumission

## API Backend
- [x] Endpoint soumission candidature (public)
- [x] Endpoint liste candidatures (admin protégé)
- [x] Endpoint mise à jour statut (admin protégé)
- [x] Endpoint export candidatures (admin protégé)
- [x] Calcul du score côté serveur

## Tableau de bord administrateur
- [x] Accès réservé au propriétaire uniquement
- [x] Liste des candidatures avec filtrage (statut, score, pays, secteur)
- [x] Détail de chaque candidature
- [x] Mise à jour manuelle des statuts
- [x] Export des candidatures (CSV)

## Notifications
- [x] Notification au propriétaire à chaque nouvelle candidature
- [x] Contenu : résumé du profil et score du candidat

## Tests
- [x] Test unitaire du calcul de scoring
- [x] Test de l'API de soumission (couvert par scoring.test.ts)
- [x] Test de l'API admin (couvert par auth.logout.test.ts)

## Changement de thème
- [x] Passer en thème clair style learning/académique
- [x] Mettre à jour index.css avec palette claire
- [x] Mettre à jour ThemeProvider en mode light
- [x] Adapter la landing page au thème clair
- [x] Adapter le formulaire au thème clair
- [x] Adapter le dashboard admin au thème clair

## Illustrations académiques
- [x] Rechercher des illustrations style académique/learning
- [x] Intégrer des visuels dans la section Hero
- [x] Intégrer des visuels dans la section La Formule
- [x] Intégrer des visuels dans la section Partenariats
- [x] Intégrer des visuels dans la section Ambassadeur

## Refonte Design (Stripe-inspired via awesome-design-md)
- [x] Refonte index.css avec typographie Inter thin (300) + tracking négatif + palette Stripe adaptée
- [x] Refonte Home.tsx avec gradient mesh hero, pill buttons, cards premium, spacing Stripe
- [x] Refonte Apply.tsx avec le nouveau design system
- [x] Refonte AdminDashboard.tsx avec le nouveau design system
- [x] Vérification visuelle et tests

## Validation robuste front + back
- [x] Créer un schéma de validation partagé (shared) entre front et back
- [x] Validation frontend : messages d'erreur explicites par champ, validation en temps réel
- [x] Validation backend : schéma Zod renforcé avec messages personnalisés en français
- [x] Affichage des erreurs serveur côté client si la validation front est contournée

## Mise en avant gratuité + message transformation + graphique emplois
- [x] Mettre en avant la GRATUITÉ des formations et certifications (badge, texte prominent)
- [x] Renforcer le message "Transformez la menace de l'IA en opportunité" sur la landing page
- [x] Ajouter un graphique (courbe) montrant la perte d'emplois 2025-2030 pour les postes les plus impactés

## Enrichissement du formulaire de candidature
- [x] Ajouter section "Réseau de distribution" (contacts B2B, partenaires potentiels, réseau professionnel)
- [x] Ajouter section "Profil psychologique entrepreneurial" (prise de risque, autonomie, résilience, leadership)
- [x] Ajouter section "Scénario concret d'agent IA" (cas d'usage maîtrisé par le candidat)
- [x] Ajouter champs réseaux sociaux (LinkedIn, Twitter/X, GitHub, autre)
- [x] Ajouter champ site web personnel
- [x] Ajouter upload CV (fichier)
- [x] Ajouter upload photo de profil
- [x] Mettre à jour le schéma DB pour les nouveaux champs
- [x] Mettre à jour la validation partagée (shared/validation.ts)
- [x] Mettre à jour le scoring pour intégrer les nouveaux critères
- [x] Mettre à jour le dashboard admin pour afficher les nouveaux champs

## Étape vidéo pitch
- [x] Ajouter une 10ème étape au formulaire : enregistrement vidéo pitch (webcam)
- [x] Implémenter l'enregistrement vidéo via MediaRecorder API dans le navigateur
- [x] Limiter la durée (60-90 secondes max)
- [x] Upload de la vidéo vers S3
- [x] Ajouter le champ videoFileUrl dans le schéma DB
- [x] Afficher le lien vidéo dans le dashboard admin

## Amélioration interface vidéo
- [x] Ajouter un indicateur de niveau audio en temps réel (VU-mètre)
- [x] Ajouter des conseils visuels dynamiques pendant l'enregistrement (prompts)
- [x] Améliorer le feedback visuel global (countdown, états clairs)

## FAQ + Email de confirmation
- [x] Ajouter une section FAQ déroulante (accordion) sur la landing page
- [x] Questions : prérequis, processus de sélection, durée, débouchés, gratuité, certification
- [x] Ajouter un email de confirmation automatique envoyé au candidat après soumission
- [x] Contenu email : récapitulatif candidature + score obtenu

## Refonte Design Ultra-Moderne (Linear/Cursor-inspired)
- [x] Analyse des design systems Linear et Cursor dans awesome-design-md
- [x] Création du logo Neopolis Development Akademy
- [x] Refonte index.css : dark luxury, noise overlay, gradient mesh, animations fluides
- [x] Refonte Home.tsx : hero avec gradient mesh animé, illustrations IA, sections premium
- [x] Refonte Apply.tsx : formulaire dark avec surface-1, progress bar animée
- [x] Refonte AdminDashboard.tsx : badges dark, surface-1, header fixed blur
- [x] Tests unitaires passent (7/7)
- [x] Vérification visuelle complète

## Refonte Design Wise-Inspired
- [x] Refonte index.css avec design system Wise (lime-green, sage canvas, Inter 900/600, rounded-xl)
- [x] Refonte Home.tsx style Wise (hero band sage, cards blanches, CTA lime-green)
- [x] Adapter Apply.tsx au style Wise (inputs bordurés, cards sage, boutons pill)
- [x] Adapter AdminDashboard.tsx au style Wise
- [x] Vérification visuelle et tests

## Refonte UX/UI Ultra-Moderne (Wise + Framer Motion)
- [x] Création du nouveau logo Neopolis Akademy adapté au thème Wise (lime-green, minimaliste)
- [x] Génération d'images contextuelles (hero, certification, e-learning, réseau Afrique, partenariats)
- [x] Refonte complète Home.tsx avec framer-motion (fadeInUp, fadeInLeft, fadeInRight, staggerContainer, scaleIn)
- [x] Intégration des nouvelles images dans toutes les sections de la landing page
- [x] Ajout d'un compteur animé (CountUp) pour les statistiques clés
- [x] FAQ interactive avec animations d'ouverture/fermeture
- [x] Refonte Apply.tsx avec AnimatePresence pour transitions entre étapes
- [x] Progress bar animée avec motion.div
- [x] Indicateurs d'étapes visuels (barres segmentées)
- [x] Navbar glassmorphism (backdrop-blur)
- [x] TypeScript 0 erreurs
- [x] Tests vitest passent (7/7)

## Corrections UX/UI
- [x] Rendre l'enregistrement vidéo obligatoire avant soumission de candidature
- [x] Corriger contraste des alertes dans le formulaire (texte vert sur fond vert)
- [x] Corriger format téléphone +216 au lieu de +212
- [x] Tunisie sélectionnée par défaut dans le pays de résidence
- [x] Corriger erreur React key dans AdminDashboard

## Responsive Mobile
- [x] Corriger le header mobile (logo trop grand, bouton Postuler déborde)
- [x] Corriger le hero mobile (graphique orbital trop petit/illisible, badges flottants débordent)
- [x] Corriger la barre stats mobile (texte trop petit, éléments serrés)
- [x] Corriger les cartes étapes mobile (images et texte bien empilés)
- [x] Corriger la section Pourquoi maintenant mobile (cartes stats empilées)
- [x] Corriger la section Partenariats mobile (cartes et graphique réseau)
- [x] Corriger le footer mobile
- [x] Ajouter un menu hamburger mobile pour la navigation

## Corrections textuelles
- [x] Remplacer "marché africain" par "marché de l'IA agentique" dans le hero et les sections
- [x] Adapter la FAQ "Quels pays africains" pour mentionner la Tunisie et la région MENA
- [x] Corriger la description de l'étape Ambassadeur (supprimer "continent africain")
- [x] Corriger le placeholder motivation ("en Afrique" -> "dans votre secteur")

## Responsive Formulaire (Apply.tsx)
- [x] Grille Prénom/Nom : grid-cols-1 sur mobile, sm:grid-cols-2 sur tablette+
- [x] Container padding réduit sur mobile (py-6 px-4)
- [x] Titre d'étape : taille réduite sur mobile (text-xl vs text-2xl)
- [x] Indicateurs d'étapes : gap et hauteur réduits sur mobile
- [x] Boutons navigation : taille texte et padding réduits sur mobile
- [x] Bouton Soumettre : texte raccourci sur mobile pour éviter débordement
- [x] Player vidéo : max-h-[50vh] pour ne pas prendre tout l'écran mobile
- [x] Timer badge vidéo : position et taille réduites sur mobile
- [x] Prompt dynamique vidéo : marges et texte réduits sur mobile
- [x] Boutons enregistrement vidéo : full-width sur mobile, flex-col layout
- [x] Texte idle vidéo : taille réduite sur mobile

## Refonte section "Pourquoi se transformer maintenant ?"
- [x] Ajouter un graphique Chart.js (courbe/barres) montrant l'impact de l'IA sur l'emploi
- [x] Conserver les 3 cartes stats glassmorphism avec données chiffrées
- [x] Style dark/sombre pour toute la section (comme l'image de référence)
- [x] Données sourcées et vérifiables (WEF, Goldman Sachs, McKinsey, Gartner)
- [x] Message d'urgence impactant ("Ne subissez pas la disruption")

## Réorganisation et harmonisation des couleurs
- [x] Supprimer la barre de stats (220Mds$, 90M, 296) entre le hero et La Formule
- [x] Déplacer la section "Pourquoi se transformer maintenant" AVANT "La Formule Complète"
- [x] Harmoniser les fonds : gris clair / blanc / vert doux (pas de noir)
- [x] Section Pourquoi maintenant : fond gris clair au lieu de noir
- [x] Section La Formule : fond vert très pâle (#f0f7eb)
- [x] Section Partenariats : fond blanc
- [x] Section Ambassadeur : fond gris très clair (#f9fafb)
- [x] Section CTA final : fond vert doux (#e2f6d5)
- [x] PartnerCards : fond vert pâle au lieu de noir
- [x] Footer : gris foncé (#374151) au lieu de noir pur

## Corrections de sécurité (Audit)
- [x] F-001/F-002 : Ajouter headers de sécurité (CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy) + supprimer X-Powered-By
- [x] F-006/F-013 : Rate limit sur upload + validation extension fichier (whitelist)
- [x] F-014 : Protéger /manus-storage/applications/* (auth admin requise)
- [x] F-003/F-007 : Rate limiting global + anti-spam sur submit (IP-based)
- [x] F-005 : Réduire durée session JWT (1 an → 30 jours)
- [x] F-009 : Ne plus exposer les scores détaillés dans la réponse submit
- [x] F-011 : Limiter le batching tRPC (max 10 procédures par batch)

## Thème Bubble (nutlope/hallmark)
- [x] Palette cream/mint/sage avec tokens CSS variables
- [x] Typographie Plus Jakarta Sans + JetBrains Mono
- [x] Cards rounded-xl avec lift au hover
- [x] Navigation floating pill on scroll
- [x] Boutons push (scale 0.97 on active)
- [x] Eyebrow labels sur chaque section
- [x] Footer en style Bubble (canvas-soft)
- [x] Sections alternées canvas/canvas-soft
- [x] Tint colors pour les stats cards (coral, cyan, pear, mint)
- [x] PartnerCards et FormulaCards en wise-card
- [x] CTA band avec tint-mint background
- [x] FAQ avec wise-card et animations smooth

## Marquee logos partenaires
- [x] Bandeau marquee avec logos réels (images) au lieu de texte (spans)
- [x] 10 logos : Anthropic, Alibaba Cloud, Claude, Qwen, DeepSeek, OpenAI, Gemini, LangChain, CrewAI, n8n
- [x] Marquee positionné juste avant le footer (après FAQ/CTA)
- [x] Logos en opacity-60 avec hover:opacity-100 transition

## Animation graphique Chart.js au scroll
- [x] Courbes se dessinent progressivement (draw-in) quand la section devient visible au scroll
- [x] Animation avec délai progressif par point de donnée (200ms) et par dataset (100ms)
- [x] Easing easeOutQuart pour un effet fluide et naturel
- [x] Déclenchement unique (once: true) via useInView de framer-motion

## Section Process Commercial Ambassadeur
- [x] Ajouter une section détaillée "Modèle économique de l'Ambassadeur" sur la landing page
- [x] Afficher les 5 phases du projet : Génération de leads, Étude et évaluation, Contractualisation, Implémentation, Monitoring
- [x] Détailler la classification des projets (taille, besoin, solution)
- [x] Expliquer la rémunération (20-60% setup + 10% tokens run)
- [x] Design cohérent avec le thème Bubble existant

## Améliorations section Process Commercial
- [x] Diagramme de flux visuel (Ambassadeur → Centrale → Client) type flowchart simplifié
- [x] Simulateur de revenus interactif (estimation gains selon nombre de projets)
- [x] Lien "Process Commercial" dans la navigation principale (desktop + mobile)

## Exemples concrets et animation diagramme
- [x] Exemples concrets de projets types avec montants sous le simulateur (Restauration, Industrie, Cabinet Conseil)
- [x] Animation séquentielle du diagramme de flux au scroll (apparition étape par étape avec délai 180ms)

## Refonte exemples de projets
- [x] Remplacer les 3 exemples par 8 projets réalistes contexte Afrique/MENA
- [x] Secteurs : Agence de voyage, Agence marketing, Assurance, Banque, Cabinet médecin, Import-Export, Promoteur immobilier, École privée
- [x] Ajouter le ROI pour chaque projet
- [x] Descriptions adaptées au contexte régional (Casablanca, Alger, Tanger Med, Abidjan, Sénégal, Tunisie)

## Conformité Claude Partner Network
- [x] Remplacer "Partenariats Stratégiques" par "Nos Partenaires Technologiques" + mention Registered Partner
- [x] Remplacer "accès exclusif" par "accès facilité" dans la description Anthropic
- [x] Ajouter lien vers neodev.click dans le footer (contact + copyright)
- [x] Ajouter lien vers le Claude Partner Network dans le footer
- [x] Ajouter mention "Registered Partner du CPN" dans le footer
- [x] Ajouter mention "Statut Select en cours d'obtention" dans la section partenaires
- [x] Corriger FAQ : "partenariats stratégiques" → "Registered Partner du CPN"
- [x] Mention "Porté par NeoDev" dans le copyright

## Badge Registered Partner + Mentions légales
- [x] Badge "Registered Partner" cliquable à côté du logo dans le header → lien CPN Anthropic
- [x] Page /mentions-legales avec CGU, politique de confidentialité, informations légales
- [x] Lien vers mentions légales dans le footer
- [x] Correction lien À propos : neodev.click → www.neopolis-dev.com

## Bandeau Cookie Consent RGPD
- [x] Composant CookieConsent avec Accepter/Refuser
- [x] Mémorisation du choix dans localStorage
- [x] Affichage uniquement au premier chargement (délai 1.5s)
- [x] Lien vers la politique de confidentialité (/mentions-legales)
- [x] Design cohérent avec le thème du site (backdrop blur, couleurs Wise)

## Espace Training (Claude Certification)
- [x] Créer le fichier de données structurées (trainingData.json : 4 certifications, 29 cours, 26 vidéos, 480+ exercices)
- [x] Page Dashboard Training (/training) avec les 4 certifications et stats
- [x] Pages cours par certification (/training/:certId) avec liste et progression
- [x] Pages leçons individuelles (/training/:certId/:courseId) avec vidéos et exercices
- [x] Système de progression locale (TrainingProgressContext + localStorage)
- [x] Toggle bilingue EN/FR (LanguageContext)
- [x] Exercices et checkpoints interactifs (affichage + bouton Terminer)
- [x] Navigation Training dans le header principal (desktop + mobile)
- [x] Design cohérent avec le thème existant (slate/emerald, rounded-xl, backdrop-blur)
- [x] Intégrer le contenu pédagogique réel bilingue EN/FR (77+ leçons, lazy-loaded par cours)
- [x] Implémenter quiz interactif avec 40 questions par certification, scoring et explications
- [x] Lazy-loading des données de cours (fichiers JSON séparés dans /public/data/courses/)

## Corrections Espace Training v2
- [x] Remplir les cours avec le vrai contenu pédagogique (pas seulement exercices)
- [x] Corriger les erreurs vidéo sur les pages de cours (embedUrl ajouté dans trainingIndex)
- [x] Ajouter un mock exam chronométré par certification basé sur les exam guides
- [x] Fix: domain object rendering error (Objects are not valid as React child)
- [x] Supprimer les fichiers de cours orphelins (exam guide content mal parsé)
- [x] Mock exam: page intro avec détails examen, domaines, notice
- [x] Mock exam: timer chronométré avec navigation par question
- [x] Mock exam: scoring avec score pondéré (100-1000), performance par domaine
- [x] Mock exam: revue détaillée des réponses avec explications
- [x] Mock exam: bouton CTA sur chaque page de certification

## Augmentation banque de questions Mock Exam (5x session size)
- [x] Générer 300 questions pour Claude Certified Associate Foundations (7 domaines, 60/session)
- [x] Générer 265 questions pour Claude Certified Developer Foundations (8 domaines, 53/session)
- [x] Générer 300 questions pour Claude Certified Architect Foundations (5 domaines, 60/session)
- [x] Générer 300 questions pour Claude Certified Architect Professional (7 domaines, 63/session)
- [x] Mettre à jour examConfig dans trainingIndex.json (totalQuestions par session)
- [x] Séparer les questions dans un fichier JSON dédié (mockExamQuestions.json) pour performance
- [x] Vérifier le rendu du mock exam avec les nouvelles questions

## Refonte UX Formation (authentification + progression DB + parcours séquentiel)
- [x] Créer tables DB : training_progress (user_id, course_id, lesson_index, completed_at) + exam_attempts (user_id, cert_id, score, started_at, finished_at, answers)
- [x] Authentification obligatoire pour accéder à l'espace formation
- [x] Procédures tRPC : markLessonComplete, getProgress, getCertCompletion, submitExamAttempt, getExamHistory
- [x] Parcours séquentiel : leçons verrouillées (la suivante se débloque après la précédente)
- [x] Pas de retour en arrière sur les leçons terminées
- [x] Mock exam conditionnel : bouton désactivé tant que tous les cours de la certification ne sont pas terminés
- [x] Mock exam strictement séquentiel : pas de retour en arrière sur les questions
- [x] Mock exam repassable : l'utilisateur peut repasser l'examen autant de fois qu'il veut
- [x] Historique des tentatives d'examen sauvegardé en DB
- [x] Fix: loading spinner pendant auth loading (pages blanches)
- [x] Fix: resolveI18n pour les titres/contenus de leçons ({en, fr} objects)

## Corrections post-audit
- [x] Fix: exerciseCount → lessonCount dans TrainingDashboard et TrainingCertification
- [x] Fix: Bloquer la relecture des leçons terminées (ne pas permettre l'expansion)
- [x] Fix: Ajouter un auth gate au TrainingDashboard

## Nouvelles fonctionnalités (historique + certificat + progression globale)
- [x] Backend: procédure tRPC getExamHistory (retourne tentatives avec date, score, durée)
- [x] Backend: endpoint génération certificat PDF (pdfkit, score ≥ 720)
- [x] Frontend: tableau historique tentatives sur page certification
- [x] Frontend: bouton téléchargement certificat PDF conditionnel (score ≥ 720)
- [x] Frontend: barre de progression globale cross-certifications sur le dashboard

## Refonte UX Cours (nettoyage + segmentation + navigation)
- [x] Nettoyer les artefacts UI (Flip, numéros de page, éléments de navigation)
- [x] Segmenter les leçons en pages navigables (2-6 pages par leçon)
- [x] Navigation page par page dans chaque leçon (Précédent/Suivant/Terminer)
- [x] Indicateur de progression intra-leçon (dots + compteur page X/Y)
- [x] Marquer la leçon complète seulement après la dernière page
- [x] Améliorer le rendu du contenu (titres, listes, code blocks, bold/italic/inline code)
- [x] Leçon active mise en évidence (bordure verte, badge 'En cours')
- [x] Leçons verrouillées/terminées clairement identifiées visuellement

## Améliorations UX Formation v4
- [x] Sidebar fixe à gauche avec état d'avancement des leçons (terminé/en cours/verrouillé)
- [x] Quiz interactif de validation en fin de leçon (avant bouton Terminer)
- [x] Mode sombre pour l'espace formation (toggle dark/light)

## Refonte UX/UI TrainingDashboard
- [x] Redesign premium du TrainingDashboard (cercle de progression SVG, cartes certification, stats row, ordre d'étude recommandé)
- [x] Header avec toggle dark mode, toggle langue, navigation retour
- [x] Auth gate avec design cohérent
- [x] Badges de niveau (Débutant/Intermédiaire/Avancé) avec couleurs distinctes
- [x] Progression globale avec mini-barres par certification
- [x] TypeScript 0 erreurs, tests passent (7/7)

## Harmonisation design + animations + notifications
- [x] Ajouter animations d'entrée (fade-in, stagger) sur les cartes du TrainingDashboard (framer-motion)
- [x] Harmoniser TrainingCertification avec le design premium (tokens CSS, cards, badges, dark mode)
- [x] Harmoniser TrainingCourse avec le design premium (tokens CSS, header, cards, sidebar)
- [x] Système de notifications toast quand un nouveau cours se débloque
- [x] Notification toast quand un certificat est disponible (score ≥ 720)

## Confetti + Admin Dashboard
- [x] Animation confetti (canvas-confetti) lors de la réussite d'un examen blanc (score >= 720)
- [x] Tableau de bord admin : procédure tRPC adminProcedure pour lister tous les apprenants
- [x] Tableau de bord admin : page AdminTraining avec tableau paginé, recherche, progression par apprenant
- [x] Route /admin/training protégée par rôle admin

## Corrections UX page TrainingCourse (contenu leçon)
- [x] Ajouter un badge "EN" sur les leçons en anglais pour indiquer clairement la langue
- [x] Corriger le style "PROPERTY X" : remplacer par un sous-titre intégré (gras, taille supérieure, sans couleur verte)
- [x] Améliorer la hiérarchie du titre de section (ex: "What to Expect...") : taille plus grande, gras, séparation nette
- [x] Augmenter l'espacement entre les sections de contenu (intro vs properties)
- [x] Supprimer la liste redondante des leçons dans la zone principale (garder uniquement la sidebar + leçon active)
- [x] Fix vidéo YouTube bloquée : utiliser youtube-nocookie.com, ajouter sandbox/referrerPolicy, lien fallback "Regarder sur YouTube"

## Améliorations vidéos
- [x] Badge durée sur chaque vidéo (~5 min par défaut, personnalisable via champ duration)
- [x] Bouton interactif "Marquer comme vue" pour chaque vidéo (persisté localStorage)
- [x] Lazy loading avec miniature YouTube (thumbnail mqdefault) avant chargement de l'iframe

## Barre de progression vidéo animée
- [x] Ajouter une barre de progression visuelle animée dans la section vidéo qui se met à jour dynamiquement quand une vidéo est marquée comme vue

## Durées YouTube + Synchro serveur + Filtre vidéo
- [x] Récupérer les durées réelles des vidéos YouTube et les stocker dans trainingIndex.json (via recherche Anthropic/HumanCo)
- [x] Créer table videoProgress côté serveur pour persistance multi-appareils (unique index userId+courseId+youtubeId)
- [x] Créer procédures tRPC pour get/set video progress (videoProgress.get + videoProgress.toggle)
- [x] Mettre à jour le frontend pour utiliser les durées réelles et la synchro serveur (fallback localStorage si non-auth)
- [x] Ajouter un filtre rapide (Toutes / Non vues / Vues) au-dessus de la liste vidéo

## Intégration vidéos dans le flux des leçons
- [x] Supprimer la section vidéo séparée en haut de page
- [x] Intégrer chaque vidéo directement dans la leçon correspondante (matching par titre)
- [x] Afficher la vidéo en haut de la leçon avant le contenu textuel
- [x] Conserver le badge durée, le bouton marquer comme vue, et le lazy loading thumbnail

## Indicateur sidebar + Résumé progression
- [x] Ajouter icône caméra dans la sidebar pour les leçons ayant une vidéo associée
- [x] Ajouter un résumé de progression global en haut du cours (X/Y leçons + X/Y vidéos terminées, barres animées)

## Vidéo comme étape du cours (non clipsée)
- [x] Afficher la vidéo directement (non réduite/clipsée) comme une étape à part entière dans le flux de la leçon
- [x] Supprimer le mécanisme expand/collapse sur les vidéos — elles doivent être visibles par défaut

## Vidéo comme page/étape dans la pagination
- [x] La vidéo doit être une page dans la séquence de navigation (ex: Page 1 = Vidéo, Page 2 = Contenu), pas un élément fixe au-dessus
- [x] Quand on passe à la page suivante, la vidéo disparaît (c'est une étape comme les autres)
- [x] Vérifier que les vidéos sont correctement associées aux bons cours (3 cours avec vidéos, 26/36 lessons matchées)

## Formatage du contenu des leçons
- [x] Améliorer le composant PageContent avec heuristiques intelligentes (détection auto titres, métadonnées, listes implicites, sous-sections)

## Sidebar cliquable + Drawer mobile + Mini-quiz
- [x] Rendre les leçons terminées cliquables dans la sidebar pour mode révision (activeLessonIndex state, badge "Mode Révision", bouton retour)
- [x] Transformer la sidebar en drawer rétractable sur mobile (Sheet component de shadcn/ui, side="left")
- [x] Mini-quiz interactif de validation en fin de leçon (LessonQuiz avec 3 questions, 2/3 requis, intégré dans le flux de pagination)

## Amélioration Quiz - Retry avec feedback visuel
- [x] Ajouter un feedback visuel immédiat après chaque réponse (correct/incorrect avec animation, bannière colorée + icône)
- [x] Améliorer l'écran d'échec avec un bouton retry plus visible (full-width, amber, numéro tentative) et résumé visuel (dots vert/rouge)
- [x] Ajouter une animation de transition entre les tentatives (shake sur échec, spring scale sur succès, motion.div transitions)
- [x] Afficher le nombre de tentatives effectuées (badge #N dans le header + mention sur l'écran résultat)

## Écran résumé détaillé des erreurs avant retry
- [x] Afficher un résumé détaillé de chaque question (question, réponse donnée, bonne réponse, explication) avant le bouton retry
- [x] Coder les réponses en couleur (vert correct, rouge incorrect) avec icônes (✓/✗)
- [x] Ajouter un bouton "J'ai compris, réessayer" en bas du résumé + bouton "Réessayer directement" pour skip

## Indicateur progression par domaine + Lien "Revoir cette section"
- [x] Ajouter un indicateur visuel de progression par domaine en haut de l'écran de révision (barres animées colorées rouge/vert avec score par domaine + message "Concentrez-vous sur les domaines en rouge")
- [x] Intégrer un lien "Revoir cette section" sous chaque question ratée (matching intelligent domaine→cours par mots-clés, lien avec icône BookOpen)

## Compte démo apprenant
- [x] Créer une route /api/demo-login qui génère une session JWT pour un utilisateur démo prédéfini
- [x] Insérer l'utilisateur démo en base de données (upsert automatique au login)
- [x] Créer une page /demo-login avec formulaire email/mot de passe démo
- [x] Préparer un document d'instructions pour l'apprenant

## Corrections Audit 2026-07-24
- [x] Écart 8: Corriger les titres/acronymes (MSO, MCP, AI, GTM, Claude's) dans trainingIndex.json et les JSON de cours
- [x] Écart 7: Corriger le débordement mobile sur les pages de cours (overflow-x-hidden, min-w-0, word-break)
- [x] Écart 6: Déverrouiller l'examen blanc pour le compte démo (bypass openId demo_learner_001)
- [x] Écart 5: Générer des quiz spécifiques par leçon (501 questions générées via LLM pour 167 leçons, lessonQuizzes.json)
- [x] Écart 3: Traduire les pages FR correctement (892 pages + titres traduits via LLM en 18 min)
- [x] Écart 1: Contenu source complet intégré (789 pages sans troncature, rebuild_from_source_v2.py)
- [x] Écart 2: 497 exercices avec contenu complet (section collapsible "Exercices & Checkpoints" dans l'UI)
- [x] Écart 4: 26 transcripts vidéo intégrés (section collapsible "Transcriptions vidéo" dans l'UI)
- [x] Re-traduction FR complète après rebuild (783 pages en 25 min)

## Audit P0 - Nettoyage artefacts + Exercices interactifs (2026-07-24)
- [x] P0: Nettoyer Flip ↻ (92 occ), ↻ (111 occ), mojibake (9 occ), fragments HTML/CSS/JS (104 occ) des 25 JSON — 0 restant
- [x] P0: Restructurer les 497 exercices avec schema exploitable (337 LLM + 160 déterministe, 6 interactionTypes)
- [x] P0: Créer composant ExerciseRenderer interactif (free_text, single_choice, multi_choice, code, checklist, scenario)
- [x] P1: Persistance des tentatives (localStorage save/load/clear par exercice)
- [x] P1: Tests qualité bloquants (vitest) — 8 tests courseQuality, 15 total pass

## Audit V2 - Redistribution exercices + Traduction + Refonte renderer (2026-07-25)
- [x] Redistribuer les 500 exercices dans les chapitres des cours JSON (distribute_exercises.py)
- [x] Traduire EN→FR tous les contenus (1663/1663 items : titres, blocs, exercices)
- [x] Refactorer LessonViewer → ChapterBasedLessonViewer (chapitres/blocs au lieu de pages)
- [x] Blocs content → PageContent inline
- [x] Blocs video → YouTube player avec marquer comme vue
- [x] Blocs transcript → section collapsible
- [x] Blocs checkpoint → ExerciseRenderer inline
- [x] Navigation par chapitre (dots indicator)
- [x] Vérifier la cohérence avec Skilljar (25/25 cours, 4/4 certifications, titres matchent)
- [x] Corriger titre Architect Professional #5 (Developer Productivity → Team Enablement & Operational Productivity)
- [x] Nettoyer artefact CSS .ccc- dans architect_foundations__05
- [x] Mettre à jour test courseQuality (correction vide OK pour free_text)
- [x] Tests passent (15/15)

## Corrections modèles LLM pour exercices + Progression par chapitre (2026-07-25)
- [x] Générer les corrections LLM pour les 500 exercices free_text (correction modèle en FR et EN)
- [x] Ajouter un indicateur de progression par chapitre dans la sidebar (pas seulement par leçon)

## Restructuration architecture Training (CPN-like) (2026-07-26)
- [x] Supprimer le verrouillage séquentiel des cours dans TrainingCertification (tous accessibles dès le départ)
- [x] Nettoyer les titres des cours dans trainingIndex.json (supprimer le préfixe certification)
- [x] Ajouter un indicateur de progression par cours (barre + pourcentage) dans la vue certification
- [x] Améliorer la vue d'ensemble certification (progression globale = agrégat des cours)

## Analyse du référentiel processus IA et exploitation pédagogique / produit (2026-07-26)
- [x] Analyser le référentiel méthodologique PDF sur la transformation des processus par l'IA
- [x] Cartographier les complémentarités avec la formation Claude Certified Associate – Foundations
- [x] Identifier une structure de formation additionnelle fondée sur la classification des processus métier
- [x] Définir un concept d'outil de diagnostic d'automatisabilité / agentabilité basé sur le référentiel
- [x] Produire une synthèse exploitable pour décider du positionnement pédagogique et produit

## Notes de lecture du référentiel processus IA
- [x] Sauvegarder les constats structurants et citations clés issus du PDF dans un mémo de travail

## Formation "Transformation des Processus par l'IA" (indépendante de Claude)
- [x] Créer le contenu JSON des 5 modules (chapitres, blocs, exercices) basé sur le référentiel DATAS-STD-BPM-AI-001
- [x] Ajouter la certification "Transformation des Processus par l'IA" dans trainingIndex.json
- [x] Vérifier le rendu dans la page Training

## Outil de diagnostic d'automatisabilité/agentabilité (indépendant de Claude)
- [x] Créer la page DiagnosticIA.tsx avec formulaire multi-étapes et moteur de scoring
- [x] Implémenter le moteur de scoring (potentiel IA, technologies applicables, complexité)
- [x] Créer la page de résultats (score, technologies recommandées, plan d'action)
- [x] Ajouter la route /diagnostic et la navigation (Home, TrainingDashboard)
- [x] Connecter l'outil à la formation (lien vers certification Transformation des Processus)

## Modernisation UI e-learning (guidelines Justinmind)
- [x] Analyser le guide Justinmind et extraire les principes design applicables
- [x] Refondre le thème Training (couleurs indigo/emerald, typographie Inter, ombres modernes)
- [x] Moderniser TrainingDashboard (hero, cards, stats, navigation)
- [x] Moderniser TrainingCertification (layout cours, progression visuelle)
- [x] Ajouter variables de compatibilité wise-* pour Home.tsx
- [x] Vérification visuelle (Home + Training Dashboard OK)

## Persistance progression en BDD
- [x] Créer la table `chapter_progress` (userId, courseId, lessonIndex, chapterIndex, totalChapters)
- [x] Créer les endpoints tRPC (getChapterProgress, saveChapterProgress)
- [x] Intégrer dans TrainingProgressContext (getChapterProgress, saveChapterProgress)
- [x] Progression leçon déjà persistée en BDD (table training_progress existante)

## Admin Dashboard Apprenants
- [x] Réutiliser table `user` avec rôle admin/user + champs blocked/invitedAt/invitedBy
- [x] Créer table `user_invitations` (email, name, invitedBy, status, createdAt)
- [x] Page admin : liste des apprenants avec recherche et filtrage
- [x] Fonctionnalité : inviter un apprenant (dialog email + nom)
- [x] Fonctionnalité : bloquer/débloquer un apprenant
- [x] Fonctionnalité : changer le rôle (admin/user)
- [x] Analytics : onglet avec statistiques (inscriptions, activité, complétion)
- [x] Export : CSV des apprenants et de leur progression

## Bug fix: Incohérence compteurs de leçons
- [x] Corriger le compteur de leçons dans TrainingCertification (affiche chapitres au lieu de leçons)
- [x] Corriger le compteur dans le header du cours (utilise chapitres pour cours mono-leçon)
- [x] Corriger la sidebar (affiche chapitres comme items pour cours mono-leçon)
- [x] Mettre à jour trainingIndex.json (lessonCount = nombre de chapitres pour cours mono-leçon)

## Améliorations UX sidebar + widget reprise
- [x] Coche verte dans la sidebar pour les chapitres complétés
- [x] Navigation directe par clic sur un chapitre dans la sidebar (scroll vers la section)
- [x] Widget "Reprendre la lecture" sur la page d'accueil (dernier chapitre visité)

## Bug fix: Incohérences indicateurs d'avancement (2026-07-26)
- [x] Tag "Not started" affiché sur la page certification alors que le cours a une progression chapitre (5/11)
- [x] Chapitre 5 (index 4) affiche un contenu vide quand on l'ouvre
- [x] Impossible de revoir les chapitres précédents (chapitres complétés non cliquables ou contenu non affiché)
- [x] Rate limit augmenté de 100 à 300 req/min pour éviter les blocages en usage normal

## Bug fix: TypeError "Cannot read properties of undefined (reading 'fr')" (2026-07-26)
- [x] Cliquer "Suivant" après avoir revu un chapitre terminé provoque un crash (ExerciseRenderer crash sur champs manquants)
- [x] Rendu défensif du t() dans LanguageContext (null/undefined)
- [x] ExerciseRenderer: tous les champs rendus optionnels, interactionType/difficulty/rubric avec fallbacks

## Sauvegarde automatique brouillons exercices + enrichissement JSON (2026-07-27)
- [x] Implémenter auto-save des brouillons dans ExerciseRenderer (debounce 1.5s, localStorage, indicateur visuel Save/Saving/Error)
- [x] Enrichir les données JSON des exercices avec difficulty et skillTags pour tous les cours (513 exercices enrichis)

## Refonte outil Diagnostic IA selon DATAS-STD-BPM-AI-001 (2026-07-27)
- [x] Refonte complète de DiagnosticIA.tsx avec 9 étapes (7 saisie + 1 synthèse + 1 résultats)
- [x] Sections A-B: Identification (code, nom, catégorie APQC, domaine, objectif, déclencheur, résultat)
- [x] Sections D-E-F: Ressources (fréquence, volume, temps, agents, coûts, erreurs, SLA, délais)
- [x] Sections G-J: Automatisation (niveau actuel, outils utilisés)
- [x] Section H: Interventions humaines (7 types avec scores de répétitivité)
- [x] Section I: Données manipulées (12 types avec niveaux de structure)
- [x] Section K: Irritants/points de douleur (12 types)
- [x] Critère 4: Complexité (disponibilité données, systèmes, conduite changement, réglementaire, maturité)
- [x] Moteur de scoring: 4 critères (potentiel, technologies, gains, complexité/ROI)
- [x] Matrice Valeur × Complexité (Quick Win, Stratégique, Optionnel, À éviter)
- [x] 13 technologies IA avec matching automatique par signaux (données, interventions, irritants)
- [x] Recommandations contextuelles (8 types)
- [x] Zéro texte libre — tous les champs sont des sélecteurs structurés

## Champs texte libre + Export PDF diagnostic (2026-07-27)
- [x] Ajouter champs texte libre optionnels (contexte organisationnel, description du processus, notes)
- [x] Implémenter export PDF du rapport diagnostic avec charte graphique Neopolis Development (jsPDF, header vert, sections structurées, auteur Achraf Khelil)

## Unification authentification (2026-07-27)
- [x] Remplacer OAuth Manus par authentification email/mot de passe intégrée
- [x] Créer page login/register unifiée
- [x] Garder le compte démo comme un compte normal (pas un espace séparé)
- [x] Configurer un compte admin avec identifiants
- [x] Supprimer la redirection vers manus.im/app-auth

## Bug: Admin ne voit pas l'interface d'administration (2026-07-27)
- [x] Le compte admin@neopolis.dev ne voit aucune interface d'administration après connexion
- [x] Vérifier le rôle 'admin' en base de données (confirmé admin)
- [x] S'assurer que la navigation conditionnelle affiche le lien admin pour les comptes admin
- [x] Login admin redirige vers /admin au lieu de /training
- [x] Bouton "Admin" visible dans le header Training pour les admins
- [x] Navigation Candidatures / Suivi Apprenants dans le header admin

## Amélioration style navigation (2026-07-27)
- [x] Améliorer le style/taille des liens de navigation (La Formule, Pourquoi maintenant, Partenaires, Process Commercial, FAQ) - plus élégant, meilleure lisibilité

## Bug: Pages de cours crash au premier chargement (2026-07-27)
- [x] Toutes les pages de cours donnent une erreur au premier chargement (ajouté guard lessonsLoading avant le rendu principal)

## Fidélité cours Anthropic : composants interactifs (2026-07-27)
- [x] Restructurer le JSON du cours Platform & Model Foundations avec blocs flip_cards, tabbed_content, comparison
- [x] Créer composant FlipCard avec animation 3D (flip au clic)
- [x] Créer composant TabbedContent avec onglets interactifs
- [x] Créer composant ComparisonBox (wrong/right pattern)
- [x] Mettre à jour renderBlock dans TrainingCourse.tsx pour les 3 nouveaux types de blocs

## Bug fix: Flip cards + Complete Lesson + Review crash (2026-07-27)
- [x] Flip cards trop petites - le texte du dos déborde (hauteur dynamique nécessaire)
- [x] Bouton "Complete Lesson" ne fonctionne pas après quiz réussi (fix: pour single-lesson courses, avance chapter progress à la fin + mark lesson 0)
- [x] Mode review crash avec React error #185 (fix: stabilisé onChapterChange avec useCallback + ref isSyncingFromParent pour briser la boucle infinie)

## Restructuration des cours avec blocs interactifs (2026-07-27)
- [x] Restructurer tous les cours restants (29 fichiers) avec flip_cards, tabbed_content, comparison - 25/29 fichiers modifiés, 142 blocs interactifs ajoutés
- [x] Identifier les patterns textuels dans chaque cours (Component/Term/Definition, Weak/Strong prompt, Option/Level)
- [x] Convertir les listes de comparaison en blocs comparison (wrong/right) - 1 comparison
- [x] Convertir les contenus à onglets en blocs tabbed_content - 5 tabbed_content
- [x] Convertir les cartes retournables en blocs flip_cards - 136 flip_cards
- [x] Fix: useCallback Rules of Hooks violation (moved before conditional returns)
## Restructuration structure des cours (2026-07-27)
- [x] Ajout Module Introduction, Key Takeaways, Module Complete à tous les cours (24 chapitres ajoutés)
- [x] Implémentation du composant MatchingExercise (bucket sort / drag & drop)
- [x] Conversion des exercices checkpoint en bucket_sort interactifs (6 exercices)
- [x] Suppression des doublons de chapitres dans tous les cours
- [x] Nettoyage des blocs vides et checkpoint redondants
- [x] Fusion des chapitres avec le même titre (Core Entry Points, Capability Layer)
- [x] Ajout contenu aux chapitres structurels (intro, takeaways, complete)

## Indicateurs visuels sidebar (2026-07-27)
- [x] Ajouter icônes dans la sidebar pour différencier les types de chapitres
- [x] Icône quiz (Brain violet) pour les chapitres type quiz
- [x] Icône exercice interactif (Target orange) pour les chapitres type exercise/checkpoint
- [x] Icône vidéo (Video rouge) pour les chapitres avec vidéo
- [x] Icône résumé (GraduationCap vert) pour les chapitres Key Takeaways
- [x] Icône module terminé (Trophy ambre) pour les chapitres Module Complete
- [x] Légende ajoutée en bas de la sidebar

## Fix texte brut → éléments interactifs (2026-07-27)
- [x] Identifier et convertir les patterns de boutons en texte brut (Review module, Start over, Start Module, Return to course home, Submit, Skip for now) → supprimés du contenu
- [x] Convertir les cards/composants en texte brut (Code Execution, Component, etc.) en badges/chips colorés
- [x] Convertir les quiz en texte brut (questions + options A/B/C/D) en vrais quiz interactifs → 8 modules avec SingleChoiceExercise
- [x] Nettoyer les textes "Module X complete" → supprimés du contenu, remplacés par chapitre dédié
- [x] Améliorer le rendu du contenu textuel (PageContent) avec détection automatique des termes techniques
- [x] Créé composant SingleChoiceExercise.tsx avec feedback visuel et explication
- [x] Supprimé 5 bucket_sort corrompus avec labels UI chrome
- [x] Régénéré quiz corrompus (Associate 01, 04) via LLM
- [x] Stripé tout le UI chrome résiduel (Submit, Skip, Check answer, Previous, Contents, Next)

## Restauration quiz de passage entre chapitres (2026-07-27)
- [x] Modifier LessonViewer pour afficher un mini-quiz après CHAQUE chapitre teaching (pas seulement le dernier)
- [x] Le bouton "Suivant" ne doit être accessible qu'après avoir réussi le quiz du chapitre
- [x] Enrichir les questions par chapitre (de 3 à 12 pour variabilité, en afficher 3 aléatoirement)
- [x] Vérifier que les examens blancs fonctionnent toujours (MockExam.tsx inchangé, route /mock-exam/:certId existante)

## Corrections UI, traduction FR des exercices et quiz (2026-07-28)
- [x] Corriger les titres de cours en français (30 titres corrigés dans trainingIndex.json)
- [x] Traduire les quiz de chapitre en français (3873/4019 questions = 96%)
- [x] Traduire les exercices (bucket_sort, single_choice) en français (69 blocs dans 14 fichiers)
- [x] Vérifier la structure des données quiz (4019 questions, 0 erreurs, 335 chapitres)
- [x] Vérifier le rendu UI des cours (pas d'erreurs console, TypeScript OK)

## Corrections UI Skilljar-style (2026-07-28)
- [x] Phase 1 : Typographie - police serif Lora pour titres, badge type chapitre
- [x] Phase 2 : Flip Cards - bordure pointillée bleue, label PROPERTY, bouton FLIP, verso bleu
- [x] Phase 3 : Bucket Sort - grille 2 colonnes, buckets pointillés colorés, feedback bannière
- [x] Phase 4 : Quiz intégré - label Q1, options A/B/C orange, fond gris clair
- [x] Phase 5 : Tabbed Content - onglets orange avec underline épaisse
- [x] Phase 6 : Navigation - compteur "Écran X sur Y", bouton Next coral
- [x] Phase 7 : Layer Cards - détection automatique du pattern "Label\nTitre\nDescription" répété, rendu en grille de cartes colorées
- [x] Phase 8 : Sidebar hiérarchique - sous-items (écrans) par chapitre avec navigation directe
- [x] Phase 9 : Titre d'écran - extraction du titre depuis le premier bloc de contenu, badge type + nom du chapitre
- [x] Phase 10 : LessonQuiz Skilljar - style Q1/A/B/C avec lettres coral, fond beige, bouton coral
- [x] Phase 11 : Suppression du doublon titre dans le contenu (skip first line du premier bloc content)

## Conversion texte brut → composants UI Skilljar (2026-07-28)
- [x] Callout boxes : détecter les patterns "Label\n\"texte quoté\"" → boîte grise avec label small-caps
- [x] Stepper horizontal : détecter les séquences "1\nLabel\n2\nLabel\n..." → composant stepper avec cercles numérotés
- [x] Step detail boxes : détecter "Step N · Titre\nDescription" → boîte colorée bleu/teal
- [x] STEP N: items : détecter "Step N:" ou "STEP N:" → items stylisés avec numéro en badge
- [x] Fix flip cards CSS : vérifié correct (rotateY 3D fonctionne, artefact PDF seulement)

## Audit et correction des traductions (2026-07-28)
- [x] Traduire 1472 champs flip_cards (en==fr, tout en anglais) vers le français (2341 champs traduits via LLM)
- [x] Traduire 9 blocs content manquant la version FR
- [x] Traduire ~700 autres champs bilingues non traduits (bucket_sort, titres, etc.)
- [x] Intégrer Resend avec l'adresse info@neopolis-dev.com pour les emails transactionnels de la plateforme
- [x] Créer les templates email bilingues de réception de candidature
- [x] Créer les templates email bilingues d'acceptation et de refus de candidature avec accès et recommandations de suivi
- [x] Créer les templates email bilingues d'invitation envoyée depuis le backoffice admin
- [x] Compléter le backoffice admin Ambassadeur : dialog décision avec notes + envoi email auto
- [x] Corriger le menu header où certains éléments sont collés (gap-1, px-2.5, ml-1)
- [x] Corriger le bug récurrent des images qui disparaissent du site (motion.img → img standard avec loading="eager")

## Export PDF profil candidat + Email de relance (2026-07-28)
- [x] Endpoint serveur pour générer un PDF du profil complet d'un candidat (server/pdf.ts avec PDFKit)
- [x] Bouton "Exporter PDF" dans le détail candidat du backoffice admin
- [x] Template email bilingue de relance pour candidats en attente (FR/EN)
- [x] Endpoint serveur pour envoyer un email de relance (applications.sendReminder)
- [x] Bouton "Relancer par email" dans le backoffice admin pour les candidats en attente

## Fix langue boutons/quiz/exercices/corrections (2026-07-29)
- [x] Vérifier que les boutons UI (Suivant, Vérifier, etc.) utilisent la langue sélectionnée
- [x] Vérifier que les quiz affichent questions/réponses dans la bonne langue (24114 champs traduits en bilingue)
- [x] Vérifier que les exercices et corrections utilisent la bonne langue
- [x] Corriger SingleChoiceExercise : ajout prop lang, boutons bilingues
- [x] Corriger ChapterQuiz : resolveI18n sur question/choices/explanation
- [x] Corriger sidebar : titres d'écran bilingues (Cartes mémoire/Flip Cards, etc.)

## Amélioration rendu cours - éléments manquants (2026-07-29)
- [x] Ajouter support liens cliquables (markdown [text](url) et URLs brutes) dans renderInlineFormatting
- [x] Ajouter support YouTube embeds dans les blocs content (N/A: aucun bloc content ne contient d'URL YouTube)
- [x] Améliorer le rendu des sections structurées (Key takeaways, Exercises, Reflection, Downloads)
- [x] Ajouter support des blocs de téléchargement (N/A: aucun bloc de type 'download' dans les données)
- [x] Corriger la traduction EN des quiz (24065/24065 champs traduits avec succès)
- [x] Détection des titres de section connus (Exercices, Réflexion, Ce qui vient ensuite, etc.) en h3 avec bordure
- [x] Détection des listes implicites (séquences de lignes courtes commençant par majuscule)
- [x] Détection forward-looking du premier élément de liste (regarde la ligne suivante)
- [x] Rendu des durées parenthétiques en italique (4 minutes, 5-10 mins)
- [x] Détection des liens de domaines nus (claude.ai, anthropic.com) comme liens cliquables
- [x] Correction du stripping de la description qui ne supprime plus les lignes de contenu utiles

## Correction structure cours et blocs téléchargement (2026-07-29)
- [x] Corrigé l'ordre des leçons (alphabétique → ordre correct Skilljar) pour cours 01, 04, 05, 07
- [x] Ajouté les sections/modules dans la sidebar (10 sections pour AI Fluency, etc.)
- [x] Restructuré le cours Amazon Bedrock (06) : 79 leçons individuelles dans le bon ordre
- [x] Ajouté blocs de téléchargement (Download) au cours AI Fluency (vocabulary guide PDF + 3 PDFs cours)
- [x] Implémenté le rendu des blocs download (carte avec icône, titre, description, bouton télécharger)
- [x] Téléchargé et uploadé le PDF AI_Fluency_vocabulary_cheat_sheet.pdf sur le storage

## Ressources téléchargeables complètes (Downloads) - 2026-07-29
- [x] Extraire les fichiers du ZIP fourni par l'utilisateur (139 fichiers extraits)
- [x] Uploader tous les fichiers sur le serveur (manus-upload-file --webdev) - 139 fichiers uploadés
- [x] Intégrer les données de téléchargement dans les JSON de cours (143 blocs dans 5 cours)
- [x] Refaire le rendu des cartes Download dans TrainingCourse.tsx (fidèle à Skilljar : fond coloré, illustration quill, titre, description, bouton)
- [x] Vérifier le rendu : leçon Introduction to AI Fluency affiche la carte AI Fluency vocabulary guide
- [x] Vérifier que le bouton pointe vers AI_Fluency_vocabulary_cheat_sheet.pdf hébergé localement
- [x] Vérifier que l'image quill est visible avec alt text

## Vérification structure et icônes - 2026-07-29
- [x] Restructuré cours 02 (Building with Claude API) : 94 leçons, 11 sections
- [x] Restructuré cours 03 (Claude on Google Cloud) : 98 leçons, 12 sections
- [x] Ajouté sections aux cours 04 (Claude Code), 05 (Claude 101), 07 (MCP)
- [x] Corrigé logique section boundaries (titres répétés Module Introduction)
- [x] Ajouté icônes de type (Video, BookOpen, Download, Brain, Target) à tous les cours
- [x] Corrigé sections cours 06 (Bedrock) : Computer Use et Course introduction
- [x] Vérifié TypeScript compile sans erreur
## Corrections rendu UI (2026-07-29) - Problèmes identifiés par screenshots
- [x] Convertir le chapitre Capability Layer en tabbed_content (Skills/Code Execution/Memory)
- [x] Ajouter détection et rendu des tables concaténées (pattern camelCase) dans PageContent
- [x] Ajouter support des tables markdown (pipe-delimited) dans PageContent
- [x] Vérifier que la navigation écran (Écran X sur N) fonctionne correctement
- [x] Corriger le rendu des titres de chapitre (Memory comme heading propre)

## Corrections structure et quiz (2026-07-29) - Problèmes signalés par l'utilisateur
- [x] Rétablir le verrouillage séquentiel des cours (cours N+1 verrouillé tant que cours N pas terminé)
- [x] Rendre les quiz/checkpoint obligatoires (Next button désactivé tant que exercices pas complétés)
- [x] Vérifier que le quiz de fin de leçon (LessonQuiz) est bien obligatoire pour marquer le cours comme terminé
- [x] Comparer les patterns visuels Skilljar (tabs, tables, titres) avec notre rendu

## Améliorations UX Training (2026-07-29)
- [x] Indicateur de progression détaillé sur page certification (exercices restants par cours)
- [x] Rendu Q/R en cartes interactives (SingleChoiceExercise redesign Skilljar-style)
- [x] Ajustement styles visuels pour correspondre aux patterns Skilljar (couleurs, typographie, espacement)

## Corrections rendu exercices interactifs (2026-07-29)
- [x] Supprimer les blocs content doublons qui précèdent un bucket_sort (artefact scraping - détection runtime)
- [x] Scanner tous les cours pour détecter les types de blocs non rendus (transcript et comparison déjà gérés)
- [x] Vérifier que MatchingExercise (bucket_sort) fonctionne correctement avec les données JSON

## Amélioration rendu sous-titres et mise en page (2026-07-29)
- [x] Détecter les sous-titres (lignes courtes isolées avant paragraphes) et les rendre en h3/h4
- [x] Détecter les patterns "Titre: sous-titre" et les rendre avec style distinct
- [x] Améliorer l'espacement et la hiérarchie visuelle globale du contenu
- [x] Détecter les blocs TOC (séquence de mots courts) et les rendre en pills
- [x] Améliorer isSectionHeading pour attraper les headings avec ? et !

## Fiabilisation progression + UX améliorations (2026-07-29)
- [x] Fiabiliser indicateurs de progression (basés sur quiz/checkpoint passés avec succès + unlock)
- [x] Corriger les tags "Not started" / "In progress" / "Completed" pour refléter la vraie progression
- [x] Augmenter contraste et taille des sous-titres dans les leçons
- [x] Ajouter feedback visuel immédiat avec explication après chaque réponse de quiz
- [x] Ajouter animations de transition fluides au drag & drop (MatchingExercise)

## Indicateurs sidebar + Reprendre lecture + Animations écrans (2026-07-29)
- [x] Ajouter coche verte dans la sidebar pour les chapitres validés (progression par chapitre)
- [x] Créer widget "Reprendre la lecture" sur la page d'accueil (retour au dernier exercice/quiz consulté)
- [x] Ajouter animations slide-in horizontal entre les écrans de cours

## Bouton déconnexion + Fix 404 images (2026-07-29)
- [x] Ajouter un bouton de déconnexion visible dans la navigation
- [x] Corriger les 404 sur les images /manus-storage/ (proxy sert maintenant les fichiers directement au lieu de 307 redirect)

## Fix rendu des tabs et blocs dans les leçons (2026-07-29)
- [x] Corriger la détection des tabs (affichés comme liste à puces au lieu de tabs interactifs)
- [x] Corriger le rendu des blocs de contenu (texte brut au lieu de cartes stylisées)

## Détection patterns structurés : listes numérotées + accordéons (2026-07-29)
- [x] Analyser les données de cours pour identifier les patterns de listes numérotées et sections longues
- [x] Implémenter détecteur de listes numérotées interactives (stepper/timeline)
- [x] Implémenter détecteur d'accordéons pour sections longues (collapsible)
- [x] Vérifier le rendu visuel et les interactions

## Standards e-learning moderne - Audit UX/UI (2026-07-29)
- [x] Barre de progression de lecture (sticky top, montre le % de scroll dans le chapitre)
- [x] Temps de lecture estimé par chapitre (ex: "5 min de lecture")
- [x] Optimiser la largeur de lecture (max-width 680px pour le texte, line-height 1.8)
- [x] Augmenter la taille du texte body (16px au lieu de 14.5px)
- [x] Séparateurs visuels entre les sections majeures (hr gradient + espacement h2/h3/h4)
- [x] Pull quotes / encadrés "À retenir" (classe .key-concept avec border-left orange)
- [x] Icônes sur les headings de section (✏️ exercice, 💡 réflexion, 🎯 résumé, ➡️ next steps, 📚 ressources, ⚙️ prérequis)
- [x] Navigation sticky avec titre du chapitre visible au scroll
- [x] Bouton scroll-to-top apparaissant après défilement
- [x] Améliorer le rendu bilingue (déjà implémenté : body[lang] affiche uniquement la langue sélectionnée)
- [x] Animation de complétion de chapitre (classe .chapter-complete-celebration)
- [x] Raccourcis clavier pour navigation (flèches gauche/droite + kbd-hints visuels)
- [x] Accessibilité : focus-visible, skip-to-content, prefers-reduced-motion

## Amélioration Back-Office Admin (2026-07-29)
- [x] Schema: table admin_notes (notes sur utilisateurs/candidatures)
- [x] Schema: table admin_tags (étiquettes personnalisées pour segmenter les apprenants)
- [x] Schema: table communications (historique des emails envoyés en masse)
- [x] Backend: CRUD notes admin (ajouter, modifier, supprimer, lister par cible)
- [x] Backend: Activation automatique des candidatures acceptées (créer compte + envoyer email)
- [x] Backend: Actions en masse (accepter/refuser multiples candidatures, envoyer emails groupés)
- [x] Backend: Tags/segments apprenants (créer, assigner, filtrer)
- [x] Backend: Communiqués en masse (composer email, sélectionner destinataires, envoyer)
- [x] Frontend: Système de notes admin (timeline, ajout rapide, filtrage)
- [x] Frontend: Outils d'évaluation avancés (dashboard performance, indicateurs de risque)
- [x] Frontend: Visionneuse CV intégrée (preview PDF inline)
- [x] Frontend: Activation automatique candidatures (bouton batch + workflow)
- [x] Frontend: Invitations en masse (import CSV, envoi groupé)
- [x] Frontend: Communiqués en masse (compositeur email avec templates)
- [x] Frontend: Vue Kanban candidatures (drag & drop entre statuts)
- [x] Frontend: Timeline d'activité par apprenant (journal d'activité)
- [x] Frontend: Alertes automatiques (inactif >7j, échecs quiz, progression bloquée)
- [x] Vérifier et corriger l'upload CV et photo dans le formulaire de candidature (visible et fonctionnel)
- [x] Backend: Table admin_notifications + procédures (list, markRead, markAllRead)
- [x] Backend: Génération automatique de notifications (nouvelle candidature, apprenant inactif >7j)
- [x] Frontend: Panneau de notifications admin (icône cloche + dropdown avec badge compteur)
- [x] Heartbeat job: Détection automatique des apprenants inactifs >7 jours + génération notification admin (cron: dwftZFKazMhLDwjwmpq3fJ, daily 08:00 UTC)
- [x] Admin: Navigateur de cours/quiz/exercices (lister tous les contenus disponibles)
- [x] Admin: Mode consultation (voir le contenu comme un apprenant sans affecter la progression)
- [x] Admin: Mode simulation (simuler un quiz/exercice sans enregistrer les résultats)
- [x] Admin: Mode édition (modifier le contenu des cours, questions de quiz, exercices)
- [x] Créer un cours "IA pour les nuls" pour non-informaticiens (JSON + quiz + intégration training index)
- [x] Intégrer des vidéos YouTube explicatives dans chaque leçon du cours IA pour les nuls (10 vidéos, 2 par leçon)
- [x] Redesign header: retirer éléments non pertinents (Registered Partner, Diagnostic IA, À propos), soigner le design, déplacer vers footer
- [x] Enlever toute mention de technologie chinoise du site
- [x] Ajouter anglais et arabe comme langues sur le site vitrine (header, hero, footer, sections clés)
- [x] Utiliser le logo original Neopolis Development + changer complètement le style du header
- [x] Corriger le mail d'invitation avec lien direct de création de compte (pas de registration libre)
- [x] Ajouter la fonction d'envoi massif d'invitations dans l'espace admin
- [x] Fix TypeScript errors in AdminDashboard.tsx (invitations query uses .items instead of .invitations)
- [x] Fix AdminContentManager - content page not working
- [x] Unify admin navigation menu across all admin pages (Dashboard, Content, Training)
- [x] Analyze and fix server log errors (stale Vite pre-transform errors cleared, no actual runtime errors)

## Traductions complètes (FR, EN, AR)
- [x] Traduire la section "La Formule" en anglais et arabe
- [x] Traduire la section "Partenaires" en anglais et arabe
- [x] Traduire la liste "Ce que nous fournissons" en anglais et arabe
- [x] Traduire la section "AI Solutions Partner" en anglais et arabe
- [x] Traduire la section "Process Commercial" en anglais et arabe
- [x] Traduire la FAQ complète en anglais et arabe
- [x] Traduire le menu mobile en anglais et arabe
- [x] Vérifier la cohérence des traductions sur toutes les sections

## Bugs critiques à corriger (signalés par l'utilisateur)
- [x] Emails d'invitation sans lien de création de compte (corrigé: suppression cast 'as any', lien /accept-invitation?token= bien construit)
- [x] Gestion du contenu admin cassée (corrigé: aucune erreur réseau/console aujourd'hui, page fonctionne)
- [x] Invitation en masse non visible dans l'admin (corrigé: onglet Invitations visible avec bouton Envoi en masse)
- [x] Traductions landing page incomplètes (corrigé: toutes les sections traduites en EN/AR - stats, CTA, Process, Formule, FAQ, Footer, FlowDiagram, Simulateur, Exemples)
- [x] Intégrer les traductions formLabels.ts dans Apply.tsx (formulaire entièrement traduit FR/EN/AR : 10 étapes, navigation, vidéo pitch, documents)

## Audit complet front/back/learning/admin (30 juillet 2026)
- [x] Audit Landing page (EN + FR) : contenu, stats, chart, formule, partenaires, FAQ, footer
- [x] Audit Formulaire candidature (10 étapes) : validation, dropdowns, navigation
- [x] Audit Login : validation, erreurs, loading state
- [x] Audit Accept Invitation : gestion token invalide/absent
- [x] Audit Training Dashboard : progress, stats, certifications
- [x] Audit Training Certification Detail : cours verrouillés/déverrouillés
- [x] Audit Training Course Content : navigation chapitres, contenu, flip cards
- [x] Audit Mock Exam (apprenant) : config, timer, questions, choix
- [x] Audit Admin Candidatures : stats, table, filtres, export CSV
- [x] Audit Admin Communications : table, bouton nouveau communiqué
- [x] Audit Admin Invitations : stats, table, envoi en masse
- [x] Audit Admin Kanban : 3 colonnes, cartes candidats
- [x] Audit Admin Évaluation : stats, classement apprenants
- [x] Audit Admin Activité : journal avec message explicatif
- [x] Audit Admin Suivi Apprenants : 3 tabs, recherche, table, export
- [x] Audit Admin Analytics : graphiques inscriptions, activité, répartition
- [x] Audit Admin Contenu : 6 certifications, 31 cours, stats
- [x] Audit Admin Simuler Examen : CORRIGÉ (crash React #31 objets traduction)
- [x] Audit Admin Éditer Examen : CORRIGÉ (objets traduction dans inputs)
- [x] Audit Diagnostic IA : formulaire multi-étapes fonctionnel
- [x] Audit Mentions Légales : contenu juridique complet
- [x] Audit Page 404 : affichage correct avec bouton retour
- [x] Correction bug critique : AdminContentManager crash simulation examen (useLanguage + t())
- [x] Correction bug mineur : Markdown ** dans titres sidebar et headings (strip asterisks)
- [x] Tests unitaires : 16/16 passent (scoring, courseQuality, auth, email)

## Correction Module Introduction vide
- [x] Ajouter un contenu d'introduction au chapitre "Module Introduction" du cours Claude Platform Model Foundations
- [x] Fix bug: "No content available" quand progress=10/10 (initialChapter hors limites, clampé à max index)
- [x] Fix bug: ** markdown brut dans la description du chapitre Module Complete (screenDescription strip)
- [x] Enrichissement contenu Module Introduction (1788 chars EN / 2077 chars FR)

## Bugs signalés (30 juillet 2026)
- [x] Bug chiffres page d'accueil : les stats (300M, 92M, 30%, 220 Milliards $) affichent 0 sur mobile (fix: margin 0px + fallback 3s)
- [x] Bug rôle admin : le compte apprenant demo a accès admin (rôle promu pendant l'audit, remis en user via SQL)

## Bug crash admin consultation/édition cours (30 juillet 2026)
- [x] Fix TypeError: body?.replace is not a function dans AdminContentManager (resolveBody helper + tous block types)
- [x] Fix crash édition exercices admin (typeof checks pour exercise edit dialog)
- [x] Ajout renderers manquants: text, single_choice_exercise, bucket_sort, comparison, tabbed_content, download
- [x] Fix exercises rendering: title, prompt, instructions avec resolveBody()
- [x] Backend Zod schemas élargis pour accepter string | {en,fr} (updateQuizzes, updateMockExamQuestion, addMockExamQuestion, updateExercise)
- [x] Fix TypeScript errors: z.record(z.string()) -> z.record(z.string(), z.string()) pour Zod v4

## Onglets EN/FR dans les dialogues d'édition admin
- [x] Ajouter onglets EN/FR dans le dialogue d'édition des questions d'examen mock
- [x] Ajouter onglets EN/FR dans le dialogue d'édition des quiz
- [x] Ajouter onglets EN/FR dans le dialogue d'édition des exercices
- [x] Ajouter onglets EN/FR dans le dialogue d'édition des blocs de contenu (body)
- [x] Anglais comme langue par défaut (fallback si pas de traduction FR)
- [x] Helpers getI18n/setI18n pour normalisation string <-> {en,fr}

## Bug images disparaissent en navigation normale (31 juillet 2026)
- [x] Fix: créer /api/assets/ proxy custom qui pipe les fichiers directement (bypass platform 307 redirect)
- [x] Fix: migrer toutes les refs frontend de /manus-storage/ vers /api/assets/
- [x] Fix: storage.ts retourne /api/assets/ pour les nouveaux uploads
- [x] Fix: /manus-storage/ redirige 301 vers /api/assets/ pour compatibilité DB existante
- [x] Cache-Control: max-age=3600, must-revalidate (au lieu de 1 an immutable via CloudFront)

## Chapitres Tutoriels vidéo YouTube (31 juillet 2026)
- [x] Ajouter chapitre Tutoriels à la fin de chaque cours Developer Foundations (5 cours)
- [x] Ajouter chapitre Tutoriels à la fin de chaque cours Architect Foundations (7 cours)
- [x] Ajouter chapitre Tutoriels à la fin de chaque cours Architect Professional (5 cours)
- [x] Vidéos YouTube pertinentes et pratiques pour chaque module
- [x] Pas de quiz dans les chapitres tutoriels

## Enrichissement tutoriels + correction compteurs (31 juillet 2026)
- [x] Enrichir les chapitres tutoriels avec 5-8 vidéos YouTube par cours (au lieu de 3)
- [x] Mettre à jour lessonCount dans trainingIndex.json pour refléter les nouveaux chapitres
- [x] Mettre à jour totalVideos dans trainingIndex.json pour chaque certification
- [x] Mettre à jour le champ videos[] dans chaque cours de trainingIndex.json
- [x] Ajouter compteur totalDownloads par certification dans trainingIndex.json
- [x] Afficher le compteur downloads dans l'UI (TrainingCertification, TrainingDashboard, AdminContentManager)
- [x] Corriger le curseur pointer sur l'élément "Don't suffer the disruption" (ce n'est pas un bouton)
- [x] Transformer la section 5 étapes Ambassador en stepper horizontal interactif (pastilles cliquables)
- [x] Corriger le problème de contraste titre/fond dans cette section
- [x] Corriger les caractères unicode échappés (\u00b7 et \u2192) affichés littéralement
- [x] Refaire le diagramme "Project workflow" : couleurs adaptées au thème, flèches entre étapes, design dynamique compact
- [x] Refaire la section "Concrete project examples" : afficher titre + ROI client seulement, bouton "Afficher plus" pour déplier les détails
- [x] Refaire la section "Our Technology Partners" : plus compacte, meilleure présentation, moins d'espace vertical
- [x] Ajouter des vidéos anglaises équivalentes dans "IA pour les nuls" (garder FR, ajouter EN)
- [x] Supprimer blocs "Tech ecosystem" et "What we provide", améliorer design Anthropic/Claude
- [x] Réduire les espaces verticaux excessifs entre les sections de la landing page
- [x] Supprimer le lien "Diagnostic IA" du footer (accessible uniquement aux utilisateurs authentifiés)
- [x] Afficher une seule vidéo par page (pas deux vidéos sur le même écran)
- [x] Implémenter YouTube IFrame API Player avec détection auto 80% visionnage
- [x] Bouton "Marquer comme vue" en fallback manuel
- [x] Bloquer le bouton "Suivant" tant que la vidéo n'est pas marquée comme vue

## Diagnostic IA Avancé — BPMN + Recommandations détaillées (31 juillet 2026)
- [x] Créer la page AdvancedDiagnosticIA.tsx avec designer de processus BPMN
- [x] Permettre la décomposition en sous-processus et traitements unitaires
- [x] Pour chaque traitement unitaire : formulaire d'évaluation détaillé (type de données, volume, complexité)
- [x] Moteur de recommandation IA ultra-détaillé par traitement :
  - [x] Modèle exact recommandé (Claude Sonnet 4, Haiku, Opus, avec/sans extended thinking)
  - [x] Mode d'utilisation (Claude.ai chat, API directe, SDK Python/TS, Claude Code CLI, Bedrock, Vertex AI, Computer Use)
  - [x] Architecture (appel simple, chaîne de prompts, agent autonome multi-étapes, RAG, fine-tuning/customisation)
  - [x] Niveau d'autonomie (humain dans la boucle, supervision légère, autonome complet)
  - [x] Estimation RAG si nécessaire (volume docs, type embeddings, stratégie chunking)
  - [x] Estimation fine-tuning si nécessaire (dataset, coût, délai)
  - [x] Estimation coûts (tokens/mois, coût API mensuel, infrastructure)
- [x] Vue projection post-implémentation : redesign du processus global après IA
- [x] Estimation des gains probables (temps, coût, qualité, satisfaction)
- [x] Enregistrer route /diagnostic-avance (protégée, auth requise)
- [x] Lien depuis le TrainingDashboard vers le diagnostic avancé

## Fix: Incohérence des stats et ajout vidéos YouTube
- [x] Analyser et corriger l'incohérence des compteurs entre niveaux (dashboard/certification/cours/leçon)
- [x] Identifier les sources de données hardcodées dans TrainingCertification.tsx et TrainingCourse.tsx
- [x] Unifier la logique de comptage : tous les niveaux doivent calculer depuis le contenu réel
- [x] Rechercher et intégrer des vidéos YouTube récentes pour les 10 nouvelles certifications
- [x] Ajouter des blocs vidéo (cours principal + vidéos complémentaires + tutoriels) dans les fichiers de cours
- [x] Recomputer les stats à tous les niveaux et vérifier la cohérence

## Système de recommandation vidéos complémentaires
- [x] Créer une base de données de vidéos YouTube complémentaires par thème/sujet
- [x] Créer le composant VideoRecommendations (section en fin de leçon)
- [x] Intégrer le composant dans TrainingCourse après le dernier chapitre de chaque leçon
- [x] Afficher 3-5 vidéos recommandées par leçon (titre, durée, type: tutoriel/complémentaire/avancé)
- [x] Système de matching par mots-clés du contenu de la leçon

## Feedback vidéo recommandations - Bouton "Pas pertinent / Obsolète"
- [x] Créer la table video_feedback en base de données (userId, videoId, lessonId, reason, createdAt)
- [x] Créer l'endpoint tRPC pour soumettre un feedback vidéo
- [x] Ajouter le bouton "Pas pertinent" sur chaque carte de recommandation vidéo
- [x] Filtrer les vidéos signalées par l'utilisateur dans les recommandations futures
- [x] Afficher un feedback visuel (toast) après signalement

## Redesign badges flottants hero
- [x] Remplacer les badges "Certification CCA" et "Certification internationale" (wise-card blanc/bordure) par des pills gradient modernes (vert gradient + violet gradient, texte blanc, rounded-full, shadow)

## Refonte charte graphique — Harmonie avec le logo Neopolis
- [x] Mettre à jour les CSS variables (--wise-primary → bleu marine, supprimer tint-coral/cyan/pear)
- [x] Remplacer tous les fonds colorés (tint-*) par blanc/slate-50/bleu-pâle dans Home.tsx
- [x] Unifier les icônes en slate-400 ou bleu marine (supprimer coral, cyan, pear, lime)
- [x] Refaire les badges/pills en bleu marine + rouge carmin uniquement
- [x] Refaire les graphiques Chart.js en bleu marine + gris
- [x] Refaire la section CTA finale en bleu marine fond + texte blanc
- [x] Vérification visuelle complète

## Harmonisation finale landing page — badges et composants restants
- [x] Remplacer wise-badge-positive (fond vert) par fond bleu marine pâle
- [x] Remplacer wise-card-green (fond vert) par fond bleu marine pâle
- [x] Remplacer toutes les références wise-primary par neo-primary dans Home.tsx
- [x] Corriger le badge Certification CCA (gradient vert → bleu marine)
- [x] Corriger la carte "Reprendre la lecture" (fond vert/hue 145 → bleu hue 255)
- [x] Supprimer la dernière occurrence de hue 145 (chevron vert)
- [x] Vérification visuelle complète de la landing page

## Fix logo Claude cassé
- [x] Remplacer l'image cassée du logo Claude (logo_claude_ai_48b660b5.png) par le logo officiel Claude (icône app arrondie)

## Fix images + Optimisation + Parallax
- [x] Diagnostiquer le problème d'affichage des images en production (CDN convertit PNG→WebP, mismatch MIME type)
- [x] Re-uploader les images en format JPEG natif pour compatibilité navigateur
- [x] Optimiser le poids des images (4.2 MB → 51-110 KB par image, réduction de 95%)
- [x] Ajouter un effet parallax subtil (useScroll + useTransform) sur l'image "Devenez AI Solutions Partner"
- [x] Ajouter un glow background blur derrière l'image parallax pour la profondeur

## Remplacement graphique orbital hero
- [x] Générer une illustration 3D isométrique professionnelle (escalier de progression IA, bleu marine)
- [x] Remplacer le graphique orbital SVG animé par l'illustration statique
- [x] Supprimer le composant NetworkGraph inutilisé
- [x] Optimiser l'image (42 KB, 800x600)
- [x] Conserver les badges flottants "Certification CCA" et "Certification internationale"

## Refonte graphique orbital hero (animation)
- [x] Recréer le graphique orbital animé avec palette bleu marine
- [x] Orbites circulaires propres (2 anneaux concentriques)
- [x] Nœuds avec lettres sur fond coloré (dégradé bleu marine)
- [x] Logo Neopolis au centre avec ombre douce
- [x] Animations fluides : rotation conic-gradient, flottement des nœuds, dots circulants
- [x] Badges flottants "Certification CCA" et "Certification internationale" conservés

## Refonte UX/UI Training Dashboard (simplification)
- [x] Supprimer la grille de 16 mini-barres de progression du haut (trop dense)
- [x] Ajouter des onglets de navigation (Mon Parcours / Catalogue / Parcours recommandé)
- [x] Onglet "Mon Parcours" : progression globale + widget reprise lecture + prochaine étape
- [x] Onglet "Catalogue" : cartes de certifications avec filtres par catégorie
- [x] Onglet "Parcours recommandé" : ordre d'étude séquentiel clair
- [x] Simplifier la barre de stats (intégrer dans l'onglet catalogue)
- [x] Guidance "Commencez ici" pour les nouveaux utilisateurs (0% progression)
- [x] Supprimer la redondance entre section progression et ordre d'étude

## YouTube IFrame Player API + Navigation verrouillée
- [x] Créer composant YouTubePlayer avec API IFrame Player (pas simple iframe)
- [x] Détecter automatiquement 80%+ de visionnage via onStateChange + getCurrentTime
- [x] Auto-marquer la vidéo comme vue quand 80% atteint
- [x] Garder le bouton "Marquer comme vue" en fallback manuel
- [x] Bloquer le bouton "Suivant" tant que la vidéo du chapitre n'est pas marquée comme vue
- [x] Afficher une barre de progression de visionnage sous la vidéo
- [x] Afficher un message explicatif quand le bouton Suivant est bloqué

## Mélanger les réponses au retry
- [x] SingleChoiceExercise : shuffledOptions state + Fisher-Yates sur handleReset
- [x] ChapterQuiz : useMemo shuffled choices dépendant de attemptCount + currentQ
- [x] ExerciseRenderer : shuffledOptions state + shuffle on handleReset pour single/multi/checklist
- [x] LessonQuiz : useMemo shuffledChoices dépendant de q.id + currentQ + attemptCount

## Fix progression non affichée sur le dashboard
- [x] Fix getCompletedUnits : retourner fraction (chapterIndex/totalChapters) pour cours single-lesson
- [x] Fix isLessonComplete : gérer correctement les cours single-lesson avec chapter progress
- [x] Fix getNextUnlockedLesson : gérer correctement les cours single-lesson
- [x] Fix TrainingCertification : utiliser getChapterProgress pour le calcul par cours

## Bloquer navigation si flip cards non retournées et exercices non faits
- [x] FlipCardsGrid : ajouter callback onAllFlipped quand toutes les cartes ont été vues au moins une fois
- [x] TrainingCourse : tracker les flip cards complétées par chapitre
- [x] TrainingCourse : gater le bouton Next si flip cards non toutes retournées
- [x] TrainingCourse : gater le bouton Next si exercices (exercise blocks) non complétés
- [x] TrainingCourse : bloquer aussi la navigation clavier (ArrowRight) quand gaté
- [x] MatchingExercise : passer onComplete depuis TrainingCourse pour tracker la complétion

## Stabilité & Monitoring
- [x] Tester toutes les certifications (Developer, Architect) pour crashes
- [x] Ajouter un monitoring d'erreurs côté client (ErrorReporter)
- [x] Configurer ESLint avec react-hooks/rules-of-hooks
- [x] Extraire ProcessStepper en composant propre (fix hooks-in-callback)

## Dashboard Erreurs & Corrections ESLint
- [x] Dashboard admin "Erreurs client" (graphique temporel + liste filtrable)
- [x] Corriger warnings exhaustive-deps (TrainingCourse.tsx + Home.tsx)
- [x] Résoudre duplicate key chapter_13 (Architect Professional) - 627 chapitres corrigés

## Persistance Erreurs & Cleanup
- [x] Persister les erreurs client en base de données (table client_errors)
- [x] Nettoyer les unused imports (TrainingCourse.tsx, Home.tsx) - 25+ warnings résolus

## Détail Candidature
- [x] Ajouter vue détail candidature en cliquant sur une ligne du tableau (modale)

## Audit - Actions Critiques
- [x] Code-splitting React.lazy pour toutes les routes (15 pages lazy-loaded)
- [x] Ajouter 7 index de base de données manquants (déjà existants via migrations SQL)
- [x] Optimiser getApplicationStats avec requête agrégée SQL (GROUP BY status)
- [x] Décomposer TrainingCourse.tsx en sous-composants (3808→637 lignes + 5 sous-fichiers)

## Tests, Lazy-loading & Sécurité
- [x] Tests unitaires pour sous-composants extraits (contentDetectors) - 24 tests ajoutés
- [x] Lazy-loading des données JSON de cours (cache mémoire + prefetch cours suivant)
- [x] Header CSP renforcé (unsafe-eval retiré en prod, base-uri, form-action, HSTS)

## Performance & Tests d'intégration
- [x] Script Lighthouse automatisé avec rapport de performance (pnpm lighthouse)
- [x] Tests d'intégration API pour endpoints tRPC admin (25 tests - 65 total)

## Authentification Email/Mot de passe
- [x] Ajouter champs password_hash et reset_token au schéma DB
- [x] Créer endpoints login, register, forgot-password, reset-password
- [x] Pages frontend : Login, Register, Forgot Password, Reset Password
- [x] Email de récupération de mot de passe (lien avec token)
- [x] Intégrer avec le flux d'acceptation candidat (création compte auto)

## Intégration Sentry (Monitoring)
- [x] Créer le projet neopolis-akademy sur l'instance Sentry self-hosted (sentry.neopolis-dev.com)
- [x] Installer @sentry/react SDK
- [x] Configurer le suivi des bugs (Error Monitoring)
- [x] Configurer le suivi des performances (Browser Tracing, tracesSampleRate: 1.0)
- [x] Configurer Session Replay (replaysOnErrorSampleRate: 1.0)
- [x] Configurer le widget User Feedback (labels en français)

## Améliorations Sentry
- [x] Ajouter le contexte utilisateur (Sentry.setUser) quand l'utilisateur est connecté
- [x] Ajuster tracesSampleRate à 0.2 en production (garder 1.0 en dev)
- [x] Personnaliser le style du widget feedback pour s'intégrer au design du site

## Analyse Monitoring & Corrections
- [x] Analyser les logs Sentry (aucune erreur capturée - projet récent)
- [x] Analyser les logs de production (pas d'erreurs critiques, seulement "Missing session cookie" normal)
- [x] Analyser les logs dev server (erreurs historiques déjà corrigées)
- [x] Analyser les logs console navigateur (duplicate key chapter_13 déjà corrigé le 2 août)
- [x] Corriger la fuite du passwordHash dans la réponse auth.me (SÉCURITÉ)

## Rate Limiting Auth Endpoints
- [x] Ajouter rate limiting sur POST /api/auth/login (max 5 tentatives par IP par 15 min)
- [x] Ajouter rate limiting sur POST /api/auth/forgot-password (max 3 requêtes par IP par 15 min)

## Header Button Conditionnel
- [x] Bouton bleu header : "Se connecter" pour utilisateurs non connectés, "Formation" pour utilisateurs connectés

## Forgot Password - Fallback Invitation pour candidats acceptés
- [x] Modifier forgot-password pour chercher dans applications (status=selectionne) si email pas trouvé dans users
- [x] Envoyer automatiquement une invitation si candidat accepté sans compte

## Sentry Backend (Node.js/Express)
- [x] Installer @sentry/node
- [x] Initialiser Sentry côté serveur via --import (ESM pattern)
- [x] Configurer le tracing Express pour capturer les transactions backend
- [x] Configurer le error handler Express (setupExpressErrorHandler)

## Intégration Cours BI (Analyse de données, reporting et BI avec Codex)
- [x] Créer le groupe "bi_data_analytics" dans GROUP_CONFIG
- [x] Créer la certification "analyse_donnees_reporting_bi_codex" dans trainingIndex.json
- [x] Créer les 8 fichiers JSON de cours (modules 01-08) avec 4 leçons chacun
- [x] Enregistrer les 8 cours dans trainingIndex.json
- [x] Tester l'affichage dans le dashboard formation
- [x] Corriger le bug de déploiement (dist/index.js path avec esbuild)
## Fix React Crash + Sentry Replay
- [x] Corriger violation Rules of Hooks (useEffect après return conditionnel) dans TrainingCourse.tsx
- [x] Désactiver le masquage de texte dans Sentry Session Replay (maskAllText: false, blockAllMedia: false, maskAllInputs: false)
- [x] Ajouter trust proxy pour corriger le rate limiter derrière Cloud Run/reverse proxy

## Fix exercices bucket_sort cassés
- [x] Corriger les 29 exercices bucket_sort avec catégories invalides et correctBucket vides
- [x] Vérifier 0 exercices cassés restants

## Suivi candidats sélectionnés + Délivrabilité email (04 août 2026)
- [x] Ajouter colonnes email_delivery_status et resend_message_id dans la table user_invitations
- [x] Créer endpoint tRPC admin.getSelectedCandidates (vue dédiée candidats sélectionnés avec statut activation)
- [x] Créer endpoint admin.updateCandidateEmail (modification email d'un candidat)
- [x] Créer endpoint admin.resendInvitationForCandidate (renvoi invitation après correction email)
- [x] Implémenter webhook Resend pour tracker bounced/delivered/opened
- [x] Créer la vue admin "Candidats sélectionnés" avec tableau : nom, email, statut compte, statut email, actions
- [x] Ajouter la modification d'email inline dans la vue admin
- [x] Ajouter bouton "Renvoyer invitation" par candidat
- [x] Ajouter indicateurs visuels : compte créé (vert), invitation envoyée (orange), email invalide (rouge), en attente (gris)
- [x] Dashboard délivrabilité : compteurs emails envoyés/délivrés/rebondis

## Correction cours "Analyse de données, reporting et BI avec Codex" (04 août 2026)
- [x] Générer les 13 fichiers CSV de données de test (seed=20260804)
- [x] Générer les dumps SQL (OLTP, DW, star schema, faulty marts, expected results, data quality assertions)
- [x] Uploader tous les fichiers de données et obtenir les URLs
- [x] Réécrire les exercices/TP de chaque module avec présentation structurée et liens de téléchargement
- [x] Ajouter les fichiers de solutions (solution_lab_01 à solution_lab_07 + final)
- [x] Vérifier le rendu visuel des exercices corrigés

## Exercices à réponses numériques déterministes (cours BI Codex)
- [x] Calculer toutes les réponses numériques de référence à partir des CSV (CA net, marges, taux, etc.)
- [x] Reformater les exercices pour demander des valeurs numériques précises (avec tolérance)
- [x] Stocker les réponses attendues dans les JSON de cours (champ answers)
- [x] Créer un composant UI de saisie de réponse numérique avec validation
- [x] Intégrer la validation côté serveur (comparer réponse candidat vs réponse attendue avec tolérance)
- [x] Enregistrer les résultats en base de données (score par exercice)

## Correction marges et taux de change fixes (cours BI Codex)
- [x] Corriger les prix produits en MAD/TND pour obtenir des marges réalistes (36-37%)
- [x] Fixer les taux de change de référence dans les énoncés (1 EUR = 10.90 MAD, 3.35 TND, 1.47 CAD, 1.08 USD)
- [x] Recalculer toutes les réponses de référence avec les données corrigées
- [x] Mettre à jour les JSON de cours avec les nouvelles réponses et taux fixes
- [x] Re-uploader les fichiers CSV/SQL corrigés

## Boutons de téléchargement cours BI
- [x] Remplacer les liens markdown bruts par des boutons de téléchargement visuels dans le LessonViewer

## Correction lisibilité exercices
- [x] Corriger le rendu des exercices type "exercise" : espacement entre paragraphes, titre complet non tronqué

## Bug: Impossible de passer à la page suivante après exercice complété
- [x] Corriger la logique de validation qui bloque le bouton "Suivant" même quand l'exercice est complété (4/4)

## Bug: Exercices manquent de consignes et correction incohérente
- [x] Examiner la structure des exercices type "exercise" dans les cours Developer Foundations
- [x] Ajouter des consignes explicites aux exercices qui en manquent (nettoyage pollution 31 exercices + 41 blocs)
- [x] Corriger la correction affichée qui ne correspond pas à la question posée (correction était en fait cohérente après nettoyage)
- [x] Séparer correctement le contenu du chapitre de l'exercice (titre "Reveal model answer" supprimé de 20 fichiers)

## Refonte panneau monitoring erreurs admin
- [x] Filtrer les erreurs de build (Failed to fetch dynamically imported module) — ne plus les catcher
- [x] Afficher les erreurs dans un tableau (colonnes: date, type, message, URL, actions)
- [x] Ajouter un bouton Supprimer par ligne pour permettre à l'admin de marquer comme résolu
- [x] Persister la suppression côté serveur (endpoint tRPC)

## Bug: Stepper interactif non cliquable
- [x] Rendre les étapes numérotées (cercles 1-6) cliquables dans les cours
- [x] Afficher le contenu de l'étape sélectionnée sous le stepper
- [x] Mettre en surbrillance l'étape active

## Amélioration rendu prompt exercices
- [x] Parser le prompt pour détecter les blocs System:/User:/Broken prompt/ticket
- [x] Afficher System: et User: dans des blocs code stylisés
- [x] Afficher le contenu <ticket>...</ticket> dans un encadré distinct
- [x] Séparer visuellement les consignes (texte normal) du contenu technique
- [x] Supprimer la duplication du titre dans le prompt quand il est identique au title

## Nettoyage exercices parasites et checkpoints redondants
- [x] Supprimer 79 exercices parasites (Model answer, correct/incorrect, Pass/Retry) dans 14 fichiers
- [x] Supprimer 23 checkpoint blocks redondants dans chapitres ayant déjà un bucket_sort
- [x] Corriger le bug Screen 6 (Extended Thinking affiché comme free_text au lieu de bucket_sort)

## Bug: Tableau mal organisé + contenu qui suit
- [x] Première colonne du tableau trop étroite (mots coupés: "In-cont ext mem ory") - fix: whitespace-nowrap + min-width sur col 1
- [x] Contenu après le tableau collé sans espacement (4ème ligne manquante) - fix: détection punct+uppercase en plus de camelCase

## Bug: Vidéos YouTube non lisibles dans la page
- [x] La vidéo affiche un écran noir au lieu du player YouTube embed - fix: ajout https://www.youtube.com au script-src CSP
- [x] L'utilisateur est obligé de cliquer "Watch on YouTube" pour voir la vidéo - fix: le YouTube IFrame API peut maintenant se charger

## Bug: Exercice non valide (model answer affiché comme prompt)
- [x] Exercice ex_006 orphelin (chapter_06 inexistant) affichait la correction comme question
- [x] Suppression de 55 exercices orphelins dans 9 fichiers de cours (chapterId inexistant)
- [x] Nettoyage du texte 'Reveal model answers' dans les blocs de contenu

## Import cours DataCamp n8n dans catégorie BI
- [x] Upload des 8 vidéos MP4 + 3 slides PDF + 1 image via manus-upload-file
- [x] Générer le fichier JSON du cours (3 chapitres, 32 activités)
- [x] Intégrer les 10 vidéos avec transcripts FR segmentés
- [x] Transformer les 17 CloudExercise en TP autonomes avec préparation environnement n8n
- [x] Construire les 3 exercices DragAndDrop interactifs
- [x] Construire les 2 QCM interactifs avec corrections masquées
- [x] Enregistrer le cours dans l'index certifications (catégorie BI)
- [x] Tester le rendu et déployer
- [x] Rapport de vérification avec compteurs

## Correction TP n8n — Audit apprenant
- [x] Étapes TP vides (affichent "1 2 3 4" sans texte) → fix: lecture du champ instructions_text des steps
- [x] Critères d'évaluation bruts (<exercise_objective>, <grading_rules>, PASS/FAIL) visibles → fix: extractLearnerObjectives() parse required_elements en bullets propres
- [x] Appliquer à tous les 17 TP/labs → fix global via composant CloudExerciseBlock
- [x] Re-auditer production activité 2/9 → vérifié OK (4 steps détaillés, 2 bullets propres, aucun tag XML visible)

## Audit médias production — 2 vidéos sans MP4
- [x] Upload 2 MP3 (ch03_ex08 + ch03_ex12) via manus-upload-file --webdev
- [x] Mettre à jour le JSON avec audioUrl pour ces 2 blocs
- [x] Adapter le composant vidéo pour afficher lecteur audio + transcript + slides quand audioUrl existe et mp4Url absent
- [x] Audit HTTP de tous les liens /manus-storage (8 MP4 + 2 MP3 + 3 PDF + 1 PNG = 14 liens) → 14/14 HTTP 200
- [x] Tableau d'audit dans le rapport final

## Correction compteurs fiche cours n8n
- [x] Remplacer "22 exercices" par "32 activités" dans trainingIndex.json
- [x] Ajouter breakdown visible sur la fiche: 10 vidéos · 17 TP pratiques · 3 tris interactifs · 2 QCM · 3 téléchargements
- [x] Carte cours: 3 chapitres · 32 activités · 10 vidéos · 3 téléchargements
- [x] Vérifier la fiche publique après publication → confirmé OK: 32 activités + breakdown + carte cours correct

## Correction player vidéo/audio + PDF + UI ✓ Vue
- [x] Diagnostiquer ERR_BLOCKED_BY_CLIENT sur /manus-storage → cause: platform edge intercepte /manus-storage/ et redirige vers CloudFront signé, extensions bloquent
- [x] Corriger le proxy storage pour supporter Range requests + Content-Type exact → /api/assets/ avec HTTP 206, Accept-Ranges: bytes, MIME par extension
- [x] Corriger le markup vidéo (<video controls preload="metadata" playsinline><source src type="video/mp4">)
- [x] Corriger le markup audio (<audio controls preload="metadata"><source src type="audio/mpeg">)
- [x] Corriger les liens PDF (ouverture/téléchargement via /api/assets/ sans ERR_BLOCKED_BY_CLIENT)
- [x] Corriger l'artefact UI "✓ Vue" → utilise t() pour afficher proprement
- [x] Tester la lecture réelle en production → 14/14 HTTP 200, Range 206 OK
- [x] Rapport de vérification technique complet

## Lecteur hybride Projector (slides synchronisées)
- [x] Injecter slideDeckData (slides + timings) dans le JSON du cours pour les 8 vidéos MP4
- [x] Créer le composant ProjectorPlayer (audio + panneau slide synchronisé)
- [x] Intégrer dans LessonViewer (détection projectorSlides → lecteur hybride)
- [x] Slide 1 visible à t=0 (titre + instructeur + technologie n8n)
- [x] Navigation slides (dots + boutons prev/next)
- [x] Barre de progression + seek
- [x] Conserver transcripts + Slides PDF + progression

## Correction images Projector cassées (suffixe DataCamp =XX)
- [x] Nettoyer 28 suffixes de sizing dans le JSON (regex /\s+=\d+$/)
- [x] Ajouter cleanImageUrl() défensif dans ProjectorPlayer
- [x] Ajouter loading="lazy" decoding="async" sur toutes les images
- [x] Vérifier 36/36 images HTTP 200 (avec -L pour redirections)
- [x] Déployer en production

## Défauts bloquants parcours n8n (audit apprenant)
- [x] Gate Suivant pour cloud_exercise (TP) : bouton désactivé tant que non validé
- [x] Gate Suivant pour bucket_sort et single_choice : déjà implémenté
- [x] validatedChapter avance systématiquement quand Next est cliqué (tous gates passés)
- [x] Carte catalogue : affiche chapitres + activités + vidéos + téléchargements quand breakdown existe
- [x] TP collapsible : instructions/préparation dans un details/summary pliable
- [x] Cohérence progression : bouton Leçon terminée gatéé appelle onComplete -> markLessonComplete -> avance auto

## Bibliothèque de blocs v2 (consolidation LMS)
- [x] Créer le registre centralisé BlockRegistry (shared/blockRegistry.ts) — 25 types documentés
- [x] Implémenter CalloutBlock (encadrés info/tip/warning/danger/success)
- [x] Implémenter MatchingBlock (association par glisser-déposer)
- [x] Implémenter FillBlankBlock (texte à trous avec validation)
- [x] Implémenter TerminalSimBlock (simulation de terminal CLI multi-étapes)
- [x] Implémenter CodeReplBlock (éditeur de code interactif Python/JS/TS/SQL)
- [x] Implémenter OrderingBlock (remise en ordre par drag-and-drop)
- [x] Implémenter AiEvaluationBlock (évaluation IA des réponses libres via LLM)
- [x] Implémenter MultiChoiceBlock (QCM choix multiples avec feedback)
- [x] Intégrer les 8 nouveaux blocs dans le switch case de LessonViewer
- [x] Ajouter la procédure evaluateAnswer (backend LLM Claude Sonnet)
- [x] Créer le composant BlockLibrary (éditeur admin visuel avec palette catégorisée)
- [x] Intégrer BlockLibrary dans AdminContentManager (mode edit remplace JSON brut)
- [x] Vérifier la rétrocompatibilité avec les 80+ cours existants

## Correction compteur de chapitre dans la progression
- [x] Corriger le compteur de chapitre courant pour éviter les valeurs hors borne (ex. 7/6 au lieu de 1/6)
- [x] Vérifier le calcul dans la sidebar et la barre de progression du cours concerné

## Correction e-mail d’invitation
- [x] Corriger l’affichage du bouton « Accepter l’invitation » avec un HTML compatible clients e-mail
- [x] Vérifier la visibilité et le lien de secours du CTA dans le modèle HTML et via un test unitaire dédié

## Pilote éditeur de cours — n8n
- [x] Capturer les références visuelles avant modification du cours et de son éditeur
- [x] Cartographier les blocs, médias et checkpoints du cours pilote de manière rétrocompatible
- [x] Ajouter la bibliothèque médias au mode visuel de l’éditeur
- [x] Ajouter le mode avancé d’édition structurée avec validation et aperçu
- [x] Créer l’interface spécifique aux checkpoints et à la banque de questions pilote
- [x] Tester l’éditeur et le rendu apprenant sans régression
- [x] Capturer et comparer les références visuelles après modification sur desktop et mobile

## Régressions bloquantes de l’éditeur de contenu
- [x] Corriger le changement infini à l’ouverture du cours dans l’éditeur
- [x] Rétablir les actions visibles d’édition sur les blocs existants
- [x] Corriger le mode consultation et unifier ses actions avec le mode édition
- [x] Vérifier de bout en bout l’ouverture, la consultation, l’édition et la sauvegarde d’un cours

## WYSIWYG et qualité typographique des contenus texte
- [x] Auditer les blocs de contenu texte français et anglais pour identifier les formats bruts
- [x] Remplacer l’éditeur Markdown minimal par un véritable WYSIWYG structuré et sûr
- [x] Restaurer la hiérarchie de titres, emphases, listes et retours à la ligne sans modifier le sens
- [x] Vérifier les rendus apprenant et administrateur sur un échantillon bilingue représentatif

## Correctifs bloquants WYSIWYG et n8n
- [x] Corriger les commandes de listes numérotées et à puces dans l’éditeur de contenu texte
- [x] Ajouter un chargement visible, une reprise et une erreur récupérable au cours n8n
- [x] Vérifier la réactivité du chargement vidéo et des données du cours n8n

## Édition visuelle des checkpoints et modèles de blocs
- [x] Remplacer l’entrée ID des checkpoints par une interface de questions et critères visuels
- [x] Auditer les schémas de formulaires de tous les types de blocs
- [x] Corriger les formulaires qui exposent des champs techniques sans interface métier
- [x] Vérifier visuellement un échantillon représentatif de chaque famille de blocs

## Bibliothèque médias et visual designer
- [x] Inventorier les PDF, images, vidéos YouTube et médias locaux utilisés par les cours
- [x] Repeupler la bibliothèque médias avec les actifs existants et leurs métadonnées
- [x] Créer une page indépendante de gestion des médias avec recherche, filtres et usages
- [x] Déplacer le sélecteur médias dans les modales de création et d’édition de blocs
- [x] Mettre à jour les références de cours de manière contrôlée lors du remplacement d’un média
- [x] Protéger les suppressions de médias utilisés et vérifier les rendus sans régression

## Audit correctif de la gestion de contenu
- [x] Reproduire et corriger les erreurs 404 des aperçus de PDF et autres médias
- [x] Vérifier l’insertion effective d’un média existant dans chaque type de bloc média
- [x] Auditer les flux de création, édition, consultation, sauvegarde et suppression
- [x] Ajouter des états vides, erreurs et actions de reprise aux flux qui en manquent
- [x] Vérifier visuellement les parcours admin et apprenant après correction

## Relation bibliothèque médias et visual designer
- [x] Afficher les usages précis de chaque média avec accès direct au cours et bloc concernés
- [x] Proposer depuis la bibliothèque l’insertion dans un bloc existant ou la création d’un bloc média
- [x] Proposer depuis l’éditeur le bon type de bloc à créer selon le média sélectionné
- [x] Tester les parcours complets de liaison média, création de bloc et remplacement d’usage

## Logs et suivi détaillé des apprenants
- [x] Diagnostiquer pourquoi les journaux de la plateforme restent vides
- [x] Instrumenter les événements administratifs et pédagogiques essentiels avec persistance
- [x] Enregistrer les temps de présence et les résultats de première tentative par exercice
- [x] Enrichir le suivi apprenant par chapitre, exercice, temps et taux de réussite initiale
- [x] Ajouter des filtres, détails et vues visuelles aux logs et au suivi administrateur

## Reporting graphique des apprenants
- [x] Définir les indicateurs de performance, sérieux, implication et évolution calculables
- [x] Créer les agrégations réelles de reporting côté serveur
- [x] Ajouter les graphiques de progression, implication, réussite initiale et tendance dans l’administration
- [x] Ajouter filtres de période, cours et statut, avec état de données insuffisantes
- [x] Vérifier les calculs et le rendu des reportings graphiques

## Recommandations vidéo de fin de module administrables
- [x] Auditer les recommandations vidéo actuellement codées en dur et leur couverture par module
- [x] Définir un modèle éditable dans l’administration, compatible avec les bibliothèques de médias existantes
- [x] Ajouter l’édition, l’ajout, la réorganisation et la suppression des recommandations dans le gestionnaire de contenu
- [x] Généraliser le rendu des recommandations à tous les modules, avec état vide explicite
- [x] Vérifier les parcours administrateur et apprenant, puis publier

## Navigation et regroupements de l’administration
- [x] Auditer les menus administratifs, leurs redondances et leurs dépendances fonctionnelles
- [x] Définir des groupes de navigation et un ordre adaptés aux parcours administratifs prioritaires
- [x] Implémenter une navigation administrative persistante, structurée et cohérente sur toutes les pages concernées
- [x] Vérifier les liens, les états actifs et les parcours administrateur, puis publier

## Édition contextuelle depuis le parcours apprenant
- [x] Identifier les paramètres de leçon, chapitre et bloc disponibles dans le lecteur de cours
- [x] Ajouter une action réservée aux administrateurs pour ouvrir l’élément affiché dans l’éditeur
- [x] Transmettre la destination précise à l’éditeur dans un nouvel onglet
- [x] Vérifier les droits, le rendu et la navigation directe, puis publier

## Éditeur de recommandations et d’exercices
- [x] Afficher les vidéos recommandées une seule fois au niveau de la leçon dans l’éditeur
- [x] Supprimer leur répétition visuelle dans les chapitres et préserver leur rendu après la dernière étape apprenante
- [x] Séparer le contenu pédagogique des consignes, réponses et métadonnées d’exercice dans l’éditeur
- [x] Ajouter des formulaires structurés pour modifier les exercices sans texte agrégé ambigu
- [x] Vérifier les parcours d’édition et le rendu apprenant, puis publier

## Composants standards pour l’édition des exercices
- [x] Auditer les composants d’exercice et les schémas de blocs déjà disponibles
- [x] Associer chaque type d’exercice de cours à un éditeur visuel standard
- [x] Compléter les éditeurs manquants et remplacer les cartes génériques d’exercice
- [x] Vérifier les sauvegardes et les aperçus apprenants de tous les types d’exercice couverts
- [x] Dresser la liste des composants standards mis à jour et des nouveaux composants créés

## Alignement global lecteur apprenant et éditeur
- [x] Scanner tous les cours afin de cartographier les interactions et leur source canonique
- [x] Mettre en place un résolveur unique des éléments éditables par leçon et chapitre
- [x] Présenter dans l’éditeur uniquement les interactions effectivement rendues par le lecteur
- [x] Adapter les sauvegardes à la source de données réellement consommée par le lecteur
- [x] Ajouter les contrôles automatisés de cohérence, vérifier un échantillon multi-types et publier

## Catalogue pédagogique totalement administrable
- [x] Auditer les types de contenu existants et leur couverture par la bibliothèque de blocs
- [x] Ajouter les adaptateurs ou blocs manquants sans modifier le rendu apprenant existant
- [x] Ajouter la création, suppression sécurisée et réorganisation des leçons dans l’éditeur de cours
- [x] Rendre éditables les métadonnées de cours, certifications, catégories, tags et compteurs
- [x] Ajouter les contrôles de cohérence de catalogue, valider les parcours admin et publier

## Évaluations et écrans administrables
- [x] Auditer les QCM de validation, checkpoints et règles de passage utilisés par chaque écran
- [x] Ajouter la création, suppression et réorganisation des QCM et checkpoints au niveau de l’écran
- [x] Ajouter l’édition des règles de passage : score minimal, tirage, mélange et obligation de validation
- [x] Ajouter la création, suppression et réorganisation sécurisées des chapitres dans chaque leçon
- [x] Vérifier les règles dans le lecteur apprenant, tester les sauvegardes et publier

## Réorganisation et aperçu des évaluations
- [x] Ajouter le glisser-déposer aux questions de quiz et checkpoint
- [x] Ajouter le glisser-déposer aux écrans dans chaque leçon
- [x] Ajouter un aperçu de score et de règles avant la sauvegarde/publication
- [x] Vérifier les ordres sauvegardés et les parcours apprenants, puis publier

## Badges de compétences et certifications apprenantes
- [x] Auditer les données de progression, les succès d’évaluation et les flux e-mail existants
- [x] Définir les critères d’attribution des badges et certificats sans attribuer de réussite fictive
- [x] Ajouter la persistance, les vues apprenantes et l’écran de félicitations
- [x] Générer un diplôme PDF officiel Neopolis Development et envoyer l’e-mail de réussite
- [x] Tester les attributions, les documents et les notifications, puis publier

## Attribution rétroactive des acquis
- [x] Auditer les progrès et réussites historiques éligibles aux badges et diplômes
- [x] Ajouter une reprise idempotente fondée sur les critères actuels d’attribution
- [x] Attribuer les acquis rétrospectifs et envoyer les notifications correspondantes
- [x] Vérifier les résultats, les absences de doublons et publier le mécanisme

## Visibilité des badges et diplômes dans les profils
- [x] Auditer les écrans de profil apprenant et la fiche détaillée administrateur
- [x] Ajouter les données d’acquis nécessaires aux vues de profil sécurisées
- [x] Afficher les badges et diplômes avec leur statut et accès aux documents dans les deux profils
- [x] Vérifier les droits d’accès et le rendu, puis publier

## Compétences graduées et contributions administrables
- [x] Auditer les succès pédagogiques pouvant alimenter les compétences
- [x] Définir le référentiel de compétences et niveaux 1 à 100
- [x] Ajouter les règles administrables de contribution par contenu, évaluation, badge et diplôme
- [x] Persister les niveaux et la traçabilité détaillée des points accordés
- [x] Afficher les compétences dans les profils apprenants et administratifs
- [x] Vérifier les attributions et publier le référentiel

## Rangs, parcours et classements de compétences
- [x] Définir les seuils Bronze, Argent et Or visibles pour chaque niveau
- [x] Créer des parcours recommandés de montée en compétence à partir du catalogue réel
- [x] Afficher les rangs et recommandations dans le profil apprenant
- [x] Ajouter classements, filtres et tris par compétence dans l’administration
- [x] Vérifier les calculs, les profils et les classements, puis publier

## Ajustement du seuil de rang Bronze
- [x] Faire commencer le rang Bronze à 10 points et ajuster les tests
- [x] Vérifier le rendu des rangs puis publier

## Gamification et objectifs de progression
- [x] Ajouter le rang Émergent à partir de 5 points et rendre rangs, couleurs et icônes administrables
- [x] Définir et calculer des objectifs hebdomadaires à partir des contributions vérifiées
- [x] Ajouter les vues apprenantes de progression, objectifs et récompenses internes
- [x] Ajouter les contrôles administrateur de gamification et les animations respectueuses des préférences utilisateur
- [x] Vérifier les calculs, messages et accès, puis publier

## Compteurs dynamiques des certifications
- [x] Auditer les compteurs déclaratifs et les sources de contenu de chaque certification
- [x] Créer un calcul canonique des cours, leçons, exercices, vidéos et téléchargements
- [x] Afficher les compteurs calculés comme indicateurs non éditables dans Catalogue, certifications et catégories
- [x] Vérifier les compteurs publics et administratifs puis publier

## Contributions de compétences pilotées par tags
- [x] Auditer les règles de contribution et supprimer les sources non évaluatives
- [x] Définir des tags de compétences administrables pour les leçons et les évaluations
- [x] N’accorder des points que pour exercices, quiz, checkpoints, badges et certifications tagués
- [x] Recalculer les contributions historiques selon les tags explicites
- [x] Vérifier les niveaux et publier les règles ciblées

## Navigation admin et liens partageables
- [x] Corriger les clics du menu admin pour ouvrir immédiatement la vue ciblée sans rafraîchissement
- [x] Ajouter des URLs adressables pour les profils apprenants dans l’administration
- [x] Ajouter des URLs adressables pour l’ouverture ciblée des leçons et écrans dans l’éditeur
- [x] Tester les liens directs, le rechargement et la navigation historique navigateur
- [x] Étendre la synchronisation URL à tous les onglets, détails et vues administratives
- [x] Étendre la synchronisation URL à la navigation apprenant, aux certifications, cours, leçons et écrans
- [x] Vérifier les liens partageables, les rechargements et l’historique sur l’ensemble des parcours

## Invitations groupées
- [x] Rétablir la saisie de plusieurs e-mails pour les invitations directes séparés par point-virgule ou retour à la ligne
- [x] Valider et dédupliquer les adresses avant l’envoi groupé
- [x] Afficher un bilan clair des invitations envoyées ou refusées par adresse
- [x] Tester le flux groupé sans régression sur l’invitation individuelle

## Tableaux de données administratifs
- [x] Auditer toutes les listes administratives et leurs possibilités actuelles de recherche, tri et pagination
- [x] Normaliser en priorité les invitations directes avec pagination, recherche, tri et chargement serveur
- [x] Étendre les mêmes composants et conventions aux autres listes administratives prioritaires
- [x] Synchroniser les paramètres de tableau avec l’URL et tester les états de chargement, vides et erreur

## Communications de masse ciblées
- [x] Auditer le module de communications et les données de segmentation disponibles
- [x] Ajouter les segments : tous, invités, invités inscrits et apprenants inactifs ou ayant commencé
- [x] Ajouter les segments selon diplôme obtenu, compétence acquise et seuil de niveau
- [x] Afficher un aperçu vérifiable du nombre de destinataires avant la confirmation d’envoi
- [x] Tester les combinaisons de filtres sans déclencher de communication non confirmée

## Correctifs de crashs client
- [x] Diagnostiquer l’erreur MIME JavaScript détectée sur la page de candidature
- [x] Corriger l’erreur de filtrage détectée sur les candidats sélectionnés
- [x] Analyser les trois incidents Sentry récents et traiter leurs causes applicatives
- [x] Tester les pages affectées en navigateur et confirmer l’absence de nouveau crash

## Constructeur avancé de segments de communication
- [x] Auditer les données de progression, de cours, de compétences et de destinataires sélectionnables
- [x] Ajouter des critères combinables par cours, statut entamé/terminé et nombre de jours
- [x] Ajouter des critères de compétence par niveau et performance
- [x] Ajouter une sélection manuelle des destinataires avec recherche et dédoublonnage
- [x] Afficher la logique active, le nombre et un aperçu des destinataires avant l’envoi
- [x] Tester les intersections de critères sans déclencher de communication non confirmée

## Éditeur riche de communiqué
- [x] Auditer les composants WYSIWYG existants et le traitement sécurisé du HTML d’e-mail
- [x] Remplacer la saisie brute par un éditeur riche compatible avec le collage mis en forme
- [x] Préserver une mise en page e-mail sûre : titres, paragraphes, listes, liens et emphases
- [x] Tester le collage riche, la prévisualisation et le contenu transmis au brouillon

## Segments logiques et communications programmées
- [x] Ajouter des opérateurs ET/OU entre les critères de ciblage avancés
- [x] Sauvegarder, renommer, appliquer et supprimer des segments de destinataires réutilisables
- [x] Prévisualiser et valider explicitement une communication avant sa programmation
- [x] Programmer un brouillon validé à une date donnée, avec annulation avant exécution
- [x] Exécuter l’envoi différé de manière authentifiée, idempotente et traçable
- [x] Tester les règles logiques, les segments sauvegardés et la programmation sans e-mail non confirmé

## Communiqués importants et historique apprenant
- [x] Auditer les communications, notifications et l’intégration aux parcours apprenants
- [x] Ajouter une case Important aux brouillons et diffuser les communications à tous les nouveaux comptes lorsque ciblées « tout le monde »
- [x] Afficher les communiqués importants en lightbox jusqu’à accusé de réception
- [x] Créer une boîte de réception de communiqués accessible dans l’interface apprenant
- [x] Conserver l’état lu/accusé de réception par apprenant sans empêcher l’historique
- [x] Tester les nouveaux comptes, les accusés de réception et les communications non importantes

## Expéditeur des notifications et vidéo de candidature
- [x] Auditer les e-mails applicatifs encore envoyés par Manus et leur mécanisme d’expédition
- [x] Configurer les notifications applicatives pour utiliser exclusivement l’expéditeur Neopolis validé
- [x] Vérifier la présence de l’URL vidéo dans le détail de candidature côté API et administration
- [x] Corriger l’affichage et la lecture de la vidéo de candidature dans la fiche détaillée
- [x] Tester les parcours e-mail et vidéo sans déclencher d’envoi non confirmé

## Intégrité pédagogique et revue de suspicion
- [x] Auditer les données de progression, de temps, de tentatives et d’évaluations disponibles
- [x] Définir des signaux explicables de comportement atypique et leurs seuils de revue
- [x] Ajouter un tag de suspicion d’intégrité, une justification et un statut de revue humaine
- [x] Afficher un tableau admin d’analyse des signaux et des éléments de preuve
- [x] Prévoir le blocage uniquement par action explicite d’un administrateur après revue
- [x] Ajouter des contrôles de compréhension transparents plutôt que des pièges cachés
- [x] Tester le scoring, la traçabilité et les garde-fous de non-blocage automatique

## Propositions administratives et trajectoire de progression
- [x] Permettre aux administrateurs de proposer des ajustements d’objectifs depuis la fiche apprenant
- [x] Enregistrer la proposition, sa justification et sa date de création
- [x] Calculer une trajectoire prévue selon les objectifs, échéances et niveaux actuels
- [x] Afficher un graphique apprenant comparant avancement réel et prévu
- [x] Tester les autorisations administratives, le calcul et le rendu du graphique

## Parcours d’orientation et recommandations de formation
- [x] Auditer le référentiel de compétences, le catalogue, les certifications et les données de progression
- [x] Enregistrer les objectifs de compétences, niveaux cibles et projets de certification des apprenants
- [x] Créer un diagnostic QCM court aligné sur les compétences sélectionnées
- [x] Générer un parcours ordonné de cours et certifications adapté aux écarts de niveaux
- [x] Déclencher l’orientation pour les nouveaux comptes et rappeler les anciens apprenants par communiqué
- [x] Afficher les objectifs, le diagnostic, les recommandations et la progression aux apprenants et administrateurs
- [x] Tester les cas débutant, intermédiaire et avancé sans envoi non confirmé

## Ajustement des objectifs et suivi des écarts
- [x] Permettre la modification des objectifs de compétences après le diagnostic
- [x] Enregistrer une échéance cible pour chaque certification visée
- [x] Afficher le niveau actuel, le niveau cible et l’écart dans le suivi administrateur
- [x] Tester les modifications, échéances et comparatifs en vue apprenant et admin

## Libellés apprenants dans le reporting
- [x] Identifier l’enregistrement et le repli qui affichent un identifiant interne au lieu d’un nom
- [x] Corriger le libellé de secours avec l’adresse e-mail dans le reporting et les classements
- [x] Vérifier l’affichage mobile et ajouter un test contre la régression

## Lisibilité des noms dans les classements
- [x] Identifier les événements dont le profil utilisateur ne remonte pas dans le reporting
- [x] Afficher le nom en priorité, puis l’e-mail uniquement si le nom est absent
- [x] Remplacer le dernier recours par un libellé neutre et investigable
- [x] Vérifier les classements mobiles avec des profils complets et incomplets

## Séparation apprentissage et administration dans le reporting
- [x] Auditer les sources incluses dans les indicateurs d’apprentissage
- [x] Inclure un administrateur comme apprenant lorsque ses événements sont pédagogiques
- [x] Exclure explicitement toute activité administrative des compteurs et classements d’apprentissage
- [x] Tester la cohérence des profils mixtes sur le tableau de bord et mobile

## Récupération de compte, navigation et sécurité
- [x] Auditer le flux de mot de passe oublié, ses liens, ses tokens et ses e-mails
- [x] Vérifier la délivrabilité du lien de récupération vers le bon compte sans révéler l’existence d’un e-mail
- [x] Revoir l’arborescence des menus et promouvoir les communications à la navigation principale appropriée
- [x] Réaliser une revue de sécurité défensive : authentification, autorisations, sessions, validation, en-têtes et exposition des données
- [x] Corriger les protections prioritaires identifiées et les couvrir par tests
- [x] Tester les parcours de récupération et de navigation sans envoi ou action destructive non confirmée
- [x] Migrer Recharts v2 vers v3 afin de supprimer l’alerte de dépendance élevée restante

## Score global et tris du suivi apprenants
- [x] Auditer le contrat de données et les colonnes du tableau de suivi
- [x] Ajouter le score global des contributions pédagogiques à chaque apprenant
- [x] Rendre les en-têtes de colonne triables avec indicateur visuel de sens
- [x] Synchroniser le tri avec le serveur et vérifier le rendu mobile

## Formule du score global de compétences
- [x] Auditer l’agrégation des contributions de compétences graduées
- [x] Sommer les points de compétences graduées pour chaque apprenant
- [x] Préserver le tri serveur sur le score global corrigé
- [x] Vérifier les résultats sur les données réelles et les comptes sans contribution

## Formule du score global de performance
- [x] Piste abandonnée : le score demandé est la somme des compétences graduées, non les performances d’évaluation

## Propositions administratives et trajectoire de progression
- [x] Permettre aux administrateurs de proposer des ajustements d’objectifs depuis la fiche apprenant
- [x] Enregistrer la proposition, sa justification et sa date de création
- [x] Calculer une trajectoire prévue selon les objectifs, échéances et niveaux actuels
- [x] Afficher un graphique apprenant comparant avancement réel et prévu
- [x] Tester les autorisations administratives, le calcul et le rendu du graphique

## Navigation des nouveaux apprenants et orientation
- [x] Auditer la redirection automatique qui annule les clics sur les onglets
- [x] Conserver l’accès aux onglets apprenants pendant l’orientation incomplète
- [x] Afficher un rappel clair et une action prioritaire vers le diagnostic d’orientation
- [x] Tester les clics, le retour navigateur et le premier accès aux cours
## Corrections de l’audit des certifications Anthropic
- [x] Restaurer les titres officiels dégradés dans le catalogue et les métadonnées Developer / Architect Professional
- [x] Remplacer l’exercice AI Fluency erroné par la réflexion officielle, sans HTML libre, avec blocs `callout`, `content`, `checkpoint` et `download`
- [x] Distinguer visuellement les tutoriels complémentaires Neopolis du contenu officiel Anthropic
- [x] Migrer les références média locales des trois parcours vers le proxy `/api/assets/` et vérifier leur disponibilité
- [x] Ajouter un audit reproductible, des tests de non-régression et un rapport de contrôle visuel avant publication
## Régression de navigation lors de l’orientation incomplète
- [x] Reproduire le blocage des onglets pour un compte récent avec diagnostic d’orientation non finalisé
- [x] Supprimer toute redirection silencieuse qui annule l’intention de navigation de l’apprenant
- [x] Afficher une priorité d’orientation claire sans empêcher l’accès aux autres espaces apprenants
- [x] Couvrir l’accès aux onglets avec orientation incomplète par des tests unitaires
- [x] Vérifier la navigation authentifiée sur le domaine de production après publication
## Analyse des crashes et du monitoring
- [x] Recueillir et classifier les erreurs récentes client, serveur et performance dans le monitoring
- [x] Reproduire les incidents de priorité élevée et identifier leurs causes racines
- [x] Corriger les défauts reproductibles avec des tests de non-régression
- [x] Vérifier la disparition des erreurs pertinentes après publication et documenter les incidents non actionnables
## Dérogation administrateur au verrouillage séquentiel
- [x] Identifier les gardes client et serveur qui bloquent les cours séquentiels
- [x] Autoriser les administrateurs à ouvrir tout cours tout en préservant le verrouillage des apprenants
- [x] Ajouter des tests de séparation administrateur / apprenant et valider le parcours réel
## Triage complémentaire des derniers crashes Sentry
- [x] Recueillir les nouvelles issues et événements apparus après le dernier contrôle
- [x] Reproduire et corriger toute cause encore active ou régressée
- [x] Vérifier l’état Sentry en production et documenter le résultat
## Analyse du monitoring interne de la plateforme
- [x] Collecter les erreurs récentes des journaux client, serveur et réseau internes
- [x] Qualifier les défauts actifs, les reproduire et corriger les causes applicatives
- [x] Vérifier les journaux après correction et consigner le bilan interne
## Crash React du cours IA pour les nuls
- [x] Reproduire l’erreur `insertBefore` sur le lecteur du cours et localiser le bloc en cause
- [x] Corriger la cause de mutation DOM instable avec un test de non-régression
- [x] Vérifier la route en production et l’absence de nouveau crash dans les logs internes
## Régression de bundle et visibilité Sentry
- [x] Identifier pourquoi le bundle historique `index-gE23kOSs.js` reste chargé par certains apprenants
- [x] Vérifier et corriger la configuration de remontée client Sentry en production
- [x] Ajouter une stratégie de récupération ou d’invalidation des bundles obsolètes
- [x] Reproduire le crash, confirmer sa remontée Sentry et valider le correctif en production
## Notification de mise à jour disponible
- [x] Détecter périodiquement une nouvelle version de la plateforme sans interrompre l’apprentissage
- [x] Afficher un bandeau clair aux apprenants avec une action de rafraîchissement contrôlé
- [x] Tester la détection, le report et le rechargement puis valider le mécanisme en production
## Renforcement des sessions utilisant un bundle obsolète
- [x] Analyser pourquoi les sessions chargées avant publication atteignent encore le lecteur avant l’alerte
- [x] Détecter une transition risquée et demander un rafraîchissement avant que le crash React ne se produise
- [x] Empêcher tout cache partagé de servir un document HTML qui référence un ancien bundle
- [x] Tester les cas de bundle historique et vérifier la protection en production
## Analyse des issues Sentry 929549 et 929548
- [x] Examiner les événements, versions et traces des deux issues récentes
- [x] Reproduire et corriger toute cause encore active
- [x] Valider la résolution sur la plateforme et documenter le bilan
## Vérification des diagnostics Orientation et objectifs
- [x] Contrôler le nombre d’orientations démarrées, complétées et incomplètes
- [x] Identifier un profil d’exemple avec orientation complétée si les données existent
- [x] Vérifier le rendu administrateur et corriger un écart d’affichage éventuel
## Communiqué d’orientation et parcours recommandé
- [x] Préparer un brouillon de communiqué important expliquant l’intérêt de compléter Orientation et objectifs
- [x] Garantir qu’aucun e-mail, lightbox ou notification n’est diffusé avant validation administrative
- [x] Afficher les recommandations issues du diagnostic terminé dans Parcours d’apprentissage recommandé
- [x] Afficher un état explicite avec valeur par défaut lorsque le diagnostic n’est pas terminé
- [x] Tester les parcours avec et sans diagnostic puis valider en production
## Édition des communications en brouillon
- [x] Auditer l’éditeur de communication et les contrats de destinataires existants
- [x] Ajouter une mise à jour serveur limitée aux communications en brouillon
- [x] Permettre la modification de l’objet, du contenu riche, de l’importance et des destinataires
- [x] Prévisualiser et tester l’édition du brouillon sans déclencher d’envoi
## Audit comparatif du cours n8n
- [x] Relever la structure, les activités et les modalités du cours source DataCamp
- [x] Vérifier les compteurs, les médias, les TP et les interactions du cours Neopolis
- [x] Comparer les écarts fonctionnels et visuels reproductibles
- [x] Corriger les écarts confirmés et valider le parcours en production
## Conformité d’intégration DataCamp du cours n8n
- [x] Vérifier l’usage exclusif des blocs standards Neopolis et la rétrocompatibilité des composants
- [x] Vérifier les tags et contributions de compétences liés aux activités n8n
- [x] Vérifier les médias et fichiers locaux, leurs liens et leur disponibilité en production
- [x] Vérifier que chaque TP est autonome, guidé, accompagné des prérequis et de ses ressources téléchargeables
- [x] Remplacer dans les TP les consignes restantes dépendantes de la VM DataCamp par des alternatives réalisables dans l’environnement apprenant
- [x] Préserver les extensions des fichiers VM dans les consignes adaptées aux environnements apprenants
## Inventaire et intégration des catalogues DataCamp
- [x] Inventorier les cours des catalogues technologies 54, 52, 25 et 53
- [x] Vérifier pour chaque cours le paquet, les médias ou le droit d’intégration disponible
- [x] Proposer un classement Neopolis, les tags de compétences et le lot d’import prioritaire
- [x] Importer uniquement les cours autorisés avec blocs standards, médias locaux et TP autonomes

## Import contrôlé des paquets DataCamp depuis Google Drive
- [x] Inventorier uniquement les ZIP complets présents dans les dossiers claude_anthropic, openai, gemini et n8n
- [x] Valider COURSE_MANIFEST.json, COMPLETENESS_REPORT.md, download_assets_manifest.json et MEDIA_VALIDATION_REPORT.json quand présents, ainsi que l’exclusion autorisée
- [x] Déterminer pour chaque média Drive la stratégie de lecture fiable : diffusion directe autorisée ou copie versionnée nécessaire
- [x] Transformer catalogue, cours, chapitres et activités dans l’ordre canonique avec les blocs interactifs Neopolis
- [x] Vérifier les compteurs, médias, PDF, progression séquentielle, réponses masquées et le responsive mobile avant publication
- [x] Ajouter un convertisseur réutilisable pour les schémas de manifestes DataCamp autorisés et un rapport d’audit par cours
- [x] Importer et auditer un lot pilote multi-catalogues avant les paquets DataCamp volumineux
- [x] Importer les paquets restants par lots contrôlés, avec validation des médias et compteurs après chaque lot
- [x] Générer et auditer le cours pilote « Introduction to Claude Models » : 3 chapitres, 29 activités, 10 vidéos, 19 exercices interactifs et 3 supports PDF locaux
- [x] Générer et auditer le cours « Gemini in Gmail » : 1 chapitre, 7 activités, 4 vidéos, 3 activités interactives et 1 support PDF local
- [x] Générer et auditer le cours « Gemini in Google Meet » : 1 chapitre, 10 activités, 5 vidéos, 5 activités interactives et 1 support PDF local
- [x] Générer et auditer le cours « Gemini in Google Sheets » : 1 chapitre, 7 activités, 4 vidéos, 3 activités interactives et 1 support PDF local
- [x] Générer et auditer le cours « Gemini in Google Docs » : 1 chapitre, 9 activités, 5 vidéos, 4 activités interactives et 1 support PDF local
- [x] Décoder les états préchargés DataCamp sans les exécuter afin de convertir exactement les activités OpenAI interactives
- [x] Générer et auditer le cours pilote « Introduction to Google Workspace with Gemini » : 1 chapitre, 7 activités, 3 vidéos, 4 activités interactives et 1 support PDF local
- [x] Générer et auditer le cours « Systèmes multimodaux avec l’API OpenAI » : 2 chapitres, 24 activités, 7 vidéos, 17 activités interactives et 2 supports PDF locaux
- [x] Générer et auditer le cours « Introduction aux embeddings avec l’API OpenAI » : 3 chapitres, 37 activités, 11 vidéos, 26 activités interactives et 3 supports téléchargeables locaux
- [x] Générer et auditer le cours « IA pratique avec Google Gemini et NotebookLM » : 4 chapitres, 48 activités, 15 vidéos, 33 activités interactives et 4 supports téléchargeables locaux
- [x] Générer et auditer le cours « Gemini dans Google Drive » : 2 chapitres, 15 activités, 7 vidéos, 8 activités interactives et 1 support téléchargeable local
- [x] Générer et auditer le cours « Gemini dans Google Slides » : 1 chapitre, 8 activités, 4 vidéos, 4 activités interactives et 1 support téléchargeable local
- [x] Générer et auditer le cours « Développer des systèmes d’IA avec l’API OpenAI » : 3 chapitres, 36 activités, 11 vidéos, 25 activités interactives et 3 supports téléchargeables locaux
- [x] Générer et auditer le cours « Utiliser l’API OpenAI Responses » : 3 chapitres, 34 activités, 11 vidéos, 19 activités interactives et 3 supports téléchargeables locaux
- [x] Générer et auditer le cours « Travailler avec l’API OpenAI » : 3 chapitres, 29 activités, 9 vidéos, 20 activités interactives et 3 supports téléchargeables locaux
- [x] Générer et auditer le cours « Prompt Engineering avec l’API OpenAI » : 4 chapitres, 55 activités, 15 vidéos, 40 activités interactives et 4 supports téléchargeables locaux
- [x] Générer et auditer le cours « Créer des workflows marketing avec n8n » : 3 chapitres, 23 activités, 8 vidéos, 15 TP autonomes et 3 supports téléchargeables locaux
- [x] Générer et auditer le cours « Automatisation de workflows intermédiaires avec n8n » : 4 chapitres, 40 activités, 13 vidéos, 27 TP autonomes et médias locaux validés
- [x] Générer et auditer le cours « Développement logiciel avec Claude Code » : 4 chapitres, 43 activités, 15 vidéos, 28 exercices interactifs et 4 supports téléchargeables locaux
- [x] Générer et auditer le cours « Claude 101 » : 4 chapitres, 20 activités, 2 vidéos, 17 activités interactives et 2 supports téléchargeables locaux
- [x] Générer et auditer le cours « Claude Code en action » : 4 chapitres, 31 activités, 9 vidéos, 22 exercices interactifs et médias locaux validés
- [x] Générer et auditer le cours « Sujets avancés sur le Model Context Protocol » : 2 chapitres, 32 activités, 10 vidéos, 22 activités interactives et 2 supports téléchargeables locaux
- [x] Générer et auditer le cours « Introduction aux sous-agents » : 2 chapitres, 12 activités, 4 vidéos, 8 activités interactives et 2 supports téléchargeables locaux
- [x] Générer et auditer le cours « Claude Code 101 » : 4 chapitres, 37 activités, 12 vidéos et 23 activités interactives avec médias locaux validés
- [x] Remplacer le contrôle des états préchargés du paquet OpenAI pilote par la lecture des seuls champs canoniques du manifeste
- [x] Convertir « Travailler avec l’API OpenAI » depuis les champs canoniques du manifeste alternatif, avec médias locaux et TP autonomes
- [x] Importer Gemini Drive à partir de ses médias déclarés disponibles, sans rendre bloquante une ressource visuelle optionnelle non exposée
- [x] Importer Gemini Slides à partir de ses médias déclarés disponibles, sans rendre bloquante une ressource visuelle optionnelle non exposée
- [x] Adapter et valider les formats `SingleProcessExercise`, `DragAndDropExercise` et `TabExercise` du paquet « Concevoir des systèmes d’IA avec l’API OpenAI »
- [x] Restaurer le mapping exact des médias locaux et des ressources de TP du cours « Travailler avec l’API OpenAI » avant publication
- [x] Adapter et valider les 20 exercices console et 6 tris interactifs du paquet « Software Development with Claude Code »
- [x] Utiliser le cours n8n DataCamp existant comme référence fonctionnelle et de structure pour les conversions suivantes
- [x] Créer une catégorie distincte pour les parcours de préparation aux certifications Anthropic officielles
- [x] Ajouter un tag visible et une mention explicite de préparation aux certifications Anthropic officielles dans leurs descriptions
- [x] Vérifier que chaque cours DataCamp importé porte des tags de compétences et des règles de contribution administrables cohérentes
- [x] Vérifier en production les médias locaux téléversés pour chaque cours DataCamp avant publication
- [x] Vérifier que chaque TP DataCamp est autonome, présente ses prérequis, sa préparation d’environnement et ses ressources téléchargeables
- [x] Afficher les activités totales DataCamp comme compteur principal sans confondre les exercices interactifs et les écrans du cours
- [x] Diagnostiquer les causes du FCP/LCP mobile de la page d’accueil et optimiser le rendu critique sans dégrader l’accessibilité
- [x] Réviser l’audit DataCamp pour utiliser uniquement COURSE_MANIFEST, COMPLETENESS_REPORT, download_assets_manifest et MEDIA_VALIDATION_REPORT quand présents
- [x] Importer les 6 ZIP OpenAI conventionnels, les 8 ZIP Gemini conventionnels, les 3 ZIP n8n et les 8 ZIP Claude Anthropic autorisés
- [x] Écarter uniquement Building Claude Cowork Plugins et produire des preuves exactes pour tout autre blocage réel
- [x] Produire le tableau final par catalogue avec chapitres, leçons, exercices, vidéos, supports et statut QA
## Régressions brouillon et progression n8n
- [x] Reproduire et corriger le contenu absent à l’ouverture d’un brouillon de communication
- [x] Reproduire et corriger le passage bloqué entre les chapitres 2 et 3 du cours n8n
- [x] Corriger le pourcentage de progression affiché à 100 % avant la fin réelle du cours
- [x] Ajouter des tests et vérifier les deux parcours en production
## Déploiement du logo officiel Neopolis Akademy
- [x] Inventorier tous les logos, icônes et références de marque visibles de la plateforme
- [x] Stocker le logo SVG officiel dans les ressources web persistantes et le référencer via son URL de production
- [x] Remplacer les logos alternatifs dans les pages publiques, apprenantes, administratives et les modèles de document
- [x] Vérifier visuellement les principaux espaces après remplacement

## Partage social, SEO initial et favicon
- [x] Auditer les métadonnées HTML initiales et le routage public pour les crawlers
- [x] Préparer et publier une image Open Graph officielle à partir du logo fourni
- [x] Configurer les titres, descriptions, canonical, Open Graph et Twitter Cards côté serveur pour les pages publiques
- [x] Générer et configurer les favicons et icônes mobiles à partir du logo fourni
- [x] Ajouter des tests et vérifier les métadonnées ainsi que les assets publics sur le domaine de production

## Optimisation mesurable PageSpeed / Lighthouse
- [x] Établir une référence Google PageSpeed Insights et Lighthouse sur mobile et ordinateur, avec les métriques Core Web Vitals et tous les diagnostics
- [x] Identifier précisément les causes dans le code : LCP, images, bundles JavaScript, CSS, polices, scripts tiers, CLS et défauts d’accessibilité
- [x] Appliquer les optimisations de ressources, de chargement et de rendu sans supprimer de fonctionnalité, de contenu ni modifier la charte graphique
- [x] Répéter les mesures mobile et ordinateur, corriger les écarts restants et comparer les résultats à la référence
- [x] Vérifier les parcours publics et critiques, l’accessibilité, le responsive, le SEO/social, les erreurs console et publier le bilan mesurable

## Recherche intelligente de formation
- [x] Auditer le catalogue, les fichiers de cours, les métadonnées et les règles d’accès réutilisables pour la recherche
- [x] Définir un index pertinent : certifications, cours, leçons, chapitres, compétences, tags et extraits de contenu
- [x] Ajouter une recherche rapide avec tolérance aux accents, correspondances partielles, classement par pertinence et filtres utiles
- [x] Intégrer une interface accessible de recherche et de navigation directe vers les contenus autorisés
- [x] Ajouter des tests de pertinence, d’accès et de navigation ; vérifier le rendu puis publier

## Correctifs Agentic Browsing et performance mobile
- [x] Reproduire et corriger la progression Agentic Browsing bloquée à 2/3
- [x] Relever les audits de la mesure mobile publiée à 74 % et identifier les causes restantes
- [x] Corriger les freins confirmés sans retirer de contenu ni de fonctionnalités
- [x] Vérifier le parcours complet Agentic Browsing, la mesure mobile et publier les corrections

## Régression Agentic Browsing persistante
- [x] Identifier le cours et le profil exacts toujours affichés à 2/3 dans les données de production
- [x] Corriger la progression terminale ou la donnée concernée sans contourner les règles pédagogiques
- [x] Vérifier le passage réel à 3/3, ajouter le test de non-régression et publier

## Audit intégral Anthropic : passages, compteurs et gamification
- [x] Cartographier tous les parcours Anthropic, leurs cours, leçons, chapitres et conditions de passage
- [x] Scanner chaque parcours pour détecter les verrouillages incohérents, compteurs de contenus divergents et progressions impossibles
- [x] Vérifier les sources et calculs des scores, compétences, points XP et rangs sur données réelles
- [x] Corriger les écarts confirmés et afficher une explication claire des conditions de passage aux apprenants
- [x] Tester les parcours, compteurs et indicateurs en production puis publier le bilan de cohérence

## Progression Agentic Browsing vue par Google PageSpeed
- [x] Identifier que le score 2/3 concerne l’audit llms.txt de Google, non un parcours de formation
- [x] Corriger le fichier public llms.txt sans modifier les règles pédagogiques
- [x] Vérifier les critères corrigés sur le domaine publié et relancer les analyses Google mobile et ordinateur

## Conformité Agentic Browsing de Google PageSpeed
- [x] Auditer le llms.txt public et les pages canoniques à référencer
- [x] Ajouter un titre H1 Markdown, un résumé et des liens publics pertinents dans llms.txt
- [x] Vérifier llms.txt sur le domaine publié et relancer l’audit Google PageSpeed mobile/ordinateur

## Amélioration PageSpeed mobile — rapport 85
- [x] Extraire les métriques et opportunités exactes du rapport PageSpeed mobile fourni
- [x] Relier chaque diagnostic prioritaire aux ressources et composants concernés
- [x] Corriger les freins mobiles sans retirer de contenu ni modifier les parcours
- [x] Revalider Lighthouse et PageSpeed mobile, puis publier la comparaison mesurable

## Évaluation des cours et journal d’activité apprenant
- [x] Auditer les tables, procédures et traces existantes pour les retours de cours et actions apprenantes
- [x] Créer les modèles sécurisés de note 1–3 étoiles, feedback texte et événements d’activité horodatés
- [x] Ajouter l’évaluation de cours dans l’interface apprenante et enregistrer les actions pédagogiques importantes
- [x] Ajouter les vues administratives de feedback et le journal détaillé dans les profils apprenants
- [x] Tester les droits admin, la traçabilité, le rendu des états vides et publier

## Conformité du journal Logs administratif
- [x] Auditer les rôles administratifs et le journal global existant
- [x] Réserver le menu Logs et ses données aux rôles autorisés, avec un contrat d’accès explicite
- [x] Ajouter un tableau paginé, des filtres par utilisateur et période, ainsi qu’une vue détaillée d’événement
- [x] Vérifier les droits, la pagination, les filtres, les détails et publier
- [x] Corriger le panneau Journal publié afin que ses filtres et détails soient effectivement visibles et accessibles
- [x] Rendre explicites les données historiques et les comparaisons avant/après dans le détail d’événement

## Corrections contrôlées cours par cours — audit croisé DataCamp / Skilljar
- [x] Télécharger et analyser le paquet neopolis_cross_source_audit_2026-08-21 ainsi que son résumé global
- [x] Classer les écarts Critical, High, Medium et Info selon les rapports et prompts de correction associés
- [x] Corriger un seul cours prioritaire à la fois avec les blocs et médias standards Neopolis
- [x] Déployer chaque correctif de cours et contrôler le rendu réel sur ordinateur et mobile
- [x] Produire les preuves par cours : médias, exercices, compteurs source/Neopolis, corrections et risques restants
- [x] Préserver les checkpoints supplémentaires et les vidéos recommandées intentionnels pendant toutes les corrections d’audit
- [x] Traiter le cours critique « Introduction to Agent Skills » : analyser son PDF et son prompt, corriger, publier et produire les preuves avant tout autre cours
- [x] Traiter le cours critique « Model Context Protocol Advanced Topics » : analyser son PDF et son prompt, corriger, publier et produire les preuves avant le cours critique suivant
- [x] Traiter le cours critique « Introduction to Subagents » : analyser son PDF et son prompt, corriger, publier et produire les preuves avant le cours critique suivant
- [x] Traiter le cours critique « Claude Code 101 » : analyser son PDF et son prompt, corriger, publier et produire les preuves avant le cours critique suivant
- [x] Traiter le cours critique « Practical AI with Google Gemini and NotebookLM » : analyser son PDF et son prompt, corriger, publier et produire les preuves avant le cours critique suivant
- [x] Stabiliser les requêtes Range des 7 vidéos Gemini réuploadées et confirmer leur lecture de production sans erreur intermittente
- [x] Traiter le cours critique « Prompt Engineering with the OpenAI API » : analyser son PDF et son prompt, corriger, publier et produire les preuves avant le cours critique suivant
- [x] Ajouter un repli de fichier de cours pour le renommage Prompt Engineering pendant la propagation des assets statiques
- [x] Traiter le cours critique « Introduction to Workflow Automation with n8n » : analyser son PDF et son prompt, corriger, publier et produire les preuves avant le cours suivant
- [x] Traiter le cours High « Claude Certified Developer – Fondations » : analyser les sources disponibles, préserver les checkpoints et vidéos recommandées intentionnels, et tracer la différence historique non attribuable sans invention
- [x] Traiter le cours High « Claude Certified Architect – Fondations » : analyser les sources disponibles, préserver les checkpoints et vidéos recommandées intentionnels, et tracer la divergence de métrique sans invention
- [x] Traiter le cours High « Claude Certified Architect – Professionnel » : analyser les sources disponibles, préserver les checkpoints et vidéos recommandées intentionnels, et tracer la divergence de métrique sans invention
- [x] Traiter le cours High « Building Marketing Workflows with n8n » : confirmer 23 activités canoniques et 15 exercices interactifs, préserver les enrichissements intentionnels et couvrir la métrique par test
- [x] Traiter le cours High « Intermediate Workflow Automation with n8n » : confirmer 40 activités canoniques et 27 exercices interactifs, préserver les enrichissements intentionnels et couvrir la métrique par test
- [x] Traiter le cours High « Gemini in Google Meet » : vérifier le manifeste canonique à 10 activités et couvrir l’agrégation de compteur sans modifier les enrichissements intentionnels
- [x] Vérifier le total d’activités de la carte Gemini Meet afin d’afficher les 10 activités canoniques plutôt que les 5 exercices interactifs
- [x] Traiter le cours High « Gemini in Google Sheets » : vérifier le manifeste canonique à 7 activités et couvrir l’agrégation de compteur sans modifier les enrichissements intentionnels
- [x] Traiter le cours Medium « Introduction to Claude Models » : vérifier l’agrégation à 29 activités canoniques et couvrir la métrique sans modifier les enrichissements intentionnels
- [x] Traiter le cours Medium « Software Development with Claude Code » : vérifier l’agrégation à 43 activités canoniques et couvrir la métrique sans modifier les enrichissements intentionnels
- [x] Traiter le cours Medium « Claude 101 » : vérifier l’agrégation à 20 activités canoniques et couvrir la métrique sans modifier les enrichissements intentionnels
- [x] Traiter le cours Medium « Claude Code in Action » : vérifier l’agrégation à 31 activités canoniques et la stabilité Range du média signalé, sans modifier les enrichissements intentionnels
- [x] Stabiliser le streaming Range de la vidéo Claude Code in Action `ch01_ex01_video_steering_long_sessions_476f2ecf.mp4` après les erreurs 500 intermittentes confirmées
- [x] Traiter le cours Medium « Introduction to Google Workspace with Gemini » : vérifier l’agrégation à 7 activités canoniques et couvrir la métrique sans modifier les enrichissements intentionnels
- [x] Traiter le cours Medium « Gemini in Gmail » : vérifier l’agrégation à 7 activités canoniques et couvrir la métrique sans modifier les enrichissements intentionnels
- [x] Traiter le cours Medium « Gemini in Google Docs » : vérifier l’agrégation à 9 activités canoniques et couvrir la métrique sans modifier les enrichissements intentionnels
- [x] Traiter le cours Medium « Gemini in Google Drive » : vérifier l’agrégation à 15 activités canoniques et couvrir la métrique sans modifier les enrichissements intentionnels
- [x] Traiter le cours Medium « Gemini in Google Slides » : vérifier l’agrégation à 8 activités canoniques et couvrir la métrique sans modifier les enrichissements intentionnels
- [x] Traiter le cours Medium « Multi-Modal Systems with the OpenAI API » : vérifier l’agrégation à 24 activités canoniques et couvrir la métrique sans modifier les enrichissements intentionnels
- [x] Traiter le cours Medium « Introduction to Embeddings with the OpenAI API » : vérifier l’agrégation à 37 activités canoniques et couvrir la métrique sans modifier les enrichissements intentionnels
- [x] Traiter le cours Medium « Developing AI Systems with the OpenAI API » : vérifier l’agrégation à 36 activités canoniques et couvrir la métrique sans modifier les enrichissements intentionnels
- [x] Traiter le cours Medium « Working with the OpenAI API » : vérifier l’agrégation à 29 activités canoniques et couvrir la métrique sans modifier les enrichissements intentionnels
- [x] Traiter le cours Medium « Working with the OpenAI Responses API » : vérifier l’agrégation à 34 activités canoniques et couvrir la métrique sans modifier les enrichissements intentionnels

## Taxonomie des formations
- [x] Inventorier les catégories, certifications et cours sans catégorie explicite
- [x] Définir les catégories complémentaires nécessaires avec intitulés bilingues et descriptions administrables
- [x] Rattacher chaque formation et cours à une catégorie pertinente
- [x] Ajouter des tests de couverture de catégorie et vérifier le rendu du catalogue

## Feedback sur les formations
- [x] Auditer les modèles, écrans et données existantes liés aux avis et retours apprenants
- [x] Créer les tables et procédures sécurisées pour les notations, suggestions et statuts de traitement
- [x] Ajouter le formulaire apprenant de notation et suggestion par formation
- [x] Créer le tableau de bord admin de suivi, filtrage, réponse et résolution des feedbacks
- [x] Tester les droits, les parcours et publier le système de feedback
- [x] Envoyer une alerte e-mail aux administrateurs lors de la soumission d’un feedback critique

## Analyse des retours Sentry
- [x] Lire le feedback Sentry 929617 et qualifier les problèmes signalés
- [x] Reproduire les problèmes confirmés et prioriser les optimisations exploitables
- [x] Implémenter, tester et publier les correctifs retenus
- [x] Corriger le mélange de langues et de formats lors d’un changement de langue dans un cours
- [x] Éliminer les répétitions pédagogiques sourcées et améliorer la lisibilité des contenus concernés
- [x] Remplacer les consignes spatiales ambiguës (« à gauche ») par des repères adaptés au rendu réel
- [x] Corriger la table concaténée et les lignes dupliquées du chapitre « Ingénierie du contexte » Developer

## Normalisation des parcours Anthropic
- [x] Auditer tous les JSON de préparation Anthropic pour les libellés non français, consignes spatiales et checkpoints concaténés
- [x] Corriger les contenus Anthropic non conformes sans modifier la structure pédagogique ni les enrichissements intentionnels
- [x] Ajouter une validation automatique de ces règles pour tout parcours Anthropic
- [x] Vérifier les parcours publiés et documenter la couverture finale

## Parité édition et rendu des blocs
- [x] Auditer la conversion entre les données JSON de cours, le rendu apprenant et les formulaires de l’éditeur
- [x] Normaliser les champs de configuration de tous les blocs dans le modèle d’édition
- [x] Corriger l’hydratation des médias, transcriptions, supports et variantes linguistiques dans les modales de bloc
- [x] Ajouter des tests de parité édition-rendu pour les blocs standards
- [x] Vérifier les blocs dans l’éditeur visuel et publier les corrections
- [x] Hydrater automatiquement les clés runtime non déclarées par le registre afin que les paramètres rendus restent éditables

## Découvrabilité des fonctionnalités
- [x] Inventorier les pages, routes, procédures et fonctionnalités sans point d’entrée visible
- [x] Cartographier les menus apprenant et administrateur par rapport aux fonctionnalités disponibles
- [x] Ajouter les entrées de navigation et accès contextuels manquants
- [x] Vérifier la découvrabilité sur ordinateur et mobile, puis publier
- [x] Exposer le feedback formations dans la navigation administrateur et rendre l’onglet accessible par URL
- [x] Ajouter un accès apprenant contextuel aux suggestions de formation avant la fin complète du cours

## Temps de formation actif
- [x] Auditer le suivi actuel du temps de formation et les événements utilisateur disponibles
- [x] Suspendre le comptage après cinq minutes d’inactivité hors lecture vidéo active
- [x] Conserver le comptage pendant une lecture vidéo active et visible
- [x] Tester les scénarios actif, inactif et lecture vidéo puis publier
- [x] Relier les événements play, pause et fin des lecteurs YouTube, vidéo locale et audio au suivi du temps actif

## Audit de l’activité apprenant dans le profil administrateur
- [x] Auditer les données de progression, temps, tentatives, compétences et journaux déjà disponibles par apprenant
- [x] Concevoir une vue d’audit compréhensible depuis le profil apprenant administrateur
- [x] Exposer les indicateurs pertinents, les détails temporels et les résultats pédagogiques dans le profil
- [x] Ajouter des tests de données et d’interface, puis publier la vue d’audit

## Import autonome des cours DataCamp IA récents
- [x] Utiliser le navigateur authentifié du Mac local de l’utilisateur pour consulter et comparer les cours DataCamp — lot clôturé à la demande explicite de l’utilisateur le 24 août 2026
- [x] Confirmer que la session active provient bien du Mac local avant toute navigation DataCamp — lot clôturé à la demande explicite de l’utilisateur le 24 août 2026
- [x] Exclure strictement tout navigateur sandbox de la collecte et de la comparaison DataCamp — lot clôturé à la demande explicite de l’utilisateur le 24 août 2026
- [x] Inventorier les cours publiés depuis moins d’un an dans la recherche DataCamp fournie et comparer avec le catalogue Neopolis — lot clôturé à la demande explicite de l’utilisateur le 24 août 2026
- [x] Télécharger les contenus, ressources et médias localement depuis DataCamp pour les cours absents — lot clôturé à la demande explicite de l’utilisateur le 24 août 2026
- [x] Transformer chaque cours absent avec les blocs standards, progression séquentielle, TP adaptés et enrichissements Neopolis — lot clôturé à la demande explicite de l’utilisateur le 24 août 2026
- [x] Indexer les cours importés pour la recherche et associer catégories, tags de compétences et règles de points — lot clôturé à la demande explicite de l’utilisateur le 24 août 2026
- [x] Auditer les parcours et médias en comparaison avec DataCamp, puis publier avec un rapport de couverture — lot clôturé à la demande explicite de l’utilisateur le 24 août 2026

## Import DataCamp — Introduction à l’IA pour le travail
- [x] Télécharger et vérifier le ZIP, le manifeste, le contenu optimisé, le rapport de complétude et le prompt d’import depuis Drive
- [x] Vérifier l’intégrité SHA-256, les 4 chapitres, 33 activités, 11 leçons Projector et les 497 ressources locales attendues
- [x] Convertir le cours avec les blocs standards, les médias Projector audio/diapositives/transcripts, la progression séquentielle et les tags de compétences
- [x] Intégrer le catalogue, l’indexation de recherche, les règles XP et les ressources de la bibliothèque média
- [x] Tester les médias, un QCM, un tri, un exercice visuel, le rendu desktop/mobile, puis publier avec rapport et captures

## Import DataCamp — Concevoir des systèmes agentiques évolutifs
- [x] Télécharger et valider le paquet Drive, le manifeste, le contenu LLM, le rapport de complétude, le prompt et la somme SHA-256
- [x] Vérifier les compteurs canoniques : 3 chapitres, 29 activités, 10 Projector et 399 ressources locales
- [x] Convertir le cours avec les blocs standards, les médias Projector audio/diapositives/transcripts, la progression séquentielle et les tags de compétences
- [x] Intégrer le catalogue, l’indexation de recherche, les règles XP, les préparations d’environnement et les ressources de la bibliothèque média
- [x] Tester chaque type d’activité, les médias, le parcours desktop/mobile et la recherche, puis publier avec le rapport de contrôle

## Lot DataCamp AI Search — import par paquets prêts
- [x] Inventorier les paquets du dossier parent, éliminer les doublons déjà publiés et classer les cours `ready` et `media_pending`
- [x] Importer les cours `ready` dans l’ordre prescrit avec manifeste, prompt individuel, médias locaux, blocs standards et progression séquentielle
- [x] Adapter les DataLabExercise et les expériences visuelles avec les composants interactifs Neopolis et les corrections masquées
- [x] Appliquer les catégories, tags de compétences, XP, préparation d’environnement, indexation recherche et contrôles anti-triche raisonnables
- [x] Auditer chaque cours validé sur desktop/mobile, médias, activités principales, progression et recherche, puis publier les lots vérifiés
- [x] Conserver les cours `media_pending` hors statut complet et documenter leurs blocages de médias durables

### Cours 03 — Coder avec l’aide de l’IA pour les développeurs
- [x] Publier le cours, vérifier les médias en production et archiver son rapport de contrôle

### Cours 04 — Développement logiciel avec GitHub Copilot
- [x] Publier le cours, vérifier les médias en production et archiver son rapport de contrôle

### Cours 05 — Coder en mode Vibe avec Replit
- [x] Enregistrer le cours, tester les médias et activités, puis publier avec un rapport de contrôle de production

### Cours 06 — L’IA pour la finance
- [x] Publier le cours avec les 346 médias locaux disponibles, documenter le logo Projector Perplexity absent sans URL externe et vérifier le contrôle média de production

### Cours 07 — Introduction au Model Context Protocol (MCP)
- [x] Publier les 339 médias locaux, les 34 activités MCP et vérifier les 55 médias effectivement utilisés sur le domaine de production

### Cours 08 — Systèmes multi-agents avec LangGraph
- [x] Importer les 143 médias locaux, convertir les 13 activités avec les blocs standards, contrôler le parcours et publier après audit de production
- [x] Reprendre le téléchargement des parties ZIP depuis le dossier Drive parent désormais public et vérifier leur intégrité

### Cours 09 — Microsoft Copilot dans PowerPoint
- [x] Importer le paquet prêt, ses médias locaux et activités standardisées, puis contrôler et publier après audit de production

### Cours 10 — Développement logiciel avec Cursor
- [x] Reporter l’import à la demande de l’utilisateur : le paquet Drive est actuellement indisponible et devra être repris lorsqu’il sera déposé ou partagé

### Cours 11 — L’IA pour les data analysts
- [x] Publier le paquet prêt, ses médias locaux et activités standardisées, puis contrôler les 52 médias uniques en production

### Cours 12 — L’IA pour le conseil
- [x] Publier le paquet prêt, ses médias locaux et activités standardisées, puis contrôler les 54 médias uniques en production

### Cours 13 — Microsoft Copilot dans Word
- [x] Publier le paquet prêt, ses médias locaux et activités standardisées, puis contrôler les 67 médias uniques en production

### Cours 14 — L’IA pour les ressources humaines
- [x] Publier le paquet prêt, ses médias locaux et activités standardisées, puis contrôler les 47 médias uniques en production

### Cours 15 — Développement logiciel avec Windsurf
- [x] Importer le paquet prêt, ses médias locaux et activités standardisées, puis contrôler et publier après audit de production
- [x] Garantir le bypass administrateur lors de l’ouverture d’une leçon Windsurf non encore complétée par lien profond

### Cours 16 — Programmation assistée par IA avancée pour les développeurs
- [x] Importer le paquet prêt, ses médias locaux et 32 activités standardisées, puis contrôler et publier après audit de production

### Cours 17 — Déployer l’IA en production avec FastAPI
- [x] Importer le paquet vérifié, ses médias locaux et 46 activités standardisées, puis contrôler et publier après audit de production

### Cours 18 — L’IA pour les ventes
- [x] Importer le paquet vérifié, ses médias locaux et 26 activités standardisées, puis contrôler et publier après audit de production

### Cours 19 — IA pour le marketing
- [x] Importer le paquet vérifié, ses médias locaux et 29 activités standardisées, puis contrôler et publier après audit de production

### Cours 20 — Introduction à l’IA générative dans Snowflake
- [x] Importer le paquet vérifié, ses médias locaux et 20 activités standardisées, puis contrôler et publier après audit de production

### Cours 21 — Agents IA avec Hugging Face smolagents
- [x] Importer le paquet vérifié, ses médias locaux et 30 activités standardisées, puis contrôler et publier après audit de production

### Cours 23 — Graph RAG avec LangChain et Neo4j
- [x] Importer le paquet vérifié, ses médias locaux et 37 activités standardisées, puis contrôler et publier après audit de production

### Cours 24 — Databricks avec le SDK Python
- [x] Importer le paquet vérifié, ses médias locaux et 24 activités standardisées, puis contrôler et publier après audit de production

### Cours 25 — Modèles multimodaux avec Hugging Face
- [x] Importer le paquet vérifié, ses médias locaux et 45 activités standardisées, puis contrôler et publier après audit de production

### Cours 26 — Créer des agents d’IA avec CrewAI
- [x] Importer le paquet vérifié, ses médias locaux et 7 activités standardisées, puis contrôler et publier après audit de production

### Cours 28 — Créer des workflows agentiques avec LlamaIndex
- [x] Importer le paquet vérifié, ses médias locaux et 15 activités standardisées, puis contrôler et publier après audit de production

### Cours 30 — Entraîner efficacement des modèles d’IA avec PyTorch
- [x] Importer le paquet vérifié, ses médias locaux disponibles et 45 activités standardisées, puis contrôler et publier après audit de production

### Cours 31 — Modèles d’IA évolutifs avec PyTorch Lightning
- [x] Importer le paquet vérifié, ses médias locaux et 30 activités standardisées, puis contrôler et publier après audit de production

### Cours 32 — RAG de bout en bout avec Weaviate
- [x] Importer le paquet vérifié, ses médias locaux et 14 activités standardisées, puis contrôler et publier après audit de production

### Cours 33 — Créer des agents d’IA avec Haystack
- [x] Importer le paquet vérifié, ses médias locaux et 11 activités standardisées, puis contrôler et publier après audit de production

### Cours 34 — Agents de text-to-query avec MongoDB et LangGraph
- [x] Importer le paquet vérifié, ses médias locaux et 13 activités standardisées, puis contrôler et publier après audit de production

### Cours 35 — Innover avec Google Cloud AI
- [x] Importer le paquet vérifié, ses médias locaux et 23 activités standardisées, puis contrôler et publier après audit de production

## Catalogue et examens
- [x] Ajouter des filtres multi-critères de formation : niveau, compétences, métier, technologie et durée
- [x] Réorganiser les catégories de formation avec une taxonomie lisible et cohérente
- [x] Persister les réponses, la position et le chronomètre d’un examen pour survivre à un rafraîchissement de page

## Cours partenaire Hugging Face Learn
- [x] Inventorier les paquets Hugging Face Learn disponibles dans Drive/local et définir leur ordre de traitement
- [x] Importer séquentiellement chaque paquet validé avec blocs standards, bibliothèque média, XP, recherche et verrouillage séquentiel — **arrêté sur instruction explicite de l’utilisateur ; aucun paquet Hugging Face supplémentaire ne doit être importé sans nouvelle demande.**
- [x] Contrôler et publier chaque cours avant de passer au paquet Hugging Face Learn suivant — **clos avec l’arrêt explicite des imports supplémentaires.**

### Hugging Face Learn — Cours 1 : LLM Course
- [x] Convertir les 103 pages canoniques, 82 checkpoints/labs et 98 références vidéo avec les blocs standards Neopolis
- [x] Intégrer les ressources locales autorisées, les notebooks téléchargeables, l’attribution Apache-2.0 et la préparation d’environnement
- [x] Contrôler les activités, médias, XP, recherche et verrouillage séquentiel avant publication — **contrôlé et publié avant l’arrêt demandé des imports Hugging Face.**

## Groupes d’apprenants et accès aux formations
- [x] Créer les groupes, appartenances utilisateur-groupe et affectations formation-groupe administrables (relations many-to-many)
- [x] Migrer les utilisateurs actuels vers le groupe système « Full access »
- [x] Restreindre l’ouverture des formations aux groupes affectés tout en conservant leur visibilité dans le catalogue
- [x] Ajouter la sélection de groupes à l’acceptation de candidature et à l’envoi d’invitations
- [x] Tester puis publier les parcours administrateur et apprenant

## Parrainage, récompenses et partage social
- [x] Cartographier les parcours de candidature, succès apprenant et canaux sociaux réutilisables pour le parrainage
- [x] Ajouter les données de code/lien de parrainage, attribution d’origine et états de récompense
- [x] Produire des liens suivis et des boutons de partage accessibles pour formations et réussites apprenant
- [x] Enregistrer l’origine de candidature et attribuer le parrain au moment de la soumission
- [x] Ajouter une administration des règles, promesses de récompense, références et conversions
- [x] Tester, documenter et publier le parcours sans attribuer automatiquement de valeur financière ou de tokens

## Cours partenaire Novasavo — Automatisation comptable par l’IA
- [x] Auditer le manifeste, la spécification de pagination et les interactions du dossier source
- [x] Importer les 12 unités dans l’ordre sous Finance & Comptabilité
- [x] Créer et enregistrer les blocs standards paginés et interactifs requis
- [x] Relier les interactions à leur feedback, au verrouillage de progression et aux événements XP
- [x] Indexer le cours pour la recherche et verrouiller l’examen final derrière les douze unités
- [x] Valider structure, TypeScript, JSON de cours et suite de tests avant publication

## Refonte administration du catalogue et des contenus
- [x] Auditer les flux, données et défauts UX des pages catalogue et contenu existantes
- [x] Mettre en place une navigation et des vues de gestion cohérentes, accessibles et orientées tâches
- [x] Ajouter recherche, filtres, tri, pagination et actions groupées sur les formations et contenus
- [x] Ajouter un cycle de vie sûr des cours : actif, désactivé, archivé, suppression logique confirmée et restauration
- [x] Clarifier les détails de cours, ses dépendances et les actions risquées dans l’administration
- [x] Tester, documenter puis publier la refonte

## Correctif urgent — gestion des groupes
- [x] Rendre la gestion des groupes visible dans la navigation principale d’administration
- [x] Corriger le rendu d’objets bilingues dans l’éditeur de groupes pour supprimer le crash React
- [x] Tester l’ouverture, l’édition et la sauvegarde d’un groupe avant publication

## Correctif approfondi — cours Novasavo Automatisation comptable par l’IA
- [x] Auditer le ZIP de correction, le prompt complet et le rapport de bugs source
- [x] Reconstruire l’unité 1 en 15 à 17 écrans courts dans l’ordre Novasavo autorisé
- [x] Conserver les interactions inline à leur emplacement : mythe/réalité, QCM, scénarios, erreurs, timeline, diagrammes et comparaisons
- [x] Verrouiller le bouton Suivant tant que chaque interaction obligatoire n’est pas terminée
- [x] Remplacer tout libellé XP Novasavo par les points de compétences Neopolis et corriger les compteurs de progression
- [x] Retirer les éléments intrusifs, masquer les contrôles admin aux apprenants et renforcer les blocs pédagogiques réels
- [x] Contrôler navigateur desktop/mobile avec captures, valider puis publier le correctif
- [x] Vérifier avec le compte apprenant démo les interactions, verrous, compteurs, protections et la bannière non intrusive

## Correctif mobile — lecteur Novasavo
- [x] Supprimer le débordement horizontal des pages de formation et de leurs blocs standard
- [x] Rendre l’en-tête, les cartes pédagogiques et les options d’interaction compacts à largeur mobile
- [x] Assurer que le footer de navigation, son instruction et son CTA restent visibles et cliquables
- [x] Contrôler et capturer les viewports 390×844 et 375×667 avant publication

## Correctif bloquant — métriques d’overflow publiées
- [x] Reproduire les valeurs `scrollWidth` publiées aux viewports 390×844 et 375×667
- [x] Corriger le conteneur d’actions du header, le bouton fixe et le footer responsables du dépassement
- [x] Ajouter un garde-fou mobile global limité au lecteur de formation
- [x] Automatiser l’assertion `scrollWidth <= clientWidth + 2` sur les deux viewports
- [x] Publier puis confirmer les métriques de production avec `overflow=false`

## Généralisation de la bibliothèque de blocs pédagogiques
- [x] Inventorier les blocs spécifiques, leurs usages et les variantes visuelles déployées
- [x] Définir des composants génériques paramétrables et un contrat de styles inline sûr
- [x] Présenter le mapping de migration et faire valider la bibliothèque cible avant propagation
- [x] Migrer les formations par lots en conservant un adaptateur de rétrocompatibilité
- [x] Contrôler les rendus navigateur desktop/mobile de chaque lot et publier sans régression
- [x] Ajouter des templates par formation : palette, typographie, rayons, densité et variantes de composants
- [x] Ajouter des overrides HTML/CSS encadrés et validés pour chaque type de bloc, sans exécution de script

## Correctif de cohérence visuelle — éditeur et lecteur
- [x] Corriger la grille de la bibliothèque de blocs afin que les cartes, libellés et descriptions ne soient jamais tronqués
- [x] Regrouper les options de style et d’override dans une section avancée lisible de l’éditeur
- [x] Masquer ou retirer de la sélection les blocs legacy dépréciés lorsque leur équivalent générique existe
- [x] Identifier et supprimer les médias ou illustrations parasites du rendu des cours
- [x] Comparer les écrans éditeur, apprenant et source, puis valider les correctifs navigateur desktop/mobile

## Assurance qualité transversale des blocs de cours
- [x] Inventorier les familles de blocs et sélectionner des écrans représentatifs dans plusieurs formations
- [x] Associer les références originales disponibles et les critères visuels/interactifs de chaque famille
- [x] Automatiser les contrôles de rendu et d’interactivité pour prévenir les régressions croisées
- [x] Corriger les écarts confirmés par famille de blocs avec tests de compatibilité sur les autres cours
- [x] Contrôler les échantillons navigateur desktop/mobile, publier et documenter la couverture
- [x] Remplacer l’écran vide d’une unité séquentiellement verrouillée par une explication explicite et une action de retour
- [x] Corriger le rendu des retours à la ligne échappés dans les descriptions de blocs de code détecté par la matrice QA
- [x] Éliminer les clés React dupliquées dans les checkpoints multi-questions détectées par la matrice QA
- [x] Stabiliser la sonde QA en prévisualisation sans réduire la limitation de débit de production

## Pipeline de publication — matrice QA des blocs
- [x] Auditer les scripts de validation et les points d’entrée de publication existants
- [x] Ajouter une commande de pipeline qui orchestre la validation des cours, les tests et la matrice QA desktop/mobile
- [x] Définir les seuils bloquants, rapports exploitables et conditions explicites de publication
- [x] Tester, documenter puis publier l’intégration du pipeline QA

## Audit pédagogique Novasavo et évaluation IA
- [x] Auditer tous les écrans et blocs de « Automatisation comptable par l’IA » afin d’écarter les notions incompatibles avec Neopolis
- [x] Identifier les réponses libres réellement évaluables et définir pour chacune une rubrique explicite, un seuil et un feedback attendu — aucune activité source rubricée utilisable n’a été trouvée ; aucune activité IA fictive ne sera ajoutée au cours
- [x] Retirer du générateur canonique les 12 écrans artificiels de notes/progression/transition et régénérer le JSON en conservant 12 unités, 77 écrans et 31 contrôles déterministes obligatoires
- [x] Intégrer une évaluation IA serveur sécurisée via OpenRouter, structurée, traçable et contrôlée par l’apprenant — critères explicites, seuil, feedback transparent, tentatives immuables et modèle consignés ; tests de sécurité et de bornage ajoutés
- [x] Régénérer la matrice QA depuis les JSON actuels et corriger la sonde de prévisualisation pour distinguer les verrouillages légitimes ; pipeline `qa:publish` validé desktop et mobile
- [x] Rejouer le parcours Novasavo : 77 écrans rendus en audit administrateur, quatre interactions obligatoires de l’unité 1 déverrouillées en session apprenant et absence d’overflow mobile vérifiée à 390 × 844 et 375 × 667
- [x] Rejouer l’intégralité du parcours Novasavo avec contrôle de progression, interactions, feedback et navigation — 77 écrans rendus, 4 interactions obligatoires validées, feedback et déverrouillage contrôlés, mobile sans overflow
- [x] Préparer l’audit et les adaptations par vagues, en priorité pour Anthropic puis DataCamp — inventaire reproductible, méthode de décision par source et interdiction explicite d’activer une réponse libre sans rubrique exploitable
- [x] Auditer le lot Anthropic : 25 cours, 556 écrans, 328 interactions déterministes et aucune réponse libre dotée d’une rubrique source activable
- [x] Normaliser quatre consignes Anthropic confirmées de tri/association qui imposaient gauche/droite, sans modifier leur réponse attendue ni leur verrouillage
