# Notes source — Travailler avec l’API OpenAI

Le paquet Drive officiel restauré contient un manifeste à exercices racine : **29 activités**, **9 vidéos** et **20 activités hors vidéo**. Il possède des PDF, MP4, VTT et transcriptions locales. L’audit a dû être étendu pour cette structure sans modifier les données source.

Les références `XP quotidiens` et certaines URLs sont extraites dans les transcriptions Projector. Elles ne doivent être supprimées que lorsqu’elles forment une dépendance apprenant non disponible ; les champs `datacampImport` restent des métadonnées techniques non affichées.

Les URLs détectées sont `https://www.datacamp.com/datalab`, `https://platform.openai.com/tokenizer` et `https://openai.com/pricing`. Elles apparaissent dans des transcriptions source et sont à classer séparément des actifs locaux `/api/assets`.
