import catalog from "../client/src/data/trainingIndex.json";
import course from "../client/public/data/courses/building_ai_agents_with_haystack__01.json";
import { describe, expect, it } from "vitest";

const courseId = "building_ai_agents_with_haystack__01";
const interactiveBlockTypes = new Set([
  "exercise",
  "single_choice_exercise",
  "multi_choice_exercise",
  "multi_choice",
  "matching",
  "bucket_sort",
  "fill_blank",
  "code_repl",
  "terminal_sim",
  "ai_evaluation",
  "ordering",
  "cloud_exercise",
  "resource_review",
]);
const practicalBlockTypes = new Set([
  "cloud_exercise",
  "code_repl",
  "ai_evaluation",
  "terminal_sim",
]);
const hasText = (value: unknown) =>
  typeof value === "string" && value.trim().length > 0;
const isLocalAsset = (value: unknown) =>
  typeof value === "string" && value.startsWith("/api/assets/");

function derivedMetrics(activities: any[], blocks: any[]) {
  const downloadableUrls = new Set<string>();
  let downloadsWithoutUrl = 0;

  for (const block of blocks) {
    const urls = [
      block.url,
      block.downloadUrl,
      block.fileUrl,
      block.slidesPdf,
      ...(Array.isArray(block.resources)
        ? block.resources.map((resource: any) => resource?.url)
        : []),
      ...(Array.isArray(block.downloads)
        ? block.downloads.map((download: any) => download?.url || download)
        : []),
    ].filter(
      (url): url is string => typeof url === "string" && url.trim().length > 0
    );
    urls.forEach(url => downloadableUrls.add(url));
    if (
      (block.type === "download" || block.type === "file_download") &&
      urls.length === 0
    )
      downloadsWithoutUrl += 1;
  }

  return {
    lessonCount: course.lessons.length,
    chapterCount: activities.length,
    totalActivities: activities.length,
    exerciseCount: blocks.filter((block: any) =>
      interactiveBlockTypes.has(block.type)
    ).length,
    videoCount: blocks.filter((block: any) => block.type === "video").length,
    downloadCount: downloadableUrls.size + downloadsWithoutUrl,
  };
}

describe("Cours : Créer des agents d’IA avec Haystack", () => {
  const activities = course.lessons.flatMap(
    (lesson: any) => lesson.chapters || []
  );
  const blocks = activities.flatMap((activity: any) => activity.blocks || []);

  it("synchronise le catalogue avec les métriques dérivées du JSON livré", () => {
    const metrics = derivedMetrics(activities, blocks);
    const courseIndex = catalog.courses.find(
      (entry: any) => entry.id === courseId
    );

    expect(courseIndex).toMatchObject({ id: courseId, ...metrics });
    const certification = catalog.certifications.find(
      (entry: any) => entry.id === courseIndex?.certId
    );
    expect(certification).toMatchObject({
      totalLessons: metrics.lessonCount,
      totalActivities: metrics.totalActivities,
      totalVideos: metrics.videoCount,
      totalExercises: metrics.exerciseCount,
      totalDownloads: metrics.downloadCount,
    });
  });

  it("conserve chaque média vidéo importé sous une forme locale exploitable", () => {
    const videos = blocks.filter((block: any) => block.type === "video");
    const expectedVideoCount =
      course.datacampImport?.expected?.videos_extracted;

    expect(expectedVideoCount).toBeGreaterThan(0);
    expect(videos).toHaveLength(expectedVideoCount);
    expect(new Set(videos.map((video: any) => video.id)).size).toBe(
      videos.length
    );
    expect(
      videos.every(
        (video: any) =>
          video.projectorSlides?.length > 0 &&
          (hasText(video.audioUrl) || hasText(video.mp4Url)) &&
          video.projectorTimings?.length > 0 &&
          video.transcriptSegments?.length > 0
      )
    ).toBe(true);
    const mediaPaths = videos.flatMap((video: any) =>
      [
        video.audioUrl,
        video.mp4Url,
        video.slidesPdf,
        video.subtitleUrlFr,
        video.subtitleUrlEn,
      ].filter(Boolean)
    );
    expect(mediaPaths).not.toHaveLength(0);
    expect(mediaPaths.every(isLocalAsset)).toBe(true);
  });

  it("ne rend obligatoire aucune pratique sans correction locale et vérifiable", () => {
    const requiredPracticalBlocks = activities
      .filter((activity: any) => activity.requiredBeforeAdvance)
      .flatMap((activity: any) =>
        (activity.blocks || []).filter((block: any) =>
          practicalBlockTypes.has(block.type)
        )
      );

    expect(
      requiredPracticalBlocks.every(
        (block: any) =>
          Array.isArray(block.rubricCriteria) &&
          block.rubricCriteria.length > 0 &&
          hasText(block.evaluationPrompt) &&
          !/https?:\/\/|\/manus-storage\//i.test(JSON.stringify(block))
      )
    ).toBe(true);
  });

  it("n’expose ni DataLab ni XP, ni URL fournisseur ou stockage direct aux apprenants", () => {
    // `xp` est une métadonnée legacy non rendue : on contrôle la charge utile apprenant,
    // à laquelle le lecteur de leçon accède, plutôt que de confondre stockage et exposition.
    const learnerFacingActivities = activities.map((activity: any) => ({
      ...activity,
      blocks: (activity.blocks || []).map(
        ({ xp: _xp, ...block }: any) => block
      ),
    }));
    const learnerFacingContent = JSON.stringify(learnerFacingActivities);

    expect(learnerFacingContent).not.toMatch(/datalab|\bXP\b/i);
    expect(learnerFacingContent).not.toMatch(
      /https?:\/\/(?:assets|videos|projector|campus)\.datacamp\.com/i
    );
    expect(learnerFacingContent).not.toContain("/manus-storage/");
  });
});
