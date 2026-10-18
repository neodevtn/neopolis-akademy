import course from "../client/public/data/courses/building_ai_agents_with_crewai__01.json";
import { describe, expect, it } from "vitest";

const localAsset = (value: unknown) =>
  typeof value === "string" && value.startsWith("/api/assets/");

describe("cours DataCamp Créer des agents d’IA avec CrewAI", () => {
  const activities = course.lessons.flatMap((lesson: any) => lesson.chapters || []);
  const blocks = activities.flatMap((activity: any) => activity.blocks || []);
  const videos = blocks.filter((block: any) => block.type === "video");
  const conceptualCases = activities.filter(
    (activity: any) => activity.sourceActivityType === "ConceptualCase"
  );

  it("restaure les sept écrans source dans leur ordre, dont cinq cas conceptuels", () => {
    expect(activities.map((activity: any) => activity.id)).toEqual([
      "dc_ch01_act01",
      "dc_ch01_act02",
      "dc_ch01_act03",
      "dc_ch02_act01",
      "dc_ch02_act02",
      "dc_ch02_act03",
      "dc_ch02_act04",
    ]);
    expect(activities.map((activity: any) => activity.sourceActivityType)).toEqual([
      "VideoExercise",
      "ConceptualCase",
      "ConceptualCase",
      "ConceptualCase",
      "ConceptualCase",
      "ConceptualCase",
      "VideoExercise",
    ]);
    expect(activities.map((activity: any) => activity.requiredBeforeAdvance)).toEqual([
      true,
      true,
      true,
      true,
      true,
      true,
      true,
    ]);
    expect(conceptualCases.map((activity: any) => activity.id)).toEqual([
      "dc_ch01_act02",
      "dc_ch01_act03",
      "dc_ch02_act01",
      "dc_ch02_act02",
      "dc_ch02_act03",
    ]);
    expect(
      conceptualCases.map((activity: any) => activity.remediation)
    ).toEqual([
      {
        action: "conceptual_case_replaces_unavailable_lab",
        source_activity_preserved: "dc_ch01_act02",
        requires_external_environment: false,
      },
      {
        action: "conceptual_case_replaces_unavailable_lab",
        source_activity_preserved: "dc_ch01_act03",
        requires_external_environment: false,
      },
      {
        action: "conceptual_case_replaces_unavailable_lab",
        source_activity_preserved: "dc_ch02_act01",
        requires_external_environment: false,
      },
      {
        action: "conceptual_case_replaces_unavailable_lab",
        source_activity_preserved: "dc_ch02_act02",
        requires_external_environment: false,
      },
      {
        action: "conceptual_case_replaces_unavailable_lab",
        source_activity_preserved: "dc_ch02_act03",
        requires_external_environment: false,
      },
    ]);
  });

  it("conserve exactement les deux vidéos Projector locales avec leurs alternatives françaises", () => {
    expect(
      videos.map((video: any) => ({
        id: video.id,
        slideCount: video.projectorSlides?.length,
        timingCount: video.projectorTimings?.length,
        mp4Url: video.mp4Url,
        hlsUrl: video.hlsUrl,
        audioUrl: video.audioUrl,
        slidesPdf: video.slidesPdf,
      }))
    ).toEqual([
      {
        id: "dc_1_act_01_video",
        slideCount: 15,
        timingCount: 24,
        mp4Url: "/api/assets/ch01_ex01_bienvenue_dans_crewai_c2081558.mp4",
        hlsUrl: "/api/assets/ch01_ex01_bienvenue_dans_crewai_116a96d9.m3u8",
        audioUrl: undefined,
        slidesPdf: "/api/assets/chapter_01_slides_9a417cd7.pdf",
      },
      {
        id: "dc_2_act_04_video",
        slideCount: 16,
        timingCount: 20,
        mp4Url: "/api/assets/ch02_ex04_f_licitations_42fd1a70.mp4",
        hlsUrl: undefined,
        audioUrl: "/api/assets/ch02_ex04_f_licitations_98a5edb6.mp3",
        slidesPdf: "/api/assets/chapter_02_slides_923c9ce6.pdf",
      },
    ]);
    expect(
      videos.flatMap((video: any) => [
        video.mp4Url,
        video.hlsUrl,
        video.audioUrl,
        video.slidesPdf,
      ]).filter(Boolean).every(localAsset)
    ).toBe(true);
    expect(videos.map((video: any) => video.alternativeTextFr.includes("agent"))).toEqual([
      true,
      true,
    ]);
  });
});
