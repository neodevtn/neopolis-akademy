import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const coursePath = resolve(
  process.cwd(),
  "client/public/data/courses/claude_certified_associate_foundations__02.json",
);
const course = JSON.parse(await readFile(coursePath, "utf8"));
const lesson = course.lessons?.[0];
const anatomyChapter = lesson?.chapters?.[1];
const iterationChapter = lesson?.chapters?.[3];

if (
  lesson?.id !== "lesson_01" ||
  anatomyChapter?.blocks?.[0]?.type !== "content" ||
  anatomyChapter?.blocks?.[1]?.type !== "flip_cards" ||
  iterationChapter?.blocks?.[0]?.type !== "content" ||
  iterationChapter?.blocks?.[1]?.type !== "flip_cards"
) {
  throw new Error("Les blocs Associate Foundations 02 attendus sont introuvables.");
}

function replaceBetween(body, startMarker, endMarker, replacement) {
  const start = body.indexOf(startMarker);
  const end = body.indexOf(endMarker);
  if (start < 0 || end < 0 || end <= start) return body;
  return `${body.slice(0, start)}${replacement}${body.slice(end)}`;
}

const anatomyBody = anatomyChapter.blocks[0].body;
const anatomySuffixEn = anatomyBody.en.indexOf("\n\nDescription in practice");
const anatomySuffixFr = anatomyBody.fr.indexOf("\n\nDescription en pratique");
if (anatomySuffixEn < 0 || anatomySuffixFr < 0) {
  throw new Error("Les sections de pratique attendues sont introuvables dans l’anatomie du prompt.");
}
anatomyBody.en = `## Anatomy of an Effective Prompt

A strong prompt is built from components, and most weak prompts are missing one or more of them.

Naming the components turns prompting from guesswork into a checklist you can run before sending any non-trivial request.

## The component stack

A professional prompt can combine **Role**, **Context**, **Task**, **Constraints**, and **Output format**. Explore the five cards below to see what each component controls.

Not every prompt needs all five components. A quick question needs a task and perhaps a constraint; a client deliverable typically needs all five. The skill is noticing which components a task requires.${anatomyBody.en.slice(anatomySuffixEn)}`;
anatomyBody.fr = `## Anatomie d’un prompt efficace

Un prompt solide est construit à partir de composants, et la plupart des prompts faibles en omettent un ou plusieurs.

Nommer les composants transforme le prompting du tâtonnement en une liste de contrôle que vous pouvez exécuter avant d'envoyer toute demande non triviale.

## La pile des composants

Un prompt professionnel peut combiner le **rôle**, le **contexte**, la **tâche**, les **contraintes** et le **format de sortie**. Consultez les cinq cartes ci-dessous pour comprendre ce que contrôle chaque composant.

Tous les prompts n’ont pas besoin des cinq composants. Une question rapide nécessite une tâche et peut-être une contrainte ; un livrable destiné à un client a généralement besoin des cinq. La compétence consiste à identifier ceux qu’exige une tâche.${anatomyBody.fr.slice(anatomySuffixFr)}`;

const iterationBody = iterationChapter.blocks[0].body;
iterationBody.en = replaceBetween(
  iterationBody.en,
  "\n\nSymptomLikely causeFix",
  "\n\nTargeted revision, not wholesale rewriting",
  "\n\nExplore the diagnostic cards below to connect a symptom to its likely cause and the focused correction that follows.",
);
iterationBody.fr = replaceBetween(
  iterationBody.fr,
  "\n\nSymptôme — Cause probable — Correctif",
  "\n\nRévision ciblée, pas réécriture en bloc",
  "\n\nConsultez les cartes de diagnostic ci-dessous pour relier un symptôme à sa cause probable et à la correction ciblée à appliquer.",
);

const diagnosticCard = iterationChapter.blocks[1].cards?.[2];
const outputFormatCard = anatomyChapter.blocks[1].cards?.[4];
if (!diagnosticCard || !outputFormatCard) throw new Error("Les cartes de correction attendues sont introuvables.");
outputFormatCard.back.en = "The shape of the result: a table, a bulleted list, a three-paragraph memo, or a draft email. Stating the format up front saves an iteration. Not every prompt needs all five. A quick question needs a task and maybe a constraint. A client deliverable needs all five. The skill is noticing which components a given task requires.";
outputFormatCard.back.fr = "La forme du résultat : un tableau, une liste à puces, une note de trois paragraphes ou un brouillon d’e-mail. Indiquer le format dès le départ évite une itération. Tous les prompts n’ont pas besoin des cinq éléments. Une question rapide nécessite une tâche et peut-être une contrainte. Un livrable client a besoin des cinq. La compétence consiste à repérer quels éléments exige une tâche donnée.";
diagnosticCard.front.en = "Symptom · Likely cause · Fix";
diagnosticCard.front.fr = "Symptôme · Cause probable · Correctif";
diagnosticCard.back.en = "Symptom: output is generic or off-base.\nLikely cause: the context was too thin.\nFix: add the background Claude could not infer.";
diagnosticCard.back.fr = "Symptôme : la sortie est générique ou hors sujet.\nCause probable : le contexte était insuffisant.\nCorrectif : ajoutez le contexte que Claude ne pouvait pas déduire.";

if (process.argv[2] !== "--write") {
  console.log("Contrôle réussi. Relancez avec --write pour appliquer les corrections.");
  process.exit(0);
}

await writeFile(coursePath, `${JSON.stringify(course, null, 2)}\n`, "utf8");
console.log(`Corrections appliquées : ${coursePath}`);
