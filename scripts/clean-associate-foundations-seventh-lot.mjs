import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const coursePath = resolve(
  process.cwd(),
  "client/public/data/courses/claude_certified_associate_foundations__07.json",
);
const course = JSON.parse(await readFile(coursePath, "utf8"));
const vagueFeedbackExercise = course.exercises?.find((exercise) => exercise.title?.en?.includes("does not impro"));
const promotedFixExercise = course.exercises?.find((exercise) => exercise.prompt?.fr?.includes("Claude's Memory peut repérer"));

if (!vagueFeedbackExercise || !promotedFixExercise) {
  throw new Error("Les exercices Associate Foundations 07 attendus sont introuvables.");
}

vagueFeedbackExercise.title.en = 'A vague "this isn’t quite right" does not improve the result.';
vagueFeedbackExercise.title.fr = 'Un vague « ce n’est pas tout à fait juste » n’améliore pas le résultat.';
promotedFixExercise.prompt.fr = promotedFixExercise.prompt.fr
  .replace("Claude's Memory peut repérer des motifs que vous répétez, mais il est par utilisateur et best-effort", "La Mémoire de Claude peut repérer des motifs que vous répétez, mais elle fonctionne par utilisateur et sans garantie")
  .replace("Basculer pour comparer la même correction capturée à celle laissée dans une conversation ponctuelle.", "Comparez la correction conservée à celle laissée dans une conversation ponctuelle.");

if (process.argv[2] !== "--write") {
  console.log("Contrôle réussi. Relancez avec --write pour appliquer les corrections.");
  process.exit(0);
}

await writeFile(coursePath, `${JSON.stringify(course, null, 2)}\n`, "utf8");
console.log(`Corrections appliquées : ${coursePath}`);
