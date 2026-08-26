import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const coursesDir = resolve("client/public/data/courses");
const replacements = new Map([
  [
    "Drag each item to the layer it belongs to. This is a preparation check before the module design phase. For each statement on the left, drop it into the correct layer on the right. When finished, submit your answers.",
    "Place each statement in the layer it belongs to. This is a preparation check before the module design phase. When finished, submit your answers.",
  ],
  [
    "Glissez chaque élément vers la couche à laquelle il appartient. Il s'agit d'un contrôle de préparation avant la phase de conception du module. Pour chaque énoncé à gauche, déposez-le dans la couche correcte à droite. Lorsque vous avez terminé, soumettez vos réponses.",
    "Placez chaque énoncé dans la couche à laquelle il appartient. Il s'agit d'un contrôle de préparation avant la phase de conception du module. Lorsque vous avez terminé, soumettez vos réponses.",
  ],
  [
    "Match each item on the left to its match on the right across the three sets. This is the readiness check before the design half of the module. Answer all three sets, then submit.",
    "Match each item with its corresponding item across the three sets. This is the readiness check before the design half of the module. Answer all three sets, then submit.",
  ],
  [
    "Faites correspondre chaque élément de la gauche à son équivalent sur la droite dans les trois ensembles. Ceci est la vérification de préparation avant la partie design du module. Répondez à tous les trois ensembles, puis soumettez.",
    "Associez chaque élément à son équivalent dans les trois ensembles. Ceci est la vérification de préparation avant la partie design du module. Répondez aux trois ensembles, puis soumettez.",
  ],
  [
    "Three tasks are described below. Drag each task on the left into the best decision category on the right about using prolonged internal reflection. There is one correct answer per task.",
    "Three tasks are described below. Place each task in the most appropriate decision category for using prolonged internal reflection. There is one correct answer per task.",
  ],
  [
    "Trois tâches sont décrites ci‑dessous. Glissez chaque tâche à gauche vers la catégorie de décision à droite concernant l'utilisation d'une réflexion prolongée. Il y a une seule réponse correcte par tâche.",
    "Trois tâches sont décrites ci‑dessous. Placez chaque tâche dans la catégorie de décision la plus appropriée concernant l'utilisation d'une réflexion prolongée. Il y a une seule réponse correcte par tâche.",
  ],
]);

function replaceRecursively(value, changes) {
  if (typeof value === "string") {
    const replacement = replacements.get(value);
    if (replacement) {
      changes.push({ before: value, after: replacement });
      return replacement;
    }
    return value;
  }
  if (Array.isArray(value)) return value.map((item) => replaceRecursively(item, changes));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, replaceRecursively(item, changes)]));
  return value;
}

const results = [];
for (const filename of readdirSync(coursesDir).filter((name) => name.startsWith("claude_certified_") && name.endsWith(".json")).sort()) {
  const path = join(coursesDir, filename);
  const changes = [];
  const normalized = replaceRecursively(JSON.parse(readFileSync(path, "utf8")), changes);
  if (changes.length > 0) writeFileSync(path, `${JSON.stringify(normalized, null, 2)}\n`);
  if (changes.length > 0) results.push({ filename, replacements: changes.length });
}
console.table(results);
console.log(`Consignes Anthropic normalisées : ${results.reduce((sum, item) => sum + item.replacements, 0)} remplacement(s) dans ${results.length} cours.`);
