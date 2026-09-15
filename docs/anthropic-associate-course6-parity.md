# Associate Foundations — Cours 6 : matrice de parité et protocole

## Périmètre

Le cours **Governance, Risk & Responsible Use** suit la séquence officielle de neuf écrans, avec une durée officielle de **55 minutes**. L’audit local et l’analyse Claude Sonnet ont relevé des traductions incomplètes, des cartes tronquées, quatorze activités racine historiques optionnelles et une recommandation externe sans provenance de gouvernance.

| Écran Neopolis | Sujet | Bloc standard conservé | Action du lot |
|---:|---|---|---|
| 1 | Introduction | Contenu | Durée officielle affichée à 55 min |
| 2 | Cas d’utilisation appropriés | Contenu, FlipCards, triage | Français, terminologie, triage obligatoire |
| 3 | Confiance dans les Skills | Contenu, FlipCards | Question manquante et carte tronquée restaurées |
| 4 | Sensibilité des données et contrôles | Contenu, FlipCards | Niveaux de données, contrôles et cartes localisés/restaurés |
| 5 | Politiques organisationnelles | Contenu, FlipCards | Dérive et carte de diligence corrigées |
| 6 | Implications éthiques | Contenu, FlipCards | Reliquats IA et trois cartes tronquées corrigés |
| 7 | Quiz du module 6 | Contenu, FlipCards, cinq choix uniques | Titre aligné ; réponses intégrées obligatoires |
| 8 | Points clés | Contenu | Synthèse conservée |
| 9 | Module terminé | Contenu | Fin standard conservée |

## Décisions de compatibilité

Les quatorze activités racine importées ne suivaient pas les chapitres qu’elles évoquaient, étaient toutes facultatives et dupliquaient des écrans de lancement, résultats ou feedback. Elles sont donc retirées : le triage du chapitre 2 et les cinq questions intégrées du quiz restent les seules activités standard du cours. La recommandation n8n héritée est également supprimée, faute de provenance directe, transcription, checksum et vérification de lecture compatibles avec le protocole Anthropic.

Les formulations de contenu et les huit restaurations de cartes sont produites par Claude Sonnet à partir de la variante anglaise présente dans le JSON. Trois formulations françaises dégradées du chapitre Données ont fait l’objet d’un second contrôle Claude Sonnet avant leur application idempotente.

Le tableau de critères de délégation, rendu comme une succession de titres fragmentés dans le lecteur, est remplacé par un seul intertitre et quatre puces Markdown compactes, produites par Claude Sonnet à partir des critères existants. Le triage standard et ses six associations restent inchangés.

## Contrôle public après les checkpoints `9aba6b7a` et `6d186b26`

La route publique tRPC retourne HTTP 200 avec `application/json` et `no-store`. Elle confirme la durée officielle de 55 minutes, neuf écrans, `rootExercises: 0`, `recommendedVideosManaged: false`, le titre « Quiz du module 6 » et le nom produit **Skills** dans l’introduction. Sur le lecteur public, l’écran Introduction affiche bien la durée et Skills ; l’écran Cas d’utilisation affiche les quatre critères dans une liste compacte et conserve le triage standard de six associations, sans activité racine hors flux.

La revue ciblée finale confirme aussi l’écran Données : caviardage correctement formulé, huit cartes de révision disponibles, contrôles Incognito/Memory/Code Execution nommés, et verrou standard visible tant que les cartes ne sont pas retournées. Aucun changement de bloc, de triage ou de règle de progression n’est introduit par ce lot.

L’écran Quiz confirme cinq scénarios intégrés avec quatre options chacun, des cartes de révision et le double verrou standard : cartes à retourner puis activité de validation à soumettre. Aucune activité racine historique n’est rendue.

L’écran final affiche la complétion et trois recommandations externes identifiées par leur provenance (Google, Microsoft Research et AI Mastery). Leur statut de compléments Neopolis doit être explicité ou ces recommandations doivent être retirées si elles ne figurent pas dans la source autorisée, avant de clôturer la parité média du cours.

Après le checkpoint `49cce81a`, le tRPC public confirme `recommendedVideosManaged: false` et la capture rendue de l’écran final ne présente plus de section de recommandations vidéo. Le texte d’extraction navigateur a conservé une réponse antérieure, mais l’interface effectivement rendue et la donnée tRPC correspondent au retrait. La console finale n’a pas pu être relue après la fermeture du bac à sable navigateur ; aucun changement JavaScript n’a été introduit dans ce dernier lot de données.

Les écrans 3/9 et 5/9 ont été rejoués publiquement. Politiques est cohérent, avec quatre cartes complètes et les règles de diligence attendues. L’écran Skills conserve six cartes et ses contrôles, mais deux faces avant traduisent encore le nom de produit de manière générique (« compétences ») ; ce reliquat est regroupé avec la prochaine correction de contenu.

## Preuves attendues à la clôture

La publication devra confirmer : réponse tRPC `no-store` fraîche, neuf écrans dans le lecteur public, triage à six associations, cinq QCM intégrés, verrouillage par activités requises, cartes complètes, termes produits préservés, console sans erreur et absence de recommandation externe non sourcée.
