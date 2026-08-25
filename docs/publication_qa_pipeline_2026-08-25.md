# Pipeline QA de prépublication

## Objectif

La commande `pnpm qa:publish` constitue le contrôle de prépublication des formations. Elle doit être exécutée sur la prévisualisation avant la création d’un checkpoint destiné à la production.

## Étapes bloquantes

| Étape | Commande exécutée | Échec bloquant si |
|---|---|---|
| Typage | `pnpm check` | Une erreur TypeScript est détectée |
| Données pédagogiques | `pnpm validate-courses` | Un JSON de cours viole le contrat de contenu ou d’interaction |
| Tests | `pnpm vitest run` | Un test applicatif ou de non-régression échoue |
| Interactions | `pnpm audit-interactions` | Une famille interactive ne satisfait plus son contrat de données |
| Matrice desktop | `pnpm check:block-qa` | Un type de bloc n’est pas monté, est limité, reste verrouillé de manière imprévue ou déborde |
| Matrice mobile | `pnpm check:block-qa --mobile` | Le même contrôle échoue à `390 × 844` |

Le pipeline écrit son résultat dans `docs/publication_qa_report.json` et échoue si une étape est `failed` ou `blocked`.

## Exécution contrôlée

La matrice navigateur nécessite un compte de contrôle. Les identifiants ne sont pas enregistrés dans le dépôt ; ils sont passés uniquement par l’environnement de la commande.

```bash
QA_EMAIL="<compte-admin-qa>" \
QA_PASSWORD="<mot-de-passe-qa>" \
BLOCK_QA_URL="http://127.0.0.1:3000" \
pnpm qa:publish
```

> La sonde signale son trafic avec `x-neopolis-qa-probe: 1` uniquement en prévisualisation. Cette exemption est désactivée lorsque `NODE_ENV=production`, de sorte que le limiteur de débit public reste inchangé.

## Règle de publication

Un checkpoint de publication ne doit être créé que lorsque les six étapes sont au statut `passed`. Tout rapport en échec doit être traité comme un blocage de livraison ; le rapport JSON et les captures de la matrice servent alors au diagnostic.
