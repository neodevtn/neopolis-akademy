# Réévaluation pédagogique complète — 18 octobre 2026

## Résultat

- Note pédagogique actuelle : **87.43/100**.
- Score initial : **71.83/100**.
- Évolution : **+15.60 points**.
- Couverture : **116/116 formations**, **3003 écrans** actuels.
- Médiane actuelle : **89.0 / 100**.

## Distribution des écrans notés

| Intervalle | Écrans |
|---|---:|
| 0–39 | 3 |
| 40–59 | 43 |
| 60–79 | 511 |
| 80–100 | 2446 |

## Contrôles et décision de publication

- Contrôleur structurel : PASS — P0=0, P1=0, P2=0, P3=0 au contrôleur déterministe courant.
- Grille qualitative : **BLOCKED** — Des P0 ou P1 qualitatifs ouverts subsistent malgré la conformité structurelle.
- Constats qualitatifs ouverts : **P0 2**, **P1 85**, **P2 228**, **P3 63**.

## Progression des constats par sévérité

| Priorité | Audit initial | État actuel | Réduction nette | Réduction nette |
|---|---:|---:|---:|---:|
| P0 | 223 | 2 | 221 | 99.10 % |
| P1 | 926 | 85 | 841 | 90.82 % |
| P2 | 679 | 228 | 451 | 66.42 % |
| P3 | 132 | 63 | 69 | 52.27 % |
| **Total** | **1960** | **378** | **1582** | **80.71 %** |

La hausse et la réduction nette ne sont pas une comparaison strictement à périmètre constant : l’audit initial notait 3 552 écrans, alors que 3 003 écrans actuels sont notés. Les 549 écrans absents ou restructurés correspondent en grande partie à des activités retirées avec trace, parce qu’elles ne pouvaient pas être réalisées sans fichier, jeu de données ou environnement fourni. Ils ne sont pas artificiellement notés comme réussis. Les comptes par priorité mesurent donc le backlog actuel revu, pas une correspondance un-à-un présumée de chaque constat historique.

## Formations à plus faible note actuelle

| Formation | Score | Écrans | P0 | P1 |
|---|---:|---:|---:|---:|
| Créer des agents d’IA avec CrewAI | 67.00 | 2 | 0 | 1 |
| Automatisation comptable par l’IA | 67.81 | 47 | 0 | 10 |
| Innover avec Google Cloud AI | 71.61 | 23 | 0 | 11 |
| Développement logiciel avec GitHub Copilot | 72.15 | 27 | 0 | 11 |
| Claude Certified Architect – Fondations | 74.80 | 373 | 0 | 0 |
| Claude Certified Architect – Professionnel | 80.15 | 54 | 0 | 0 |
| Claude Code en action | 80.23 | 22 | 0 | 0 |
| Utiliser l’API OpenAI Responses | 82.24 | 17 | 0 | 2 |
| L’IA pour le conseil | 82.35 | 17 | 0 | 0 |
| Développement logiciel avec Windsurf | 82.46 | 28 | 0 | 0 |
| Initiation à l’automatisation de workflows | 82.72 | 18 | 0 | 0 |
| Construire un agent de recherche Web avec Perplexity | 83.80 | 5 | 0 | 0 |

## P0 qualitatifs à traiter avant toute validation pédagogique globale

- **Développer des systèmes d’IA avec l’API OpenAI** — `developing_ai_systems_with_the_openai_api__01` / `dc_ch02_act15` : L’écran obligatoire est présenté comme un exercice — il mentionne un response, json et get_exchange_rate() « préchargés » — mais l’état actuel ne fournit qu’un bloc content statique. L’apprenant ne peut ni effectuer les vérifications décrites ni soumettre une réponse ou obtenir un feedback.
- **Automatisation de workflows avancée** — `intermediate_workflow_automation_with_n8n__01` / `dc_ch02_act07` : Le TP obligatoire demande de charger un workflow existant puis de modifier son nœud Python Code et ses branches « Is Valid? », mais ne déclare qu’un fichier de lignes synthétiques. Aucun workflow de départ n’est fourni ni reconstructible à partir des étapes affichées; l’activité verrouillée ne peut donc pas être réalisée telle qu’énoncée.

## Méthode

Moyenne arithmétique des notes v2 de tous les écrans actuels. Les dimensions non vérifiables sont neutres; une activité retirée, non affichée et non verrouillante n’est pas notée.
