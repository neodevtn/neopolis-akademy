import catalog from "../client/src/data/trainingIndex.json";
import course from "../client/public/data/courses/building_agentic_workflows_with_llamaindex__01.json";
import { describe, expect, it } from "vitest";

const courseId = "building_agentic_workflows_with_llamaindex__01";
const localAsset = (value: unknown) =>
  typeof value === "string" && value.startsWith("/api/assets/");
const practicalBlockTypes = new Set([
  "cloud_exercise",
  "code_repl",
  "ai_evaluation",
  "terminal_sim",
]);

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
    ].filter((url): url is string => typeof url === "string" && url.trim().length > 0);
    urls.forEach(url => downloadableUrls.add(url));
    if ((block.type === "download" || block.type === "file_download") && urls.length === 0) {
      downloadsWithoutUrl += 1;
    }
  }

  return {
    lessonCount: course.lessons.length,
    chapterCount: activities.length,
    totalActivities: activities.length,
    exerciseCount: blocks.filter((block: any) => block.type === "single_choice_exercise").length,
    videoCount: blocks.filter((block: any) => block.type === "video").length,
    downloadCount: downloadableUrls.size + downloadsWithoutUrl,
  };
}

describe("Cours : Créer des workflows agentiques avec LlamaIndex", () => {
  const activities = course.lessons.flatMap((lesson: any) => lesson.chapters || []);
  const blocks = activities.flatMap((activity: any) => activity.blocks || []);
  const videos = blocks.filter((block: any) => block.type === "video");

  it("synchronise le catalogue avec les métriques réellement livrées", () => {
    const metrics = derivedMetrics(activities, blocks);
    const courseIndex = catalog.courses.find((entry: any) => entry.id === courseId);

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

  it("distingue les cinq vidéos source des trois médias réellement conservés", () => {
    expect(course.datacampImport.expected).toMatchObject({
      videos_expected_from_chapter_metadata: 5,
      videos_extracted: 5,
    });
    expect(course.datacampImport.delivered).toMatchObject({
      activities: 5,
      videos: 3,
      interactiveExercises: 5,
      excludedSourcePracticalActivities: 10,
    });
    expect(activities.map((activity: any) => activity.id)).toEqual([
      "dc_ch01_act01",
      "dc_ch01_act03",
      "dc_ch01_act05",
      "dc_ch02_act01",
      "dc_ch02_act08",
    ]);
    expect(videos.map((video: any) => video.id)).toEqual([
      "dc_1_act_03_video",
      "dc_1_act_05_video",
      "dc_2_act_01_video",
    ]);
  });

  it("conserve les trois médias Projector restants sous forme locale complète", () => {
    expect(
      videos.map((video: any) => ({
        id: video.id,
        slideCount: video.projectorSlides?.length,
        timingCount: video.projectorTimings?.length,
        segmentCount: video.transcriptSegments?.length,
        media: [video.mp4Url, video.audioUrl, video.subtitleUrlEn, video.slidesPdf],
      }))
    ).toEqual([
      {
        id: "dc_1_act_03_video",
        slideCount: 7,
        timingCount: 22,
        segmentCount: 7,
        media: [
          "/api/assets/ch01_ex03_qu_est_ce_qu_un_agent_206658b5.mp4",
          "/api/assets/ch01_ex03_qu_est_ce_qu_un_agent_42b11d6a.mp3",
          "/api/assets/ch01_ex03_qu_est_ce_qu_un_agent_en_bc68669a.vtt",
          "/api/assets/chapter_01_slides_4fa4f8dc.pdf",
        ],
      },
      {
        id: "dc_1_act_05_video",
        slideCount: 6,
        timingCount: 14,
        segmentCount: 6,
        media: [
          "/api/assets/ch01_ex05_les_agents_ont_ils_de_la_m_moire_2ce3301e.mp4",
          "/api/assets/ch01_ex05_les_agents_ont_ils_de_la_m_moire_2cd7b794.mp3",
          "/api/assets/ch01_ex05_les_agents_ont_ils_de_la_m_moire_en_97412395.vtt",
          "/api/assets/chapter_01_slides_4fa4f8dc.pdf",
        ],
      },
      {
        id: "dc_2_act_01_video",
        slideCount: 8,
        timingCount: 20,
        segmentCount: 8,
        media: [
          "/api/assets/ch02_ex01_qu_est_ce_qu_un_syst_me_multi_agents_50ff844c.mp4",
          "/api/assets/ch02_ex01_qu_est_ce_qu_un_syst_me_multi_agents_3c77f52e.mp3",
          "/api/assets/ch02_ex01_qu_est_ce_qu_un_syst_me_multi_agents_en_a394b3ef.vtt",
          "/api/assets/chapter_02_slides_aa0e31f2.pdf",
        ],
      },
    ]);
    expect(
      videos.flatMap((video: any) => [
        video.mp4Url,
        video.audioUrl,
        video.subtitleUrlEn,
        video.slidesPdf,
      ]).every(localAsset)
    ).toBe(true);
  });

  it("ne réintroduit aucun TP externe ou DataLab dans le parcours livré", () => {
    expect(blocks.filter((block: any) => practicalBlockTypes.has(block.type))).toEqual([]);
    expect(activities.map((activity: any) => activity.sourceActivityType)).toEqual([
      "VideoExercise",
      "VideoExercise",
      "VideoExercise",
      "VideoExercise",
      "VideoExercise",
    ]);
    const learnerPayload = JSON.stringify(activities);
    expect(learnerPayload).not.toMatch(/datalab|https?:\/\/(?:assets|videos|projector|campus)\.datacamp\.com|\/manus-storage\//i);
  });
});
