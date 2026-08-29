# Notes source — Travailler avec l’API OpenAI

Le paquet Drive officiel restauré contient un manifeste à exercices racine : **29 activités**, **9 vidéos** et **20 activités hors vidéo**. Il possède des PDF, MP4, VTT et transcriptions locales. L’audit a dû être étendu pour cette structure sans modifier les données source.

Le 29 août 2026, l’archive officielle `datacamp_working_with_the_openai_api_complete_media_package_2026-08-21.zip` a été téléchargée de nouveau depuis Drive. Son MD5 publié par Drive, `93466809d5cdb3c6eda0aba2026a24b9`, correspond exactement à la somme calculée localement ; `unzip -t` réussit. Le paquet ne fournit pas de fichier ou de somme SHA-256, ce qui est documenté plutôt que remplacé par une empreinte inventée.

Les références `XP quotidiens` et certaines URLs sont extraites dans les transcriptions Projector. Elles ne doivent être supprimées que lorsqu’elles forment une dépendance apprenant non disponible ; les champs `datacampImport` restent des métadonnées techniques non affichées.

Les URLs détectées sont `https://www.datacamp.com/datalab`, `https://platform.openai.com/tokenizer` et `https://openai.com/pricing`. Elles apparaissent dans des transcriptions source et sont à classer séparément des actifs locaux `/api/assets`.

## Contrôle public reconfirmé — 29 août 2026

La sonde authentifiée a recontrôlé la carte catalogue et la fiche de certification sur `https://akademy.neodev.click`. Les compteurs dérivés sont confirmés à **29 activités**, **20 exercices interactifs**, **9 vidéos** et **3 téléchargements**. Ce contrôle porte sur le rendu Neopolis publié et non sur une navigation fournisseur.
