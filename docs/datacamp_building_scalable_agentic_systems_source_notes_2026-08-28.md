# Notes source — Concevoir des systèmes agentiques évolutifs

**Paquet restauré :** `datacamp_building-scalable-agentic-systems_complete_media_package_2026-08-24.zip`  
**SHA-256 officiel vérifié :** `9ea2106bb9aad659b5141401b916c8d08eb7de8632963d114741afda72b90889`  
**Manifeste canonique :** `COURSE_MANIFEST.json`

Le rapport de complétude source confirme **3 chapitres, 29 activités, 10 leçons Projector** et **399 téléchargements locaux validés sur 399**. Les activités sont composées de 10 vidéos, 6 tris, 9 QCM, 3 exercices visuels et un scénario conversationnel.

## Décision d’adaptation

Les trois exercices visuels ci-dessous déclarent chacun une image canonique dans le manifeste. Aucun chemin local n’est fourni par le manifeste pour ces images et aucune occurrence de leurs fichiers n’est présente dans le paquet extrait ni dans son index de téléchargements. Les conserver sous forme de simple QCM sans le visuel demandé rendrait la consigne non reproductible. Ils sont donc retirés, avec leurs références associées, sans créer de substitut ni de visuel inventé.

| Activité source | Décision | Justification factuelle |
|---|---|---|
| 2.6 — *Le MCP est le MVP* | Retirée | Image `mcp_exercise.png` déclarée dans `asset.assetUrl`, sans copie locale livrée. |
| 2.7 — *Clients, serveurs et tout le reste* | Retirée | Image `mcp_detailed_exercise.jpg` déclarée dans `asset.assetUrl`, sans copie locale livrée. |
| 2.9 — *Cartes d'agents — Attrapez-les tous* | Retirée | Image `a2a_exercise.jpg` déclarée dans `asset.assetUrl`, sans copie locale livrée. |

La dernière leçon Projector comportait aussi trois recommandations externes DataCamp. Elles ne sont ni un média local ni une activité pédagogique requise et ont été supprimées du rendu apprenant. Les médias Projector et les interactions restantes sont conservés dans leur ordre source.

## État audité après adaptation

| Élément | Résultat |
|---|---:|
| Activités source | 29 |
| Activités Neopolis conservées | 26 |
| Omissions explicitement documentées | 3 |
| Tris interactifs conservés | 6 |
| QCM et scénario conversationnel conservés | 10 |
| Leçons Projector locales contrôlées | 10 |
| Slides et segments de transcription Projector contrôlés | 166 / 166 |
| Références média fournisseur visibles | 0 |
| XP visible, HTML brut ou laboratoire externe | 0 |

## Rejeux effectués en session apprenant QA

Le tri **« Agent ou pas agent »** (activité 1.2) a été rejoué : placement au clic, cible clavier accessible, bouton de soumission verrouillé tant que les cartes ne sont pas toutes placées, feedback puis déverrouillage suivant ont tous été confirmés. Le QCM **« Applications agentiques »** (activité 1.3) a confirmé la correction masquée avant tentative, le verrou de soumission, le feedback et l’ouverture de la suite après réponse correcte. Le scénario conversationnel **« Tester un agent de manière fiable »** (activité 3.2) a été rejoué après préparation séquentielle des deux unités précédentes : messages canoniques, correction masquée, réponse, feedback et déverrouillage sont confirmés.

La QA de publication a réussi sur ses six étapes : TypeScript, validation JSON, tests, audit d’interactions, matrice desktop et matrice mobile.
