import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const coursePath = resolve(
  process.cwd(),
  "client/public/data/courses/claude_certified_associate_foundations__05.json",
);
const course = JSON.parse(await readFile(coursePath, "utf8"));
const lesson = course.lessons?.[0];
const projectChapter = lesson?.chapters?.find((chapter) =>
  chapter.blocks?.some((block) => block.type === "flip_cards" && block.cards?.[0]?.back?.en?.includes("what makes a Proj")),
);

if (lesson?.id !== "lesson_01" || projectChapter?.blocks?.[1]?.type !== "flip_cards") {
  throw new Error("La carte de configuration de Project attendue est introuvable.");
}

const projectCard = projectChapter.blocks[1].cards[0];
projectCard.back.en = "A Project has several configuration slots, and the skill is putting each piece of a recurring need into the right one. Instructions govern behavior, the knowledge base holds facts, Skills carry procedures, and scoped Memory keeps continuity. Choosing the right slot for each need is what makes a Project effective.";
projectCard.back.fr = "Un Projet dispose de plusieurs emplacements de configuration, et la compétence consiste à placer chaque élément d’un besoin récurrent au bon endroit. Les instructions régissent le comportement, la base de connaissances contient les faits, les Skills portent les procédures et la Mémoire contextualisée assure la continuité. Choisir le bon emplacement pour chaque besoin rend un Projet efficace.";

if (process.argv[2] !== "--write") {
  console.log("Contrôle réussi. Relancez avec --write pour appliquer les corrections.");
  process.exit(0);
}

await writeFile(coursePath, `${JSON.stringify(course, null, 2)}\n`, "utf8");
console.log(`Corrections appliquées : ${coursePath}`);
