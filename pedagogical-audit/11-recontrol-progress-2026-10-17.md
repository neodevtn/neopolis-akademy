# Recontrôle pédagogique et calcul de progression — 17 octobre 2026

## Périmètre et méthode

Ce recontrôle repart des audits établis précédemment et sépare deux niveaux qui ne doivent pas être confondus :

1. **Contrôle structurel automatisable** : faisabilité des activités, cohérence des identifiants et des verrous, ressources référencées, une seule vidéo par écran, intégrité des checkpoints, contenu bilingue et structure des blocs.
2. **Contre-revue qualitative pédagogique** : promesse académique, précision des consignes, valeur du feedback, cohérence des objectifs, qualité des exercices et pertinence des ressources.

Le premier mesure des invariants de production. Le second mesure l’expérience d’apprentissage et exige une appréciation de fond. Un résultat vert du premier ne clôt pas le second.

## Couverture vérifiée

| Élément | Résultat |
|---|---:|
| Formations contre-revues | 116 / 116 |
| Rapports qualitatifs valides | 116 / 116 |
| Rapports qualitatifs invalides ou manquants | 0 |
| Cours contrôlés | 180 |
| Chapitres actuels | 3 390 |
| Validation de contenu | PASS — 220 avertissements QCM non bloquants |
| Écrans avec plusieurs vidéos | 0 |
| Checkpoints orphelins | 0 |
| Verrous obligatoires fantômes | 0 |
| Audit bilingue strict | 0 anomalie |

## Progression structurelle mesurée

L’audit initial recensait **1 960 constats** : 223 P0, 926 P1, 679 P2 et 132 P3. Le contrôle structurel relancé sur l’état actuel ne remonte aucun constat :

| Priorité | Initial | Actuel structurel | Réduction |
|---|---:|---:|---:|
| P0 | 223 | 0 | 100 % |
| P1 | 926 | 0 | 100 % |
| P2 | 679 | 0 | 100 % |
| P3 | 132 | 0 | 100 % |
| **Total** | **1 960** | **0** | **100 %** |

Le rapprochement individuel des constats est plus nuancé et plus fiable qu’un simple zéro final :

| Statut de rapprochement | Constats | Part du périmètre initial |
|---|---:|---:|
| Écran toujours présent et conforme au contrôle structurel | 1 773 | 90,46 % |
| Activité retirée avec trace de remédiation | 155 | 7,91 % |
| Écran restructuré ou absent, correspondance encore à tracer | 32 | 1,63 % |
| **Constats directement justifiés** | **1 928** | **98,37 %** |

Les 155 constats initiaux rattachés à un retrait documenté couvrent des TPs, jeux de données, environnements ou checkpoints que la plateforme ne pouvait pas fournir ou corriger de manière fiable. Les activités concernées ont été retirées sans invention de ressources et sans laisser de blocage de progression.

## Progression qualitative réelle

La consolidation qualitative actuelle fait apparaître **1 640 constats ouverts** :

| Classe | Constats ouverts |
|---|---:|
| P0 | 66 |
| P1 | 676 |
| P2 | 496 |
| P3 | 75 |
| Historiques ouverts sans sévérité reconstructible | 327 |
| **Total** | **1 640** |

Pour les rapports possédant un statut normalisé complet, le portefeuille comparable comporte 1 382 constats : **59 corrigés avec preuve**, **10 faux positifs vérifiés** et **1 313 encore ouverts**. Le taux de clôture qualitatif démontré sur ce sous-ensemble est donc **4,99 %**.

Ce n’est pas contradictoire avec les 100 % structurels : les défauts qualitatifs restants portent surtout sur la clarté pédagogique, le feedback par réponse, la qualité des exercices, l’alignement entre promesse et parcours, ou les ressources annoncées sans contexte suffisant.

## Actualisation ciblée des formations modifiées

Quinze formations touchées par des remédiations ont été relues indépendamment avec leurs contenus actuels, leurs rapports initiaux et leurs précédentes contre-revues. Les 15 rapports sont valides et ont apporté 27 P0, 46 P1, 58 P2 et 4 P3 ouverts dans ce sous-périmètre.

Par rapport à la consolidation précédente, cette actualisation fait passer les constats qualitatifs ouverts de :

- P0 : 67 → **66** ;
- P1 : 675 → **676** ;
- P2 : 481 → **496** ;
- P3 : 74 → **75** ;
- historiques non classables : 361 → **327**.

Ces variations ne signalent pas une régression fonctionnelle : la relecture ciblée a remplacé 15 rapports plus anciens par des preuves plus précises, et a transformé une partie des constats historiques non classables en constats P0–P3 explicitement qualifiés.

## Priorités qualitatives réellement bloquantes

Les P0 les plus concentrés après recontrôle sont :

| Formation | P0 | Motif dominant |
|---|---:|---|
| Travailler avec l’API OpenAI | 18 | Exercices de code requis avec starter/solution tronqués et sans test vérifiable |
| LLM Application Security and Red Teaming Specialist | 12 | Activités critiques insuffisamment réalisables ou vérifiables |
| Déployer l’IA en production avec FastAPI | 9 | Parcours de mise en production bloqué par des prérequis/ressources incomplets |
| LLMOps and AI Observability Engineer | 8 | Activités critiques non suffisamment exécutables ou évaluables |
| Automatisation de workflows avancée (n8n) | 6 | TP verrouillés demandant des workflows non fournis |
| Introduction aux Agent Skills | 3 | TPs/code_repl incompatibles avec l’environnement apprenant |

## Décision de publication

- **Feu vert technique et structurel** : oui. Les 180 cours satisfont le contrôleur de production et les invariants de navigation/progression.
- **Feu vert pédagogique global** : non. Les 66 P0 qualitatifs ouverts empêchent encore de déclarer le catalogue entièrement prêt sur le plan académique.

La prochaine vague efficace consiste à traiter, dans cet ordre, les six formations listées ci-dessus. Pour chaque activité non réalisable faute de fichier, jeu de données ou environnement, la règle reste la même : **retrait documenté et suppression de la porte**, jamais une ressource inventée.

## Artefacts sources

- `08-counter-audit-progress.json` et `.md` : comparaison audit initial / contrôle structurel actuel.
- `08-counter-audit-trace-required.json` : 32 correspondances d’écrans restructurés encore à tracer.
- `09-qualitative-recheck-final.json` et `.md` : consolidation des 116 contre-revues.
- `recheck-refresh-manifest.json` : liste des 15 formations relues après remédiation.
- `recheck-refresh-inputs/` : bundles de preuve utilisés pour la contre-revue ciblée.
