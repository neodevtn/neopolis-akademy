# Revue de contenu — `multi_modal_systems_with_the_openai_api__01`

**Périmètre.** Lecture intégrale de `client/public/data/courses/multi_modal_systems_with_the_openai_api__01.json` et comparaison avec les seules preuves locales autorisées. Aucune consultation DataCamp web et aucune modification du cours.

## Conclusion

La reprise est **structurellement alignée** avec les contrôles locaux : deux chapitres et 24 activités, dont 7 vidéos, 15 TP `code_repl`, un exercice de classement et un QCM. Le contrôle d’import indique 37 médias locaux sur 37, aucun média invalide, aucune erreur, aucun bloc inattendu et un verrouillage séquentiel (`docs/openai_multimodal_import_audit.json`). Il n’y a donc pas de défaut factuel démontré de séquence ou de présentation par les preuves disponibles.

La réserve principale concerne la **prêt-à-pratiquer dans l’environnement propre de l’apprenant**. Elle est observable directement dans le JSON : les 15 TP de code exposent des consignes, un `starterCode`, un indice et une solution, mais le cours ne contient pas de bloc explicite de préparation de l’environnement (installation/version du SDK, vérification de l’accès API, procédure de configuration sûre de la clé, test de connectivité, ni procédure de contrôle du fichier audio produit). Les solutions utilisent le placeholder `OPENAI_API_TOKEN`; le dernier TP écrit `output.mp3`. Les activités appellent donc implicitement un service OpenAI et, pour le TTS, un système de fichiers local, sans parcours de démarrage autonome visible dans ce fichier. Ceci est une **insuffisance de guidage apprenant observée**, pas la preuve d’une reprise incorrecte.

## Constats étayés

| Constat | Qualification | Preuve locale |
|---|---|---|
| La structure attendue est respectée : 2 chapitres, 24 activités, 7 vidéos, 15 `SingleProcessExercise`, 1 `DragAndDropExercise`, 1 `MultipleChoiceExercise`. | Alignement confirmé | `client/public/data/courses/multi_modal_systems_with_the_openai_api__01.json`, champ `datacampImport.expected`; `docs/openai_multimodal_import_audit.json` |
| Les activités suivent une progression cohérente : speech-to-text, TTS et modération, puis pipeline de chatbot vocal (transcription, langue, traduction, réponse, modérations, traduction et TTS). | Alignement observé dans le JSON; aucune contradiction locale trouvée | `client/public/data/courses/multi_modal_systems_with_the_openai_api__01.json`, `lessons[].chapters[]` |
| Les contrôles locaux ne signalent ni média manquant/invalide, ni bloc inattendu, ni TP sous-préparé. | Contrôle technique positif, sans conclure à la qualité pédagogique complète | `docs/openai_multimodal_import_audit.json` |
| Les TP appellent l’API OpenAI dans leur code de départ/solution et utilisent notamment `OpenAI(api_key="<OPENAI_API_TOKEN>")`; le TTS produit `output.mp3`. | Dépendance visible dans le JSON | `client/public/data/courses/multi_modal_systems_with_the_openai_api__01.json`, activités `dc_ch01_act02` à `dc_ch02_act12` |
| Le JSON ne fournit pas de bloc explicite d’installation ou de vérification de l’environnement apprenant, ni de consigne visible de gestion de clé, de quotas/erreurs réseau ou de récupération du fichier audio. | Insuffisance de guidage directement observable; pas une erreur de source | Même fichier, blocs `code_repl` des 15 TP |
| Les notes locales sur le paquet OpenAI distinguent les URLs externes (`datacamp.com/datalab`, tokenizer, pricing) des actifs locaux et indiquent que les métadonnées `datacampImport` ne sont pas affichées. | Dépendances documentées localement; aucune URL externe affichée comme actif dans le cours audité | `docs/datacamp_working_with_openai_api_source_notes_2026-08-28.md` |

## Correctifs génériques Neopolis réutilisables

1. Ajouter avant le premier TP un **bloc standard “Préparer son environnement”** : version Python/SDK supportée, installation, test minimal et emplacement d’exécution.
2. Ajouter un **bloc standard “Accès API et sécurité”** : variable d’environnement, exemple non secret, vérification de présence de la clé, avertissement sur quotas/coûts et message d’erreur actionnable.
3. Pour chaque TP dépendant d’un service externe, ajouter une **checklist de prérequis et un test de fumée** avec résultat attendu et branche “si l’appel échoue”.
4. Pour les sorties locales, utiliser un **bloc standard “Artefact attendu”** : chemin relatif, vérification d’existence/taille, lecture ou téléchargement de l’artefact (`output.mp3`) et nettoyage facultatif.
5. Conserver le séquencement verrouillé et les interactions actuelles; compléter les TP par un **critère de réussite observable** plutôt que par une nouvelle dépendance externe.

**Verdict :** `source-aligned` sur la structure, la séquence et les médias locaux; **practice readiness : needs-learner-environment-guidance**. Aucun défaut factuel de contenu source n’est retenu sans preuve locale spécifique.

## Sources locales consultées

- `client/public/data/courses/multi_modal_systems_with_the_openai_api__01.json`
- `docs/openai_multimodal_import_audit.json`
- `docs/datacamp_working_with_openai_api_source_notes_2026-08-28.md`
- `docs/datacamp_openai_developing_preflight_2026-08-21.md`
- `scripts/datacamp-importer-core.mjs`
- `scripts/audit-datacamp-course-alignment.mjs`
- `docs/datacamp-course-inventory-2026-09-17.json`
- `docs/interaction-source-audit.json`

Les deux derniers manifestes servent uniquement de repérage local du cours; ils ne constituent pas une preuve de défaut pédagogique.
