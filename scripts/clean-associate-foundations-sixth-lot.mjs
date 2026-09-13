import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const coursePath = resolve(
  process.cwd(),
  "client/public/data/courses/claude_certified_associate_foundations__06.json",
);
const course = JSON.parse(await readFile(coursePath, "utf8"));
const screeningExercise = course.exercises?.find((exercise) => exercise.prompt?.en?.includes("CriterionThe question to ask"));
const trustExercise = course.exercises?.find((exercise) => exercise.prompt?.en?.includes("Flip each check to see the question to ask."));
const ethicsExercise = course.exercises?.find((exercise) => exercise.prompt?.fr?.includes("AI-assisted work products can carry bias"));

if (!screeningExercise || !trustExercise || !ethicsExercise) {
  throw new Error("Les exercices Associate Foundations 06 attendus sont introuvables.");
}

screeningExercise.prompt.en = `## Delegation criteria for screening

| Criterion | The question to ask |
| --- | --- |
| Reversibility | Can a wrong output be caught and undone before it causes harm? Irreversible consequences raise the bar sharply. |
| Consequence of error | What is the cost if the output is wrong? Higher consequence demands more human control or rules the use case out. |
| Need for human creativity or empathy | Does the task require judgment, relationship, or care that AI cannot supply? Some work should stay human regardless of capability. |`;
screeningExercise.prompt.fr = `## Critères de délégation pour le filtrage

| Critère | Question à poser |
| --- | --- |
| Réversibilité | Peut-on détecter et annuler une sortie erronée avant qu’elle ne cause des dommages ? Des conséquences irréversibles font fortement monter le seuil. |
| Conséquence d’une erreur | Quel est le coût si la sortie est erronée ? Des conséquences plus élevées exigent davantage de contrôle humain ou excluent le cas d’utilisation. |
| Besoin de créativité humaine ou d’empathie | La tâche nécessite-t-elle du jugement, une relation ou une attention que l’IA ne peut pas fournir ? Certaines tâches doivent rester humaines quelles que soient les capacités. |`;

trustExercise.prompt.en = trustExercise.prompt.en.replace(
  "Flip each check to see the question to ask.",
  "Review each trust check below before answering.",
);
trustExercise.prompt.fr = trustExercise.prompt.fr.replace(
  "Basculez chaque vérification pour voir la question à poser.",
  "Examinez chaque vérification de confiance ci-dessous avant de répondre.",
);

ethicsExercise.prompt.fr = ethicsExercise.prompt.fr
  .replace("un document AI-assisted présenté comme entièrement rédigé par des humains", "un document assisté par l’IA présenté comme entièrement rédigé par des humains")
  .replace(
    "AI-assisted work products can carry bias from the prompt, the framing, or the underlying patterns in how language is generated.",
    "Les productions assistées par l’IA peuvent porter des biais provenant du prompt, du cadrage ou des motifs sous-jacents de génération du langage.",
  )
  .replace("si un framing a biaisé le résultat", "si un cadrage a biaisé le résultat");

if (process.argv[2] !== "--write") {
  console.log("Contrôle réussi. Relancez avec --write pour appliquer les corrections.");
  process.exit(0);
}

await writeFile(coursePath, `${JSON.stringify(course, null, 2)}\n`, "utf8");
console.log(`Corrections appliquées : ${coursePath}`);
