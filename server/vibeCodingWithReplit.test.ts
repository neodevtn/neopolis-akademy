import { describe, expect, it } from "vitest";
import course from "../client/public/data/courses/vibe_coding_with_replit__01.json";
import catalog from "../client/src/data/trainingIndex.json";

describe("cours DataCamp Coder en mode Vibe avec Replit", () => {
  const activities = course.lessons.flatMap((lesson: any) => lesson.chapters);
  const blocks = activities.flatMap((activity: any) => activity.blocks || []);
  // Les sept actifs ci-dessous ont été vérifiés par ffprobe dans le correctif
  // expert P1 (H.264 3840×2160 + AAC). Le JSON référence les actifs gérés ;
  // il ne duplique volontairement pas leurs métadonnées binaires.
  const hostedMp4s = new Map([
    ["dc_ch01_act04", 428],
    ["dc_ch01_act06", 180.5],
    ["dc_ch02_act04", 351.6],
    ["dc_ch03_act04", 462.8],
    ["dc_ch03_act06", 334.516667],
    ["dc_ch03_act08", 252.766667],
    ["dc_ch04_act03", 367.15],
  ]);
  const projectorActivityIds = [
    "dc_ch01_act01",
    "dc_ch01_act08",
    "dc_ch02_act01",
    "dc_ch03_act01",
    "dc_ch04_act01",
    "dc_ch04_act05",
    "dc_ch04_act07",
  ];

  it("publie les compteurs canoniques et le rattachement catalogue", () => {
    const certification = catalog.certifications.find((entry: any) => entry.id === "datacamp_vibe_coding_with_replit");
    const courseIndex = catalog.courses.find((entry: any) => entry.id === "vibe_coding_with_replit__01");
    expect(certification).toMatchObject({ totalLessons: 4, totalActivities: 31, totalVideos: 14, totalExercises: 17, totalDownloads: 4 });
    expect(courseIndex).toMatchObject({ certId: certification?.id, totalActivities: 31, videoCount: 14, exerciseCount: 17 });
  });

  it("conserve les 7 expériences Projector restantes et les formats interactifs canoniques", () => {
    const videoActivities = activities.flatMap((activity: any) =>
      (activity.blocks || []).filter((block: any) => block.type === "video").map((block: any) => ({ activity, block })),
    );
    const projectorVideos = videoActivities.filter(({ block }: any) => block.projectorSlides?.length);
    expect(activities).toHaveLength(31);
    expect(videoActivities).toHaveLength(14);
    expect(projectorVideos).toHaveLength(7);
    expect(projectorVideos.map(({ activity }: any) => activity.id)).toEqual(projectorActivityIds);
    expect(projectorVideos.every(({ block }: any) =>
      block.mp4Url && block.slidesPdf && block.hlsUrl && block.projectorTimings?.length && block.transcriptSegments?.length && block.sourceType !== "video",
    )).toBe(true);
    expect(blocks.filter((block: any) => block.type === "bucket_sort")).toHaveLength(4);
    expect(blocks.filter((block: any) => block.type === "single_choice_exercise" || block.type === "multi_choice_exercise")).toHaveLength(13);
    expect(activities.filter((activity: any) => activity.sourceActivityType === "VisualExercise")).toHaveLength(7);
    expect(activities.filter((activity: any) => activity.requiredBeforeAdvance)).toHaveLength(24);
    expect(activities.filter((activity: any) => activity.requiredBeforeAdvance).every((activity: any) =>
      activity.blocks.some((block: any) => ["video", "single_choice_exercise", "multi_choice_exercise", "bucket_sort"].includes(block.type)),
    )).toBe(true);
    expect(blocks.filter((block: any) => ["cloud_exercise", "code_repl", "ai_evaluation", "free_text_exercise", "terminal_sim"].includes(block.type))).toHaveLength(0);
  });

  it("publie les 7 MP4 4K audités comme vidéos hébergées, sans données Projector concurrentes", () => {
    expect(hostedMp4s.size).toBe(7);

    for (const [activityId, expectedDurationSeconds] of hostedMp4s) {
      const activity = activities.find((entry: any) => entry.id === activityId);
      const videos = activity?.blocks.filter((block: any) => block.type === "video") || [];
      expect(videos, activityId).toHaveLength(1);

      const video = videos[0];
      expect(video).toMatchObject({
        sourceType: "video",
        sourceUrl: expect.stringMatching(/^\/api\/assets\/.+\.mp4$/),
        mp4Url: expect.stringMatching(/^\/api\/assets\/.+\.mp4$/),
      });
      expect(video.sourceUrl, `${activityId} must use its managed MP4 as the source`).toBe(video.mp4Url);
      expect(video.durationSeconds).toBeCloseTo(expectedDurationSeconds, 5);
      expect(video.transcriptSegments?.length).toBeGreaterThan(0);

      // Ces champs feraient reprendre le lecteur Projector/HLS au lieu du MP4
      // sourceType=video ; les supports transcript/PDF restent, eux, accessibles.
      for (const incompatibleMediaField of ["hlsUrl", "projectorSlides", "projectorTimings", "projectorTimingUnit", "projectorDuration"]) {
        expect(video, `${activityId} must not retain ${incompatibleMediaField}`).not.toHaveProperty(incompatibleMediaField);
      }
    }
  });

  it("ne publie aucun lien source DataCamp ni chemin de stockage direct", () => {
    const serialized = JSON.stringify(course);
    expect(serialized).not.toMatch(/https?:\/\/(?:assets|videos|projector|campus)\.datacamp\.com/i);
    expect(serialized).not.toContain("/manus-storage/");
  });
});
