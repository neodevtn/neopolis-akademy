import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { getDisplayedChapterProgress, isSequentialActivityNavigationLocked } from "../client/src/pages/training/chapterProgress";

const coursePath = path.resolve(__dirname, "../client/public/data/courses/claude_certified_architect_foundations__01.json");
const course = JSON.parse(fs.readFileSync(coursePath, "utf8"));

const chapters = course.lessons.flatMap((lesson: any) => lesson.chapters || []);
const blocks = chapters.flatMap((chapter: any) => chapter.blocks || []);

describe("Architect Foundations course 1 reconstruction", () => {
  it("keeps the 15 official lesson milestones and the 34 short Neopolis screens", () => {
    expect(course.lessons).toHaveLength(15);
    expect(chapters).toHaveLength(34);
    expect(course.lessons.map((lesson: any) => lesson.title.en)).toContain("Certificate of completion");
    expect(course.lessons.at(-2)).toMatchObject({
      id: "lesson_ai_fluency_certificate",
      title: { en: "Certificate of completion", fr: "Attestation de fin de cours" },
      chapters: [{ completionRule: { requires: ["requiredExercisesPassed"] } }],
    });
    expect(course.lessons.at(-1).title.en).toBe("Additional activities");
  });

  it("clarifies that the 10–15 minute duration applies to the introductory screen", () => {
    const introduction = course.lessons.find((lesson: any) => lesson.title.en === "Introduction to AI Fluency");
    const content = introduction.chapters.find((chapter: any) => chapter.id === "chapter_01").blocks.find((block: any) => block.type === "content");
    expect(content.body.en).toContain("Indicative duration for this screen: 10–15 minutes");
    expect(content.body.fr).toContain("Durée indicative de cet écran : 10–15 minutes");
    expect(content.body.en).not.toContain("Estimated time for this module: 10-15 minutes");
  });

  it("labels and inventories official versus supplementary media without changing the playable video blocks", () => {
    const videos = blocks.filter((block: any) => block.type === "video");
    const official = videos.filter((block: any) => block.mediaMeta?.official === true);
    const supplementary = videos.filter((block: any) => block.mediaMeta?.official === false);
    expect(videos).toHaveLength(17);
    expect(official).toHaveLength(11);
    expect(supplementary).toHaveLength(6);
    for (const video of videos) {
      expect(video.videoId).toBeTruthy();
      expect(video.mediaMeta).toMatchObject({ localAssetId: video.videoId, language: "en", checksumScope: "canonical_video_reference" });
    }
    const downloads = blocks.filter((block: any) => block.type === "download");
    expect(downloads).toHaveLength(14);
    for (const download of downloads) {
      expect(download.assetMeta).toMatchObject({ origin: "anthropic", official: true, mimeType: "application/pdf" });
      expect(download.assetMeta.bytes).toBeGreaterThan(0);
      expect(download.assetMeta.checksum).toMatch(/^sha256:[a-f0-9]{64}$/);
    }
  });

  it("preserves mandatory checkpoints and leaves supplemental tutorials outside the gate", () => {
    const checkpointIds = blocks.filter((block: any) => block.type === "checkpoint").map((block: any) => block.exerciseId);
    expect(checkpointIds).toHaveLength(15);
    expect(new Set(checkpointIds).size).toBe(15);
    expect(course.exercises.find((exercise: any) => exercise.id === "ex_ai_fluency_certificate_completion")).toMatchObject({
      required: true,
      interactionType: "single_choice",
      sourcePedagogique: "AI Fluency: Framework & Foundations — 4D framework and conclusion",
    });
    const tutorials = course.lessons[0].chapters.find((chapter: any) => chapter.id === "chapter_03");
    expect(tutorials.blocks[0]).toMatchObject({ type: "callout", title: { fr: "Complément Neopolis" } });
  });

  it("locks each required checkpoint until completion and resets the chapter display when the reconstructed lesson changes", () => {
    const introductionCheckpointChapter = course.lessons[0].chapters.find((chapter: any) => chapter.id === "chapter_02");
    const certificateCheckpointChapter = course.lessons.find((lesson: any) => lesson.id === "lesson_ai_fluency_certificate").chapters[0];

    const empty = new Set<string>();
    expect(isSequentialActivityNavigationLocked({ blocks: introductionCheckpointChapter.blocks, completedExercises: empty, completedCloudExercises: empty, completedMatching: empty, completedInlineInteractions: empty })).toBe(true);
    expect(isSequentialActivityNavigationLocked({ blocks: certificateCheckpointChapter.blocks, completedExercises: new Set(["ex_ai_fluency_certificate_completion"]), completedCloudExercises: empty, completedMatching: empty, completedInlineInteractions: empty })).toBe(false);
    expect(getDisplayedChapterProgress({ current: 1, total: 2 }, 13, 14, certificateCheckpointChapter.blocks.length)).toEqual({ current: 0, total: 3 });
  });
});
