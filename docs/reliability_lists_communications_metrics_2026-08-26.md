# Fiabilité des invitations, communications et indicateurs

## Invitations directes

Le tableau historique de l’administration utilisait une ancienne procédure avec une pagination par défaut de vingt lignes. Il est désormais branché sur la liste d’invitations directes paginée côté serveur, avec recherche par nom ou e-mail, tri par colonne et actions en dernière colonne. Les invitations liées à une candidature restent dans le suivi des candidatures afin d’éviter les doublons métier.

Le contrôle navigateur administrateur a confirmé l’accès aux **183 invitations directes** sur **8 pages** de 25 lignes, avec passage réussi de la première à la seconde page et champ de recherche disponible.

## Communications apprenant

La visibilité est désormais décidée par un reçu individuel, par un envoi universel non filtré, ou par une correspondance exacte d’adresse dans les destinataires manuels. La création de reçus ne filtre plus les comptes administrateurs : un administrateur qui est également apprenant peut consulter les communications qui lui sont réellement adressées.

> La lecture et l’accusé de réception sont deux états distincts. L’ouverture d’un communiqué important le marque comme lu ; il reste toutefois affiché en lightbox jusqu’à l’accusé explicite requis.

Le contrôle apprenant confirme que plusieurs communiqués sont présents dans l’historique et que le statut de lecture ne reste plus artificiellement bloqué sur le même élément.

## Indicateurs de formation

La source éditoriale reste le JSON de chaque cours. Le script `sync-catalog-metrics` compte les leçons, chapitres/activités, interactions, vidéos et téléchargements à partir de ce contenu. Le sélecteur `catalogMetrics` agrège ensuite exclusivement les métriques de cours pour les pages de formation et de certification. Les cartes n’utilisent plus les champs de présentation `breakdown` ni les libellés d’exercice injectés dans le catalogue.

| Niveau d’affichage | Mesures désormais calculées | Source |
|---|---|---|
| Cours | Chapitres, activités, exercices interactifs, vidéos, téléchargements | JSON de cours synchronisé |
| Formation/certification | Somme des métriques des cours affiliés | `catalogMetrics` |
| Tableau de bord | Totaux des formations calculées | `catalogMetrics` |

Le test du cours MCP a notamment été aligné sur les **21 exercices interactifs** réellement détectés dans son JSON ; l’ancienne valeur déclarative de 23 n’est plus affichée comme métrique canonique.

## Couverture des rendus

La revue couvre désormais les cartes du tableau de bord apprenant, les en-têtes et résumés de certification, les cartes de cours verrouillées et déverrouillées, ainsi que les cartes de catalogue de l’administration. Les compteurs d’écran et d’activité dans le lecteur sont déjà calculés à partir de `currentChapter`, `totalChapters` et de l’état de progression réel ; aucun libellé statique de type `0/13` n’a été retenu. La seule propriété `courseCount` encore lue dans le tableau de bord est la valeur dérivée produite par `catalogMetrics`, et non un attribut de certification lu directement depuis le JSON.

## Vérification de production

La version publiée a été rejouée sur le domaine de production avec une session administrateur. La **carte n8n du catalogue apprenant** et la **fiche de certification n8n** affichent toutes deux **32 activités**, **10 vidéos**, **22 exercices interactifs** et **3 téléchargements**. Le lecteur Novasavo affiche désormais **1/12 unités** au premier écran ; l’examen final est conservé comme étape distincte et ne gonfle plus le total des unités.
