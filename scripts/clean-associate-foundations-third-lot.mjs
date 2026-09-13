import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const coursePath = resolve(
  process.cwd(),
  "client/public/data/courses/claude_certified_associate_foundations__03.json",
);
const course = JSON.parse(await readFile(coursePath, "utf8"));
const lesson = course.lessons?.[0];
const verificationChapter = lesson?.chapters?.find((chapter) =>
  chapter.blocks?.some((block) =>
    block.type === "flip_cards" && block.cards?.some((card) => card.back?.en?.includes("If the answer is not supported")),
  ),
);
const formatsChapter = lesson?.chapters?.find((chapter) => /output formats/i.test(chapter.title?.en || ""));

if (
  lesson?.id !== "lesson_01" ||
  verificationChapter?.blocks?.[1]?.type !== "flip_cards" ||
  formatsChapter?.blocks?.[0]?.type !== "content"
) {
  throw new Error("Les blocs Associate Foundations 03 attendus sont introuvables.");
}

for (const chapter of lesson.chapters) {
  if (chapter.title?.fr === "discernement" || chapter.title?.fr === "assiduité") {
    chapter.title.fr = chapter.title.fr.replace(/^./, (letter) => letter.toLocaleUpperCase("fr-FR"));
  }
}

const duplicateMarker = "\n\nDes entrées organisées produisent des sorties organisées.";
const formatsBody = formatsChapter.blocks[0].body;
const duplicateIndex = formatsBody.fr.lastIndexOf(duplicateMarker);
if (duplicateIndex > 0 && formatsBody.fr.includes("Des entrées bien organisées donnent des sorties bien organisées.")) {
  formatsBody.fr = formatsBody.fr.slice(0, duplicateIndex);
}

const permissionCard = verificationChapter.blocks[1].cards?.[1];
const sourceRestrictionCard = verificationChapter.blocks[1].cards?.[2];
if (!permissionCard || !sourceRestrictionCard) {
  throw new Error("Les cartes de vérification attendues sont introuvables.");
}
permissionCard.back.fr = "« Si la réponse n’est pas étayée par les documents que j’ai fournis, dites-le explicitement plutôt que d’estimer. Il est acceptable de répondre : “les documents fournis ne couvrent pas ce point”. »";
sourceRestrictionCard.back.fr = "« Répondez uniquement à partir du contrat joint. N’utilisez pas de connaissances générales. Pour tout ce que le contrat ne traite pas, indiquez : “Non couvert par ce document”. »";

if (process.argv[2] !== "--write") {
  console.log("Contrôle réussi. Relancez avec --write pour appliquer les corrections.");
  process.exit(0);
}

await writeFile(coursePath, `${JSON.stringify(course, null, 2)}\n`, "utf8");
console.log(`Corrections appliquées : ${coursePath}`);
