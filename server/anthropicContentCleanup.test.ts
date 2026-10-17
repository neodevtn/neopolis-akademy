import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const coursePath = resolve(
  process.cwd(),
  "client/public/data/courses/claude_certified_associate_foundations__01.json",
);

async function loadCourse() {
  return JSON.parse(await readFile(coursePath, "utf8"));
}

function countBlocks(course: any) {
  return course.lessons.flatMap((lesson: any) => lesson.chapters).reduce(
    (count: number, chapter: any) => count + chapter.blocks.length,
    0,
  );
}

describe("nettoyage pédagogique Anthropic — Associate Foundations 01", () => {
  it("préserve la structure et les interactions du parcours", async () => {
    const course = await loadCourse();

    expect(course.lessons).toHaveLength(1);
    expect(course.lessons[0].chapters).toHaveLength(10);
    expect(countBlocks(course)).toBe(25);
    expect(course.exercises).toHaveLength(0);
    expect(course.lessons[0].completionRule).toEqual({ requires: ["allChaptersComplete"] });
    expect(course.lessons[0].chapters[3].blocks.map((block: any) => block.type)).toEqual([
      "content",
      "tabbed_content",
      "content",
      "content",
      "bucket_sort",
    ]);
  });

  it("retire les concaténations et placeholders confirmés tout en gardant le scénario factuel", async () => {
    const course = await loadCourse();
    const capabilityChapter = course.lessons[0].chapters[3];
    const memoryTab = capabilityChapter.blocks[1].tabs.find((tab: any) => tab.label.en === "Memory");
    const scenario = capabilityChapter.blocks[2].body;
    const scenarioActivity = capabilityChapter.blocks.find((block: any) => block.id === "bucket_capability_layer");

    expect(memoryTab.content.fr).not.toContain("ScenarioCapability Layer");
    expect(memoryTab.content.fr).not.toContain("QuestionLayer");
    expect(scenario.fr).not.toContain("Scénario illustratif");
    expect(scenario.en).not.toContain("Illustrative Scenario");
    expect(scenario.fr).toContain("| Question | Couche correspondante |");
    expect(scenarioActivity).toMatchObject({ type: "bucket_sort", title: { fr: "Classez les composants dans les couches de capacité" } });
    expect(capabilityChapter.blocks.some((block: any) => block.type === "checkpoint")).toBe(false);
  });

  it("fournit un contenu français localisé et des tableaux Markdown rendables", async () => {
    const course = await loadCourse();
    const capabilityBody = course.lessons[0].chapters[3].blocks[0].body.fr;
    const takeaways = course.lessons[0].chapters[9].blocks[0].body.fr;
    const entryPointActivity = course.lessons[0].chapters[2].blocks.find((block: any) => block.id === "bucket_entry_points");

    expect(capabilityBody).not.toContain("Entry points determine where you work");
    expect(capabilityBody).toContain("| Couche | Rôle | À utiliser lorsque |");
    expect(takeaways.match(/Révisez les concepts clés de cette section/g)).toBeNull();
    expect(entryPointActivity).toMatchObject({ type: "bucket_sort", title: { fr: "Associez les types de tâches aux points d'entrée" } });
    expect(entryPointActivity.instructions.fr).toMatch(/point d['’]entrée/);
  });
});
