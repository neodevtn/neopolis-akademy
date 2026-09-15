import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const readerSource = readFileSync(resolve(process.cwd(), "client/src/pages/TrainingCourse.tsx"), "utf8");
const certificationSource = readFileSync(resolve(process.cwd(), "client/src/pages/TrainingCertification.tsx"), "utf8");
const catalogEditorSource = readFileSync(resolve(process.cwd(), "client/src/components/admin/CatalogMetadataEditor.tsx"), "utf8");
const index = JSON.parse(readFileSync(resolve(process.cwd(), "client/src/data/trainingIndex.json"), "utf8"));
const associateCourse = JSON.parse(readFileSync(resolve(process.cwd(), "client/public/data/courses/claude_certified_associate_foundations__01.json"), "utf8"));

describe("TrainingCourse official-duration contract", () => {
  it("renders official and Neopolis durations through shared course metadata", () => {
    expect(readerSource).toContain("officialDurationMinutes");
    expect(readerSource).toContain('t({ en: "Official duration", fr: "Durée officielle" })');
    expect(readerSource).toContain('t({ en: "Neopolis estimate", fr: "Estimation Neopolis" })');
    expect(certificationSource).toContain("Number(course.officialDurationMinutes)");
    expect(catalogEditorSource).toContain("Durée officielle (minutes)");
    expect(catalogEditorSource).toContain("Estimation Neopolis");
  });

  it("keeps the Associate course 1 at ten screens and records its Skilljar duration", () => {
    const metadata = index.courses.find((course: { id: string }) => course.id === "claude_certified_associate_foundations__01");
    expect(metadata).toMatchObject({ title: { en: "Claude Platform & Model Foundations" }, chapterCount: 10, exerciseCount: 8, officialDurationMinutes: 59 });
    expect(associateCourse.lessons[0].chapters).toHaveLength(10);
    expect(associateCourse.lessons[0].chapters[0].blocks[0].body.en).toContain("Official duration (Skilljar):** 59 minutes");
    expect(associateCourse.lessons[0].chapters[0].blocks[0].body.fr).toContain("Durée officielle (Skilljar) :** 59 minutes");
  });

  it("preserves the standard capability tabs and the required entry-point sorting activity", () => {
    const chapters = associateCourse.lessons[0].chapters;
    const capabilityChapter = chapters.find((chapter: { title: { en: string } }) => chapter.title.en === "Capability Layer");
    expect(capabilityChapter.blocks.some((block: { type: string }) => block.type === "bucket_sort")).toBe(true);
    expect(capabilityChapter.blocks.find((block: { type: string }) => block.type === "tabbed_content").tabs.map((tab: { label: { en: string } }) => tab.label.en)).toEqual(["Skills", "Code Execution", "Memory"]);
  });
});
