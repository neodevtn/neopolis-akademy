import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const coursePath = resolve(
  process.cwd(),
  "client/public/data/courses/claude_certified_associate_foundations__08.json",
);
const course = JSON.parse(await readFile(coursePath, "utf8"));
const lesson = course.lessons?.[0];
const summaryChapter = lesson?.chapters?.find((chapter) => chapter.blocks?.[0]?.body?.en?.includes("Table of contents"));

if (lesson?.id !== "lesson_01" || summaryChapter?.blocks?.[0]?.type !== "content" || summaryChapter?.blocks?.[1]?.type !== "flip_cards") {
  throw new Error("Le chapitre récapitulatif Associate 08 attendu est introuvable.");
}

function replaceSection(body, startMarker, endMarker, replacement) {
  const start = body.indexOf(startMarker);
  const end = body.indexOf(endMarker, start);
  if (start < 0 || end < 0 || end <= start) return body;
  return `${body.slice(0, start)}${replacement}${body.slice(end)}`;
}

const body = summaryChapter.blocks[0].body;
body.en = replaceSection(
  body.en.replace("\nTable of contents\nBegin module →\n1 screen · 1 lesson · 8 minutes\nAssociate · Module 8\nCourse Summary & Next Steps\nModule 8 · Course Summary\nCourse Closing·8 min", ""),
    "The AI Fluency thread",
    "Preparing for the exam",
    `## The AI Fluency thread

Four competencies ran through every module and are worth carrying forward as a single mental model:

| Competency | What it means |
| --- | --- |
| Description | Telling Claude precisely what you want: the prompting discipline built when you learned to structure a request and adapt it to the task. |
| Discernment | Critically evaluating what comes back and checking the signals that should trigger a closer look before you trust an output. |
| Diligence | Owning the output and verifying it: the accountability stance that keeps a human answerable for what Claude produces. |
| Delegation | Deciding what is right for Claude, what stays with a person, and what the two do together in workflow and governance decisions. |

`,
);
body.fr = replaceSection(
  body.fr.replace("\nTable des matières\nCommencer le module →\n1 écran · 1 leçon · 8 minutes\nAssociate · Module 8\nRésumé du cours et prochaines étapes\nModule 8 · Résumé du cours\nClôture du cours · 8 min", ""),
    "Le fil AI Fluency",
    "Préparation à l’examen",
    `## Le fil de compétences AI Fluency

Quatre compétences ont traversé chaque module et forment un modèle mental unique :

| Compétence | Ce qu’elle recouvre |
| --- | --- |
| Description | Dire précisément à Claude ce que vous voulez : la discipline de prompting construite en apprenant à structurer une requête et à l’adapter à la tâche. |
| Discernement | Évaluer de manière critique ce qui revient et repérer les signaux qui exigent un examen plus attentif avant de faire confiance à une sortie. |
| Diligence | Assumer la responsabilité de la sortie et la vérifier : la posture qui maintient un humain responsable de ce que Claude produit. |
| Délégation | Décider ce qui convient à Claude, ce qui reste à une personne et ce que les deux font ensemble dans les décisions de workflow et de gouvernance. |

`,
);

for (const key of ["en", "fr"]) {
  const tailStart = body[key].lastIndexOf("\nM1\n");
  const completionStart = key === "en" ? body[key].indexOf("You’ve completed the full Associate certification path") : body[key].indexOf("Félicitations ! Vous avez terminé avec succès ce module.");
  if (tailStart > completionStart && completionStart >= 0) body[key] = body[key].slice(0, tailStart);
}

const cards = summaryChapter.blocks[1].cards;
if (cards[1]?.front?.en === "Course Summary & Next Steps") {
  cards[1].front.en = "Operating Claude with discipline";
  cards[1].front.fr = "Opérer Claude avec rigueur";
}

if (process.argv[2] !== "--write") {
  console.log("Contrôle réussi. Relancez avec --write pour appliquer les corrections.");
  process.exit(0);
}

await writeFile(coursePath, `${JSON.stringify(course, null, 2)}\n`, "utf8");
console.log(`Corrections appliquées : ${coursePath}`);
