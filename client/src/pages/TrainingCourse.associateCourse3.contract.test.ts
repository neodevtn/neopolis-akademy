import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const index = JSON.parse(readFileSync(resolve(process.cwd(), "client/src/data/trainingIndex.json"), "utf8"));
const course = JSON.parse(readFileSync(resolve(process.cwd(), "client/public/data/courses/claude_certified_associate_foundations__03.json"), "utf8"));

describe("Claude Certified Associate course 3 contract", () => {
  const chapters = course.lessons[0].chapters;

  it("keeps the canonical title, eleven-screen sequence, and the 74-minute source duration", () => {
    const metadata = index.courses.find((item: { id: string }) => item.id === "claude_certified_associate_foundations__03");
    expect(metadata).toMatchObject({
      title: { en: "Evaluating & Validating Claude's Output" },
      chapterCount: 11,
      officialDurationMinutes: 74,
    });
    expect(chapters).toHaveLength(11);
    expect(course.lessons[0].title.fr).toBe("Évaluer et valider les résultats de Claude");
    expect(chapters[0].blocks[0].body.en).toContain("Official duration (Skilljar):** 74 minutes");
    expect(chapters[0].blocks[0].body.fr).toContain("Durée officielle (Skilljar) :** 74 minutes");
  });

  it("preserves the grounded-source quiz and the two standard output-triage activities", () => {
    const triage = chapters.find((chapter: { id: string }) => chapter.id === "chapter_07");
    const quiz = chapters.find((chapter: { id: string }) => chapter.id === "chapter_08");

    expect(quiz.blocks.filter((block: { type: string }) => block.type === "single_choice_exercise")).toHaveLength(5);
    expect(quiz.blocks.some((block: { question: { en: string } }) => block.question?.en.includes("strictly based on a set of uploaded quarterly earnings documents"))).toBe(true);
    expect(triage.blocks.filter((block: any) => block.type === 'bucket_sort')).toHaveLength(2);
    expect(triage.blocks.filter((block: any) => block.type === 'bucket_sort').every((block: any) => block.correction?.fr && block.correction?.en)).toBe(true);
    expect(triage.blocks[0].buckets.map((bucket: { id: string }) => bucket.id)).toEqual(["safe", "verify", "unreliable", "harmful"]);
    expect(triage.blocks[0].cards.find((card: { id: string }) => card.id === "card_3").correctBucket).toBe("verify");
    expect(triage.blocks[0].instructions.fr).not.toContain("(Safe)");
    expect(triage.blocks[0].instructions.fr).not.toContain("(Verify)");
    expect(JSON.stringify(chapters)).not.toContain('"fr":"Choisis le format');
    expect(JSON.stringify(chapters)).not.toContain('"fr":"Autoriser \\"I don\'t know');
  });

  it("uses the official Diligence term in French instead of a misleading attendance label", () => {
    const diligence = chapters.find((chapter: { id: string }) => chapter.id === "chapter_04");
    expect(diligence.title.fr).toBe("Diligence");
  });
});
