# Inventaire des prompts Anthropic restants — 2026-09-15

## Sources relues

Les consignes de correction disponibles dans le dossier Drive `1RiIVPJY7gV_fbGjJf3itnxZJ1CcRhxto` ont été téléchargées et relues. Elles couvrent quatre familles : **Associate**, **Developer**, **Architect Professional** et **Architect Foundations**. Le lot **Architect Foundations cours 1** est déjà clôturé et publié ; les corrections restantes concernent donc prioritairement les autres cours de ces parcours, en respectant l’ordre interne de chaque prompt.

## Ordre de traitement retenu

| Parcours | Fichier source | Premier cours à traiter | Statut actuel |
|---|---|---|---|
| Associate Foundations | `PROMPT_MANUS_ASSOCIATE_2026-09-14.md` | `claude_certified_associate_foundations__01` | À corriger en premier selon la consigne |
| Developer Foundations | `PROMPT_MANUS_DEVELOPER_2026-09-14.md` | `claude_certified_developer_foundations__01` | En attente après Associate |
| Architect Professional | `PROMPT_MANUS_ARCHITECT_PROFESSIONAL_2026-09-14.md` | `claude_certified_architect_professional__01` | En attente après Developer ou arbitrage futur |
| Architect Foundations | `PROMPT_MANUS_ARCHITECT_FOUNDATIONS_2026-09-14.md` | `claude_certified_architect_foundations__02` | Cours 1 déjà clôturé ; suite à reprendre plus tard |

## Constat d’audit disponible

Les audits locaux actuels remontent encore **19 cours affectés sur 28** pour le contenu, **12 reliquats de localisation** et **24 cours Anthropic avec signaux directionnels** à vérifier dans leur contexte. Les faux positifs les plus probables concernent les transcriptions dupliquées avec leurs segments et certains énoncés d’exercices volontairement proches ; ils ne doivent pas être corrigés sans vérification ciblée.

## Première cible confirmée

Le prompt Associate impose de **commencer uniquement par le cours 1** `Claude Platform & Model Foundations`, avec les objectifs suivants : afficher la **durée officielle 59 min**, conserver les **10 écrans**, vérifier l’activité de tri, les onglets **Skills / Code Execution / Memory**, et préserver la terminologie produit Anthropic. L’audit PDF Associate confirme ces priorités et rappelle que les durées officielles Skilljar manquent encore sur les cartes Neopolis.

## Règles de garde

Les corrections doivent rester limitées aux **blocs standards Neopolis**, préserver le **verrouillage séquentiel**, maintenir les **titres officiels anglais** avec libellés localisés, et conserver les **noms produits non traduits**. Toute correction doit être accompagnée de tests et d’un contrôle navigateur avant publication.
